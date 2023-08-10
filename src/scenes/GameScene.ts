// @ts-ignore
import Phaser from "phaser";
const { Scene, Physics } = Phaser;
const { Sprite } = Physics.Arcade; // Update the import statement



export default class GameScene extends Phaser.Scene {


    cannon: Phaser.Physics.Arcade.Sprite;
    cannonRotationSpeed: number = 0.02;
    cannonCooldown: number = 500;
    lastShotTime: number = 0;


    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load any images or assets here.
        console.log('game.preload')


        this.load.image('background', '../assets/road_background_front_port.png');

        this.load.image('background', '../assets/road_background_front_port.png');
        this.load.image('cannon', '../assets/obj.png');
        this.load.image('ball', '../assets/Ball_Blue.png');
    }

    create() {
        console.log('game.create')
        // Create our game objects here.

        // Center coordinates
        const centerX = this.scale.width * 0.5;
        const centerY = this.scale.height * 0.5;


        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setScale(this.scale.width / background.width, this.scale.height / background.height);


        this.cannon = this.physics.add.sprite(centerX, centerY, 'cannon');
        // Set the scale of the cannon
        this.cannon.setScale(0.4); // Adjust the scale value to make the cannon smaller

        this.physics.world.enable(this.cannon);
    }

    update() {
        // Called 60 times per second (if your browser/device can handle it)
        console.log('game.update')

        // Get the current mouse or touch position
        const pointer = this.input.activePointer;

        // Calculate the angle between the cannon and the pointer position
        const angle = Phaser.Math.Angle.Between(this.cannon.x, this.cannon.y, pointer.x, pointer.y);

        // Rotate the cannon towards the pointer
        this.cannon.setAngle(Phaser.Math.RadToDeg(angle));

        // Shoot balls if the cooldown time has passed and the pointer is pressed
        if (pointer.isDown && this.time.now > this.lastShotTime + this.cannonCooldown) {
            this.shootBall();
            this.lastShotTime = this.time.now;
        }
    }

    shootBall() {
        // Create a ball sprite at the position of the cannon
        const ball = this.physics.add.sprite(this.cannon.x, this.cannon.y, 'ball');

        // Set the velocity of the ball to launch it in the direction of the cannon's angle
        const angle = Phaser.Math.DegToRad(this.cannon.angle - 90);
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize().scale(500);

        this.physics.velocityFromRotation(angle, 500, ball.body.velocity as Phaser.Math.Vector2);

        // Set the scale of the ball
        ball.setScale(0.2); // Adjust the scale value to make the ball smaller

    }
}
