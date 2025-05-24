import { runSqlStatement } from "../services/databaseService.js";
import { queryMetadata } from './metadataModel.js';
import { injectPlaceholderColumn, calculateFirstPassFormula, calculateSecondPassFormula } from "../utils/sqlAst.js";
import { decryptToken } from "./decryptionModel.js";
import { parseSqlToAst, isSafeForEvaluation, asciiMapper } from "../utils/sqlAst.js";
import { globalState } from '../server.js';
import { MIN_STAKE_PERCENTAGE, MAX_STAKE_PERCENTAGE } from "../../public/utils/constants.js";

export async function checkQuery(query, activityNumber, taskNumber, stakePercentage) {

    // Validate stake percentage and calculate the corresponding stake amount
    if (stakePercentage < MIN_STAKE_PERCENTAGE || stakePercentage > MAX_STAKE_PERCENTAGE) {
        throw new Error(`Stake percentage should be between ${MIN_STAKE_PERCENTAGE}% and ${MAX_STAKE_PERCENTAGE}%.`);
    };
    const stakeAmount = Math.floor(globalState.score * stakePercentage / 100)

    const activities = await queryMetadata("activities");
    const task = activities[activityNumber].tasks[taskNumber - 1];

    query = asciiMapper.encode(query);
    const ast = parseSqlToAst(query).ast;

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
        data.scoreDelta = -stakeAmount;
    } else if (data.feedback.startsWith("<div class='correction'>")) {
        data.scoreDelta = task.reward + stakeAmount;
    } else {
        console.warn(`Feedback for token ${token} does not start with a hint or correction.`);
        data.scoreDelta = 0;
    };
    globalState.score += data.scoreDelta;
    data.score = globalState.score

    return JSON.stringify(data);
}

async function executeQueryWithFormula(passNumber, formula, queryTemplate) {
    let query = queryTemplate.replace('`SQLAB_COLUMN_PLACEHOLDER`', formula);
    query = asciiMapper.decode(query);
    try {
        const result = await runSqlStatement(query);
        if (result.length === 0) throw new Error("emptyResultError");
        return result;
    } catch (error) {
        throw new Error(`${passNumber}PassExecutionError`);
    }
};
