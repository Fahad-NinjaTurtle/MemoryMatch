import MainScene from './scenes/MainScene.js'

import Phaser from "phaser";


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    backgroundColor: "#1d1d1d",

    scale: {
        mode: Phaser.Scale.FIT,   // Resize the game to fit
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center on screen
    },

    scene: [MainScene]
};

const game = new Phaser.Game(config);
