import { customQuery } from "../models/customQueryModel.js";

/**
 * Executes a SQL query and returns the results
 * @param {Object} req - Express request containing SQL query and pagination params
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleExecuteQuery(req, res) {
  const { query, offset, limit } = req.body;
  try {
    const data = await customQuery(query, offset, limit);
    res.json(data);
  } catch (err) {
    res.status(400).json({
      error: `Database error: ${err.message}`
    });
  }
}
