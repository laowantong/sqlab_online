import { runSqlStatement } from "../services/databaseService.js";
import { queryMetadata } from './metadataModel.js';
import {
    injectPlaceholderColumn,
    calculateFirstPassFormula,
    calculateSecondPassFormula,
    parseSqlToAst,
    isSafeForEvaluation,
    asciiMapper,
} from "../utils/sqlAst.js";
import { decryptToken } from "./decryptionModel.js";
import { userData } from '../server.js';
import { MIN_STAKE_PERCENTAGE, MAX_STAKE_PERCENTAGE } from "../../public/utils/constants.js";

export async function checkQuery(query, activityNumber, taskNumber, stakePercentage) {
    let response;

    /**
     * CHEAT ZONE.
     * The user has composed an ad-hoc url in the (vain) hope to game the system.
     */

    // Guard against activity/tasks already validated.
    const taskId = `${activityNumber}/${taskNumber}`;
    if (userData.validatedTasks.includes(taskId)) {
        return createErrorResponse("alreadyValidatedTask", "suspicious");
    }

    // Guard against stake percentage outside the permitted interval.
    if (stakePercentage < MIN_STAKE_PERCENTAGE || stakePercentage > MAX_STAKE_PERCENTAGE) {
        return createErrorResponse("stakePercentageError", "suspicious");
    }

    // Guard against non previously executed queries which are unparsable.
    // NB. The check slider/button only appears after the query has been successfully executed.
    // Therefore, in normal usage, parsing it to SQL cannot fail.
    query = asciiMapper.encode(query); // work around parser's Unicode related bugs
    response = parseSqlToAst(query);
    if (!response.success) {
        return createErrorResponse("unparsableUserQuery", "suspicious");
    }
    const ast = response.ast;
    
    /**
     * OTHER GUARDS.
     */

    // Guard against tasks which miss a formula.
    // This should not happen with SQLab generated databases.
    const activities = await queryMetadata("activities");
    const task = activities[activityNumber].tasks[taskNumber - 1];
    if (!task.formula) {
        return createErrorResponse("missingFormula", "internal");
    }

    // When at least one expected column is not in the user query's columns,
    // the tweak formula may fail (most use a column name to construct the expression).
    // Calculate the list of missing columns and require the user to complete their
    // SELECT clause with them.
    const actualColumns = ast.columns.map(col => asciiMapper.decode(col.as || col.expr.column));
    const missingColumns = task.columns.filter(expectedCol => {
        return !actualColumns.includes(expectedCol);
    });
    if (missingColumns.length > 0) {
        return createErrorResponse("missingColumns", "minor", {
            missingColumns: missingColumns.join(', ')
        });
    }

    // Calculate the first pass formula
    response = calculateFirstPassFormula(ast, task.formula);
    if (!response.success) {
        return createErrorResponse("tooFewTables", "minor", {
            missingTablesCount: response.missingTablesCount
        });
    }
    let formula = response.formula;

    // Calculate the query template (with a column SQLAB_COLUMN_PLACEHOLDER)
    response = injectPlaceholderColumn(ast);
    if (!response.success) {
        return createErrorResponse(response.errorSlug, "minor");
    }
    const queryTemplate = response.result;

    // Now we can execute the query modified with the first pass formula.
    response = await executeQueryWithFormula("first", formula, queryTemplate);
    if (!response.success) {
        return createErrorResponse(response.errorSlug, "internal");
    }
    let result = response.result;

    // The token column of the result set is not necessarily final.
    // Some formulas require injecting a value retrieved from the result set
    // and/or the code of the SQL query.
    const tweakExpression = task.tweak_javascript;
    if (tweakExpression) {

        // Guard against unsafe tweak expressions.
        // This may happen with an ill-conceived or malicious SQLab database.
        if (!isSafeForEvaluation(tweakExpression)) {
            return createErrorResponse('unsafeTweakError', "internal", {
                tweakExpression: tweakExpression
            });
        }

        // Create a new function with only the allowed parameters in scope
        const func = new Function('result', 'query', `return (${tweakExpression});`);

        // Guard against errors thrown during evaluation of a tweak expression.
        let tweakValue;
        try {
            tweakValue = func(result, query);
        } catch (error) {
            return createErrorResponse('tweakEvaluationError', "internal", {
                tweakExpression: tweakExpression
            });
        }

        // Guard against formulas having more or less than one '(0)' placeholder
        response = calculateSecondPassFormula(formula, tweakValue);
        if (!response.success) {
            return createErrorResponse('badPlaceholderCount', "internal", {
                placeholderCount: response.placeholderCount
            });
        }
        formula = response.formula;

        // Now we can execute the query modified with the second pass formula.
        response = await executeQueryWithFormula("second", formula, queryTemplate);
        if (!response.success) {
            return createErrorResponse(response.errorSlug, "internal");
        }
        result = response.result;
    }

    // Guard against missing token column or zero token.
    const token = result[0].token;
    if (!token) {
        return createErrorResponse('noToken', "internal");
    }

    // Guard against decryption runtime error
    let feedbackJsonText;
    try {
        feedbackJsonText = await decryptToken(token);
    } catch (error) {
        return createErrorResponse(error.message, "internal");
    }

    // Guard against missing feedback message.
    // This should not happen with SQLab generated databases.
    if (!feedbackJsonText) {
        return createErrorResponse('emptyFeedback', "internal");
    }

    // Guard against malformed JSON.
    // This should not happen with SQLab generated databases.
    let feedbackData;
    try {
        feedbackData = JSON.parse(feedbackJsonText);
    } catch (error) {
        return createErrorResponse('unparsableJson', "internal");
    }

    const stakeAmount = Math.floor(userData.score * stakePercentage / 100);
    const feedbackMessage = feedbackData.feedback;
    const feedbackCategory = feedbackData.category;
    
    // The query is associated with a feedback!
    // Determine score delta and CSS class based on feedback message type
    let scoreDelta;
    if (feedbackCategory === 'specific hint') {
        scoreDelta = -stakeAmount;
    } else if (feedbackCategory === 'default hint') {
        scoreDelta = -stakeAmount;
    } else if (feedbackCategory === 'correction') {
        scoreDelta = task.reward + stakeAmount;
        userData.validatedTasks.push(taskId);
    } else {
        return createErrorResponse('unknownFeedbackCategory', "internal", { feedbackCategory });
    }
    userData.score += scoreDelta;

    return {
        success: true,
        scoreDelta,
        newScore: userData.score,
        cssClass: feedbackCategory,
        feedbackMessage,
        task: feedbackData.task,
    };
}

/**
 * Helper function to create consistent error responses
 */
function createErrorResponse(errorSlug, cssClass, additionalData = {}) {
    return {
        success: false,
        scoreDelta: 0,
        newScore: userData.score,
        cssClass: `${cssClass} error`,
        errorSlug,
        ...additionalData,
    };
}

async function executeQueryWithFormula(passNumber, formula, queryTemplate) {
    let query = queryTemplate.replace('`SQLAB_COLUMN_PLACEHOLDER`', formula);
    query = asciiMapper.decode(query);

    let result;
    try {
        result = await runSqlStatement(query);
    } catch (error) {
        return {
            success: false,
            errorSlug: `${passNumber}PassExecutionError`
        };
    }
    
    if (result.length === 0) {
        return {
            success: false,
            errorSlug: "emptyResultSet"
        };
    }

    return {
        success: true,
        result
    };
}
