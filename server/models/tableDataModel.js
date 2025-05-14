import { executeQuery } from '../services/databaseService.js';
import { formatDates } from '../utils/dateFormatter.js';

/**
 * Retrieves a page of a core table data. The hash column is filtered out.
 * @param {string} tableName - Table name
 * @param {number} limit - Number of rows to retrieve
 * @param {number} offset - Starting index
 * @returns {Promise<Object>} Table data and metadata
 */

export async function queryCoreTableData(tableName, offset, limit) {

    // Get total row count
    const [{ total }] = await executeQuery(
        `SELECT COUNT(*) AS total FROM ${tableName}`
    );

    // Fetch the required slice of the rows
    const rows = await executeQuery(
        `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`,
        [limit, offset]
    );

    const formattedRows = rows.map(formatDates);

    // Suppress the column exactly named "hash"
    const filteredColumns = rows.length > 0
        ? Object.keys(rows[0]).filter(col => col !== 'hash')
        : [];

    // Filter out hash columns from results
    const filteredRows = formattedRows.map(row => {
        return filteredColumns.map(col => row[col]);
    });

    return {
        tableName,
        total,
        offset: offset,
        limit: limit,
        columns: filteredColumns,
        rows: filteredRows,
    };
}
