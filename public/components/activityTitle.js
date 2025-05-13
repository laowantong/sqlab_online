import { fetchMetadata } from '../api/fetchMetadata.js';

/**
 * Load the activity title from metadata
 * @returns {Promise<void>}
 * @description Fetches the activity title from the metadata and updates the document title and UI element.
 * If the title is not found, it uses a default value.
 * The title is also set as the document's title for better SEO and user experience.
 */

export async function loadAndRenderActivityTitle() {
    const titleElement = document.getElementById('activity-title');
    const title = await fetchMetadata('title', { 
        defaultValue: window.i18n.t('database.unknown') 
    });
    document.title = title;
    titleElement.textContent = title;
}
