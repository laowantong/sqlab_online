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
    let sql = `SELECT COUNT(*) AS total FROM \`${tableName}\``;
    const [{ total }] = await runSqlStatement({ sql });

    // Fetch the required slice of the rows
    const col = sortColumn ? `\`${sortColumn}\`` : `NULL`;
    const dir = sortDirection === 'DESC' ? 'DESC' : 'ASC';
    sql = `SELECT * FROM ${tableName} ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`
    let rows = await runSqlStatement({ sql, values: [limit, offset] });

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