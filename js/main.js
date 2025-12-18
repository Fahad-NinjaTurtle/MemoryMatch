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

// Use full native DPR for all devices - no artificial caps
// This ensures all devices (mobile and desktop) use their full native resolution
// Mobile devices like S24 Ultra (3.75), S21 Ultra (2.65), Pixel 7 (2.5-3)
// Desktop displays (typically 1-2 DPR, but some high-DPI monitors can be higher)
// all use their full native resolution for perfect clarity
const dpr = rawDPR;

// Debug logging (remove in production if needed)
console.log('Device Info:', {
  isMobile,
  rawDPR,
  finalDPR: dpr,
  screenSize: `${dimensions.width}x${dimensions.height}`
});

const config = {
    // Use WEBGL for better texture filtering and high-DPI support on mobile
    // WEBGL provides superior scaling and filtering compared to CANVAS
    // Phaser.AUTO will use WEBGL if available, fallback to CANVAS if not
    // For mobile devices, we prefer WEBGL for crisp rendering
    type: Phaser.WEBGL,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: "#1d1d1d",

    // CRITICAL: Set resolution to DPR for high-DPI rendering
    // Mobile devices (S24 Ultra: 3.75, S21 Ultra: 2.65, Pixel 7: 2.5-3) need full DPR
    // Using full DPR ensures crisp, non-pixelated rendering
    resolution: dpr,
    antialias: true,
    pixelArt: false,
    
    // Additional rendering settings for crisp mobile rendering
    render: {
        // Ensure textures use proper filtering
        antialias: true,
        // Round pixels can cause blurriness on high-DPI, disable it
        roundPixels: false,
        // For very high DPR devices, ensure power preference is set for quality
        powerPreference: "high-performance",
        // Ensure mipmaps are disabled for crisp rendering at high DPR
        mipmapFilter: "LINEAR"
    },

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

    // Verify resolution is set correctly
    const actualResolution = game.config.resolution;
    console.log('Phaser Resolution:', {
        configured: dpr,
        actual: actualResolution,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        cssWidth: canvas.style.width,
        cssHeight: canvas.style.height
    });

    // For very high DPR devices, ensure canvas is rendering at full resolution
    if (isMobile && rawDPR >= 3.5) {
        // Force canvas to use full DPR
        const gl = game.renderer.gl;
        if (gl) {
            // Ensure WebGL viewport matches the high DPR
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }
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
