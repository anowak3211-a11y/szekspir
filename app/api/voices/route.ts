import {selectableVoices} from '@/lib/voice-library';
import { NextResponse } from "next/server";
import { listVoices } from "@/lib/elevenlabs";

export async function GET() {
  try {
    return NextResponse.json({ voices: selectableVoices(await listVoices()) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
