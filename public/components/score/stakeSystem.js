import { DEFAULT_STARTING_SCORE, MIN_STAKE_PERCENTAGE, MAX_STAKE_PERCENTAGE } from "../../utils/constants.js";

/**
 * Initializes the stake system for a specific activity.
 * The logic mainly relies on two variables:
 * - score: The current score of the activity.
 * - stakeSlider.value: The stake slider value, an integer between 0 and 100.
 * @param {number|string} activityNumber - The activity whose score is being managed.
 * @returns {Object} API for score management
 */
export function initStakeSystem(activityNumber) {
    const stakeSlider = document.getElementById('stake-slider');
    const checkButton = document.getElementById('check-button');
    const stakeContainer = document.getElementById('stake-container');
    const scoreDisplay = document.getElementById('score-value');

    // Retrieve the score from local storage or set it to the default starting score
    const scoreKey = `score/${activityNumber}`;
    let score = localStorage.getItem(scoreKey);
    if (score) {
        score = parseInt(score);
    } else {
        score = DEFAULT_STARTING_SCORE;
        localStorage.setItem(scoreKey, score);
    };
    scoreDisplay.textContent = `${score}`;

    // Initialize the range, the position and the listener of the stake slider
    stakeSlider.min = MIN_STAKE_PERCENTAGE;
    stakeSlider.max = MAX_STAKE_PERCENTAGE;
    stakeSlider.value = MIN_STAKE_PERCENTAGE;
    updateCheckElements();
    stakeSlider.addEventListener('input', updateCheckElements);

    /**
     * Update the appearance of:
     * - the stake slider, based on stakeSlider.value,
     * - the check button, based on the current score.
     */
    function updateCheckElements() {
        checkButton.disabled = false;
        if (Math.floor(score * MAX_STAKE_PERCENTAGE / 100) === 0) {
            checkButton.textContent = window.i18n.t('execution-tab.checkAnswer');
            stakeContainer.classList.add('hidden');
        } else {
            const sliderValue = parseInt(stakeSlider.value);
            const angle = (sliderValue - MIN_STAKE_PERCENTAGE) / (MAX_STAKE_PERCENTAGE - MIN_STAKE_PERCENTAGE);
            stakeSlider.style.setProperty("--thumb-rotate", `${angle * 720}deg`);
            
            const stakeAmount = Math.floor(score * sliderValue / 100);
            checkButton.textContent = `Stake ${stakeAmount} squalions`;

            stakeContainer.classList.remove('hidden');
        }
    }

    return {

        /**
         * Adds amount to the score (negative to subtract)
         * @param {number} amount - Amount to add
         */
        addToScore: (amount) => {
            // For the visual effect, use the local score
            window.scoreVisualEffects.updateScore(score, amount);
            // Update the local score to the new score, calculated server-side
            score = parseInt(localStorage.getItem(scoreKey));
            scoreDisplay.textContent = `${score}`;
            updateCheckElements();
            checkButton.disabled = (score > 0);
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
            stakeSlider.value = 0;
            updateCheckElements();
        },
    };

}
