// @ts-ignore
import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    private playButton: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        console.log('menu.preload')

        // Load the play button image

        // If you have additional assets such as audio or other images, load them in the same way:
        // this.load.audio('backgroundMusic', 'assets/audio/backgroundMusic.mp3');
        // this.load.spritesheet('player', 'assets/sprites/player.png');
    }

    create() {
        console.log('menu.create')
        this.add.image(800, 1000, 'background');
        this.load.image('playButton', '../assets/play_button.png');

        // // Create the play button using the loaded image
        // this.playButton = this.add.image(400, 300, 'playButton').setInteractive();
        //
        // // When the play button is clicked, start the game
        // this.playButton.on('pointerdown', () => this.startGame());


        // Create the text for the play button
        this.playButton = this.add.text(1400, 1300, 'Play Game', { color: '#0f0' })
            .setInteractive()    // Makes the text clickable
            .on('pointerdown', () => this.startGame());   // Go to startGame() when the text is clicked

        // Center the play button
        Phaser.Display.Align.In.Center(
            this.playButton,
            this.add.zone(1400, 1300, 1800, 1600)
        );
    }

    update() {
        // We don't need to constantly update anything for the menu
    }

    // Function to start the game
    startGame() {
        this.scene.start('GameScene');   // Switch the scene to GameScene
    }
}
