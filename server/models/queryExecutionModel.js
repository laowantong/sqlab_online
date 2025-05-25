import { runSqlStatement } from "../services/databaseService.js";

/**
 * Executes a custom SQL query with optional pagination support
 * @param {string} query - SQL query to execute - Must contain a valid SQL query
 * @param {number} offset - Starting index for pagination - Must be a non-negative integer
 * @param {number} limit - Number of rows to return - Must be a positive integer
 * @returns {Promise<Object>} Query results with metadata
 */
export async function executeQuery(query, offset=0, limit=0) {

    if (!query || query.trim() === "") {
        throw new Error("Query cannot be empty");
    }

    let result;
    try {
        result = await runSqlStatement(query);
    }
    catch (error) {
        console.log(`SQL error: ${error.message}`);
        throw new Error(`SQL error: ${error.message}`);
    }

    if (Array.isArray(result)) {
        const rowCount = result.length;

        let columns = [];
        if (rowCount > 0) {
            // Extract column names, filtering out the "hash" column
            columns = Object.keys(result[0]).filter(col => col.toLowerCase() !== "hash");
        }

        const startIndex = Math.min(offset, rowCount);
        const endIndex = limit ? Math.min(startIndex + limit, rowCount) : rowCount;
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