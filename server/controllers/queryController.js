import { executeQuery } from '../services/databaseService.js';

/**
 * Executes a SQL query with pagination and returns the results
 * @param {Object} req - Express request containing SQL query and pagination params
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleExecuteQuery(req, res, next) {
  const { query, offset, limit, skipPagination = false } = req.body;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({
      error: 'Query cannot be empty'
    });
  }
  
  try {
    // For SELECT queries, apply pagination (unless skipPagination is true)
    if (query.trim().toLowerCase().startsWith('select') && !skipPagination) {
      // Remove any trailing semicolons from the query for use in subqueries
      const cleanQuery = query.trim().replace(/;+$/, '');
      
      // Check if the query already has a LIMIT clause
      const limitMatch = cleanQuery.match(/\sLIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
      const hasLimit = limitMatch !== null;
      
      let totalRows, rows, paginatedQuery, actualLimit;
      
      if (hasLimit) {
        // If query has its own LIMIT, extract the limit value
        actualLimit = parseInt(limitMatch[1]);
        
        // Execute the query as-is (just without semicolon)
        rows = await executeQuery(cleanQuery);
        
        // Use the count of rows returned or the actual limit value, whichever is smaller
        totalRows = Math.min(rows.length, actualLimit);
        
        // If the query has its own LIMIT, use that as the limit value for pagination display
        paginatedQuery = cleanQuery;
      } else {
        // For counting, we need to remove any existing LIMIT/OFFSET clauses
        const queryForCounting = cleanQuery.replace(/\s+LIMIT\s+\d+(\s+OFFSET\s+\d+)?/i, '');
        
        // Execute a query to count total results (without pagination)
        const countQuery = `SELECT COUNT(*) as total FROM (${queryForCounting}) as countTable`;
        const countResult = await executeQuery(countQuery);
        totalRows = countResult[0].total;
        
        // Apply pagination to the query
        paginatedQuery = `${cleanQuery} LIMIT ${limit} OFFSET ${offset}`;
        rows = await executeQuery(paginatedQuery);
        actualLimit = limit;
      }
      
      // Filter out hash columns from results
      const filteredColumns = rows.length > 0 
        ? Object.keys(rows[0]).filter(col => !col.toLowerCase().endsWith('hash'))
        : [];
      
      // Create filtered rows without hash data
      const filteredRows = rows.map(row => {
        return filteredColumns.map(col => row[col]);
      });
      
      // Return results with pagination metadata
      res.json({
        columns: filteredColumns,
        rows: filteredRows,
        total: totalRows,
        offset: parseInt(offset),
        limit: actualLimit
      });
    } 
    // For SELECT queries with skipPagination flag
    else if (query.trim().toLowerCase().startsWith('select') && skipPagination) {
      // Execute the query directly without pagination
      const rows = await executeQuery(query.trim().replace(/;+$/, ''));
      
      // Filter out hash columns from results
      const filteredColumns = rows.length > 0 
        ? Object.keys(rows[0]).filter(col => !col.toLowerCase().endsWith('hash'))
        : [];
      
      // Create filtered rows without hash data
      const filteredRows = rows.map(row => {
        return filteredColumns.map(col => row[col]);
      });
      
      // Return results without pagination metadata
      res.json({
        columns: filteredColumns,
        rows: filteredRows,
        totalRows: rows.length
      });
    }
    else {
      // For non-SELECT queries (INSERT, UPDATE, etc.), don't apply pagination
      const rows = await executeQuery(query);
      
      res.json({
        columns: rows.meta?.columns || [],
        rows: rows || [],
        totalRows: rows.length
      });
    }
  } catch (err) {
    // For SQL errors, return 400 instead of 500
    res.status(400).json({
      error: `Database error: ${err.message}`
    });
  }
}
