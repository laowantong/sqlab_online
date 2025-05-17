import { expect } from 'chai';
import {
  parseSqlToAst,
  injectPlaceholderColumn,
  getTablesOfFromClause,
  calculateFirstPassFormula,
  calculateSecondPassFormula,
  isSafeForEvaluation,
} from '../server/utils/sqlAst.js';

// Helper function to remove all backticks, mostly added by sqlify
function r(string) {
  return string.replace(/`/g, '');
}

// Helper function to parse SQL and inject placeholder in two steps
function testInjectPlaceholder(sql) {
  const parseResult = parseSqlToAst(sql);
  if (parseResult.response !== "ok") {
    return parseResult;
  }
  return injectPlaceholderColumn(parseResult.ast);
}

describe('parseSqlToAst', () => {
  it('should parse valid SQL into AST', () => {
    const sql = 'SELECT id, name FROM users';
    const result = parseSqlToAst(sql);
    expect(result.response).to.equal('ok');
    expect(result.ast).to.be.an('object');
  });

  it('should handle multiple SQL statements', () => {
    const sql = 'INSERT INTO logs VALUES (1,"test"); SELECT id FROM users';
    const result = parseSqlToAst(sql);
    expect(result.response).to.equal('ok');
    expect(result.ast).to.be.an('array');
    expect(result.ast.length).to.equal(2);
  });

  it('should return error for invalid SQL', () => {
    const sql = 'SELECT FROM WHERE;';
    const result = parseSqlToAst(sql);
    expect(result.response).to.equal('ParseError');
  });
});

describe('injectPlaceholderColumn', () => {
  it('should add a column to a parsed SELECT statement', () => {
    const sql = 'SELECT id, name FROM users';
    const parseResult = parseSqlToAst(sql);
    const result = injectPlaceholderColumn(parseResult.ast);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id, name, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should return error for an empty AST', () => {
    const result = injectPlaceholderColumn([]);
    expect(result.response).to.equal('EmptyAst');
  });

  it('should return error when final statement is not SELECT', () => {
    const sql = 'UPDATE users SET active = 1';
    const parseResult = parseSqlToAst(sql);
    const result = injectPlaceholderColumn(parseResult.ast);
    expect(result.response).to.equal('nonSelectFinalStatement');
  });
});

describe('parseSqlToAst + injectPlaceHolderColumn', () => {
  it('should add a column to a simple SELECT statement', () => {
    const sql = 'SELECT id, name FROM users';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id, name, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should add a column to the final SELECT in multiple statements', () => {
    const sql = 'INSERT INTO logs VALUES (1,"test") ; SELECT id, name FROM users';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('INSERT INTO logs VALUES (1,"test") ; SELECT id, name, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should handle complex SELECT statements', () => {
    const sql = 'SELECT u.id, u.name FROM users AS u INNER JOIN orders AS o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name ASC LIMIT 10';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT u.id, u.name, SQLAB_COLUMN_PLACEHOLDER FROM users AS u INNER JOIN orders AS o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name ASC LIMIT 10');
  });

  it('should handle subqueries in SELECT statements', () => {
    const sql = 'SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count FROM users';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should handle SELECT with aliased columns', () => {
    const sql = 'SELECT id AS user_id, name AS user_name FROM users';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id AS user_id, name AS user_name, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should return error for an empty AST', () => {
    const sql = '/* Comment only */';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('EmptyAst');
  });

  it('should return error when final statement is not SELECT', () => {
    const sql = 'UPDATE users SET active = 1';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('nonSelectFinalStatement');
  });

  it('should return error when final statement is not SELECT in multiple statements', () => {
    const sql = 'SELECT * FROM logs; DELETE FROM users';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('nonSelectFinalStatement');
  });

  it('should return error for invalid SQL', () => {
    const sql = 'SELECT FROM WHERE;';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ParseError');
  });

  it('should handle SELECT with calculated/function columns', () => {
    const sql = 'SELECT COUNT(*) AS count, MAX(price) AS max_price FROM products';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT COUNT(*) AS count, MAX(price) AS max_price, SQLAB_COLUMN_PLACEHOLDER FROM products');
  });

  it('should handle SELECT with UNION', () => {
    // TODO. The expected behavior is much more complex
    const sql = 'SELECT id FROM users UNION SELECT id FROM admins';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id, SQLAB_COLUMN_PLACEHOLDER FROM users UNION SELECT id FROM admins');
  });

  it('should handle SELECT without FROM', () => {
    const sql = 'SELECT 1 AS one';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT 1 AS one, SQLAB_COLUMN_PLACEHOLDER');
  });

  it('should handle SELECT *', () => {
    const sql = 'SELECT * FROM users';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT *, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should handle CTEs (Common Table Expressions)', () => {
    const sql = 'WITH recent_orders AS (SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY) SELECT * FROM recent_orders';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('WITH recent_orders AS (SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY) SELECT *, SQLAB_COLUMN_PLACEHOLDER FROM recent_orders');
  });

  it('should handle non backticked reserved keywords', () => {
    const sql = 'SELECT * FROM session';
    const result = testInjectPlaceholder(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT *, SQLAB_COLUMN_PLACEHOLDER FROM session');
  });
});

describe('parseSqlToAst + getTablesOfFromClause', () => {
  // Helper function to test getTablesOfFromClause
  function testGetTables(sql, expectedTables) {
    const parseResult = parseSqlToAst(sql);
    expect(parseResult.response).to.equal('ok');
    const tables = getTablesOfFromClause(parseResult.ast);
    expect(tables).to.deep.equal(expectedTables);
  }

  it('should extract single table name', () => {
    testGetTables('SELECT id, name FROM users', ['users']);
  });

  it('should extract aliased table name', () => {
    testGetTables('SELECT u.id, u.name FROM users AS u', ['u']);
  });

  it('should extract implicit alias', () => {
    testGetTables('SELECT u.id, u.name FROM users u', ['u']);
  });

  it('should extract multiple tables from JOIN', () => {
    testGetTables('SELECT u.id, o.order_id FROM users u JOIN orders o ON u.id = o.user_id', ['u', 'o']);
  });

  it('should handle non-aliased tables in JOINs', () => {
    testGetTables('SELECT users.id, orders.id FROM users JOIN orders ON users.id = orders.user_id', ['users', 'orders']);
  });

  it('should handle mixed aliased and non-aliased tables', () => {
    testGetTables('SELECT u.id, orders.id FROM users u JOIN orders ON u.id = orders.user_id', ['u', 'orders']);
  });

  it('should return empty array for SELECT without FROM', () => {
    testGetTables('SELECT 1 AS num', []);
  });

  it('should handle subqueries in FROM clause', () => {
    testGetTables('SELECT t.user_id FROM (SELECT user_id FROM orders) AS t', ['t']);
  });

  it('should handle CTEs (Common Table Expressions)', () => {
    testGetTables('WITH recent_orders AS (SELECT * FROM orders) SELECT * FROM recent_orders', ['recent_orders']);
  });

  it('should handle multiple FROM clauses', () => {
    testGetTables('SELECT id FROM users, orders', ['users', 'orders']);
  });

  it('should handle SELECT with UNION', () => {
    // TODO. The expected behavior is much more complex
    testGetTables('SELECT id FROM users UNION SELECT id FROM admins', ['users']);
  });

});

describe('parseSqlToAst + calculateFirstPassFormula', () => {
  it('handles unqualified hash and unaliased table', () => {
    const sql = 'SELECT id, name FROM users';
    const formula = 'salt_042(sum(nn(hash)) OVER ()) AS token';
    const result = calculateFirstPassFormula(sql, formula);
    expect(result).to.equal('salt_042(sum(nn(users.hash)) OVER ()) AS token');
  });

  it ('handles qualified hash and aliased table', () => {
    const sql = 'SELECT t.id, t.name FROM users AS t';
    const formula = 'salt_042(sum(nn(A.hash)) OVER ()) AS token';
    const result = calculateFirstPassFormula(sql, formula);
    expect(result).to.equal('salt_042(sum(nn(t.hash)) OVER ()) AS token');
  });

  it('throws error for too many tables', () => {
    const sql = 'SELECT id, name FROM users, orders';
    const formula = 'salt_042(sum(nn(A.hash)) OVER ()) AS token';
    expect(() => calculateFirstPassFormula(sql, formula)).to.throw('tooManyTablesError');
  });

  it('throws error for too few tables', () => {
    const sql = 'SELECT id, name FROM users';
    const formula = 'salt_042(sum(nn(A.hash) + nn(B.hash)) OVER ()) AS token';
    expect(() => calculateFirstPassFormula(sql, formula)).to.throw('tooFewTablesError');
  });

});


describe('calculateSecondPassFormula', () => {
  it('replaces placeholder with value', () => {
    const formula = 'salt_042((0) + sum(nn(hash)) OVER ()) AS token';
    const tweakValue = 42;
    const result = calculateSecondPassFormula(formula, tweakValue);
    expect(result).to.equal('salt_042(42 + sum(nn(hash)) OVER ()) AS token');
  });

});

describe('isSafeForEvaluation', () => {
  it('should return true for safe expressions', () => {
    const expressions = [
      `result[0][0]`,
      `result[2][2]`,
      `result.length`,
      `result[0].['fid']`,
      `Math.floor(result[0][0])`,
      `result[2][2].toLowerCase()`,
      `result[0][result[0].length - 1]`,
      `Math.max(...result.map(row => row[result[0].length - 1]))`,
      `Math.min(...result.map(row => row[result[0].length - 1]))`,
      `query.match(/date_format\\([^,]*,\\s*['\"]([^'\"]+)['\"]\\)/i)[1]`,
      `Math.floor(result.find(row => row[result[0].length - 1] === 2018)[1])`,
    ]
    expressions.forEach(expr => {
      expect(isSafeForEvaluation(expr)).to.be.true;
    })
  });

  it('should return false for unsafe expressions', () => {
    const expressions = [
      "x".repeat(1000),
      `Robert'); DROP TABLE Students;--`,
      "SELECT * FROM `users`",
      `eval('alert(1)')`,
    ]
    expressions.forEach(expr => {
      expect(isSafeForEvaluation(expr)).to.be.false;
    })
  });

});
