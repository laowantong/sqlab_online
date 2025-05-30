import { escapeHtml } from '../../utils/genericUtils.js';
import { createPageStrip } from '../strips/pages.js';

// Description: common functions for both core table and results table rendering

/**
 * Checks if the paginated table contains an element with the class 'table-container'.
 * It is absent at initialization or when the result of the previous SQL query was an error.
 * In such cases, the required structure is created inside the container.
 * Otherwise, a flash of empty table is avoided by doing nothing.
 * @param {HTMLElement} container
 * @returns {void}
 */
export function mayRecreateTableContainerIn(container) {
    if (!container.querySelector('.table-container')) {
        container.innerHTML = `
            <div class="table-container">
                <table class="table-content"></table>
            </div>
        `;
    }
}

/**
 * Renders a complete table with pagination, header and rows
 * @param {Object} data - Table data with columns, rows and pagination metadata
 * @param {HTMLElement} container - Container element for the table
 * @param {Function} onPageChange - Callback for pagination changes
 * @param {Function} onSortChange - Callback for sorting changes (optional)
 */
export function renderPaginatedTable(data, container, onPageChange, onSortChange = null) {
    if (data.offset === 0) {
        // Avoid resetting the strip to the leftmost position if it already exists
        createPageStrip(container, data.offset, data.limit, data.total, onPageChange);
    };
    const tableElement = container.querySelector('.table-content');
    const headers = generateTableHeaderRow(data.columns);
    const rows = generateTableRowsWithNumbers(data.rows, data.offset);
    tableElement.innerHTML = `<thead>${headers}</thead><tbody>${rows}</tbody>`;
    window.sqlEditor.addClickToInsert(tableElement);

    if (onSortChange) {
        addSortingEvents(tableElement, onSortChange);
        if (data.sortColumn) {
            updateSortVisual(tableElement, data.sortColumn, data.sortDirection);
        }
    }
}

// All the remaining functions are private and not exported

/**
 * Generates an HTML table header row with an added row number column
 * and dynamic column headers - ALL sortable.
 * @param {string[]} columnNames - An array of column names to be used as table headers
 * @returns {string} HTML string representing the table header row
 */
function generateTableHeaderRow(columnNames) {
    return [
        '<tr><th class="row-number-header"></th>',
        ...columnNames.map(column => `<th class="sortable" data-column="${escapeHtml(column)}">${escapeHtml(column)}</th>`),
        '</tr>'
    ].join('')
}

/**
 * Generates HTML table rows with numbered rows and copyable cell contents.
 * @param {Array<Array<string|number|null>>} rows - 2D array of table row data
 * @param {number} [offset] - Offset for row numbering
 * @returns {string} HTML string representing the table rows
 */
function generateTableRowsWithNumbers(rows, offset) {
    const rowsHtml = [];
    rows.forEach((row, i) => {
        const cells = row.map(cell => {
            const content = cell !== null ? escapeHtml(cell) : 'NULL';
            return `<td class="insertable" data-i18n="table.clickToInsert" data-i18n-target="title" title="${window.i18n.t('table.clickToInsert')}">${content}</td>`;
        });
        rowsHtml.push(`<tr><td class="row-number">${offset + i + 1}</td>${cells.join('')}</tr>`);
    });
    return rowsHtml.join('');
}

/**
 * Attaches click event listeners to sortable table headers.
 * Updates the table's dataset with the current sort column and direction,
 * toggles sorting state (ASC, DESC, or none), updates visual indicators,
 * and invokes a callback when the sort state changes.
 *
 * @param {HTMLElement} tableElement - The table element containing sortable headers.
 * @param {function(string|null, string|null): void} onSortChange - Callback invoked when the sort state changes.
 *        Receives the column name and direction ('ASC', 'DESC', or null if sorting is removed).
 */
function addSortingEvents(tableElement, onSortChange) {
    tableElement.querySelectorAll('th.sortable').forEach(header => {
        header.addEventListener('click', function () {
            const columnName = this.dataset.column;
            const currentSortColumn = tableElement.dataset.sortColumn;
            const currentSortDirection = tableElement.dataset.sortDirection || 'ASC';
            let newDirection, removeSort = false;

            if (currentSortColumn === columnName && currentSortDirection === 'ASC') {
                newDirection = 'DESC';
            } else if (currentSortColumn === columnName && currentSortDirection === 'DESC') {
                removeSort = true;
            } else {
                newDirection = 'ASC';
            }

            if (removeSort) {
                delete tableElement.dataset.sortColumn;
                delete tableElement.dataset.sortDirection;
                updateSortVisual(tableElement, null, null);
                onSortChange(null, null);
            } else {
                tableElement.dataset.sortColumn = columnName;
                tableElement.dataset.sortDirection = newDirection;
                updateSortVisual(tableElement, columnName, newDirection);
                onSortChange(columnName, newDirection);
            }
        });
    });
}


/**
 * Updates the visual indicators for sorting on a table's header columns.
 *
 * Removes any existing sort direction indicators from all sortable headers,
 * then sets the sort direction attribute on the currently sorted column.
 *
 * @param {HTMLElement} tableElement - The table element containing the headers to update.
 * @param {string} sortColumn - The column identifier to mark as sorted.
 * @param {'asc'|'desc'} sortDirection - The direction of sorting ('asc' for ascending, 'desc' for descending).
 */
function updateSortVisual(tableElement, sortColumn, sortDirection) {
    tableElement.querySelectorAll('th.sortable').forEach(th => {
        th.removeAttribute('data-direction');
    });

    if (sortColumn && sortDirection) {
        const activeHeader = tableElement.querySelector(`th[data-column="${sortColumn}"]`);
        if (activeHeader) {
            activeHeader.setAttribute('data-direction', sortDirection);
        }
    }
}
