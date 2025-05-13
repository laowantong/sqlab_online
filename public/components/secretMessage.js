import { decryptToken} from '../api/decryptToken.js';

/**
 * Loads and renders in the task pane and/or the feedback pane the JSON message
 * associated with the given token
 * @param {number} token - The token to decrypt
 */

export async function loadAndRenderSecretMessage(token) {
    const message = await decryptToken(token);
    const data = JSON.parse(message);

    // If there is a feedback message, show it in the feedback pane
    if (data.feedback) {
        const feedbackContainer = document.getElementById('feedback-container');
        feedbackContainer.innerHTML = data.feedback;
    }

    // If there is a task message, show it in the task pane
    // TODO: this is temporary. A new task should be created and populated.
    if (data.task) {
        const taskContainer = document.getElementById('task-container');
        taskContainer.innerHTML = data.task;
    }
}
