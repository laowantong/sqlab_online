/**
 * Fetches a user data value by name
 * @param {string} name - The metadata key to fetch (e.g., 'score')
 * @returns {Promise<string|null>} The metadata value or null if not found
 */

export async function fetchUserData(name) {
    try {
      const response = await fetch(`/user-data/${name}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user data '${name}': ${response.statusText}`);
      }
  
      const { value } = await response.json();
      if (value === null || value === undefined) {
        throw new Error(`User data '${name}' not found.`);
      }
  
      return value;
  
    } catch (error) {
      console.error(`Error fetching user data '${name}':`, error);
      return null;
    }
  }
