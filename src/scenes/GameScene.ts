// @ts-ignore
import Phaser from "phaser";
const { Scene, Physics } = Phaser;
const { Sprite } = Physics.Arcade; // Update the import statement



export default class GameScene extends Phaser.Scene {

    private cannon: Phaser.Physics.Arcade.Sprite;
    private enemyBalls: Phaser.Physics.Arcade.Sprite[] = [];
    private shotBalls: Phaser.GameObjects.Sprite[] = [];

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
        this.load.image('cannon', '../assets/nap.png');
        this.load.image('ball', '../assets/Ball_Blue.png');
        this.load.image('enemyBall', '../assets/Set3_Ball_Red_volume.png');
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

        this.time.addEvent({ delay: 1000, callback: this.generateEnemyBall, callbackScope: this, loop: true });
        this.physics.add.collider(this.shotBalls, this.enemyBalls, this.handleCollision, null, this);
    }

    update() {
        // Called 60 times per second (if your browser/device can handle it)
        console.log('game.update')

        // Get the current mouse or touch position
        const pointer = this.input.activePointer;

        // Calculate the angle between the cannon and the pointer position
        const angle = Phaser.Math.Angle.Between(this.cannon.x, this.cannon.y, pointer.x, pointer.y);

        // Rotate the cannon towards the pointer
        this.cannon.setAngle(Phaser.Math.RadToDeg(angle + 90));

        // Shoot balls if the cooldown time has passed and the pointer is pressed
        if (pointer.isDown && this.time.now > this.lastShotTime + this.cannonCooldown) {
            this.shootBall();
            this.lastShotTime = this.time.now;
        }
    }

    shootBall() {

        if (!this.cannon) {
            return; // Abort if cannon is not initialized
        }
        // Create a ball sprite at the position of the cannon
        // const ball = this.add.sprite(this.cannon.x, this.cannon.y, 'ball');
        const ball = this.physics.add.sprite(this.cannon.x, this.cannon.y, 'ball');

        // Set the velocity of the ball to launch it in the direction of the cannon's angle
        const angle = Phaser.Math.DegToRad(this.cannon.angle - 90);
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize().scale(500);

        // // Set the velocity of the ball to launch it in the direction of the cannon's angle
        // const angle = Phaser.Math.DegToRad(this.cannon.angle - 30);
        // const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize().scale(500);

        this.physics.velocityFromRotation(angle, 500, ball.body.velocity as Phaser.Math.Vector2);

        // Set the scale of the ball
        ball.setScale(0.2); // Adjust the scale value to make the ball smaller
        this.shotBalls.push(ball);

        if (ball && ball.body) {
            ball.body.setVelocity(velocity.x, velocity.y);
        }

    }

    generateEnemyBall() {
        const x = 0; // Set the initial x-position to the left edge of the screen
        const y = 0; // Set the initial y-position to the top edge of the screen
        const enemyBall = this.physics.add.sprite(x, y, 'enemyBall');
        enemyBall.setScale(0.2); // Adjust the scale value to make the enemy balls smaller

        const targetX = this.scale.width / 2;
        const targetY = this.scale.height / 2;

        // const velocity = new Phaser.Math.Vector2(targetX - x, targetY - y).normalize().scale(100);
        // enemyBall.setVelocity(velocity.x, velocity.y);

        //
        // const angle = (this.enemyBalls.length + 1) * 0.1; // Adjust the angle to change the spiral pattern
        // const radius = 100; // Adjust the radius of the spiral
        // const x = Math.cos(angle) * radius + this.scale.width / 2; // Calculate the x-coordinate of the enemy ball
        // const y = Math.sin(angle) * radius + this.scale.height / 2; // Calculate the y-coordinate of the enemy ball
        // const enemyBall = this.physics.add.sprite(x, y, 'enemyBall');

         // Set the velocity of the enemy ball to move towards the center of the spiral
         const velocity = new Phaser.Math.Vector2(this.scale.width / 2 - x, this.scale.height / 2 - y).normalize().scale(100);
         enemyBall.body.setVelocity(velocity.x, velocity.y);

         this.enemyBalls.push(enemyBall);
     }




    // generateEnemyBall() {
    //
    //     console.log('generateEnemyBall')
    //     const x = this.scale.width * 0.1; // calculate the X position of the enemy ball
    //     const y = this.scale.height * 0.1; // calculate the Y position of the enemy ball
    //     const enemyBall = this.physics.add.sprite(x, y, 'enemyBall');
    //     this.enemyBalls.push(enemyBall);
    // }

    // handleCollision(shotBall: Phaser.Physics.Arcade.Sprite, enemyBall: Phaser.Physics.Arcade.Sprite) {
    //     // Remove the collided balls from their respective arrays and from the scene
    //     shotBall.destroy();
    //     enemyBall.destroy();
    //     const shotBallIndex = this.shotBalls.indexOf(shotBall);
    //     if (shotBallIndex !== -1) {
    //         this.shotBalls.splice(shotBallIndex, 1);
    //     }
    //     const enemyBallIndex = this.enemyBalls.indexOf(enemyBall);
    //     if (enemyBallIndex !== -1) {
    //         this.enemyBalls.splice(enemyBallIndex, 1);
    //     }
    // }

    handleCollision(shotBall: Phaser.Physics.Arcade.Sprite, enemyBall: Phaser.Physics.Arcade.Sprite) {
        // Remove the collided balls from their respective arrays and from the scene
        shotBall.destroy();
        enemyBall.destroy();
        const shotBallIndex = this.shotBalls.indexOf(shotBall);
        if (shotBallIndex !== -1) {
            this.shotBalls.splice(shotBallIndex, 1);
        }
        const enemyBallIndex = this.enemyBalls.indexOf(enemyBall);
        if (enemyBallIndex !== -1) {
            this.enemyBalls.splice(enemyBallIndex, 1);
        }
    }

}
