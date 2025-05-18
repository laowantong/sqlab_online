import { fetchMetadata } from '../../api/fetchMetadata.js';
import { createStrip } from './strips.js';
import { getAndRenderTask } from '../task.js';
import { getAndRenderFeedback } from '../feedback.js';

/**
 * Creates a task navigation strip
 * @param {string} activityNumber - The activity number to fetch tasks for
 * @returns {Object} The task strip component
 */
export async function initTaskStrip() {
    const activityNumber = window.currentActivityNumber;
    const activities = await fetchMetadata('activities');
    const activity = activities[activityNumber];

    const properties = activity.tasks.map(task => {

        // Initialize the properties of the current task
        const result = {
            label: task.task_number,
            title: task.task_title,
            classes: task.classes || [],
            onClick: () => {
                window.currentTaskNumber = task.task_number;
                getAndRenderTask(task.access);
                getAndRenderFeedback(false); // Don't refresh feedback
            },
        };

        // Make the first task active by default
        if (task.task_number === 1) {
            result.classes.push('active')
        };

        // Disable the button if the task is neither accessible nor stored locally
        if (!task.access) {
            const taskId = `${activityNumber}/${task.task_number}`;
            if (!localStorage.hasOwnProperty(`task/${taskId}`)) {
                result.classes.push('disabled');
            }
        };

        return result;
    });
    
    const taskStripContainer = document.getElementById('task-strip');
    return createStrip(taskStripContainer, properties);
}
