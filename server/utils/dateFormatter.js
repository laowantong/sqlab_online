/**
 * @description Formats date fields in a row object to 'YYYY-MM-DD' format.
 * Without this, date fields may be returned with unnecessary time information.
 * @param {Object} row - The row object containing date fields.
 * @returns {Object} - A new object with formatted date fields.
 */
export function formatDates(row) {
    const formatted = {};
    for (const key in row) {
        const value = row[key];
        if (value instanceof Date) {
            formatted[key] = value.toISOString().split('T')[0];
        } else {
            formatted[key] = value;
        }
    }
    return formatted;
}
