/**
 * strip.js - Reusable button strip component
 * An agnostic component for creating horizontal button strips
 */

/**
 * Creates an empty container for the strip
 * @param {HTMLElement} container - The container to insert the strip into
 * @param {HTMLElement} container - The container to insert the strip into
 * @param {Array<Object>} buttonsProperties - Array of button configuration objects
 * @param {string|number} buttonsProperties[].label - Text to display on the button
 * @param {string[]} [buttonsProperties[].classes] - Array of CSS classes to apply to the button
 * @param {string} [buttonsProperties[].tooltip] - Optional tooltip text for the button
 * @param {Function} [buttonsProperties[].onClick] - Optional click handler for the button
 * @returns {Object} The created strip component with methods to manipulate it
 */

export function createStrip(container, buttonsProperties, rowCount = null) {
    // Remove any existing strip container
    const existingStrip = container.querySelector('.strip-container');
    if (existingStrip) container.removeChild(existingStrip);

    // Create new DOM structure for the strip
    const stripContainer = document.createElement('nav');
    stripContainer.className = 'strip-container';
    const stripButtons = document.createElement('div');
    stripButtons.className = 'strip-buttons';
    if (rowCount !== null) {
        const rowCountElement = document.createElement('div');
        rowCountElement.className = 'row-count';
        rowCountElement.textContent = `${rowCount} ${window.i18n.t('table.pagination.rows')}`;
        stripButtons.appendChild(rowCountElement);
    }

    // Create the buttons based on properties and store the active button index
    let activeButtonIndex;
    const buttonElements = [];
    buttonsProperties.forEach((properties, index) => {
        const button = document.createElement('button');
        button.className = 'strip-button';
        button.setAttribute('index', index);
        button.textContent = properties.label;
        // Add classes if provided
        if (properties.classes) {
            properties.classes.forEach(cls => button.classList.add(cls));
            if (properties.classes.includes('active')) activeButtonIndex = index;
        }

        if (properties.data) {
            Object.entries(properties.data).forEach(([key, value]) => {
                button.setAttribute(`data-${key}`, value);
            })
        }

        // Set tooltip if provided
        if (properties.title) button.setAttribute('title', properties.title);

        // Add click handler if provided
        if (typeof properties.onClick === 'function') {
            button.addEventListener('click', e => {
                properties.onClick(index, e);
                changeActiveButton(index);
            });
        }

        stripButtons.appendChild(button);
        buttonElements.push(button);
    })

    stripContainer.appendChild(stripButtons);
    container.insertBefore(stripContainer, container.firstChild);

    /**
     * Activates a button and deactivates the currently active one
     * @param {number} index - Index of the button to activate
     * @returns {void}
    */
    function changeActiveButton(index) {
        buttonElements[activeButtonIndex].classList.remove('active');
        buttonElements[index].classList.add('active');
        activeButtonIndex = index;
    }

    // Public API for strip management
    return {

        /**
         * Adds a class to a button
         * @param {number} index - Index of the button
         * @param {string} className - Class to add
         * @returns {void}
         */
        addClass: (index, className) => {
            const button = buttonElements[index];
            if (button) {
                button.classList.add(className);
            }
        },

        /**
         * Removes a class from a button
         * @param {number} index - Index of the button
         * @param {string} className - Class to remove
         * @returns {void}
         */
        removeClass: (index, className) => {
            const button = buttonElements[index];
            if (button) {
                button.classList.remove(className);
            }
        },

        /**
         * Get the active button element
         */
        getActiveButton: () => {
            return buttonElements[activeButtonIndex];
        },
    };
}
