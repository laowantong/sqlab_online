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
  
  try {
    const data = await queryCoreTableData(tableName, offset, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
