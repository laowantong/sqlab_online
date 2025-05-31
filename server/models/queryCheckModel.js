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
    let resultData = {
        success: false,
        message: null,
        score: userData.score,
        scoreDelta: 0
    };

    // TODO: Extract other simple validations from try/catch
    // - if (stakePercentage < MIN_STAKE_PERCENTAGE || stakePercentage > MAX_STAKE_PERCENTAGE) -> return JSON.stringify(resultData); 
    // - if (!task.formula) → return 
    // - if (!isSafeForEvaluation()) → return 
    // - if (!token) → return 
    // Keep in try/catch only risky operations (DB, parsing, etc.)
    try {
        // Validate stake percentage and calculate the corresponding stake amount
        if (stakePercentage < MIN_STAKE_PERCENTAGE || stakePercentage > MAX_STAKE_PERCENTAGE) {
            throw new Error("stakePercentageError");
        };
        const stakeAmount = Math.floor(userData.score * stakePercentage / 100)

        const activities = await queryMetadata("activities");
        const task = activities[activityNumber].tasks[taskNumber - 1];

        query = asciiMapper.encode(query);
        const ast = parseSqlToAst(query).ast;

        const userCols = ast.columns.map(col => asciiMapper.decode(col.as || col.expr.column));
        const expectedSet = new Set(task.columns);
        const userSet = new Set(userCols);
        const columnsMatch = expectedSet.size === userSet.size && [...expectedSet].every(col => userSet.has(col));

        if (!columnsMatch) {
            console.log(`User columns: ${userCols}, Expected columns: ${task.columns}`);
            resultData.message = "wrongColumnsError";
            return JSON.stringify(resultData);
        }

        if (!task.formula) throw new Error("noFormulaError");
        let formula = calculateFirstPassFormula(ast, task.formula);

        const queryTemplateData = await injectPlaceholderColumn(ast);
        const queryTemplate = queryTemplateData.result;
        let result = await executeQueryWithFormula("first", formula, queryTemplate);

        const tweakExpression = task.tweak_javascript;
        if (tweakExpression) {
            if (!isSafeForEvaluation(tweakExpression)) throw new Error("unsafeTweakError");

            let tweakValue;
            try {
                // Create a new function with only the allowed parameters in scope
                const func = new Function('result', 'query', `return (${tweakExpression});`);
                tweakValue = func(result, query);
            } catch (error) {
                console.error(`tweakEvaluationError: ${error.message}`);
                console.error(`query: ${query}`);
                console.error(`tweakExpression: ${tweakExpression}\n`);
                throw new Error("tweakEvaluationError");
            }

            formula = calculateSecondPassFormula(formula, tweakValue);
            result = await executeQueryWithFormula("second", formula, queryTemplate);
        };

        const token = result[0].token;
        if (!token) throw new Error("noTokenError");
        const message = await decryptToken(token);
        const data = JSON.parse(message);

        if (data.feedback.startsWith("<div class='hint'>")) {
            resultData.scoreDelta = -stakeAmount;
        } else if (data.feedback.startsWith("<div class='unknown-token'>")) {
            resultData.scoreDelta = -stakeAmount;
        } else if (data.feedback.startsWith("<div class='correction'>")) {
            resultData.scoreDelta = task.reward + stakeAmount;
        } else {
            console.warn(`Malformed feedback for token ${token}.`);
            console.warn(`Feedback: ${data.feedback}\n`);
            resultData.scoreDelta = -stakeAmount;
        };
        userData.score += resultData.scoreDelta;
        resultData.score = userData.score;
        resultData.success = true;
        resultData.feedback = data.feedback;
        resultData.task = data.task;
    } catch (error) {
        resultData.message = error.message;
    }

    return JSON.stringify(resultData);
}

async function executeQueryWithFormula(passNumber, formula, queryTemplate) {
    let query = queryTemplate.replace('`SQLAB_COLUMN_PLACEHOLDER`', formula);
    query = asciiMapper.decode(query);
    try {
        const result = await runSqlStatement(query);
        if (result.length === 0) throw new Error("emptyResultError");
        return result;
    } catch (error) {
        console.error(`Error executing ${passNumber} pass query:`, error);
        console.error(`Query: ${query}\n`);
        throw new Error(`${passNumber}PassExecutionError`);
    }
};
