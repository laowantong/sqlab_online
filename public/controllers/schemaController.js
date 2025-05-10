import { getSqlabInfo } from '../models/getSqlabInfo.js';
import { t } from './localizationController.js';

/**
 * Initializes the Schema tab functionality
 */
export function initSchema() {
    // Get the schema container
    const schemaContainer = document.getElementById('schema-container');
    
    // Load schema when the schema tab is clicked
    document.querySelector('.tab[data-tab="schema"]').addEventListener('click', loadSchema);
    
    /**
     * Loads and displays the relational schema
     */
    async function loadSchema() {
        // Show loading message
        schemaContainer.innerHTML = `<div class="loading">${t('schema.loading')}</div>`;
        
        try {
            // Get relational schema SVG
            const schemaSvg = await getSqlabInfo('relational_schema_light');
            
            if (!schemaSvg) {
                schemaContainer.innerHTML = `<div class="info">${t('schema.notAvailable')}</div>`;
                return;
            }
            
            // Display the SVG directly in the container
            schemaContainer.innerHTML = schemaSvg;
            
            // Adjust SVG to fit the container
            const svg = schemaContainer.querySelector('svg');
            if (svg) {
                svg.style.maxWidth = '100%';
                svg.style.height = 'auto';
                svg.style.display = 'block';
                svg.style.margin = '0 auto';
            }
        } catch (error) {
            console.error('Error loading schema:', error);
            schemaContainer.innerHTML = `<div class="error">${error.message}</div>`;
        }
    }
}