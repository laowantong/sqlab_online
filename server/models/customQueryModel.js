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
    const rowCount = rows.length;

    if (Array.isArray(rows) && rowCount > 0) {
        

        // Extract column names, filtering out the "hash" column
        const columns = Object.keys(rows[0]).filter(col => col.toLowerCase() !== "hash");

        const startIndex = Math.min(offset, rowCount);
        const endIndex = Math.min(offset + limit, rowCount);
        const pagedRows = rows.slice(startIndex, endIndex);

        const filteredRows = pagedRows.map(row => { return columns.map(col => row[col]) });
        // Return results with pagination metadata
        return {
            columns,
            rows: filteredRows,
            total: rowCount,
            offset: parseInt(offset),
            limit: parseInt(limit)
        };
    }
    //In case of empty set or non-select queries
    else {
        
        return {
            columns:  [],
            rows: [],
            total:  0,  
            offset: parseInt(offset),
            limit: parseInt(limit)
        };
    }
}