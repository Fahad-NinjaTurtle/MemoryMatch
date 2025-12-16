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

// Cap devicePixelRatio at 2 for performance (most high-DPI screens are 2x)
// This prevents excessive memory usage on 3x devices while maintaining quality
// High refresh rate screens (90Hz, 120Hz) often have high DPR too
const MAX_DPR = 2;
const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

const config = {
    type: Phaser.AUTO,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // CRITICAL: Set resolution to DPR for high-DPI rendering
    // This ensures crisp rendering on high-DPI and high refresh rate screens
    resolution: dpr,
    antialias: true,
    pixelArt: false,

    scale: {
        mode: Phaser.Scale.FIT,  // Resize to fit container
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
    },

    parent: 'game-container',
    scene: [MainScene]
};

const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
    const newDimensions = getGameDimensions();
    game.scale.resize(newDimensions.width, newDimensions.height);
});

// Expose game instance for HTML interaction
window.gameInstance = game;
