import { fetchMetadata } from '../../api/fetchMetadata.js';
import { createStrip } from './strips.js';
import { loadAndRenderTask } from '../task.js';

/**
 * Creates a task navigation strip
 * @param {string} activityNumber - The activity number to fetch tasks for
 * @returns {Object} The task strip component
 */
export async function loadAndRenderTaskStrip(activityNumber) {
    window.activityNumber = activityNumber;
    const activities = await fetchMetadata('activities');
    const activity = activities[activityNumber];
    const container = document.getElementById('tasks');
    const sqlEditor = document.querySelector('.CodeMirror');

    // Insert an empty activity at start of activity.tasks
    const sandboxTask = {
        access: true,
        task_number: 0,
        task_title: window.i18n.t('task.sandbox')
    };
    activity.tasks.unshift(sandboxTask);

    const properties = activity.tasks.map((task, i) => {
        const obj = {
            label: i,
            title: task.task_title,
            classes: task.classes || [],
        };
        if (task.access) {
            if (i === 0) {
                obj.classes.push('sandbox');
                obj.onClick = () => {
                    window.taskNumber = 0;
                    sqlEditor.classList.add('sandbox');
                }
            } else {
                if (i === 1) obj.classes.push('active');
                obj.onClick = () => {
                    sqlEditor.classList.remove('sandbox');
                    window.taskNumber = i;
                    loadAndRenderTask(task.access);
                }
            }
        } else {
            obj.classes.push('disabled');
        }
        return obj;
    });
    
    return createStrip(container, properties);
}
