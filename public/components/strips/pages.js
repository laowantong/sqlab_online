import { createStrip } from './strips.js';

/**
 * Creates a strip to navigate through pages of table rows.
 * @param {HTMLElement} container - Container to insert the strip into
 * @param {number} offset - Current offset for pagination
 * @param {number} limit - Number of items per page
 * @param {number} total - Total number of items
 * @param {Function} onPageChange - Callback when page is changed
 * @returns {void} - No need to keep a reference to the strip
 */
export function createPageStrip(container, offset, limit, total, onPageChange) {
    const activePage = Math.floor(offset / limit);
    const totalPages = Math.ceil(total / limit);
    const properties = Array.from({ length: totalPages }, (_, i) => {
        return {
            label: (i + 1) * limit,
            classes: (i === activePage) ? ['active'] : [],
            onClick: () => onPageChange(i * limit)
        };
    });
    createStrip(container, properties);
}
