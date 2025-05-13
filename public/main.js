import { loadAndRenderActivityTitle } from './components/activityTitle.js';
import { loadAndRenderRelationalSchema } from './components/relationalSchema.js';
import { loadAndRenderCoreTableList } from './components/tables/core/accordions.js';
import { loadAndRenderCoreTableData } from './components/tables/core/data.js';
import { loadAndRenderSecretMessage } from './components/secretMessage.js';

import { initTabs } from './controllers/tabController.js';
import { initQueryExecution } from './components/tables/results.js';
import { initNotes } from './components/notes.js';
import { initLocalization } from './controllers/localizationController.js';
import { initContext } from './controllers/contextController.js';

// Initialize localization service immediately
window.i18n.init().catch(err => console.error('Failed to initialize localization:', err));

document.addEventListener('DOMContentLoaded', async () => {
    // Make sure localization is initialized first
    try {
        // If initialization hasn't completed yet, await it
        if (!window.i18n.initialized) {
            await window.i18n.initPromise;
        }

        // Initialize the UI components that handle localization
        initLocalization();
    } catch (error) {
        console.error('Error initializing localization:', error);
    }

    await loadAndRenderActivityTitle();

    // Initialize core components: tabs, query handling, and core tables
    initTabs();
    initQueryExecution();
    initNotes();
    // initContext();
    await loadAndRenderSecretMessage(199627676565263);

    window.loadAndRenderCoreTableList = loadAndRenderCoreTableList;
    window.loadAndRenderCoreTableData = loadAndRenderCoreTableData;

    // Automatically load core tables on page load
    window.loadAndRenderCoreTableList();
    document.querySelector('.tab[data-tab="core-tables-tab"]').click();
   
    // Theme toggle handling
    const themeToggle = document.getElementById('toggle-theme');
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    // Apply stored theme preference
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    }
    await loadAndRenderRelationalSchema(isDarkTheme);

    // Toggle dark/light theme and save preference
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');

        // Save user preference
        localStorage.setItem('darkTheme', isDark);

        // Update icon based on theme
        if (isDark) {
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        } else {
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        };

        // Reload relational schema with the new theme
        loadAndRenderRelationalSchema(isDark);
    });

    // Hamburger menu handling
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (menuToggle && dropdownMenu) {
        // Toggle dropdown menu visibility on hamburger icon click
        menuToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent immediate closing
            dropdownMenu.classList.toggle('active');

            // Optional icon rotation for visual feedback
            menuToggle.style.transform = dropdownMenu.classList.contains('active')
                ? 'rotate(90deg)'
                : 'rotate(0)';
        });

        // Close the menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.hamburger-menu') && dropdownMenu.classList.contains('active')) {
                dropdownMenu.classList.remove('active');
                menuToggle.style.transform = 'rotate(0)';
            }
        });
    }
});




