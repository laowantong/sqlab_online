import { queryCoreTableData } from '../models/tableDataModel.js';

/**
 * Retrieves core table data with pagination
 * @param {Object} req - Express request with table name and pagination parameters
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleQueryTableData(req, res, next) {
  const { tableName } = req.params;

  /* the middleware paginationValidator.js has already validated
  the following values or provided default ones. */
  const limit = req.limit;
  const offset = req.offset;
   const sortColumn = req.query.sort_column || null;
  const sortDirection = req.query.sort_direction || 'ASC';
  
  try {
    const data = await queryCoreTableData(tableName, offset, limit, sortColumn, sortDirection);
    res.json(data);
  } catch (err) {
    next(err);
  }
}