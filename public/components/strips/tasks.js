import { fetchMetadata } from '../../api/fetchMetadata.js';
import { createStrip } from './strips.js';
import { loadAndRenderSecretMessage } from '../secretMessage.js';

/**
 * Creates a task navigation strip
 * @param {string} activityNumber - The activity number to fetch tasks for
 * @returns {Object} The task strip component
 */
export async function loadAndRenderTaskStrip(activityNumber) {
    const activities = await fetchMetadata('activities');
    const activity = activities[activityNumber];
    const container = document.getElementById('tasks');

    const properties = activity.tasks.map((task, i) => {
        const obj = {
            label: i + 1,
            title: task.task_title,
            classes: [],
        };
        if (task.access) {
            if (i === 0) obj.classes.push('active');
            obj.onClick = () => loadAndRenderSecretMessage(task.access);
        } else {
            obj.classes.push('disabled');
        }
        return obj;
    });
    
    return createStrip(container, properties);
}
