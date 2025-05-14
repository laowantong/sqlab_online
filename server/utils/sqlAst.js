// Import the node-sql-parser library
import pkg from 'node-sql-parser';
const { Parser } = pkg;

// Create a parser instance
const parser = new Parser();

/**
 * Add a given column expression to the final statement of a SQL text if and only if
 * this statement is a SELECT.
 * @param {string} sqlText - The SQL text to parse
 * @param {string} columnExpression - The expression to add as a new column
 * @returns {object} - The response status and, if successful, the modified SQL text
 */
export function addColumnToFinalStatement(sqlText, columnExpression) {
  // Calculate the AST of the SQL text
  let ast;
  try {
    ast = parser.astify(sqlText, { parseOptions: { includeLocations: true } });
  } catch (e) {
    return { response: "ParseError" };
  }
  
  let final = ast;
  if (Array.isArray(ast)) {
    if (ast.length === 0) return { response: "EmptyAst" };
    // The SQL text consists of multiple statements
    // We only care about the last one
    final = ast[ast.length - 1];
  };

  // Check if the last statement is a SELECT
  if (final.type !== 'select') return { response: "nonSelectFinalStatement" };

  // Perform the insertion
  final.columns.push({
    expr: {
      type: 'column_ref',
      table: null,
      column: 'SQLAB_PLACEHOLDER'
    }
  });
  const result = parser.sqlify(ast).replace('`SQLAB_PLACEHOLDER`', columnExpression);
  return {
    response: "ok",
    result: result
  };
}

/**
 * Extracts table names or aliases referenced in the FROM clause of a SQL query.
 * @param {Object} ast - The AST of the SQL query, guaranteed to be a single SELECT query.
 * @returns {Array<string>} Array of table names or aliases
 */
function getTablesOfFromClause(ast) {
  if (!Array.isArray(ast.from)) {
    // Most dialects of SQL allow SELECT queries without a FROM clause, e.g., SELECT 1
    return [];
  }
  return ast.from.map(src => src.as || src.table);
}
