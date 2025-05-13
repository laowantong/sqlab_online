import { createOrUpdateStrip } from './strips.js';

/**
 * Creates a strip to navigate through pages of table rows.
 * @param {HTMLElement} container - Container to insert the strip into
 * @param {number} offset - Current offset for pagination
 * @param {number} limit - Number of items per page
 * @param {number} total - Total number of items
 * @param {Function} onPageChange - Callback when page is changed
 * @returns {Object} The pagination strip component
 */
export function createOrUpdatePageStrip(container, offset, limit, total, onPageChange) {
    const activePage = Math.floor(offset / limit);
    const totalPages = Math.ceil(total / limit);
    const properties = Array.from({ length: totalPages }, (_, i) => {
        return {
            label: (i + 1) * limit,
            classes: ['strip-button', ...((i === activePage) ? ['active'] : [])],
            onClick: () => onPageChange(i * limit)
        };
    });
    createOrUpdateStrip(container, properties);
}
