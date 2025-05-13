import { fetchMetadata } from '../../../api/fetchMetadata.js';
import { escapeHtml } from '../../../utils/genericUtils.js';

/**
 * Loads and renders column names for a core table in its draggable outline
 * @param {string} tableName - The name of the table
 */
export async function loadAndRenderCoreTableColumns(tableName) {

    try {
        const table_structures = await fetchMetadata('table_structures');
        const columnsElement = document.getElementById(`columns-${tableName}`);
        const columns = table_structures[tableName] || [];
        if (columns.length > 0) {
            columnsElement.innerHTML = columns.map(column =>
                `<span class="column-name">${escapeHtml(column)}</span>`
            ).join(', ');
        } else {
            columnsElement.innerHTML = '<span class="no-columns">(No columns)</span>';
        }
    }
    catch (error) {
        console.error(`Error loading columns for ${tableName}:`, error);
        const columnsElement = document.getElementById(`columns-${tableName}`);
        columnsElement.innerHTML = '<span class="error-columns">Failed to load columns</span>';
    }
}
