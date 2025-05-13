import { fetchCoreTableData } from '../../../api/fetchCoreTableData.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../../../utils/constants.js';
import { escapeHtml } from '../../../utils/genericUtils.js';
import { mayRecreateTableContainerIn, renderPaginatedTable } from '../tables.js';

/**
 * Loads and renders a specific core table with pagination
 * @param {string} tableName - The name of the table
 * @param {number} offset - The starting index for pagination
 * @param {number} limit - The number of rows to retrieve
 */
export async function loadAndRenderCoreTableData(tableName, offset=DEFAULT_PAGE_OFFSET) {
    const data = await fetchCoreTableData(tableName, offset, DEFAULT_PAGE_LIMIT);
    
    // Update the column names in the outline when data is loaded
    const columnsElement = document.getElementById(`columns-${tableName}`);
    if (columnsElement && data.columns && data.columns.length > 0) {
        columnsElement.innerHTML = data.columns.map(column =>
            `<span class="column-name">${escapeHtml(column)}</span>`
        ).join(', ');
    }
    
    // Recreate the table structure if needed
    const container = document.getElementById(`core-table-${tableName}`);
    mayRecreateTableContainerIn(container);

    // Render the table data with pagination
    const onPageChange = (newOffset) => { loadAndRenderCoreTableData(tableName, newOffset);}
    renderPaginatedTable( data, container, onPageChange );
}
