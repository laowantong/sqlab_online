import { expect } from 'chai';
import { addColumnToFinalStatement } from '../server/utils/sqlAst.js';

// Suppress all backticks added by sqlify
function t(string) {
  return string.replace(/`/g, '');
}

describe('addColumnToFinalStatement', () => {
  it('should add a column to a simple SELECT statement', () => {
    const sql = 'SELECT id, name FROM users';
    const result = addColumnToFinalStatement(sql, 'created_at');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT id, name, created_at FROM users');
  });

  it('should add a column to the final SELECT in multiple statements', () => {
    const sql = 'INSERT INTO logs VALUES (1,"test") ; SELECT id, name FROM users';
    const result = addColumnToFinalStatement(sql, 'active');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('INSERT INTO logs VALUES (1,"test") ; SELECT id, name, active FROM users');
  });

  it('should add an expression as a column', () => {
    const sql = 'SELECT id FROM users';
    const result = addColumnToFinalStatement(sql, 'COUNT(*) AS total_count');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT id, COUNT(*) AS total_count FROM users');
  });

  it('should handle complex SELECT statements', () => {
    const sql = 'SELECT u.id, u.name FROM users AS u INNER JOIN orders AS o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name ASC LIMIT 10';
    const result = addColumnToFinalStatement(sql, 'u.email');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT u.id, u.name, u.email FROM users AS u INNER JOIN orders AS o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name ASC LIMIT 10');
  });

  it('should handle subqueries in SELECT statements', () => {
    const sql = 'SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count FROM users';
    const result = addColumnToFinalStatement(sql, 'created_at');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count, created_at FROM users');
  });

  it('should handle SELECT with aliased columns', () => {
    const sql = 'SELECT id AS user_id, name AS user_name FROM users';
    const result = addColumnToFinalStatement(sql, 'email AS user_email');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT id AS user_id, name AS user_name, email AS user_email FROM users');
  });

  it('should return error for an empty AST', () => {
    const sql = '/* Comment only */';
    const result = addColumnToFinalStatement(sql, 'test');
    expect(result.response).to.equal('EmptyAst');
  });

  it('should return error when final statement is not SELECT', () => {
    const sql = 'UPDATE users SET active = 1';
    const result = addColumnToFinalStatement(sql, 'test');
    expect(result.response).to.equal('nonSelectFinalStatement');
  });

  it('should return error when final statement is not SELECT in multiple statements', () => {
    const sql = 'SELECT * FROM logs; DELETE FROM users';
    const result = addColumnToFinalStatement(sql, 'test');
    expect(result.response).to.equal('nonSelectFinalStatement');
  });

  it('should return error for invalid SQL', () => {
    const sql = 'SELECT FROM WHERE;';
    const result = addColumnToFinalStatement(sql, 'test');
    expect(result.response).to.equal('ParseError');
  });

  it('should handle SELECT with calculated/function columns', () => {
    const sql = 'SELECT COUNT(*) AS count, MAX(price) AS max_price FROM products';
    const result = addColumnToFinalStatement(sql, 'MIN(price) AS min_price');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT COUNT(*) AS count, MAX(price) AS max_price, MIN(price) AS min_price FROM products');
  });

  it('should handle SELECT with UNION', () => {
    const sql = 'SELECT id FROM users UNION SELECT id FROM admins';
    const result = addColumnToFinalStatement(sql, 'role');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT id, role FROM users UNION SELECT id FROM admins');
  });

  it('should handle SELECT without FROM', () => {
    const sql = 'SELECT 1 AS one';
    const result = addColumnToFinalStatement(sql, 'two');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT 1 AS one, two');
  });

  it('should handle SELECT *', () => {
    const sql = 'SELECT * FROM users';
    const result = addColumnToFinalStatement(sql, 'created_at');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('SELECT *, created_at FROM users');
  });

  it('should handle CTEs (Common Table Expressions)', () => {
    const sql = 'WITH recent_orders AS (SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY) SELECT * FROM recent_orders';
    const result = addColumnToFinalStatement(sql, 'user_id');
    expect(result.response).to.equal('ok');
    expect(t(result.result)).to.equal('WITH recent_orders AS (SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY) SELECT *, user_id FROM recent_orders');
  });

});