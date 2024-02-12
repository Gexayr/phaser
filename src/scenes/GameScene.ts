// @ts-ignore
import Phaser from "phaser";
const { Scene, Physics } = Phaser;
const { Sprite } = Physics.Arcade; // Update the import statement
export default class GameScene extends Phaser.Scene {

    private cannon: Phaser.Physics.Arcade.Sprite;
    private enemyBalls: Phaser.Physics.Arcade.Sprite[] = [];
    private shotBalls: Phaser.GameObjects.Sprite[] = [];
    private pathPoints: { x: number, y: number }[] = [];
    private pathGraphics: Phaser.GameObjects.Graphics;  // Declare pathGraphics property
    private pathPolygon: Phaser.Geom.Polygon;

    cannonCooldown: number = 300;
    lastShotTime: number = 0;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load any images or assets here.
        this.load.image('background', '../assets/road_background_front_port.png');
        this.load.image('cannon', '../assets/nap.png');
        this.load.image('ball', '../assets/Set3_Ball_Green_volume.png');
        this.load.image('enemyBall', '../assets/Set3_Ball_Red_volume.png');
    }

    create() {

        // Center coordinates
        const centerX = this.scale.width * 0.5;
        const centerY = this.scale.height * 0.5;

        // Load and display the background image
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setScale(this.scale.width / background.width, this.scale.height / background.height);

        // Create a graphics object to draw the path
        this.pathGraphics = this.add.graphics();
        const lineColor = Phaser.Display.Color.GetColor(96, 125, 139); // Adjust RGB values
        const lineWidth = 8;
        this.pathGraphics.lineStyle(lineWidth, lineColor);

        const amplitude = 50; // Adjust the amplitude of the wave
        const frequency = 0.02; // Adjust the frequency of the wave

        const numPoints = 100; // Number of points in the wave

        this.pathPoints = [];

        for (let i = 0; i < numPoints; i++) {
            const x = i * (this.scale.width / numPoints);
            const y = amplitude * Math.sin(frequency * x) + 80; // Adjust the starting y position
            this.pathPoints.push({ x, y });
        }
        this.pathPolygon = new Phaser.Geom.Polygon(this.pathPoints.map(point => new Phaser.Geom.Point(point.x, point.y)));

        for (let i = 0; i < this.pathPoints.length; i++) {
            const {x, y} = this.pathPoints[i];
            if (i === 0) {
                this.pathGraphics.moveTo(x, y);
            } else {
                this.pathGraphics.lineTo(x, y);
            }
        }

        this.pathGraphics.strokePath();

        this.cannon = this.physics.add.sprite(centerX, centerY, 'cannon');
        // Set the scale of the cannon
        this.cannon.setScale(0.4); // Adjust the scale value to make the cannon smaller

        this.physics.world.enable(this.cannon);

        this.time.addEvent({ delay: 1000, callback: this.generateEnemyBall, callbackScope: this, loop: true });
        this.physics.add.collider(this.shotBalls, this.enemyBalls, this.handleCollision, null, this);
    }

    isPointInsidePath(x: number, y: number): boolean {
        return this.pathPolygon.contains(x, y);
    }
    update() {
        // Called 60 times per second (if your browser/device can handle it)
        // Get the current mouse or touch position
        const pointer = this.input.activePointer;

        // Calculate the angle between the cannon and the pointer position
        const angle = Phaser.Math.Angle.Between(this.cannon.x, this.cannon.y, pointer.x, pointer.y);

        // Rotate the cannon towards the pointer
        this.cannon.setAngle(Phaser.Math.RadToDeg(angle - 1.5708));

        // this.shotBalls.forEach((shotBall) => {
        //     // Check if the shot ball overlaps with the path
        //     if (this.isPointInsidePath(shotBall.x, shotBall.y)) {
        //
        //         // Shot ball reached the path
        //         this.transformShotBall(shotBall);
        //     }
        // });


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
        const ball = this.physics.add.sprite(this.cannon.x, this.cannon.y, 'ball');
        ball.setScale(0.2); // Adjust the scale value to make the ball smaller
        ball.body.setCircle(115); // Adjust radius to match ball size
        // Set sprite origin to center for accurate collisions
        ball.setOrigin(0.5, 0.5);


        // Enable physics for the shot ball
        this.physics.world.enable(ball);
        // Set the velocity of the ball to launch it in the direction of the cannon's angle
        const angle = Phaser.Math.DegToRad(this.cannon.angle + 90);
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).normalize().scale(500);
        this.shotBalls.push(ball);

        if (ball && ball.body) {
            ball.body.setVelocity(velocity.x, velocity.y);
        }
    }

    generateEnemyBall() {

        const startPoint = this.pathPoints[0]; // Set the initial point of the path
        const enemyBall = this.physics.add.sprite(startPoint.x, startPoint.y, 'enemyBall');

        enemyBall.setScale(0.2); // Adjust the scale value to make the ball smaller
        enemyBall.body.setCircle(115); // Adjust radius to match ball size
        enemyBall.setOrigin(0.5, 0.5);

        this.physics.world.on('worldstep', () => {
            const targetPoint = this.pathPoints[currentPathIndex]; // Retrieve the target path point

            if (!targetPoint) {
                // If targetPoint is undefined, it means the enemy ball reached the end of the path
                enemyBall.destroy();
                return;
            }

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

    handleCollision(shotBall: Phaser.Physics.Arcade.Sprite, enemyBall: Phaser.Physics.Arcade.Sprite) {
            shotBall.destroy();
            enemyBall.destroy();
    }

    // transformShotBall(shotBall) {
    //     // Remove the shot ball from the shotBalls array
    //     const index = this.shotBalls.indexOf(shotBall);
    //     if (index !== -1) {
    //         this.shotBalls.splice(index, 1);
    //     }
    //
    //     // Create a new enemy ball at the position of the shot ball
    //     const enemyBall = this.physics.add.sprite(shotBall.x, shotBall.y, 'enemyBall');
    //     enemyBall.setScale(0.2); // Adjust the scale value to make the ball smaller
    //     enemyBall.body.setCircle(115); // Adjust radius to match ball size
    //     enemyBall.setOrigin(0.5, 0.5);
    //
    //     // Enable physics for the enemy ball
    //     this.physics.world.enable(enemyBall);
    //
    //     // Add the enemy ball to the array for tracking
    //     this.enemyBalls.push(enemyBall);
    //     shotBall.destroy();
    //
    // }
}

