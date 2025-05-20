/**
 * Localization service for handling application translations
 * Provides methods for loading translations, switching languages, and retrieving localized texts
 */
class LocalizationService {
    /**
     * Creates a new instance of the localization service
     */
    constructor() {
        this.translations = {};
        this.currentLocale = 'en'; // Default locale
        this.fallbackLocale = 'en';
        this.initialized = false;
        this.initPromise = null;
    }

    /**
     * Initializes the localization service
     * @param {string} defaultLocale - The locale to use by default (e.g., 'en', 'fr')
     * @returns {Promise<void>} Promise that resolves when initialization is complete
     */
    async init(defaultLocale = 'en') {
        // If already initializing, return the existing promise
        if (this.initPromise) {
            return this.initPromise;
        }
        
        // Create and store the initialization promise
        this.initPromise = new Promise(async (resolve) => {
            try {
                // Try to get browser language, fallback to default
                const browserLocale = navigator.language.split('-')[0];
                
                // Set initial locale (stored preference, browser preference, or default)
                const initialLocale = localStorage.getItem('locale') || browserLocale || defaultLocale;
                
                await this.setLocale(initialLocale);
                
                this.initialized = true;
                console.log(`Localization initialized with locale: ${this.currentLocale}`);
                resolve();
            } catch (error) {
                console.error('Failed to initialize localization service:', error);
                this.initialized = true; // Mark as initialized even on error
                resolve(); // Resolve anyway to prevent hanging
            }
        });
        
        return this.initPromise;
    }

    /**
     * Loads translations for a specific locale
     * @param {string} locale - Locale code (e.g., 'en', 'fr')
     * @returns {Promise<Object>} - The loaded translations
     */
    async loadTranslations(locale) {
        try {
            const response = await fetch(`/locales/${locale}.json`);
            
            if (!response.ok) {
                console.warn(`Could not load translations for ${locale}, falling back to ${this.fallbackLocale}`);
                
                if (locale !== this.fallbackLocale) {
                    return this.loadTranslations(this.fallbackLocale);
                }
                
                return {};
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error loading translations for ${locale}:`, error);
            return {};
        }
    }

    /**
     * Changes the current locale and loads its translations
     * @param {string} locale - The new locale to use
     * @returns {Promise<boolean>} - Whether the locale change was successful
     */
    async setLocale(locale) {
        try {
            // Load translations for the new locale
            const translations = await this.loadTranslations(locale);
            
            // Update service state
            this.translations = translations;
            this.currentLocale = locale;
            
            // Save preference
            localStorage.setItem('locale', locale);
            
            // Trigger event for components to update
            window.dispatchEvent(new CustomEvent('localeChanged', { 
                detail: { locale, translations }
            }));
            
            return true;
        } catch (error) {
            console.error(`Failed to set locale to ${locale}:`, error);
            return false;
        }
    }

    /**
     * Gets the translation for the given key, with optional parameters
     * @param {string} key - The translation key (e.g., 'common.save')
     * @param {Object} params - Parameters to replace placeholders in the translation
     * @returns {string} - The translated string
     */
    t(key, params = {}) {
        // If not initialized yet, return the last part of the key as a more user-friendly fallback
        if (!this.initialized && Object.keys(this.translations).length === 0) {
            const keyParts = key.split('.');
            return keyParts[keyParts.length - 1] || key;
        }
        
        // Navigate through the nested translation object
        const keyParts = key.split('.');
        let translation = this.translations;
        
        for (const part of keyParts) {
            translation = translation?.[part];
            
            if (translation === undefined) {
                console.warn(`Translation key not found: ${key}`);
                // Return the last part of the key as a more user-friendly fallback
                return keyParts[keyParts.length - 1] || key;
            }
        }
        
        // Replace parameters in the format {paramName}
        if (typeof translation === 'string' && Object.keys(params).length > 0) {
            return translation.replace(/{(\w+)}/g, (match, paramName) => {
                return params[paramName] !== undefined ? params[paramName] : match;
            });
        }
        
        return translation;
    }

    /**
     * Gets the current locale code
     * @returns {string} - Current locale code (e.g., 'en', 'fr')
     */
    getCurrentLocale() {
        return this.currentLocale;
    }
    
    /**
     * Checks if the service has been initialized
     * @returns {boolean} - Whether the service has been initialized
     */
    isInitialized() {
        return this.initialized;
    }
}

// Export a singleton instance
window.i18n = new LocalizationService();