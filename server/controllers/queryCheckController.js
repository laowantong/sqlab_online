import { checkQuery } from "../models/queryCheckModel.js";

/**
 * Check a user query against the database
 * @param {Object} req - Express request containing SQL query and metadata
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleCheckQuery(req, res) {
  const { query, activityNumber, taskNumber, stakeAmount } = req.body;
  try {
    const data = await checkQuery(query, activityNumber, taskNumber, stakeAmount);
    res.json(data);
  } catch (err) {
    res.status(400).json({
      // TODO: is this error message correct?
      error: `Database error: ${err.message}`
    });
  }
}
