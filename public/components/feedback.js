import { checkQuery} from '../api/checkQuery.js';

export function initQueryCheck() {
    const feedbackContainer = document.getElementById('feedback-container');
    const taskContainer = document.getElementById('task-container');

    const feedbackTab = document.querySelector('.tab[data-tab="feedback-tab"]');
    feedbackTab.addEventListener('click', triggerQueryCheck);
    
    async function triggerQueryCheck() {
        const query = window.sqlEditor.getValue().trim();
        if (!query) {
            showError(t('query.emptyError'), feedbackContainer);
            return;
        }
        
        const message = await checkQuery(query, window.activityNumber, window.taskNumber);
        const data = JSON.parse(message);

        // If there is a feedback message, show it in the feedback pane
        if (data.feedback) {
            feedbackContainer.innerHTML = data.feedback;
            
            // If the feedback has class "correction", it is a correction
            if (feedbackContainer.firstChild.classList.contains('correction')) {
                let strip = window.taskStrip;
                strip.addClass(window.taskNumber, 'done');
                if (window.activityNumber > 0) { // This is an episode of an adventure
                    window.taskNumber += 1;
                    strip.removeClass(window.taskNumber, 'disabled');
                    strip.getActiveButton().click();
                }
            }
        }

        // If there is a task message, show it in the task pane
        // TODO: this is temporary. A new task should be created and populated.
        if (data.task) {
            // replace the task container with the new task
            taskContainer.innerHTML = data.task;
        }
    }
}

