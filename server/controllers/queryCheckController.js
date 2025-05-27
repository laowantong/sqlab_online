import { checkQuery } from "../models/queryCheckModel.js";

/**
 * Check a user query against the database
 * @param {Object} req - Express request containing SQL query and metadata
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function handleCheckQuery(req, res) {
  const { query, activityNumber, taskNumber, stakePercentage } = req.body;

  try {
    const jsonData = await checkQuery(query, activityNumber, taskNumber, stakePercentage);
    const data = JSON.parse(jsonData);
    
    if (data.success) {
      res.status(200).json(data);
    } else {
      res.status(400).json(data);
    }
  } catch (err) {
    res.status(500).json({
      error: "Error server"
    });
  }
}
