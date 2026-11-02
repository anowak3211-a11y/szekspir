import { inOwnerWorkspace } from './account-context';
import { mutate, readState } from './store';

export const AB_TEST_STATE_KEY = 'szekspir-ab-test-lander-v2';

export type AbVariantKey = 'A' | 'B';
export type AbTrafficAllocation = '50_50' | '100_A' | '100_B' | 'paused';
export type AbSplitMode = 'in_page_dom' | 'url_redirect';

export interface AbVariantStatsRaw {
  label: string;
  subtitle: string;
  targetUrlOrSelector: string;
  pageviews: number;
  uniqueViews: number;
  atcCount: number;
  uniqueAtc: number;
  icCount: number;
  uniqueIc: number;
  orders: number;
  revenuePln: number;
  lastEventAt?: number;
}

export interface AbOrderLogItem {
  orderId: string;
  orderNumber: string;
  variant: AbVariantKey;
  revenuePln: number;
  currency: string;
  itemsSummary: string;
  source: 'checkout_pixel' | 'shopify_webhook' | 'manual_sync' | 'test_ping';
  createdAt: number;
}

export interface AbTestExperiment {
  id: string;
  brandKey: 'orthomax' | 'feliora-pies' | 'feliora' | 'sardian-szampon' | 'stryde' | 'custom';
  brandLabel: string;
  storeDomain: string;
  name: string;
  description: string;
  entryUrl: string;
  splitMode: AbSplitMode;
  allocation: AbTrafficAllocation;
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  updatedAt: number;
  variants: {
    A: AbVariantStatsRaw;
    B: AbVariantStatsRaw;
  };
  seenVisitors: {
    viewA: string[];
    viewB: string[];
    atcA: string[];
    atcB: string[];
    icA: string[];
    icB: string[];
    orderIds: string[];
  };
  recentOrders: AbOrderLogItem[];
}

export interface AbVariantComputedMetrics extends AbVariantStatsRaw {
  atcRatePct: number;
  icRatePct: number;
  crPct: number;
  aovPln: number;
  rpvPln: number;
}

export interface AbTestComputedSummary {
  experiment: AbTestExperiment;
  metrics: {
    A: AbVariantComputedMetrics;
    B: AbVariantComputedMetrics;
  };
  comparison: {
    totalUniqueViews: number;
    totalOrders: number;
    totalRevenuePln: number;
    leaderVariant: 'A' | 'B' | 'tie' | 'insufficient_data';
    rpvDeltaPct: number;
    crDeltaPct: number;
    atcDeltaPct: number;
    confidencePct: number;
    statusText: string;
  };
}

export interface AbTestStoreState {
  experiments: AbTestExperiment[];
  updatedAt: number;
}

function emptyVariant(label: string, subtitle: string, targetUrlOrSelector: string): AbVariantStatsRaw {
  return {
    label,
    subtitle,
    targetUrlOrSelector,
    pageviews: 0,
    uniqueViews: 0,
    atcCount: 0,
    uniqueAtc: 0,
    icCount: 0,
    uniqueIc: 0,
    orders: 0,
    revenuePln: 0,
  };
}

export const DEFAULT_AB_EXPERIMENTS: AbTestExperiment[] = [
  {
    id: 'orthomax-noom-v1',
    brandKey: 'orthomax',
    brandLabel: '🦶 ORTHOMAX PL · StepMax',
    storeDomain: 'orthomax.pl',
    name: 'Standard PDP vs Noom Story-PDP („Historia Krystyny · ciąg dalszy”)',
    description:
      'Test 50/50 dla długich Antków (LFS): Wariant A (Standardowy PDP na orthomax.pl) vs Wariant B (Noom Story-PDP „Historia Krystyny, 62 lata, Wrocław · ciąg dalszy” z koszykiem 1+1 GRATIS i przekierowaniem prosto do kasy orthomax.pl).',
    entryUrl: 'https://szekspir.vercel.app/pages/orthomax-ab',
    splitMode: 'url_redirect',
    allocation: '50_50',
    status: 'active',
    createdAt: Date.parse('2026-11-02T16:30:00+01:00'),
    updatedAt: Date.parse('2026-11-02T17:50:00+01:00'),
    variants: {
      A: emptyVariant(
        'Wariant A · Standard PDP (Control)',
        'Czysty Product Page z Kaching Bundles (1 para / 1+1 GRATIS / 2+2 GRATIS)',
        'https://orthomax.pl/products/orthomax-stepmax?ab=A',
      ),
      B: emptyVariant(
        'Wariant B · Noom Story-PDP („Historia Krystyny · ciąg dalszy”)',
        'Pełna strona „Historia Krystyny, 62 lata, Wrocław · ciąg dalszy + Kartka od lekarza + Dziennik 6 tyg.” + Buybox 1+1 GRATIS',
        'https://szekspir.vercel.app/pages/kp-krystyna-1',
      ),
    },
    seenVisitors: {
      viewA: [],
      viewB: [],
      atcA: [],
      atcB: [],
      icA: [],
      icB: [],
      orderIds: [],
    },
    recentOrders: [],
  },
  {
    id: 'orthomax-sport-noom-v1',
    brandKey: 'orthomax',
    brandLabel: '⛰️ ORTHOMAX SPORT · StepMax Pro',
    storeDomain: 'orthomax.pl',
    name: 'Sport PDP (StepMax Pro) vs Sport Story-PDP („Ciąg dalszy ze szlaku/kortu”)',
    description:
      'Test 50/50 na kampanii ANTKI SPORT CC40 (#82-#101): czysty Sportowy PDP vs hybrydowy Story-PDP z podsumowaniem testu 2 mm fabrycznej wkładki i przeciążeń 3-4x.',
    entryUrl: 'https://orthomax.pl/products/orthomax-stepmax-pro',
    splitMode: 'in_page_dom',
    allocation: '50_50',
    status: 'active',
    createdAt: Date.parse('2026-11-02T16:35:00+01:00'),
    updatedAt: Date.parse('2026-11-02T16:35:00+01:00'),
    variants: {
      A: emptyVariant(
        'Wariant A · Sport PDP (Control)',
        'Obecny szablon sport-active na /products/orthomax-stepmax-pro',
        'https://orthomax.pl/products/orthomax-stepmax-pro',
      ),
      B: emptyVariant(
        'Wariant B · Sport Noom Story-PDP',
        'Sekcja „Ciąg dalszy historii + Test fabrycznej wkładki 2 mm vs StepMax” + Buybox',
        'https://orthomax.pl/products/orthomax-stepmax-pro?ab=B',
      ),
    },
    seenVisitors: {
      viewA: [],
      viewB: [],
      atcA: [],
      atcB: [],
      icA: [],
      icB: [],
      orderIds: [],
    },
    recentOrders: [],
  },
  {
    id: 'feliora-pies-noom-v1',
    brandKey: 'feliora-pies',
    brandLabel: '🐶 FELIORA PL · Psy',
    storeDomain: 'feliora.pl',
    name: 'Standard PDP vs Noom Story-PDP („Ciąg dalszy + Mechanizm ciała migdałowatego”)',
    description:
      'Test 50/50 dla Antków psich: klasyczna karta produktu Feliora vs hybrydowy Story-PDP wyjaśniający dlaczego gryzaki, klatka i tabletki usypiają tylko mięśnie, a feromon D.A.P. wyłącza alarm w mózgu.',
    entryUrl: 'https://feliora.pl/products/uspokajajacy-dyfuzor-feromonowy-dla-psow-feliora',
    splitMode: 'in_page_dom',
    allocation: '50_50',
    status: 'active',
    createdAt: Date.parse('2026-11-02T16:40:00+01:00'),
    updatedAt: Date.parse('2026-11-02T16:40:00+01:00'),
    variants: {
      A: emptyVariant(
        'Wariant A · Standard PDP (Control)',
        'Standardowa karta dyfuzora dla psów Feliora',
        'https://feliora.pl/products/uspokajajacy-dyfuzor-feromonowy-dla-psow-feliora',
      ),
      B: emptyVariant(
        'Wariant B · Noom Story-PDP („Ciąg dalszy”)',
        'Blok „Historia opiekunki · ciąg dalszy + Tabela: Tabletki/Obroże vs Feromon D.A.P. 24/7” + Buybox',
        'https://feliora.pl/products/uspokajajacy-dyfuzor-feromonowy-dla-psow-feliora?ab=B',
      ),
    },
    seenVisitors: {
      viewA: [],
      viewB: [],
      atcA: [],
      atcB: [],
      icA: [],
      icB: [],
      orderIds: [],
    },
    recentOrders: [],
  },
  {
    id: 'sardian-szampon-noom-v1',
    brandKey: 'sardian-szampon',
    brandLabel: '🦁 SARDIAN PL · Szampon',
    storeDomain: 'sardian.pl',
    name: 'Standard PDP vs Noom Story-PDP („Ciąg dalszy + Odblokowanie Fazy Wzrostu”)',
    description:
      'Test 50/50 dla Antków SARDIAN Szampon: standardowy PDP vs hybrydowy Story-PDP z podsumowaniem „Dlaczego wcierki za 300 zł i biotyna nie przebijają czopa łojowego i DHT”.',
    entryUrl: 'https://sardian.pl/products/szampon-przeciw-wypadaniu-wlosow-sardian',
    splitMode: 'in_page_dom',
    allocation: '50_50',
    status: 'active',
    createdAt: Date.parse('2026-11-02T16:45:00+01:00'),
    updatedAt: Date.parse('2026-11-02T16:45:00+01:00'),
    variants: {
      A: emptyVariant(
        'Wariant A · Standard PDP (Control)',
        'Standardowa karta produktu SARDIAN Szampon',
        'https://sardian.pl/products/szampon-przeciw-wypadaniu-wlosow-sardian',
      ),
      B: emptyVariant(
        'Wariant B · Noom Story-PDP („Ciąg dalszy”)',
        'Blok „Ciąg dalszy historii + Mechanizm 3-w-1 (Oczyszczenie mieszka + Blokada DHT + Stymulacja)” + Buybox',
        'https://sardian.pl/products/szampon-przeciw-wypadaniu-wlosow-sardian?ab=B',
      ),
    },
    seenVisitors: {
      viewA: [],
      viewB: [],
      atcA: [],
      atcB: [],
      icA: [],
      icB: [],
      orderIds: [],
    },
    recentOrders: [],
  },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Standard normal cumulative distribution approximation (Abramowitz & Stegun)
 * for 2-tailed Z-test confidence % between Variant A and Variant B.
 */
function normalCdf(z: number): number {
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp((-absZ * absZ) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

function calcConversionConfidencePct(viewsA: number, convA: number, viewsB: number, convB: number): number {
  if (viewsA < 15 || viewsB < 15 || convA + convB < 3) return 0;
  const pA = Math.min(0.999, Math.max(0.0001, convA / viewsA));
  const pB = Math.min(0.999, Math.max(0.0001, convB / viewsB));
  const pPool = (convA + convB) / (viewsA + viewsB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / viewsA + 1 / viewsB));
  if (!Number.isFinite(se) || se <= 0) return 0;
  const z = Math.abs(pB - pA) / se;
  const twoTailedConfidence = (2 * normalCdf(z) - 1) * 100;
  return round2(Math.min(99.9, Math.max(0, twoTailedConfidence)));
}

export function computeVariantMetrics(v: AbVariantStatsRaw): AbVariantComputedMetrics {
  const baseViews = Math.max(0, v.uniqueViews || v.pageviews || 0);
  const atcRatePct = baseViews > 0 ? round2((v.uniqueAtc / baseViews) * 100) : 0;
  const icRatePct = baseViews > 0 ? round2((v.uniqueIc / baseViews) * 100) : 0;
  const crPct = baseViews > 0 ? round2((v.orders / baseViews) * 100) : 0;
  const aovPln = v.orders > 0 ? round2(v.revenuePln / v.orders) : 0;
  const rpvPln = baseViews > 0 ? round2(v.revenuePln / baseViews) : 0;
  return {
    ...v,
    atcRatePct,
    icRatePct,
    crPct,
    aovPln,
    rpvPln,
  };
}

export function computeExperimentSummary(exp: AbTestExperiment): AbTestComputedSummary {
  const mA = computeVariantMetrics(exp.variants.A);
  const mB = computeVariantMetrics(exp.variants.B);
  const totalUniqueViews = mA.uniqueViews + mB.uniqueViews;
  const totalOrders = mA.orders + mB.orders;
  const totalRevenuePln = round2(mA.revenuePln + mB.revenuePln);

  const rpvDeltaPct =
    mA.rpvPln > 0
      ? round2(((mB.rpvPln - mA.rpvPln) / mA.rpvPln) * 100)
      : mB.rpvPln > 0
        ? 100
        : 0;
  const crDeltaPct =
    mA.crPct > 0
      ? round2(((mB.crPct - mA.crPct) / mA.crPct) * 100)
      : mB.crPct > 0
        ? 100
        : 0;
  const atcDeltaPct =
    mA.atcRatePct > 0
      ? round2(((mB.atcRatePct - mA.atcRatePct) / mA.atcRatePct) * 100)
      : mB.atcRatePct > 0
        ? 100
        : 0;

  // Use orders if >= 3 total orders, otherwise fallback to ATC confidence for early signal
  const confidencePct =
    totalOrders >= 3
      ? calcConversionConfidencePct(mA.uniqueViews, mA.orders, mB.uniqueViews, mB.orders)
      : calcConversionConfidencePct(mA.uniqueViews, mA.uniqueAtc, mB.uniqueViews, mB.uniqueAtc);

  let leaderVariant: 'A' | 'B' | 'tie' | 'insufficient_data' = 'insufficient_data';
  let statusText = 'Zbieranie danych (minimum 30 wejść na wariant do wczesnego sygnału)';

  if (totalUniqueViews >= 10 || totalOrders >= 1) {
    if (totalOrders >= 1) {
      if (mB.rpvPln > mA.rpvPln) {
        leaderVariant = 'B';
        statusText = `Wariant B prowadzi po RPV (${mB.rpvPln.toFixed(2)} zł vs ${mA.rpvPln.toFixed(2)} zł na wejście, ${rpvDeltaPct >= 0 ? '+' : ''}${rpvDeltaPct}%)`;
      } else if (mA.rpvPln > mB.rpvPln) {
        leaderVariant = 'A';
        statusText = `Wariant A prowadzi po RPV (${mA.rpvPln.toFixed(2)} zł vs ${mB.rpvPln.toFixed(2)} zł na wejście)`;
      } else {
        leaderVariant = 'tie';
        statusText = 'Remis po RPV — test trwa';
      }
    } else if (mA.uniqueAtc + mB.uniqueAtc >= 1) {
      if (mB.atcRatePct > mA.atcRatePct) {
        leaderVariant = 'B';
        statusText = `Wczesny sygnał ATC: Wariant B prowadzi (${mB.atcRatePct}% vs ${mA.atcRatePct}% dodania do koszyka)`;
      } else if (mA.atcRatePct > mB.atcRatePct) {
        leaderVariant = 'A';
        statusText = `Wczesny sygnał ATC: Wariant A prowadzi (${mA.atcRatePct}% vs ${mB.atcRatePct}% dodania do koszyka)`;
      } else {
        leaderVariant = 'tie';
        statusText = 'Równy współczynnik ATC — czekamy na pierwsze zamówienia';
      }
    }
  }

  return {
    experiment: exp,
    metrics: { A: mA, B: mB },
    comparison: {
      totalUniqueViews,
      totalOrders,
      totalRevenuePln,
      leaderVariant,
      rpvDeltaPct,
      crDeltaPct,
      atcDeltaPct,
      confidencePct,
      statusText,
    },
  };
}

function ensureDefaults(state: AbTestStoreState): AbTestStoreState {
  const existingMap = new Map<string, AbTestExperiment>();
  for (const exp of state.experiments || []) {
    existingMap.set(exp.id, exp);
  }
  const merged: AbTestExperiment[] = [];
  for (const def of DEFAULT_AB_EXPERIMENTS) {
    const found = existingMap.get(def.id);
    if (found) {
      merged.push({
        ...def,
        ...found,
        variants: {
          A: { ...def.variants.A, ...(found.variants?.A || {}) },
          B: { ...def.variants.B, ...(found.variants?.B || {}) },
        },
        seenVisitors: {
          viewA: Array.isArray(found.seenVisitors?.viewA) ? found.seenVisitors.viewA : [],
          viewB: Array.isArray(found.seenVisitors?.viewB) ? found.seenVisitors.viewB : [],
          atcA: Array.isArray(found.seenVisitors?.atcA) ? found.seenVisitors.atcA : [],
          atcB: Array.isArray(found.seenVisitors?.atcB) ? found.seenVisitors.atcB : [],
          icA: Array.isArray(found.seenVisitors?.icA) ? found.seenVisitors.icA : [],
          icB: Array.isArray(found.seenVisitors?.icB) ? found.seenVisitors.icB : [],
          orderIds: Array.isArray(found.seenVisitors?.orderIds) ? found.seenVisitors.orderIds : [],
        },
        recentOrders: Array.isArray(found.recentOrders) ? found.recentOrders : [],
      });
      existingMap.delete(def.id);
    } else {
      merged.push(structuredClone(def));
    }
  }
  for (const leftover of existingMap.values()) {
    merged.push(leftover);
  }
  return {
    experiments: merged,
    updatedAt: state.updatedAt || Date.now(),
  };
}

export async function getAbTestDashboardState(): Promise<{
  summaries: AbTestComputedSummary[];
  updatedAt: number;
}> {
  const raw = await inOwnerWorkspace(() =>
    readState<AbTestStoreState>(AB_TEST_STATE_KEY, {
      experiments: DEFAULT_AB_EXPERIMENTS,
      updatedAt: Date.now(),
    }),
  );
  const normalized = ensureDefaults(raw.value);
  return {
    summaries: normalized.experiments.map(computeExperimentSummary),
    updatedAt: normalized.updatedAt,
  };
}

function pushBounded(arr: string[], item: string, maxLen = 4000): boolean {
  if (arr.includes(item)) return false;
  arr.push(item);
  if (arr.length > maxLen) {
    arr.splice(0, arr.length - maxLen);
  }
  return true;
}

export interface TrackAbEventInput {
  testId?: string;
  storeDomain?: string;
  variant: AbVariantKey;
  event: 'view' | 'atc' | 'ic' | 'purchase';
  visitorId?: string;
  orderId?: string;
  orderNumber?: string;
  revenuePln?: number;
  currency?: string;
  itemsSummary?: string;
  source?: 'checkout_pixel' | 'shopify_webhook' | 'manual_sync' | 'test_ping';
}

export async function recordAbTestEvent(input: TrackAbEventInput): Promise<{
  ok: boolean;
  testId: string;
  variant: AbVariantKey;
  event: string;
  deduplicatedNew: boolean;
  allocation: AbTrafficAllocation;
}> {
  return inOwnerWorkspace(() =>
    mutate<AbTestStoreState, {
      ok: boolean;
      testId: string;
      variant: AbVariantKey;
      event: string;
      deduplicatedNew: boolean;
      allocation: AbTrafficAllocation;
    }>(
      AB_TEST_STATE_KEY,
      { experiments: DEFAULT_AB_EXPERIMENTS, updatedAt: Date.now() },
      state => {
        const normalized = ensureDefaults(state);
        state.experiments = normalized.experiments;

        let target = state.experiments.find(e => e.id === input.testId);
        if (!target && input.storeDomain) {
          const dom = input.storeDomain.toLowerCase().replace(/^www\./, '');
          target = state.experiments.find(e => e.storeDomain.toLowerCase() === dom && e.status === 'active');
        }
        if (!target) {
          target = state.experiments[0];
        }

        const variant: AbVariantKey = input.variant === 'B' ? 'B' : 'A';
        const vStats = target.variants[variant];
        const now = Date.now();
        vStats.lastEventAt = now;
        target.updatedAt = now;
        state.updatedAt = now;

        const visitorId = (input.visitorId || `anon_${now}_${Math.random().toString(36).slice(2, 7)}`).slice(0, 80);
        let deduplicatedNew = false;

        if (input.event === 'view') {
          vStats.pageviews += 1;
          const list = variant === 'A' ? target.seenVisitors.viewA : target.seenVisitors.viewB;
          if (pushBounded(list, visitorId)) {
            vStats.uniqueViews += 1;
            deduplicatedNew = true;
          }
        } else if (input.event === 'atc') {
          // Ensure visitor is also counted in uniqueViews if beacon order raced
          const viewList = variant === 'A' ? target.seenVisitors.viewA : target.seenVisitors.viewB;
          if (pushBounded(viewList, visitorId)) {
            vStats.uniqueViews += 1;
            vStats.pageviews += 1;
          }
          vStats.atcCount += 1;
          const atcList = variant === 'A' ? target.seenVisitors.atcA : target.seenVisitors.atcB;
          if (pushBounded(atcList, visitorId)) {
            vStats.uniqueAtc += 1;
            deduplicatedNew = true;
          }
        } else if (input.event === 'ic') {
          const viewList = variant === 'A' ? target.seenVisitors.viewA : target.seenVisitors.viewB;
          if (pushBounded(viewList, visitorId)) {
            vStats.uniqueViews += 1;
            vStats.pageviews += 1;
          }
          vStats.icCount += 1;
          const icList = variant === 'A' ? target.seenVisitors.icA : target.seenVisitors.icB;
          if (pushBounded(icList, visitorId)) {
            vStats.uniqueIc += 1;
            deduplicatedNew = true;
          }
        } else if (input.event === 'purchase') {
          const ordKey = String(input.orderId || input.orderNumber || `ord_${visitorId}_${now}`).trim();
          if (pushBounded(target.seenVisitors.orderIds, ordKey, 5000)) {
            const viewList = variant === 'A' ? target.seenVisitors.viewA : target.seenVisitors.viewB;
            if (pushBounded(viewList, visitorId)) {
              vStats.uniqueViews += 1;
              vStats.pageviews += 1;
            }
            const rev = Number.isFinite(Number(input.revenuePln)) ? Math.max(0, Number(input.revenuePln)) : 99.99;
            vStats.orders += 1;
            vStats.revenuePln = round2(vStats.revenuePln + rev);
            deduplicatedNew = true;

            target.recentOrders.unshift({
              orderId: ordKey,
              orderNumber: input.orderNumber || ordKey,
              variant,
              revenuePln: round2(rev),
              currency: input.currency || 'PLN',
              itemsSummary: input.itemsSummary || 'Zamówienie Shopify',
              source: input.source || 'checkout_pixel',
              createdAt: now,
            });
            if (target.recentOrders.length > 50) {
              target.recentOrders.length = 50;
            }
          }
        }

        return {
          ok: true,
          testId: target.id,
          variant,
          event: input.event,
          deduplicatedNew,
          allocation: target.allocation,
        };
      },
    ),
  );
}

export async function updateAbTestConfig(params: {
  testId: string;
  allocation?: AbTrafficAllocation;
  status?: 'active' | 'paused' | 'completed';
  name?: string;
  entryUrl?: string;
  variantALabel?: string;
  variantBLabel?: string;
  variantBUrl?: string;
}): Promise<AbTestComputedSummary[]> {
  return inOwnerWorkspace(() =>
    mutate<AbTestStoreState, AbTestComputedSummary[]>(
      AB_TEST_STATE_KEY,
      { experiments: DEFAULT_AB_EXPERIMENTS, updatedAt: Date.now() },
      state => {
        const normalized = ensureDefaults(state);
        state.experiments = normalized.experiments;
        const target = state.experiments.find(e => e.id === params.testId);
        if (!target) throw new Error(`Nie znaleziono testu A/B: ${params.testId}`);

        if (params.allocation) {
          target.allocation = params.allocation;
          target.status = params.allocation === 'paused' ? 'paused' : 'active';
        }
        if (params.status) target.status = params.status;
        if (params.name) target.name = params.name.trim();
        if (params.entryUrl) target.entryUrl = params.entryUrl.trim();
        if (params.variantALabel) target.variants.A.label = params.variantALabel.trim();
        if (params.variantBLabel) target.variants.B.label = params.variantBLabel.trim();
        if (params.variantBUrl) target.variants.B.targetUrlOrSelector = params.variantBUrl.trim();

        target.updatedAt = Date.now();
        state.updatedAt = Date.now();
        return state.experiments.map(computeExperimentSummary);
      },
    ),
  );
}

export async function resetAbTestStats(testId: string): Promise<AbTestComputedSummary[]> {
  return inOwnerWorkspace(() =>
    mutate<AbTestStoreState, AbTestComputedSummary[]>(
      AB_TEST_STATE_KEY,
      { experiments: DEFAULT_AB_EXPERIMENTS, updatedAt: Date.now() },
      state => {
        const normalized = ensureDefaults(state);
        state.experiments = normalized.experiments;
        const target = state.experiments.find(e => e.id === testId);
        if (!target) throw new Error(`Nie znaleziono testu A/B: ${testId}`);

        target.variants.A = emptyVariant(
          target.variants.A.label,
          target.variants.A.subtitle,
          target.variants.A.targetUrlOrSelector,
        );
        target.variants.B = emptyVariant(
          target.variants.B.label,
          target.variants.B.subtitle,
          target.variants.B.targetUrlOrSelector,
        );
        target.seenVisitors = {
          viewA: [],
          viewB: [],
          atcA: [],
          atcB: [],
          icA: [],
          icB: [],
          orderIds: [],
        };
        target.recentOrders = [];
        target.updatedAt = Date.now();
        state.updatedAt = Date.now();
        return state.experiments.map(computeExperimentSummary);
      },
    ),
  );
}

export async function createCustomAbTest(params: {
  brandKey: AbTestExperiment['brandKey'];
  brandLabel: string;
  storeDomain: string;
  name: string;
  description?: string;
  entryUrl: string;
  variantALabel?: string;
  variantBLabel?: string;
  variantBUrl?: string;
}): Promise<AbTestComputedSummary[]> {
  return inOwnerWorkspace(() =>
    mutate<AbTestStoreState, AbTestComputedSummary[]>(
      AB_TEST_STATE_KEY,
      { experiments: DEFAULT_AB_EXPERIMENTS, updatedAt: Date.now() },
      state => {
        const normalized = ensureDefaults(state);
        state.experiments = normalized.experiments;
        const slug = params.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 32);
        const id = `${params.brandKey}-${slug || 'test'}-${Date.now().toString(36).slice(-4)}`;
        const now = Date.now();
        const newExp: AbTestExperiment = {
          id,
          brandKey: params.brandKey,
          brandLabel: params.brandLabel || '🧪 Custom A/B Test',
          storeDomain: params.storeDomain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
          name: params.name.trim(),
          description:
            params.description?.trim() ||
            'Zero-Redirect 50/50 Split pomiędzy Wariantem A (Control) a Wariantem B (Challenger).',
          entryUrl: params.entryUrl.trim(),
          splitMode: 'in_page_dom',
          allocation: '50_50',
          status: 'active',
          createdAt: now,
          updatedAt: now,
          variants: {
            A: emptyVariant(
              params.variantALabel?.trim() || 'Wariant A · Standard PDP (Control)',
              'Wersja kontrolna (50% ruchu)',
              params.entryUrl.trim(),
            ),
            B: emptyVariant(
              params.variantBLabel?.trim() || 'Wariant B · Noom Story-PDP (Challenger)',
              'Wersja testowa (50% ruchu)',
              params.variantBUrl?.trim() || `${params.entryUrl.trim()}?ab=B`,
            ),
          },
          seenVisitors: {
            viewA: [],
            viewB: [],
            atcA: [],
            atcB: [],
            icA: [],
            icB: [],
            orderIds: [],
          },
          recentOrders: [],
        };
        state.experiments.unshift(newExp);
        state.updatedAt = now;
        return state.experiments.map(computeExperimentSummary);
      },
    ),
  );
}

/**
 * Generates the Zero-Redirect 50/50 Split snippet for Shopify `theme.liquid` (<head>)
 */
export function buildShopifyHeadSnippet(exp: AbTestExperiment, origin = 'https://szekspir.vercel.app'): string {
  const pathMatch = (() => {
    try {
      return new URL(exp.entryUrl).pathname;
    } catch {
      return '/products/';
    }
  })();

  return `<!-- 🧪 SZEKSPIR ZERO-REDIRECT 50/50 A/B TEST (${exp.id}) -->
<script>
(function() {
  var TEST_ID = ${JSON.stringify(exp.id)};
  var TARGET_PATH = ${JSON.stringify(pathMatch)};
  var ALLOCATION = ${JSON.stringify(exp.allocation)};
  var ENDPOINT = ${JSON.stringify(`${origin}/api/ab-test/track`)};

  if (ALLOCATION === 'paused') return;
  if (window.location.pathname.indexOf(TARGET_PATH) === -1) return;

  // 1. Stałe ID odwiedzającego + przypisanie wariantu A/B (sticky 30 dni)
  var vidKey = '_sz_ab_vid';
  var varKey = '_sz_ab_var_' + TEST_ID;
  var vid = localStorage.getItem(vidKey);
  if (!vid) {
    vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(vidKey, vid);
  }

  var urlParams = new URLSearchParams(window.location.search);
  var forced = urlParams.get('ab');
  var variant = (forced === 'A' || forced === 'B') ? forced : localStorage.getItem(varKey);

  if (ALLOCATION === '100_A') variant = 'A';
  else if (ALLOCATION === '100_B') variant = 'B';
  else if (variant !== 'A' && variant !== 'B') {
    variant = Math.random() < 0.5 ? 'A' : 'B';
  }

  localStorage.setItem(varKey, variant);
  localStorage.setItem('_sz_active_test', TEST_ID);
  localStorage.setItem('_sz_active_variant', variant);
  document.documentElement.setAttribute('data-ab-test', TEST_ID);
  document.documentElement.setAttribute('data-ab-variant', variant);

  // 2. Beacon do Szekspira (View / ATC / IC)
  function sendAbEvent(evName) {
    var payload = JSON.stringify({
      testId: TEST_ID,
      storeDomain: window.location.hostname,
      variant: variant,
      event: evName,
      visitorId: vid
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(ENDPOINT, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(function(){});
    }
  }

  sendAbEvent('view');

  // 3. Zapis _ab_variant i _ab_test w koszyku Shopify (cart.attributes -> order.note_attributes)
  function syncCartAttributes() {
    fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attributes: {
          _ab_test: TEST_ID,
          _ab_variant: variant,
          _ab_vid: vid
        }
      }),
      keepalive: true
    }).catch(function(){});
  }

  // 4. Przechwytywanie Dodania do koszyka (ATC) i Przejścia do kasy (IC)
  var origFetch = window.fetch;
  window.fetch = function() {
    var url = arguments[0] ? String(arguments[0].url || arguments[0]) : '';
    if (url.indexOf('/cart/add') !== -1) {
      sendAbEvent('atc');
      setTimeout(syncCartAttributes, 300);
    }
    return origFetch.apply(this, arguments);
  };

  document.addEventListener('click', function(e) {
    var btn = e.target && e.target.closest ? e.target.closest('button[name="add"], .product-form__submit, [name="checkout"], a[href*="/checkout"]') : null;
    if (!btn) return;
    if (btn.matches('[name="checkout"], a[href*="/checkout"]')) {
      sendAbEvent('ic');
      syncCartAttributes();
    } else {
      sendAbEvent('atc');
      setTimeout(syncCartAttributes, 300);
    }
  }, true);
})();
</script>
<style>
  /* Wariant A chowa bloki Noom Story-PDP, Wariant B pokazuje je nad/pod Buyboxem bez przeładowania URL */
  html[data-ab-variant="A"] .sz-ab-only-b { display: none !important; }
  html[data-ab-variant="B"] .sz-ab-only-a { display: none !important; }
</style>`;
}

/**
 * Generates the Shopify Customer Events (Custom Pixel) snippet for 100% accurate Purchase + Revenue PLN tracking
 */
export function buildShopifyCheckoutPixelSnippet(exp: AbTestExperiment, origin = 'https://szekspir.vercel.app'): string {
  return `// 🧪 SZEKSPIR A/B TEST PURCHASE PIXEL (Shopify Admin -> Settings -> Customer events -> Add custom pixel)
analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data?.checkout;
  if (!checkout) return;

  const attrs = {};
  if (Array.isArray(checkout.attributes)) {
    checkout.attributes.forEach((a) => {
      if (a && a.key) attrs[a.key] = a.value;
    });
  }

  const testId = attrs._ab_test || browser.localStorage.getItem('_sz_active_test') || ${JSON.stringify(exp.id)};
  const variant = attrs._ab_variant || browser.localStorage.getItem('_sz_active_variant') || '';
  const visitorId = attrs._ab_vid || browser.localStorage.getItem('_sz_ab_vid') || '';

  if (variant !== 'A' && variant !== 'B') return;

  const itemsSummary = Array.isArray(checkout.lineItems)
    ? checkout.lineItems.map((li) => (li.quantity || 1) + 'x ' + (li.title || 'Produkt')).join(', ')
    : 'Zamówienie Shopify';

  fetch(${JSON.stringify(`${origin}/api/ab-test/track`)}, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      testId: testId,
      storeDomain: event.context?.document?.location?.hostname || ${JSON.stringify(exp.storeDomain)},
      variant: variant,
      event: 'purchase',
      visitorId: visitorId,
      orderId: String(checkout.order?.id || checkout.token || Date.now()),
      orderNumber: String(checkout.order?.id || ''),
      revenuePln: Number(checkout.totalPrice?.amount || 0),
      currency: checkout.totalPrice?.currencyCode || 'PLN',
      itemsSummary: itemsSummary,
      source: 'checkout_pixel'
    })
  }).catch(() => {});
});`;
}
