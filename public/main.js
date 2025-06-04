import { loadAndRenderActivityTitle } from './components/activityTitle.js';
import { loadAndRenderTableOfContents } from './components/toc.js';
import { loadAndRenderRelationalSchema } from './components/relationalSchema.js';
import { loadAndRenderCoreTableList } from './components/tables/core/accordions.js';
import { loadAndRenderCoreTableData } from './components/tables/core/data.js';

import { initTabs } from './components/tabs.js';
import { initQueryExecution } from './components/tables/results.js';
import { initNotes } from './components/notes.js';
import { createTaskStrip } from './components/strips/tasks.js';
import { initFeedback } from './components/feedback.js';
import { initThemeToggle } from './components/menu/themeToggle.js';
import { initHamburgerMenu } from './components/menu/hamburger.js';
import { initSqlFormattingOption } from './components/menu/formatToggle.js';
import { TEMP_STARTING_ACTIVITY } from './utils/constants.js';
import { initSqlEditor } from './components/sqlEditor.js';

import { initLocalization } from './localization/initLocalization.js';
import { initStakeSystem } from './components/score/stakeSystem.js';
import { initScoreVisualEffects } from './components/score/visualEffects.js';
window.i18n.init().catch(err => console.error('Failed to initialize localization:', err));

document.addEventListener('DOMContentLoaded', async () => {

    // Reset the local storage for testing purposes. TODO: remove this line in production
    localStorage.clear();

    window.currentActivityNumber = TEMP_STARTING_ACTIVITY;

    window.sqlEditor = initSqlEditor('sql-editor'); // before initLocalization
    initLocalization();

    await loadAndRenderActivityTitle();
    await loadAndRenderTableOfContents();


    // Load the settings
    const isDarkTheme = initThemeToggle();
    initSqlFormattingOption(); // before initQueryExecution
    initHamburgerMenu();


    // Initialize core components: tabs, query handling, and core tables
    initTabs();
    document.querySelector('.tab[data-tab="schema-tab"]').click();
    initQueryExecution(); // after initSqlFormattingOption
    initNotes();

    // Initialize the task strip and simulate a click on the active button
    window.taskStrip = await createTaskStrip();
    window.taskStrip.getActiveButton().click();
    window.stakeSystem = await initStakeSystem();
    window.scoreVisualEffects = initScoreVisualEffects();

    initFeedback();

    window.loadAndRenderCoreTableList = loadAndRenderCoreTableList;
    window.loadAndRenderCoreTableData = loadAndRenderCoreTableData;

    // Automatically load core tables on page load
    window.loadAndRenderCoreTableList();

    // Load relational schema with current theme
    await loadAndRenderRelationalSchema(isDarkTheme);
});

/**
 * SERVICE WORKER SETUP FOR OFFLINE CDN CACHING
 * 
 * Problem: When developing on the go, connection may show as "connected" but
 * actually lack internet access, causing external CDN resources to fail loading
 * and breaking the app (CodeMirror, SQL formatter, etc.).
 * 
 * Solution: Service worker implements cache-first strategy for external dependencies:
 * 1. On first load (with internet): Downloads and caches all CDN resources
 * 2. On subsequent loads: Serves from cache first, network as fallback
 * 3. Cache versioning: Updates cache when service worker version changes
 * 
 * Flow:
 * - Register service worker after page load to avoid blocking initial render
 * - Service worker intercepts fetch requests for our specific CDN URLs
 * - Cache-first: Check cache → serve if found → otherwise fetch from network
 * - Network responses are cached for future offline use
 * - Failed network requests return error response instead of breaking app
 * 
 * Cache Management:
 * - Cache name includes version for easy updates/invalidation
 * - Old caches are automatically cleaned up on service worker activation
 * - Manual cache update function available for development/debugging
 * 
 * Browser Support: All modern browsers support service workers
 * Graceful degradation: App works normally if service workers unavailable
 */

if ('serviceWorker' in navigator) {
    // Register after page load to avoid blocking initial render
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./serviceWorker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New service worker installed, refresh to update');
                            // Optionally show a notification to user about update
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
    
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', event => {
        console.log('Message from service worker:', event.data);
    });
}

/**
 * MANUAL CACHE UPDATE FUNCTION
 * 
 * Forces immediate download and caching of all external CDN resources.
 * Useful for development, testing, and ensuring cache is populated.
 * 
 * When to use:
 * - Before going offline/traveling to ensure all resources are cached
 * - After updating external library versions in HTML
 * - When troubleshooting cache-related issues
 * - For testing offline functionality in development
 * 
 * Usage examples:
 * - Browser console: updateCache()
 * - Add button in dev UI: <button onclick="updateCache()">Update Cache</button>
 * - Call programmatically: await updateCache()
 * 
 * Note: Service worker normally handles caching automatically on first visit,
 * but this function allows manual control when needed.
 * 
 * Returns: Promise that resolves when caching complete or rejects on error
 */

async function updateCache() {
    if ('serviceWorker' in navigator && 'caches' in window) {
        try {
            const cache = await caches.open('sqlab-cache-v1');
            const resources = [
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/sql/sql.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/display/placeholder.min.js',
                'https://unpkg.com/sql-formatter@15.6.2/dist/sql-formatter.min.js'
            ];
            
            await cache.addAll(resources);
            console.log('Cache updated manually');
        } catch (error) {
            console.error('Failed to update cache:', error);
        }
    }
}
