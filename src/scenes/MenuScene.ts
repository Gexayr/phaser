import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    private playButton: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load any necessary assets here
        this.load.image('background', 'https://raw.githubusercontent.com/Gexayr/phaser/main/assets/road_background_front_port.png');
    }

    create() {
        // Get screen dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Set game dimensions
        const gameWidth = screenWidth;
        const gameHeight = screenHeight;

        // Resize the game canvas
        this.scale.resize(gameWidth, gameHeight);

        // Add background image
        const background = this.add.image(gameWidth / 2, gameHeight / 2, 'background');
        background.displayWidth = gameWidth;
        background.displayHeight = gameHeight;

        // Create the play button text
        this.playButton = this.add.text(gameWidth / 2, gameHeight / 2, 'Play Game', { color: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.startGame());

        // Center the play button
        this.playButton.setOrigin(0.5);

        // Adjust the font size based on the screen size
        const fontSize = Math.min(gameWidth * 0.05, gameHeight * 0.05);
        this.playButton.setFontSize(fontSize);
    }

    startGame() {
        // Switch to the GameScene
        this.scene.start('GameScene');
    }
}
