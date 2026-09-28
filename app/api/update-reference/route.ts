import { NextRequest, NextResponse } from "next/server";
import { updateReference } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { adId, reference } = await req.json();
    if (!adId || !reference) {
      return NextResponse.json(
        { error: "adId and reference required" },
        { status: 400 }
      );
    }
    await updateReference(adId, reference);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
