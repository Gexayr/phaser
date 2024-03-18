// @ts-ignore
import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import MenuScene from "./scenes/MenuScene";

const config: Phaser.Types.Core.GameConfig = {
    title: "Zuma Game",
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    parent: "game",
    scene: [MenuScene, GameScene],
    // loader: {
    //     baseURL: "https://labs.phaser.io",
    //     crossOrigin: "anonymous"
    // },
    physics: {
        default: "arcade",
        arcade: {
            // tileBias: 10,
            gravity: {y: 0},
            // debug: true,
            // debugShowBody: true,
            // debugShowStaticBody: true,
        },
    },
};

export default new Phaser.Game(config);