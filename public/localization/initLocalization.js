import { fetchUserData } from "../api/fetchUserData.js";
import { localizedInteger } from "../utils/genericUtils.js";

/**
 * Initializes localization and create the listener for language changes.
 * @returns {Promise<void>} - A promise that resolves when localization is initialized.
 */
export async function initLocalization() {

    const selector = document.getElementById('language-selector');
    if (!selector) return;
    
    const i18n = window.i18n;
    if (!i18n.isInitialized()) {
        await i18n.init();
    }

    selector.value = i18n.getCurrentLocale();
    selector.addEventListener('change', async (e) => {
        await i18n.setLocale(e.target.value);
    });

    async function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (!key) return;
            // Dynamically set the target property, defaulting to textContent
            const target = element.getAttribute('data-i18n-target') || 'textContent';
            element[target] = i18n.t(key);
        });
        window.sqlEditor.setOption('placeholder', window.i18n.t('query.placeholder'));
        const score = await fetchUserData('score');
        const scoreDisplay = document.getElementById('score-display');
        scoreDisplay.textContent = localizedInteger(score);
      }
    
    // Apply translations on initial load
    await applyTranslations();

    // Listen for locale changes and reapply translations
    window.addEventListener('localeChanged', applyTranslations);
}
