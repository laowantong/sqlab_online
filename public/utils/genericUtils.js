/**
 * Escapes special HTML characters to prevent XSS attacks
 * @param {string} unsafe - Potentially dangerous string
 * @returns {string} - Safe escaped string
 */
export function escapeHtml(unsafe) {
    return String(unsafe ?? '').replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    })[m]);
}

/**
 * Shows an error message in a container
 * @param {string} message - Error message to display
 * @param {HTMLElement} containerElement - Container to show the error in
 */
export function showError(message, containerElement) {
    if (message.endsWith('Error')) {
        const translatedMessage = window.i18n.t(`error.${message}`);
        containerElement.innerHTML = `<div class="error" data-i18n="error.${message}">${escapeHtml(translatedMessage)}</div>`;
    } else {
        containerElement.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
    }
}

export function localizedInteger(value) {
    return value.toLocaleString(window.i18n.getCurrentLocale());
}

export function localizedAmount(amount) {
    const key = amount === 1 ? 'squalions.one' : 'squalions.other';
    amount = localizedInteger(amount);
    return window.i18n.t(key, { amount });
}
