/**
 * HumanChain — World Developer Portal store image generator
 *
 * Generates all 7 required images at exact portal spec sizes:
 *   logo           512 × 512   (square app icon)
 *   content_card   388 × 388   (World App store card — gates submission)
 *   hero          1920 × 1080  (hero banner)
 *   meta_tag      1200 × 630   (OG / social sharing)
 *   showcase_1     390 × 844   (mobile screenshot #1)
 *   showcase_2     390 × 844   (mobile screenshot #2)
 *   showcase_3     390 × 844   (mobile screenshot #3)
 *
 * Run: node scripts/generate-store-images.js
 */

const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

// ── Brand colours ─────────────────────────────────────────────────────────────
const C = {
  darkGreen:   0x0b2523ff,
  midGreen:    0x185745ff,
  green:       0x246b55ff,
  lightGreen:  0x2e8b6bff,
  paper:       0xfbf7efff,
  paperStrong: 0xfffdf8ff,
  white:       0xffffffff,
  ink:         0x202328ff,
  muted:       0x6f746fff,
  gold:        0xb98218ff,
  blue:        0x2f6fedff,
  line:        0xe8dfd2ff,
};

const OUT = path.join(__dirname, "..", "public", "store-images");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fill a rectangle on an image */
function rect(img, x, y, w, h, color) {
  for (let px = x; px < x + w; px++) {
    for (let py = y; py < y + h; py++) {
      img.setPixelColor(color, px, py);
    }
  }
}

/** Rounded rectangle fill */
function roundRect(img, x, y, w, h, r, color) {
  // Fill the body
  rect(img, x + r, y, w - r * 2, h, color);
  rect(img, x, y + r, w, h - r * 2, color);
  // Four corners
  for (let cx = 0; cx < r; cx++) {
    for (let cy = 0; cy < r; cy++) {
      if ((cx - r) * (cx - r) + (cy - r) * (cy - r) <= r * r) {
        img.setPixelColor(color, x + cx, y + cy);
        img.setPixelColor(color, x + w - 1 - cx, y + cy);
        img.setPixelColor(color, x + cx, y + h - 1 - cy);
        img.setPixelColor(color, x + w - 1 - cx, y + h - 1 - cy);
      }
    }
  }
}

/** Draw a circle */
function circle(img, cx, cy, r, color) {
  for (let x = cx - r; x <= cx + r; x++) {
    for (let y = cy - r; y <= cy + r; y++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        img.setPixelColor(color, x, y);
      }
    }
  }
}

/** Draw a ring (hollow circle) */
function ring(img, cx, cy, outerR, innerR, color) {
  for (let x = cx - outerR; x <= cx + outerR; x++) {
    for (let y = cy - outerR; y <= cy + outerR; y++) {
      const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (d2 <= outerR * outerR && d2 >= innerR * innerR) {
        img.setPixelColor(color, x, y);
      }
    }
  }
}

/** Simple horizontal line */
function hline(img, x, y, len, thick, color) {
  rect(img, x, y - Math.floor(thick / 2), len, thick, color);
}

/** Simple vertical line */
function vline(img, x, y, len, thick, color) {
  rect(img, x - Math.floor(thick / 2), y, thick, len, color);
}

/**
 * Minimal 5×9 pixel font for uppercase A-Z, 0-9, and basic punctuation.
 * Each char is 5 wide × 9 tall, stored as 9 rows of 5-bit masks.
 */
const FONT_5x9 = {
  " ": [0,0,0,0,0,0,0,0,0],
  "A": [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001,0,0],
  "B": [0b11110,0b10001,0b10001,0b11110,0b10001,0b10001,0b11110,0,0],
  "C": [0b01110,0b10001,0b10000,0b10000,0b10000,0b10001,0b01110,0,0],
  "D": [0b11110,0b10001,0b10001,0b10001,0b10001,0b10001,0b11110,0,0],
  "E": [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b11111,0,0],
  "F": [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b10000,0,0],
  "G": [0b01110,0b10001,0b10000,0b10111,0b10001,0b10001,0b01111,0,0],
  "H": [0b10001,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001,0,0],
  "I": [0b01110,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110,0,0],
  "J": [0b00111,0b00001,0b00001,0b00001,0b10001,0b10001,0b01110,0,0],
  "K": [0b10001,0b10010,0b10100,0b11000,0b10100,0b10010,0b10001,0,0],
  "L": [0b10000,0b10000,0b10000,0b10000,0b10000,0b10000,0b11111,0,0],
  "M": [0b10001,0b11011,0b10101,0b10001,0b10001,0b10001,0b10001,0,0],
  "N": [0b10001,0b11001,0b10101,0b10011,0b10001,0b10001,0b10001,0,0],
  "O": [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110,0,0],
  "P": [0b11110,0b10001,0b10001,0b11110,0b10000,0b10000,0b10000,0,0],
  "Q": [0b01110,0b10001,0b10001,0b10001,0b10101,0b10010,0b01101,0,0],
  "R": [0b11110,0b10001,0b10001,0b11110,0b10100,0b10010,0b10001,0,0],
  "S": [0b01111,0b10000,0b10000,0b01110,0b00001,0b00001,0b11110,0,0],
  "T": [0b11111,0b00100,0b00100,0b00100,0b00100,0b00100,0b00100,0,0],
  "U": [0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110,0,0],
  "V": [0b10001,0b10001,0b10001,0b10001,0b01010,0b01010,0b00100,0,0],
  "W": [0b10001,0b10001,0b10001,0b10101,0b10101,0b11011,0b10001,0,0],
  "X": [0b10001,0b01010,0b00100,0b00100,0b00100,0b01010,0b10001,0,0],
  "Y": [0b10001,0b10001,0b01010,0b00100,0b00100,0b00100,0b00100,0,0],
  "Z": [0b11111,0b00001,0b00010,0b00100,0b01000,0b10000,0b11111,0,0],
  "0": [0b01110,0b10001,0b10011,0b10101,0b11001,0b10001,0b01110,0,0],
  "1": [0b00100,0b01100,0b00100,0b00100,0b00100,0b00100,0b01110,0,0],
  "2": [0b01110,0b10001,0b00001,0b00110,0b01000,0b10000,0b11111,0,0],
  "3": [0b11111,0b00001,0b00010,0b00110,0b00001,0b10001,0b01110,0,0],
  "4": [0b00010,0b00110,0b01010,0b10010,0b11111,0b00010,0b00010,0,0],
  "5": [0b11111,0b10000,0b11110,0b00001,0b00001,0b10001,0b01110,0,0],
  "6": [0b00110,0b01000,0b10000,0b11110,0b10001,0b10001,0b01110,0,0],
  "7": [0b11111,0b00001,0b00010,0b00100,0b00100,0b00100,0b00100,0,0],
  "8": [0b01110,0b10001,0b10001,0b01110,0b10001,0b10001,0b01110,0,0],
  "9": [0b01110,0b10001,0b10001,0b01111,0b00001,0b00010,0b01100,0,0],
  ".": [0,0,0,0,0,0b00100,0b00100,0,0],
  ",": [0,0,0,0,0,0b00100,0b00100,0b01000,0],
  "!": [0b00100,0b00100,0b00100,0b00100,0b00100,0,0b00100,0,0],
  "-": [0,0,0,0b11111,0,0,0,0,0],
  ":": [0,0b00100,0b00100,0,0b00100,0b00100,0,0,0],
  "+": [0,0b00100,0b00100,0b11111,0b00100,0b00100,0,0,0],
  "/": [0b00001,0b00010,0b00100,0b01000,0b10000,0,0,0,0],
  "#": [0b01010,0b01010,0b11111,0b01010,0b11111,0b01010,0b01010,0,0],
  "@": [0b01110,0b10001,0b10111,0b10101,0b10110,0b10000,0b01111,0,0],
  "&": [0b01100,0b10010,0b10100,0b01000,0b10101,0b10010,0b01101,0,0],
};

/**
 * Draw pixel-font text at given position.
 * scale=2 makes each pixel 2×2, scale=3 makes 3×3, etc.
 */
function drawText(img, text, startX, startY, scale, color) {
  const charW = 5 * scale + scale; // 5px + 1px gap
  const charH = 9 * scale;
  let x = startX;
  for (const ch of text.toUpperCase()) {
    const glyph = FONT_5x9[ch] || FONT_5x9[" "];
    for (let row = 0; row < 9; row++) {
      const bits = glyph[row] || 0;
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) {
          rect(img, x + col * scale, startY + row * scale, scale, scale, color);
        }
      }
    }
    x += charW;
  }
  return x - startX; // total width used
}

/** Measure text width in pixels */
function textWidth(text, scale) {
  const charW = 5 * scale + scale;
  return text.length * charW;
}

/** Draw centred text */
function drawTextCentered(img, text, centerX, y, scale, color) {
  const w = textWidth(text, scale);
  drawText(img, text, centerX - Math.floor(w / 2), y, scale, color);
}

// ── HumanChain logo shape ─────────────────────────────────────────────────────
// Draws the "HC" initials with a chain-link accent

function drawHCLogo(img, cx, cy, size, fgColor) {
  const s = Math.floor(size / 10); // unit = size/10

  // Left "H" bar — vertical left
  rect(img, cx - 3 * s, cy - 3 * s, s, 6 * s, fgColor);
  // Left "H" bar — vertical right
  rect(img, cx - 1 * s, cy - 3 * s, s, 6 * s, fgColor);
  // Left "H" crossbar
  rect(img, cx - 3 * s, cy - s, 3 * s, s, fgColor);

  // Gap between H and C
  const gapX = cx + s;

  // Right "C" arc — simplified as 3 rectangles
  rect(img, gapX, cy - 3 * s, 3 * s, s, fgColor);     // top bar
  rect(img, gapX, cy - 3 * s, s, 6 * s, fgColor);     // left bar
  rect(img, gapX, cy + 2 * s, 3 * s, s, fgColor);     // bottom bar

  // Small chain link circles
  circle(img, cx - 5 * s, cy + 4 * s, Math.floor(s * 0.7), fgColor);
  circle(img, cx + 5 * s, cy + 4 * s, Math.floor(s * 0.7), fgColor);
}

// ── Verification orb accent ───────────────────────────────────────────────────
function drawOrbAccent(img, cx, cy, r, fgColor) {
  ring(img, cx, cy, r, Math.floor(r * 0.7), fgColor);
  // 3 dots around orbit
  const positions = [
    [cx + r, cy],
    [cx - Math.floor(r * 0.5), cy - Math.floor(r * 0.87)],
    [cx - Math.floor(r * 0.5), cy + Math.floor(r * 0.87)],
  ];
  for (const [x, y] of positions) {
    circle(img, x, y, Math.floor(r * 0.14), fgColor);
  }
}

// ── Background gradient helper ────────────────────────────────────────────────
// We can't do true gradients in jimp without more math, so we do banded approximation
function drawVertGradient(img, x, y, w, h, colorTop, colorBottom, steps = 24) {
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(((colorTop >> 24) & 0xff) * (1 - t) + ((colorBottom >> 24) & 0xff) * t);
    const g = Math.round(((colorTop >> 16) & 0xff) * (1 - t) + ((colorBottom >> 16) & 0xff) * t);
    const b = Math.round(((colorTop >> 8) & 0xff) * (1 - t) + ((colorBottom >> 8) & 0xff) * t);
    const a = 255;
    const color = (r << 24) | (g << 16) | (b << 8) | a;
    const bandY = y + Math.floor(i * h / steps);
    const bandH = Math.floor(h / steps) + 1;
    rect(img, x, bandY, w, bandH, color >>> 0);
  }
}

// ── Decorative corner ring (top-right) ────────────────────────────────────────
function drawCornerDecor(img, w, h, ringColor) {
  // Partial circle at top-right corner
  ring(img, w + 60, -60, 180, 130, ringColor);
  ring(img, -40, h + 40, 160, 110, ringColor);
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE 1 — Logo (512×512)
// ─────────────────────────────────────────────────────────────────────────────
async function genLogo() {
  const w = 512, h = 512;
  const img = new Jimp(w, h, C.darkGreen);

  // Gradient background
  drawVertGradient(img, 0, 0, w, h, C.midGreen, C.darkGreen);

  // Decorative rings
  const ringAlpha = 0x1e; // very transparent white
  ring(img, w + 80, -80, 280, 200, ((0xff << 24) | (0xff << 16) | (0xfd << 8) | ringAlpha) >>> 0);
  ring(img, -60, h + 60, 240, 170, ((0xff << 24) | (0xff << 16) | (0xfd << 8) | ringAlpha) >>> 0);

  // Gold accent circle (top-left area)
  circle(img, 100, 108, 28, 0xb9821830);

  // Main HC logo — white, centred, large
  const logoSize = 220;
  drawHCLogo(img, Math.floor(w / 2) - 10, Math.floor(h / 2) - 20, logoSize, C.white);

  // "HUMANCHAIN" wordmark below
  drawTextCentered(img, "HUMANCHAIN", w / 2, h / 2 + 80, 4, C.paperStrong);

  // World verification badge dot (gold)
  circle(img, w - 96, h - 92, 22, C.gold);
  circle(img, w - 96, h - 92, 16, C.darkGreen);
  circle(img, w - 96, h - 92, 7, C.gold);

  const out = path.join(OUT, "logo.png");
  await img.writeAsync(out);
  console.log(`✓ logo.png saved (${w}×${h})`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE 2 — Content Card (388×388)  ← gates World App store submission
// ─────────────────────────────────────────────────────────────────────────────
async function genContentCard() {
  const w = 388, h = 388;
  const img = new Jimp(w, h, C.darkGreen);

  drawVertGradient(img, 0, 0, w, h, 0x0f3330ff, C.darkGreen);

  // Subtle decorative rings
  ring(img, w + 40, -40, 200, 150, 0xffffff12);
  ring(img, -30, h + 30, 180, 130, 0xffffff0d);

  // Blue accent blob top-right
  circle(img, w - 40, 50, 48, 0x2f6fed18);
  circle(img, w - 40, 50, 28, 0x2f6fed28);

  // Gold accent dot
  circle(img, 48, 48, 16, C.gold);
  circle(img, 48, 48, 10, C.darkGreen);
  circle(img, 48, 48, 5, C.gold);

  // HC logo — centred, prominent
  drawHCLogo(img, w / 2 - 8, h / 2 - 50, 160, C.white);

  // "HUMANCHAIN" title
  drawTextCentered(img, "HUMANCHAIN", w / 2, h / 2 + 42, 3, C.white);

  // Tagline
  drawTextCentered(img, "VERIFIED HUMAN NETWORK", w / 2, h / 2 + 76, 2, 0xfbf7efcc);

  // Bottom: World ID badge row
  const badgeY = h - 58;
  roundRect(img, w / 2 - 90, badgeY, 180, 28, 8, 0xffffff18);
  drawTextCentered(img, "WORLD ID VERIFIED", w / 2, badgeY + 10, 2, C.paperStrong);

  const out = path.join(OUT, "content_card.png");
  await img.writeAsync(out);
  console.log(`✓ content_card.png saved (${w}×${h})`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE 3 — Hero (1920×1080)
// ─────────────────────────────────────────────────────────────────────────────
async function genHero() {
  const w = 1920, h = 1080;
  const img = new Jimp(w, h, C.darkGreen);

  drawVertGradient(img, 0, 0, w, h, 0x0d2b28ff, 0x071a18ff);

  // Left gradient tint (green)
  for (let x = 0; x < 600; x++) {
    const alpha = Math.floor(60 * (1 - x / 600));
    const col = ((0x24 << 24) | (0x6b << 16) | (0x55 << 8) | alpha) >>> 0;
    vline(img, x, 0, h, 1, col);
  }

  // Top-right orb accent
  circle(img, w - 200, 200, 320, 0x2f6fed14);
  circle(img, w - 200, 200, 200, 0x2f6fed20);
  ring(img, w - 200, 200, 280, 230, 0xffffff18);

  // Gold accent rings
  ring(img, 120, h - 120, 220, 180, 0xb9821818);
  circle(img, 120, h - 120, 32, C.gold);
  circle(img, 120, h - 120, 22, C.darkGreen);
  circle(img, 120, h - 120, 10, C.gold);

  // Large HC logo — left side
  drawHCLogo(img, 300, h / 2, 340, C.white);

  // Main headline — right of logo
  const tx = 580;
  drawText(img, "HUMANCHAIN", tx, h / 2 - 160, 8, C.white);
  drawText(img, "REAL HUMANS.", tx, h / 2 - 50, 5, C.paperStrong);
  drawText(img, "REAL WISDOM.", tx, h / 2 + 20, 5, C.paperStrong);
  drawText(img, "REAL TRUST.", tx, h / 2 + 90, 5, C.paperStrong);

  // Feature pills row
  const pills = ["ASK", "MOMENTS", "MARKET", "STORIES", "PASSPORT"];
  let pillX = tx;
  const pillY = h / 2 + 180;
  for (const label of pills) {
    const pw = textWidth(label, 3) + 28;
    roundRect(img, pillX, pillY, pw, 36, 8, 0xffffff22);
    drawText(img, label, pillX + 14, pillY + 12, 3, C.white);
    pillX += pw + 14;
  }

  // Bottom tagline
  drawTextCentered(img, "WORLD ID VERIFIED - NO BOTS - NO FAKE ACCOUNTS", w / 2, h - 80, 3, 0xfbf7ef88);

  // Vertical divider between logo and text
  vline(img, tx - 40, h / 2 - 200, 480, 2, 0xffffff28);

  const out = path.join(OUT, "hero.png");
  await img.writeAsync(out);
  console.log(`✓ hero.png saved (${w}×${h})`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE 4 — Meta Tag (1200×630)
// ─────────────────────────────────────────────────────────────────────────────
async function genMetaTag() {
  const w = 1200, h = 630;
  const img = new Jimp(w, h, C.darkGreen);

  drawVertGradient(img, 0, 0, w, h, 0x0f3330ff, 0x071a18ff);

  // Orb at right
  circle(img, w - 140, h / 2, 220, 0x2f6fed14);
  circle(img, w - 140, h / 2, 140, 0x2f6fed1e);
  ring(img, w - 140, h / 2, 195, 155, 0xffffff1a);

  // Gold dot
  circle(img, 80, h - 80, 24, C.gold);
  circle(img, 80, h - 80, 15, C.darkGreen);
  circle(img, 80, h - 80, 7, C.gold);

  // Logo left
  drawHCLogo(img, 180, h / 2 - 20, 220, C.white);

  // Divider
  vline(img, 340, h / 2 - 160, 320, 2, 0xffffff30);

  // Text block
  const tx = 380;
  drawText(img, "HUMANCHAIN", tx, h / 2 - 150, 7, C.white);
  drawText(img, "VERIFIED HUMAN NETWORK", tx, h / 2 - 60, 3, 0xb98218ff);
  drawText(img, "ASK REAL HUMANS.", tx, h / 2 - 5, 3, C.paperStrong);
  drawText(img, "POST MOMENTS.", tx, h / 2 + 32, 3, C.paperStrong);
  drawText(img, "TRADE SAFELY.", tx, h / 2 + 69, 3, C.paperStrong);
  drawText(img, "BUILD YOUR PASSPORT.", tx, h / 2 + 106, 3, C.paperStrong);

  // Bottom bar
  rect(img, 0, h - 56, w, 56, 0x0b2523ff);
  drawTextCentered(img, "INSIDE WORLD APP - WORLD ID REQUIRED", w / 2, h - 36, 3, 0xfbf7ef88);

  const out = path.join(OUT, "meta_tag.png");
  await img.writeAsync(out);
  console.log(`✓ meta_tag.png saved (${w}×${h})`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOWCASE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function drawPhoneFrame(img, w, h, bgColor) {
  // Solid background
  img.scan(0, 0, w, h, function (x, y, idx) {
    this.bitmap.data[idx] = (bgColor >> 24) & 0xff;
    this.bitmap.data[idx + 1] = (bgColor >> 16) & 0xff;
    this.bitmap.data[idx + 2] = (bgColor >> 8) & 0xff;
    this.bitmap.data[idx + 3] = bgColor & 0xff;
  });
  // Top notch / status bar area
  rect(img, 0, 0, w, 52, C.darkGreen);
  // Status bar dots
  circle(img, w / 2, 26, 8, 0xffffff30);
  // Bottom nav bar
  rect(img, 0, h - 72, w, 72, C.darkGreen);
  // Nav icons
  const navItems = ["HOME", "ASK", "CHAIN", "MARKET", "ME"];
  const navW = w / navItems.length;
  for (let i = 0; i < navItems.length; i++) {
    const nx = Math.floor(i * navW + navW / 2);
    circle(img, nx, h - 50, 8, i === 0 ? C.green : 0xffffff30);
    drawTextCentered(img, navItems[i], nx, h - 34, 1, i === 0 ? C.green : 0xffffff60);
  }
}

function drawCard(img, x, y, w, h, bgColor, radius = 16) {
  roundRect(img, x, y, w, h, radius, bgColor);
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE 5 — Showcase 1 (390×844) — Digital Passport / Home
// ─────────────────────────────────────────────────────────────────────────────
async function genShowcase1() {
  const w = 390, h = 844;
  const img = new Jimp(w, h, C.paper);
  drawVertGradient(img, 0, 0, w, h, C.paper, 0xf4efe6ff);
  drawPhoneFrame(img, w, h, C.paper);

  // Top bar
  rect(img, 0, 52, w, 54, C.paper);
  // Avatar circle
  circle(img, 44, 79, 22, C.green);
  drawText(img, "H", 38, 72, 3, C.white);
  // Username
  drawText(img, "@VERIFIED", 76, 66, 2, C.ink);
  drawText(img, "HUMAN NETWORK", 76, 82, 1, C.muted);
  // Bell
  circle(img, w - 52, 79, 18, 0xe8dfd2ff);
  drawText(img, "!", w - 56, 72, 2, C.ink);

  // Digital Card
  const cardY = 116;
  const cardH = 210;
  roundRect(img, 12, cardY, w - 24, cardH, 20, C.midGreen);
  drawVertGradient(img, 12, cardY, w - 24, cardH, 0x0f3330ff, 0x0b2523ff);

  drawText(img, "DIGITAL CARD", 30, cardY + 14, 2, 0xfbf7ef88);
  // Avatar in card
  roundRect(img, w / 2 - 34, cardY + 32, 68, 68, 14, 0xfffdf8ff);
  drawText(img, "H", w / 2 - 14, cardY + 50, 5, C.darkGreen);
  drawText(img, "@HUMANUSER", w / 2 - 52, cardY + 112, 2, C.white);
  // Score
  drawText(img, "251", w / 2 - 20, cardY + 134, 4, C.white);
  drawText(img, "BRONZE HUMAN", w / 2 - 56, cardY + 162, 2, 0xfbf7efcc);
  // Verified chip
  roundRect(img, w / 2 - 64, cardY + 182, 128, 20, 10, 0xffffff1a);
  drawTextCentered(img, "WORLD ID VERIFIED", w / 2, cardY + 189, 2, C.white);

  // Quick nav grid
  const navY = cardY + cardH + 14;
  const navBtns = [["ASK", C.green], ["MOMENTS", 0x1f6f86ff], ["MARKET", 0x9a6a0bff], ["STORIES", 0x33404fff]];
  const btnW = (w - 24 - 9) / 4;
  for (let i = 0; i < 4; i++) {
    const [label, col] = navBtns[i];
    const bx = 12 + i * (btnW + 3);
    roundRect(img, bx, navY, btnW, 58, 12, col);
    drawTextCentered(img, label, bx + btnW / 2, navY + 22, 2, C.white);
  }

  // Daily question card
  const dqY = navY + 70;
  roundRect(img, 12, dqY, w - 24, 86, 14, C.paperStrong);
  drawText(img, "TODAY'S QUESTION", 24, dqY + 10, 2, C.green);
  drawText(img, "+18 HP", w - 76, dqY + 10, 2, C.gold);
  drawText(img, "WHAT TRUTH DID LIFE", 24, dqY + 30, 2, C.ink);
  drawText(img, "TEACH YOU THIS WEEK?", 24, dqY + 46, 2, C.ink);
  roundRect(img, 24, dqY + 62, 100, 16, 6, C.green);
  drawTextCentered(img, "ANSWER", 74, dqY + 67, 2, C.white);

  // Score row
  const scoreY = dqY + 100;
  const scoreCards = [["SCORE", "251"], ["STREAK", "4D"], ["GROWTH", "+7"], ["SAFETY", "CLEAN"]];
  const scW = (w - 24 - 9) / 4;
  for (let i = 0; i < 4; i++) {
    const [lbl, val] = scoreCards[i];
    const sx = 12 + i * (scW + 3);
    roundRect(img, sx, scoreY, scW, 60, 10, C.paperStrong);
    drawTextCentered(img, lbl, sx + scW / 2, scoreY + 8, 1, C.muted);
    drawTextCentered(img, val, sx + scW / 2, scoreY + 28, 3, C.green);
  }

  // App title
  drawTextCentered(img, "HUMANCHAIN", w / 2, h - 92, 3, C.green);

  const out = path.join(OUT, "showcase_1.png");
  await img.writeAsync(out);
  console.log(`✓ showcase_1.png saved (${w}×${h})`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE 6 — Showcase 2 (390×844) — Ask & Daily Question
// ─────────────────────────────────────────────────────────────────────────────
async function genShowcase2() {
  const w = 390, h = 844;
  const img = new Jimp(w, h, C.paper);
  drawVertGradient(img, 0, 0, w, h, C.paper, 0xf0ede8ff);
  drawPhoneFrame(img, w, h, C.paper);

  // Top bar
  rect(img, 0, 52, w, 54, C.paper);
  drawTextCentered(img, "ASK VERIFIED HUMANS", w / 2, 76, 3, C.ink);

  // Hero question card
  const hqY = 116;
  roundRect(img, 12, hqY, w - 24, 180, 18, C.midGreen);
  drawVertGradient(img, 12, hqY, w - 24, 180, 0x0f3330ff, 0x185745ff);

  drawText(img, "DAILY HUMAN QUESTION", 28, hqY + 14, 2, 0xfbf7ef88);
  drawText(img, "+18 HP", w - 80, hqY + 14, 2, C.gold);
  drawText(img, "WHAT TRUTH DID", 28, hqY + 40, 3, C.white);
  drawText(img, "LIFE TEACH YOU", 28, hqY + 66, 3, C.white);
  drawText(img, "THIS WEEK?", 28, hqY + 92, 3, C.white);

  // Answer input area
  roundRect(img, 28, hqY + 122, w - 56, 36, 8, 0xffffff18);
  drawText(img, "WRITE YOUR ANSWER...", 40, hqY + 134, 2, 0xfbf7ef66);
  roundRect(img, w - 96, hqY + 154, 72, 18, 6, C.gold);
  drawTextCentered(img, "SUBMIT", w - 60, hqY + 161, 2, C.darkGreen);

  // Live answers section
  const laY = hqY + 200;
  drawText(img, "LIVE ANSWERS TODAY", 16, laY + 8, 2, C.green);
  drawText(img, "3", w - 30, laY + 8, 2, C.gold);

  const answers = [
    ["@truth.keeper", "Life taught me that patience is not waiting..."],
    ["@wisdom.chain", "The truth is in the small moments nobody sees."],
    ["@human.voice", "Real trust comes before real connection."],
  ];
  for (let i = 0; i < answers.length; i++) {
    const ay = laY + 32 + i * 76;
    roundRect(img, 12, ay, w - 24, 68, 12, C.paperStrong);
    // Avatar
    circle(img, 36, ay + 22, 14, C.green);
    drawText(img, answers[i][0].slice(1, 2).toUpperCase(), 31, ay + 15, 2, C.white);
    // Username
    drawText(img, answers[i][0].toUpperCase(), 58, ay + 10, 2, C.green);
    // Answer text (truncated)
    drawText(img, answers[i][1].slice(0, 28).toUpperCase(), 58, ay + 28, 1, C.ink);
    drawText(img, answers[i][1].slice(28, 56).toUpperCase(), 58, ay + 40, 1, C.muted);
    // Verified badge
    circle(img, w - 36, ay + 20, 10, C.blue);
    drawText(img, "V", w - 40, ay + 14, 2, C.white);
  }

  // HP reward badge
  const badgeY = laY + 268;
  roundRect(img, 12, badgeY, w - 24, 48, 12, 0xeef8f3ff);
  drawText(img, "ANSWER DAILY = +18 HP TO YOUR PASSPORT", 20, badgeY + 16, 2, C.green);

  drawTextCentered(img, "HUMANCHAIN", w / 2, h - 92, 3, C.green);

  const out = path.join(OUT, "showcase_2.png");
  await img.writeAsync(out);
  console.log(`✓ showcase_2.png saved (${w}×${h})`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE 7 — Showcase 3 (390×844) — Human Passport & Referral
// ─────────────────────────────────────────────────────────────────────────────
async function genShowcase3() {
  const w = 390, h = 844;
  const img = new Jimp(w, h, C.paper);
  drawVertGradient(img, 0, 0, w, h, C.paper, 0xf4efe6ff);
  drawPhoneFrame(img, w, h, C.paper);

  rect(img, 0, 52, w, 54, C.paper);
  drawTextCentered(img, "HUMAN PASSPORT", w / 2, 76, 3, C.ink);

  // Passport hero block
  const phY = 116;
  roundRect(img, 12, phY, w - 24, 150, 18, C.midGreen);
  drawVertGradient(img, 12, phY, w - 24, 150, 0x082622ff, 0x185745ff);

  // Avatar in passport
  roundRect(img, 28, phY + 24, 64, 64, 14, C.paperStrong);
  drawText(img, "H", 44, phY + 40, 5, C.darkGreen);
  // Passport info
  drawText(img, "@HUMANUSER", 108, phY + 28, 2, C.white);
  drawText(img, "WORLD ID VERIFIED", 108, phY + 46, 2, 0xb98218ff);
  drawText(img, "BRONZE HUMAN", 108, phY + 64, 2, 0xfbf7efcc);
  // Score
  drawText(img, "251", 108, phY + 90, 5, C.white);
  drawText(img, "HUMAN SCORE", 108, phY + 124, 2, 0xfbf7ef88);

  // Verified badge
  roundRect(img, w - 120, phY + 14, 104, 20, 8, 0xffffff1a);
  drawTextCentered(img, "WORLD VERIFIED", w - 68, phY + 21, 2, C.white);

  // Stats row
  const statsY = phY + 168;
  const stats = [["251", "SCORE"], ["4D", "STREAK"], ["420", "HP"], ["CLEAN", "SAFETY"]];
  const stW = (w - 24 - 9) / 4;
  for (let i = 0; i < 4; i++) {
    const [val, lbl] = stats[i];
    const sx = 12 + i * (stW + 3);
    roundRect(img, sx, statsY, stW, 56, 10, C.paperStrong);
    drawTextCentered(img, val, sx + stW / 2, statsY + 8, 3, C.green);
    drawTextCentered(img, lbl, sx + stW / 2, statsY + 36, 1, C.muted);
  }

  // Referral card
  const refY = statsY + 70;
  roundRect(img, 12, refY, w - 24, 138, 16, 0xf0f4ffff);
  // Blue border
  rect(img, 12, refY, 4, 138, C.blue);

  drawText(img, "INVITE A HUMAN", 28, refY + 12, 3, C.ink);
  drawText(img, "+50 HP PER VERIFIED JOIN", 28, refY + 34, 2, C.blue);
  drawText(img, "SHARE YOUR LINK - EARN HP", 28, refY + 52, 2, C.muted);
  drawText(img, "WORLDCOIN.ORG/MINI-APP?APP-ID=...", 28, refY + 70, 1, C.blue);

  // Progress bar
  rect(img, 28, refY + 90, w - 56, 8, 0xe8dfd2ff);
  rect(img, 28, refY + 90, Math.floor((w - 56) * 0.33), 8, C.blue);
  drawText(img, "1/3 TO CONNECTOR BADGE", 28, refY + 106, 2, C.muted);

  // Share button
  roundRect(img, 28, refY + 110, 110, 22, 8, C.blue);
  drawTextCentered(img, "SHARE", 83, refY + 117, 2, C.white);
  roundRect(img, 150, refY + 110, 80, 22, 8, 0xe8dfd2ff);
  drawTextCentered(img, "COPY", 190, refY + 117, 2, C.ink);

  // Badges section
  const badgeY = refY + 150;
  drawText(img, "EARNED BADGES", 16, badgeY + 8, 2, C.green);
  const badges = ["WORLD ID VERIFIED", "BRONZE HUMAN", "NEW BUILDER"];
  for (let i = 0; i < badges.length; i++) {
    const bx = 12 + i * ((w - 24) / 3 + 2);
    const bw = (w - 36) / 3;
    roundRect(img, bx, badgeY + 28, bw, 28, 8, 0xe8dfd2ff);
    drawTextCentered(img, badges[i].slice(0, 10), bx + bw / 2, badgeY + 36, 1, C.ink);
  }

  drawTextCentered(img, "HUMANCHAIN", w / 2, h - 92, 3, C.green);

  const out = path.join(OUT, "showcase_3.png");
  await img.writeAsync(out);
  console.log(`✓ showcase_3.png saved (${w}×${h})`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Generating HumanChain store images...\n");

  const logo       = await genLogo();
  const card       = await genContentCard();
  const hero       = await genHero();
  const meta       = await genMetaTag();
  const show1      = await genShowcase1();
  const show2      = await genShowcase2();
  const show3      = await genShowcase3();

  console.log("\n✅ All 7 images generated:");
  console.log(`   ${logo}`);
  console.log(`   ${card}`);
  console.log(`   ${hero}`);
  console.log(`   ${meta}`);
  console.log(`   ${show1}`);
  console.log(`   ${show2}`);
  console.log(`   ${show3}`);
  console.log(`\nSaved to: ${OUT}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
