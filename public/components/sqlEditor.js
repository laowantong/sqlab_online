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
    
    /**
     * Adds click and double-click event listeners to elements with the 'insertable' class within a given container.
    *
    * On single click, the trimmed text content is inserted to the value of the SQL editor.
    * On double-click, prevents the default text selection behavior.
    *
    * @param {HTMLElement} container - The HTML element containing elements to which event listeners will be attached.
    */
    editor.addClickToInsert = function (container) {
        container.querySelectorAll('.insertable').forEach(element => {
            element.addEventListener('click', function () {
                const textToInsert = this.textContent.trim();
                const cursor = editor.getCursor();
                editor.replaceRange(textToInsert, cursor);
                editor.focus();

                this.classList.add('insert-success');
                setTimeout(() => {
                    this.classList.remove('insert-success');
                }, 300);
            });

            // Prevents text selection on double-click
            element.addEventListener('dblclick', function (e) {
                e.preventDefault();
            });
        });
    }

    return editor;
}
