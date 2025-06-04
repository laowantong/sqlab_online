import { checkQuery } from '../api/checkQuery.js';
import { showError } from '../../utils/genericUtils.js';

export function initFeedback() {
    const feedbackButton = document.getElementById('check-button');
    feedbackButton.addEventListener('click', getAndRenderFeedback);
}

/**
 * Fetches feedback for the current SQL query, renders it, and updates the task state.
 * If the feedback is already stored, it restores it from local storage.
 * If the query is empty, it shows an error message.
 * If the query check fails, it displays the error message.
 * If the query check succeeds, it updates the feedback text, stores it locally,
 * and updates the task strip button state.
 * @param {boolean} refresh - If false, it just displays the existing feedback. Otherwise, it fetches new feedback.
 * @returns {Promise<void>} - A promise that resolves when the feedback is rendered.
 * @throws {Error} - If the query check fails or if the query is empty.
 */

export async function getAndRenderFeedback(refresh) {
    const feedbackTextContainer = document.getElementById('feedback-text-container');
    const checkContainer = document.getElementById('check-container');
    const activityNumber = window.currentActivityNumber;
    const taskNumber = window.currentTaskNumber;
    const taskId = `${activityNumber}/${taskNumber}`;
    const stakeSystem = window.stakeSystem;

    // If the feedback is already stored, restore it and return.
    let feedback = localStorage.getItem(`feedback/${taskId}`);
    if (feedback) {
        feedbackTextContainer.innerHTML = feedback;
        feedbackTextContainer.classList.remove('hidden');
        return
    }

    if (!refresh) {
        // The function is called from a task button click handler (with refresh === false).
        // The feedback just need to be displayed, not refreshed.
        return
    }
    // Otherwise, `refresh` is the event which directly triggered the call. We don't need it.

    // Hide the check container and the feedback...
    checkContainer.classList.add('hidden');
    feedbackTextContainer.classList.add('hidden');

    // and suppose that the check will fail for the current activity / task
    checkContainer.setAttribute('data-check-failed-for', `${activityNumber}/${taskNumber}`);

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

        // The feeback can be a hint or the fallback when the token is unknown.
        const isHint = feedbackTextContainer.firstChild.classList.contains('hint');
        const isFallback = feedbackTextContainer.firstChild.classList.contains('fallback');
        if (isHint || isFallback) {
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

        // Remove the mark indicating that the check has failed for this activity/task.
        checkContainer.removeAttribute('data-check-failed-for');
    } catch (error) {
        showError(error.message, feedbackTextContainer);
        feedbackTextContainer.classList.remove('hidden');
        document.querySelector('.tab[data-tab="feedback-tab"]').click();
        stakeSystem.resetCheckElements();
    }

}
