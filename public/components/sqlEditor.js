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
    
    const editor = CodeMirror.fromTextArea(
        container,
        {
            mode: 'text/x-sql',
            indentUnit: 2,
            tabSize: 2,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'Ctrl-Enter': () => document.querySelector('.tab[data-tab="execution-tab"]').click()
            }
        }
    );
    
    return editor;
}
