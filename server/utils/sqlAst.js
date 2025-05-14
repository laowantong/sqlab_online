// Import the node-sql-parser library
import pkg from 'node-sql-parser';
const { Parser } = pkg;

// Create a parser instance
const parser = new Parser();

/**
 * Parse SQL text into an Abstract Syntax Tree (AST)
 * @param {string} sql - The SQL text to parse
 * @returns {object} - The response status and, if successful, the AST
 */
export function parseSqlToAst(sql) {
  try {
    return { 
      response: "ok", 
      ast: parser.astify(sql)
    };
  } catch (e) {
    return { response: "ParseError" };
  }
}

/**
 * Append a placeholder as the last column of the final statement of a SQL AST
 * if and only if this statement is a SELECT. Note that the placeholder string
 * will be delimited by backticks.
 * @param {object|array} ast - The SQL AST to modify
 * @returns {object} - The response status and, if successful, the modified SQL text
 */
export function injectPlaceholderColumn(ast) {
  let final = ast;
  if (Array.isArray(ast)) {
    if (ast.length === 0) return { response: "EmptyAst" };
    // The SQL text consists of multiple statements
    // We only care about the last one
    final = ast[ast.length - 1];
  };

  // Check if the final statement is a SELECT
  if (final.type !== 'select') return { response: "nonSelectFinalStatement" };

  // Perform the insertion
  final.columns.push({
    expr: {
      type: 'column_ref',
      table: null,
      column: 'SQLAB_COLUMN_PLACEHOLDER'
    }
  });
  
  return {
    response: "ok",
    result: parser.sqlify(ast)
  };
}

/**
 * Extracts table names or aliases referenced in the FROM clause of a SQL query.
 * @param {Object} ast - The AST of the SQL query, guaranteed to be a single SELECT query.
 * @returns {Array<string>} Array of table names or aliases
 */
export function getTablesOfFromClause(ast) {
  if (!Array.isArray(ast.from)) {
    // Most dialects of SQL allow SELECT queries without a FROM clause, e.g., SELECT 1
    return [];
  }
  return ast.from.map(src => src.as || src.table);
}

// TODO: implement the following process
// - The user requests a check: he sends:
//   {
//     sql: 'SELECT * FROM users',
//     activity_number: 1,
//     task_number: 42,
//   }
// - const formula = the token formula from the activity and task number. If it fails, respond with "unknownTaskError".
// - const formulaTableCount = the number of \b\W\.hash\b in the formula.
// - const ast = parser.astify(sql). If it fails, respond with "ParseError". This should never occur since the check button is inactive if the input area is dirty or the last execution failed. It may be a failure from the library node-sql-parser or an attempt to inject SQL code.
// - const tablesOfFromClauses = getTablesOfFromClause(ast);
// - If queryTableCount > tablesOfFromClauses.length(), respond with "tooManyTablesError".
// - If queryTableCount < tablesOfFromClauses.length(), respond with "tooFewTablesError".
// - const firstPassFormula = copy of formula with \b\W\.hash\b replaced by the actual table names.
// - const queryWithPlaceholder = injectPlaceholderColumn(ast).result;
// - const firstPassQuery = queryWithPlaceholder.replace('`SQLAB_COLUMN_PLACEHOLDER`', firstPassFormula).
// - let resultSet = executeQuery(firstPassQuery).result; If it fails, respond with "firstPassExecutionError". If it returns an empty result set, respond with "emptyResultError".
// - If the formula comes with a tweak {
//   - const tweakValue = retrieved from firstPassResult
//   - const secondPassFormula = firstPassFormula.replace('(0)', `(${tweakValue})`)
//   - const secondPassQuery = queryWithPlaceholder.replace('`SQLAB_COLUMN_PLACEHOLDER`', secondPassFormula).
//   - resultSet = executeQuery(secondPassQuery).result; If it fails, respond with "secondPassExecutionError".
//  }
// - const token = resultSet[0].token. If it fails, respond with "noTokenError".
// - const secretMessage = executeQuery(`SELECT decrypt('${token}')`).result.
// - Respond with the secret message.