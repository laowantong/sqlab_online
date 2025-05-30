import { runSqlStatement } from '../services/databaseService.js';

/**
 * Retrieves a value from the sqlab_metadata table based on the provided name.
 * @param {string} name - The name/key to look up
 * @returns {Promise<*>} The value or null if not found
 */
export async function queryMetadata(name) {
    const rows = await runSqlStatement({
        sql: `SELECT value FROM sqlab_metadata WHERE name = ? LIMIT 1`,
        values: [name],
        skipPagination: true,
    });
    
    return (rows && rows.length > 0) ? rows[0].value : null;
}
