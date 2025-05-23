/**
 * Fetches data from a core table of a given name with pagination and sorting
 * @param {string} tableName - Name of the table to load
 * @param {number} offset - Starting row for pagination
 * @param {number} limit - Number of rows to retrieve
 * @param {string} sortColumn - Column to sort by (optional)
 * @param {string} sortDirection - Sort direction 'ASC' or 'DESC' (optional)
 * @returns {Promise<Object>} - Resolves with table content and metadata
 * @throws {Error} - Throws an error if the fetch fails
 * @description This function fetches data from a specified table in the database.
 * The data is paginated based on the provided offset and limit, and optionally sorted.
 */
export async function fetchCoreTableData(tableName, offset, limit, sortColumn, sortDirection) {
    try {
        let url = `/table-data/${tableName}?offset=${offset}&limit=${limit}`;
        if (sortColumn) {
            url += `&sort_column=${sortColumn}&sort_direction=${sortDirection || 'ASC'}`;
        }
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch table data: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(`Error fetching table data for ${tableName}:`, error);
        throw new Error(`Failed to fetch table data: ${error.message}`);
    }
}