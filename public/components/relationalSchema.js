import { fetchMetadata } from '../api/fetchMetadata.js';

/**
 * Load the relational schema SVG from metadata
 * @returns {Promise<void>}
 * @description Fetches the relational schema SVG from the metadata and updates the UI element.
 * If the SVG is not found, it uses a default message.
 */

export async function loadAndRenderRelationalSchema(isDarkTheme) {
    const schemaContainer = document.getElementById('schema-container');
    const light_or_dark = isDarkTheme ? 'dark' : 'light';
    const schemaSvg = await fetchMetadata(`relational_schema_${light_or_dark}`, {
        defaultValue: window.i18n.t('schema.notAvailable') 
    });
    schemaContainer.innerHTML = schemaSvg;
    const svg = schemaContainer.querySelector('svg');
    if (svg) {
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
    }
}
