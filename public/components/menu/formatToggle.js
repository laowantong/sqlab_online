/**
 * Initializes the SQL formatting option
 * Handles the checkbox state and persistence
 */
export function initSqlFormattingOption() {
    const formatSqlCheckbox = document.getElementById('format-sql-checkbox');
    const formatSqlSetting = localStorage.getItem('formatSqlInEditor') || 'true';

    // Apply stored formatting preference (default is true if not set)
    localStorage.setItem('formatSqlInEditor', formatSqlSetting);

    // Save formatting preference when changed
    formatSqlCheckbox.addEventListener('change', () => {
        localStorage.setItem('formatSqlInEditor', formatSqlCheckbox.checked);
    });
}