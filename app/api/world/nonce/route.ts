import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ nonce: randomBytes(16).toString("hex") });
}
