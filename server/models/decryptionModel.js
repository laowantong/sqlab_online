import { runSqlStatement } from '../services/databaseService.js';

/**
 * Decrypt the message corresponding to the given integer token.
 * @param {number} token - The token to decrypt
 * @returns {Promise<string>} The decrypted message
 */
export async function decryptToken(token) {
    const rows = await runSqlStatement({
        sql: `SELECT decrypt(?) AS message`,
        values: [token],
        skipPagination: true,
    });

    return (rows && rows.length > 0) ? rows[0].message : null;
}
