/**
 * Fetches a metadata value from the sqlab_metadata table by name
 * @param {string} name - The metadata key to fetch (e.g., 'title', 'author', 'version')
 * @returns {Promise<string|null>} The metadata value or null if not found
 */

export async function fetchMetadata(name) {
  try {
    const response = await fetch(`/metadata/${name}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata '${name}': ${response.statusText}`);
    }

    const { value } = await response.json();
    if (!value) {
      throw new Error(`Metadata '${name}' not found.`);
    }

    return value;

  } catch (error) {
    console.error(`Error fetching metadata '${name}':`, error);
    return null;
  }
}
