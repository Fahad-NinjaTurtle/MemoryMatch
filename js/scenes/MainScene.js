import Phaser from "phaser";


export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.image("cardBack", "./assets/card-back.png");
    for (let i = 1; i <= 8; i++) {
      this.load.image("cardFront" + i, `./assets/card-front-${i}.png`);
    }
  }

  create() {

    const screenW = this.sys.game.config.width;
    const screenH = this.sys.game.config.height;

    const baseSize = 800;
    const scaleFactor = Math.min(screenW / baseSize, screenH / baseSize);

    this.rows = 4;
    this.cols = 4;

    // dynamic card measurements
    this.cardSize = 90 * 0.4 * scaleFactor;
    this.spacing = 100 * scaleFactor;
    this.topExtraSpacing = 70 * scaleFactor;

    // dynamic scale used for both front + back flip
    this.cardBackScale = this.cardSize / 100;
    this.cardFrontScale = this.cardSize / 100 * 0.62;

    // center grid horizontally
    const totalGridWidth = (this.cols - 1) * (this.cardSize + this.spacing);
    this.startX = screenW / 2 - totalGridWidth / 2;

    // top padding
    this.startY = 80 * scaleFactor;

    this.cardData = [];
    this.cardIndex = 0;
    this.shuffledCards = [];
    this.matchedCards = 0;

    this.firstCard = null;
    this.secondCard = null;

    this.isAnimating = false;

    this.createShuffleCards();
    this.shuffleCards();

    for (let i = 0; i < this.rows; i++) {
      this.cardData[i] = [];

      for (let j = 0; j < this.cols; j++) {
        const x = this.startX + (this.cardSize + this.spacing) * j;
        const y =
          this.startY +
          (this.cardSize + this.spacing + this.topExtraSpacing) * i;

        const card = this.add
          .image(x, y, "cardBack")
          .setScale(this.cardBackScale)
          .setInteractive();

        card.cardType = this.shuffledCards[this.cardIndex];
        card.wasFlipped = false;

        this.cardIndex++;

        card.on("pointerdown", () => {
          this.flipCard(card);
        });

        this.cardData[i][j] = card;
      }
    }
  }

  flipCard(card) {
    if (this.isAnimating) return;
    if (this.firstCard !== null && this.secondCard !== null) return;
    if (card.wasFlipped) return;

    this.isAnimating = true;

    if (this.firstCard === null) {
      this.firstCard = card;
    } else {
      this.secondCard = card;
    }

    card.wasFlipped = true;

    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        card.setTexture("cardFront" + card.cardType);
        card.setScale(this.cardFrontScale);

        this.tweens.add({
          targets: card,
          scaleX: this.cardFrontScale,
          duration: 150,
          onComplete: () => {
            this.checkCardPair();
          },
        });
      },
    });
  }

  createShuffleCards() {
    for (let i = 1; i <= 8; i++) {
      this.shuffledCards.push(i);
      this.shuffledCards.push(i);
    }
  }

  shuffleCards() {
    for (let i = this.shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledCards[i], this.shuffledCards[j]] = [
        this.shuffledCards[j],
        this.shuffledCards[i],
      ];
    }
  }

  unFlipCard(card) {
    if (!card) return;

    card.wasFlipped = false;

    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        card.setTexture("cardBack");
        card.setScale(this.cardBackScale);

        this.tweens.add({
          targets: card,
          scaleX: this.cardBackScale,
          duration: 150,
        });
      },
    });
  }

  checkCardPair() {
    if (this.firstCard === null || this.secondCard === null) {
      this.isAnimating = false;
      return;
    }

    if (this.firstCard.cardType === this.secondCard.cardType) {
      this.firstCard.disableInteractive();
      this.secondCard.disableInteractive();

      this.firstCard = null;
      this.secondCard = null;

      this.matchedCards += 2;

      this.isAnimating = false;

      this.checkGameWin();
    } else {
      this.time.delayedCall(300, () => {
        this.unFlipCard(this.firstCard);
        this.unFlipCard(this.secondCard);

        this.firstCard = null;
        this.secondCard = null;

        this.isAnimating = false;
      });
    }
  }

  checkGameWin() {
    if (this.matchedCards >= 16) {
      console.log("GAME WON!");

      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.8);
      overlay.fillRect(
        0,
        0,
        this.sys.game.config.width,
        this.sys.game.config.height
      );
      overlay.setDepth(10);

      const restartBtn = this.add
        .text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, "RESTART", {
          fontSize: "48px",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(11);

      restartBtn.on("pointerdown", () => {
        this.scene.restart();
      });
    }
  }
}
