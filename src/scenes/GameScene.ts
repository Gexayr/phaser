// @ts-ignore
import Phaser from "phaser";
const { Scene, Physics } = Phaser;
const { Sprite } = Physics.Arcade; // Update the import statement
export default class GameScene extends Phaser.Scene {

    private cannon: Phaser.Physics.Arcade.Sprite;
    private enemyBalls: Phaser.Physics.Arcade.Sprite[] = [];
    private shotBalls: Phaser.GameObjects.Sprite[] = [];
    private pathPoints: { x: number, y: number }[] = [];

    cannonRotationSpeed: number = 0.02;
    cannonCooldown: number = 500;
    lastShotTime: number = 0;


    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load any images or assets here.
        // console.log('game.preload')

        this.load.image('background', '../assets/road_background_front_port.png');
        this.load.image('cannon', '../assets/nap.png');
        this.load.image('ball', '../assets/Ball_Blue.png');
        this.load.image('enemyBall', '../assets/Set3_Ball_red_volume.png');
    }

    create() {
        // console.log('game.create')
        // Create our game objects here.

        // Center coordinates
        const centerX = this.scale.width * 0.5;
        const centerY = this.scale.height * 0.5;

        // Load and display the background image
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setScale(this.scale.width / background.width, this.scale.height / background.height);

        // Create a graphics object to draw the path
        const graphics = this.add.graphics();

        // Set the line style for the path
        const lineColor = 0xf412900;
        const lineWidth = 10;
        graphics.lineStyle(lineWidth, lineColor);


        // Define the points that make up the path
        this.pathPoints = [
            { x: 100, y: 50 },
            { x: 600, y: 50 },
            { x: 600, y: 500 },
            { x: 200, y: 500 },
            { x: 200, y: 150 },
            { x: 500, y: 150 },
        ];



        for (let i = 0; i < this.pathPoints.length; i++) {
            const {x, y} = this.pathPoints[i];
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }

        //
        //
        // // Move the graphics object to the first point of the path
        // const startPoint = pathPoints[0];
        // graphics.moveTo(startPoint.x, startPoint.y);
        //
        // // Draw lines connecting the subsequent points of the path
        // for (let i = 1; i < pathPoints.length; i++)
        // {
        //     const point = pathPoints[i];
        //     graphics.lineTo(point.x, point.y);
        // }
        //
        // // Close the path by drawing a line back to the start point
        // graphics.closePath();

        // Render the graphics object on top of the background image
        graphics.strokePath();


        this.cannon = this.physics.add.sprite(centerX, centerY, 'cannon');
        // Set the scale of the cannon
        this.cannon.setScale(0.4); // Adjust the scale value to make the cannon smaller

        this.physics.world.enable(this.cannon);

        this.time.addEvent({ delay: 1000, callback: this.generateEnemyBall, callbackScope: this, loop: true });
        this.physics.add.collider(this.shotBalls, this.enemyBalls, this.handleCollision, null, this);
    }

    update() {
        // Called 60 times per second (if your browser/device can handle it)
        // console.log('game.update')

        // Get the current mouse or touch position
        const pointer = this.input.activePointer;

        // Calculate the angle between the cannon and the pointer position
        const angle = Phaser.Math.Angle.Between(this.cannon.x, this.cannon.y, pointer.x, pointer.y);

        // Rotate the cannon towards the pointer
        this.cannon.setAngle(Phaser.Math.RadToDeg(angle - 1.5708));

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
        // Enable physics for the shot ball
        this.physics.world.enable(ball);
        // Set the velocity of the ball to launch it in the direction of the cannon's angle
        const angle = Phaser.Math.DegToRad(this.cannon.angle + 90);
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize().scale(500);

        // // Set the velocity of the ball to launch it in the direction of the cannon's angle
        // const angle = Phaser.Math.DegToRad(this.cannon.angle - 30);
        // const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize().scale(500);

        this.physics.velocityFromRotation(angle, 500, ball.body.velocity as Phaser.Math.Vector2);

        // Set the scale of the ball
        // ball.setScale(0.2); // Adjust the scale value to make the ball smaller
        this.shotBalls.push(ball);

        if (ball && ball.body) {
            ball.body.setVelocity(velocity.x, velocity.y);
        }

    }

    generateEnemyBall() {
        const startPoint = this.pathPoints[0]; // Set the initial point of the path
        const enemyBall = this.physics.add.sprite(startPoint.x, startPoint.y, 'enemyBall');
        // enemyBall.setScale(0.2); // Adjust the scale value to make the enemy balls smaller

        this.physics.world.on('worldstep', () => {
            const targetPoint = this.pathPoints[currentPathIndex]; // Retrieve the target path point
            const direction = new Phaser.Math.Vector2(targetPoint.x - enemyBall.x, targetPoint.y - enemyBall.y);
            const distance = direction.length();

            const speed = 50; // Adjust the speed of the enemy ball

            if (distance < speed) {
                currentPathIndex++;
                if (currentPathIndex >= this.pathPoints.length) {
                    enemyBall.destroy();
                    return; // Abort if reached the end of the path
                }
            }

            direction.normalize();
            const velocityX = direction.x * speed;
            const velocityY = direction.y * speed;

            if (enemyBall.body && enemyBall.body.velocity) {
                enemyBall.setVelocity(velocityX, velocityY);
            }
        });

        let currentPathIndex = 1; // Start at index 1 to move towards the next path point

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
        // console.log("setVelocity")

        if (shotBall.body && shotBall.body.velocity) {
            // Set the velocity of the shot ball to zero
            shotBall.setVelocity(0, 0);
        }

    }



    // they distance :)
    // handleCollision(shotBall: Phaser.Physics.Arcade.Sprite, enemyBall: Phaser.Physics.Arcade.Sprite) {
    //     const distance = Phaser.Math.Distance.Between(shotBall.x, shotBall.y, enemyBall.x, enemyBall.y);
    //     const threshold = (shotBall.displayWidth + enemyBall.displayWidth) * 0.5;
    //
    //     if (distance <= threshold) {
    //         // Remove the collided balls from their respective arrays and from the scene
    //         shotBall.destroy();
    //         enemyBall.destroy();
    //         const shotBallIndex = this.shotBalls.indexOf(shotBall);
    //         if (shotBallIndex !== -1) {
    //             this.shotBalls.splice(shotBallIndex, 1);
    //         }
    //         const enemyBallIndex = this.enemyBalls.indexOf(enemyBall);
    //         if (enemyBallIndex !== -1)
    //         {
    //             this.enemyBalls.splice(enemyBallIndex, 1);
    //         }
    //     }
    // }

    // handleCollision(shotBall: Phaser.Physics.Arcade.Sprite, enemyBall: Phaser.Physics.Arcade.Sprite) {
    //     const overlap = this.physics.overlap(shotBall, enemyBall);
    //
    //     if (overlap) {
    //         shotBall.destroy();
    //         enemyBall.destroy();
    //
    //         this.shotBalls = this.shotBalls.filter(ball => ball !== shotBall);
    //         this.enemyBalls = this.enemyBalls.filter(ball => ball !== enemyBall);
    //     }
    // }
}



