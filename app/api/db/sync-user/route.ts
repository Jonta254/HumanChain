import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { isValidWalletAddress } from "@/lib/validation/schemas";
import { createErrorResponse, createSuccessResponse, getClientIp, verifyWalletOwnership, ErrorCode } from "@/lib/api/responses";
import { logger } from "@/lib/api/logging";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const route = "POST /api/db/sync-user";

  try {
    const body = await req.json();
    const { wallet, username, points, streak, tier } = body as {
      wallet?: unknown;
      username?: unknown;
      points?: unknown;
      streak?: unknown;
      tier?: unknown;
    };

    // Validate wallet address format
    if (!wallet || !isValidWalletAddress(wallet)) {
      logger.warn("Invalid wallet address", { route, ip: clientIp, data: { wallet } });
      return createErrorResponse(ErrorCode.INVALID_INPUT, "Invalid wallet address format.", { status: 400 });
    }

    // Verify authentication and wallet ownership
    if (!verifyWalletOwnership(req, wallet)) {
      logger.warn("Unauthorized wallet sync attempt", { route, ip: clientIp, data: { wallet } });
      return createErrorResponse(ErrorCode.UNAUTHORIZED, "Wallet authentication required.", { status: 401 });
    }

    // Validate optional fields
    if (username && typeof username !== "string") {
      return createErrorResponse(ErrorCode.INVALID_INPUT, "Username must be a string.", { status: 400 });
    }
    if (points !== undefined && (!Number.isInteger(points) || (points as number) < 0)) {
      return createErrorResponse(ErrorCode.INVALID_INPUT, "Points must be a positive integer.", { status: 400 });
    }
    if (streak !== undefined && (!Number.isInteger(streak) || (streak as number) < 0)) {
      return createErrorResponse(ErrorCode.INVALID_INPUT, "Streak must be a positive integer.", { status: 400 });
    }

    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_users")
      .upsert(
        {
          wallet,
          username: username ?? "Human",
          points: points ?? 0,
          streak: streak ?? 0,
          tier: tier ?? "Bronze",
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "wallet" }
      )
      .select()
      .single();

    if (error) {
      logger.error("Supabase upsert error", { route, ip: clientIp, error });
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to sync user profile.",
        { status: 500, retryable: true }
      );
    }

    logger.info("User profile synced", { route, ip: clientIp, data: { wallet } });
    return createSuccessResponse({ user: data });
  } catch (error) {
    logger.error("User sync error", { route, ip: clientIp, error });
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An unexpected error occurred.",
      { status: 500, retryable: true }
    );
  }
}
