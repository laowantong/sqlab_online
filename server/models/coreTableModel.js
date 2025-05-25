import { runSqlStatement } from '../services/databaseService.js';

/**
 * Retrieves a page of a core table data. The hash column is filtered out.
 * @param {string} tableName - Table name
 * @param {number} limit - Number of rows to retrieve
 * @param {number} offset - Starting index
 * @returns {Promise<Object>} Table data and metadata
 */
export async function queryCoreTable(tableName, offset, limit, sortColumn, sortDirection) {

    // Get total row count
    const [{ total }] = await runSqlStatement(
        `SELECT COUNT(*) AS total FROM ${tableName}`
    );

    // Fetch the required slice of the rows
    let query = `SELECT * FROM ${tableName}`;
    query += ` ORDER BY ${sortColumn ? `\`${sortColumn}\`` : `NULL`} ${sortDirection === 'DESC' ? 'DESC' : 'ASC'}`;
    query += ` LIMIT ? OFFSET ?`;
    let rows = await runSqlStatement(query, [limit, offset]);

    // Suppress the column exactly named "hash"
    const columns = rows.length > 0
        ? Object.keys(rows[0]).filter(col => col !== 'hash')
        : [];

    // Filter out hash columns from results
    rows = rows.map(row => {
        return columns.map(col => row[col]);
    });

    return {
        tableName,
        total,
        offset,
        limit,
        columns,
        rows,
        sortColumn,
        sortDirection
    };
}