'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ANTKI_NOOM_KRYSTYNA_COPY } from '@/lib/antki-noom-krystyna-copy';

const NOOM_ANTKI_ITEMS: Array<{
  id: string;
  number: number;
  fanpage: string;
  narrator: string;
  shortTitle: string;
  imageUrl: string;
}> = [
  {
    id: 'noom-102-krystyna-62-wroclaw-schody',
    number: 102,
    fanpage: 'Iwona Kożuchowska',
    narrator: 'Iwona, 62 lata, Wrocław',
    shortTitle: '3. piętro bez windy, poranna sztywność i kalejdoskop 5 lekarzy',
    imageUrl: '/antki-pl-images/zal-v2-01-skierowanie-szpital.jpg',
  },
  {
    id: 'noom-103-karol-64-endoproteza-kalejdoskop',
    number: 103,
    fanpage: 'Karol Mikołajczyk',
    narrator: 'Karol, 64 lata, Kraków',
    shortTitle: '4 lata, 5 gabinetów i wyrok endoprotezy za 35 000 zł',
    imageUrl: '/antki-pl-images/zal-v2-02-dwa-rtg-kolano-stopa.jpg',
  },
  {
    id: 'noom-104-corka-gosia-mama-62-wroclaw',
    number: 104,
    fanpage: 'Porady Mamy Gosi',
    narrator: 'Córka Małgorzata o 62-letniej mamie Krystynie',
    shortTitle: 'Mama przestała wychodzić z 3. piętra we Wrocławiu (3570 zł z emerytury)',
    imageUrl: '/antki-pl-images/zal-v2-03-pudelko-wstydu-2140zl.jpg',
  },
  {
    id: 'noom-105-fizjo-5-lekarzy-przed-endoproteza',
    number: 105,
    fanpage: 'Centrum Dobrego Kroku',
    narrator: 'Fizjoterapeuta Tomasz, 41 lat, Wrocław',
    shortTitle: 'Teczka od 4 lekarzy na biurku i test 10 sekund przed lustrem',
    imageUrl: '/antki-pl-images/zal-v2-05-skutek-vs-przyczyna-lustro.jpg',
  },
];

export type AbVariantKey = 'A' | 'B';
export type AbTrafficAllocation = '50_50' | '100_A' | '100_B' | 'paused';
export type AbSplitMode = 'in_page_dom' | 'url_redirect';

interface AbVariantComputedMetrics {
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
  atcRatePct: number;
  icRatePct: number;
  crPct: number;
  aovPln: number;
  rpvPln: number;
}

interface AbOrderLogItem {
  orderId: string;
  orderNumber: string;
  variant: AbVariantKey;
  revenuePln: number;
  currency: string;
  itemsSummary: string;
  source: string;
  createdAt: number;
}

interface AbTestExperiment {
  id: string;
  brandKey: 'orthomax' | 'feliora-pies' | 'feliora' | 'sardian-szampon' | 'custom';
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
  recentOrders: AbOrderLogItem[];
}

interface AbTestSummary {
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

interface AbTestSnippets {
  headScript: string;
  customPixelScript: string;
  webhookUrl: string;
}

export interface AbTestPanelProps {
  activeBrandFilter?: 'orthomax' | 'feliora-pies' | 'feliora' | 'sardian-szampon' | 'bennett-uk' | 'all';
  preferredBrandKey?: string;
  defaultExpanded?: boolean;
  standalone?: boolean;
}

const ALLOCATION_OPTIONS: Array<{ key: AbTrafficAllocation; label: string }> = [
  { key: 'paused', label: 'Wstrzymany (Draft)' },
  { key: '50_50', label: 'Split 50 / 50' },
  { key: '100_A', label: '100% Wariant A' },
  { key: '100_B', label: '100% Wariant B' },
];

export default function AbTestPanel({
  activeBrandFilter = 'all',
  preferredBrandKey,
  defaultExpanded = false,
  standalone = false,
}: AbTestPanelProps) {
  const effectiveBrand = preferredBrandKey || activeBrandFilter;
  const [expanded, setExpanded] = useState(defaultExpanded || standalone);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<AbTestSummary[]>([]);
  const [snippets, setSnippets] = useState<Record<string, AbTestSnippets>>({});
  const [selectedTestId, setSelectedTestId] = useState<string>('orthomax-noom-v1');
  const [selectedNoomAntekId, setSelectedNoomAntekId] = useState<string>('noom-102-krystyna-62-wroclaw-schody');
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'snippets' | 'manual_order' | 'new_test'>('none');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [manualVariant, setManualVariant] = useState<AbVariantKey>('B');
  const [manualOrderNumber, setManualOrderNumber] = useState('');
  const [manualRevenuePln, setManualRevenuePln] = useState('99.99');

  const [newName, setNewName] = useState('');
  const [newBrandKey, setNewBrandKey] = useState<AbTestExperiment['brandKey']>('orthomax');
  const [newEntryUrl, setNewEntryUrl] = useState('https://orthomax.pl/products/orthomax-stepmax');
  const [newVariantAUrl, setNewVariantAUrl] = useState('https://orthomax.pl/products/orthomax-stepmax?ab=A');
  const [newVariantBUrl, setNewVariantBUrl] = useState('https://szekspir.vercel.app/pages/kp-krystyna-1');

  const showNotice = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(prev => (prev === msg ? null : prev)), 3200);
  }, []);

  const fetchDashboard = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://szekspir.vercel.app';
      const res = await fetch(`/api/ab-test?origin=${encodeURIComponent(origin)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.summaries)) {
        const filtered = (data.summaries as AbTestSummary[]).filter(
          s => s.experiment.id !== 'sardian-opaska-noom-v1' && (s.experiment.brandKey as string) !== 'stryde',
        );
        setSummaries(filtered);
        if (data.snippets) setSnippets(data.snippets);
      }
    } catch {
      // silent
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (effectiveBrand === 'orthomax') setSelectedTestId('orthomax-noom-v1');
    else if (effectiveBrand === 'feliora-pies' || effectiveBrand === 'feliora')
      setSelectedTestId('feliora-pies-noom-v1');
    else if (effectiveBrand === 'sardian-szampon') setSelectedTestId('sardian-szampon-noom-v1');
  }, [effectiveBrand]);

  const activeSummary = useMemo(() => {
    return summaries.find(s => s.experiment.id === selectedTestId) || summaries[0] || null;
  }, [summaries, selectedTestId]);

  const activeSnippets = useMemo(() => {
    if (!activeSummary) return null;
    return snippets[activeSummary.experiment.id] || null;
  }, [activeSummary, snippets]);

  async function runAction(payload: Record<string, unknown>, okMessage: string) {
    setBusyAction(String(payload.action || 'busy'));
    try {
      const res = await fetch('/api/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.summaries)) {
        const filtered = (data.summaries as AbTestSummary[]).filter(
          s => s.experiment.id !== 'sardian-opaska-noom-v1' && (s.experiment.brandKey as string) !== 'stryde',
        );
        setSummaries(filtered);
        showNotice(okMessage);
      }
    } catch {
      showNotice('Błąd komunikacji z API');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSimulatePing(variant: AbVariantKey, withOrder: boolean) {
    if (!activeSummary) return;
    setBusyAction(`sim_${variant}`);
    try {
      const vid = `sim_${variant}_${Date.now().toString(36)}`;
      const expId = activeSummary.experiment.id;
      await fetch('/api/ab-test/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId: expId, variant, event: 'view', visitorId: vid }),
      });
      await fetch('/api/ab-test/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experimentId: expId, variant, event: 'atc', visitorId: vid }),
      });
      if (withOrder) {
        await fetch('/api/ab-test/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ experimentId: expId, variant, event: 'ic', visitorId: vid }),
        });
        await fetch('/api/ab-test/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experimentId: expId,
            variant,
            event: 'purchase',
            visitorId: vid,
            orderId: `TEST-${Date.now().toString().slice(-4)}`,
            orderNumber: `#TEST-${Date.now().toString().slice(-4)}`,
            revenuePln: 99.99,
            currency: 'PLN',
            itemsSummary: 'Pakiet 1+1 GRATIS (Symulacja)',
          }),
        });
      }
      await fetchDashboard(true);
      showNotice(`Zapisano zdarzenie testowe dla Wariantu ${variant}`);
    } finally {
      setBusyAction(null);
    }
  }

  function copyText(txt: string, label: string) {
    navigator.clipboard.writeText(txt);
    showNotice(`Skopiowano: ${label}`);
  }

  const exp = activeSummary?.experiment;
  const mA = activeSummary?.metrics.A;
  const mB = activeSummary?.metrics.B;
  const cmp = activeSummary?.comparison;

  const activeNoomMeta =
    NOOM_ANTKI_ITEMS.find(item => item.id === selectedNoomAntekId) || NOOM_ANTKI_ITEMS[0];
  const activeNoomCopy = ANTKI_NOOM_KRYSTYNA_COPY[activeNoomMeta.id];
  const activeNoomWordsCount = activeNoomCopy
    ? activeNoomCopy.primaryText.trim().split(/\s+/).length
    : 0;

  if (!expanded && !standalone) {
    const isPaused = !exp || exp.allocation === 'paused' || exp.status === 'paused';
    return (
      <div
        style={{
          marginBottom: 14,
          background: '#09090b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 10,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: isPaused ? '#a1a1aa' : '#34d399',
              background: isPaused ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${isPaused ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.3)'}`,
              padding: '3px 8px',
              borderRadius: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: isPaused ? '#71717a' : '#10b981',
              }}
            />
            {isPaused ? 'DRAFT · WSTRZYMANY' : 'SPLIT AKTYWNY'}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>
            Lander A/B Split + 4 Antki NOOM (#102–#105)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="/pages/kp-krystyna-1"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: '#e4e4e7',
              textDecoration: 'none',
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.12)',
              background: '#18181b',
              fontWeight: 500,
            }}
          >
            Wariant B (Krystyna) ↗
          </a>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              background: '#f4f4f5',
              color: '#09090b',
              border: 'none',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Rozwiń panel
          </button>
        </div>
      </div>
    );
  }

  const isPaused = !exp || exp.allocation === 'paused' || exp.status === 'paused';

  return (
    <div
      style={{
        marginBottom: 20,
        background: '#09090b',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        color: '#f4f4f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .ab-num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
        .ab-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .ab-btn {
          background: #18181b;
          color: #e4e4e7;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
        }
        .ab-btn:hover { background: #27272a; border-color: rgba(255,255,255,0.22); }
        .ab-main-split {
          display: grid;
          grid-template-columns: minmax(420px, 1.05fr) minmax(420px, 1fr);
          gap: 18px;
          align-items: start;
        }
        .ab-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .ab-url-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 1120px) {
          .ab-main-split { grid-template-columns: 1fr; }
        }
        @media (max-width: 780px) {
          .ab-grid-2, .ab-url-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* TOP HEADER BAR */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          background: '#0c0c0f',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: isPaused ? '#e4e4e7' : '#34d399',
              background: isPaused ? '#18181b' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${isPaused ? 'rgba(255,255,255,0.16)' : 'rgba(16, 185, 129, 0.3)'}`,
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: isPaused ? '#71717a' : '#10b981',
              }}
            />
            {isPaused
              ? 'DRAFT · WSTRZYMANY (ZERO WPŁYWU NA RUCH LIVE)'
              : exp?.allocation === '50_50'
              ? 'AKTYWNY · SPLIT 50/50'
              : exp?.allocation === '100_A'
              ? 'AKTYWNY · 100% WARIANT A'
              : 'AKTYWNY · 100% WARIANT B'}
          </span>

          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.01em' }}>
            Lander A/B Split + 4 Antki NOOM (#102–#105 · Krystyna 62 l.)
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <a
            href={`/antki-pl?brand=orthomax&batch=noom&angle=${activeNoomMeta.id}`}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#09090b',
              background: '#f4f4f5',
              padding: '6px 12px',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Otwórz #102–#105 w Edytorze Antków PL →
          </a>
          <button type="button" className="ab-btn" onClick={() => fetchDashboard()} disabled={loading}>
            {loading ? 'Odświeżanie...' : 'Odśwież'}
          </button>
          <button
            type="button"
            className="ab-btn"
            onClick={() => setActiveDrawer(d => (d === 'manual_order' ? 'none' : 'manual_order'))}
          >
            + Zamówienie
          </button>
          <button
            type="button"
            className="ab-btn"
            onClick={() => setActiveDrawer(d => (d === 'snippets' ? 'none' : 'snippets'))}
          >
            Kod Shopify
          </button>
          <button
            type="button"
            className="ab-btn"
            onClick={() => setActiveDrawer(d => (d === 'new_test' ? 'none' : 'new_test'))}
          >
            Nowy eksperyment
          </button>
          {!standalone && (
            <button type="button" className="ab-btn" onClick={() => setExpanded(false)}>
              Zwiń
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div
          style={{
            margin: '12px 20px 0',
            padding: '8px 12px',
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 6,
            fontSize: 12,
            color: '#f4f4f5',
          }}
        >
          {toast}
        </div>
      )}

      {/* MAIN 2-COLUMN WORKSPACE ABOVE THE FOLD:
          LEFT = 4 NOOM ANTKI (#102–#105)
          RIGHT = LANDER A/B SPLIT CONTROL & METRICS */}
      <div style={{ padding: 20 }}>
        <div className="ab-main-split">
          {/* LEFT COLUMN: 4 NOOM ANTKI (#102-#105) IMMEDIATELY VISIBLE */}
          <div
            style={{
              background: '#121215',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
                background: '#0c0c0f',
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f4f4f5' }}>
                  4 Gotowe Antki NOOM (#102–#105 · Batch 6 · 02.11)
                </div>
                <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 2 }}>
                  Kąt: „Historia Krystyny 62 l. / Kalejdoskop 5 specjalistów” · LP:{' '}
                  <code style={{ color: '#f4f4f5' }}>/pages/kp-krystyna-1</code>
                </div>
              </div>
              <a
                href={`/antki-pl?brand=orthomax&batch=noom&angle=${activeNoomMeta.id}`}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#e4e4e7',
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.14)',
                  padding: '5px 10px',
                  borderRadius: 6,
                  textDecoration: 'none',
                }}
              >
                Edytuj w /antki-pl →
              </a>
            </div>

            {/* 4 CARDS FOR #102 - #105 */}
            <div
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 8,
              }}
            >
              {NOOM_ANTKI_ITEMS.map(item => {
                const isSelected = item.id === activeNoomMeta.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedNoomAntekId(item.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: isSelected
                        ? '1px solid #f4f4f5'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? '#27272a' : '#09090b',
                      color: '#f4f4f5',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={`NOOM #${item.number}`}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 6,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 3,
                        }}
                      >
                        <span
                          className="ab-mono"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isSelected ? '#f4f4f5' : '#a1a1aa',
                          }}
                        >
                          ANTEK #{item.number}
                        </span>
                        <span style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 500 }}>
                          {item.fanpage}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#f4f4f5', lineHeight: 1.25 }}>
                        {item.narrator}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#a1a1aa', marginTop: 2, lineHeight: 1.25 }}>
                        {item.shortTitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE NOOM ANTEK FULL TEXT & COPY ACTIONS */}
            {activeNoomCopy && (
              <div style={{ padding: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                    Wybrano: <strong style={{ color: '#f4f4f5' }}>#{activeNoomMeta.number}</strong> · Fanpage:{' '}
                    <strong style={{ color: '#f4f4f5' }}>{activeNoomMeta.fanpage}</strong> ·{' '}
                    <span className="ab-mono" style={{ color: '#e4e4e7' }}>
                      {activeNoomWordsCount} słów
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="ab-btn"
                      onClick={() => copyText(activeNoomCopy.headline, `Headline #${activeNoomMeta.number}`)}
                    >
                      Kopiuj Headline
                    </button>
                    <button
                      type="button"
                      className="ab-btn"
                      style={{ background: '#f4f4f5', color: '#09090b', fontWeight: 600 }}
                      onClick={() => copyText(activeNoomCopy.primaryText, `Primary Text #${activeNoomMeta.number}`)}
                    >
                      Kopiuj cały tekst (#{activeNoomMeta.number})
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr',
                    gap: 10,
                    alignItems: 'center',
                    padding: '8px 11px',
                    borderRadius: 6,
                    background: '#09090b',
                    border: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: 8,
                  }}
                >
                  <img
                    src={activeNoomMeta.imageUrl}
                    alt={`Kreacja 1:1 #${activeNoomMeta.number}`}
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: 6,
                      objectFit: 'cover',
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'block',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 10.5, color: '#71717a', fontWeight: 600, marginBottom: 4 }}>
                      DEDYKOWANE ZDJĘCIE 1:1 + HEADLINE (#{activeNoomMeta.number}):
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#f4f4f5', lineHeight: 1.4 }}>
                      {activeNoomCopy.headline}
                    </div>
                  </div>
                </div>

                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 6,
                    background: '#09090b',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e4e4e7',
                    fontSize: 12,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 420,
                    overflowY: 'auto',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                  }}
                >
                  {activeNoomCopy.primaryText}
                </pre>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: LANDER A/B SPLIT CONFIGURATION & METRICS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* BRAND SELECTOR + TRAFFIC ALLOCATION */}
            <div
              style={{
                background: '#121215',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>Wybierz eksperyment:</span>
                <div
                  style={{
                    display: 'inline-flex',
                    background: '#09090b',
                    padding: 3,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  {summaries.map(item => {
                    const active = item.experiment.id === exp?.id;
                    const cleanLabel = item.experiment.brandLabel
                      .replace(/^[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+/, '')
                      .trim();
                    return (
                      <button
                        key={item.experiment.id}
                        type="button"
                        onClick={() => setSelectedTestId(item.experiment.id)}
                        style={{
                          background: active ? '#27272a' : 'transparent',
                          color: active ? '#f4f4f5' : '#a1a1aa',
                          border: 'none',
                          borderRadius: 6,
                          padding: '5px 10px',
                          fontSize: 11.5,
                          fontWeight: active ? 600 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {cleanLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {exp && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    flexWrap: 'wrap',
                    paddingTop: 10,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>
                    Alokacja ruchu (domyślnie Draft):
                  </span>
                  <div
                    style={{
                      display: 'inline-flex',
                      background: '#09090b',
                      padding: 3,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.08)',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    {ALLOCATION_OPTIONS.map(opt => {
                      const active = exp.allocation === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={busyAction !== null}
                          onClick={() =>
                            runAction(
                              {
                                action: 'update_config',
                                testId: exp.id,
                                allocation: opt.key,
                                status: opt.key === 'paused' ? 'paused' : 'active',
                              },
                              `Tryb testu zmieniony na: ${opt.label}`,
                            )
                          }
                          style={{
                            background: active ? (opt.key === 'paused' ? '#27272a' : '#f4f4f5') : 'transparent',
                            color: active ? (opt.key === 'paused' ? '#f4f4f5' : '#09090b') : '#a1a1aa',
                            border: 'none',
                            borderRadius: 6,
                            padding: '5px 10px',
                            fontSize: 11.5,
                            fontWeight: active ? 600 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3 DIRECT LINKS BAR */}
            {exp && mA && mB && (
              <div className="ab-url-grid">
                {[
                  {
                    tag: 'WARIANT A · CONTROL',
                    title: 'Standardowy PDP',
                    url: mA.targetUrlOrSelector,
                  },
                  {
                    tag: 'WARIANT B · CHALLENGER',
                    title: 'Story-PDP (Krystyna 62 l.)',
                    url: mB.targetUrlOrSelector,
                  },
                  {
                    tag: 'ROUTER 50/50',
                    title: 'Link dzielący ruch',
                    url: exp.entryUrl,
                  },
                ].map(linkItem => (
                  <div
                    key={linkItem.tag}
                    style={{
                      background: '#121215',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          color: '#71717a',
                          marginBottom: 2,
                        }}
                      >
                        {linkItem.tag}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#f4f4f5', marginBottom: 3 }}>
                        {linkItem.title}
                      </div>
                      <div
                        className="ab-mono"
                        style={{
                          fontSize: 10.5,
                          color: '#a1a1aa',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={linkItem.url}
                      >
                        {linkItem.url}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={linkItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          background: '#18181b',
                          color: '#f4f4f5',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 6,
                          padding: '5px 8px',
                          fontSize: 11,
                          fontWeight: 500,
                          textDecoration: 'none',
                        }}
                      >
                        Otwórz ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText(linkItem.url, linkItem.title)}
                        style={{
                          background: 'transparent',
                          color: '#a1a1aa',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6,
                          padding: '5px 8px',
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Kopiuj
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SIDE-BY-SIDE VARIANT CARDS */}
            {exp && mA && mB && cmp && (
              <>
                <div className="ab-grid-2">
                  {(['A', 'B'] as const).map(vKey => {
                    const m = vKey === 'A' ? mA : mB;
                    const isLeader = cmp.leaderVariant === vKey;
                    return (
                      <div
                        key={vKey}
                        style={{
                          background: '#121215',
                          border: isLeader
                            ? '1px solid rgba(16, 185, 129, 0.45)'
                            : '1px solid rgba(255, 255, 255, 0.09)',
                          borderRadius: 10,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              className="ab-mono"
                              style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: '#18181b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#e4e4e7',
                              }}
                            >
                              WARIANT {vKey}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>
                              {vKey === 'A' ? 'Standard PDP' : 'Story-PDP (Krystyna)'}
                            </span>
                          </div>
                          {isLeader && (
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                color: '#34d399',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '2px 6px',
                                borderRadius: 4,
                              }}
                            >
                              Lider RPV
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr 1fr',
                            gap: 8,
                            padding: '10px 0',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            marginBottom: 10,
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 10.5, color: '#71717a', marginBottom: 2 }}>RPV (zł/wejście)</div>
                            <div className="ab-num ab-mono" style={{ fontSize: 20, fontWeight: 600, color: '#f4f4f5' }}>
                              {m.rpvPln.toFixed(2)} <span style={{ fontSize: 11, color: '#71717a' }}>PLN</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10.5, color: '#71717a', marginBottom: 2 }}>Przychód</div>
                            <div className="ab-num ab-mono" style={{ fontSize: 15, fontWeight: 600, color: '#e4e4e7', marginTop: 3 }}>
                              {m.revenuePln.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10.5, color: '#71717a', marginBottom: 2 }}>AOV</div>
                            <div className="ab-num ab-mono" style={{ fontSize: 15, fontWeight: 600, color: '#e4e4e7', marginTop: 3 }}>
                              {m.aovPln.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                          {[
                            { label: 'Wizyty', val: String(m.uniqueViews), sub: `${m.pageviews} odsł.` },
                            { label: 'ATC%', val: `${m.atcRatePct.toFixed(1)}%`, sub: `${m.uniqueAtc} os.` },
                            { label: 'IC%', val: `${m.icRatePct.toFixed(1)}%`, sub: `${m.uniqueIc} os.` },
                            { label: 'CR%', val: `${m.crPct.toFixed(2)}%`, sub: `${m.orders} zam.` },
                          ].map(cell => (
                            <div
                              key={cell.label}
                              style={{
                                background: '#09090b',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 6,
                                padding: '8px',
                              }}
                            >
                              <div style={{ fontSize: 10, color: '#71717a', marginBottom: 2 }}>{cell.label}</div>
                              <div className="ab-num ab-mono" style={{ fontSize: 14, fontWeight: 600 }}>
                                {cell.val}
                              </div>
                              <div className="ab-num" style={{ fontSize: 10, color: '#52525b', marginTop: 1 }}>
                                {cell.sub}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* STATISTICAL FOOTER */}
                <div
                  style={{
                    background: '#121215',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontSize: 11.5, color: '#a1a1aa' }}>
                    {cmp.statusText} · Confidence: <strong style={{ color: '#f4f4f5' }}>{cmp.confidencePct.toFixed(1)}%</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="ab-btn"
                      disabled={busyAction !== null}
                      onClick={() => handleSimulatePing('A', false)}
                    >
                      Ping A
                    </button>
                    <button
                      type="button"
                      className="ab-btn"
                      disabled={busyAction !== null}
                      onClick={() => handleSimulatePing('B', true)}
                    >
                      Ping B
                    </button>
                    <button
                      type="button"
                      className="ab-btn"
                      disabled={busyAction !== null}
                      onClick={() => {
                        if (window.confirm(`Wyzerować liczniki eksperymentu "${exp.name}"?`)) {
                          runAction({ action: 'reset_stats', testId: exp.id }, 'Liczniki wyzerowane');
                        }
                      }}
                    >
                      Resetuj
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* DRAWER: MANUAL ORDER */}
        {exp && activeDrawer === 'manual_order' && (
          <div
            style={{
              marginTop: 14,
              background: '#121215',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>Wariant</label>
              <select
                value={manualVariant}
                onChange={e => setManualVariant(e.target.value as AbVariantKey)}
                style={{
                  background: '#09090b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12,
                }}
              >
                <option value="A">Wariant A (Control)</option>
                <option value="B">Wariant B (Challenger)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>Nr zamówienia</label>
              <input
                type="text"
                value={manualOrderNumber}
                onChange={e => setManualOrderNumber(e.target.value)}
                placeholder="#1100605"
                style={{
                  background: '#09090b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>Kwota (PLN)</label>
              <input
                type="text"
                value={manualRevenuePln}
                onChange={e => setManualRevenuePln(e.target.value)}
                style={{
                  background: '#09090b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12,
                  width: 110,
                }}
              />
            </div>
            <button
              type="button"
              className="ab-btn"
              style={{ background: '#f4f4f5', color: '#09090b', fontWeight: 600 }}
              onClick={() => {
                const rev = Number(manualRevenuePln.replace(',', '.')) || 99.99;
                runAction(
                  {
                    action: 'record_manual_order',
                    testId: exp.id,
                    variant: manualVariant,
                    orderNumber: manualOrderNumber || `#M-${Date.now().toString().slice(-4)}`,
                    revenuePln: rev,
                  },
                  `Dodano zamówienie (${rev.toFixed(2)} PLN) do Wariantu ${manualVariant}`,
                );
                setManualOrderNumber('');
              }}
            >
              Zapisz zamówienie
            </button>
          </div>
        )}

        {/* DRAWER: SHOPIFY SNIPPETS */}
        {activeDrawer === 'snippets' && activeSnippets && (
          <div
            style={{
              marginTop: 14,
              background: '#121215',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Skrypt Shopify (theme.liquid) & Webhook URL</span>
              <button
                type="button"
                className="ab-btn"
                onClick={() => copyText(activeSnippets.headScript, 'Skrypt theme.liquid')}
              >
                Kopiuj skrypt
              </button>
            </div>
            <pre
              className="ab-mono"
              style={{
                background: '#09090b',
                padding: 12,
                borderRadius: 6,
                fontSize: 11,
                color: '#a1a1aa',
                overflowX: 'auto',
                maxHeight: 200,
                margin: 0,
              }}
            >
              {activeSnippets.headScript}
            </pre>
          </div>
        )}

        {/* DRAWER: NEW EXPERIMENT */}
        {activeDrawer === 'new_test' && (
          <div
            style={{
              marginTop: 14,
              background: '#121215',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>Nazwa</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Np. Test PDP vs Advertorial"
                style={{
                  width: '100%',
                  background: '#09090b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>Marka</label>
              <select
                value={newBrandKey}
                onChange={e => setNewBrandKey(e.target.value as AbTestExperiment['brandKey'])}
                style={{
                  width: '100%',
                  background: '#09090b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12,
                }}
              >
                <option value="orthomax">ORTHOMAX PL · StepMax</option>
                <option value="sardian-szampon">SARDIAN PL · Szampon</option>
                <option value="feliora-pies">FELIORA PL · Psy</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>URL Wariant A</label>
              <input
                type="text"
                value={newVariantAUrl}
                onChange={e => setNewVariantAUrl(e.target.value)}
                style={{
                  width: '100%',
                  background: '#09090b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>URL Wariant B</label>
              <input
                type="text"
                value={newVariantBUrl}
                onChange={e => setNewVariantBUrl(e.target.value)}
                style={{
                  width: '100%',
                  background: '#09090b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12,
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="ab-btn"
                style={{ background: '#f4f4f5', color: '#09090b', fontWeight: 600, width: '100%' }}
                onClick={() => {
                  if (!newName.trim()) return;
                  runAction(
                    {
                      action: 'create_experiment',
                      name: newName.trim(),
                      brandKey: newBrandKey,
                      entryUrl: newEntryUrl.trim(),
                      variantAUrl: newVariantAUrl.trim(),
                      variantBUrl: newVariantBUrl.trim(),
                      splitMode: 'url_redirect',
                    },
                    'Utworzono nowy eksperyment (jako Draft)',
                  );
                  setActiveDrawer('none');
                }}
              >
                Utwórz (jako Draft)
              </button>
            </div>
          </div>
        )}
      </div>

      {standalone && (
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#0c0c0f',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#71717a',
          }}
        >
          <span>Szekspir Experiment Engine</span>
          <Link href="/antki-pl" style={{ color: '#a1a1aa', textDecoration: 'none' }}>
            ← Wróć do biblioteki Antków
          </Link>
        </div>
      )}
    </div>
  );
}
