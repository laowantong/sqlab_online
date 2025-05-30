import { fetchMetadata } from '../api/fetchMetadata.js';

/**
 */

export async function loadAndRenderTableOfContents() {
    const activityNumber = window.currentActivityNumber;
    const activities = await fetchMetadata('activities');
    const activity = activities[activityNumber];
    const tocElement = document.getElementById('toc-container');
    tocElement.innerHTML = activity.toc;
}
