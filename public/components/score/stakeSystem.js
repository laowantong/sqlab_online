import { DEFAULT_STARTING_SCORE, MIN_STAKE, MAX_STAKE } from "../../utils/constants.js";

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
    stakeSlider.min = MIN_STAKE;
    stakeSlider.max = MAX_STAKE;
    stakeSlider.value = MIN_STAKE;
    updateCheckElements();
    stakeSlider.addEventListener('input', updateCheckElements);

    /**
     * Update the appearance of:
     * - the stake slider, based on stakeSlider.value,
     * - the check button, based on the current score.
     */
    function updateCheckElements() {
        checkButton.disabled = false;
        if (score === 0) {
            checkButton.textContent = window.i18n.t('execution-tab.checkQuery');
            stakeContainer.classList.add('hidden');
        } else {
            const sliderValue = parseInt(stakeSlider.value);
            const angle = (sliderValue - MIN_STAKE) / (MAX_STAKE - MIN_STAKE);
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
            window.scoreVisualEffects.updateScore(score, amount);
            score += amount;
            localStorage.setItem(scoreKey, score);
            scoreDisplay.textContent = `${score}`;
            updateCheckElements();
            checkButton.disabled = (score > 0);
        },

        /**
        * Gets the current stake amount based on slider value
        * @returns {number} Current stake amount
        */
        getStakeAmount: () => {
            return Math.floor(score * parseInt(stakeSlider.value) / 100);
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
