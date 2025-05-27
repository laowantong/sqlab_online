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
    createPageStrip(container, data.offset, data.limit, data.total, onPageChange);
    const tableElement = container.querySelector('.table-content');
    const headers = generateTableHeaderRow(data.columns);
    const rows = generateTableRowsWithNumbers(data.rows, data.offset);
    tableElement.innerHTML = `<thead>${headers}</thead><tbody>${rows}</tbody>`;
    addClickToInsert(tableElement);

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
 * Inserts the given text at the current cursor position in the global SQL editor (window.sqlEditor).
 * Optionally adds a temporary highlight effect to the provided element for user feedback.
 *
 * @param {string} text - The text to insert into the editor.
 * @param {HTMLElement|null} elementToHighlight - (Optional) The element to temporarily highlight after insertion.
 */
function insertTextInEditor(text, elementToHighlight = null) {
    if (window.sqlEditor) {
        const editor = window.sqlEditor;
        const cursor = editor.getCursor();
        editor.replaceRange(text, cursor);

        if (elementToHighlight) {
            elementToHighlight.classList.add('insert-success');
            setTimeout(() => {
                elementToHighlight.classList.remove('insert-success');
            }, 300);
        }
    }
}

/**
 * Adds click and double-click event listeners for insertion into the SQL editor.
 * Uses insertTextInEditor as a helper to do the insertion and highlight.
 *
 * - On single click on a table cell with class 'insertable', inserts its trimmed text content into the SQL editor.
 * - On click on the blue outline zone (excluding column buttons, drag handle, and toggle icon), inserts the table name.
 * - On click on a column button ('.column-name-btn'), inserts the column name.
 * - On double-click of an insertable cell, prevents default text selection.
 *
 * @param {HTMLElement} element - The root element (table or outline) containing the targets for event listeners.
 * @param {object} [options={}] - Options for insertion (may contain tableName).
 * @param {string} [options.tableName=null] - The name of the table to insert when the blue outline is clicked.
 */
export function addClickToInsert(element, options = {}) {

    const tableName = options.tableName || null;

    // For cells
    element.querySelectorAll('td.insertable').forEach(cell => {
        cell.addEventListener('click', function () {
            insertTextInEditor(this.textContent.trim(), this);
        });
        cell.addEventListener('dblclick', function (e) { e.preventDefault(); });
    });

    // For clickable blue zone (not on column/drag/toggle)
    const outlineZone = element.querySelector('.outline-click-zone');
    if (outlineZone && tableName) {
        outlineZone.addEventListener('click', function (e) {
            if (e.target.classList.contains('column-name-btn') ||
                e.target.classList.contains('js-drag-handle') ||
                e.target.classList.contains('js-toggle-icon')
            ) return;
            insertTextInEditor(tableName, outlineZone);
        });
    }

    //For column buttons
    element.querySelectorAll('.column-name-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            insertTextInEditor(this.textContent.trim(), this);
        });
    });
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
