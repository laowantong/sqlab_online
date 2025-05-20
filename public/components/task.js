import { decryptToken} from '../api/decryptToken.js';

/**
 * Fetches and renders the task for the current activity and task number.
 * If the task is not available in local storage, it attempts to fetch it using the provided access token.
 * @param {string} access - The access token to fetch the task if not available locally.
 * @returns {Promise<void>} - A promise that resolves when the task is rendered.
 * @throws {Error} - Throws an error if the task cannot be fetched or rendered.
 */

export async function getAndRenderTask(access) {
    const activityNumber = window.currentActivityNumber;
    const taskNumber = window.currentTaskNumber;
    const taskId = `${activityNumber}/${taskNumber}`;

    let task = localStorage.getItem(`task/${taskId}`);
    if (!task && access) {
        // Task is not stored locally and can be fetched
        const message = await decryptToken(access);
        const data = JSON.parse(message);
        task = data.task;
    }
    const taskContainer = document.getElementById('task-container');
    taskContainer.innerHTML = task;
}
