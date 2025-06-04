import { fetchMetadata } from '../../api/fetchMetadata.js';
import { createStrip } from './strips.js';
import { getAndRenderTask } from '../task.js';
import { getAndRenderFeedback } from '../feedback.js';
import { localizedAmount } from '../../../utils/genericUtils.js';

/**
 * Creates a task navigation strip
 * @param {string} activityNumber - The activity number to fetch tasks for
 * @returns {Object} The task strip component
 */
export async function createTaskStrip() {
    const activityNumber = window.currentActivityNumber;
    const activities = await fetchMetadata('activities');
    const activity = activities[activityNumber];
    const { tocToggle, closeToc } = createTocToggle(activityNumber === 0);

    const properties = activity.tasks.map(task => {

        // Ensure the columns including spaces are properly quoted
        const columns = task.columns.map(column => {
            return column.includes(' ') ? `"${column}"` : column;
        });

        // Prepare the SQL query to be displayed in the SQL editor
        const prequery = `SELECT\n  ${columns.join(',\n  ')}\nFROM\n  `;

        // Initialize the properties of the current task
        const result = {
            label: task.task_number,
            title: `${task.task_title}\n${localizedAmount(task.reward)}`,
            classes: task.classes || [],
            data: {
                reward: task.reward
            },
            onClick: () => {
                if (task.task_number === window.currentTaskNumber) {
                    // The same task button is clicked again: precompose the query template
                    window.sqlEditor.setValue(prequery);
                    window.sqlEditor.focus();
                    window.sqlEditor.setCursor(prequery.length);
                } else {
                    // The user actually switches task
                    window.currentTaskNumber = task.task_number;

                    // Tell whether the Editor's current query has the "Executed" status.
                    const executedIcon = document.querySelector('[data-tab="execution-tab"] .executed');
                    const hasBeenExecuted = !executedIcon.classList.contains('hidden');

                    // Tell whether the current activity/task has already failed the check.
                    const currentActivityAndTask = `${window.currentActivityNumber}/${task.taskNumber}`
                    const checkContainer = document.getElementById('check-container');
                    const hasFailedCheck = checkContainer.getAttribute('data-check-failed-for') === currentActivityAndTask;

                    // Hide the check container iff the query has not been executed yet, or has failed the check
                    checkContainer.classList.toggle('hidden', !hasBeenExecuted || hasFailedCheck);
                }
                getAndRenderTask(task.access);
                getAndRenderFeedback(false); // Don't refresh feedback
                closeToc();
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
    return createStrip(taskStripContainer, properties, tocToggle);
}

/**
 * Creates a toggle for the table of contents or a dummy toggle for an adventure.
 * @param {boolean} hasToc - true to create a TOC toggle, false to create a dummy toggle
 * @returns {Object} An object containing the TOC toggle and a function to close the TOC
 */

function createTocToggle(hasToc) {
    if (!hasToc) {
        return {
            tocButton: null,
            closeToc: () => {},
        };
    }

    const tocContainer = document.getElementById('toc-container');
    const taskStrip = document.getElementById('task-strip');
    const tocToggle = document.createElement('div');
    tocToggle.className = 'toggle-icon js-toggle-icon';

    const closeToc = () => {
        tocContainer.classList.add('hidden');
        taskStrip.classList.remove('expanded');
    };

    tocToggle.addEventListener('click', function() {
        const isHidden = tocContainer.classList.contains('hidden');
        
        if (isHidden) {
            tocContainer.classList.remove('hidden');
            taskStrip.classList.add('expanded');
        } else {
            tocContainer.classList.add('hidden');
            taskStrip.classList.remove('expanded');
        }
    });

    return { tocToggle, closeToc };
}
