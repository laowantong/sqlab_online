import { executeQuery } from "../services/databaseService.js";

/**
 * Executes a custom SQL query with pagination support
 * @param {string} query - SQL query to execute - Must contain a valid SQL query
 * @param {number} offset - Starting index for pagination - Must be a non-negative integer
 * @param {number} limit - Number of rows to return - Must be a positive integer
 * @returns {Promise<Object>} Query results with metadata
 */
export async function customQuery(query, offset, limit) {

    const trimmedQuery = query.trim();
    const result = await executeQuery(trimmedQuery);

    if (Array.isArray(result)) {
        const rowCount = result.length;

        let columns = [];
        if (rowCount > 0) {
            // Extract column names, filtering out the "hash" column
            columns = Object.keys(result[0]).filter(col => col.toLowerCase() !== "hash");
        }

        const startIndex = Math.min(offset, rowCount);
        const endIndex = Math.min(offset + limit, rowCount);
        const pagedRows = result.slice(startIndex, endIndex);

        const filteredRows = pagedRows.map(row => { return columns.map(col => row[col]) });
        // Return results with pagination metadata
        return {
            columns,
            rows: filteredRows,
            total: rowCount,
            offset: parseInt(offset),
            limit: parseInt(limit),
            isArray: true
        };
    }
    //In case of non-select queries
    else {
        return {
            isArray: false,
            result: result
        };
    }
}