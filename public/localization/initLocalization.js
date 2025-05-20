export async function initLocalization() {
    const selector = document.getElementById('language-selector');
    if (!selector) return;
    
    const i18n = window.i18n;
    // Make sure initialization is complete
    if (!i18n.isInitialized()) {
        await i18n.init();
    }

    selector.value = i18n.getCurrentLocale();
    applyTranslations();

    selector.addEventListener('change', async (e) => {
        await i18n.setLocale(e.target.value);
    });

    window.addEventListener('localeChanged', applyTranslations);
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) el.textContent = i18n.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) el.placeholder = i18n.t(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key) el.title = i18n.t(key);
    });

    const titleElement = document.querySelector('title[data-i18n]');
    if (titleElement) {
        const key = titleElement.getAttribute('data-i18n');
        if (key) document.title = i18n.t(key);
    }
}
