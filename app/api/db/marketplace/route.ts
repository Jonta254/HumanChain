import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? "active";
    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_marketplace")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ listings: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      title: string;
      price: number;
      condition: string;
      category: string;
      description?: string;
      seller_wallet: string;
      seller_username: string;
      location?: string;
    };
    if (!body.title || !body.seller_wallet)
      return NextResponse.json({ error: "title and seller_wallet required" }, { status: 400 });

    const db = createServiceClient();
    const { data, error } = await db
      .from("hc_marketplace")
      .insert({ ...body, description: body.description ?? null, location: body.location ?? null })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ listing: data });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
