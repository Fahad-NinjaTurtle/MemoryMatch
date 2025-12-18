import MainScene from './scenes/MainScene.js'

// Phaser is loaded from CDN in index.html

/**
 * Detects if the app is running on a mobile device
 * Uses multiple signals for reliability (not screen size dependent)
 */
function isMobileDevice() {
  // Check 1: User Agent (most reliable - catches Android, iOS, etc.)
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  
  // Check 2: Touch capability + Pointer type (mobile devices have touch + coarse pointer)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isTouchDevice = hasTouch && hasCoarsePointer;
  
  // Check 3: Platform (mobile OS strings)
  const platform = navigator.platform?.toLowerCase() || '';
  const isMobilePlatform = /android|iphone|ipad|ipod|mobile/i.test(platform);
  
  // Mobile if: (UA says mobile) OR (touch + coarse pointer) OR (mobile platform)
  return isMobileUA || isTouchDevice || isMobilePlatform;
}

// Get window dimensions
const getGameDimensions = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};

const dimensions = getGameDimensions();

// Device Pixel Ratio handling - different for mobile vs desktop
const rawDPR = window.devicePixelRatio || 1;
const isMobile = isMobileDevice();

// Mobile devices: Use full native DPR for crisp rendering (no cap - uses device's actual DPR)
// Desktop: Cap at 3 for better performance (most desktop displays are 1-2 DPR anyway)
// This ensures mobile devices like S24 Ultra (3.75), S21 Ultra (2.65), Pixel 7 (2.5-3) 
// all use their full native resolution for perfect clarity
const dpr = isMobile ? rawDPR : Math.min(rawDPR, 3);

const config = {
    // AUTO will pick WEBGL when available (better performance), else CANVAS
    // Crispness is controlled via `resolution` below (do NOT multiply width/height by DPR)
    type: Phaser.AUTO,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // CRITICAL: Set resolution to DPR for high-DPI rendering
    // Mobile devices (S21 Ultra, Pixel 7, etc.) often have DPR of 2.5-3.5
    // Using full DPR on mobile ensures crisp, non-pixelated rendering
    // Desktop can use lower DPR (capped at 3) for better performance
    resolution: dpr,
    antialias: true,
    pixelArt: false,

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
