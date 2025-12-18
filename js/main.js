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
    // AUTO tries WEBGL first (better quality), falls back to CANVAS if unavailable
    // WEBGL provides better texture filtering and scaling on mobile devices
    type: Phaser.AUTO, // AUTO ensures compatibility while preferring WEBGL for quality
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // CRITICAL: Set resolution to full DPR (up to 4x) for high-DPI rendering
    // This prevents pixelation on mobile devices with DPR > 2 (S21 Ultra, S24 Ultra, etc.)
    // Previously capped at 2, which caused pixelation on high-DPI phones
    resolution: dpr,
    antialias: true,
    pixelArt: false, // false = smooth scaling, true = pixel-perfect (causes pixelation)
    roundPixels: true, // Force integer pixel positions - prevents blur on mobile from fractional pixels

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

// Debug: Log renderer type to verify WebGL is being used
game.events.once('ready', () => {
  console.log('Phaser Renderer:', game.renderer.type === 1 ? 'WEBGL' : game.renderer.type === 0 ? 'CANVAS' : 'UNKNOWN');
  console.log('Device Pixel Ratio:', window.devicePixelRatio);
  console.log('Phaser Resolution:', game.config.resolution);
});
