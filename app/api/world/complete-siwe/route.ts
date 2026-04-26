import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // TODO: Verify SIWE payload server-side and create a secure session.
  return NextResponse.json({
    ok: true,
    received: Boolean(body?.payload),
  });
}
