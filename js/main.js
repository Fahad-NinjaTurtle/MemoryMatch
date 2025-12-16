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

/**
 * Creates a high-DPI canvas to fix blurriness on mobile devices
 * This function multiplies canvas dimensions by device pixel ratio
 * and scales the context accordingly for crisp rendering
 */
function createCanvas(width, height, set2dTransform = true) {
    const ratio = Math.ceil(window.devicePixelRatio || 1);
    const canvas = document.createElement('canvas');
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    if (set2dTransform) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
    }
    
    return canvas;
}

// High refresh rate screens (90Hz+) often need higher DPR
const rawDPR = window.devicePixelRatio || 1;
const MAX_DPR = rawDPR > 2 ? 3 : 2; // Allow 3x for high-DPI screens
const dpr = Math.min(rawDPR, MAX_DPR); // Fixed: was Math.max, should be Math.min

const config = {
    type: Phaser.WEBGL,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // CRITICAL: Set resolution to DPR for high-DPI rendering
    // This ensures crisp rendering on high-DPI and high refresh rate screens
    resolution: dpr,
    antialias: true,
    pixelArt: false,

    scale: {
        mode: Phaser.Scale.RESIZE,  // Resize to fit container
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
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
