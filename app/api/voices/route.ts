import {accountRoute} from '@/lib/account-route';
import {parseMarket} from '@/lib/market';
import {selectableVoices} from '@/lib/voice-library';
import { NextResponse } from "next/server";
import { listVoices } from "@/lib/elevenlabs";

async function accountGET(req:Request) {
  try {
    return NextResponse.json({ voices: selectableVoices(await listVoices(),parseMarket(new URL(req.url).searchParams.get('market')??undefined)) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const GET=accountRoute(accountGET);
