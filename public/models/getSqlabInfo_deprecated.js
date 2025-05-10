/**
 * Fetches a value from the sqlab_info table by name and returns it as the proper JavaScript type.
 * @param {string} name - The name/key to look up in the sqlab_info table
 * @returns {Promise<*|null>} The parsed value (string, number, object, array, etc.) or null if not found
 * @throws {Error} If there's a network error, database error, or invalid JSON
 */
export async function getSqlabInfo(name) {
    try {
        const response = await fetch('/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `SELECT value FROM sqlab_info WHERE name = '${name}' LIMIT 1`,
                skipPagination: true
            })
        });

        if (!response.ok) {
            throw new Error(`Database request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.rows || result.rows.length === 0) {
            console.error(`No result found when fetching ${name} from sqlab_info.`);
            return null;  // Not found: there's no value for this name
        }

        // The value is a Javascript type among string, number, object, array, etc.
        return result.rows[0][0];
        
    } catch (error) {
        console.error(`Error fetching ${name} from sqlab_info:`, error);
        throw error;  // Rethrow the error for further handling
    }
}