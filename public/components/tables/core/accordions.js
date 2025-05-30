import { fetchMetadata } from '../../../api/fetchMetadata.js';
import { showError, escapeHtml } from '../../../utils/genericUtils.js';
import { loadAndRenderCoreTableColumns } from './columns.js';
import { DEFAULT_PAGE_OFFSET } from '../../../utils/constants.js';

/***************************************************************************
 *      Code adapted from: https://github.com/TahaSh/drag-to-reorder       *
 *  https://tahazsh.com/blog/seamless-ui-with-js-drag-to-reorder-example/  *
 *             MIT License. Copyright (c) 2023 Taha Shashtari.             *
 ***************************************************************************/

/***********************
 *      Variables       *
 ***********************/

let listContainer;
let draggableItem;
let pointerStartX;
let pointerStartY;
let itemsGap = 0;
let items = [];
let prevRect = {};

/***********************
 *    Helper Functions   *
 ***********************/

function getAllItems() {
    if (!items?.length) {
        items = Array.from(listContainer.querySelectorAll('.js-accordion-item'));
    }
    return items;
}

function getIdleItems() {
    return getAllItems().filter((item) => item.classList.contains('is-idle'));
}

function isItemAbove(item) {
    return item.hasAttribute('data-is-above');
}

function isItemToggled(item) {
    return item.hasAttribute('data-is-toggled');
}

/***********************
 *   Accordion Setup    *
 ***********************/

/**
 * Loads and renders the list of core tables, passing their column names to each accordion item.
 * Initializes drag & drop functionality.
 * @returns {Promise<void>}
 */
export async function loadAndRenderCoreTableList() {
    const container = document.getElementById('accordions');
    container.innerHTML = '';

    try {
        const tableStructures = await fetchMetadata('table_structures');
        const tableNames = Object.keys(tableStructures);

        // Create the list container for drag & drop
        const accordionList = document.createElement('div');
        accordionList.className = 'accordion-list js-accordion-list';
        container.appendChild(accordionList);

        // For each table, create an accordion item
        tableNames.forEach(tableName => {
            const columns = tableStructures[tableName] || [];
            createAccordionItem(accordionList, tableName, columns);
        });

        // Initialize drag and drop after all items are created
        setupDragAndDrop();

    } catch (error) {
        showError(error.message, container);
    }
}

/**
 * Creates and appends a single accordion item for a table, with its columns as buttons.
 * @param {HTMLElement} container - The container to append the item to
 * @param {string} tableName - The name of the table
 * @param {Array} columns - The column names for the table
 */
function createAccordionItem(container, tableName, columns = []) {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item is-idle js-accordion-item';
    accordionItem.dataset.table = tableName;

    // We don't know the columns here, so leave them blank for now
    const tableOutline = document.createElement('div');
    tableOutline.className = 'table-outline js-drag-area';

    // Basic structure
    tableOutline.innerHTML = `
        <div class="toggle-icon js-toggle-icon"></div>
        <div class="outline-click-zone">
            <span class="table-name js-table-name insertable">${escapeHtml(tableName)}</span>
            <div class="columns-buttons" id="columns-${tableName}"></div>
        </div>
    `;

    // Creates the collapsible content area
    const paginatedTable = document.createElement('div');
    paginatedTable.id = `core-table-${tableName}`;
    paginatedTable.className = 'paginated-table';

    // Add click handling for the toggle icon
    const toggleIcon = tableOutline.querySelector('.js-toggle-icon');
    toggleIcon.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent event bubbling
        toggleAccordion(accordionItem, paginatedTable, tableName);
    });

    accordionItem.appendChild(tableOutline);
    accordionItem.appendChild(paginatedTable);
    container.appendChild(accordionItem);

    // Load column names for this table
    loadAndRenderCoreTableColumns(tableName, columns);

    // Add click handling (table name, column names...)
    window.sqlEditor.addClickToInsert(tableOutline);
}

/**
 * Toggles the accordion open/closed state
 * @param {HTMLElement} accordionItem - The accordion item element
 * @param {HTMLElement} paginatedTable - The content area element
 * @param {string} tableName - The table name
 */
function toggleAccordion(accordionItem, paginatedTable, tableName) {
    const isActive = paginatedTable.classList.contains('active');

    if (isActive) {
        paginatedTable.classList.remove('active');
        accordionItem.classList.remove('expanded');
    } else {
        paginatedTable.classList.add('active');
        accordionItem.classList.add('expanded');
        // Load table data when opening
        if (window.loadAndRenderCoreTableData) {
            window.loadAndRenderCoreTableData(tableName, DEFAULT_PAGE_OFFSET);
        }
    }
}

/***********************
 *   Drag & Drop Setup  *
 ***********************/

function setupDragAndDrop() {
    listContainer = document.querySelector('.js-accordion-list');

    if (!listContainer) return;

    listContainer.addEventListener('mousedown', dragStart);
    listContainer.addEventListener('touchstart', dragStart);

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
}

/***********************
 *     Drag Start      *
 ***********************/

function dragStart(e) {
    // Don't start drag if clicking on table name, toggle icon, or column buttons
    if (e.target.closest('.js-toggle-icon, .js-table-name, .column-name-btn')) {
        return;
    }

    // Check if clicked element is within a draggable area
    const dragArea = e.target.closest('.js-drag-area');
    if (!dragArea) {
        return;
    }

    // Update the global draggableItem variable
    draggableItem = dragArea.closest('.js-accordion-item');

    e.preventDefault();
    e.stopPropagation();

    pointerStartX = e.clientX || e.touches?.[0]?.clientX;
    pointerStartY = e.clientY || e.touches?.[0]?.clientY;

    setItemsGap();
    disablePageScroll();
    initDraggableItem();
    initItemsState();
    prevRect = draggableItem.getBoundingClientRect();

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
}

function setItemsGap() {
    if (getIdleItems().length <= 1) {
        itemsGap = 0;
        return;
    }

    const item1 = getIdleItems()[0];
    const item2 = getIdleItems()[1];

    const item1Rect = item1.getBoundingClientRect();
    const item2Rect = item2.getBoundingClientRect();

    itemsGap = Math.abs(item1Rect.bottom - item2Rect.top);
}

function disablePageScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
}

function initItemsState() {
    getIdleItems().forEach((item, i) => {
        if (getAllItems().indexOf(draggableItem) > i) {
            item.dataset.isAbove = '';
        }
    });
}

function initDraggableItem() {
    draggableItem.classList.remove('is-idle');
    draggableItem.classList.add('is-draggable');
}

/***********************
 *        Drag         *
 ***********************/

function drag(e) {
    if (!draggableItem) return;

    e.preventDefault();

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    const pointerOffsetX = clientX - pointerStartX;
    const pointerOffsetY = clientY - pointerStartY;

    draggableItem.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY}px)`;

    updateIdleItemsStateAndPosition();
}

function updateIdleItemsStateAndPosition() {
    const draggableItemRect = draggableItem.getBoundingClientRect();
    const draggableItemY = draggableItemRect.top + draggableItemRect.height / 2;

    // Update state
    getIdleItems().forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemY = itemRect.top + itemRect.height / 2;
        if (isItemAbove(item)) {
            if (draggableItemY <= itemY) {
                item.dataset.isToggled = '';
            } else {
                delete item.dataset.isToggled;
            }
        } else {
            if (draggableItemY >= itemY) {
                item.dataset.isToggled = '';
            } else {
                delete item.dataset.isToggled;
            }
        }
    });

    // Update position
    getIdleItems().forEach((item) => {
        if (isItemToggled(item)) {
            const direction = isItemAbove(item) ? 1 : -1;
            item.style.transform = `translateY(${direction * (draggableItemRect.height + itemsGap)
                }px)`;
        } else {
            item.style.transform = '';
        }
    });
}

/***********************
 *      Drag End       *
 ***********************/

function dragEnd(e) {
    if (!draggableItem) return;

    applyNewItemsOrder(e);
    cleanup();
}

function applyNewItemsOrder(e) {
    const reorderedItems = [];

    getAllItems().forEach((item, index) => {
        if (item === draggableItem) {
            return;
        }
        if (!isItemToggled(item)) {
            reorderedItems[index] = item;
            return;
        }
        const newIndex = isItemAbove(item) ? index + 1 : index - 1;
        reorderedItems[newIndex] = item;
    });

    for (let index = 0; index < getAllItems().length; index++) {
        const item = reorderedItems[index];
        if (typeof item === 'undefined') {
            reorderedItems[index] = draggableItem;
        }
    }

    reorderedItems.forEach((item) => {
        listContainer.appendChild(item);
    });

    draggableItem.style.transform = '';

    requestAnimationFrame(() => {
        const rect = draggableItem.getBoundingClientRect();
        const yDiff = prevRect.y - rect.y;
        const currentPositionX = e.clientX || e.changedTouches?.[0]?.clientX;
        const currentPositionY = e.clientY || e.changedTouches?.[0]?.clientY;

        const pointerOffsetX = currentPositionX - pointerStartX;
        const pointerOffsetY = currentPositionY - pointerStartY;

        draggableItem.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY + yDiff
            }px)`;
        requestAnimationFrame(() => {
            unsetDraggableItem();
        });
    });
}

function cleanup() {
    itemsGap = 0;
    items = [];
    unsetItemState();
    enablePageScroll();

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
}

function unsetDraggableItem() {
    draggableItem.style = null;
    draggableItem.classList.remove('is-draggable');
    draggableItem.classList.add('is-idle');
    draggableItem = null;
}

function unsetItemState() {
    getIdleItems().forEach((item, i) => {
        delete item.dataset.isAbove;
        delete item.dataset.isToggled;
        item.style.transform = '';
    });
}

function enablePageScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
}