/**
 * Initializes the hamburger menu functionality
 * Handles menu toggle and outside click closing
 */
export function initHamburgerMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    // Toggle dropdown menu visibility on hamburger icon click
    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent immediate closing
        dropdownMenu.classList.toggle('active');
        menuToggle.style.transform = dropdownMenu.classList.contains('active')
            ? 'rotate(90deg)'
            : 'rotate(0)';
    });

    // Close the menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.hamburger-menu') && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
            menuToggle.style.transform = 'rotate(0)';
        }
    });
}