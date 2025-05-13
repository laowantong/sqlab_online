/**
 * Controller for handling localization in the UI
 * Manages language selection and applying translations to DOM elements
 */

/**
 * Initializes language selection and localization functionality
 * Sets up event listeners and applies initial translations
 */
export function initLocalization() {
    // Get reference to the language selector
    const languageSelector = document.getElementById('language-selector');
    
    // Set initial value of selector to current locale
    languageSelector.value = window.i18n.getCurrentLocale();
    
    // Apply initial translations to the page
    applyTranslations();
    
    // Handle language change from the selector
    languageSelector.addEventListener('change', async (event) => {
        const newLocale = event.target.value;
        await window.i18n.setLocale(newLocale);
    });
    
    // Listen for locale changes from other sources
    window.addEventListener('localeChanged', () => {
        applyTranslations();
    });
}

/**
 * Applies translations to all elements with data-i18n attributes
 * Updates text content, placeholders, and title attributes based on translation keys
 */
function applyTranslations() {
    // Find all elements with data-i18n attribute (for text content)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        if (key) {
            element.textContent = window.i18n.t(key);
        }
    });
    
    // Find all elements with data-i18n-placeholder attribute (for input placeholders)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        
        if (key) {
            element.placeholder = window.i18n.t(key);
        }
    });
    
    // // Find all elements with data-i18n-title attribute (for tooltips)
    // document.querySelectorAll('[data-i18n-title]').forEach(element => {
    //     const key = element.getAttribute('data-i18n-title');
        
    //     if (key) {
    //         element.title = window.i18n.t(key);
    //     }
    // });
    
    // // Update HTML document title if needed
    // const titleElement = document.querySelector('title[data-i18n]');
    // if (titleElement) {
    //     const key = titleElement.getAttribute('data-i18n');
    //     if (key) {
    //         document.title = window.i18n.t(key);
    //     }
    // }
}

/**
 * Translates a string using the i18n service
 * Helper function to use in JavaScript files
 * 
 * @param {string} key - Translation key (e.g., 'common.save')
 * @param {Object} params - Parameters for the translation (for placeholders)
 * @returns {string} - Translated string
 */
export function t(key, params = {}) {
    return window.i18n.t(key, params);
}

/**
 * Gets the current locale code
 * @returns {string} - Current locale code (e.g., 'en', 'fr')
 */
export function getCurrentLocale() {
    return window.i18n.getCurrentLocale();
}