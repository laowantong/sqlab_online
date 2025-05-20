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
                this.initialized = true;
                console.log(`Localization initialized: ${this.currentLocale}`);
            } catch (e) {
                console.error('Localization init failed:', e);
                this.initialized = true;
            }
        })();

        return this.initPromise;
    }

    async loadTranslations(locale) {
        try {
            const res = await fetch(`./localization/locales/${locale}.json`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch {
            return locale !== this.fallbackLocale
                ? this.loadTranslations(this.fallbackLocale)
                : {};
        }
    }

    async setLocale(locale) {
        this.translations = await this.loadTranslations(locale);
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

// Export a singleton instance of the LocalizationService
window.i18n = new LocalizationService();
