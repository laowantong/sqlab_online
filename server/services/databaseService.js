import mariadb from 'mariadb';

export let runSqlStatement;
export let databaseClose;

/**
 * Creates a function to execute SQL queries using the provided database configuration.
 * @param {string} path - Path to the database configuration file.
 * @returns {Promise<void>} A promise that resolves when the function is created.
 * @throws {Error} If the database configuration is invalid or if the connection fails.
 * @description This function initializes a connection pool and returns a function to execute SQL queries.
 */
export async function databaseConnection(cnxPath) {
  // Retrieve the database configuration from the provided path
  const cnx = await import(cnxPath);
  const pool = mariadb.createPool(cnx.dbConfig);

  runSqlStatement = async (options, callback = null) => {
    let conn;
    try {
      conn = await pool.getConnection();
      // Doc: https://github.com/mysqljs/mysql?tab=readme-ov-file#performing-queries
      return await conn.query(options, callback);
    } finally {
      if (conn) conn.release();
    }
  };
  databaseClose = async() => pool.end();
}
