import MainScene from './scenes/MainScene.js'

// Phaser is loaded from CDN in index.html

/**
 * Get container dimensions for Phaser game
 * Uses the game-container element's actual size
 */
function getGameDimensions() {
    const container = document.getElementById('game-container');
    if (container) {
        return {
            width: container.clientWidth,
            height: container.clientHeight
        };
    }
    // Fallback to window size
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

const dimensions = getGameDimensions();

// Calculate device pixel ratio for high-DPI rendering
const rawDPR = window.devicePixelRatio || 1;
const MAX_DPR = 4; // Cap at 4x for very high-DPI screens
const dpr = Math.min(rawDPR, MAX_DPR);

/**
 * Phaser Game Configuration
 * Uses Scale.RESIZE mode for proper responsive scaling
 */
const config = {
    type: Phaser.AUTO, // AUTO tries WEBGL first, falls back to CANVAS
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // High-DPI rendering - Phaser will automatically scale canvas internally
    resolution: dpr,
    antialias: true,
    pixelArt: false,
    roundPixels: true, // Prevents blur from fractional pixels

    scale: {
        mode: Phaser.Scale.RESIZE, // Automatically resizes to fit parent container
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game
        // Let Phaser handle all canvas sizing - DO NOT manually set canvas.width/height
    },

    parent: 'game-container', // Parent container element
    scene: [MainScene]
};

// Create Phaser game instance
const game = new Phaser.Game(config);

/**
 * Handle window resize - let Phaser's Scale.RESIZE handle it automatically
 * Phaser will automatically update canvas size and input coordinates
 */
function handleResize() {
    const newDimensions = getGameDimensions();
    // Phaser.Scale.RESIZE automatically handles this, but we can trigger it explicitly
    game.scale.resize(newDimensions.width, newDimensions.height);
}

// Listen for window resize events
window.addEventListener('resize', handleResize);

// Also listen for orientation changes on mobile
window.addEventListener('orientationchange', () => {
    // Small delay to let browser finish orientation change
    setTimeout(handleResize, 100);
});

// Expose game instance for HTML interaction
window.gameInstance = game;

// Debug: Log rendering info after game is ready
game.events.once('ready', () => {
    setTimeout(() => {
        const canvas = game.canvas;
        const renderer = game.renderer;
        const scale = game.scale;
        
        console.log('=== Phaser Rendering Info ===');
        console.log('Renderer:', renderer.type === Phaser.WEBGL ? 'WEBGL ✅' : renderer.type === Phaser.CANVAS ? 'CANVAS' : 'UNKNOWN');
        console.log('Device Pixel Ratio:', window.devicePixelRatio);
        console.log('Config Resolution:', config.resolution);
        console.log('Game Size:', `${scale.gameSize.width}×${scale.gameSize.height}`);
        console.log('Display Size:', `${scale.displaySize.width}×${scale.displaySize.height}`);
        console.log('Canvas Internal:', `${canvas.width}×${canvas.height}`);
        console.log('Canvas Display:', `${canvas.style.width}×${canvas.style.height}`);
        console.log('Actual Resolution:', (canvas.width / scale.displaySize.width).toFixed(3));
        console.log('===========================');
    }, 500);
});
