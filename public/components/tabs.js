/**
 * Initializes tab navigation with scroll position preservation.
 * Assumes .tab elements have data-tab pointing to corresponding .tab-content IDs.
 */
export function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabs.length === 0 || tabContents.length === 0) return;

    let lastScrollY = 0;

    const activateTab = (tabId) => {
        lastScrollY = window.scrollY;

        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
        });

        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });

        // Restore scroll position after DOM changes
        requestAnimationFrame(() => {
            window.scrollTo(0, lastScrollY);
        });
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            if (tabId) activateTab(tabId);
        });
    });

    // Ensure correct tab is active on load
    const activeTab = document.querySelector('.tab.active')?.getAttribute('data-tab');
    if (activeTab) activateTab(activeTab);
}
