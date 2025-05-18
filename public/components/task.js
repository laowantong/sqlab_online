import { decryptToken} from '../api/decryptToken.js';

/**
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
