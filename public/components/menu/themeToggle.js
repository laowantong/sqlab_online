import { loadAndRenderRelationalSchema } from "../relationalSchema.js";

/**
 * Initializes the theme toggle functionality
 * Handles dark/light theme switching and persistence
 * @returns {boolean} Current theme state (true if dark)
 */
export function initThemeToggle() {
    const themeToggle = document.getElementById('toggle-theme');
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    // Apply stored theme preference
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        document.querySelector('.moon-icon').classList.add('hidden');
        document.querySelector('.sun-icon').classList.remove('hidden');
    }

    // Toggle dark/light theme and save preference
    themeToggle.addEventListener('click', () => {

        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkTheme', isDark);
        const moonIcon = document.querySelector('.moon-icon');
        const sunIcon = document.querySelector('.sun-icon');
        if (isDark) {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
        loadAndRenderRelationalSchema(isDark);
    });

    return isDarkTheme;
}