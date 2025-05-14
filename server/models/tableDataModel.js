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

    // Extract column names, filtering out the "hash" column
    const columns = formattedRows.length > 0 ? Object.keys(formattedRows[0]).filter(col => col.toLowerCase() !== "hash") : [];
    const filteredRows = formattedRows.map(row => { return columns.map(col => row[col]); });


    return {
        tableName,
        total,
        offset: offset,
        limit: limit,
        columns: columns,
        rows: filteredRows,
    };
}
