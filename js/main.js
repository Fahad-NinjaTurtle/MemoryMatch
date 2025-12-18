import MainScene from './scenes/MainScene.js'

// Phaser is loaded from CDN in index.html

// Get window dimensions
const getGameDimensions = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};

const dimensions = getGameDimensions();

// High refresh rate screens (90Hz+) often need higher DPR
// Use full DPR for mobile devices to prevent pixelation
// Cap at 4 to avoid performance issues on extremely high DPR devices
const rawDPR = window.devicePixelRatio || 1;
const MAX_DPR = 4; // Allow up to 4x for very high-DPI mobile screens
const dpr = Math.min(rawDPR, MAX_DPR);

const config = {
    // AUTO tries WEBGL first (better quality), falls back to CANVAS if unavailable
    // WEBGL provides better texture filtering and scaling on mobile devices
    type: Phaser.AUTO, // AUTO ensures compatibility while preferring WEBGL for quality
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // CRITICAL: Set resolution to full DPR (up to 4x) for high-DPI rendering
    // This prevents pixelation on mobile devices with DPR > 2 (S21 Ultra, S24 Ultra, etc.)
    // Previously capped at 2, which caused pixelation on high-DPI phones
    resolution: dpr,
    antialias: true,
    pixelArt: false, // false = smooth scaling, true = pixel-perfect (causes pixelation)
    roundPixels: true, // Force integer pixel positions - prevents blur on mobile from fractional pixels

    scale: {
        mode: Phaser.Scale.RESIZE,  // Resize to fit container
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    parent: 'game-container',
    scene: [MainScene]
};

const game = new Phaser.Game(config);

/**
 * Ensures Phaser's canvas is properly configured for high-DPI displays
 * This fixes blurriness on mobile devices by ensuring the canvas
 * uses the correct device pixel ratio
 */
function ensureCrispCanvas() {
    // Wait for Phaser to fully initialize
    if (game.isBooted) {
        applyCrispCanvasFix();
    } else {
        game.events.once('ready', applyCrispCanvasFix);
    }
}

function applyCrispCanvasFix() {
    const canvas = game.canvas;
    if (!canvas) return;

    // Phaser handles internal canvas sizing via resolution property
    // The resolution property in config ensures high-DPI rendering
    // This function is here for any additional canvas optimizations if needed
}

// Apply crisp canvas fix after initialization
ensureCrispCanvas();

// Handle window resize
window.addEventListener('resize', () => {
    const newDimensions = getGameDimensions();
    game.scale.resize(newDimensions.width, newDimensions.height);
    
    // Re-apply crisp canvas fix on resize
    applyCrispCanvasFix();
});

// Expose game instance for HTML interaction
window.gameInstance = game;

// Debug: Log renderer type to verify WebGL is being used
game.events.once('ready', () => {
  // Check what renderer AUTO actually chose
  const actualRenderer = game.renderer;
  const rendererType = actualRenderer ? actualRenderer.type : 'N/A';
  
  let rendererName = 'UNKNOWN';
  if (rendererType === Phaser.WEBGL || rendererType === 1) {
    rendererName = 'WEBGL ✅';
  } else if (rendererType === Phaser.CANVAS || rendererType === 0) {
    rendererName = 'CANVAS ⚠️';
  } else if (rendererType === Phaser.AUTO || rendererType === 2) {
    // AUTO means it will try WEBGL first - check what it actually used
    const gl = actualRenderer.gl;
    rendererName = gl ? 'WEBGL ✅ (via AUTO)' : 'CANVAS ⚠️ (via AUTO)';
  }
  
  // Check actual canvas resolution (this is what matters for rendering)
  const canvas = game.canvas;
  const canvasWidth = canvas ? canvas.width : 'N/A';
  const canvasHeight = canvas ? canvas.height : 'N/A';
  const canvasStyleWidth = canvas ? canvas.style.width : 'N/A';
  const canvasStyleHeight = canvas ? canvas.style.height : 'N/A';
  
  // Calculate actual resolution being used
  const actualResolution = canvas && canvasStyleWidth !== 'N/A' 
    ? canvasWidth / parseFloat(canvasStyleWidth) 
    : 'N/A';
  
  console.log('=== Phaser Rendering Info ===');
  console.log('Config Renderer Type:', config.type === Phaser.AUTO ? 'AUTO (2)' : config.type);
  console.log('Actual Renderer:', rendererName, `(type: ${rendererType})`);
  console.log('Device Pixel Ratio:', window.devicePixelRatio);
  console.log('Config Resolution:', config.resolution, '(this is what we set)');
  console.log('Canvas Resolution:', actualResolution, '(actual resolution being used)');
  console.log('Canvas Size:', `${canvasWidth}×${canvasHeight} (internal)`);
  console.log('Canvas Display:', `${canvasStyleWidth}×${canvasStyleHeight} (CSS)`);
  console.log('Round Pixels:', config.roundPixels);
  console.log('Antialias:', config.antialias);
  console.log('===========================');
  
  // Warn if resolution doesn't match DPR
  if (actualResolution !== 'N/A' && Math.abs(actualResolution - config.resolution) > 0.1) {
    console.warn('⚠️ Resolution mismatch! Config:', config.resolution, 'Actual:', actualResolution);
  }
});
