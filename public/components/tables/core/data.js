import { fetchCoreTableData } from '../../../api/fetchCoreTableData.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../../../utils/constants.js';
import { escapeHtml } from '../../../utils/genericUtils.js';
import { mayRecreateTableContainerIn, renderPaginatedTable } from '../tables.js';

/**
 * Loads and renders a specific core table with pagination and sorting
 * @param {string} tableName - The name of the table
 * @param {number} offset - The starting index for pagination
 * @param {string} sortColumn - Column to sort by (optional)
 * @param {string} sortDirection - Sort direction (optional)
 */
export async function loadAndRenderCoreTableData(tableName, offset = DEFAULT_PAGE_OFFSET, sortColumn = null, sortDirection = 'ASC') {
    const data = await fetchCoreTableData(tableName, offset, DEFAULT_PAGE_LIMIT, sortColumn, sortDirection);
    
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

    // Render the table data with pagination and sorting
    const onPageChange = (newOffset) => { 
        loadAndRenderCoreTableData(tableName, newOffset, sortColumn, sortDirection);
    };
    
    const onSortChange = (newSortColumn, newSortDirection) => {
        loadAndRenderCoreTableData(tableName, DEFAULT_PAGE_OFFSET, newSortColumn, newSortDirection);
    };
    
    renderPaginatedTable(data, container, onPageChange, onSortChange);
}