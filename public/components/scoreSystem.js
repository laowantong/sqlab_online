import { DEFAULT_STARTING_SCORE, MIN_STAKE, MAX_STAKE } from "../utils/constants.js";

/**
 * Initializes the score system for a specific activity.
 * @param {number|string} activityNumber - The identifier for the activity whose score is being managed.
 * @returns {Object} API for score management
 */
export function initScoreSystem(activityNumber) {
    const scoreValue = document.getElementById('score-value');
    const slider = document.getElementById('stake-slider');
    const checkButton = document.getElementById('check-button');
    const stakeContainer = document.getElementById('stake-container');

    const score = localStorage.getItem(`score/${activityNumber}`) || DEFAULT_STARTING_SCORE;
    localStorage.setItem(`score/${activityNumber}`, score);
    updateScoreDisplay(score);
    initStakeSlider(score);

    /**
     * Gets the current score
     * @returns {number} Current score
     */
    function getScore() {
        return parseInt(localStorage.getItem(`score/${activityNumber}`));
    }

    /**
     * Update the score display
     * @param {number} score - Current score
    */
    function updateScoreDisplay(score) {
        const scoreDisplay = document.getElementById('score-value');
        scoreDisplay.textContent = `${score}`;
    }

    /**
    * Updates the text content of the check button to reflect the amount of "squalions" to stake,
    * based on the current score and the percentage selected by the stake slider.
    *
    * @param {number} score - The current score used to calculate the stake amount.
    */
    function updateCheckButton(score) {
        const percentage = parseInt(slider.value);
        const amount = Math.ceil(score * percentage / 100);

        if (score === 0) {
            checkButton.textContent = window.i18n.t('execution-tab.checkQuery');
            stakeContainer.classList.add('hidden');
        }
        else {
            checkButton.textContent = `Stake ${amount} squalions`;
            stakeContainer.classList.remove('hidden');
        }
    }

    /**
     * Initializes the stake slider,
     * sets its initial rotation, and updates the check button based on the score.
     * Also attaches an input event listener to update the slider's thumb rotation and check button
     * as the slider value changes.
     *
     * @param {number} score - The initial score to use for updating the check button.
     */
    function initStakeSlider(score) {
        slider.style.setProperty("--thumb-rotate", "0deg");
        updateCheckButton(score);

        slider.addEventListener('input', () => {
            const currentScore = getScore();
            const rotationValue = (slider.value - MIN_STAKE) / (MAX_STAKE - MIN_STAKE);
            slider.style.setProperty("--thumb-rotate", `${rotationValue * 720}deg`);
            updateCheckButton(currentScore);
        });
    }

    return {

        /**
        * Adds amount to the score (negative to subtract)
        * @param {number} amount - Amount to add
        * @returns {number} New score
        */
        addToScore: (amount) => {
            const newScore = getScore() + amount;
            localStorage.setItem(`score/${activityNumber}`, newScore);
            updateScoreDisplay(newScore);
            updateCheckButton(newScore);
        },


        /**
        * Gets the current stake amount based on slider value
        * @returns {number} Current stake amount
        */
        getStakeAmount: () => {
            const percentage = parseInt(slider.value);
            return Math.ceil(getScore() * percentage / 100);
        },


        /**
         * Resets the stake slider to initial state
         */
        resetStake: () => {
            slider.value = MIN_STAKE;
            slider.style.setProperty("--thumb-rotate", "0deg");
            updateCheckButton(getScore());
        },
    };

}
