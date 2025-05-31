import { checkQuery } from '../api/checkQuery.js';
import { showError } from '../../utils/genericUtils.js';

export function initFeedback() {
    const feedbackButton = document.getElementById('check-button');
    feedbackButton.addEventListener('click', getAndRenderFeedback);
}

export async function getAndRenderFeedback(refresh = true) {
    const feedbackTextContainer = document.getElementById('feedback-text-container');
    const feedbackControlContainer = document.getElementById('check-container');
    const activityNumber = window.currentActivityNumber;
    const taskNumber = window.currentTaskNumber;
    const taskId = `${activityNumber}/${taskNumber}`;
    const stakeSystem = window.stakeSystem;

    feedbackControlContainer.classList.add('hidden');

    // If the feedback is already stored, restore it and return.
    let feedback = localStorage.getItem(`feedback/${taskId}`);
    if (feedback) {
        feedbackTextContainer.innerHTML = feedback;
        feedbackTextContainer.classList.remove('hidden');
        return
    }

    // If the refresh flag is not set, return.
    if (!refresh) {
        feedbackTextContainer.classList.add('hidden');
        return
    }

    // Retrieve the SQL query from the editor
    const query = window.sqlEditor.getValue().trim();
    if (!query) {
        document.querySelector('.tab[data-tab="feedback-tab"]').click();
        showError(window.i18n.t('query.emptyError'), feedbackTextContainer);
        return;
    }

    // Fetch the object resulting of the query check
    const stakePercentage = stakeSystem.getStakePercentage();

    try {

        const data = await checkQuery(query, activityNumber, taskNumber, stakePercentage);

        // The result has necessarily a feedback part. Display it.
        feedbackTextContainer.innerHTML = data.feedback;
        feedbackTextContainer.classList.remove('hidden');
        document.querySelector('.tab[data-tab="feedback-tab"]').click();

        stakeSystem.resetCheckElements();

        // The feeback can be a hint.
        if (feedbackTextContainer.firstChild.classList.contains('hint')) {
            stakeSystem.addToScore(data.score, data.scoreDelta);
            return;
        }

        // Otherwise, the answer was correct, and the feedback gives the official solution.
        stakeSystem.addToScore(data.score, data.scoreDelta);

        // Store the correction locally
        localStorage.setItem(`feedback/${taskId}`, data.feedback);

        // Freeze the current task strip button.
        // Note that, contrarily to the task number, the strip button index is 0-based.
        const strip = window.taskStrip;
        const index = window.currentTaskNumber - 1;
        strip.addClass(index, 'frozen');

        // We may have solved a non-sequitur exercise.
        if (activityNumber === 0) {
            return
        }

        // Otherwise, we have solved an episode of an adventure.

        // Store locally the next episode (which can be an epilogue).
        localStorage.setItem(`task/${activityNumber}/${taskNumber + 1}`, data.task);

        // Make it accessible in the task strip.
        strip.removeClass(index + 1, 'disabled');
    } catch (error) {
        showError(error.message, feedbackTextContainer);
        feedbackTextContainer.classList.remove('hidden');
        document.querySelector('.tab[data-tab="feedback-tab"]').click();
        stakeSystem.resetCheckElements();
    }

}
