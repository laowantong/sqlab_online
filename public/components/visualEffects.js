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

/**
 * Initializes the visual effects system
 * @returns {Object} Public API for visual effects
 */
export function initVisualEffects() {
    const body = document.body;
    
    /**
     * Shows a fullscreen visual effect for score changes
     * @param {number} amount - The amount won (positive) or lost (negative)
     * @param {string} type - 'win' or 'loss'
     */
    function showScoreEffect(amount, type = 'win') {
        const effect = createEffectOverlay(amount, type);
        body.appendChild(effect);

        // Trigger animation
        requestAnimationFrame(() => {
            effect.classList.add('active');
        });

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

    /**
     * Shows a celebration effect for big wins
     * @param {number} amount - The amount won
     */
    function showCelebrationEffect(amount) {
        // Create falling coins
        for (let i = 0; i < CELEBRATION_COIN_COUNT; i++) {
            setTimeout(() => {
                createFallingCoin();
            }, i * COIN_DROP_INTERVAL);
        }
        showScoreEffect(amount, 'win');
    }

    /**
     * Creates the visual effect overlay element
     * @param {number} amount - The amount to display
     * @param {string} type - Effect type ('win' or 'loss')
     * @returns {HTMLElement} The effect overlay element
     */
    function createEffectOverlay(amount, type) {
        const overlay = document.createElement('div');
        overlay.className = `score-effect-overlay ${type}`;
        const content = document.createElement('div');
        content.className = 'score-effect-content';
        const amountText = document.createElement('div');
        amountText.className = 'score-effect-amount';

        if (type === 'win') {
            amountText.textContent = `+${Math.abs(amount)} squalions`;
        } else {
            amountText.textContent = `-${Math.abs(amount)} squalions`;
        }

        const coinIcon = document.createElement('img');
        coinIcon.src = 'assets/squalion-512x512.png';
        coinIcon.className = 'score-effect-coin';
        
        content.appendChild(coinIcon.cloneNode());
        content.appendChild(amountText);
        content.appendChild(coinIcon.cloneNode());
        
        overlay.appendChild(content);
        return overlay;
    }

    /**
     * Creates a falling coin animation
     */
    function createFallingCoin() {
        const coin = document.createElement('img');
        coin.src = 'assets/squalion-512x512.png';
        coin.className = 'falling-coin';

        // Random horizontal position
        coin.style.left = Math.random() * 100 + '%';

        // Random rotation and animation delay
        coin.style.animationDelay = Math.random() * MAX_COIN_DELAY + 's';
        coin.style.transform = `rotate(${Math.random() * MAX_COIN_ROTATION}deg)`;

        body.appendChild(coin);

        // Remove after animation
        setTimeout(() => {
            if (coin.parentNode) {
                coin.parentNode.removeChild(coin);
            }
        }, FALLING_COIN_DURATION);
    }

    // Public API - only functions used in feedback.js
    return {
        /**
         * Shows a visual effect for score changes
         * @param {number} amount - The amount won (positive) or lost (negative)
         * @param {string} type - 'win' or 'loss'
         */
        showScoreEffect,

        /**
         * Shows a celebration effect with falling coins for big wins
         * @param {number} amount - The amount won
         */
        showCelebrationEffect
    };
}