# World Developer Docs Notes For HumanChain

These are the World developer features HumanChain should use first.

## Mini App Foundation

- Build as a web app running inside World App.
- Use MiniKit JS.
- Mobile-first design is required.
- Keep navigation simple and touch-friendly.

## Auth

Use Wallet Authentication for sign-in.

Why:

- It connects a user to their World wallet.
- It supports account creation.
- It is better for app login than using Verify as the login system.

## Proof of Human

Use IDKit for important one-human actions. World docs currently note that World ID verification is moving into IDKit for new apps.

HumanChain actions:

- `daily-chain-link`
- `answer-question`
- `vote-human-verdict`
- `submit-human-story`
- `private-verified-ask`

## WLD Payments

Use the Pay command for:

- tips
- boosts
- pins
- private questions
- voice answers
- Deep Human Verdict
- Deep Human Mirror

Rules:

- Always create payment references server-side.
- Always verify transaction status server-side.
- Do not present WLD features as gambling, yield, or guaranteed profit.
- WLD should buy access, visibility, expression, convenience, or deeper perspective.

## Permissions

Request notification permission only after the user understands why.

Request microphone permission only when the user enters voice features.

## Notifications

Good HumanChain notifications:

- "Your Human Verdict is ready."
- "25 humans answered your question."
- "Someone tipped your answer."
- "Today's chain is live."
- "Your Human Streak ends today."
- "The monthly Human Story is open."

Avoid noisy or irrelevant notifications.

## Mini App Review

HumanChain should be careful with:

- moderation
- user safety
- clear paid feature descriptions
- no misleading rewards
- no chance-based money mechanics
- no promise of financial returns

## Environment Variables

Required before live World features work:

- `APP_ID`
- `WORLD_RP_ID`
- `WORLD_RP_SIGNING_SECRET`
- `DEV_PORTAL_API_KEY`
- `NEXT_PUBLIC_HUMANCHAIN_TREASURY`
