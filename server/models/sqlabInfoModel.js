import databaseService from '../services/databaseService.js';

/**
 * Retrieves a value from the sqlab_info table based on the provided name
 * and returns it as the appropriate JavaScript type.
 * @param {string} name - The name/key to look up in the sqlab_info table
 * @returns {Promise<*>} The parsed value (string, number, object, array, etc.) or null if not found
 * @throws {Error} If there's a network error, database error, or invalid JSON
 */

export async function getValue(name) {
    try {
        const rows = await databaseService.executeQuery(
            `SELECT value FROM sqlab_info WHERE name = ? LIMIT 1`,
            [name],
            { skipPagination: true }
        );

        if (!rows || rows.length === 0) {
            console.error(`No result found when fetching ${name} from sqlab_info.`);
            return null;  // Not found: there's no value for this name
        }

        // The value is a Javascript type among string, number, object, array, etc.
        return rows[0].value;
        
    } catch (error) {
        console.error(`Error fetching ${name} from sqlab_info:`, error);
        throw error;  // Rethrow the error for further handling
    }
}

export default {
    getValue
};