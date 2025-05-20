// WARNING: This script needs to be loaded in the DOM prior to the main application.

/**
 * LocalizationService class
 * Handles the loading and management of localization files.
 * Provides methods for translating keys and setting the current locale.
 * Uses the browser's language settings and localStorage to manage user preferences.
 * Fallbacks to a default locale if the desired locale is not available.
 * Emits a custom event when the locale changes to allow other parts of the application to react.
 * Public methods:
 * - init: Initializes the localization service and sets the locale.
 * - setLocale: Sets the current locale and loads the corresponding translations.
 * - t: Translates a given key using the current locale's translations.
 * - getCurrentLocale: Returns the current locale.
 * - isReady: Returns whether the localization service is initialized.
 */
class LocalizationService {
    constructor() {
        this.translations = {};
        this.currentLocale = 'en';
        this.fallbackLocale = 'en';
        this.initialized = false;
        this.initPromise = null;
    }

    async init(defaultLocale = 'en') {
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                const browserLocale = navigator.language.split('-')[0];
                const stored = localStorage.getItem('locale');
                const locale = stored || browserLocale || defaultLocale;
                await this.setLocale(locale);
                console.log(`Localization ready: ${this.currentLocale}`);
            } catch (e) {
                console.error('Localization init failed:', e);
            }
            this.initialized = true;
        })();

        return this.initPromise;
    }

    async #loadTranslations(locale) { // Private method
        try {
            const res = await fetch(`./localization/locales/${locale}.json`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch {
            return locale !== this.fallbackLocale
                ? this.#loadTranslations(this.fallbackLocale)
                : {};
        }
    }

    async setLocale(locale) {
        this.translations = await this.#loadTranslations(locale);
        this.currentLocale = locale;
        localStorage.setItem('locale', locale);
        window.dispatchEvent(new CustomEvent('localeChanged', {
            detail: { locale, translations: this.translations }
        }));
    }

    t(key, params = {}) {
        const parts = key.split('.');
        let result = parts.reduce((o, p) => o?.[p], this.translations);
        if (typeof result !== 'string') return parts.at(-1);
        return result.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    }

    getCurrentLocale() {
        return this.currentLocale;
    }

    isInitialized() {
        return this.initialized;
    }
}

// Initialize the localization service and make it available globally
window.i18n = new LocalizationService();
