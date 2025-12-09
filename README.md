# Memory Game

A classic memory card matching game built with Phaser 3. Test your memory by flipping cards and finding matching pairs!

## 🔗 Live Demo

[Play the game here](https://fahad-ninjaturtle.github.io/MemoryMatch/) 🎮

## 🎮 Features

- **4×4 Grid**: 16 cards with 8 matching pairs
- **Smooth Animations**: Card flip animations with scale transitions
- **Responsive Design**: Automatically scales to fit different screen sizes
- **Win Detection**: Automatically detects when all pairs are matched
- **Restart Functionality**: Play again after completing the game
- **Visual Feedback**: Cards flip smoothly and disable when matched

## 🚀 Getting Started

### No Installation Required!

Since the project uses Phaser from CDN, you don't need Node.js, npm, or any build tools.

### Running Locally

**Option 1: Direct File Opening**
- Simply open `index.html` in your web browser

**Option 2: Local Server (Recommended)**
- Use any simple HTTP server. For example:
  - Python: `python -m http.server 8000`
  - PHP: `php -S localhost:8000`
  - VS Code: Use the "Live Server" extension
- Then open `http://localhost:8000` in your browser

**Option 3: Clone and Open**
```bash
git clone <repository-url>
cd memory-game
# Then open index.html in your browser
```

## 🚀 Deploying to GitHub Pages

The project uses Phaser from CDN, so **no build step is required!** You can deploy directly:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Update project"
   git push origin main
   ```

2. **Configure GitHub Pages:**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose the `main` (or `master`) branch
   - Select the `/ (root)` folder (not `/dist`)
   - Click "Save"



## 🎯 How to Play

1. Click on any card to flip it over
2. Click on a second card to reveal it
3. If the two cards match, they stay flipped and are disabled
4. If they don't match, both cards flip back after a short delay
5. Continue until all pairs are matched
6. When all 16 cards are matched, you win! Click "RESTART" to play again

## 🛠️ Technologies Used

- **Phaser 3** (v3.90.0) - Game framework (loaded from CDN)
- **JavaScript (ES6 Modules)** - Modern JavaScript with module support
- **HTML5** - Markup and structure

## 📁 Project Structure

```
memory-game/
├── assets/              # Card images
│   ├── card-back.png   # Card back image
│   └── card-front-*.png # Card front images (1-8)
├── js/
│   ├── main.js         # Phaser game configuration
│   └── scenes/
│       └── MainScene.js # Main game scene and logic
├── index.html          # HTML entry point
└── README.md          # This file
```

## 🎨 Game Mechanics

- **Card Shuffling**: Uses Fisher-Yates shuffle algorithm for random card placement
- **State Management**: Tracks flipped cards, matched pairs, and animation states
- **Animation System**: Prevents input during card flip animations
- **Match Detection**: Compares card types when two cards are flipped

## 🎮 Controls

- **Mouse/Touch**: Click or tap cards to flip them

## 🔧 Customization

You can customize the game by modifying `js/scenes/MainScene.js`:

- **Grid Size**: Change `this.rows` and `this.cols` (currently 4×4)
- **Card Count**: Modify the loop in `createShuffleCards()` to change number of pairs
- **Animation Speed**: Adjust `duration` values in `flipCard()` and `unFlipCard()` methods
- **Card Spacing**: Modify `this.spacing` and `this.topExtraSpacing` values

## 📄 License

ISC

## 👤 Author

Created as part of HTML5 Week 5 project.

---

Enjoy playing! 🎉

