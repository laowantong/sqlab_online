import { executeQuery } from '../../api/executeQuery.js';
import { showError } from '../../utils/genericUtils.js';
import { renderPaginatedTable, mayRecreateTableContainerIn } from './tables.js';
import { t } from '../../controllers/localizationController.js';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET } from '../../utils/constants.js';
import { getQueryEditor } from '../sqlEditor.js';

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
    executionTab.addEventListener('click', triggerExecutionOfNewQuery);

    async function triggerExecutionOfNewQuery() {
        const query = getQueryEditor().trim();
        if (!query) {
            showError(t('query.emptyError'), resultsContainer);
            return;
        }
        await runQueryAndRenderResults(query);
    }

    async function runQueryAndRenderResults(query, offset = DEFAULT_PAGE_OFFSET) {
        try {
            // Recreate the table structure if needed
            mayRecreateTableContainerIn(resultsContainer);

            // Execute the query and get the results
            const data = await executeQuery(query, offset, DEFAULT_PAGE_LIMIT);
            
            // Create a closure that handles page changes by re-running the same query with new offset
            const onPageChange = (newOffset) => {runQueryAndRenderResults(query, newOffset)};

            // Render the paginated table with results and page change handler
            renderPaginatedTable(data, resultsContainer, onPageChange);
        } catch (error) {
            showError(error.message, resultsContainer);
        }
    }
}
