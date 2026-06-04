"use strict";
const sharp = require("sharp");
const fs    = require("fs");
const path  = require("path");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <!-- Deep emerald radial background -->
    <radialGradient id="bgGrad" cx="48%" cy="42%" r="62%">
      <stop offset="0%"   stop-color="#1e6046"/>
      <stop offset="38%"  stop-color="#0e3d2c"/>
      <stop offset="75%"  stop-color="#061e16"/>
      <stop offset="100%" stop-color="#020d0a"/>
    </radialGradient>

    <!-- Metallic gold — bright centre highlight, dark edges for 3D depth -->
    <linearGradient id="goldMetal" x1="18%" y1="8%" x2="82%" y2="92%">
      <stop offset="0%"   stop-color="#5c2e00"/>
      <stop offset="20%"  stop-color="#c8860a"/>
      <stop offset="42%"  stop-color="#ffd050"/>
      <stop offset="58%"  stop-color="#ffe890"/>
      <stop offset="78%"  stop-color="#c8860a"/>
      <stop offset="100%" stop-color="#3e1a00"/>
    </linearGradient>

    <!-- Gold for the H letterform — top-lit -->
    <linearGradient id="goldH" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffe890"/>
      <stop offset="25%"  stop-color="#f0c030"/>
      <stop offset="62%"  stop-color="#c07808"/>
      <stop offset="100%" stop-color="#7a4800"/>
    </linearGradient>

    <!-- Radial gold for chain nodes — sphere-like -->
    <radialGradient id="nodeGrad" cx="34%" cy="30%" r="62%">
      <stop offset="0%"   stop-color="#fff2b0"/>
      <stop offset="40%"  stop-color="#d49010"/>
      <stop offset="100%" stop-color="#5c2e00"/>
    </radialGradient>

    <!-- Corona sweep — dramatic bottom-right gold glow -->
    <radialGradient id="corona" cx="82%" cy="80%" r="50%">
      <stop offset="0%"   stop-color="#ffd050" stop-opacity="0.92"/>
      <stop offset="18%"  stop-color="#d49010" stop-opacity="0.60"/>
      <stop offset="45%"  stop-color="#c07808" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#c07808" stop-opacity="0"/>
    </radialGradient>

    <!-- Ambient inner green glow -->
    <radialGradient id="ambientGreen" cx="50%" cy="44%" r="50%">
      <stop offset="0%"   stop-color="#1e6a50" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#1e6a50" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft gold glow around metallic elements -->
    <filter id="goldGlow" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/>
      <feFlood flood-color="#d49010" flood-opacity="0.75" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Node sphere glow -->
    <filter id="nodeGlow" x="-70%" y="-70%" width="240%" height="240%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur"/>
      <feFlood flood-color="#ffd050" flood-opacity="0.85" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Soft diffuse corona -->
    <filter id="coronaFilter" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>

    <!-- Lens flare -->
    <filter id="flare" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- ══ BACKGROUND ════════════════════════════════════════════════ -->
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)"/>

  <!-- Ambient emerald inner glow — gives the reference's rich green depth -->
  <ellipse cx="256" cy="238" rx="224" ry="214" fill="url(#ambientGreen)"/>

  <!-- ══ CORONA — the sweeping gold light from bottom-right ════════ -->
  <!-- Diffuse outer halo blob -->
  <ellipse cx="396" cy="396" rx="270" ry="270"
           fill="url(#corona)" filter="url(#coronaFilter)"/>
  <!-- Tighter bright inner core -->
  <ellipse cx="390" cy="385" rx="180" ry="180"
           fill="url(#corona)"/>
  <!-- Sweeping bright arc line (the crescent-shaped rim light) -->
  <path d="M 298 464 A 226 226 0 0 0 464 202"
        fill="none" stroke="#ffe890" stroke-width="2.5"
        stroke-opacity="0.55" stroke-linecap="round"/>
  <path d="M 312 458 A 210 210 0 0 0 458 218"
        fill="none" stroke="#ffd050" stroke-width="1.5"
        stroke-opacity="0.38" stroke-linecap="round"/>

  <!-- ══ GLOBE GRID LINES (inside the ring) ═══════════════════════ -->
  <!-- Latitude ellipses -->
  <ellipse cx="256" cy="256" rx="140" ry="44"  fill="none" stroke="#d49010"
           stroke-width="1.8" stroke-opacity="0.30"/>
  <ellipse cx="256" cy="256" rx="140" ry="90"  fill="none" stroke="#d49010"
           stroke-width="1.2" stroke-opacity="0.20"/>
  <ellipse cx="256" cy="256" rx="140" ry="128" fill="none" stroke="#d49010"
           stroke-width="0.9" stroke-opacity="0.14"/>
  <!-- Longitude ellipses -->
  <ellipse cx="256" cy="256" rx="44"  ry="140" fill="none" stroke="#d49010"
           stroke-width="1.8" stroke-opacity="0.30"/>
  <ellipse cx="256" cy="256" rx="90"  ry="140" fill="none" stroke="#d49010"
           stroke-width="1.2" stroke-opacity="0.20"/>
  <ellipse cx="256" cy="256" rx="128" ry="140" fill="none" stroke="#d49010"
           stroke-width="0.9" stroke-opacity="0.14"/>

  <!-- ══ MAIN ORBIT RING ═══════════════════════════════════════════ -->
  <!-- Thick black shadow behind ring for depth illusion -->
  <circle cx="256" cy="256" r="152" fill="none" stroke="#0a0500" stroke-width="32"/>
  <!-- Dark rim (back face of the torus) -->
  <circle cx="256" cy="256" r="152" fill="none" stroke="#2a1500" stroke-width="24"/>
  <!-- Main metallic gold ring -->
  <circle cx="256" cy="256" r="152" fill="none" stroke="url(#goldMetal)"
          stroke-width="20" filter="url(#goldGlow)"/>
  <!-- Top specular highlight (the bright gleam at 12 o'clock) -->
  <path d="M 176 122 A 152 152 0 0 1 336 122"
        fill="none" stroke="#fff8d0" stroke-width="4" stroke-opacity="0.7"
        stroke-linecap="round"/>
  <!-- Secondary softer reflection -->
  <path d="M 196 130 A 136 136 0 0 1 316 130"
        fill="none" stroke="#ffe890" stroke-width="2" stroke-opacity="0.38"
        stroke-linecap="round"/>

  <!-- ══ H LETTERFORM ══════════════════════════════════════════════ -->
  <!-- Cast shadow layer offset -->
  <g transform="translate(5,7)" fill="#1a0c00" fill-opacity="0.55">
    <rect x="202" y="184" width="32" height="144" rx="8"/>
    <rect x="278" y="184" width="32" height="144" rx="8"/>
    <rect x="202" y="238" width="108" height="34"  rx="8"/>
  </g>
  <!-- Gold H bars -->
  <rect x="202" y="184" width="32" height="144" rx="8"
        fill="url(#goldH)" filter="url(#goldGlow)"/>
  <rect x="278" y="184" width="32" height="144" rx="8"
        fill="url(#goldH)" filter="url(#goldGlow)"/>
  <rect x="202" y="238" width="108" height="34"  rx="8"
        fill="url(#goldH)" filter="url(#goldGlow)"/>
  <!-- Left-edge highlight on each bar (gives raised/3D effect) -->
  <rect x="203" y="185" width="9" height="142" rx="4"
        fill="#fff0a0" fill-opacity="0.38"/>
  <rect x="279" y="185" width="9" height="142" rx="4"
        fill="#fff0a0" fill-opacity="0.38"/>
  <!-- Top edge highlight on crossbar -->
  <rect x="203" y="239" width="106" height="8" rx="4"
        fill="#fff0a0" fill-opacity="0.32"/>

  <!-- ══ CHAIN NODES ════════════════════════════════════════════════ -->
  <!-- LEFT NODE — 9 o'clock position on ring -->
  <!-- Dark void behind node -->
  <circle cx="104" cy="256" r="28" fill="#0a0500"/>
  <!-- Ring border matching main ring -->
  <circle cx="104" cy="256" r="28" fill="none"
          stroke="url(#goldMetal)" stroke-width="8"/>
  <!-- Sphere fill -->
  <circle cx="104" cy="256" r="16" fill="url(#nodeGrad)"
          filter="url(#nodeGlow)"/>
  <!-- Specular dot (top-left highlight) -->
  <circle cx="98"  cy="249" r="5.5" fill="#fff8d0" fill-opacity="0.78"/>

  <!-- RIGHT-UPPER NODE — ~1:30 o'clock position on ring -->
  <circle cx="364" cy="146" r="28" fill="#0a0500"/>
  <circle cx="364" cy="146" r="28" fill="none"
          stroke="url(#goldMetal)" stroke-width="8"/>
  <circle cx="364" cy="146" r="16" fill="url(#nodeGrad)"
          filter="url(#nodeGlow)"/>
  <circle cx="358" cy="140" r="5.5" fill="#fff8d0" fill-opacity="0.78"/>

  <!-- ══ LENS FLARE at 12 o'clock (top of ring) ═══════════════════ -->
  <!-- Diffuse halo -->
  <circle cx="256" cy="104" r="26" fill="#ffe890"
          fill-opacity="0.25" filter="url(#flare)"/>
  <!-- Bright dot -->
  <circle cx="256" cy="104" r="10" fill="#fff8d0" fill-opacity="0.95"/>
  <!-- Pure white core -->
  <circle cx="256" cy="104" r="4.5" fill="white"/>
  <!-- Cross rays -->
  <line x1="256" y1="84"  x2="256" y2="124" stroke="white"
        stroke-width="1.4" stroke-opacity="0.48" stroke-linecap="round"/>
  <line x1="236" y1="104" x2="276" y2="104" stroke="white"
        stroke-width="1.4" stroke-opacity="0.48" stroke-linecap="round"/>
  <line x1="243" y1="91"  x2="269" y2="117" stroke="white"
        stroke-width="0.9" stroke-opacity="0.24" stroke-linecap="round"/>
  <line x1="269" y1="91"  x2="243" y2="117" stroke="white"
        stroke-width="0.9" stroke-opacity="0.24" stroke-linecap="round"/>

  <!-- ══ OUTER FRAME (thin gold edge) ════════════════════════════ -->
  <rect x="4" y="4" width="504" height="504" rx="102"
        fill="none" stroke="#d49010" stroke-width="1.5" stroke-opacity="0.35"/>
</svg>`;

sharp(Buffer.from(svg), { density: 144 })
  .resize(512, 512)
  .png({ compressionLevel: 8 })
  .toFile(path.join(__dirname, "..", "public", "store-images", "logo.png"))
  .then(() => {
    const stat = fs.statSync(path.join(__dirname, "..", "public", "store-images", "logo.png"));
    console.log("✓ logo.png —", (stat.size / 1024).toFixed(1), "KB");
  })
  .catch(e => { console.error(e.message); process.exit(1); });
