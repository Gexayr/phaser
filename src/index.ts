// @ts-ignore
import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import PreloadScene from "./scenes/PreloadScene";
import MenuScene from "./scenes/MenuScene";
import GameOverScene from "./scenes/GameOverScene";


const config: Phaser.Types.Core.GameConfig = {
    title: "Zuma Game",
    width: 1800,
    height: 1600,
    type: Phaser.AUTO,
    parent: "game",
    scene: [PreloadScene, MenuScene, GameScene, GameOverScene],
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 0}
        },
    },
};

export default new Phaser.Game(config);