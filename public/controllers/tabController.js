/**
 * Initializes tab navigation with scroll position preservation
 */
export function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // STEP 1: Create a wrapper container that maintains a constant height
    if (!document.querySelector('.tab-content-wrapper')) {
        const tabContentWrapper = document.createElement('div');
        tabContentWrapper.className = 'tab-content-wrapper';

        const firstTabContent = tabContents[0];
        firstTabContent.parentNode.insertBefore(tabContentWrapper, firstTabContent);

        // Move all tab contents into the wrapper
        tabContents.forEach(content => {
            tabContentWrapper.appendChild(content);
        });
    }

    // STEP 2: Smart function to calculate and set the minimum height
    // This function makes all tabs temporarily visible but hidden
    // to measure their actual height
    const updateTabContentWrapperHeight = () => {
        const wrapper = document.querySelector('.tab-content-wrapper');
        if (!wrapper) return;

        let maxHeight = 0;

        tabContents.forEach(content => {
            // Make temporarily visible to measure (but visually hidden)
            const wasActive = content.classList.contains('active');
            if (!wasActive) {
                content.style.visibility = 'hidden'; // Invisible but takes up space
                content.style.position = 'relative';
                content.style.display = 'block';
                content.style.opacity = '0';        // Completely transparent
            }

            const height = content.scrollHeight;
            maxHeight = Math.max(maxHeight, height);

            // Restore original state
            if (!wasActive) {
                content.style.visibility = '';
                content.style.position = '';
                content.style.display = '';
                content.style.opacity = '';
            }
        });

        // Set height with a small buffer
        wrapper.style.minHeight = (maxHeight + 20) + 'px';
    };

    // Update heights on load and resize
    updateTabContentWrapperHeight();
    window.addEventListener('resize', updateTabContentWrapperHeight);

    // Variable to track scroll position
    let lastScrollPosition = 0;

    // STEP 3: Tab click handler with scroll preservation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Save current scroll position
            lastScrollPosition = window.scrollY;

            const tabId = tab.getAttribute('data-tab');

            // Update active classes
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            const selectedContent = document.getElementById(tabId);
            selectedContent.classList.add('active');

            // STEP 4: Two-phase scroll restoration strategy
            // First restoration: after DOM update
            requestAnimationFrame(() => {
                window.scrollTo(0, lastScrollPosition);

                // Second restoration: after all transitions/animations are complete
                setTimeout(() => {
                    window.scrollTo(0, lastScrollPosition);
                    updateTabContentWrapperHeight();
                }, 50);
            });
        });
    });
}