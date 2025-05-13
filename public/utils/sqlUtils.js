// sqlUtils.js

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js (for tests)
    module.exports = factory(require('node-sql-parser'));
  } else {
    // Browser (UMD)
    root.addColumnToSelects   = factory(root.NodeSQLParser).addColumnToSelects;
    root.extractTableAliases = factory(root.NodeSQLParser).extractTableAliases;
  }
})(typeof self !== 'undefined' ? self : this, function (NodeSQLParser) {
  const Parser = NodeSQLParser.Parser;
  const parser = new Parser();

  function splitStatements(sqlText) {
    return sqlText
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  function addColumnToSelects(sqlText, colName = 'added_column') {
    const stmts = splitStatements(sqlText);
    const out = [];
  
    stmts.forEach(stmt => {
      let ast;
      try {
        ast = parser.astify(stmt, { parseOptions: { includeLocations: true } });
      } catch (e) {
        // Return the original if parsing fails
        out.push(stmt + ';');
        return;
      }
      
      if (Array.isArray(ast)) ast = ast[0];
      if (ast.type !== 'select' || !Array.isArray(ast.columns) || ast.columns.length === 0) {
        out.push(stmt + ';');
        return;
      }
      
      const lastCol = ast.columns[ast.columns.length - 1];
      const loc = lastCol?.loc ?? lastCol.expr?.loc;
      const insertOffset = loc.end.offset;

      // const insertOffset = lastCol.loc?.end?.offset ?? lastCol.expr?.loc?.end?.offset;
      
      const before = stmt.slice(0, insertOffset);
      const after = stmt.slice(insertOffset);
      const insertText = ', ' + colName;
  
      out.push(before + insertText + after + ';');
    });
  
    return out.join('\n');
  }

  function extractTableAliases(sqlText) {
    const stmts = splitStatements(sqlText);
    const tables = [];
    stmts.forEach(stmt => {
      let ast = parser.astify(stmt);
      if (Array.isArray(ast)) ast = ast[0];
      if (ast.type === 'select' && Array.isArray(ast.from)) {
        ast.from.forEach(src => {
          if (src.table) {
            tables.push(src.as || src.table);
          }
        });
      }
    });
    return tables;
  }

  return {
    addColumnToSelects,
    extractTableAliases
  };
});