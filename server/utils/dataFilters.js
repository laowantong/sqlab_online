/**
* Checks if a column is not the hash column
* @param {string} columnName - Name of the column to check
* @returns {boolean} True if the column is not named "hash"
*/
export function isNotHashColumn(columnName) {
    return columnName.toLowerCase() !== "hash";
}


/**
* Filters sensitive data from query results
* @param {Array} rows - Data rows from database query
* @param {Function} filterFct - Function to determine which columns to keep
* @returns {Object} Filtered columns and rows
*/
export function filterSensitiveData(rows, filterFct = isNotHashColumn) {

    // Return empty arrays if no data
    if (rows.length === 0) {
        return {
            columns: [], rows: []
        };
    }

    const filteredColumns = Object.keys(rows[0]).filter(filterFct);


    // Create new rows with only the allowed columns
    const filteredRows = rows.map(row => filteredColumns.map(col => row[col]));

    return {
        columns: filteredColumns, rows: filteredRows
    };
}