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

const config = {
    type: Phaser.AUTO,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

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
