import { NextRequest, NextResponse } from 'next/server';
import { recordAbTestEvent, type AbVariantKey } from '@/lib/ab-test-tracker';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Shopify-Topic, X-Shopify-Shop-Domain',
  'Cache-Control': 'no-store',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
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

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    const payload = (rawText ? JSON.parse(rawText) : {}) as Record<string, unknown>;

    // 1. Check if this is a native Shopify order webhook (orders/create or orders/paid)
    const shopifyTopic = (req.headers.get('x-shopify-topic') || '').toLowerCase();
    const shopifyDomain = req.headers.get('x-shopify-shop-domain') || '';
    if (shopifyTopic.includes('orders/') || (payload.id && payload.total_price && Array.isArray(payload.line_items))) {
      const attrs = extractNoteAttrs(payload.note_attributes);
      const landingSite = typeof payload.landing_site === 'string' ? payload.landing_site : '';
      let variantRaw = (attrs._ab_variant || attrs.ab_variant || '').toUpperCase();
      if (variantRaw !== 'A' && variantRaw !== 'B') {
        if (landingSite.includes('ab=B') || landingSite.includes('kp-krystyna')) variantRaw = 'B';
        else if (landingSite.includes('ab=A')) variantRaw = 'A';
      }
      if (variantRaw !== 'A' && variantRaw !== 'B') {
        return NextResponse.json(
          { ok: true, skipped: true, reason: 'No _ab_variant attribute on order' },
          { headers: CORS_HEADERS },
        );
      }

      const lineItems = Array.isArray(payload.line_items) ? payload.line_items : [];
      const itemsSummary = lineItems
        .map(li => {
          const item = li as Record<string, unknown>;
          return `${item.quantity || 1}x ${item.title || 'Produkt'}`;
        })
        .join(', ');

      const result = await recordAbTestEvent({
        testId: attrs._ab_test || undefined,
        storeDomain: shopifyDomain || undefined,
        variant: variantRaw as AbVariantKey,
        event: 'purchase',
        visitorId: attrs._ab_vid || undefined,
        orderId: String(payload.id || payload.order_number || Date.now()),
        orderNumber: String(payload.name || payload.order_number || payload.id || ''),
        revenuePln: Number(payload.total_price || 0),
        currency: String(payload.currency || 'PLN'),
        itemsSummary: itemsSummary || 'Zamówienie Shopify Webhook',
        source: 'shopify_webhook',
      });

      return NextResponse.json(result, { headers: CORS_HEADERS });
    }

    // 2. Standard Storefront Beacon / Checkout Custom Pixel payload
    const variant: AbVariantKey = String(payload.variant || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    const rawEvent = String(payload.event || 'view').toLowerCase();
    const event =
      rawEvent === 'atc' || rawEvent === 'ic' || rawEvent === 'purchase' ? rawEvent : 'view';

    const result = await recordAbTestEvent({
      testId: typeof payload.testId === 'string' ? payload.testId : undefined,
      storeDomain: typeof payload.storeDomain === 'string' ? payload.storeDomain : undefined,
      variant,
      event,
      visitorId: typeof payload.visitorId === 'string' ? payload.visitorId : undefined,
      orderId: payload.orderId != null ? String(payload.orderId) : undefined,
      orderNumber: payload.orderNumber != null ? String(payload.orderNumber) : undefined,
      revenuePln: payload.revenuePln != null ? Number(payload.revenuePln) : undefined,
      currency: typeof payload.currency === 'string' ? payload.currency : 'PLN',
      itemsSummary: typeof payload.itemsSummary === 'string' ? payload.itemsSummary : undefined,
      source:
        payload.source === 'test_ping' || payload.source === 'shopify_webhook' || payload.source === 'manual_sync'
          ? payload.source
          : 'checkout_pixel',
    });

    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Invalid payload' },
      { status: 400, headers: CORS_HEADERS },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: true, service: 'szekspir-ab-test-tracker', version: '1.0' },
    { headers: CORS_HEADERS },
  );
}
