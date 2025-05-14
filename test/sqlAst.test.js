import { expect } from 'chai';
import { appendPlaceholderColumn } from '../server/utils/sqlAst.js';

// Remove all backticks, mostly added by sqlify
function r(string) {
  return string.replace(/`/g, '');
}

describe('appendPlaceholderColumn', () => {
  it('should add a column to a simple SELECT statement', () => {
    const sql = 'SELECT id, name FROM users';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id, name, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should add a column to the final SELECT in multiple statements', () => {
    const sql = 'INSERT INTO logs VALUES (1,"test") ; SELECT id, name FROM users';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('INSERT INTO logs VALUES (1,"test") ; SELECT id, name, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should handle complex SELECT statements', () => {
    const sql = 'SELECT u.id, u.name FROM users AS u INNER JOIN orders AS o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name ASC LIMIT 10';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT u.id, u.name, SQLAB_COLUMN_PLACEHOLDER FROM users AS u INNER JOIN orders AS o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name ASC LIMIT 10');
  });

  it('should handle subqueries in SELECT statements', () => {
    const sql = 'SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count FROM users';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should handle SELECT with aliased columns', () => {
    const sql = 'SELECT id AS user_id, name AS user_name FROM users';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id AS user_id, name AS user_name, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should return error for an empty AST', () => {
    const sql = '/* Comment only */';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('EmptyAst');
  });

  it('should return error when final statement is not SELECT', () => {
    const sql = 'UPDATE users SET active = 1';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('nonSelectFinalStatement');
  });

  it('should return error when final statement is not SELECT in multiple statements', () => {
    const sql = 'SELECT * FROM logs; DELETE FROM users';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('nonSelectFinalStatement');
  });

  it('should return error for invalid SQL', () => {
    const sql = 'SELECT FROM WHERE;';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ParseError');
  });

  it('should handle SELECT with calculated/function columns', () => {
    const sql = 'SELECT COUNT(*) AS count, MAX(price) AS max_price FROM products';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT COUNT(*) AS count, MAX(price) AS max_price, SQLAB_COLUMN_PLACEHOLDER FROM products');
  });

  it('should handle SELECT with UNION', () => {
    // TODO. The expected behavior is much more complex
    const sql = 'SELECT id FROM users UNION SELECT id FROM admins';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT id, SQLAB_COLUMN_PLACEHOLDER FROM users UNION SELECT id FROM admins');
  });

  it('should handle SELECT without FROM', () => {
    const sql = 'SELECT 1 AS one';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT 1 AS one, SQLAB_COLUMN_PLACEHOLDER');
  });

  it('should handle SELECT *', () => {
    const sql = 'SELECT * FROM users';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT *, SQLAB_COLUMN_PLACEHOLDER FROM users');
  });

  it('should handle CTEs (Common Table Expressions)', () => {
    const sql = 'WITH recent_orders AS (SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY) SELECT * FROM recent_orders';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('WITH recent_orders AS (SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY) SELECT *, SQLAB_COLUMN_PLACEHOLDER FROM recent_orders');
  });

  it('should handle non backticked reserved keywords', () => {
    const sql = 'SELECT * FROM session';
    const result = appendPlaceholderColumn(sql);
    expect(result.response).to.equal('ok');
    expect(r(result.result)).to.equal('SELECT *, SQLAB_COLUMN_PLACEHOLDER FROM session');
  });

});