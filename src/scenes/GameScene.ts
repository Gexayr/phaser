// @ts-ignore
import Phaser from "phaser";
const { Scene, Physics } = Phaser;
const { Sprite } = Physics.Arcade; // Update the import statement
export default class GameScene extends Phaser.Scene {

    private cannon: Phaser.Physics.Arcade.Sprite;
    private enemyBalls: Phaser.Physics.Arcade.Sprite[] = [];
    private shotBalls: Phaser.GameObjects.Sprite[] = [];
    private pathPoints: { x: number, y: number }[] = [];
    private bottomPathPoints: { xb: number, yb: number }[] = [];
    private pathGraphics: Phaser.GameObjects.Graphics;  // Declare pathGraphics property
    private bottomPathGraphics: Phaser.GameObjects.Graphics;  // Declare bottomPathGraphics property
    private pathPolygon: Phaser.Geom.Polygon;
    private ballColors: string[] = [
        'Set3_Ball_Green_volume',
        'Set3_Ball_Orange_volume',
        'Set3_Ball_Red_volume',
        'Set3_Ball_Violet_volume',
        'Set3_Ball_Yellow_volume'
    ];

    cannonCooldown: number = 600;
    lastShotTime: number = 0;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load any images or assets here.
        // this.load.image('background', '../assets/road_background_front_port.png');
        // this.load.image('cannon', '../assets/nap.png');
        // this.load.image('ball', '../assets/Set3_Ball_Green_volume.png');
        // this.load.image('enemyBall', '../assets/Set3_Ball_Red_volume.png');
        this.load.image('explosion', '../assets/explosion.png');
        this.load.image('bucket', '../assets/bucket.png');
        this.load.image('background', 'https://raw.githubusercontent.com/Gexayr/phaser/main/assets/road_background_front_port.png');
        this.load.image('cannon', 'https://raw.githubusercontent.com/Gexayr/phaser/main/assets/nap.png');
        this.load.image('ball', '../assets/ball.png');
        // this.load.image('ball', 'https://raw.githubusercontent.com/Gexayr/phaser/main/assets/ball.png');
        this.load.image('enemyBall', 'https://raw.githubusercontent.com/Gexayr/phaser/main/assets/Set3_Ball_Red_volume.png');
        this.ballColors.forEach(color => {
            this.load.image(color, `https://raw.githubusercontent.com/Gexayr/phaser/main/assets/${color}.png`);
        });
    }

    create() {

        // Center coordinates
        const centerX = this.scale.width * 0.5;
        const centerY = this.scale.height * 0.5;

        // Initialize cannon object
        this.cannon = this.physics.add.sprite(centerX, centerY, 'cannon');


        // Load and display the background image
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setScale(this.scale.width / background.width, this.scale.height / background.height);

        // Create a graphics object to draw the path
        this.pathGraphics = this.add.graphics();
        this.bottomPathGraphics = this.add.graphics();

        const lineColor = Phaser.Display.Color.GetColor(96, 125, 139); // Adjust RGB values
        const lineColorBottom = Phaser.Display.Color.GetColor(196, 225, 139); // Adjust RGB values
        const lineWidth = 8;
        this.pathGraphics.lineStyle(lineWidth, lineColor);
        this.bottomPathGraphics.lineStyle(lineWidth, lineColorBottom);

        const amplitude = 80; // Adjust the amplitude of the wave
        const frequency = 0.02; // Adjust the frequency of the wave

        const numPoints = 100; // Number of points in the wave

        this.pathPoints = [];
        this.bottomPathPoints = [];

        for (let i = 0; i < numPoints; i++) {

            const x = i * (this.scale.width / numPoints);
            const y = amplitude * Math.sin(frequency * x) + 80; // Adjust the starting y position

            const xb = i * (this.scale.width / numPoints);
            // const yb = amplitude * Math.sin(frequency * xb) + 500; // Adjust the starting y position
            const yb = this.scale.height - amplitude * Math.sin(frequency * xb) - 80; // Adjust the starting y position
            this.pathPoints.push({ x, y });
            this.bottomPathPoints.push({ xb, yb });
        }
        this.pathPolygon = new Phaser.Geom.Polygon(this.pathPoints.map(point => new Phaser.Geom.Point(point.x, point.y)));

        // Create the bucket sprite at the end of the path
        const endOfPath = this.pathPoints[this.pathPoints.length - 1]; // Get the last point of the path
        const endOfBottomPath = this.bottomPathPoints[this.bottomPathPoints.length - 1]; // Get the last point of the path

        const bucket = this.add.sprite(endOfPath.x, endOfPath.y, 'bucket');
        const bucketBottom = this.add.sprite(endOfBottomPath.xb, endOfBottomPath.yb, 'bucket');
        bucket.setScale(0.5); // Adjust scale if needed
        bucketBottom.setScale(0.5); // Adjust scale if needed
        //
        // for (let i = 0; i < this.pathPoints.length; i++) {
        //     const {x, y} = this.pathPoints[i];
        //     const {xb, yb} = this.bottomPathPoints[i];
        //     if (i === 0) {
        //         this.pathGraphics.moveTo(x+30, y+30);
        //         this.bottomPathGraphics.moveTo(xb, yb);
        //     }/* else {
        //         this.pathGraphics.lineTo(x, y);
        //         this.bottomPathGraphics.lineTo(xb, yb);
        //     }*/
        // }

        this.cannon = this.physics.add.sprite(centerX, centerY, 'cannon');
        // Set the scale of the cannon
        this.cannon.setScale(0.4); // Adjust the scale value to make the cannon smaller

        this.physics.world.enable(this.cannon);

        this.time.addEvent({ delay: 650, callback: this.generateEnemyBall, callbackScope: this, loop: true });
        this.physics.add.collider(this.shotBalls, this.enemyBalls, this.handleCollision, null, this);
    }

    update() {
        // Called 60 times per second (if your browser/device can handle it)
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
        // Create the enemy ball with the chosen color
        let randomColor = Phaser.Math.RND.pick(this.ballColors);
        let randomColorBottom = Phaser.Math.RND.pick(this.ballColors);

        // Ensure that the color of the new ball is different from the previous one
        if (this.enemyBalls.length > 0) {
            const prevBallColor = this.enemyBalls[this.enemyBalls.length - 1].texture.key;
            const prevBottomBallColor = this.enemyBalls[this.enemyBalls.length - 2].texture.key;

            // Loop until the new color is different from the previous one
            while (randomColor === prevBallColor || randomColor === prevBottomBallColor) {
                randomColor = Phaser.Math.RND.pick(this.ballColors);
            }

            // Loop until the new color is different from the previous one
            while (randomColorBottom === prevBallColor || randomColorBottom === prevBottomBallColor || randomColorBottom === randomColor) {
                randomColorBottom = Phaser.Math.RND.pick(this.ballColors);
            }
        }
        const enemyBall = this.physics.add.sprite(this.pathPoints[0].x, this.pathPoints[0].y, randomColor);
        const enemyBallBottom = this.physics.add.sprite(this.bottomPathPoints[0].xb, this.bottomPathPoints[0].yb, randomColorBottom);
        // Set properties for the enemy ball
        enemyBall.setScale(0.2); // Adjust the scale value to make the ball smaller
        enemyBall.body.setCircle(115); // Adjust radius to match ball size
        enemyBall.setOrigin(0.5, 0.5);

        enemyBallBottom.setScale(0.2); // Adjust the scale value to make the ball smaller
        enemyBallBottom.body.setCircle(115); // Adjust radius to match ball size
        enemyBallBottom.setOrigin(0.5, 0.5);

        // Set the path index to 1 to start at the first point of the path
        let currentPathIndex = 1;
        let currentPathIndexB = 1;

        // Add the enemy ball to the array for tracking
        this.enemyBalls.push(enemyBall);
        this.enemyBalls.push(enemyBallBottom);

        // Handle movement of the enemy ball along the path
        this.physics.world.on('worldstep', () => {
            const targetPoint = this.pathPoints[currentPathIndex]; // Retrieve the target path point
            const targetPointBottom = this.bottomPathPoints[currentPathIndexB]; // Retrieve the target path point

            if (!targetPoint || !targetPointBottom) {
                // If targetPoint is undefined, it means the enemy ball reached the end of the path
                enemyBall.destroy();
                enemyBallBottom.destroy();
                return;
            }

            // Calculate direction and distance to the target point
            const direction = new Phaser.Math.Vector2(targetPoint.x - enemyBall.x, targetPoint.y - enemyBall.y);
            const directionBottom = new Phaser.Math.Vector2(targetPointBottom.xb - enemyBallBottom.x, targetPointBottom.yb - enemyBallBottom.y);
            const distance = direction.length();
            const distanceBottom = directionBottom.length();
            const speed = 80; // Adjust the speed of the enemy ball

            // Check if the enemy ball reached the target point
            if (distance < speed) {
                currentPathIndex++;
                if (currentPathIndex >= this.pathPoints.length) {
                    enemyBall.destroy();
                    return; // Abort if reached the end of the path
                }
            }

            // Check if the enemy ball reached the target point
            if (distanceBottom < speed) {
                currentPathIndexB++;
                if (currentPathIndexB >= this.bottomPathPoints.length) {
                    enemyBallBottom.destroy();
                    return; // Abort if reached the end of the path
                }
            }

            // Normalize direction and calculate velocity
            direction.normalize();
            directionBottom.normalize();
            const velocityX = direction.x * speed;
            const velocityY = direction.y * speed;
            const velocityXB = directionBottom.x * speed;
            const velocityYB = directionBottom.y * speed;

            // Set velocity for the enemy ball
            if (enemyBall.body && enemyBall.body.velocity) {
                enemyBall.setVelocity(velocityX, velocityY);
            }
            if (enemyBallBottom.body && enemyBallBottom.body.velocity) {
                enemyBallBottom.setVelocity(velocityXB, velocityYB);
            }
        });
    }

    handleCollision(shotBall: Phaser.Physics.Arcade.Sprite, enemyBall: Phaser.Physics.Arcade.Sprite) {

        // Add an explosion animation when the balls collide
        const explosion = this.add.sprite(enemyBall.x, enemyBall.y, 'explosion');
        explosion.setScale(0.4);
        explosion.play('explode'); // Assuming you have an animation called 'explode'

        setTimeout(() => {
            explosion.destroy();
        }, 30); // 30 milliseconds = 0.03 seconds

        shotBall.destroy();
            enemyBall.destroy();
    }
}

