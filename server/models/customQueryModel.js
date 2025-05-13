import { executeQuery } from "../services/databaseService.js";
import { filterSensitiveData } from "../utils/dataFilters.js";

/**
* Executes a custom SQL query with pagination support
* @param {string} query - SQL query to execute
* @param {number} offset - Starting index for pagination
* @param {number} limit - Number of rows to return
* @param {boolean} skipPagination - If true, pagination will not be applied
* @returns {Promise<Object>} Query results with metadata
*/
export async function customQuery(query, offset, limit, skipPagination) {

    // Clean the query and determine if pagination should be applied
    const trimmedQuery = query.trim();
    const isSelectQuery = trimmedQuery.toLowerCase().startsWith('select');
    const shouldApplyPagination = isSelectQuery && !skipPagination;

    if (shouldApplyPagination) {
        const cleanQuery = trimmedQuery.replace(/;+$/, '');
        const hasLimit = cleanQuery.match(/\sLIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i) !== null;

        let totalRows, rows, paginatedQuery;

        if (hasLimit) {
            // If query already has LIMIT, execute as is
            rows = await executeQuery(cleanQuery);
            totalRows = rows.length;
            paginatedQuery = cleanQuery;
        }
        else {
            const queryForCounting = cleanQuery.replace(/\s+LIMIT\s+\d+(\s+OFFSET\s+\d+)?/i, '');

            const countQuery = `SELECT COUNT(*) as total from (${queryForCounting}) as countTable`;
            const countResult = await executeQuery(countQuery);
            totalRows = countResult[0].total;

            paginatedQuery = `${cleanQuery} LIMIT ${limit} OFFSET ${offset}`;
            rows = await executeQuery(paginatedQuery);
        }

        // Filter sensitive data (like hash columns)
        const { columns, rows: filteredRows } = filterSensitiveData(rows);

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
        // For non-SELECT queries or when pagination is skipped
        const rows = await executeQuery(trimmedQuery);

         // Return results without pagination
        return {
            columns: rows.meta?.columns || [],
            rows: rows || [],
            totalRows: rows.length
        };

    }
}