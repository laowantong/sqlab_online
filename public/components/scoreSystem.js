/**
 * Initializes the score system for a specific activity.
 * @param {number|string} activityNumber - The identifier for the activity whose score is being managed.
 * @returns {Object} API for score management
 */
export function initScoreSystem(activityNumber) {
    const score = localStorage.getItem(`score/${activityNumber}`) || 1000;
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
   * Adds amount to the score (negative to subtract)
   * @param {number} amount - Amount to add
   * @returns {number} New score
   */
    function addToScore(amount) {
        const newScore = getScore() + amount;
        localStorage.setItem(`score/${activityNumber}`, newScore);
        updateScoreDisplay(newScore);
        updateStakeButton(newScore);
    }

    /**
    * Gets the current stake amount based on slider value
    * @returns {number} Current stake amount
    */
    function getStakeAmount() {
        const slider = document.getElementById('stake-slider');
        const percentage = parseInt(slider.value) / 100;
        return Math.floor(getScore() * percentage);
    }

    /**
    * Applies the result of a stake (win or lose)
    * @param {boolean} isWin - Whether the stake was won
    * @returns {number} Amount won or lost
    */
    function applyStakeResult(isWin) {
        const stakeAmount = getStakeAmount();
        if (isWin) {
            addToScore(stakeAmount);
        }
        else {
            addToScore(-stakeAmount);
        }
    }

    /**
     * Resets the stake slider to initial state
     */
    function resetStake() {
        const slider = document.getElementById('stake-slider');
        slider.value = 10;
        const percentage = parseInt(slider.value);
        const currentScore = getScore();
        const amount = Math.floor(currentScore * percentage / 100);
        const stakeButton = document.getElementById('stake-button');
        stakeButton.textContent = `Stake ${amount} squalions`;
    }

    return {
        getScore,
        addToScore,
        getStakeAmount,
        applyStakeResult,
        resetStake
    };

}

function initStakeSlider(score) {
    const slider = document.getElementById('stake-slider');
    const stakeButton = document.getElementById('stake-button');
    slider.style.setProperty("--thumb-rotate", "0deg");
    updateStakeButton(score);
    slider.addEventListener('input', () => {
        const currentScore = parseInt(localStorage.getItem(`score/${window.currentActivityNumber}`));
        const rotationValue = (slider.value - 10) / 40 // Normalize to 0-1 range
        slider.style.setProperty("--thumb-rotate", `${rotationValue * 720}deg`);
        updateStakeButton(currentScore);
    });
}

/**
 * Update the score display
 * @param {number} score - Current score
 */
function updateScoreDisplay(score) {
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.textContent = `${score} squalions`;
}

/**
 * Updates the text content of the stake button to reflect the amount of "squalions" to stake,
 * based on the current score and the percentage selected by the stake slider.
 *
 * @param {number} score - The current score used to calculate the stake amount.
 */
function updateStakeButton(score) {
    const slider = document.getElementById('stake-slider');
    const stakeButton = document.getElementById('stake-button');
    const percentage = parseInt(slider.value);
    const amount = Math.floor(score * percentage / 100);
    stakeButton.textContent = `Stake ${amount} squalions`;
}