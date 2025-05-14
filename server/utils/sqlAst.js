/**
 * Add a given column expression to the final statement of a SQL text if and only if
 * this statement is a SELECT.
 * @param {string} sqlText - The SQL text to parse
 * @param {string} columnExpression - The expression to add as a new column
 * @returns {string} The modified SQL text with the new column added
 */
export function addColumnToFinalStatement(sqlText, columnExpression = 'added_column') {

  // Calculate the AST of the SQL text
  let ast;
  try {
    ast = parser.astify(sqlText, { parseOptions: { includeLocations: true } });
  } catch (e) {
    return { response: "ParseError"}
  }

  // Ensure that all the preconditions are met
  if (!Array.isArray(ast)) return { response: "NotAnArray"};
  const final = ast[ast.length - 1];
  if (final.type !== 'select') return { response: "nonSelectFinalStatement"};
  const columns = final.columns;
  if (!Array.isArray(columns)) return { response: "nonArrayColumns"};
  if (columns.length === 0) return { response: "NoColumns"};
  
  // Perform the insertion
  const lastColumn = columns[columns.length - 1];
  const loc = lastColumn?.loc ?? lastColumn.expr?.loc;
  const i = loc.end.offset;
  const result = sqlText.slice(0, i) + ',' + columnExpression + sqlText.slice(i);
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


// All the remaining functions are private and not exported

/**
 * Splits SQL text into individual statements, trimming whitespace and filtering out empty statements.
 * @param {string} sqlText - The SQL text to split
 * @returns {Array<string>} Array of trimmed SQL statements
 */
function splitStatements(sqlText) {
  return sqlText
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

