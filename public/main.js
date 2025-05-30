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
    window.stakeSystem = initStakeSystem(window.currentActivityNumber);
    window.scoreVisualEffects = initScoreVisualEffects();

    initFeedback();

    window.loadAndRenderCoreTableList = loadAndRenderCoreTableList;
    window.loadAndRenderCoreTableData = loadAndRenderCoreTableData;

    // Automatically load core tables on page load
    window.loadAndRenderCoreTableList();

    // Load relational schema with current theme
    await loadAndRenderRelationalSchema(isDarkTheme);
});
