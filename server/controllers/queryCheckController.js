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
    const data = await checkQuery(query, activityNumber, taskNumber, stakePercentage);
    res.status(200).json(data);
  } catch (err) {
    // Log the full error details
    console.error('Query check error:', err);
    console.error('Stack trace:', err.stack);
    
    res.status(500).json({
      error: "Internal server error",
      // Include error details in development
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    });
  }
}