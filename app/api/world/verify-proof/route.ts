import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { idkitResponse, action, signal } = (await req.json()) as {
    idkitResponse?: unknown;
    action?: string;
    signal?: string;
  };

  if (!idkitResponse || !action) {
    return NextResponse.json(
      { error: "Missing World ID response or action." },
      { status: 400 },
    );
  }

  if (!process.env.WORLD_RP_ID) {
    return NextResponse.json({
      ok: false,
      pendingSetup: true,
      action,
      signal,
      message: "Add WORLD_RP_ID before verifying World ID proofs.",
    });
  }

  const response = await fetch(
    `https://developer.world.org/api/v4/verify/${process.env.WORLD_RP_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idkitResponse),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json({ ok: false, payload }, { status: 400 });
  }

  return NextResponse.json({ ok: true, payload });
}
