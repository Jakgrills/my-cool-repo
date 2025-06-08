export interface GameState {
  coins: number;
  currentOrder: string[];
  brewSteps: string[];
  isBrewing: boolean;
}

export interface GameConfig {
  width: number;
  height: number;
  parent: string;
}

export interface GameScene extends Phaser.Scene {
  barista?: Phaser.GameObjects.Arc;
  counter?: Phaser.GameObjects.Rectangle;
  beans?: Phaser.GameObjects.Rectangle;
  water?: Phaser.GameObjects.Rectangle;
  milk?: Phaser.GameObjects.Rectangle;
  cup?: Phaser.GameObjects.Rectangle;
  customer?: Phaser.GameObjects.Arc;
  feedbackText?: Phaser.GameObjects.Text;
  orderText?: Phaser.GameObjects.Text;
  orderBubble?: Phaser.GameObjects.Rectangle;
  coinText?: Phaser.GameObjects.Text;
  brewOrderText?: Phaser.GameObjects.Text;
}

export interface GameEvents {
  onSaveProgress: (coins: number) => void;
  onGameStart: () => void;
  onGameEnd: () => void;
} 