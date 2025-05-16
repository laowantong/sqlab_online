let editorInstance = null;

/**
 * Initializes the SQL editor with syntax highlighting
 */
export function initSqlEditor() {
    const queryInput = document.getElementById('query-input');
    editorInstance = CodeMirror.fromTextArea(queryInput, {
        placeholder: queryInput.getAttribute('placeholder')
    });
}

/**
 * Gets the current SQL query from the editor
 * @returns {string} The SQL query
 */
export function getQueryEditor() {
    if (editorInstance) {
        return editorInstance.getValue();
    }
    else {
        return '';
    }
}

