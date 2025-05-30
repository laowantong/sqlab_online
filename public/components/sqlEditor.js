/**
 * Creates a CodeMirror editor instance for SQL editing.
 * @param {string} containerId - ID of the textarea element
 * @returns {Object} Editor instance with addClickToInsert method
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
    
    function insertText(element) {
        const cursor = editor.getCursor();
        editor.replaceRange(element.textContent.trim(), cursor);
        editor.focus();
        element.classList.add('insert-success');
        setTimeout(() => {
            element.classList.remove('insert-success');
        }, 300);
    };

    editor.addClickToInsert = function (container) {
        container.querySelectorAll('.insertable').forEach(element => {
            element.addEventListener('click', function () {
                insertText(this);
            });
        });
    }

    return editor;
}
