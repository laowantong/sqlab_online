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

/**
* Replaces all occurrences of the word "hash" in the formula with the actual table names
* from the FROM clause of the SQL query.
* @param {string} sql - The SQL query
* @param {string} formula - The formula containing the word "hash"
* @returns {string} - The formula with "hash" replaced by the actual table names
* @throws {Error} - Throws an error if the number of "hash" occurrences does not match the number of tables
*/
export function calculateFirstPassFormula(sql, formula) {
  const parseResult = parseSqlToAst(sql);
  const tablesOfFromClauses = getTablesOfFromClause(parseResult.ast);
  const hashMatches = formula.match(/(\w\.)?hash/g);
  if (hashMatches.length < tablesOfFromClauses.length) {
      throw new Error("tooManyTablesError");
  } 
  else if (hashMatches.length > tablesOfFromClauses.length) {
      throw new Error("tooFewTablesError");
  }
  return hashMatches.reduce((result, match, i) => 
      result.replace(match, tablesOfFromClauses[i] + '.hash'), formula);
}

/**
 * Replaces the placeholder '(0)' in the formula with a given value.
 * @param {string} firstPassFormula - The formula after the first pass
 * @param {string} tweakValue - The value to replace the placeholder with
 * @return {string} - The formula with the placeholder replaced
 */
export function calculateSecondPassFormula(firstPassFormula, tweakValue) {
  return firstPassFormula.replace('(0)', `${tweakValue}`);
}

