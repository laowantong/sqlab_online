import { t } from '../controllers/localizationController.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';

/**
 * Sends a SQL query to the backend for execution with pagination
 * @param {string} query - SQL query to execute
 * @param {number} offset - Starting row index for pagination
 * @param {number} limit - Number of rows to retrieve
 * @returns {Promise<Object>} - Resolves with the query results and pagination metadata
 */
export async function executeQuery(query, offset = DEFAULT_PAGE_OFFSET, limit = DEFAULT_PAGE_LIMIT) {
    const response = await fetch('/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, offset, limit })
    });

    // If the request failed, throw an error with the message from the backend
    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || t('database.fetchError', { status: response.status }));
    }

    return response.json();
}