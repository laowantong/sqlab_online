import { fetchMetadata } from '../../../api/fetchMetadata.js';
import { showError, escapeHtml } from '../../../utils/genericUtils.js';
import { loadAndRenderCoreTableColumns } from './columns.js';
import { DRAG_END_DELAY, DEFAULT_PAGE_OFFSET } from '../../../utils/constants.js';

/**
 * Loads and renders a list of core tables with their column names
 * @returns {Promise<void>}
 */
export async function loadAndRenderCoreTableList() {
    const listContainer = document.getElementById('accordions');
    listContainer.innerHTML = '';
    try {
        const tableStructures = await fetchMetadata('table_structures');
        const tableNames = Object.keys(tableStructures);
    
        // For each table, create an accordion and load column names
        tableNames.forEach(tableName => {
            const tableAccordion = document.createElement('div');
            tableAccordion.className = 'accordion';
            tableAccordion.dataset.table = tableName; // set data-table attribute
    
            // Create the outline
            const tableOutline = document.createElement('div');
            tableOutline.className = 'table-outline';
            tableOutline.innerHTML = `
                <div class="table-name">${escapeHtml(tableName)}</div>
                <div class="table-columns" id="columns-${tableName}"></div>
            `;
    
            // Handle accordion open/close and lazy loading
            tableOutline.addEventListener('click', function () {
                if (window.dragging) return;
                paginatedTable.classList.toggle('active');
                if (paginatedTable.classList.contains('active')) {
                    window.loadAndRenderCoreTableData(tableName, DEFAULT_PAGE_OFFSET);
                }
            });
    
            // Create the collapsible content area
            const paginatedTable = document.createElement('div');
            paginatedTable.id = `core-table-${tableName}`;
            paginatedTable.className = 'paginated-table';

            tableAccordion.appendChild(tableOutline);
            tableAccordion.appendChild(paginatedTable);
            listContainer.appendChild(tableAccordion);
    
            // Load column names for this table
            loadAndRenderCoreTableColumns(tableName);

            initDragAndDrop();
        });
    } catch (error) {
        showError(error.message, listContainer);
    }
}

function initDragAndDrop() {
    const container = document.getElementById('accordions');
    window.dragging = false;

    // Add draggable attribute and listeners to headers only
    document.querySelectorAll('.table-outline').forEach(header => {
        const parentAccordion = header.closest('.accordion');

        header.setAttribute('draggable', 'true');
        header.addEventListener('dragstart', function (e) {
            window.dragging = true;
            parentAccordion.classList.add('dragging');
            e.dataTransfer.setData('text/plain', parentAccordion.dataset.table); // set data-table attribute
        });

        header.addEventListener('dragend', function () {
            parentAccordion.classList.remove('dragging');
            setTimeout(() => { window.dragging = false; }, DRAG_END_DELAY);
        });
    });

    container.addEventListener('dragover', function (e) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;

        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });

    container.addEventListener('drop', function (e) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            draggable.classList.remove('dragging');
        }
    });

    /**
     * Determines the element below the cursor for inserting the dragged item
     * @param {HTMLElement} container - The container where elements are dragged
     * @param {number} y - The vertical cursor position
     * @returns {HTMLElement|null} - The closest element to insert after
     */
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.accordion:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}