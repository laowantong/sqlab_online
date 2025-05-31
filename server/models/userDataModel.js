import { userData } from '../server.js';

/**
 * Model to handle user data operations
 * @module models/userDataModel
 */
export async function queryUserData(name) {
  /**
   * Retrieves user data from the global state
   * @param {string} name - The name of the user data to retrieve
   * @returns {Object|null} The user data object if found, otherwise null
   */
  if (userData && userData[name] !== undefined) {
    return userData[name]
  };
  
  return null;
}
