/**
 * Visual effects system for score changes
 * Provides fullscreen animations for wins and losses
 */
const EFFECT_DISPLAY_DURATION = 2000;
const EFFECT_FADE_OUT_DURATION = 500;
const FALLING_COIN_DURATION = 3000;
const CELEBRATION_COIN_COUNT = 12;
const COIN_DROP_INTERVAL = 100;
const MAX_COIN_DELAY = 0.5;
const MAX_COIN_ROTATION = 720;
const FALLING_COIN_THRESHOLD = 0.5;

/**
 * Initializes the score visual effects
 * @returns {Object} Public API for visual effects
 */
export function initScoreVisualEffects() {
    const body = document.body;
    
    /**
     * Creates a coin icon element
     * @param {string} className - The class name for the icon
     * @returns {HTMLElement}
     */
    function createCoin(className) {
        const coin = document.createElement('img');
        coin.src = 'assets/squalion-512x512.png';
        coin.className = className;
        return coin;
    }

    /**
     * Creates the visual effect overlay element
     * @param {number} amount - The amount to display
     * @param {string} type - Effect type ('win' or 'loss')
     * @returns {HTMLElement} The effect overlay element
     */
    function createEffectOverlay(amount) {
        const type = amount > 0 ? 'win' : 'loss';
        const overlay = document.createElement('div');
        overlay.className = `score-effect-overlay ${type}`;

        const content = document.createElement('div');
        content.className = 'score-effect-content';

        const amountText = document.createElement('div');
        amountText.className = 'score-effect-amount';
        amountText.textContent = `${amount} squalions`;

        const coin = createCoin('score-effect-coin');
        
        content.appendChild(coin.cloneNode());
        content.appendChild(amountText);
        content.appendChild(coin.cloneNode());
        
        overlay.appendChild(content);
        return overlay;
    }

    /**
     * Creates a falling coin animation
     */
    function createFallingCoin() {
        const coin = createCoin('falling-coin');
        coin.style.left = Math.random() * 100 + '%';
        coin.style.animationDelay = Math.random() * MAX_COIN_DELAY + 's';
        coin.style.transform = `rotate(${Math.random() * MAX_COIN_ROTATION}deg)`;
        body.appendChild(coin);

        // Remove after animation
        setTimeout(() => {
            if (coin.parentNode) coin.parentNode.removeChild(coin);
        }, FALLING_COIN_DURATION);
    }

    // Public API
    return {
        /**
         * Shows a fullscreen visual effect for score changes
         * @param {number} score - The current score
         * @param {number} amount - The amount won (positive) or lost (negative)
         */
        updateScore: (score, amount) => {
            const effect = createEffectOverlay(amount);
            body.appendChild(effect);

            if (amount > FALLING_COIN_THRESHOLD * score) {
                // Show falling coins for big wins
                for (let i = 0; i < CELEBRATION_COIN_COUNT; i++) {
                    setTimeout(() => {
                        createFallingCoin();
                    }, i * COIN_DROP_INTERVAL);
                }
            }
        
            // Trigger main animation
            requestAnimationFrame(() => effect.classList.add('active'));

            // Remove after animation
            setTimeout(() => {
                effect.classList.add('fade-out');
                setTimeout(() => {
                    if (effect.parentNode) {
                        effect.parentNode.removeChild(effect);
                    }
                }, EFFECT_FADE_OUT_DURATION);
            }, EFFECT_DISPLAY_DURATION);
        }
    };
}