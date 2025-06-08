import Phaser from 'phaser';
import { GameScene, GameState } from './types';
import { useCgLib } from '../../context/CgLibContext';
import { useAssignRoleAndRefresh } from '../../hooks/useAssignRoleAndRefresh';
import { CgPluginLib } from '@common-ground-dao/cg-plugin-lib';

export class BaristaGame extends Phaser.Game {
  private gameState: GameState = {
    coins: 0,
    currentOrder: [],
    brewSteps: [],
    isBrewing: false
  };

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }

  public getState(): GameState {
    return this.gameState;
  }

  public setState(newState: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...newState };
  }
}

export class BaristaScene extends Phaser.Scene implements GameScene {
  // Declare all the properties that will be used in the scene
  public barista!: Phaser.GameObjects.Arc;
  public counter!: Phaser.GameObjects.Rectangle;
  public beans!: Phaser.GameObjects.Rectangle;
  public water!: Phaser.GameObjects.Rectangle;
  public milk!: Phaser.GameObjects.Rectangle;
  public cup!: Phaser.GameObjects.Rectangle;
  public customer!: Phaser.GameObjects.Arc;
  public feedbackText!: Phaser.GameObjects.Text;
  public orderText!: Phaser.GameObjects.Text;
  public orderBubble!: Phaser.GameObjects.Rectangle;
  public coinText!: Phaser.GameObjects.Text;
  public brewOrderText!: Phaser.GameObjects.Text;

  private gameState: GameState = {
    coins: 0,
    currentOrder: [],
    brewSteps: [],
    isBrewing: false
  };

  private userId: string | null = null;
  private roleId: string | null = null;

  constructor() {
    super({ key: 'BaristaScene' });
  }

  async preload() {
    try {
      const cgLib = CgPluginLib.getInstance();
      const userInfo = await cgLib.getUserInfo();
      this.userId = userInfo.data.id;

      // Get community info to find role ID
      const communityInfo = await cgLib.getCommunityInfo();
      const roleName = process.env.NEXT_PUBLIC_REWARD_ROLE_NAME;
      if (roleName) {
        const role = communityInfo.data.roles.find(r => r.title === roleName);
        if (role) {
          this.roleId = role.id;
        }
      }
    } catch (error) {
      console.error('Failed to initialize game data:', error);
    }
  }

  create() {
    // Background
    this.add.rectangle(160, 240, 320, 480, 0x8b4513);

    // Counter
    this.counter = this.add.rectangle(160, 400, 300, 100, 0x4a2c2a).setOrigin(0.5);

    // Barista
    this.barista = this.add.circle(160, 360, 20, 0x00ff00).setOrigin(0.5);

    // Ingredients
    this.setupIngredients();
    
    // Cup
    this.setupCup();
    
    // Customer
    this.customer = this.add.circle(160, 200, 20, 0xff0000).setOrigin(0.5);

    // UI Elements
    this.setupUI();

    // Generate initial order
    this.generateOrder();
  }

  private setupIngredients() {
    // Beans
    this.beans = this.add.rectangle(80, 420, 40, 40, 0x3c2f2f).setInteractive();
    this.add.text(80, 445, 'Beans', { fontSize: '12px', color: '#fff' }).setOrigin(0.5);

    // Water
    this.water = this.add.rectangle(160, 420, 40, 40, 0x00b7eb).setInteractive();
    this.add.text(160, 445, 'Water', { fontSize: '12px', color: '#fff' }).setOrigin(0.5);

    // Milk
    this.milk = this.add.rectangle(240, 420, 40, 40, 0xffffff).setInteractive();
    this.add.text(240, 445, 'Milk', { fontSize: '12px', color: '#fff' }).setOrigin(0.5);

    // Add click handlers
    this.beans.on('pointerdown', () => this.addIngredient('Beans'));
    this.water.on('pointerdown', () => this.addIngredient('Water'));
    this.milk.on('pointerdown', () => this.addIngredient('Milk'));
  }

  private setupCup() {
    this.cup = this.add.rectangle(160, 300, 30, 40, 0xd3d3d3).setOrigin(0.5).setInteractive();
    this.add.text(160, 325, 'Cup', { fontSize: '12px', color: '#fff' }).setOrigin(0.5);
    this.cup.on('pointerdown', () => this.serveCoffee());
  }

  private setupUI() {
    // Feedback text
    this.feedbackText = this.add.text(160, 100, '', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);

    // Order bubble
    this.orderBubble = this.add.rectangle(160, 160, 200, 40, 0xffffff).setOrigin(0.5);
    this.orderText = this.add.text(160, 160, '', { fontSize: '12px', color: '#000' }).setOrigin(0.5);

    // Coin counter
    this.coinText = this.add.text(40, 20, 'Coins: 0', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);

    // Brew order text
    this.brewOrderText = this.add.text(40, 240, 'Order:\n', { fontSize: '12px', color: '#fff' }).setOrigin(0, 0.5);
  }

  private generateOrder() {
    const ingredients = ['Beans', 'Water', 'Milk'];
    this.gameState.currentOrder = Phaser.Utils.Array.Shuffle([...ingredients]);
    const orderString = this.gameState.currentOrder.join(', ');
    this.orderText.setText(orderString);
    this.orderBubble.setVisible(true);
    this.orderText.setVisible(true);
  }

  private addIngredient(ingredient: string) {
    if (!this.gameState.isBrewing) {
      this.gameState.isBrewing = true;
    }
    if (this.gameState.brewSteps.length < 3) {
      this.gameState.brewSteps.push(ingredient);
      this.barista.setFillStyle(0xaaaaaa);
      this.time.delayedCall(200, () => this.barista.setFillStyle(0x00ff00));
      this.feedbackText.setText(`Added: ${ingredient}`);
      this.brewOrderText.setText(`Order:\n${this.gameState.brewSteps.join('\n')}`);
    }
  }

  private async serveCoffee() {
    if (this.gameState.brewSteps.length === 0) return;
    this.gameState.isBrewing = false;

    const isCorrect = this.gameState.brewSteps.every(
      (step, i) => step === this.gameState.currentOrder[i]
    ) && this.gameState.brewSteps.length === 3;

    if (isCorrect) {
      this.gameState.coins += 1;
      this.coinText.setText(`Coins: ${this.gameState.coins}`);
      this.customer.setFillStyle(0x00ff00);
      this.feedbackText.setText('+1 Coin! Nice brew!');

      // Assign role if this is the first coin and we have the necessary IDs
      if (this.gameState.coins === 1 && this.userId && this.roleId) {
        try {
          const cgLib = CgPluginLib.getInstance();
          await cgLib.giveRole(this.roleId, this.userId);
        } catch (error) {
          console.error('Failed to assign role:', error);
        }
      }

      this.tweens.add({
        targets: this.customer,
        y: 180,
        duration: 300,
        yoyo: true
      });
    } else {
      this.customer.setFillStyle(0x800000);
      this.feedbackText.setText('Bleh! Wrong brew.');
      this.tweens.add({
        targets: this.customer,
        y: 250,
        duration: 500,
        onComplete: () => {
          this.customer.y = 200;
        }
      });
    }

    this.time.delayedCall(1500, () => this.resetOrder());
  }

  private resetOrder() {
    this.gameState.brewSteps = [];
    this.gameState.isBrewing = false;
    this.customer.setFillStyle(0xff0000);
    this.customer.y = 200;
    this.feedbackText.setText('');
    this.brewOrderText.setText('Order:\n');
    this.generateOrder();
  }

  update() {
    // No heavy logic needed
  }
} 