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
 * Enables sortable column headers on the given table element.
 * Handles 3-state sorting (asc, desc, none) and updates row order and visual cues.
 *
 * @param {HTMLElement} tableElement - The table DOM element containing the header and rows.
 * @param {Object} data - The table data (with original rows).
 * @param {number} offset - The row offset for numbering.
 */
function makeColumnsSortable(tableElement, data, offset) {
    let currentSort = {
        columnIndex: null,
        direction: null // 'asc', 'desc', or null
    };

    tableElement.querySelectorAll('th.sortable-header').forEach(th => {
        th.addEventListener('click', () => {
            const index = parseInt(th.dataset.index, 10);

            // Determine the new sorting direction
            if (currentSort.columnIndex === index) {
                if (currentSort.direction === 'asc') {
                    currentSort.direction = 'desc';
                } else if (currentSort.direction === 'desc') {
                    currentSort.columnIndex = null;
                    currentSort.direction = null;
                } else {
                    currentSort.direction = 'asc';
                }
            } else {
                currentSort.columnIndex = index;
                currentSort.direction = 'asc';
            }

            // Sort the data locally
            const sortedRows = [...data.rows];
            if (currentSort.direction) {
                sortedRows.sort((a, b) => {
                    const valA = a[index];
                    const valB = b[index];
                    if (valA === null) return 1;
                    if (valB === null) return -1;
                    if (valA === valB) return 0;
                    return currentSort.direction === 'asc'
                        ? valA > valB ? 1 : -1
                        : valA < valB ? 1 : -1;
                });
            }

            // Update the display
            const rows = generateTableRowsWithNumbers(sortedRows, offset);
            tableElement.querySelector('tbody').innerHTML = rows;
            addClickToInsert(tableElement); // Re-ajoute les événements sur les nouvelles cellules

            // Update the styles
            tableElement.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            if (currentSort.columnIndex !== null) {
                const th = tableElement.querySelector(`th[data-index="${currentSort.columnIndex}"]`);
                th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    });
}


/**
 * Renders a complete table with pagination, header and rows
 * @param {Object} data - Table data with columns, rows and pagination metadata
 * @param {HTMLElement} container - Container element for the table
 * @param {Function} onPageChange - Callback for pagination changes
 * @param {Function} onPageChange - Function called when the page changes.
 */
export function renderPaginatedTable(data, container, onPageChange) {
    createPageStrip(container, data.offset, data.limit, data.total, onPageChange);

    const tableElement = container.querySelector('.table-content');
    const headers = generateTableHeaderRow(data.columns);
    const rows = generateTableRowsWithNumbers(data.rows, data.offset);
    tableElement.innerHTML = `<thead>${headers}</thead><tbody>${rows}</tbody>`;

    addClickToInsert(tableElement);
    makeColumnsSortable(tableElement, data, data.offset);
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
        ...columnNames.map((column, index) =>
            `<th class="sortable-header" data-index="${index}">${escapeHtml(column)}</th>`),
        '</tr>'
    ].join('');
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
