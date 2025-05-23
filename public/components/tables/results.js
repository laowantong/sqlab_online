import { executeQuery } from '../../api/executeQuery.js';
import { showError } from '../../utils/genericUtils.js';
import { renderPaginatedTable, mayRecreateTableContainerIn } from './tables.js';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET } from '../../utils/constants.js';

/**
 * Initializes the query execution functionality.
 * Sets up event listeners and prepares the UI components for query execution.
 * 
 * @function initQueryExecution
 * @returns {void}
 */
export function initQueryExecution() {
    const resultsContainer = document.getElementById('results-container');
    const executionTab = document.querySelector('.tab[data-tab="execution-tab"]');
    const checkContainer = document.getElementById('check-container');
    const refreshIcon = document.querySelector('[data-tab="execution-tab"] .refresh');
    const checkIcon = document.querySelector('[data-tab="execution-tab"] .check');
    const emptyIcon = document.querySelector('[data-tab="execution-tab"] .empty');
    const tabText = document.querySelector('[data-tab="execution-tab"] span');
    let executionListener = null;
    showEmptyState();
    window.sqlEditor.on('change', handleEditorChange);

    /**
     * Handles changes in the SQL editor.
     * - If the editor content is dirty (modified), updates the execution listener and hides the check button.
     * - If the query is empty, disables the execution listener and hides the check button.
     */
    function handleEditorChange() {
        const query = window.sqlEditor.getValue().trim();
        if (window.sqlEditor.isDirty) {
            updateExecutionListener(true);
            checkContainer.classList.add(('hidden'));
        }

        if (!query) {
            updateExecutionListener(false);
            checkContainer.classList.add(('hidden'));
            showEmptyState();
        }
    }

    /**
     * Enables or disables the execution listener for the execution tab.
     *
     * When enabled, attaches the `triggerExecutionOfNewQuery` function as a click event listener
     * to the `executionTab` element. When disabled, removes the event listener if it exists.
     *
     * @param {boolean} shouldEnable - Determines whether to enable (true) or disable (false) the execution listener.
     */
    function updateExecutionListener(shouldEnable) {
        if (shouldEnable && !executionListener) {
            executionListener = triggerExecutionOfNewQuery;
            executionTab.addEventListener('click', executionListener);

        } else if (!shouldEnable && executionListener) {
            executionTab.removeEventListener('click', executionListener);
            executionListener = null;
        }
        if (shouldEnable) {
            showRefreshIcon();
        }
    }

    /**
     * Executes the current SQL query from the editor, renders the results,
     * updates the editor's dirty state, and toggles the visibility of the
     * check container based on whether any rows are returned.
     *
     * @async
     * @function triggerExecutionOfNewQuery
     * @returns {Promise<void>} Resolves when the query execution and UI updates are complete.
     */
    async function triggerExecutionOfNewQuery() {
        const query = window.sqlEditor.getValue().trim();
        if (!query) {
            showError(window.i18n.t('query.emptyError'), resultsContainer);
            return;
        }
        const result = await runQueryAndRenderResults(query);
        window.sqlEditor.isDirty = false;
        updateExecutionListener(false);

        if (result.rows.length > 0) {
            showCheckIcon();
            checkContainer.classList.remove('hidden');
        }
        else {
            checkContainer.classList.add(('hidden'));
            checkIcon.classList.add('hidden');
            refreshIcon.classList.add('hidden');
            emptyIcon.classList.remove('hidden');
        }
    }

    /**
     * Executes a SQL query, handles pagination, and renders the results in a table.
     *
     * @async
     * @function
     * @param {string} query - The SQL query string to execute.
     * @param {number} [offset=DEFAULT_PAGE_OFFSET] - The offset for pagination (defaults to DEFAULT_PAGE_OFFSET).
     * @returns {Promise<Object|null>} The result data from the query, or null if an error occurs.
     */
    async function runQueryAndRenderResults(query, offset = DEFAULT_PAGE_OFFSET) {
        try {
            // Recreate the table structure if needed
            mayRecreateTableContainerIn(resultsContainer);

            // Execute the query and get the results
            const data = await executeQuery(query, offset, DEFAULT_PAGE_LIMIT);

            // Create a closure that handles page changes by re-running the same query with new offset
            const onPageChange = (newOffset) => { runQueryAndRenderResults(query, newOffset) };

            // Render the paginated table with results and page change handler
            renderPaginatedTable(data, resultsContainer, onPageChange);
            return data;
        } catch (error) {
            showError(error.message, resultsContainer);
            return null;
        }
    }

    /**
     * Hides the refresh and check icons, shows the empty icon,
     * and sets the tab text to indicate that the query is empty.
     */
    function showEmptyState() {
        checkIcon.classList.add('hidden');
        refreshIcon.classList.add('hidden');
        emptyIcon.classList.remove('hidden');
        tabText.textContent = window.i18n.t('tabs.emptyQuery');
    }

    /**
     * Hides the check and empty icons, shows the refresh icon,
     */
    function showRefreshIcon() {
        checkIcon.classList.add('hidden');
        emptyIcon.classList.add('hidden');
        refreshIcon.classList.remove('hidden');
        tabText.textContent = window.i18n.t('tabs.execution');
    }

    /**
    * Hides the refresh and empty icons, shows the check icon,
    */
    function showCheckIcon() {
        refreshIcon.classList.add('hidden');
        emptyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        tabText.textContent = window.i18n.t('tabs.execution');
    }
}
