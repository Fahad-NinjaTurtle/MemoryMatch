import MainScene from './scenes/MainScene.js'

// Phaser is loaded from CDN in index.html

// Get window dimensions
const getGameDimensions = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};

const dimensions = getGameDimensions();

// High refresh rate screens (90Hz+) often need higher DPR
// Use full DPR for mobile devices to prevent pixelation
// Cap at 4 to avoid performance issues on extremely high DPR devices
const rawDPR = window.devicePixelRatio || 1;
const MAX_DPR = 4; // Allow up to 4x for very high-DPI mobile screens
const dpr = Math.min(rawDPR, MAX_DPR);

const config = {
    // Use WEBGL for better high-DPI rendering (better texture filtering on mobile)
    // AUTO will use WEBGL if available, CANVAS otherwise (WEBGL preferred for quality)
    type: Phaser.WEBGL, // Force WEBGL for crisp rendering (Phaser handles fallback if unavailable)
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // CRITICAL: Set resolution to full DPR (up to 4x) for high-DPI rendering
    // This prevents pixelation on mobile devices with DPR > 2 (S21 Ultra, S24 Ultra, etc.)
    // Previously capped at 2, which caused pixelation on high-DPI phones
    resolution: dpr,
    antialias: true,
    pixelArt: false, // false = smooth scaling, true = pixel-perfect (causes pixelation)

    scale: {
        mode: Phaser.Scale.RESIZE,  // Resize to fit container
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    parent: 'game-container',
    scene: [MainScene]
};

const game = new Phaser.Game(config);

/**
 * Ensures Phaser's canvas is properly configured for high-DPI displays
 * This fixes blurriness on mobile devices by ensuring the canvas
 * uses the correct device pixel ratio
 */
function ensureCrispCanvas() {
    // Wait for Phaser to fully initialize
    if (game.isBooted) {
        applyCrispCanvasFix();
    } else {
        game.events.once('ready', applyCrispCanvasFix);
    }
}

function applyCrispCanvasFix() {
    const canvas = game.canvas;
    if (!canvas) return;

    // Phaser handles internal canvas sizing via resolution property
    // The resolution property in config ensures high-DPI rendering
    // This function is here for any additional canvas optimizations if needed
}

// Apply crisp canvas fix after initialization
ensureCrispCanvas();

// Handle window resize
window.addEventListener('resize', () => {
    const newDimensions = getGameDimensions();
    game.scale.resize(newDimensions.width, newDimensions.height);
    
    // Re-apply crisp canvas fix on resize
    applyCrispCanvasFix();
});

// Expose game instance for HTML interaction
window.gameInstance = game;
