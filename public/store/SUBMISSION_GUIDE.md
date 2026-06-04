# HumanChain — World App Store Submission Assets

## Required Images

### 1. App Icon — 1024×1024px
**File:** `/public/images/humanchain-logo.png`
- Already exists at 1024×1024
- Square, non-white background (dark green)
- ✅ Ready to upload

### 2. Content Card (Mini App showcase tile) — 345×240px @ 3x = 1035×720px
**File:** `public/store/meta-card.html`

**How to create the PNG:**
1. Open `meta-card.html` in Chrome browser
2. The page renders at exactly 1035×720px
3. Use Chrome DevTools → Cmd+Shift+P → "Capture screenshot" OR
4. Right-click → "Inspect" → adjust viewport to 1035×720 → capture
5. Save as `humanchain-content-card.png`

**Important:** Keep the bottom 282px (94px × 3x) free of critical text — World App overlays UI there.

### 3. Screenshots — 390×844px (iPhone SE / standard portrait)
**Files:** `public/store/screenshot-home.html`

Open in Chrome at 430×932 viewport. Capture:
- `screenshot-01-home.png` — Home screen with digital card
- `screenshot-02-ask.png` — Ask tab with question thread  
- `screenshot-03-market.png` — Marketplace with listings
- `screenshot-04-chains.png` — Chains/Communities
- `screenshot-05-stories.png` — Stories reader
- `screenshot-06-me.png` — Human Passport / Me tab

---

## Required Metadata for Developer Portal

### App Name
```
HumanChain
```

### Short Description (under 25 words)
```
Ask real humans, post moments, trade nearby, and read stories — verified by World ID.
```

### Category
```
Social
```

### Tags
```
community, marketplace, stories, verified, trust, ask, trade
```

### App URL
```
https://human-chain-gamma.vercel.app
```

### Support Email
```
brianokindo2022@gmail.com
```

---

## Environment Variables (already set in Vercel)
- `WORLD_APP_ID` = `app_fd34958eed3f67a6710d76c46d261f77`
- `DEV_PORTAL_API_KEY` = set ✅
- `HUMANCHAIN_TREASURY_WALLET` = `0x6588e8765c495a9d44e93b0293aedd7ecd6167fc`

---

## Pre-submission Checklist
- [ ] App icon uploaded (1024×1024)
- [ ] Content card uploaded (1035×720 PNG)
- [ ] At least 3 screenshots uploaded
- [ ] App URL responds and loads
- [ ] World ID auth works inside World App
- [ ] Payment flow tested with real WLD
- [ ] Support email set
- [ ] Description is under 25 words
- [ ] No "World" in app name ✅
- [ ] No NFT gating, no subscriptions ✅
- [ ] MiniKit SDK live integration ✅
