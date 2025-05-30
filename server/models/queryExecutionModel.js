import { runSqlStatement } from "../services/databaseService.js";

/**
 * Executes a custom SQL query with optional pagination support
 * @param {string} sql - SQL query to execute - Must contain a valid SQL query
 * @param {number} offset - Starting index for pagination - Must be a non-negative integer
 * @param {number} limit - Number of rows to return - Must be a positive integer
 * @returns {Promise<Object>} Query results with metadata
 */
export async function executeQuery(sql, offset=0, limit=0) {

    if (!sql || sql.trim() === "") {
        throw new Error("Query cannot be empty");
    }

    let result;
    try {
        result = await runSqlStatement({
            sql,
            nestTables: '.' 
        });
    }
    catch (error) {
        console.log(`SQL error: ${error.message}`);
        throw new Error(`SQL error: ${error.message}`);
    }

    if (Array.isArray(result)) {
        const rowCount = result.length;

        let unqualifiedColumns = [];
        let filteredColumns = [];

        if (rowCount > 0) {
            // Extract column names, filtering out the hash columns (do this once)
            filteredColumns = Object.keys(result[0]).filter(col => !col.match(/\bhash$/i));

            // Count suffix occurrences
            const suffixCounts = {};
            for (const col of filteredColumns) {
                const suffix = col.substring(col.indexOf('.') + 1);
                suffixCounts[suffix] = (suffixCounts[suffix] || 0) + 1;
            }

            // Remove prefix only if suffix is unique
            unqualifiedColumns = filteredColumns.map(col => {
                const suffix = col.substring(col.indexOf('.') + 1);
                return suffixCounts[suffix] === 1 ? suffix : col;
            });
        }

        const startIndex = Math.min(offset, rowCount);
        const endIndex = limit ? Math.min(startIndex + limit, rowCount) : rowCount;
        const pagedRows = result.slice(startIndex, endIndex);


        const filteredRows = pagedRows.map(row => { 
            return filteredColumns.map(col => row[col]) 
        });

        return {
            columns: unqualifiedColumns,
            rows: filteredRows,
            total: rowCount,
            offset: parseInt(offset),
            limit: parseInt(limit),
            isArray: true
        };
    }
    else {
        return {
            isArray: false,
            result: result
        };
    }
}