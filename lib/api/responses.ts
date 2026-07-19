/**
 * Standardized API error responses and utilities
 * Ensures consistent error handling across all endpoints
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/session";

// Standard error codes for client-side handling
export const ErrorCode = {
  // Client errors
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_PAYMENT: "INVALID_PAYMENT",
  INVALID_PROOF: "INVALID_PROOF",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMIT: "RATE_LIMIT",
  CONFLICT: "CONFLICT",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  SETUP_INCOMPLETE: "SETUP_INCOMPLETE",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// Standard API response format
export interface ApiErrorResponse {
  ok: false;
  code: ErrorCodeType;
  message: string;
  details?: Record<string, unknown>;
  errors?: string[];
  retryable?: boolean;
  timestamp?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data?: T;
  timestamp?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCodeType,
  message: string,
  options?: {
    status?: number;
    details?: Record<string, unknown>;
    errors?: string[];
    retryable?: boolean;
  },
): NextResponse<ApiErrorResponse> {
  const statusMap: Record<ErrorCodeType, number> = {
    INVALID_INPUT: 400,
    MISSING_FIELD: 400,
    INVALID_PAYMENT: 422,
    INVALID_PROOF: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    RATE_LIMIT: 429,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    DATABASE_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    EXTERNAL_SERVICE_ERROR: 502,
    SETUP_INCOMPLETE: 503,
  };

  const status = options?.status ?? statusMap[code];

  const response: ApiErrorResponse = {
    ok: false,
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  if (options?.details) response.details = options.details;
  if (options?.errors && options.errors.length > 0) response.errors = options.errors;
  if (options?.retryable !== undefined) response.retryable = options.retryable;

  const res = NextResponse.json(response, { status });
  res.headers.set("Cache-Control", "no-store, max-age=0");

  return res;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T = unknown>(
  data?: T,
  options?: { status?: number },
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    ok: true,
    timestamp: new Date().toISOString(),
  };

  if (data !== undefined) response.data = data;

  const res = NextResponse.json(response, { status: options?.status ?? 200 });
  res.headers.set("Cache-Control", "no-store, max-age=0");

  return res;
}

/**
 * Extract client IP from request (handles proxies)
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Extract wallet from session cookie. Verifies the HMAC signature set at
 * SIWE completion (see lib/session.ts) — a prior version of this function
 * trusted the raw cookie value with no signature check at all, which meant
 * anyone could authenticate as any wallet by sending
 * `Cookie: humanchain_wallet=<any address>` directly to the API. Confirmed
 * exploitable against production before this fix.
 */
export function getSessionWallet(req: NextRequest): string | null {
  return verifySessionCookie(req.cookies.get("humanchain_wallet")?.value);
}

/**
 * Verify wallet ownership from session
 */
export function verifyWalletOwnership(req: NextRequest, requiredWallet: string): boolean {
  const sessionWallet = getSessionWallet(req);
  return sessionWallet === requiredWallet.toLowerCase();
}
