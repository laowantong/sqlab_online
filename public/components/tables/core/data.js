import { fetchCoreTableData } from '../../../api/fetchCoreTableData.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../../../utils/constants.js';
import { escapeHtml } from '../../../utils/genericUtils.js';
import { mayRecreateTableContainerIn, renderPaginatedTable } from '../tables.js';

/**
 * Loads and renders the data for a specific core table, including pagination and sorting controls.
 * Also ensures the columns are updated in the outline header if needed.
 *
 * @param {string} tableName - The name of the table
 * @param {number} offset - The starting index for pagination (default: DEFAULT_PAGE_OFFSET)
 * @param {string|null} sortColumn - Column to sort by (optional)
 * @param {string} sortDirection - Sort direction ('ASC' or 'DESC', default: 'ASC')
 */
export async function loadAndRenderCoreTableData(tableName, offset = DEFAULT_PAGE_OFFSET, sortColumn = null, sortDirection = 'ASC') {
    const data = await fetchCoreTableData(tableName, offset, DEFAULT_PAGE_LIMIT, sortColumn, sortDirection);

    // Recreate the table structure if needed
    const container = document.getElementById(`core-table-${tableName}`);
    mayRecreateTableContainerIn(container);

    // Render the table data with pagination and sorting
    const changePage = (newOffset) => { 
        loadAndRenderCoreTableData(tableName, newOffset, sortColumn, sortDirection);
    };
    
    const changeSort = (newSortColumn, newSortDirection) => {
        loadAndRenderCoreTableData(tableName, DEFAULT_PAGE_OFFSET, newSortColumn, newSortDirection);
    };
    
    renderPaginatedTable(data, container, changePage, changeSort);
}