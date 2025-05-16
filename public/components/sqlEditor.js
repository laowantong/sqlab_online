/**
 * Creates a CodeMirror editor instance for SQL editing.
 * @param {string} containerId - ID of the textarea element
 * @returns {Object} Enhanced editor instance
 */
export function initSqlEditor(containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        throw new Error(`Element with id "${containerId}" not found`);
    }
    
    return CodeMirror.fromTextArea(container, {
        placeholder: container.getAttribute('placeholder')
    });
}
