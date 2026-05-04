# HumanChain Production Readiness

HumanChain is ready to run as a World Mini App shell, but real multi-user launch
needs durable services behind the interactive UI.

## Already Added

- World wallet login route with nonce cookie validation.
- WLD payment reference and confirmation routes.
- World notification route with validation.
- World ID proof route with validation.
- Basic API rate limiting.
- No-store API responses.
- Security headers.
- Health endpoint at `/api/health`.
- Web app manifest and robots file.
- Vercel Blob upload route for user post images.

## Required Environment Variables

```bash
APP_ID=
NEXT_PUBLIC_WORLD_APP_ID=
NEXT_PUBLIC_APP_URL=
DEV_PORTAL_API_KEY=
NEXT_PUBLIC_HUMANCHAIN_TREASURY=
WORLD_RP_ID=
WORLD_RP_SIGNING_SECRET=
BLOB_READ_WRITE_TOKEN=
DATABASE_URL=
```

## Before Public Launch

- Add a real database using `DATABASE_URL` for posts, comments, reactions,
  profile history, story saves, daily answers, and moderation status.
- Keep Vercel Blob for uploaded images; store only Blob URLs in the database.
- Replace in-memory rate limiting with Redis or another shared rate limiter so
  limits work across serverless instances.
- Add moderation review tables for user stories and image posts.
- Verify the final App ID, treasury wallet, and Developer Portal API key in a
  preview deployment before Mini App Store submission.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm verify
```
