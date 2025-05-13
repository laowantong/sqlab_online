/**
 * Middleware that intercepts JSON responses to convert
 * BigInt values to strings
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export function bigIntHandler(req, res, next) {
  // Save the original json method
  const originalJson = res.json;
  
  // Override the json method to handle BigInt
  res.json = function(data) {
    // Replace all BigInt values with strings
    // to avoid JSON serialization errors
    function replaceBigInt(key, value) {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }
    
    // Convert to JSON string then back to object
    // to ensure all BigInt values are processed
    let processedData;
    try {
      if (data !== undefined) {
        const jsonString = JSON.stringify(data, replaceBigInt);
        processedData = JSON.parse(jsonString);
      } else {
        processedData = data;
      }
    } catch (err) {
      console.error('Error processing BigInt in JSON response:', err);
      processedData = data; // Fallback to original value
    }
    
    // Call the original json method with processed data
    return originalJson.call(this, processedData);
  };
  
  next();
}
