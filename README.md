# HumanChain

HumanChain is a World Mini App concept where verified humans ask real questions, join daily global chains, read monthly human stories, trade through a nearby human marketplace, and get the world's verdict.

## Core Promise

Ask real humans. Get the world's verdict.

## Primary Areas

- Home: live global highlights, streaks, verdict previews, marketplace entry, and quick actions.
- Ask: ask verified humans questions and unlock WLD-powered reach.
- Market: store item listings, upload up to 3 included photos, pay small publishing fees, boost nearby discovery, promote business links, and keep marketplace history.
- Chains: join the daily global chain and add one meaningful link.
- Stories: read the monthly Human Story, a page-based story about being human.
- Me: streak, profile, badges, WLD actions, saved human wisdom, and stored marketplace history.

## User Control

- Marketplace listing history can be cleared from the Me tab.
- Image posts can be reset from the Me tab.
- Activity history can be reset from the Me tab.
- A local preview account can be deleted, clearing local posts, marketplace listings, and history from the device.

## World Mini App Commands Used

- Wallet Auth: verified human entry.
- Pay: paid publishing, boosts, stories, and marketplace actions with backend confirmation.
- World Chat: direct seller inbox messages from Marketplace listing cards.
- Share: native sharing for listings and business ads.
- Request Permission: notifications and microphone access only when needed.

## Mini App Guidelines

HumanChain includes an in-app guide with English, Spanish, Swahili, French, and Arabic guidance for questions, stories, marketplace trading, paid actions, chat, and account deletion.

## Local Storage

HumanChain stores preview activity locally so the app feels continuous while backend storage is being connected:

- `humanchain_posts`: image posts and comments.
- `humanchain_marketplace`: stored marketplace listings, photos, prices, areas, links, and payment-ready status.
- `humanchain_history`: profile, post, tip, and marketplace activity records.

## Local Development

```bash
pnpm install
pnpm dev
```

The app is designed for World App mobile webviews first.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If a Windows sandbox blocks Next.js worker processes with `spawn EPERM`, run the
same command outside the sandbox. `pnpm build:webpack` is available as a local
fallback, while Vercel should keep using `pnpm build`.

## Important Docs

- [Build steps](docs/BUILD_STEPS.md)
- [Product structure](docs/HUMANCHAIN_STRUCTURE.md)
- [Production readiness](docs/PRODUCTION_READINESS.md)
- [World docs notes](docs/WORLD_DOCS_NOTES.md)

## Environment

Copy `.env.example` to `.env.local` and fill:

```bash
APP_ID=
DEV_PORTAL_API_KEY=
NEXT_PUBLIC_HUMANCHAIN_TREASURY=
```
