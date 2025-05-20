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
 */
export function renderPaginatedTable(data, container, onPageChange) {
    createPageStrip(container, data.offset, data.limit, data.total, onPageChange);
    const tableElement = container.querySelector('.table-content');
    const headers = generateTableHeaderRow(data.columns);
    const rows = generateTableRowsWithNumbers(data.rows, data.offset);
    tableElement.innerHTML = `<thead>${headers}</thead><tbody>${rows}</tbody>`;
    addClickToInsert(tableElement);
}

// All the remaining functions are private and not exported

/**
 * Generates an HTML table header row with an added row number column
 * and dynamic column headers.
 * @param {string[]} columnNames - An array of column names to be used as table headers
 * @returns {string} HTML string representing the table header row
 */
function generateTableHeaderRow(columnNames) {
    return [
        '<tr><th class="row-number-header"></th>',
        ...columnNames.map(column => `<th>${escapeHtml(column)}</th>`),
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
 * Adds click and double-click event listeners to all table cells with the 'insertable' class within the given table element.
 *
 * On single click, the cell's trimmed text content is inserted to the value of a global SQL editor (window.sqlEditor), if it exists.
 * On double-click, prevents the default text selection behavior.
 *
 * @param {HTMLElement} tableElement - The table element containing cells to which event listeners will be attached.
 */
function addClickToInsert(tableElement) {
    tableElement.querySelectorAll('td.insertable').forEach(cell => {
        cell.addEventListener('click', function () {
            const textToInsert = this.textContent.trim();

            if (window.sqlEditor) {
                const editor = window.sqlEditor;
                const cursor = editor.getCursor(); 
                editor.replaceRange(textToInsert, cursor); 

                this.classList.add('insert-success');
                setTimeout(() => {
                    this.classList.remove('insert-success');
                }, 300);
            }
        });

        // Prevents text selection on double-click
        cell.addEventListener('dblclick', function (e) {
            e.preventDefault();
        });
    });
}
