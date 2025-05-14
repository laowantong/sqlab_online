import { executeQuery } from "../services/databaseService.js";


/**
 * Executes a custom SQL query with pagination support
 * @param {string} query - SQL query to execute
 * @param {number} offset - Starting index for pagination
 * @param {number} limit - Number of rows to return
 * @returns {Promise<Object>} Query results with metadata
 */
export async function customQuery(query, offset, limit) {


    const trimmedQuery = query.trim();
    const rows = await executeQuery(trimmedQuery);

    if (Array.isArray(rows) && rows.length > 0) {
        const totalRows = rows.length;

        // Extract column names, filtering out the "hash" column
        const columns = Object.keys(rows[0]).filter(col => col.toLowerCase() !== "hash");

        const startIndex = Math.min(offset, totalRows);
        const endIndex = Math.min(offset + limit, totalRows);
        const pagedRows = rows.slice(startIndex, endIndex);

        const filteredRows = pagedRows.map(row => { return columns.map(col => row[col]) });
        // Return results with pagination metadata
        return {
            columns,
            rows: filteredRows,
            total: totalRows,
            offset: parseInt(offset),
            limit: parseInt(limit)
        };
    }
    else {
        // Return results without pagination
        return {
            columns: rows.meta?.columns || [],
            rows: rows || [],
            totalRows: rows.length || 0
        };

    }
}