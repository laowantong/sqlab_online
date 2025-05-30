import { escapeHtml } from '../../../utils/genericUtils.js';

/**
 * Renders column names for a core table in its draggable outline
 * @param {string} tableName - The name of the table
 * @param {array} columns - Array of column names
 */
export async function loadAndRenderCoreTableColumns(tableName, columns = []) {

    const columnsElement = document.getElementById(`columns-${tableName}`);
    if (!columnsElement) return;

    if (columns.length > 0) {
        columnsElement.innerHTML = columns.map(column =>
            `<button class="column-name-btn insertable">${escapeHtml(column)}</button>`
        ).join('');
        // Adding listeners to buttons
    } else {
        columnsElement.innerHTML = '<span class="no-columns">(No columns)</span>';
    }
}
