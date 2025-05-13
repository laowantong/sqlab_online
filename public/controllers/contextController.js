/**
 * Controller for handling adventure context, tasks, and verification
 * Manages the display of episode statements and feedback
 */
import { executeQuery } from '../api/executeQuery.js';
import { t } from './localizationController.js';

// Current episode state
let currentEpisode = null;
let currentFormula = null;

/**
 * Initializes the context and check functionality
 */
export function initContext() {
    // Get references to UI elements
    // const episodeContainer = document.getElementById('task-container');
    // const checkBtn = document.getElementById('check-btn');
    const controlContainer = document.getElementById('feedback-container');
    // const checkSolutionBtn = document.getElementById('check-solution-btn');
    
    // Initialize the context by attempting to load the first episode
    // loadEpisode(null);
    
    // Add event listener for check button (tab icon)
    // checkBtn.addEventListener('click', (e) => {
    //     e.stopPropagation(); // Prevent tab click from interfering
    //     checkSolution();
    // });
    
    // Add event listener for check solution button (in feedback tab)
    // if (checkSolutionBtn) {
    //     checkSolutionBtn.addEventListener('click', () => {
    //         checkSolution();
    //     });
    // }


    /**
     * Checks the current solution by executing the query and validating the token
     */
    async function checkSolution() {
        try {
            // Get the current query
            const queryInput = document.getElementById('query-input');
            const query = queryInput.value.trim();
            
            // Make sure we have a query
            if (!query) {
                controlContainer.innerHTML = `<div class="error">${t('query.emptyError')}</div>`;
                return;
            }
            
            // Check if it's a special decrypt query
            if (/^SELECT\s+decrypt\s*\(\s*\d+\s*\)/i.test(query)) {
                // It's already a decrypt query, just execute it directly
                const response = await executeQuery(query, 0, 10);
                
                // If we get a valid response with task/feedback, it was a valid token
                if (response.rows?.length > 0 && response.rows[0]?.length > 0) {
                    try {
                        const data = response.rows[0][0];
                        const episodeData = typeof data === 'string' ? JSON.parse(data) : data;
                        
                        if (episodeData.task || episodeData.feedback) {
                            // Update the state with new episode data
                            // loadEpisode(null); // Pass null to handle the already-loaded data
                            return;
                        }
                    } catch (error) {
                        console.error('Error parsing episode data during decrypt:', error);
                    }
                }
                
                // If we got here, the decrypt query didn't return a valid episode
                controlContainer.innerHTML = `<div class="error">Invalid token or decrypt command</div>`;
                return;
            }
            
            // Check if we have a formula for the current episode
            if (!currentFormula) {
                controlContainer.innerHTML = `<div class="error">${t('check.noFormula')}</div>`;
                return;
            }
            
            // Inject the formula into the query if it's not already there
            let enhancedQuery = query;
            if (!query.toLowerCase().includes(currentFormula.toLowerCase())) {
                enhancedQuery = addColumnToSelects(query, currentFormula);
                
                // Transparent formula injection - no UI update
                // queryInput.value = enhancedQuery;
            }
            
            // Execute the enhanced query
            const response = await executeQuery(enhancedQuery, 0, 10);
            
            // Display results in the execution tab first
            // const executeBtn = document.getElementById('execute-btn');
            // if (executeBtn) {
            //     executeBtn.click();
            // }
            
            // Look for token in results
            if (response.columns && response.rows?.length > 0) {
                // Find the token column index
                const tokenIndex = response.columns.findIndex(col => col.toLowerCase() === 'token');
                
                if (tokenIndex !== -1) {
                    // Get the token value from the first row
                    const token = response.rows[0][tokenIndex];
                    
                    if (token) {
                        // Success - load the next episode with this token
                        // loadEpisode(token);
                        return;
                    }
                }
                
                controlContainer.innerHTML = `<div class="error">${t('check.noTokenFound')}</div>`;
            } else {
                controlContainer.innerHTML = `<div class="error">${t('check.noTokenColumn')}</div>`;
            }
        } catch (error) {
            console.error('Error checking solution:', error);
            controlContainer.innerHTML = `<div class="error">${error.message}</div>`;
        }
    }
    
    // Add functions to window so they can be called from other modules
    window.checkSolution = checkSolution;
}