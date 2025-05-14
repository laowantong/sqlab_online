import { expect } from 'chai';
import { addColumnToFinalStatement } from '../server/utils/sqlAst.js';

describe('addColumnToFinalStatement', () => {
  it('should add a column to a simple SELECT statement', () => {
    const sql = 'SELECT id, name FROM users';
    const result = addColumnToFinalStatement(sql, 'created_at');
    expect(result.response).to.equal('ok');
    expect(result.result).to.equal('SELECT id, name,created_at FROM users');
  });

  it('should add a column to the final SELECT in multiple statements', () => {
    const sql = 'INSERT INTO logs VALUES (1, "test"); SELECT id, name FROM users';
    const result = addColumnToFinalStatement(sql, 'active');
    expect(result.response).to.equal('ok');
    expect(result.result).to.equal('INSERT INTO logs VALUES (1, "test"); SELECT id, name,active FROM users');
  });

  it('should add an expression as a column', () => {
    const sql = 'SELECT id FROM users';
    const result = addColumnToFinalStatement(sql, 'COUNT(*) AS total_count');
    expect(result.response).to.equal('ok');
    expect(result.result).to.equal('SELECT id,COUNT(*) AS total_count FROM users');
  });

  it('should handle complex SELECT statements', () => {
    const sql = 'SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name LIMIT 10';
    const result = addColumnToFinalStatement(sql, 'u.email');
    expect(result.response).to.equal('ok');
    expect(result.result).to.equal('SELECT u.id, u.name,u.email FROM users u JOIN orders o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id HAVING COUNT(*) > 5 ORDER BY u.name LIMIT 10');
  });

  // it('should handle subqueries in SELECT statements', () => {
  //   const sql = 'SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count FROM users';
  //   const result = addColumnToFinalStatement(sql, 'created_at');
  //   expect(result.response).to.equal('ok');
  //   expect(result.result).to.equal('SELECT id, (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count,created_at FROM users');
  // });

  // it('should handle SELECT with aliased columns', () => {
  //   const sql = 'SELECT id AS user_id, name AS user_name FROM users';
  //   const result = addColumnToFinalStatement(sql, 'email AS user_email');
  //   expect(result.response).to.equal('ok');
  //   expect(result.result).to.equal('SELECT id AS user_id, name AS user_name,email AS user_email FROM users');
  // });

  // it('should return error for non-array AST', () => {
  //   // Mock a case where the AST isn't an array (shouldn't happen with valid SQL)
  //   const sql = '/* Comment only */';
  //   const result = addColumnToFinalStatement(sql, 'test');
  //   expect(result.response).to.equal('NotAnArray');
  // });

  // it('should return error when final statement is not SELECT', () => {
  //   const sql = 'UPDATE users SET active = 1';
  //   const result = addColumnToFinalStatement(sql, 'test');
  //   expect(result.response).to.equal('nonSelectFinalStatement');
  // });

  // it('should return error when final statement is not SELECT in multiple statements', () => {
  //   const sql = 'SELECT * FROM logs; DELETE FROM users';
  //   const result = addColumnToFinalStatement(sql, 'test');
  //   expect(result.response).to.equal('nonSelectFinalStatement');
  // });

  // it('should return error for invalid SQL', () => {
  //   const sql = 'SELECT FROM WHERE;';
  //   const result = addColumnToFinalStatement(sql, 'test');
  //   expect(result.response).to.equal('ParseError');
  // });

  // it('should handle SELECT with calculated/function columns', () => {
  //   const sql = 'SELECT COUNT(*) as count, MAX(price) as max_price FROM products';
  //   const result = addColumnToFinalStatement(sql, 'MIN(price) as min_price');
  //   expect(result.response).to.equal('ok');
  //   expect(result.result).to.equal('SELECT COUNT(*) as count, MAX(price) as max_price,MIN(price) as min_price FROM products');
  // });

  // it('should handle SELECT with UNION', () => {
  //   const sql = 'SELECT id FROM users UNION SELECT id FROM admins';
  //   const result = addColumnToFinalStatement(sql, 'role');
  //   expect(result.response).to.equal('ok');
  //   expect(result.result).to.equal('SELECT id,role FROM users UNION SELECT id FROM admins');
  // });

  // it('should handle uncommon spacing in SQL', () => {
  //   const sql = 'SELECT\n  id,\n  name\nFROM\n  users';
  //   const result = addColumnToFinalStatement(sql, 'email');
  //   expect(result.response).to.equal('ok');
  //   expect(result.result).to.equal('SELECT\n  id,\n  name,email\nFROM\n  users');
  // });
});