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
    const executedIcon = document.querySelector('[data-tab="execution-tab"] .executed');
    const emptyIcon = document.querySelector('[data-tab="execution-tab"] .empty');
    window.sqlEditor.on('change', handleEditorChange);

    /**
     * Set the behavior to trigger when the SQL editor content changes.
     * 
     * Depending on whether this content is empty or not, it will:
     * - Add or remove the event listener for executing the query when the execution tab
     *   is clicked. Note that adding an event listener already registered does nothing,
     *   and removing an event listener not registered does nothing either.
     * - Set the tab icon to either the refresh or empty icon.
     * 
     * In both cases, hide the controls for checking the query.
     */
    function handleEditorChange() {
        if (window.sqlEditor.getValue().trim()) {
            executionTab.addEventListener('click', triggerExecutionOfNewQuery);
            setTabIconTo(refreshIcon);
        } else {
            executionTab.removeEventListener('click', triggerExecutionOfNewQuery);
            setTabIconTo(emptyIcon);
        }

        // The query cannot be checked as long as it has not been executed
        checkContainer.classList.remove('data-check-failed-for')
        checkContainer.classList.add(('hidden'));
    }

    /**
     * Shows the given icon and hides the others.
     * @param {HTMLElement} iconToShow - The icon element to show.
     */
    function setTabIconTo(iconToShow) {
        executedIcon.classList.toggle('hidden', executedIcon !== iconToShow);
        refreshIcon.classList.toggle('hidden', refreshIcon !== iconToShow);
        emptyIcon.classList.toggle('hidden', emptyIcon !== iconToShow);
    }

    /**
     * Executes the current SQL query from the editor, renders the results,
     * removes the event listener for further executions, and updates the UI.
     *
     * @async
     * @function triggerExecutionOfNewQuery
     * @returns {Promise<void>} Resolves when the query execution and UI updates are complete.
     */
    async function triggerExecutionOfNewQuery() {
        let query = window.sqlEditor.getValue().trim();
        query = sqlFormatter.format(query, {
            language: 'mysql',
            tabWidth: 2,
            keywordCase: 'upper',
            dataTypeCase: 'upper',
            functionCase: 'lower',
            linesBetweenQueries: 2,
        });
        if (window.localStorage.getItem('formatSqlInEditor') === 'true') {
            window.sqlEditor.setValue(query);
        }

        const result = await runQueryAndRenderResults(query);
        executionTab.removeEventListener('click', triggerExecutionOfNewQuery);
        setTabIconTo(executedIcon);

        // Display the check container iff the execution has returned a non-empty result set
        checkContainer.classList.toggle('hidden', !result || result.rows.length === 0);

        // Remove the mark indicating that the check has failed for this activity/task.
        checkContainer.classList.remove('data-check-failed-for');
    }

    /**
     * Executes a SQL query, renders the results and handles pagination,
     * which means re-running this function on the same query with a new offset.
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
            const changePage = (newOffset) => { runQueryAndRenderResults(query, newOffset) };

            // Render the paginated table with results and page change handler
            renderPaginatedTable(data, resultsContainer, changePage);
            return data;

        } catch (error) {
            showError(error.message, resultsContainer);
            return null;
        }
    }

}
