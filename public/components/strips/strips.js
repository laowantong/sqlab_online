/**
 * strip.js - Reusable button strip component
 * An agnostic component for creating horizontal button strips
 */

/**
 * Creates a horizontal strip of buttons in a container
 * @param {HTMLElement} container - The container to insert the strip into
 * @param {Array<Object>} buttonsProperties - Array of button configuration objects
 * @param {string|number} buttonsProperties[].label - Text to display on the button
 * @param {string[]} [buttonsProperties[].classes] - Array of CSS classes to apply to the button
 * @param {string} [buttonsProperties[].tooltip] - Optional tooltip text for the button
 * @param {Function} [buttonsProperties[].onClick] - Optional click handler for the button
 * @returns {Object} The created strip component with methods to manipulate it
 */
export function createOrUpdateStrip(container, buttonsProperties) {
    // Check if strip container already exists
    let stripContainer = container.querySelector('.strip-container');
    let stripButtons;
    let buttonElements = [];
    
    if (stripContainer) {
        // Clear event listeners from existing buttons
        stripButtons = stripContainer.querySelector('.strip-buttons');
        buttonElements = Array.from(stripButtons.children);
        buttonElements.forEach(button => {
            const newButton = button.cloneNode(false);
            newButton.className = 'strip-button';
            newButton.setAttribute('index', button.getAttribute('index'));
            button.parentNode.replaceChild(newButton, button);
        });
        buttonElements = Array.from(stripButtons.children);
    } else {
        // Create new DOM elements for the strip if they don't exist
        stripContainer = document.createElement('nav');
        stripContainer.className = 'strip-container';
        stripButtons = document.createElement('div');
        stripButtons.className = 'strip-buttons';
        buttonsProperties.forEach((properties, index) => {
            const button = document.createElement('button');
            button.className = 'strip-button';
            button.setAttribute('index', index);
            stripButtons.appendChild(button);
            buttonElements.push(button);
        });
        stripContainer.appendChild(stripButtons);
        container.insertBefore(stripContainer, container.firstChild);
    }
    
    // Update button properties
    buttonsProperties.forEach((properties, index) => {
        const button = buttonElements[index];
        
        // Update properties
        button.textContent = properties.label;
        properties.classes.forEach(cls => button.classList.add(cls));
        
        // Update tooltip
        if (properties.tooltip) {
            button.setAttribute('title', properties.tooltip);
        } else {
            button.removeAttribute('title');
        }
        
        // Update click handler
        if (properties.onClick) {
            button.addEventListener('click', e => {
                properties.onClick(index, e);
            });
        }
    });
    
    // Public API for strip management
    return {
        /**
         * Gets all button elements in the strip
         * @returns {HTMLElement[]} Array of button elements
         */
        getButtons: () => [...buttonElements],
        
        /**
         * Gets a specific button element by index
         * @param {number} index - Index of the button
         * @returns {HTMLElement|null} The button element or null if not found
         */
        getButton: index => {
            return (index >= 0 && index < buttonElements.length) 
                ? buttonElements[index] 
                : null;
        },
        
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
    };
}


