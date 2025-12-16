// Phaser is loaded from CDN in index.html

export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.image("cardBack", "./assets/card-back.png");
    for (let i = 1; i <= 8; i++) {
      this.load.image("cardFront" + i, `./assets/card-front-${i}.png`);
    }
    // Load sounds
    this.load.audio("bgMusic", "./sounds/Bg Sound.mp3");
    this.load.audio("flipSound", "./sounds/flipSound.mp3");
  }

  // Set LINEAR filtering on all card textures for crisp rendering
  // LINEAR is essential for smooth, non-pixelated rendering on high-DPI screens
  setCardTextureFilters() {
    // Set LINEAR filtering for card back texture
    const cardBackTexture = this.textures.get("cardBack");
    if (cardBackTexture) {
      cardBackTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    
    // Set LINEAR filtering for all card front textures
    for (let i = 1; i <= 8; i++) {
      const cardFrontTexture = this.textures.get("cardFront" + i);
      if (cardFrontTexture) {
        cardFrontTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }
  }

  create() {
    // Get actual canvas dimensions (works with RESIZE mode)
    const screenW = this.scale.gameSize.width;
    const screenH = this.scale.gameSize.height;

    // Better responsive scaling - use smaller base for mobile
    const isMobile = screenW < 768;
    const baseWidth = isMobile ? 400 : 800;
    const baseHeight = isMobile ? 600 : 800;

    const scaleFactorW = screenW / baseWidth;
    const scaleFactorH = screenH / baseHeight;
    const scaleFactor = Math.min(scaleFactorW, scaleFactorH) * 0.9; // 0.9 to add some padding

    this.rows = 4;
    this.cols = 4;

    // Card texture dimensions (your actual PNG dimensions: 700x500)
    const CARD_TEXTURE_WIDTH = 180;

    // dynamic card measurements - adjusted for better mobile support
    // Increased sizes to use more of the 700px texture for better quality
    const baseCardSize = isMobile ? 140 : 180;
    this.cardSize = baseCardSize * 0.4 * scaleFactor;
    this.spacing = (isMobile ? 70 : 80) * scaleFactor;
    this.topExtraSpacing = (isMobile ? 50 : 50) * scaleFactor;

    // CRITICAL: Calculate scale based on ACTUAL texture dimensions (700px)
    // Scale = desired display size (in logical pixels) / texture size
    // Phaser's resolution setting handles DPR multiplication automatically
    // DO NOT clamp to 1 - Phaser will render at higher resolution internally
    this.cardBackScale = this.cardSize / CARD_TEXTURE_WIDTH;
    // Card front is 62% of back size
    this.cardFrontScale = (this.cardSize * 0.62) / CARD_TEXTURE_WIDTH; 

    // center grid horizontally
    const totalGridWidth = (this.cols - 1) * (this.cardSize + this.spacing);
    this.startX = screenW / 2 - totalGridWidth / 2;

    // center grid vertically (both mobile and PC)
    const totalGridHeight =
      (this.rows - 1) * (this.cardSize + this.spacing + this.topExtraSpacing) +
      this.cardSize;
    this.startY = screenH / 2 - totalGridHeight / 2;

    this.cardData = [];
    this.cardIndex = 0;
    this.shuffledCards = [];
    this.matchedCards = 0;

    this.firstCard = null;
    this.secondCard = null;

    this.isAnimating = false;
    this.gameStarted = false;
    this.gameEnded = false;
    this.timeRemaining = 45; // 1 minute in seconds
    this.timerEvent = null;
    this.bgMusic = null; // Background music reference

    this.createShuffleCards();
    this.shuffleCards();

    // Set LINEAR texture filtering for crisp rendering on high-DPI screens
    // This must be called after textures are loaded (in create, not preload)
    this.setCardTextureFilters();

    // Create cards but disable them initially
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
          .setInteractive()
          .setAlpha(0) // Hide cards initially
          .setVisible(true); // Ensure cards are visible (just transparent)

        card.cardType = this.shuffledCards[this.cardIndex];
        card.wasFlipped = false;

        this.cardIndex++;

        card.on("pointerdown", () => {
          if (this.gameStarted && !this.gameEnded) {
            this.flipCard(card);
          }
        });

        // Disable cards initially
        card.disableInteractive();

        this.cardData[i][j] = card;
      }
    }

    // Setup HTML button listeners
    this.setupHTMLElements();

    // Handle window resize
    this.scale.on("resize", this.handleResize, this);
  }

  handleResize() {
    // Recalculate positions on resize
    const screenW = this.scale.gameSize.width;
    const screenH = this.scale.gameSize.height;

    const isMobile = screenW < 768;
    const baseWidth = isMobile ? 400 : 800;
    const baseHeight = isMobile ? 600 : 800;

    const scaleFactorW = screenW / baseWidth;
    const scaleFactorH = screenH / baseHeight;
    const scaleFactor = Math.min(scaleFactorW, scaleFactorH) * 0.9;

    // Card texture dimensions (must match create() method)
    const CARD_TEXTURE_WIDTH = 700;

    // Match the increased base sizes from create() method
    const baseCardSize = isMobile ? 140 : 180;
    const cardSize = baseCardSize * 0.4 * scaleFactor;
    const spacing = (isMobile ? 80 : 100) * scaleFactor;
    const topExtraSpacing = (isMobile ? 50 : 70) * scaleFactor;

    // Calculate scale based on actual texture dimensions
    // DO NOT clamp - Phaser handles high-DPI rendering via resolution setting
    const cardBackScale = cardSize / CARD_TEXTURE_WIDTH;
    const cardFrontScale = (cardSize * 0.62) / CARD_TEXTURE_WIDTH;

    // Center grid horizontally
    const totalGridWidth = (this.cols - 1) * (cardSize + spacing);
    const startX = screenW / 2 - totalGridWidth / 2;

    // Center grid vertically
    const totalGridHeight =
      (this.rows - 1) * (cardSize + spacing + topExtraSpacing) + cardSize;
    const startY = screenH / 2 - totalGridHeight / 2;

    // Update card positions and scales
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const card = this.cardData[i][j];
        const x = startX + (cardSize + spacing) * j;
        const y = startY + (cardSize + spacing + topExtraSpacing) * i;

        card.setPosition(x, y);

        // Update scale if card is not flipped
        if (!card.wasFlipped) {
          card.setScale(cardBackScale);
        }
      }
    }

    // Update scale factors for future flips
    this.cardBackScale = cardBackScale;
    this.cardFrontScale = cardFrontScale;
  }

  setupHTMLElements() {
    const startButton = document.getElementById("start-button");
    const restartButton = document.getElementById("restart-button");

    startButton.addEventListener("click", () => {
      this.startGame();
    });

    restartButton.addEventListener("click", () => {
      this.restartGame();
    });
  }

  startGame() {
    if (this.gameStarted) return;

    this.gameStarted = true;
    this.gameEnded = false;
    this.timeRemaining = 60;

    // Hide start screen
    document.getElementById("start-screen").style.display = "none";

    // Show countdown
    document.getElementById("countdown").style.display = "block";
    this.updateCountdownDisplay();

    // Show and enable all cards with fade-in animation
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const card = this.cardData[i][j];
        if (!card) continue; // Safety check

        card.setInteractive();
        card.setVisible(true); // Ensure card is visible

        // Set alpha immediately, then fade in for smooth effect
        card.setAlpha(1);

        // Optional: Fade in animation (cards are already visible above)
        // this.tweens.add({
        //   targets: card,
        //   alpha: { from: 0, to: 1 },
        //   duration: 400,
        //   ease: 'Power2'
        // });
      }
    }

    // Start countdown timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Play background music
    if (!this.bgMusic) {
      this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
    }
    this.bgMusic.play();
  }

  updateTimer() {
    if (this.gameEnded) return;

    this.timeRemaining--;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.endGame(false);
    } else {
      this.updateCountdownDisplay();
    }
  }

  updateCountdownDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const timeString = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    const countdownTimeEl = document.getElementById("countdown-time");
    if (countdownTimeEl) {
      countdownTimeEl.textContent = timeString;
    }

    // Add warning class when time is low
    const countdownEl = document.getElementById("countdown");
    if (this.timeRemaining <= 10) {
      countdownEl.classList.add("time-warning");
    } else {
      countdownEl.classList.remove("time-warning");
    }
  }

  restartGame() {
    // Reset game state
    this.gameStarted = false;
    this.gameEnded = false;
    this.matchedCards = 0;
    this.firstCard = null;
    this.secondCard = null;
    this.isAnimating = false;
    this.timeRemaining = 60;

    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }

    // Stop background music
    if (this.bgMusic && this.bgMusic.isPlaying) {
      this.bgMusic.stop();
    }

    // Hide game end screen
    document.getElementById("game-end").style.display = "none";

    // Show start screen (use flex to maintain centering)
    document.getElementById("start-screen").style.display = "flex";

    // Hide countdown
    document.getElementById("countdown").style.display = "none";
    document.getElementById("countdown").classList.remove("time-warning");

    // Reset all cards
    this.createShuffleCards();
    this.shuffleCards();
    this.cardIndex = 0;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const card = this.cardData[i][j];
        card.setTexture("cardBack");
        card.setScale(this.cardBackScale);
        card.setAlpha(0); // Hide cards again
        card.cardType = this.shuffledCards[this.cardIndex];
        card.wasFlipped = false;
        card.disableInteractive();
        this.cardIndex++;
      }
    }
  }

  flipCard(card) {
    if (!this.gameStarted || this.gameEnded) return;
    if (this.isAnimating) return;
    if (this.firstCard !== null && this.secondCard !== null) return;
    if (card.wasFlipped) return;

    this.isAnimating = true;

    // Play flip sound
    this.sound.play("flipSound", { volume: 0.7 });

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
    // Extreme randomization: Multiple shuffle passes for maximum randomness

    // Method 1: Fisher-Yates shuffle (multiple passes)
    const shufflePasses = 5; // Shuffle 5 times for extreme randomness
    for (let pass = 0; pass < shufflePasses; pass++) {
      for (let i = this.shuffledCards.length - 1; i > 0; i--) {
        // Use crypto.getRandomValues for better randomness if available
        let randomIndex;
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
          const randomArray = new Uint32Array(1);
          crypto.getRandomValues(randomArray);
          randomIndex = Math.floor((randomArray[0] / 4294967296) * (i + 1));
        } else {
          // Fallback to Math.random with additional entropy
          randomIndex = Math.floor(
            ((Math.random() * Date.now()) / 1000) % (i + 1)
          );
        }

        [this.shuffledCards[i], this.shuffledCards[randomIndex]] = [
          this.shuffledCards[randomIndex],
          this.shuffledCards[i],
        ];
      }
    }

    // Method 2: Additional random swaps for extra randomness
    const extraSwaps = 20; // Do 20 extra random swaps
    for (let i = 0; i < extraSwaps; i++) {
      const index1 = Math.floor(Math.random() * this.shuffledCards.length);
      const index2 = Math.floor(Math.random() * this.shuffledCards.length);
      [this.shuffledCards[index1], this.shuffledCards[index2]] = [
        this.shuffledCards[index2],
        this.shuffledCards[index1],
      ];
    }

    // Method 3: Reverse shuffle pass (shuffle in reverse direction)
    for (let i = 0; i < this.shuffledCards.length - 1; i++) {
      const j = Math.floor(Math.random() * (this.shuffledCards.length - i)) + i;
      [this.shuffledCards[i], this.shuffledCards[j]] = [
        this.shuffledCards[j],
        this.shuffledCards[i],
      ];
    }
  }

  unFlipCard(card) {
    if (!card) return;

    card.wasFlipped = false;

    // Play unflip sound
    this.sound.play("flipSound", { volume: 0.7 });

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
      this.endGame(true);
    }
  }

  endGame(won) {
    if (this.gameEnded) return;

    this.gameEnded = true;

    // Stop background music
    if (this.bgMusic && this.bgMusic.isPlaying) {
      this.bgMusic.stop();
    }

    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }

    // Disable all cards
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.cardData[i][j].disableInteractive();
      }
    }

    // Hide countdown
    document.getElementById("countdown").style.display = "none";

    // Show game end screen
    const gameEndEl = document.getElementById("game-end");
    const endTitle = document.getElementById("end-title");
    const endMessage = document.getElementById("end-message");

    if (won) {
      endTitle.textContent = "Congratulations!";
      endMessage.textContent = `You won with ${this.timeRemaining} seconds remaining!`;
    } else {
      endTitle.textContent = "Time's Up!";
      endMessage.textContent = `You matched ${this.matchedCards} out of 16 cards.`;
    }

    gameEndEl.style.display = "block";
  }
}
