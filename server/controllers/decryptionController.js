import {decryptToken} from '../models/decryptionModel.js';

/**
 * Controller to handle decryption of tokens.
 * @module controllers/decryptionController
 */
/**
 * Decrypts the token and returns the decrypted message.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function handleDecryptToken(req, res) {
    const { token } = req.params;

    try {
        const message = await decryptToken(token);

        if (message === null) {
            return res.status(404).json({ error: `No message found for token ${token}` });
        }

        res.json({ token, message });
    } catch (error) {
        console.error(`Error decrypting token ${token}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
