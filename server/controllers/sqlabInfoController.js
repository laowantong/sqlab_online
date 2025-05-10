import sqlabInfoModel from '../models/sqlabInfoModel.js';

/**
 * Controller to handle requests related to sqlab_info table
 * @module sqlabInfoController
 * @requires getValue
 */

export async function getSqlabInfoValue(req, res, next) {
    const { name } = req.params;

    try {
        const value = await sqlabInfoModel.getValue(name);

        if (value === null) {
            return res.status(404).json({ error: `No value found for ${name}` });
        }

        res.json(value);
    } catch (error) {
        console.error(`Error fetching ${name} from sqlab_info:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export default {
    getSqlabInfoValue
  };
  