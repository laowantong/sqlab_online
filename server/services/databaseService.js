import mariadb from 'mariadb';
import dbConfig from '../config.js';

// Create database connection pool
const pool = mariadb.createPool(dbConfig.dbConfig);

/**
 * Gets a connection from the pool
 * @returns {Promise<Object>} Database connection
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * Executes a query and returns the results
 * @param {string} query - SQL query to execute
 * @param {Array} params - Parameters for prepared statement (optional)
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(query, params = []) {
  let conn;
  try {
    conn = await getConnection();
    return await conn.query(query, params);
  } finally {
    if (conn) conn.release();
  }
}
