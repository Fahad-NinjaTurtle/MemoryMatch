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
const rawDPR = window.devicePixelRatio || 1;
const MAX_DPR = rawDPR > 2 ? 3 : 2; // Allow 3x for high-DPI screens
const dpr = Math.max(rawDPR, MAX_DPR);

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

// Handle window resize
window.addEventListener('resize', () => {
    const newDimensions = getGameDimensions();
    game.scale.resize(newDimensions.width, newDimensions.height);
});

// Expose game instance for HTML interaction
window.gameInstance = game;
