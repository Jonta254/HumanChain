"use strict";
const sharp = require("sharp");
const fs    = require("fs");
const path  = require("path");

// Content card: 388×388
// Upper 58%  → 3-D gold globe (scaled-down version of the logo mark)
// Lower 42%  → wordmark + tagline + bottom badge row
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="388" height="388" viewBox="0 0 388 388">
  <defs>
    <!-- Background: same deep emerald as logo -->
    <radialGradient id="bg" cx="48%" cy="40%" r="65%">
      <stop offset="0%"   stop-color="#1e6046"/>
      <stop offset="40%"  stop-color="#0e3d2c"/>
      <stop offset="78%"  stop-color="#061e16"/>
      <stop offset="100%" stop-color="#020d0a"/>
    </radialGradient>

    <!-- Metallic gold ring gradient -->
    <linearGradient id="goldMetal" x1="18%" y1="8%" x2="82%" y2="92%">
      <stop offset="0%"   stop-color="#5c2e00"/>
      <stop offset="20%"  stop-color="#c8860a"/>
      <stop offset="42%"  stop-color="#ffd050"/>
      <stop offset="58%"  stop-color="#ffe890"/>
      <stop offset="78%"  stop-color="#c8860a"/>
      <stop offset="100%" stop-color="#3e1a00"/>
    </linearGradient>

    <!-- Gold text gradient -->
    <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffe890"/>
      <stop offset="40%"  stop-color="#f0c030"/>
      <stop offset="100%" stop-color="#b98218"/>
    </linearGradient>

    <!-- H letterform gradient -->
    <linearGradient id="goldH" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffe890"/>
      <stop offset="30%"  stop-color="#f0c030"/>
      <stop offset="65%"  stop-color="#c07808"/>
      <stop offset="100%" stop-color="#7a4800"/>
    </linearGradient>

    <!-- Node sphere -->
    <radialGradient id="nodeGrad" cx="34%" cy="30%" r="62%">
      <stop offset="0%"   stop-color="#fff2b0"/>
      <stop offset="40%"  stop-color="#d49010"/>
      <stop offset="100%" stop-color="#5c2e00"/>
    </radialGradient>

    <!-- Corona sweep bottom-right -->
    <radialGradient id="corona" cx="82%" cy="76%" r="48%">
      <stop offset="0%"   stop-color="#ffd050" stop-opacity="0.88"/>
      <stop offset="20%"  stop-color="#d49010" stop-opacity="0.55"/>
      <stop offset="50%"  stop-color="#c07808" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#c07808" stop-opacity="0"/>
    </radialGradient>

    <!-- Ambient green glow -->
    <radialGradient id="ambientGreen" cx="50%" cy="40%" r="50%">
      <stop offset="0%"   stop-color="#1e6a50" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#1e6a50" stop-opacity="0"/>
    </radialGradient>

    <!-- Divider gradient -->
    <linearGradient id="divider" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#d49010" stop-opacity="0"/>
      <stop offset="30%"  stop-color="#d49010" stop-opacity="0.7"/>
      <stop offset="70%"  stop-color="#d49010" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#d49010" stop-opacity="0"/>
    </linearGradient>

    <!-- Glow filter for gold elements -->
    <filter id="goldGlow" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/>
      <feFlood flood-color="#d49010" flood-opacity="0.7" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Node glow -->
    <filter id="nodeGlow" x="-70%" y="-70%" width="240%" height="240%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feFlood flood-color="#ffd050" flood-opacity="0.8" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Text shadow / glow -->
    <filter id="textGlow" x="-20%" y="-40%" width="140%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feFlood flood-color="#d49010" flood-opacity="0.55" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Corona diffuse -->
    <filter id="coronaFilter" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>

    <!-- Lens flare -->
    <filter id="flare" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- ── BACKGROUND ───────────────────────────────────────────────── -->
  <rect width="388" height="388" fill="url(#bg)"/>
  <ellipse cx="194" cy="170" rx="180" ry="168" fill="url(#ambientGreen)"/>

  <!-- ── CORONA ────────────────────────────────────────────────────── -->
  <ellipse cx="306" cy="298" rx="210" ry="210"
           fill="url(#corona)" filter="url(#coronaFilter)"/>
  <ellipse cx="298" cy="290" rx="138" ry="138" fill="url(#corona)"/>
  <path d="M 228 350 A 172 172 0 0 0 352 152"
        fill="none" stroke="#ffe890" stroke-width="1.8"
        stroke-opacity="0.48" stroke-linecap="round"/>

  <!-- ── GLOBE GRID LINES (inside ring, centred at 194,158) ────────── -->
  <ellipse cx="194" cy="158" rx="106" ry="34"  fill="none" stroke="#d49010"
           stroke-width="1.4" stroke-opacity="0.28"/>
  <ellipse cx="194" cy="158" rx="106" ry="68"  fill="none" stroke="#d49010"
           stroke-width="1"   stroke-opacity="0.18"/>
  <ellipse cx="194" cy="158" rx="106" ry="96"  fill="none" stroke="#d49010"
           stroke-width="0.7" stroke-opacity="0.13"/>
  <ellipse cx="194" cy="158" rx="34"  ry="106" fill="none" stroke="#d49010"
           stroke-width="1.4" stroke-opacity="0.28"/>
  <ellipse cx="194" cy="158" rx="68"  ry="106" fill="none" stroke="#d49010"
           stroke-width="1"   stroke-opacity="0.18"/>
  <ellipse cx="194" cy="158" rx="96"  ry="106" fill="none" stroke="#d49010"
           stroke-width="0.7" stroke-opacity="0.13"/>

  <!-- ── MAIN ORBIT RING ───────────────────────────────────────────── -->
  <!-- Shadow behind ring -->
  <circle cx="194" cy="158" r="114" fill="none" stroke="#0a0500" stroke-width="24"/>
  <!-- Dark rim -->
  <circle cx="194" cy="158" r="114" fill="none" stroke="#2a1500" stroke-width="18"/>
  <!-- Metallic gold ring -->
  <circle cx="194" cy="158" r="114" fill="none" stroke="url(#goldMetal)"
          stroke-width="15" filter="url(#goldGlow)"/>
  <!-- Top specular highlight -->
  <path d="M 136 72 A 114 114 0 0 1 252 72"
        fill="none" stroke="#fff8d0" stroke-width="3" stroke-opacity="0.68"
        stroke-linecap="round"/>
  <!-- Secondary reflection -->
  <path d="M 150 78 A 100 100 0 0 1 238 78"
        fill="none" stroke="#ffe890" stroke-width="1.5" stroke-opacity="0.36"
        stroke-linecap="round"/>

  <!-- ── H LETTERFORM (centred at 194,158) ────────────────────────── -->
  <!-- Drop shadow -->
  <g transform="translate(3,5)" fill="#1a0c00" fill-opacity="0.5">
    <rect x="161" y="120" width="22" height="100" rx="5"/>
    <rect x="211" y="120" width="22" height="100" rx="5"/>
    <rect x="161" y="153" width="72" height="22"  rx="5"/>
  </g>
  <!-- Gold bars -->
  <rect x="161" y="120" width="22" height="100" rx="5"
        fill="url(#goldH)" filter="url(#goldGlow)"/>
  <rect x="211" y="120" width="22" height="100" rx="5"
        fill="url(#goldH)" filter="url(#goldGlow)"/>
  <rect x="161" y="153" width="72" height="22" rx="5"
        fill="url(#goldH)" filter="url(#goldGlow)"/>
  <!-- Left-edge highlight -->
  <rect x="162" y="121" width="6" height="98" rx="3"
        fill="#fff0a0" fill-opacity="0.36"/>
  <rect x="212" y="121" width="6" height="98" rx="3"
        fill="#fff0a0" fill-opacity="0.36"/>

  <!-- ── CHAIN NODES ───────────────────────────────────────────────── -->
  <!-- Left node (9 o'clock) -->
  <circle cx="80" cy="158" r="20" fill="#0a0500"/>
  <circle cx="80" cy="158" r="20" fill="none" stroke="url(#goldMetal)" stroke-width="6"/>
  <circle cx="80" cy="158" r="11" fill="url(#nodeGrad)" filter="url(#nodeGlow)"/>
  <circle cx="75" cy="153" r="4"  fill="#fff8d0" fill-opacity="0.76"/>

  <!-- Right-upper node (~1:30 on ring) -->
  <circle cx="278" cy="84"  r="20" fill="#0a0500"/>
  <circle cx="278" cy="84"  r="20" fill="none" stroke="url(#goldMetal)" stroke-width="6"/>
  <circle cx="278" cy="84"  r="11" fill="url(#nodeGrad)" filter="url(#nodeGlow)"/>
  <circle cx="273" cy="79"  r="4"  fill="#fff8d0" fill-opacity="0.76"/>

  <!-- ── LENS FLARE at top of ring ─────────────────────────────────── -->
  <circle cx="194" cy="44"  r="18" fill="#ffe890" fill-opacity="0.22"
          filter="url(#flare)"/>
  <circle cx="194" cy="44"  r="7.5" fill="#fff8d0" fill-opacity="0.95"/>
  <circle cx="194" cy="44"  r="3.5" fill="white"/>
  <line x1="194" y1="30"  x2="194" y2="58"
        stroke="white" stroke-width="1.1" stroke-opacity="0.44" stroke-linecap="round"/>
  <line x1="180" y1="44"  x2="208" y2="44"
        stroke="white" stroke-width="1.1" stroke-opacity="0.44" stroke-linecap="round"/>
  <line x1="184" y1="34"  x2="204" y2="54"
        stroke="white" stroke-width="0.7" stroke-opacity="0.22" stroke-linecap="round"/>
  <line x1="204" y1="34"  x2="184" y2="54"
        stroke="white" stroke-width="0.7" stroke-opacity="0.22" stroke-linecap="round"/>

  <!-- ══════════════════════════════════════════════════════════════
       TEXT SECTION (bottom 42%)
       ══════════════════════════════════════════════════════════════ -->

  <!-- Horizontal gold divider -->
  <line x1="40" y1="280" x2="348" y2="280"
        stroke="url(#divider)" stroke-width="1.2"/>

  <!-- "HUMANCHAIN" wordmark -->
  <text x="194" y="316"
        font-family="Arial, Helvetica, sans-serif"
        font-size="30" font-weight="bold"
        fill="url(#goldText)"
        text-anchor="middle"
        letter-spacing="4"
        filter="url(#textGlow)">HUMANCHAIN</text>

  <!-- Tagline -->
  <text x="194" y="342"
        font-family="Arial, Helvetica, sans-serif"
        font-size="11"
        fill="#d49010"
        fill-opacity="0.85"
        text-anchor="middle"
        letter-spacing="2.8">VERIFIED HUMAN NETWORK</text>

  <!-- Bottom pill badge -->
  <rect x="122" y="355" width="144" height="22" rx="11"
        fill="rgba(212,168,32,0.14)"
        stroke="#d49010" stroke-width="0.9" stroke-opacity="0.55"/>
  <text x="194" y="370"
        font-family="Arial, Helvetica, sans-serif"
        font-size="9.5"
        fill="#ffe890"
        fill-opacity="0.88"
        text-anchor="middle"
        letter-spacing="1.5">WORLD ID  ·  SOCIAL</text>

  <!-- ── OUTER FRAME ─────────────────────────────────────────────── -->
  <rect x="3" y="3" width="382" height="382" rx="18"
        fill="none" stroke="#d49010" stroke-width="1.2" stroke-opacity="0.32"/>
</svg>`;

sharp(Buffer.from(svg), { density: 144 })
  .resize(388, 388)
  .png({ compressionLevel: 8 })
  .toFile(path.join(__dirname, "..", "public", "store-images", "content_card.png"))
  .then(() => {
    const stat = fs.statSync(
      path.join(__dirname, "..", "public", "store-images", "content_card.png")
    );
    console.log("✓ content_card.png —", (stat.size / 1024).toFixed(1), "KB");
  })
  .catch(e => { console.error(e.message); process.exit(1); });
