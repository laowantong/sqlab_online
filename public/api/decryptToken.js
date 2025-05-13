/**
 * @description Decrypts the message associated with the given token in the database.
 * @param {number} token - The token to decrypt.
 * @returns {Promise<string>} The decrypted message.
 * @throws {Error} If the decryption fails or the token is not found.
 */

export async function decryptToken(token) {
    try {
        const response = await fetch(`/decrypt/${token}`);
        if (!response.ok) {
            throw new Error(`Failed to decrypt token ${token}: ${response.statusText}`);
        }

        const { message } = await response.json();
        if (!message) {
            throw new Error(`No message found for token ${token}`);
        }

        return message;

    } catch (error) {
        console.error(`Error decrypting token ${token}:`, error);
        throw error;
    }
}
