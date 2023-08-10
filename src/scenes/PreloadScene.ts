// @ts-ignore
import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        console.log('preload.constructor')
    }

    preload() {
        console.log('preload.preload')

        // Load all your assets here
        this.load.image('background', '../assets/road_background_front_port.png');

        // After assets load, start the MenuScene
        this.load.on('complete', () => {
            this.scene.start('MenuScene');
        });
    }

    create() {
        console.log('preload.create')
    }
}