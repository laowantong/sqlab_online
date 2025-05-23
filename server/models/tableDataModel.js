import { executeQuery } from '../services/databaseService.js';

/**
 * Retrieves a page of a core table data. The hash column is filtered out.
 * @param {string} tableName - Table name
 * @param {number} limit - Number of rows to retrieve
 * @param {number} offset - Starting index
 * @returns {Promise<Object>} Table data and metadata
 */

export async function queryCoreTableData(tableName, offset, limit, sortColumn, sortDirection) {

    // Get total row count
    const [{ total }] = await executeQuery(
        `SELECT COUNT(*) AS total FROM ${tableName}`
    );

    let query = `SELECT * FROM ${tableName}`;
    if (sortColumn) {
        query += ` ORDER BY \`${sortColumn}\` ${sortDirection === 'DESC' ? 'DESC' : 'ASC'}`;
    }
    query += ` LIMIT ? OFFSET ?`;

    let rows = await executeQuery(query, [limit, offset]);

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