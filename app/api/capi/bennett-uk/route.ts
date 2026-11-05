import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { inOwnerWorkspace } from '@/lib/account-context';
import { metaToken, metaProof, META_VERSION } from '@/lib/meta-client';
import { autoCancelByWebhookOrder, RATE_ADJ_PRODUCT_ID } from '@/lib/bennett-loop-sub';

export const maxDuration = 60;

const WEBHOOK_KEY = process.env.BENNETT_UK_CAPI_KEY || 'bs_capi_v1_9f4e2a8d7c';
const PIXEL_S1_HAIR = '1440642884707325';
const PIXEL_S2_CORE = '1600980978391826';
const HAIR_PRODUCT_ID = 16662934389126;

function sha256(val: string): string {
  return createHash('sha256').update(val, 'utf8').digest('hex');
}

function normEmail(v?: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const c = v.trim().toLowerCase();
  return c ? sha256(c) : undefined;
}

function normPhone(v?: unknown, defaultCountry = '44'): string | undefined {
  if (typeof v !== 'string') return undefined;
  let digits = v.replace(/\D+/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0') && defaultCountry === '44') digits = '44' + digits.slice(1);
  return digits.length >= 7 ? sha256(digits) : undefined;
}

function normName(v?: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const c = v.trim().toLowerCase().replace(/[^a-z\u00c0-\u024f]/g, '');
  return c ? sha256(c) : undefined;
}

function normCity(v?: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const c = v.trim().toLowerCase().replace(/[^a-z]/g, '');
  return c ? sha256(c) : undefined;
}

function normZip(v?: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const c = v.trim().toLowerCase().replace(/\s+/g, '');
  return c ? sha256(c) : undefined;
}

function normCountry(v?: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const c = v.trim().toLowerCase().slice(0, 2);
  return c.length === 2 ? sha256(c) : undefined;
}

async function resolveMetaAuth(): Promise<{ token: string; proof?: string }> {
  try {
    const token = await metaToken();
    return { token, proof: await metaProof(token) };
  } catch {
    try {
      const token = await inOwnerWorkspace(() => metaToken());
      return { token, proof: await inOwnerWorkspace(() => metaProof(token)) };
    } catch {
      const { accountRegistry } = await import('@/lib/account-repository');
      const { inWorkspace } = await import('@/lib/account-context');
      const reg = await accountRegistry();
      for (const u of Object.values(reg.users || {})) {
        try {
          const token = await inWorkspace(u, () => metaToken());
          const proof = await inWorkspace(u, () => metaProof(token));
          return { token, proof };
        } catch {
          // continue
        }
      }
      throw new Error('No Meta token available for Bennett UK CAPI');
    }
  }
}

async function sendCapiEvents(pixelId: string, events: Array<Record<string, unknown>>) {
  const { token, proof } = await resolveMetaAuth();
  const url = new URL(`https://graph.facebook.com/${META_VERSION}/${pixelId}/events`);
  const body = new URLSearchParams();
  body.set('data', JSON.stringify(events));
  if (proof) body.set('appsecret_proof', proof);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(25000),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.error) {
    throw new Error(`Meta CAPI error (${pixelId}): ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

function extractNoteAttrs(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!Array.isArray(raw)) return out;
  for (const item of raw) {
    if (item && typeof item === 'object') {
      const rec = item as Record<string, unknown>;
      const k = typeof rec.name === 'string' ? rec.name.trim() : '';
      const v = rec.value != null ? String(rec.value).trim() : '';
      if (k && v) out[k] = v;
    }
  }
  return out;
}

function resolveTargetPixel(
  attrs: Record<string, string>,
  lineItems: unknown,
  landingSite?: string,
): { pixelId: string; tierGroup: 's1' | 's2' } {
  const px = attrs.bs_pixel || '';
  const silo = (attrs.bs_silo || '').toLowerCase();
  if (px === PIXEL_S1_HAIR || silo === 's1' || silo === 'womens_hair') {
    return { pixelId: PIXEL_S1_HAIR, tierGroup: 's1' };
  }
  if (px === PIXEL_S2_CORE || silo === 's2' || silo === 'antki_health') {
    return { pixelId: PIXEL_S2_CORE, tierGroup: 's2' };
  }
  if (Array.isArray(lineItems) && lineItems.length > 0) {
    const productIds = lineItems
      .map(li => Number((li as Record<string, unknown>)?.product_id || 0))
      .filter(Boolean);
    if (productIds.length > 0 && productIds.every(pid => pid === HAIR_PRODUCT_ID)) {
      return { pixelId: PIXEL_S1_HAIR, tierGroup: 's1' };
    }
    if (productIds.length > 0) {
      return { pixelId: PIXEL_S2_CORE, tierGroup: 's2' };
    }
  }
  const ls = (landingSite || '').toLowerCase();
  if (
    ls.includes('daily-shine') ||
    ls.includes('fuller-hair') ||
    ls.includes('after-years') ||
    ls.includes('psos-on-the-market') ||
    ls.includes('rapid-change') ||
    ls.includes('crown-volume')
  ) {
    return { pixelId: PIXEL_S1_HAIR, tierGroup: 's1' };
  }
  return { pixelId: PIXEL_S2_CORE, tierGroup: 's2' };
}

export async function POST(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-bs-capi-key') || '';
    if (key !== WEBHOOK_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const topic = (req.headers.get('x-shopify-topic') || String(payload.topic || '')).toLowerCase();

    // Day-1 Seed Action: registers BS_Order_Confirmed, BS_Step_Next, BS_Select_Tier in Meta Events Manager immediately
    if (payload.action === 'seed_events') {
      const nowSec = Math.floor(Date.now() / 1000);
      const seedUser = {
        country: [sha256('gb')],
        client_ip_address: '81.2.69.142',
        client_user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15',
      };
      const results: Record<string, unknown> = {};
      for (const [px, tier] of [
        [PIXEL_S2_CORE, 's2'],
        [PIXEL_S1_HAIR, 's1'],
      ] as const) {
        const events = [
          {
            event_name: 'BS_Step_View',
            event_time: nowSec,
            event_id: `bs_seed_vw_${tier}_${nowSec}`,
            action_source: 'website',
            event_source_url: 'https://bennettseed.co/',
            user_data: seedUser,
            custom_data: { tier_group: tier, content_category: 'Toys & Games' },
          },
          {
            event_name: 'BS_Select_Tier',
            event_time: nowSec,
            event_id: `bs_seed_sel_${tier}_${nowSec}`,
            action_source: 'website',
            event_source_url: 'https://bennettseed.co/',
            user_data: seedUser,
            custom_data: { value: 63.98, currency: 'GBP', content_type: 'product', content_category: 'Toys & Games', tier_group: tier },
          },
          {
            event_name: 'BS_Step_Next',
            event_time: nowSec,
            event_id: `bs_seed_nxt_${tier}_${nowSec}`,
            action_source: 'website',
            event_source_url: 'https://bennettseed.co/',
            user_data: seedUser,
            custom_data: { value: 63.98, currency: 'GBP', content_type: 'product', content_category: 'Toys & Games', tier_group: tier },
          },
          {
            event_name: 'BS_Order_Confirmed',
            event_time: nowSec,
            event_id: `bs_seed_ord_${tier}_${nowSec}`,
            action_source: 'website',
            event_source_url: 'https://bennettseed.co/',
            user_data: seedUser,
            custom_data: { value: 63.98, currency: 'GBP', num_items: 3, content_type: 'product', content_category: 'Toys & Games', tier_group: tier },
          },
        ];
        results[px] = await sendCapiEvents(px, events);
      }
      return NextResponse.json({ ok: true, seeded: results });
    }

    const attrs = extractNoteAttrs(payload.note_attributes);
    const landingSite = typeof payload.landing_site === 'string' ? payload.landing_site : '';
    const lineItems = Array.isArray(payload.line_items) ? payload.line_items : [];
    const { pixelId, tierGroup } = resolveTargetPixel(attrs, lineItems, landingSite);

    const billing = (payload.billing_address || {}) as Record<string, unknown>;
    const shipping = (payload.shipping_address || {}) as Record<string, unknown>;
    const customer = (payload.customer || {}) as Record<string, unknown>;
    const clientDetails = (payload.client_details || {}) as Record<string, unknown>;

    const isRateAdjustment =
      Boolean(attrs.bs_cancel_contract) ||
      lineItems.some(li => {
        const item = (li || {}) as Record<string, unknown>;
        return (
          Number(item.product_id) === RATE_ADJ_PRODUCT_ID ||
          String(item.sku || '').startsWith('BS-RATE-ADJ-')
        );
      });

    if (isRateAdjustment) {
      if (topic.startsWith('checkouts/')) {
        return NextResponse.json({ ok: true, skipped: 'rate_adjustment_checkout' });
      }
      const rawOrderEmail = String(
        payload.email || payload.contact_email || customer.email || attrs.bs_cancel_email || '',
      )
        .trim()
        .toLowerCase();
      const cancelRes = await autoCancelByWebhookOrder(rawOrderEmail, attrs.bs_cancel_contract);
      return NextResponse.json({
        ok: true,
        skipped: 'rate_adjustment_order',
        autoCancelled: cancelRes,
      });
    }

    if (String(payload.source_name || '').toLowerCase() === 'subscription_contract') {
      return NextResponse.json({ ok: true, skipped: 'recurring_subscription_rebill' });
    }

    const emailHash = normEmail(payload.email || payload.contact_email || customer.email);
    const phoneHash = normPhone(
      payload.phone || billing.phone || shipping.phone || customer.phone,
      String(billing.country_code || shipping.country_code || 'GB') === 'GB' ? '44' : '',
    );
    const fnHash = normName(billing.first_name || shipping.first_name || customer.first_name);
    const lnHash = normName(billing.last_name || shipping.last_name || customer.last_name);
    const ctHash = normCity(billing.city || shipping.city);
    const zpHash = normZip(billing.zip || shipping.zip);
    const countryHash = normCountry(billing.country_code || shipping.country_code || 'GB');
    const extId = customer.id ? sha256(String(customer.id)) : undefined;

    let fbc = attrs.fbc || attrs._fbc || '';
    if (!fbc && landingSite.includes('fbclid=')) {
      try {
        const u = new URL(landingSite, 'https://bennettseed.co');
        const cid = u.searchParams.get('fbclid');
        if (cid) fbc = `fb.1.${Date.now()}.${cid}`;
      } catch {
        // ignore
      }
    }
    const fbp = attrs.fbp || attrs._fbp || '';
    const ip = String(clientDetails.browser_ip || payload.browser_ip || '').trim();
    const ua = String(clientDetails.user_agent || '').trim();

    const userData: Record<string, unknown> = {};
    if (emailHash) userData.em = [emailHash];
    if (phoneHash) userData.ph = [phoneHash];
    if (fnHash) userData.fn = [fnHash];
    if (lnHash) userData.ln = [lnHash];
    if (ctHash) userData.ct = [ctHash];
    if (zpHash) userData.zp = [zpHash];
    if (countryHash) userData.country = [countryHash];
    if (extId) userData.external_id = [extId];
    if (ip) userData.client_ip_address = ip;
    if (ua) userData.client_user_agent = ua;
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;

    const totalVal = Math.max(0, Number(payload.total_price || payload.current_total_price || 0) || 0);
    const currency = String(payload.currency || payload.presentment_currency || 'GBP').toUpperCase();
    const contentIds = lineItems
      .map(li => String((li as Record<string, unknown>)?.product_id || ''))
      .filter(Boolean);
    const numItems = lineItems.reduce(
      (acc, li) => acc + (Number((li as Record<string, unknown>)?.quantity || 1) || 1),
      0,
    ) || 1;

    const createdIso = String(payload.processed_at || payload.created_at || '');
    const parsedMs = createdIso ? Date.parse(createdIso) : NaN;
    const nowSec = Math.floor(Date.now() / 1000);
    const eventTime = Number.isFinite(parsedMs)
      ? Math.max(nowSec - 6 * 86400, Math.min(nowSec, Math.floor(parsedMs / 1000)))
      : nowSec;

    const isCheckoutTopic = topic.startsWith('checkouts/');
    const primaryEventName = isCheckoutTopic ? 'InitiateCheckout' : 'Purchase';
    const backupEventName = isCheckoutTopic ? 'BS_Step_Next' : 'BS_Order_Confirmed';
    const rawEntityId = String(payload.id || payload.token || Date.now());
    const primaryEventId = isCheckoutTopic ? `ic_${rawEntityId}` : `pur_${rawEntityId}`;
    const backupEventId = isCheckoutTopic ? `bs_chk_${rawEntityId}` : `bs_ord_${rawEntityId}`;

    // Skip zero-value internal $0 test discounts if markedBSTESTORDER00
    const discountCodes = Array.isArray(payload.discount_codes) ? payload.discount_codes : [];
    const isInternalZeroTest =
      totalVal === 0 &&
      discountCodes.some(d => String((d as Record<string, unknown>)?.code || '').toUpperCase() === 'BSTESTORDER00');
    if (isInternalZeroTest) {
      return NextResponse.json({ ok: true, skipped: 'internal_zero_test_order' });
    }

    const sharedCustomData = {
      value: Number(totalVal.toFixed(2)),
      currency,
      num_items: numItems,
      content_type: 'product',
      content_name: 'Cold-Pressed Pumpkin Seed Oil',
      ...(contentIds.length > 0 ? { content_ids: Array.from(new Set(contentIds)) } : {}),
      content_category: 'Toys & Games',
      tier_group: tierGroup,
    };

    const primaryEvent = {
      event_name: primaryEventName,
      event_time: eventTime,
      event_id: primaryEventId,
      action_source: 'website',
      event_source_url: 'https://bennettseed.co/',
      user_data: userData,
      custom_data: sharedCustomData,
    };

    const backupEvent = {
      event_name: backupEventName,
      event_time: eventTime,
      event_id: backupEventId,
      action_source: 'website',
      event_source_url: 'https://bennettseed.co/',
      user_data: userData,
      custom_data: sharedCustomData,
    };

    const metaRes = await sendCapiEvents(pixelId, [primaryEvent, backupEvent]);
    return NextResponse.json({
      ok: true,
      pixelId,
      tierGroup,
      eventName: primaryEventName,
      backupEventName,
      eventId: primaryEventId,
      backupEventId,
      value: Number(totalVal.toFixed(2)),
      currency,
      meta: metaRes,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'CAPI dispatch failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'bennett-uk-stealth-capi' });
}
