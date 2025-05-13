/**
 * Notes controller for handling the notes tab functionality
 * Automatically saves notes to localStorage when modified
 */

// Initialize notes functionality
export function initNotes() {
    const notesTextarea = document.getElementById('notes-textarea');
    
    // Load saved notes from localStorage
    notesTextarea.value = localStorage.getItem('sqlabNotes') || '';
    
    // Add event listener to save notes when typing
    notesTextarea.addEventListener('input', () => {
        localStorage.setItem('sqlabNotes', notesTextarea.value);
    });
    
    // Add to window to make accessible from other modules
    window.saveNotes = () => {
        localStorage.setItem('sqlabNotes', notesTextarea.value);
    };
    
    window.clearNotes = () => {
        if (confirm(window.i18n.t('notes.confirmClear'))) {
            notesTextarea.value = '';
            localStorage.setItem('sqlabNotes', '');
        }
    };
}