import { decryptToken} from '../api/decryptToken.js';

/**
 * Loads the task statement associated with the given token and renders
 * it in the task pane. Only for tasks with direct access.
 * @param {number} token - The token to decrypt
 * @returns {Promise<void>}
 */

export async function loadAndRenderTask(token) {
    const message = await decryptToken(token);
    const data = JSON.parse(message);

    // If there is a task message, show it in the task pane
    if (data.task) {
        const taskContainer = document.getElementById('task-container');
        taskContainer.innerHTML = data.task;
    }
}
