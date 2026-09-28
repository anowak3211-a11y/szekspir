import {parseMarket} from '@/lib/market';
import {selectableVoices} from '@/lib/voice-library';
import { NextResponse } from "next/server";
import { listVoices } from "@/lib/elevenlabs";

export async function GET(req:Request) {
  try {
    return NextResponse.json({ voices: selectableVoices(await listVoices(),parseMarket(new URL(req.url).searchParams.get('market')??undefined)) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
