import { localizedAmount } from "../../../utils/genericUtils.js";

/**
 * Visual effects system for score changes
 * Provides fullscreen animations for wins and losses
 */
const EFFECT_DISPLAY_DURATION = 2000;
const EFFECT_FADE_OUT_DURATION = 500;
const FALLING_COIN_DURATION = 3000;
const MIN_FALLING_COIN_COUNT = 10;
const MAX_FALLING_COIN_COUNT = 50;
const FALLING_COIN_RATIO = 0.01;
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
        const content = document.createElement('div');
        
        const amountText = document.createElement('div');
        amountText.className = 'score-effect-amount';
        amountText.textContent = `${amount > 0 ? '+' : ''}${localizedAmount(amount)}`;
        content.appendChild(amountText);
        
        const type = amount > 0 ? 'win' : 'loss';
        const overlay = document.createElement('div');
        overlay.className = `score-effect-overlay ${type}`;
        content.className = 'score-effect-content';
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
         * @param {number} delta - The amount won (positive) or lost (negative)
         */
        updateScore: (score, delta) => {
            const effect = createEffectOverlay(delta);
            body.appendChild(effect);
            if (delta > FALLING_COIN_THRESHOLD * score) {
                // Show falling coins for big wins
                const falling_coin_count = Math.max(
                    MIN_FALLING_COIN_COUNT,
                    Math.min(
                        MAX_FALLING_COIN_COUNT,
                        Math.floor(Math.abs(delta) * FALLING_COIN_RATIO)
                    )
                );
                for (let i = 0; i < falling_coin_count; i++) {
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