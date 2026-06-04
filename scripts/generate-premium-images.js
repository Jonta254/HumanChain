/**
 * HumanChain — Premium World Developer Portal store images
 * Uses sharp + SVG with real logo embedded, golden palette, realistic UI.
 *
 * Run: node scripts/generate-premium-images.js
 */

"use strict";

const sharp  = require("sharp");
const path   = require("path");
const fs     = require("fs");

const OUT = path.join(__dirname, "..", "public", "store-images");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ── Logo base64 cache ─────────────────────────────────────────────────────────
const logoCache = {};
async function logoB64(size) {
  if (logoCache[size]) return logoCache[size];
  const buf = await sharp(path.join(__dirname, "..", "public", "images", "humanchain-logo.png"))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  logoCache[size] = buf.toString("base64");
  return logoCache[size];
}
async function logoDataUri(size) {
  return `data:image/png;base64,${await logoB64(size)}`;
}

// ── SVG → PNG via sharp ───────────────────────────────────────────────────────
async function svgToPng(svgStr, outFile, w, h) {
  const buf = Buffer.from(svgStr);
  await sharp(buf, { density: 144 }).resize(w, h).png({ compressionLevel: 8 }).toFile(outFile);
  const stat = fs.statSync(outFile);
  console.log(`✓ ${path.basename(outFile)} (${w}×${h}) — ${(stat.size / 1024).toFixed(1)} KB`);
}

// ── ════════════════════════════════════════════════════════════════════════════
// IMAGE 1 — Logo  512×512
// ════════════════════════════════════════════════════════════════════════════ ──
async function genLogo() {
  const uri = await logoDataUri(260);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d2b28"/>
      <stop offset="55%" stop-color="#122f2b"/>
      <stop offset="100%" stop-color="#071a17"/>
    </linearGradient>
    <radialGradient id="goldGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#d4a820" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#d4a820" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#246b55" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#246b55" stop-opacity="0"/>
    </radialGradient>
    <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000" flood-opacity="0.4"/>
    </filter>
    <filter id="goldGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg)"/>

  <!-- Subtle green ambient -->
  <ellipse cx="256" cy="256" rx="280" ry="280" fill="url(#greenGlow)"/>

  <!-- Gold glow halo behind logo -->
  <ellipse cx="256" cy="220" rx="200" ry="180" fill="url(#goldGlow)"/>

  <!-- Outer ring (faint) -->
  <circle cx="256" cy="220" r="168" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.18"/>
  <!-- Inner ring -->
  <circle cx="256" cy="220" r="140" fill="none" stroke="#fffdf8" stroke-width="0.8" stroke-opacity="0.12"/>

  <!-- Gold shimmer arc (top) -->
  <path d="M 108 190 A 150 150 0 0 1 404 190"
        fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.3"
        stroke-dasharray="8 6"/>

  <!-- Logo circle backing -->
  <circle cx="256" cy="220" r="122" fill="#0b2523" fill-opacity="0.7"/>
  <circle cx="256" cy="220" r="122" fill="none" stroke="#d4a820" stroke-width="2" stroke-opacity="0.5"/>

  <!-- Actual HC logo -->
  <image href="${uri}" x="126" y="90" width="260" height="260" filter="url(#logoShadow)"/>

  <!-- Gold dot accents on ring -->
  <circle cx="256" cy="98" r="5" fill="#d4a820"/>
  <circle cx="378" cy="220" r="4" fill="#d4a820" fill-opacity="0.7"/>
  <circle cx="134" cy="220" r="4" fill="#d4a820" fill-opacity="0.7"/>
  <circle cx="342" cy="120" r="3" fill="#fffdf8" fill-opacity="0.4"/>
  <circle cx="170" cy="120" r="3" fill="#fffdf8" fill-opacity="0.4"/>

  <!-- Wordmark -->
  <text x="256" y="394" font-family="Arial, Helvetica, sans-serif"
        font-size="38" font-weight="bold" fill="#fffdf8"
        text-anchor="middle" letter-spacing="5">HUMANCHAIN</text>

  <!-- Gold rule under wordmark -->
  <line x1="116" y1="406" x2="396" y2="406" stroke="#d4a820" stroke-width="1" stroke-opacity="0.55"/>

  <!-- Tagline -->
  <text x="256" y="432" font-family="Arial, Helvetica, sans-serif"
        font-size="14" fill="#d4a820" text-anchor="middle" letter-spacing="3">
    VERIFIED HUMAN NETWORK
  </text>

  <!-- World ID chip -->
  <rect x="178" y="450" width="156" height="26" rx="13" fill="#246b55" fill-opacity="0.5"/>
  <rect x="178" y="450" width="156" height="26" rx="13" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.6"/>
  <text x="256" y="467" font-family="Arial, Helvetica, sans-serif"
        font-size="11" fill="#fffdf8" text-anchor="middle" letter-spacing="1.5">
    WORLD ID VERIFIED
  </text>

  <!-- Four corner micro-accents -->
  <line x1="20" y1="20" x2="48" y2="20" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <line x1="20" y1="20" x2="20" y2="48" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <line x1="492" y1="20" x2="464" y2="20" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <line x1="492" y1="20" x2="492" y2="48" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <line x1="20" y1="492" x2="48" y2="492" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <line x1="20" y1="492" x2="20" y2="464" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <line x1="492" y1="492" x2="464" y2="492" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <line x1="492" y1="492" x2="492" y2="464" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
</svg>`;
  await svgToPng(svg, path.join(OUT, "logo.png"), 512, 512);
}

// ── ════════════════════════════════════════════════════════════════════════════
// IMAGE 2 — Content Card  388×388
// ════════════════════════════════════════════════════════════════════════════ ──
async function genContentCard() {
  const uri = await logoDataUri(180);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="388" height="388" viewBox="0 0 388 388">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#0f3330"/>
      <stop offset="60%" stop-color="#0b2523"/>
      <stop offset="100%" stop-color="#071a17"/>
    </linearGradient>
    <radialGradient id="goldBurst" cx="50%" cy="42%" r="48%">
      <stop offset="0%" stop-color="#d4a820" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#d4a820" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blueAccent" cx="85%" cy="12%" r="35%">
      <stop offset="0%" stop-color="#2f6fed" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#2f6fed" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="388" height="388" fill="url(#bg)"/>
  <rect width="388" height="388" fill="url(#goldBurst)"/>
  <rect width="388" height="388" fill="url(#blueAccent)"/>

  <!-- Decorative rings -->
  <circle cx="194" cy="172" r="128" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.2"/>
  <circle cx="194" cy="172" r="104" fill="none" stroke="#fffdf8" stroke-width="0.6" stroke-opacity="0.1"/>

  <!-- Gold shimmer partial arc -->
  <path d="M 72 148 A 124 124 0 0 1 316 148"
        fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.35" stroke-dasharray="6 5"/>

  <!-- Logo circle backing with gold ring -->
  <circle cx="194" cy="172" r="88" fill="#0a1f1d" fill-opacity="0.75"/>
  <circle cx="194" cy="172" r="88" fill="none" stroke="#d4a820" stroke-width="2.5" stroke-opacity="0.6"/>

  <!-- Logo -->
  <image href="${uri}" x="104" y="82" width="180" height="180" filter="url(#shadow)"/>

  <!-- Gold dot top of ring -->
  <circle cx="194" cy="84" r="5" fill="#d4a820"/>
  <circle cx="282" cy="172" r="3.5" fill="#d4a820" fill-opacity="0.6"/>
  <circle cx="106" cy="172" r="3.5" fill="#d4a820" fill-opacity="0.6"/>

  <!-- App name -->
  <text x="194" y="296" font-family="Arial, Helvetica, sans-serif"
        font-size="28" font-weight="bold" fill="#fffdf8"
        text-anchor="middle" letter-spacing="4">HUMANCHAIN</text>

  <!-- Gold divider -->
  <line x1="94" y1="308" x2="294" y2="308" stroke="#d4a820" stroke-width="1" stroke-opacity="0.5"/>

  <!-- Tagline -->
  <text x="194" y="330" font-family="Arial, Helvetica, sans-serif"
        font-size="12" fill="#d4a820" text-anchor="middle" letter-spacing="2.5">
    VERIFIED HUMAN NETWORK
  </text>

  <!-- World ID badge -->
  <rect x="122" y="348" width="144" height="24" rx="12" fill="#246b55" fill-opacity="0.45"/>
  <rect x="122" y="348" width="144" height="24" rx="12" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.55"/>
  <text x="194" y="364" font-family="Arial, Helvetica, sans-serif"
        font-size="10" fill="#fffdf8" text-anchor="middle" letter-spacing="1.5">
    WORLD ID VERIFIED
  </text>

  <!-- Corner accents -->
  <line x1="14" y1="14" x2="36" y2="14" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <line x1="14" y1="14" x2="14" y2="36" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <line x1="374" y1="14" x2="352" y2="14" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <line x1="374" y1="14" x2="374" y2="36" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <line x1="14" y1="374" x2="36" y2="374" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <line x1="14" y1="374" x2="14" y2="352" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <line x1="374" y1="374" x2="352" y2="374" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <line x1="374" y1="374" x2="374" y2="352" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
</svg>`;
  await svgToPng(svg, path.join(OUT, "content_card.png"), 388, 388);
}

// ── ════════════════════════════════════════════════════════════════════════════
// IMAGE 3 — Hero  1920×1080
// ════════════════════════════════════════════════════════════════════════════ ──
async function genHero() {
  const uri = await logoDataUri(320);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a2320"/>
      <stop offset="45%" stop-color="#0d2b28"/>
      <stop offset="100%" stop-color="#071510"/>
    </linearGradient>
    <linearGradient id="leftPanel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0b2523"/>
      <stop offset="100%" stop-color="#0b2523" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="goldHalo" cx="38%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#d4a820" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#d4a820" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blueOrb" cx="80%" cy="50%" r="30%">
      <stop offset="0%" stop-color="#2f6fed" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#2f6fed" stop-opacity="0"/>
    </radialGradient>
    <filter id="logoShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="24" flood-color="#000" flood-opacity="0.4"/>
    </filter>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="goldText" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d4a820"/>
      <stop offset="50%" stop-color="#ffd060"/>
      <stop offset="100%" stop-color="#b98218"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bg)"/>
  <rect width="1920" height="1080" fill="url(#goldHalo)"/>
  <rect width="1920" height="1080" fill="url(#blueOrb)"/>

  <!-- Left panel overlay -->
  <rect width="760" height="1080" fill="url(#leftPanel)" fill-opacity="0.6"/>

  <!-- Vertical gold divider -->
  <line x1="760" y1="80" x2="760" y2="1000"
        stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.3"/>

  <!-- Large decorative rings (left side, behind logo) -->
  <circle cx="380" cy="540" r="340" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.1"/>
  <circle cx="380" cy="540" r="270" fill="none" stroke="#fffdf8" stroke-width="0.8" stroke-opacity="0.07"/>
  <!-- Gold shimmer arc -->
  <path d="M 94 380 A 290 290 0 0 1 666 380"
        fill="none" stroke="#d4a820" stroke-width="2" stroke-opacity="0.25"
        stroke-dasharray="10 7"/>

  <!-- Logo circle backing -->
  <circle cx="380" cy="520" r="210" fill="#071a17" fill-opacity="0.6"/>
  <circle cx="380" cy="520" r="210" fill="none" stroke="#d4a820" stroke-width="2.5" stroke-opacity="0.55"/>

  <!-- Actual Logo -->
  <image href="${uri}" x="220" y="360" width="320" height="320" filter="url(#logoShadow)"/>

  <!-- Gold dots on ring -->
  <circle cx="380" cy="310" r="7" fill="#d4a820"/>
  <circle cx="590" cy="520" r="5" fill="#d4a820" fill-opacity="0.65"/>
  <circle cx="170" cy="520" r="5" fill="#d4a820" fill-opacity="0.65"/>
  <circle cx="530" cy="378" r="4" fill="#d4a820" fill-opacity="0.45"/>
  <circle cx="230" cy="378" r="4" fill="#d4a820" fill-opacity="0.45"/>

  <!-- Logo label below -->
  <text x="380" y="775" font-family="Arial, Helvetica, sans-serif"
        font-size="22" fill="#d4a820" text-anchor="middle" letter-spacing="5">
    VERIFIED HUMAN NETWORK
  </text>

  <!-- ── RIGHT SIDE CONTENT ─────────────────────────────────────── -->

  <!-- App name headline -->
  <text x="870" y="200" font-family="Arial, Helvetica, sans-serif"
        font-size="80" font-weight="bold" fill="#fffdf8" letter-spacing="6">
    HUMAN
  </text>
  <text x="870" y="290" font-family="Arial, Helvetica, sans-serif"
        font-size="80" font-weight="bold" fill="#d4a820" letter-spacing="6">
    CHAIN
  </text>

  <!-- Gold rule -->
  <line x1="870" y1="318" x2="1200" y2="318"
        stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.5"/>

  <!-- Tagline lines -->
  <text x="870" y="368" font-family="Arial, Helvetica, sans-serif"
        font-size="30" fill="#fffdf8" fill-opacity="0.9" letter-spacing="1">
    Real humans. Real wisdom. Real trust.
  </text>
  <text x="870" y="410" font-family="Arial, Helvetica, sans-serif"
        font-size="19" fill="#fffdf8" fill-opacity="0.6">
    The first verified-human social network — inside World App.
  </text>

  <!-- Feature pills -->
  <!-- ASK -->
  <rect x="870" y="460" width="140" height="42" rx="21" fill="#246b55"/>
  <rect x="870" y="460" width="140" height="42" rx="21" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.5"/>
  <text x="940" y="486" font-family="Arial, Helvetica, sans-serif"
        font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle" letter-spacing="2">ASK</text>

  <!-- MOMENTS -->
  <rect x="1024" y="460" width="168" height="42" rx="21" fill="#1f6f86"/>
  <rect x="1024" y="460" width="168" height="42" rx="21" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.5"/>
  <text x="1108" y="486" font-family="Arial, Helvetica, sans-serif"
        font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle" letter-spacing="2">MOMENTS</text>

  <!-- MARKET -->
  <rect x="1206" y="460" width="152" height="42" rx="21" fill="#7b560c"/>
  <rect x="1206" y="460" width="152" height="42" rx="21" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.5"/>
  <text x="1282" y="486" font-family="Arial, Helvetica, sans-serif"
        font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle" letter-spacing="2">MARKET</text>

  <!-- STORIES -->
  <rect x="870" y="516" width="160" height="42" rx="21" fill="#33404f"/>
  <rect x="870" y="516" width="160" height="42" rx="21" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.5"/>
  <text x="950" y="542" font-family="Arial, Helvetica, sans-serif"
        font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle" letter-spacing="2">STORIES</text>

  <!-- PASSPORT -->
  <rect x="1044" y="516" width="178" height="42" rx="21" fill="#246b55"/>
  <rect x="1044" y="516" width="178" height="42" rx="21" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.5"/>
  <text x="1133" y="542" font-family="Arial, Helvetica, sans-serif"
        font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle" letter-spacing="2">PASSPORT</text>

  <!-- Feature descriptions -->
  <text x="870" y="606" font-family="Arial, Helvetica, sans-serif"
        font-size="17" fill="#fffdf8" fill-opacity="0.75">
    ● Ask verified humans — get answers from real people worldwide
  </text>
  <text x="870" y="640" font-family="Arial, Helvetica, sans-serif"
        font-size="17" fill="#fffdf8" fill-opacity="0.75">
    ● Post photo moments — photo-first proof-of-life feed
  </text>
  <text x="870" y="674" font-family="Arial, Helvetica, sans-serif"
        font-size="17" fill="#fffdf8" fill-opacity="0.75">
    ● Trade safely — verified seller signals, WLD payments
  </text>
  <text x="870" y="708" font-family="Arial, Helvetica, sans-serif"
        font-size="17" fill="#fffdf8" fill-opacity="0.75">
    ● Build your Human Passport — live trust score, HP, badges
  </text>
  <text x="870" y="742" font-family="Arial, Helvetica, sans-serif"
        font-size="17" fill="#fffdf8" fill-opacity="0.75">
    ● 13 languages — global community of verified humans
  </text>

  <!-- HP / Stats row -->
  <!-- Score card -->
  <rect x="870" y="790" width="180" height="80" rx="14" fill="#0b2523" fill-opacity="0.8"/>
  <rect x="870" y="790" width="180" height="80" rx="14" fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <text x="960" y="828" font-family="Arial, Helvetica, sans-serif"
        font-size="30" font-weight="bold" fill="#d4a820" text-anchor="middle">251+</text>
  <text x="960" y="852" font-family="Arial, Helvetica, sans-serif"
        font-size="13" fill="#fffdf8" fill-opacity="0.65" text-anchor="middle" letter-spacing="1">HUMAN SCORE</text>

  <!-- HP card -->
  <rect x="1064" y="790" width="180" height="80" rx="14" fill="#0b2523" fill-opacity="0.8"/>
  <rect x="1064" y="790" width="180" height="80" rx="14" fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <text x="1154" y="828" font-family="Arial, Helvetica, sans-serif"
        font-size="30" font-weight="bold" fill="#d4a820" text-anchor="middle">420 HP</text>
  <text x="1154" y="852" font-family="Arial, Helvetica, sans-serif"
        font-size="13" fill="#fffdf8" fill-opacity="0.65" text-anchor="middle" letter-spacing="1">HUMAN POINTS</text>

  <!-- Languages card -->
  <rect x="1258" y="790" width="180" height="80" rx="14" fill="#0b2523" fill-opacity="0.8"/>
  <rect x="1258" y="790" width="180" height="80" rx="14" fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>
  <text x="1348" y="828" font-family="Arial, Helvetica, sans-serif"
        font-size="30" font-weight="bold" fill="#d4a820" text-anchor="middle">13</text>
  <text x="1348" y="852" font-family="Arial, Helvetica, sans-serif"
        font-size="13" fill="#fffdf8" fill-opacity="0.65" text-anchor="middle" letter-spacing="1">LANGUAGES</text>

  <!-- Bottom bar -->
  <rect x="0" y="1040" width="1920" height="40" fill="#071a17"/>
  <text x="960" y="1063" font-family="Arial, Helvetica, sans-serif"
        font-size="13" fill="#fffdf8" fill-opacity="0.45" text-anchor="middle" letter-spacing="2">
    WORLD ID VERIFIED · NO BOTS · NO FAKE ACCOUNTS · EVERY USER IS A REAL UNIQUE HUMAN
  </text>

  <!-- Top-right orb decoration -->
  <circle cx="1760" cy="160" r="280" fill="#2f6fed" fill-opacity="0.04"/>
  <circle cx="1760" cy="160" r="200" fill="#2f6fed" fill-opacity="0.06"/>
  <circle cx="1760" cy="160" r="130" fill="none" stroke="#2f6fed" stroke-width="1" stroke-opacity="0.15"/>
  <circle cx="1760" cy="160" r="60" fill="#2f6fed" fill-opacity="0.08"/>
</svg>`;
  await svgToPng(svg, path.join(OUT, "hero.png"), 1920, 1080);
}

// ── ════════════════════════════════════════════════════════════════════════════
// IMAGE 4 — Meta Tag  1200×630
// ════════════════════════════════════════════════════════════════════════════ ──
async function genMetaTag() {
  const uri = await logoDataUri(200);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f3330"/>
      <stop offset="50%" stop-color="#0b2523"/>
      <stop offset="100%" stop-color="#071a17"/>
    </linearGradient>
    <radialGradient id="goldGlow" cx="30%" cy="50%" r="42%">
      <stop offset="0%" stop-color="#d4a820" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#d4a820" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blueGlow" cx="85%" cy="50%" r="30%">
      <stop offset="0%" stop-color="#2f6fed" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#2f6fed" stop-opacity="0"/>
    </radialGradient>
    <filter id="logoShadow">
      <feDropShadow dx="0" dy="6" stdDeviation="18" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#goldGlow)"/>
  <rect width="1200" height="630" fill="url(#blueGlow)"/>

  <!-- Left panel subtle overlay -->
  <rect width="460" height="630" fill="#0b2523" fill-opacity="0.3"/>
  <line x1="460" y1="40" x2="460" y2="590"
        stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.28"/>

  <!-- Logo area decoration rings -->
  <circle cx="230" cy="315" r="200" fill="none" stroke="#d4a820" stroke-width="1" stroke-opacity="0.12"/>
  <circle cx="230" cy="315" r="156" fill="none" stroke="#fffdf8" stroke-width="0.6" stroke-opacity="0.08"/>
  <path d="M 50 248 A 160 160 0 0 1 410 248"
        fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.22"
        stroke-dasharray="8 6"/>

  <!-- Logo backing circle -->
  <circle cx="230" cy="302" r="128" fill="#071a17" fill-opacity="0.65"/>
  <circle cx="230" cy="302" r="128" fill="none" stroke="#d4a820" stroke-width="2" stroke-opacity="0.5"/>

  <!-- Logo -->
  <image href="${uri}" x="130" y="202" width="200" height="200" filter="url(#logoShadow)"/>

  <!-- Gold dots on ring -->
  <circle cx="230" cy="174" r="5.5" fill="#d4a820"/>
  <circle cx="358" cy="302" r="4" fill="#d4a820" fill-opacity="0.6"/>
  <circle cx="102" cy="302" r="4" fill="#d4a820" fill-opacity="0.6"/>

  <!-- App name under logo -->
  <text x="230" y="468" font-family="Arial, Helvetica, sans-serif"
        font-size="20" font-weight="bold" fill="#fffdf8"
        text-anchor="middle" letter-spacing="4">HUMANCHAIN</text>
  <line x1="120" y1="479" x2="340" y2="479"
        stroke="#d4a820" stroke-width="1" stroke-opacity="0.45"/>
  <text x="230" y="498" font-family="Arial, Helvetica, sans-serif"
        font-size="12" fill="#d4a820" text-anchor="middle" letter-spacing="2.5">
    WORLD ID VERIFIED
  </text>

  <!-- ── RIGHT CONTENT ──────────────────────────────────── -->
  <!-- Main headline -->
  <text x="510" y="138" font-family="Arial, Helvetica, sans-serif"
        font-size="52" font-weight="bold" fill="#fffdf8" letter-spacing="3">HUMAN</text>
  <text x="510" y="194" font-family="Arial, Helvetica, sans-serif"
        font-size="52" font-weight="bold" fill="#d4a820" letter-spacing="3">CHAIN</text>

  <line x1="510" y1="215" x2="840" y2="215"
        stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.45"/>

  <!-- Tagline -->
  <text x="510" y="253" font-family="Arial, Helvetica, sans-serif"
        font-size="20" fill="#fffdf8" fill-opacity="0.88">
    Ask. Post. Trade. Read.
  </text>
  <text x="510" y="283" font-family="Arial, Helvetica, sans-serif"
        font-size="17" fill="#fffdf8" fill-opacity="0.6">
    Real humans verified by World ID.
  </text>

  <!-- Feature list -->
  <text x="510" y="336" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#d4a820">▸</text>
  <text x="532" y="336" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#fffdf8" fill-opacity="0.8">
    Daily questions — earn +18 HP per honest answer
  </text>
  <text x="510" y="368" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#d4a820">▸</text>
  <text x="532" y="368" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#fffdf8" fill-opacity="0.8">
    Trust-first marketplace with WLD payments
  </text>
  <text x="510" y="400" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#d4a820">▸</text>
  <text x="532" y="400" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#fffdf8" fill-opacity="0.8">
    Human Passport — live score, badges, and reputation
  </text>
  <text x="510" y="432" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#d4a820">▸</text>
  <text x="532" y="432" font-family="Arial, Helvetica, sans-serif"
        font-size="16" fill="#fffdf8" fill-opacity="0.8">
    13 languages — verified human network worldwide
  </text>

  <!-- Stats row -->
  <rect x="510" y="472" width="130" height="60" rx="12" fill="#0b2523" fill-opacity="0.8"/>
  <rect x="510" y="472" width="130" height="60" rx="12" fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="575" y="502" font-family="Arial, Helvetica, sans-serif"
        font-size="24" font-weight="bold" fill="#d4a820" text-anchor="middle">No Bots</text>
  <text x="575" y="520" font-family="Arial, Helvetica, sans-serif"
        font-size="11" fill="#fffdf8" fill-opacity="0.6" text-anchor="middle" letter-spacing="1">EVER</text>

  <rect x="654" y="472" width="130" height="60" rx="12" fill="#0b2523" fill-opacity="0.8"/>
  <rect x="654" y="472" width="130" height="60" rx="12" fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="719" y="502" font-family="Arial, Helvetica, sans-serif"
        font-size="24" font-weight="bold" fill="#d4a820" text-anchor="middle">420 HP</text>
  <text x="719" y="520" font-family="Arial, Helvetica, sans-serif"
        font-size="11" fill="#fffdf8" fill-opacity="0.6" text-anchor="middle" letter-spacing="1">STARTER</text>

  <rect x="798" y="472" width="130" height="60" rx="12" fill="#0b2523" fill-opacity="0.8"/>
  <rect x="798" y="472" width="130" height="60" rx="12" fill="none" stroke="#d4a820" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="863" y="502" font-family="Arial, Helvetica, sans-serif"
        font-size="24" font-weight="bold" fill="#d4a820" text-anchor="middle">13</text>
  <text x="863" y="520" font-family="Arial, Helvetica, sans-serif"
        font-size="11" fill="#fffdf8" fill-opacity="0.6" text-anchor="middle" letter-spacing="1">LANGUAGES</text>

  <!-- Bottom bar -->
  <rect x="0" y="598" width="1200" height="32" fill="#071a17"/>
  <text x="600" y="618" font-family="Arial, Helvetica, sans-serif"
        font-size="11" fill="#fffdf8" fill-opacity="0.4" text-anchor="middle" letter-spacing="2">
    WORLD APP MINI APP · WORLD ID REQUIRED · human-chain-gamma.vercel.app
  </text>
</svg>`;
  await svgToPng(svg, path.join(OUT, "meta_tag.png"), 1200, 630);
}

// ── ════════════════════════════════════════════════════════════════════════════
// SHOWCASE HELPERS — phone shell + common elements
// ════════════════════════════════════════════════════════════════════════════ ──
function phoneShell(w, h, bgColor = "#fbf7ef") {
  return `
  <!-- Phone background -->
  <rect width="${w}" height="${h}" fill="${bgColor}"/>
  <!-- Status bar -->
  <rect width="${w}" height="48" fill="#0b2523"/>
  <!-- Notch pill -->
  <rect x="${w/2-30}" y="14" width="60" height="16" rx="8" fill="#091a17"/>
  <!-- Status bar time -->
  <text x="20" y="32" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#fffdf8">9:41</text>
  <!-- Status bar icons -->
  <text x="${w-60}" y="32" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#fffdf8">●●● ▊</text>

  <!-- Bottom nav bar -->
  <rect x="0" y="${h-72}" width="${w}" height="72" fill="#0b2523"/>
  <line x1="0" y1="${h-72}" x2="${w}" y2="${h-72}" stroke="#d4a820" stroke-width="0.8" stroke-opacity="0.4"/>`;
}

function navItem(label, x, cy, active) {
  const color = active ? "#d4a820" : "rgba(255,253,248,0.4)";
  return `
  <circle cx="${x}" cy="${cy-14}" r="3" fill="${active ? '#d4a820' : 'rgba(255,253,248,0.2)'}"/>
  <text x="${x}" y="${cy+4}" font-family="Arial, Helvetica, sans-serif"
        font-size="9" fill="${color}" text-anchor="middle" letter-spacing="0.5">${label}</text>`;
}

// ── ════════════════════════════════════════════════════════════════════════════
// IMAGE 5 — Showcase 1  390×844 — Home / Digital Passport Card
// ════════════════════════════════════════════════════════════════════════════ ──
async function genShowcase1() {
  const uri = await logoDataUri(72);
  const navY = 844 - 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="390" height="844" viewBox="0 0 390 844">
  <defs>
    <linearGradient id="cardBg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#0f3330"/>
      <stop offset="55%" stop-color="#185745"/>
      <stop offset="100%" stop-color="#0b2523"/>
    </linearGradient>
    <linearGradient id="pageBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbf7ef"/>
      <stop offset="100%" stop-color="#f2ede6"/>
    </linearGradient>
    <radialGradient id="cardGold" cx="88%" cy="8%" r="50%">
      <stop offset="0%" stop-color="#d4a820" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#d4a820" stop-opacity="0"/>
    </radialGradient>
    <filter id="cardShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0b2523" flood-opacity="0.22"/>
    </filter>
    <linearGradient id="greenBtn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2e8b6b"/>
      <stop offset="100%" stop-color="#185745"/>
    </linearGradient>
  </defs>

  ${phoneShell(390, 844, "url(#pageBg)")}

  <!-- Top bar -->
  <rect x="0" y="48" width="390" height="56" fill="#fbf7ef"/>
  <!-- Avatar -->
  <circle cx="40" cy="76" r="22" fill="url(#cardBg)"/>
  <image href="${uri}" x="22" y="58" width="36" height="36"/>
  <!-- Username -->
  <text x="72" y="70" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#202328">@verified_human</text>
  <text x="72" y="88" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Verified human network</text>
  <!-- Bell -->
  <circle cx="356" cy="76" r="18" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="356" y="82" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#246b55" text-anchor="middle">🔔</text>
  <!-- Settings -->
  <circle cx="332" cy="76" r="0"/>

  <!-- ── DIGITAL CARD ───────────────────────────────────────── -->
  <rect x="14" y="112" width="362" height="230" rx="22" fill="url(#cardBg)" filter="url(#cardShadow)"/>
  <rect x="14" y="112" width="362" height="230" rx="22" fill="url(#cardGold)"/>

  <!-- Card circle decoration (corner) -->
  <circle cx="348" cy="300" r="110" fill="none" stroke="rgba(255,253,248,0.07)" stroke-width="1"/>
  <circle cx="348" cy="300" r="80" fill="none" stroke="rgba(255,253,248,0.05)" stroke-width="1"/>

  <!-- Section label -->
  <text x="32" y="133" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="rgba(255,253,248,0.6)" letter-spacing="2">DIGITAL CARD</text>

  <!-- Avatar in card -->
  <rect x="155" y="140" width="80" height="80" rx="20" fill="#fffdf8"/>
  <text x="195" y="190" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" fill="#0b2523" text-anchor="middle">H</text>

  <!-- Name + ID -->
  <text x="195" y="238" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle">@verified_human</text>
  <text x="195" y="254" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="rgba(255,253,248,0.55)" text-anchor="middle">HC-A3F9B2</text>

  <!-- Score big number -->
  <text x="195" y="284" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="#fffdf8" text-anchor="middle">251</text>
  <text x="195" y="302" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="rgba(255,253,248,0.7)" text-anchor="middle">Bronze Human</text>

  <!-- Badges row -->
  <rect x="52" y="312" width="110" height="20" rx="10" fill="rgba(255,253,248,0.12)"/>
  <text x="107" y="326" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#fffdf8" text-anchor="middle" letter-spacing="0.5">World ID Verified</text>
  <rect x="170" y="312" width="90" height="20" rx="10" fill="rgba(255,253,248,0.12)"/>
  <text x="215" y="326" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#fffdf8" text-anchor="middle" letter-spacing="0.5">Bronze Human</text>
  <rect x="268" y="312" width="84" height="20" rx="10" fill="rgba(255,253,248,0.12)"/>
  <text x="310" y="326" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#fffdf8" text-anchor="middle" letter-spacing="0.5">+4 More</text>

  <!-- Gold verified chip -->
  <rect x="140" y="335" width="110" height="18" rx="9" fill="rgba(212,168,32,0.25)" stroke="#d4a820" stroke-width="0.8"/>
  <text x="195" y="348" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#d4a820" text-anchor="middle" letter-spacing="1">✓ WORLD ID VERIFIED</text>

  <!-- ── QUICK NAV ───────────────────────────────────────────── -->
  <text x="24" y="366" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="rgba(32,35,40,0.5)" letter-spacing="1.5">QUICK NAVIGATION</text>

  <!-- Ask btn -->
  <rect x="14" y="374" width="86" height="62" rx="14" fill="#17614f"/>
  <text x="57" y="400" font-family="Arial, Helvetica, sans-serif" font-size="19" text-anchor="middle">💬</text>
  <text x="57" y="425" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#fffdf8" text-anchor="middle">Ask</text>
  <!-- badge -->
  <circle cx="92" cy="380" r="9" fill="#d4a820"/>
  <text x="92" y="384" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="bold" fill="#0b2523" text-anchor="middle">3</text>

  <!-- Moments btn -->
  <rect x="108" y="374" width="86" height="62" rx="14" fill="#1f6f86"/>
  <text x="151" y="400" font-family="Arial, Helvetica, sans-serif" font-size="19" text-anchor="middle">✨</text>
  <text x="151" y="425" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#fffdf8" text-anchor="middle">Moments</text>

  <!-- Market btn -->
  <rect x="202" y="374" width="86" height="62" rx="14" fill="#7b560c"/>
  <text x="245" y="400" font-family="Arial, Helvetica, sans-serif" font-size="19" text-anchor="middle">🏪</text>
  <text x="245" y="425" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#fffdf8" text-anchor="middle">Market</text>

  <!-- Stories btn -->
  <rect x="296" y="374" width="82" height="62" rx="14" fill="#33404f"/>
  <text x="337" y="400" font-family="Arial, Helvetica, sans-serif" font-size="19" text-anchor="middle">📖</text>
  <text x="337" y="425" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#fffdf8" text-anchor="middle">Stories</text>

  <!-- ── DAILY QUESTION ─────────────────────────────────────── -->
  <rect x="14" y="450" width="362" height="92" rx="16" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="24" y="472" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#246b55" letter-spacing="1">TODAY'S QUESTION</text>
  <rect x="310" y="459" width="54" height="20" rx="10" fill="#b98218"/>
  <text x="337" y="473" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" fill="#fffdf8" text-anchor="middle">+18 HP</text>
  <text x="24" y="492" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#202328">What truth did life teach you this week?</text>
  <rect x="14" y="506" width="362" height="28" rx="8" fill="#f4efe6" stroke="#e8dfd2" stroke-width="1"/>
  <text x="24" y="525" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="rgba(111,116,111,0.7)">Share your honest answer...</text>
  <!-- Submit -->
  <rect x="298" y="507" width="72" height="26" rx="13" fill="#246b55"/>
  <text x="334" y="524" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#fffdf8" text-anchor="middle">Answer</text>

  <!-- ── SCORE ROW ───────────────────────────────────────────── -->
  <rect x="14" y="556" width="84" height="70" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="56" y="578" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">SCORE</text>
  <text x="56" y="604" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#246b55" text-anchor="middle">251</text>
  <text x="56" y="618" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle">Top 18%</text>

  <rect x="106" y="556" width="84" height="70" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="148" y="578" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">STREAK</text>
  <text x="148" y="604" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#246b55" text-anchor="middle">4d</text>
  <text x="148" y="618" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle">Keep going</text>

  <rect x="198" y="556" width="84" height="70" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="240" y="578" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">HP</text>
  <text x="240" y="604" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#b98218" text-anchor="middle">420</text>
  <text x="240" y="618" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle">Points</text>

  <rect x="290" y="556" width="86" height="70" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="333" y="578" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">SAFETY</text>
  <text x="333" y="604" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#246b55" text-anchor="middle">Clean</text>
  <text x="333" y="618" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle">No flags</text>

  <!-- ── NEXT STEP CARD ─────────────────────────────────────── -->
  <rect x="14" y="640" width="362" height="72" rx="16" fill="#eef8f3" stroke="rgba(36,107,85,0.2)" stroke-width="1"/>
  <text x="24" y="661" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#246b55" letter-spacing="1.5">YOUR NEXT STEP</text>
  <text x="24" y="680" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#202328">Answer today's global question</text>
  <text x="24" y="698" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Your first answer earns +18 HP.</text>
  <rect x="290" y="653" width="80" height="32" rx="16" fill="#246b55"/>
  <text x="330" y="673" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#fffdf8" text-anchor="middle">Answer</text>

  <!-- Bottom nav -->
  ${navItem("Home", 39, navY, true)}
  ${navItem("Ask", 117, navY, false)}
  ${navItem("Chains", 195, navY, false)}
  ${navItem("Market", 273, navY, false)}
  ${navItem("Me", 351, navY, false)}
</svg>`;
  await svgToPng(svg, path.join(OUT, "showcase_1.png"), 390, 844);
}

// ── ════════════════════════════════════════════════════════════════════════════
// IMAGE 6 — Showcase 2  390×844 — Daily Question / Ask
// ════════════════════════════════════════════════════════════════════════════ ──
async function genShowcase2() {
  const uri = await logoDataUri(44);
  const navY = 844 - 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="390" height="844" viewBox="0 0 390 844">
  <defs>
    <linearGradient id="pageBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbf7ef"/>
      <stop offset="100%" stop-color="#f0ede8"/>
    </linearGradient>
    <linearGradient id="heroCardBg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#0f3330"/>
      <stop offset="60%" stop-color="#185745"/>
      <stop offset="100%" stop-color="#0b2523"/>
    </linearGradient>
    <radialGradient id="heroGold" cx="90%" cy="8%" r="45%">
      <stop offset="0%" stop-color="#d4a820" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#d4a820" stop-opacity="0"/>
    </radialGradient>
    <filter id="cardShadow">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#0b2523" flood-opacity="0.18"/>
    </filter>
  </defs>

  ${phoneShell(390, 844, "url(#pageBg)")}

  <!-- Top bar -->
  <rect x="0" y="48" width="390" height="56" fill="#fbf7ef"/>
  <image href="${uri}" x="18" y="60" width="32" height="32"/>
  <text x="58" y="70" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#202328">Ask Verified Humans</text>
  <text x="58" y="88" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Daily question · Live answers</text>

  <!-- ── HERO QUESTION CARD ──────────────────────────────────── -->
  <rect x="14" y="112" width="362" height="200" rx="20" fill="url(#heroCardBg)" filter="url(#cardShadow)"/>
  <rect x="14" y="112" width="362" height="200" rx="20" fill="url(#heroGold)"/>

  <!-- Deco ring -->
  <circle cx="330" cy="270" r="110" fill="none" stroke="rgba(255,253,248,0.06)" stroke-width="1"/>

  <text x="30" y="135" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="rgba(255,253,248,0.55)" letter-spacing="2">HUMANCHAIN DAILY · +18 HP</text>

  <!-- Gold HP badge -->
  <rect x="294" y="122" width="68" height="22" rx="11" fill="#b98218"/>
  <text x="328" y="137" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#fffdf8" text-anchor="middle">+18 HP</text>

  <!-- Question text -->
  <text x="30" y="163" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#fffdf8">What truth did life</text>
  <text x="30" y="185" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#fffdf8">teach you this week?</text>

  <text x="30" y="213" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="rgba(255,253,248,0.65)">Every verified human can answer once.</text>
  <text x="30" y="229" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="rgba(255,253,248,0.65)">Best answers become tomorrow's verdict.</text>

  <!-- Answer input -->
  <rect x="28" y="244" width="240" height="36" rx="10" fill="rgba(255,253,248,0.12)" stroke="rgba(255,253,248,0.2)" stroke-width="1"/>
  <text x="40" y="267" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="rgba(255,253,248,0.5)">Share your honest answer…</text>
  <!-- Submit btn -->
  <rect x="278" y="244" width="84" height="36" rx="18" fill="#d4a820"/>
  <text x="320" y="267" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#0b2523" text-anchor="middle">Submit</text>

  <!-- ── LIVE ANSWERS ────────────────────────────────────────── -->
  <text x="24" y="336" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="rgba(32,35,40,0.5)" letter-spacing="1.5">LIVE ANSWERS TODAY</text>
  <!-- Gold dot pulse -->
  <circle cx="14" cy="332" r="5" fill="#d4a820"/>
  <!-- Count badge -->
  <rect x="316" y="322" width="60" height="20" rx="10" fill="rgba(185,130,24,0.15)"/>
  <text x="346" y="336" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#b98218" text-anchor="middle">12 today</text>

  <!-- Answer card 1 -->
  <rect x="14" y="350" width="362" height="78" rx="16" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <circle cx="40" cy="384" r="18" fill="#17614f"/>
  <text x="40" y="390" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle">T</text>
  <text x="68" y="370" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#246b55">@truth.keeper</text>
  <!-- World ID verified chip -->
  <rect x="68" y="374" width="78" height="14" rx="7" fill="rgba(47,111,237,0.12)"/>
  <text x="107" y="385" font-family="Arial, Helvetica, sans-serif" font-size="8" fill="#2f6fed" text-anchor="middle">World Verified</text>
  <text x="68" y="408" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#202328">"Life taught me that patience is the</text>
  <text x="68" y="422" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#6f746f">most powerful form of action."</text>
  <text x="352" y="370" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#6f746f" text-anchor="end">2 min ago</text>

  <!-- Answer card 2 -->
  <rect x="14" y="438" width="362" height="78" rx="16" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <circle cx="40" cy="472" r="18" fill="#1f6f86"/>
  <text x="40" y="478" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle">W</text>
  <text x="68" y="458" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#246b55">@wisdom.chain</text>
  <rect x="68" y="462" width="78" height="14" rx="7" fill="rgba(47,111,237,0.12)"/>
  <text x="107" y="473" font-family="Arial, Helvetica, sans-serif" font-size="8" fill="#2f6fed" text-anchor="middle">World Verified</text>
  <text x="68" y="496" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#202328">"Real trust only comes from showing</text>
  <text x="68" y="510" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#6f746f">up for people when it costs you."</text>
  <text x="352" y="458" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#6f746f" text-anchor="end">5 min ago</text>

  <!-- Answer card 3 -->
  <rect x="14" y="526" width="362" height="78" rx="16" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <circle cx="40" cy="560" r="18" fill="#246b55"/>
  <text x="40" y="566" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#fffdf8" text-anchor="middle">H</text>
  <text x="68" y="546" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#246b55">@human.voice</text>
  <rect x="68" y="550" width="78" height="14" rx="7" fill="rgba(47,111,237,0.12)"/>
  <text x="107" y="561" font-family="Arial, Helvetica, sans-serif" font-size="8" fill="#2f6fed" text-anchor="middle">World Verified</text>
  <text x="68" y="584" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#202328">"That you can't rush healing. Every</text>
  <text x="68" y="598" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#6f746f">lesson arrives exactly when needed."</text>
  <text x="352" y="546" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#6f746f" text-anchor="end">9 min ago</text>

  <!-- HP Banner -->
  <rect x="14" y="618" width="362" height="48" rx="14" fill="rgba(36,107,85,0.08)" stroke="rgba(36,107,85,0.2)" stroke-width="1"/>
  <text x="24" y="638" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#246b55">Answer daily = +18 HP to your Human Passport</text>
  <text x="24" y="656" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Best answers enter tomorrow's World Verdict.</text>

  <!-- Bottom nav -->
  ${navItem("Home", 39, navY, false)}
  ${navItem("Ask", 117, navY, true)}
  ${navItem("Chains", 195, navY, false)}
  ${navItem("Market", 273, navY, false)}
  ${navItem("Me", 351, navY, false)}
</svg>`;
  await svgToPng(svg, path.join(OUT, "showcase_2.png"), 390, 844);
}

// ── ════════════════════════════════════════════════════════════════════════════
// IMAGE 7 — Showcase 3  390×844 — Human Passport + Referral
// ════════════════════════════════════════════════════════════════════════════ ──
async function genShowcase3() {
  const uri = await logoDataUri(52);
  const navY = 844 - 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="390" height="844" viewBox="0 0 390 844">
  <defs>
    <linearGradient id="pageBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbf7ef"/>
      <stop offset="100%" stop-color="#f4efe6"/>
    </linearGradient>
    <linearGradient id="passportBg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#082622"/>
      <stop offset="55%" stop-color="#1e6a53"/>
      <stop offset="100%" stop-color="#0d2a25"/>
    </linearGradient>
    <radialGradient id="passportGold" cx="88%" cy="10%" r="50%">
      <stop offset="0%" stop-color="#d4a820" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#d4a820" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="refCard" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0f4ff"/>
      <stop offset="100%" stop-color="#e8f0ff"/>
    </linearGradient>
    <filter id="cardShadow">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#0b2523" flood-opacity="0.16"/>
    </filter>
  </defs>

  ${phoneShell(390, 844, "url(#pageBg)")}

  <!-- Top bar -->
  <rect x="0" y="48" width="390" height="56" fill="#fbf7ef"/>
  <image href="${uri}" x="18" y="62" width="30" height="30"/>
  <text x="56" y="70" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#202328">Human Passport</text>
  <text x="56" y="88" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Your live trust identity</text>

  <!-- ── PASSPORT CARD ──────────────────────────────────────── -->
  <rect x="14" y="112" width="362" height="158" rx="20" fill="url(#passportBg)" filter="url(#cardShadow)"/>
  <rect x="14" y="112" width="362" height="158" rx="20" fill="url(#passportGold)"/>

  <!-- Deco -->
  <circle cx="340" cy="240" r="90" fill="none" stroke="rgba(255,253,248,0.06)" stroke-width="1"/>

  <!-- Avatar -->
  <rect x="28" y="128" width="62" height="62" rx="16" fill="#fffdf8"/>
  <text x="59" y="169" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold" fill="#0b2523" text-anchor="middle">H</text>

  <!-- Passport info -->
  <text x="104" y="148" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" fill="#fffdf8">@verified_human</text>
  <rect x="104" y="154" width="96" height="16" rx="8" fill="rgba(212,168,32,0.25)" stroke="#d4a820" stroke-width="0.8"/>
  <text x="152" y="166" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#d4a820" text-anchor="middle" letter-spacing="0.5">World ID Verified</text>
  <text x="104" y="186" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="rgba(255,253,248,0.75)">Bronze Human · HC-A3F9B2</text>

  <!-- Score in passport -->
  <text x="104" y="218" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" fill="#fffdf8">251</text>
  <text x="158" y="218" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="rgba(255,253,248,0.55)"> Human Score</text>

  <!-- Gold check badge -->
  <rect x="268" y="128" width="94" height="22" rx="11" fill="rgba(255,253,248,0.12)" stroke="rgba(255,253,248,0.25)" stroke-width="1"/>
  <text x="315" y="143" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#fffdf8" text-anchor="middle">✓ Verified</text>

  <!-- Tenure / streak row -->
  <text x="28" y="252" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="rgba(255,253,248,0.6)">Joined 1 month ago · Streak 4d · Dispute rate 0%</text>

  <!-- ── STATS ROW ───────────────────────────────────────────── -->
  <rect x="14" y="280" width="84" height="66" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="56" y="303" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">SCORE</text>
  <text x="56" y="329" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="#246b55" text-anchor="middle">251</text>
  <text x="56" y="342" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#b98218" text-anchor="middle">Top 18%</text>

  <rect x="106" y="280" width="84" height="66" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="148" y="303" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">HP POINTS</text>
  <text x="148" y="329" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="#b98218" text-anchor="middle">420</text>
  <text x="148" y="342" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle">Earned</text>

  <rect x="198" y="280" width="84" height="66" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="240" y="303" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">STREAK</text>
  <text x="240" y="329" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="#246b55" text-anchor="middle">4d</text>
  <text x="240" y="342" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle">Active</text>

  <rect x="290" y="280" width="86" height="66" rx="14" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="333" y="303" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#6f746f" text-anchor="middle" letter-spacing="1">SAFETY</text>
  <text x="333" y="327" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#246b55" text-anchor="middle">Clean</text>
  <text x="333" y="342" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#246b55" text-anchor="middle">✓ No flags</text>

  <!-- ── BADGES ──────────────────────────────────────────────── -->
  <text x="24" y="368" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="rgba(32,35,40,0.5)" letter-spacing="1.5">EARNED BADGES</text>

  <rect x="14" y="376" width="110" height="28" rx="14" fill="rgba(36,107,85,0.1)" stroke="rgba(36,107,85,0.25)" stroke-width="1"/>
  <text x="69" y="394" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#246b55" text-anchor="middle">World Verified</text>

  <rect x="132" y="376" width="98" height="28" rx="14" fill="rgba(185,130,24,0.1)" stroke="rgba(185,130,24,0.3)" stroke-width="1"/>
  <text x="181" y="394" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#b98218" text-anchor="middle">Bronze Human</text>

  <rect x="238" y="376" width="96" height="28" rx="14" fill="rgba(47,111,237,0.1)" stroke="rgba(47,111,237,0.25)" stroke-width="1"/>
  <text x="286" y="394" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#2f6fed" text-anchor="middle">New Builder</text>

  <!-- ── REFERRAL CARD ───────────────────────────────────────── -->
  <rect x="14" y="416" width="362" height="148" rx="18" fill="url(#refCard)" stroke="rgba(47,111,237,0.25)" stroke-width="1.5"/>
  <!-- Blue left accent line -->
  <rect x="14" y="416" width="4" height="148" rx="2" fill="#2f6fed"/>

  <!-- Gift icon circle -->
  <circle cx="44" cy="444" r="18" fill="#2f6fed" fill-opacity="0.12" stroke="#2f6fed" stroke-width="1" stroke-opacity="0.3"/>
  <text x="44" y="451" font-family="Arial, Helvetica, sans-serif" font-size="16" text-anchor="middle">🎁</text>

  <text x="70" y="437" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#202328">Invite a Human</text>
  <text x="70" y="453" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#2f6fed">+50 HP per verified join · +25 HP for them</text>

  <text x="28" y="476" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Share your referral link and earn HP for every</text>
  <text x="28" y="492" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">verified human who joins through your link.</text>

  <!-- Referral link box -->
  <rect x="24" y="502" width="240" height="28" rx="8" fill="rgba(255,253,248,0.9)" stroke="rgba(47,111,237,0.2)" stroke-width="1"/>
  <text x="32" y="521" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#2f6fed">worldcoin.org/mini-app?app_id=...&amp;ref=you</text>
  <!-- Copy btn -->
  <rect x="272" y="502" width="64" height="28" rx="14" fill="#2f6fed"/>
  <text x="304" y="521" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#fffdf8" text-anchor="middle">Copy</text>

  <!-- Progress bar -->
  <text x="24" y="548" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#202328">Progress to <tspan font-weight="bold">Connector</tspan> badge</text>
  <text x="352" y="548" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#6f746f" text-anchor="end">1/3</text>
  <rect x="24" y="554" width="342" height="8" rx="4" fill="rgba(47,111,237,0.15)"/>
  <rect x="24" y="554" width="114" height="8" rx="4" fill="#2f6fed"/>

  <!-- ── HP LEDGER PREVIEW ───────────────────────────────────── -->
  <text x="24" y="582" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="rgba(32,35,40,0.5)" letter-spacing="1.5">RECENT HP EARNED</text>

  <rect x="14" y="590" width="362" height="44" rx="12" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="24" y="608" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#b98218">+18 HP</text>
  <text x="24" y="624" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Daily Human answer — today at 9:41 AM</text>
  <text x="360" y="608" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#246b55" text-anchor="end">Today</text>

  <rect x="14" y="642" width="362" height="44" rx="12" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="24" y="660" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#b98218">+10 HP</text>
  <text x="24" y="676" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Daily check-in recorded — streak alive</text>
  <text x="360" y="660" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#246b55" text-anchor="end">Today</text>

  <rect x="14" y="694" width="362" height="44" rx="12" fill="#fffdf8" stroke="#e8dfd2" stroke-width="1"/>
  <text x="24" y="712" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" fill="#b98218">+25 HP</text>
  <text x="24" y="728" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6f746f">Welcome bonus — invited by @humanchain</text>
  <text x="360" y="712" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#246b55" text-anchor="end">Joined</text>

  <!-- Bottom nav -->
  ${navItem("Home", 39, navY, false)}
  ${navItem("Ask", 117, navY, false)}
  ${navItem("Chains", 195, navY, false)}
  ${navItem("Market", 273, navY, false)}
  ${navItem("Me", 351, navY, true)}
</svg>`;
  await svgToPng(svg, path.join(OUT, "showcase_3.png"), 390, 844);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Generating premium HumanChain store images...\n");
  await genLogo();
  await genContentCard();
  await genHero();
  await genMetaTag();
  await genShowcase1();
  await genShowcase2();
  await genShowcase3();
  console.log(`\n✅ All 7 premium images in: ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
