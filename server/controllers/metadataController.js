import { queryMetadata } from '../models/metadataModel.js';

/**
 * Controller to handle requests related to sqlab_metadata table
 * @module controllers/metadataController
 * @requires ../models/metadataModel
 */

export async function handleQueryMetadata(req, res) {
    const { name } = req.params;
    
    try {
        const value = await queryMetadata(name);
        
        if (value === null) {
            return res.status(404).json({ error: `No metadata '${name}'` });
        }
        
        res.json({ name, value });
    } catch (error) {
        console.error(`Error fetching '${name}':`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
