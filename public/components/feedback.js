import { checkQuery } from '../api/checkQuery.js';

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

    function setFeedbackContent(content, cssClass) {
        // Clear existing classes and add new classes
        feedbackTextContainer.className = feedbackTextContainer.className.replace(/\b(suspicious error|internal error|minor error|specific hint|default hint|correction)\b/g, '').trim();
        feedbackTextContainer.classList.add(...cssClass.split(' '));
        
        // Set content and display it
        feedbackTextContainer.innerHTML = content;
        feedbackTextContainer.classList.remove('hidden');
        document.querySelector('.tab[data-tab="feedback-tab"]').click();
    }

    // If the feedback is already stored, restore it and return.
    let feedback = localStorage.getItem(`feedback/${taskId}`);
    if (feedback) {
        setFeedbackContent(feedback, 'correct');
        return;
    }

    if (!refresh) {
        // The function is called from a task button click handler (with refresh === false).
        // The feedback just needs to be displayed, not refreshed.
        return;
    }
    // Otherwise, `refresh` is the event which directly triggered the call. We don't need it.

    // Hide the check container and the feedback...
    checkContainer.classList.add('hidden');
    feedbackTextContainer.classList.add('hidden');

    // and suppose that the check will fail for the current activity / task
    checkContainer.setAttribute('data-check-failed-for', `${activityNumber}/${taskNumber}`);

    // Retrieve the SQL query from the editor
    const query = window.sqlEditor.getValue().trim();

    // Fetch the object resulting from the query check
    const stakePercentage = stakeSystem.getStakePercentage();

    const data = await checkQuery(query, activityNumber, taskNumber, stakePercentage);
    
    // Handle error responses from the server
    if (!data.success) {
        let errorMessage;
        
        // Map server error slugs to user-friendly messages
        switch (data.errorSlug) {
            case 'alreadyValidatedTask':
                errorMessage = window.i18n.t('query.alreadyValidatedError');
                break;
            case 'stakePercentageError':
                errorMessage = window.i18n.t('query.stakePercentageError');
                break;
            case 'unparsableUserQuery':
                errorMessage = window.i18n.t('query.unparsableError');
                break;
            case 'missingFormula':
                errorMessage = window.i18n.t('query.missingFormulaError');
                break;
            case 'missingColumns':
                errorMessage = window.i18n.t('query.missingColumnsError', { columns: data.missingColumns });
                break;
            case 'tooFewTables':
                errorMessage = window.i18n.t('query.tooFewTablesError', { count: data.missingTablesCount });
                break;
            case 'noToken':
                errorMessage = window.i18n.t('query.noTokenError');
                break;
            case 'emptyFeedback':
                errorMessage = window.i18n.t('query.emptyFeedbackError');
                break;
            case 'unparsableJson':
                errorMessage = window.i18n.t('query.unparsableJsonError');
                break;
            case 'unknownFeedbackMessageClass':
                errorMessage = window.i18n.t('query.unknownFeedbackError');
                break;
            default:
                errorMessage = data.errorSlug || window.i18n.t('query.genericError');
        }
        
        setFeedbackContent(errorMessage, data.cssClass);
        stakeSystem.resetCheckElements();
        return;
    }

    // The result has a feedback message. Display it.
    const feedbackMessage = data.feedbackMessage;
    const cssClass = data.cssClass;
    setFeedbackContent(feedbackMessage, cssClass);

    stakeSystem.resetCheckElements();

    // Update score regardless of feedback type
    stakeSystem.updateScore(data.newScore, data.scoreDelta);

    if (cssClass.includes('hint')) {
        // Negative feedback - just update score and return
        return;
    }

    // Positive feedback - answer was correct
    
    // Store the correction locally
    localStorage.setItem(`feedback/${taskId}`, feedbackMessage);

    // Freeze the current task strip button.
    // Note that, contrary to the task number, the strip button index is 0-based.
    const strip = window.taskStrip;
    const index = window.currentTaskNumber - 1;
    strip.addClass(index, 'frozen');

    // We may have solved a non-sequitur exercise.
    if (activityNumber === 0) {
        return;
    }

    // Otherwise, we have solved an episode of an adventure.

    // Store locally the next episode (which can be an epilogue).
    if (data.task) {
        localStorage.setItem(`task/${activityNumber}/${taskNumber + 1}`, JSON.stringify(data.task));
    }

    // Make the next task accessible in the task strip.
    strip.removeClass(index + 1, 'disabled');

    // Remove the mark indicating that the check has failed for this activity/task.
    checkContainer.removeAttribute('data-check-failed-for');
}
