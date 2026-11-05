import { NextRequest, NextResponse } from 'next/server';
import {
  applyRetentionDiscount30,
  cancelLoopSubscription,
  chargeSavedCardAndCancel,
  delaySubscription28Days,
  findActiveSubscriptionsByEmail,
  setRuntimeLoopToken,
  verifySubSession,
} from '@/lib/bennett-loop-sub';

export const maxDuration = 60;

const ALLOWED_ORIGINS = new Set([
  'https://bennettseed.co',
  'https://www.bennettseed.co',
  'https://ucnevy-h8.myshopify.com',
]);

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowOrigin =
    ALLOWED_ORIGINS.has(origin) || origin.endsWith('.shopifypreview.com')
      ? origin
      : 'https://bennettseed.co';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { status: 'ok', service: 'bennett-sub-automation' },
    { headers: corsHeaders(req) },
  );
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || '').trim();

    // Admin token hot-update if needed without redeploy
    if (action === 'admin_rotate_token') {
      const adminSecret = process.env.CRON_SECRET || process.env.BENNETT_UK_CAPI_KEY || 'bs_capi_v1_9f4e2a8d7c';
      if (String(body.secret || '') !== adminSecret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers });
      }
      const newTok = String(body.token || '').trim();
      if (!newTok) {
        return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400, headers });
      }
      setRuntimeLoopToken(newTok);
      return NextResponse.json({ ok: true }, { headers });
    }

    if (action === 'lookup') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { ok: false, message: 'Please enter the valid email address used at checkout.' },
          { status: 400, headers },
        );
      }
      const subscriptions = await findActiveSubscriptionsByEmail(email);
      if (subscriptions.length === 0) {
        return NextResponse.json(
          {
            ok: false,
            notFound: true,
            message:
              'No active subscription was found for that email address (it may already be cancelled, or placed under a different Apple Pay / Shop Pay email).',
          },
          { headers },
        );
      }
      return NextResponse.json({ ok: true, subscriptions }, { headers });
    }

    const sessionToken = String(body.sessionToken || '').trim();
    const session = verifySubSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: 'Your session expired. Please look up your email address again.' },
        { status: 401, headers },
      );
    }

    if (action === 'delay_28d') {
      const res = await delaySubscription28Days(
        session.loopId,
        session.nextScheduleId,
        session.nextBillingUnix,
      );
      return NextResponse.json(res, { headers });
    }

    if (action === 'apply_stay30') {
      const res = await applyRetentionDiscount30(session.loopId);
      return NextResponse.json(res, { headers });
    }

    if (action === 'cancel_free') {
      if (session.paidOrdersCount < 2) {
        return NextResponse.json(
          {
            ok: false,
            message:
              'Your Subscribe & Save plan (-25%) requires 2 billing cycles before free cancellation unlocks, or you can complete the £' +
              session.feeGbp +
              '.00 single-order rate adjustment.',
          },
          { status: 403, headers },
        );
      }
      const res = await cancelLoopSubscription(
        session.loopId,
        String(body.reason || 'Completed 2+ billing cycles — customer self-serve cancel'),
        'Self-serve cancellation after completing minimum 2 billing cycles.',
      );
      return NextResponse.json(res, { headers });
    }

    if (action === 'charge_saved_and_cancel') {
      if (!body.authorised) {
        return NextResponse.json(
          { ok: false, message: 'Please tick the payment authorisation box first.' },
          { status: 400, headers },
        );
      }
      const res = await chargeSavedCardAndCancel(
        session.loopId,
        session.shopifyId,
        session.feeGbp,
      );
      return NextResponse.json(res, { headers });
    }

    return NextResponse.json({ ok: false, message: 'Unsupported action.' }, { status: 400, headers });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : 'Unexpected server error.',
      },
      { status: 500, headers },
    );
  }
}
