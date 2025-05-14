import { escapeHtml } from '../../utils/genericUtils.js';
import { createPageStrip } from '../strips/pages.js';
import { t } from '../../controllers/localizationController.js';

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
    createPageStrip( container, data.offset, data.limit, data.total, onPageChange);
    const tableElement = container.querySelector('.table-content');
    const headers = generateTableHeaderRow(data.columns);
    const rows = generateTableRowsWithNumbers(data.rows, data.offset);
    tableElement.innerHTML = `<thead>${headers}</thead><tbody>${rows}</tbody>`;
    addCopyEventListeners(tableElement);
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
            return `<td class="copyable" title="${t('table.clickToCopy')}">${content}</td>`;
        });
        rowsHtml.push(`<tr><td class="row-number">${offset + i + 1}</td>${cells.join('')}</tr>`);
    });
    return rowsHtml.join('');
}

/**
 * Adds click-to-copy event listeners to copyable cells in a table
 * @param {HTMLElement} tableElement - The table element containing copyable cells
 */
function addCopyEventListeners(tableElement) {
    tableElement.querySelectorAll('td.copyable').forEach(cell => {
        cell.addEventListener('click', async function(e) {
            // Get the text content of the cell
            const textToCopy = this.textContent.trim();
            
            try {
                // Try to use the clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    // Fallback for older browsers
                    const success = fallbackCopyTextToClipboard(textToCopy);
                    if (!success) throw new Error('Fallback copying failed');
                }
                
                // Visual feedback that copying was successful - using classes instead of inline styles
                this.classList.add('copy-success');
                
                setTimeout(() => {
                    this.classList.remove('copy-success');
                }, 300);
                
            } catch (err) {
                console.error('Failed to copy text: ', err);
                
                // Visual feedback that copying failed - using classes instead of inline styles
                this.classList.add('copy-error');
                
                setTimeout(() => {
                    this.classList.remove('copy-error');
                }, 300);
            }
            
            // Prevent default action and propagation
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Prevent text selection on double click
        cell.addEventListener('dblclick', function(e) {
            e.preventDefault();
        });
    });
}

/**
 * Fallback method for browsers that don't support the Clipboard API
 * @param {string} text - Text to copy to clipboard
 * @returns {boolean} - Whether the operation was successful
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback: Copying text failed', err);
    }
    
    document.body.removeChild(textArea);
    return successful;
}
