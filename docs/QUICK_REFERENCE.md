# HumanChain Improvements - Quick Reference Guide

## 🚀 Quick Links

| Resource | Location | Purpose |
|----------|----------|---------|
| **Implementation Roadmap** | `docs/IMPROVEMENT_ROADMAP.md` | 3-week detailed plan with milestones |
| **Complete Analysis** | `docs/ANALYSIS_AND_IMPROVEMENTS_SUMMARY.md` | Full assessment and recommendations |
| **Validation Schemas** | `lib/validation/schemas.ts` | Input validation functions |
| **API Responses** | `lib/api/responses.ts` | Standardized error/success responses |
| **Logging Framework** | `lib/api/logging.ts` | Structured logging utilities |
| **Example Implementation** | `lib/api/examples.confirm-payment.ts` | Best practices demonstration |

---

## 📋 Validation Functions

### Payments
```typescript
import { 
  isValidPaymentFeature,     // "tip" | "golden-link" | ... (10 types)
  isValidPaymentToken,       // "WLD"
  isValidPaymentAmount       // 1-6 WLD, matches feature
} from "@/lib/validation/schemas";

if (!isValidPaymentFeature(feature)) {
  return createErrorResponse(ErrorCode.INVALID_PAYMENT, "Invalid feature");
}
```

### Wallet & Authentication
```typescript
import {
  isValidWalletAddress,      // 0x + 40 hex chars
  validateSiweMessage,       // { nonce, payload }
  validateWorldIdProof       // { idkitResponse, action, signal }
} from "@/lib/validation/schemas";

const validation = validateWorldIdProof(input);
if (!validation.ok) {
  return createErrorResponse(ErrorCode.INVALID_PROOF, validation.error);
}
```

### Content
```typescript
import {
  validatePost,              // { text, images?, category? }
  validateMarketplaceListing // { title, description, price, location?, images? }
} from "@/lib/validation/schemas";

const result = validateMarketplaceListing(input);
if (!result.ok) {
  return createErrorResponse(
    ErrorCode.INVALID_INPUT,
    result.error,
    { errors: result.issues }
  );
}
```

---

## 🛑 Error Handling

### Error Codes (12 types)
```typescript
import { ErrorCode } from "@/lib/api/responses";

ErrorCode.INVALID_INPUT           // 400 - Bad input
ErrorCode.INVALID_PAYMENT         // 422 - Payment validation failed
ErrorCode.INVALID_PROOF           // 400 - Proof verification failed
ErrorCode.UNAUTHORIZED            // 401 - Missing authentication
ErrorCode.FORBIDDEN               // 403 - Access denied
ErrorCode.RATE_LIMIT              // 429 - Too many requests
ErrorCode.CONFLICT                // 409 - State conflict
ErrorCode.INTERNAL_ERROR          // 500 - Server error
ErrorCode.DATABASE_ERROR          // 500 - DB operation failed
ErrorCode.SERVICE_UNAVAILABLE     // 503 - Service down
ErrorCode.EXTERNAL_SERVICE_ERROR  // 502 - External API failed
ErrorCode.SETUP_INCOMPLETE        // 503 - Config missing
```

### Response Functions
```typescript
import { 
  createErrorResponse,    // Error with code, message, details
  createSuccessResponse   // Success with data
} from "@/lib/api/responses";

// Error response
return createErrorResponse(
  ErrorCode.INVALID_PAYMENT,
  "Payment amount mismatch",
  {
    status: 422,
    details: { provided: 5, expected: 3 },
    errors: ["amount too high"]
  }
);

// Success response
return createSuccessResponse({ userId: "abc123" });
```

### Utility Functions
```typescript
import {
  getClientIp,            // Extract IP from request
  getSessionWallet,       // Read wallet from cookie
  verifyWalletOwnership   // Check if session wallet matches
} from "@/lib/api/responses";

const ip = getClientIp(req);
const wallet = getSessionWallet(req);
if (!verifyWalletOwnership(req, userWallet)) {
  return createErrorResponse(ErrorCode.FORBIDDEN, "Wallet mismatch");
}
```

---

## 📝 Logging

### Basic Logging
```typescript
import { logger } from "@/lib/api/logging";

logger.info("Payment processed", {
  route: "POST /api/world/confirm-payment",
  ip: clientIp,
  data: { feature, amount, txId }
});

logger.error("Database connection failed", {
  route: "POST /api/db/sync-user",
  error: dbError
});
```

### Log Levels
```typescript
logger.debug(...) // Development only (DEBUG=true env var)
logger.info(...)  // General information
logger.warn(...)  // Warnings that should be investigated
logger.error(...) // Errors requiring attention
```

### Context Parameters
```typescript
logger.info("message", {
  route?: "POST /api/path",    // Current endpoint
  userId?: "user123",          // User identifier
  ip?: "192.168.1.1",          // Client IP
  data?: { key: "value" },     // Additional context
  error?: Error                // Error object
});
```

---

## 🔧 Implementation Steps

### Step 1: Import Utilities
```typescript
import { validatePost, isValidPaymentAmount } from "@/lib/validation/schemas";
import { createErrorResponse, ErrorCode, getClientIp } from "@/lib/api/responses";
import { logger } from "@/lib/api/logging";
```

### Step 2: Validate Input
```typescript
const validation = validatePost(body);
if (!validation.ok) {
  logger.warn("Invalid post", { route, ip, data: body });
  return createErrorResponse(ErrorCode.INVALID_INPUT, validation.error);
}
```

### Step 3: Process Request
```typescript
try {
  // Your business logic here
  logger.info("Post created", { route, ip, data: { postId } });
  return createSuccessResponse({ id: postId });
} catch (error) {
  logger.error("Failed to create post", { route, ip, error });
  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    "Failed to process request",
    { retryable: true }
  );
}
```

---

## 📊 Before vs. After

### Validation

**Before:**
```typescript
if (!payload?.transactionId || !reference || payload.reference !== reference) {
  return noStoreJson({ error: "Invalid payment" }, { status: 400 });
}
```

**After:**
```typescript
if (!isValidPaymentAmount(feature, amount)) {
  logger.warn("Invalid amount", { route, ip, feature, amount });
  return createErrorResponse(
    ErrorCode.INVALID_PAYMENT,
    `Invalid amount for feature "${feature}"`,
    { details: { provided: amount } }
  );
}
```

### Error Handling

**Before:**
```typescript
if (error) {
  console.error("[db/sync-user] error:", error.code);
  return NextResponse.json({ error: "Failed" }, { status: 500 });
}
```

**After:**
```typescript
if (error) {
  logger.error("User sync failed", { route, error, ip: clientIp });
  return createErrorResponse(
    ErrorCode.DATABASE_ERROR,
    "Failed to sync user profile",
    { retryable: true }
  );
}
```

---

## 🎯 Common Patterns

### Payment Endpoint
```typescript
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  if (await isRateLimitedKV(req, "confirm-payment", 20)) {
    return rateLimitResponse();
  }

  const body = await readJsonBody(req);
  if (!isValidPaymentAmount(body.feature, body.amount)) {
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, "...");
  }

  try {
    // Process payment
    logger.info("Payment confirmed", { route, ip: clientIp });
    return createSuccessResponse(data);
  } catch (error) {
    logger.error("Payment failed", { route, ip: clientIp, error });
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, "...");
  }
}
```

### Database Endpoint
```typescript
export async function POST(req: NextRequest) {
  const wallet = getSessionWallet(req);
  if (!verifyWalletOwnership(req, userWallet)) {
    return createErrorResponse(ErrorCode.FORBIDDEN, "Unauthorized");
  }

  if (!isValidWalletAddress(wallet)) {
    return createErrorResponse(ErrorCode.INVALID_INPUT, "Invalid wallet");
  }

  try {
    const result = await db.from("table").insert(data);
    logger.info("Data inserted", { route, userId: wallet });
    return createSuccessResponse(result);
  } catch (error) {
    logger.error("Database error", { route, error });
    return createErrorResponse(ErrorCode.DATABASE_ERROR, "...");
  }
}
```

### Content Upload Endpoint
```typescript
export async function POST(req: NextRequest) {
  const validation = validateMarketplaceListing(body);
  if (!validation.ok) {
    logger.warn("Invalid listing", { route, errors: validation.issues });
    return createErrorResponse(
      ErrorCode.INVALID_INPUT,
      validation.error,
      { errors: validation.issues }
    );
  }

  try {
    // Process and upload
    return createSuccessResponse({ listingId: "123" });
  } catch (error) {
    logger.error("Upload failed", { route, error });
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, "...");
  }
}
```

---

## 🚦 Migration Checklist

- [ ] Review `docs/IMPROVEMENT_ROADMAP.md`
- [ ] Read all new utility files
- [ ] Update payment confirmation endpoint (example provided)
- [ ] Test locally with staging World App
- [ ] Update remaining 5 critical endpoints
- [ ] Add logging to error paths
- [ ] Update client error handling
- [ ] Test all error scenarios
- [ ] Deploy to staging
- [ ] Monitor for 24 hours
- [ ] Rollout to production
- [ ] Set up external logging service

---

## 💬 Questions?

Refer to these docs:
- **Implementation Details:** `docs/IMPROVEMENT_ROADMAP.md`
- **Full Analysis:** `docs/ANALYSIS_AND_IMPROVEMENTS_SUMMARY.md`
- **Example Code:** `lib/api/examples.confirm-payment.ts`

---

**Status:** Ready for Implementation ✅  
**Effort Estimate:** 1-2 weeks for complete rollout  
**Impact:** High (security, reliability, maintainability)
