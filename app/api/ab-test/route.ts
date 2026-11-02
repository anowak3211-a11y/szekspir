import { NextRequest, NextResponse } from 'next/server';
import {
  buildShopifyCheckoutPixelSnippet,
  buildShopifyHeadSnippet,
  createCustomAbTest,
  getAbTestDashboardState,
  recordAbTestEvent,
  resetAbTestStats,
  updateAbTestConfig,
  type AbTestExperiment,
  type AbTrafficAllocation,
  type AbVariantKey,
} from '@/lib/ab-test-tracker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'https://szekspir.vercel.app';
    const state = await getAbTestDashboardState();
    const withSnippets = state.summaries.map(s => ({
      ...s,
      snippets: {
        headLiquid: buildShopifyHeadSnippet(s.experiment, origin),
        checkoutPixel: buildShopifyCheckoutPixelSnippet(s.experiment, origin),
      },
    }));
    return NextResponse.json(
      {
        ok: true,
        summaries: withSnippets,
        updatedAt: state.updatedAt,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Błąd odczytu panelu A/B' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin || 'https://szekspir.vercel.app';
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || '');

    if (action === 'update_config') {
      const testId = String(body.testId || '');
      const allocation = body.allocation as AbTrafficAllocation | undefined;
      const status = body.status as 'active' | 'paused' | 'completed' | undefined;
      const summaries = await updateAbTestConfig({
        testId,
        allocation,
        status,
        name: typeof body.name === 'string' ? body.name : undefined,
        entryUrl: typeof body.entryUrl === 'string' ? body.entryUrl : undefined,
        variantALabel: typeof body.variantALabel === 'string' ? body.variantALabel : undefined,
        variantBLabel: typeof body.variantBLabel === 'string' ? body.variantBLabel : undefined,
        variantBUrl: typeof body.variantBUrl === 'string' ? body.variantBUrl : undefined,
      });
      return NextResponse.json({
        ok: true,
        summaries: summaries.map(s => ({
          ...s,
          snippets: {
            headLiquid: buildShopifyHeadSnippet(s.experiment, origin),
            checkoutPixel: buildShopifyCheckoutPixelSnippet(s.experiment, origin),
          },
        })),
      });
    }

    if (action === 'reset_stats') {
      const testId = String(body.testId || '');
      const summaries = await resetAbTestStats(testId);
      return NextResponse.json({
        ok: true,
        summaries: summaries.map(s => ({
          ...s,
          snippets: {
            headLiquid: buildShopifyHeadSnippet(s.experiment, origin),
            checkoutPixel: buildShopifyCheckoutPixelSnippet(s.experiment, origin),
          },
        })),
      });
    }

    if (action === 'create_test') {
      const summaries = await createCustomAbTest({
        brandKey: (body.brandKey as AbTestExperiment['brandKey']) || 'custom',
        brandLabel: String(body.brandLabel || '🧪 Custom Test'),
        storeDomain: String(body.storeDomain || 'orthomax.pl'),
        name: String(body.name || 'Nowy Test A/B 50/50'),
        description: typeof body.description === 'string' ? body.description : undefined,
        entryUrl: String(body.entryUrl || 'https://orthomax.pl/products/orthomax-stepmax'),
        variantALabel: typeof body.variantALabel === 'string' ? body.variantALabel : undefined,
        variantBLabel: typeof body.variantBLabel === 'string' ? body.variantBLabel : undefined,
        variantBUrl: typeof body.variantBUrl === 'string' ? body.variantBUrl : undefined,
      });
      return NextResponse.json({
        ok: true,
        summaries: summaries.map(s => ({
          ...s,
          snippets: {
            headLiquid: buildShopifyHeadSnippet(s.experiment, origin),
            checkoutPixel: buildShopifyCheckoutPixelSnippet(s.experiment, origin),
          },
        })),
      });
    }

    if (action === 'simulate_ping') {
      const testId = String(body.testId || 'orthomax-noom-v1');
      const variant: AbVariantKey = String(body.variant || 'B').toUpperCase() === 'A' ? 'A' : 'B';
      const rawEv = String(body.event || 'view').toLowerCase();
      const event = rawEv === 'atc' || rawEv === 'ic' || rawEv === 'purchase' ? rawEv : 'view';
      const vid = `test_${variant}_${Date.now().toString(36)}`;
      await recordAbTestEvent({
        testId,
        variant,
        event,
        visitorId: vid,
        orderId: event === 'purchase' ? `TEST-${Date.now().toString().slice(-5)}` : undefined,
        orderNumber: event === 'purchase' ? `#TEST-${Date.now().toString().slice(-4)}` : undefined,
        revenuePln: event === 'purchase' ? Number(body.revenuePln || 129.99) : undefined,
        itemsSummary: event === 'purchase' ? '1x Pakiet 1+1 GRATIS (Ping Testowy)' : undefined,
        source: 'test_ping',
      });
      const state = await getAbTestDashboardState();
      return NextResponse.json({
        ok: true,
        summaries: state.summaries.map(s => ({
          ...s,
          snippets: {
            headLiquid: buildShopifyHeadSnippet(s.experiment, origin),
            checkoutPixel: buildShopifyCheckoutPixelSnippet(s.experiment, origin),
          },
        })),
      });
    }

    return NextResponse.json({ ok: false, error: `Nieznana akcja: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Błąd zapisu A/B testu' },
      { status: 500 },
    );
  }
}
