// @ts-ignore
import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Load all your assets here
        const backgroundURL = 'https://raw.githubusercontent.com/Gexayr/phaser/main/assets/road_background_front_port.png';
        this.load.image('background', backgroundURL);
    }

    create() {
        // Get screen dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        console.log(screenWidth,
screenHeight);
        // Set game dimensions
        const gameWidth = screenWidth;
        const gameHeight = screenHeight;

        // Resize the game canvas
        this.scale.resize(gameWidth, gameHeight);

        // Load background image and scale it to fit the screen
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.displayWidth = gameWidth;
        background.displayHeight = gameHeight;

        // Start the MenuScene after assets are loaded
        this.scene.start('MenuScene');
    }
}