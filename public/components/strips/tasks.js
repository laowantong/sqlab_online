import { fetchMetadata } from '../../api/fetchMetadata.js';
import { createStrip } from './strips.js';
import { loadAndRenderTask } from '../task.js';

/**
 * Creates a task navigation strip
 * @param {string} activityNumber - The activity number to fetch tasks for
 * @returns {Object} The task strip component
 */
export async function loadAndRenderTaskStrip(activityNumber) {
    window.currentActivityNumberNumber = activityNumber;
    const activities = await fetchMetadata('activities');
    const activity = activities[activityNumber];
    const container = document.getElementById('tasks');

    const properties = activity.tasks.map(task => {
        const obj = {
            label: task.task_number,
            title: task.task_title,
            classes: task.classes || [],
        };
        if (task.access) {
            obj.onClick = () => {
                window.currentTaskNumber = task.task_number;
                loadAndRenderTask(task.access);
            }
            if (task.task_number === 1) obj.classes.push('active');
        } else {
            obj.classes.push('disabled');
        }
        return obj;
    });
    
    return createStrip(container, properties);
}
