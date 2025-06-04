import { MIN_STAKE_PERCENTAGE, MAX_STAKE_PERCENTAGE } from "../../utils/constants.js";
import { localizedAmount, localizedInteger } from "../../utils/genericUtils.js";
import { fetchUserData } from "../../api/fetchUserData.js";

/**
 * Initializes the stake system for a specific activity.
 * The logic mainly relies on two variables:
 * - score: The current score of the activity, retrieved from the server.
 * - stakeSlider.value: The stake slider value, an integer between 0 and 100.
 * @returns {Object} API for score management
 */
export async function initStakeSystem() {
    const stakeSlider = document.getElementById('stake-slider');
    const checkButton = document.getElementById('check-button');
    const stakeContainer = document.getElementById('stake-container');
    const scoreDisplay = document.getElementById('score-display');

    // Retrieve the score from the server
    let score = await fetchUserData(`score`);
    scoreDisplay.textContent = `${localizedInteger(score)}`;

    // Initialize the range, the position and the listener of the stake slider
    stakeSlider.min = MIN_STAKE_PERCENTAGE;
    stakeSlider.max = MAX_STAKE_PERCENTAGE;
    stakeSlider.value = MIN_STAKE_PERCENTAGE;
    updateCheckElements(score);
    stakeSlider.addEventListener('input', updateCheckElements);

    /**
     * Update the appearance of:
     * - the stake slider, based on stakeSlider.value,
     * - the check button, based on the current score.
     */
    function updateCheckElements() {
        checkButton.disabled = false;
        if (canStake()) {
            const sliderValue = parseInt(stakeSlider.value);
            const angle = (sliderValue - MIN_STAKE_PERCENTAGE) / (MAX_STAKE_PERCENTAGE - MIN_STAKE_PERCENTAGE);
            stakeSlider.style.setProperty("--thumb-rotate", `${angle * 720}deg`);
            
            const stakeAmount = Math.floor(score * sliderValue / 100);
            checkButton.textContent = window.i18n.t('execution-tab.checkAnswerWithStake', { stakeAmount: localizedAmount(stakeAmount) });

            stakeContainer.classList.remove('hidden');
        } else {
            checkButton.textContent = window.i18n.t('execution-tab.checkAnswer');
            stakeContainer.classList.add('hidden');
        }
    }

    function canStake() {
        return Math.floor(score * MAX_STAKE_PERCENTAGE / 100) > 0;
    }

    return {

        /**
         * Adds amount to the score (negative to subtract)
         * @param {number} delta - Amount to add
         */
        addToScore: (newScore, delta) => {
            // For the visual effect, use the local score
            window.scoreVisualEffects.updateScore(score, delta);
            // Update the local score to the new score, calculated server-side
            score = newScore;
            scoreDisplay.textContent = `${localizedInteger(score)}`;
            updateCheckElements();
            checkButton.disabled = canStake();
        },

        /**
        * Gets the current slider value
        * @returns {number} Current stake value
        */
        getStakePercentage: () => {
            return parseInt(stakeSlider.value);
        },

        /**
         * Resets the stake slider to initial state
         */
        resetCheckElements: () => {
            stakeSlider.value = stakeSlider.min;
            updateCheckElements();
        },
    };

}
