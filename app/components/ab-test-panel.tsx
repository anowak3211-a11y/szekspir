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
}> = [
  {
    id: 'noom-102-krystyna-62-wroclaw-schody',
    number: 102,
    fanpage: 'Iwona Kożuchowska',
    narrator: 'Iwona, 62 lata, Wrocław',
    shortTitle: '3. piętro bez windy, poranna sztywność i kalejdoskop 5 lekarzy',
  },
  {
    id: 'noom-103-karol-64-endoproteza-kalejdoskop',
    number: 103,
    fanpage: 'Karol Mikołajczyk',
    narrator: 'Karol, 64 lata, Kraków',
    shortTitle: '4 lata, 5 gabinetów i wyrok endoprotezy za 35 000 zł',
  },
  {
    id: 'noom-104-corka-gosia-mama-62-wroclaw',
    number: 104,
    fanpage: 'Porady Mamy Gosi',
    narrator: 'Córka Małgorzata o 62-letniej mamie Krystynie',
    shortTitle: 'Mama przestała wychodzić z 3. piętra we Wrocławiu (3570 zł z emerytury)',
  },
  {
    id: 'noom-105-fizjo-5-lekarzy-przed-endoproteza',
    number: 105,
    fanpage: 'Centrum Dobrego Kroku',
    narrator: 'Fizjoterapeuta Tomasz, 41 lat, Wrocław',
    shortTitle: 'Teczka od 4 lekarzy na biurku i test 10 sekund przed lustrem',
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
  activeBrandFilter?: 'orthomax' | 'feliora-pies' | 'feliora' | 'sardian-szampon' | 'stryde' | 'bennett-uk' | 'all';
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
        setSummaries(data.summaries);
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
    else if (effectiveBrand === 'stryde') setSelectedTestId('sardian-opaska-noom-v1');
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
        setSummaries(data.summaries);
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

  // Compact collapsed bar inside /antki-pl
  if (!expanded && !standalone) {
    const isPaused = !exp || exp.allocation === 'paused' || exp.status === 'paused';
    return (
      <div
        style={{
          marginBottom: 14,
          background: '#09090b',
          border: '1px solid rgba(255, 255, 255, 0.08)',
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
            Lander A/B Split Tester
          </span>
          <span style={{ fontSize: 12, color: '#71717a' }}>
            Wariant A (Standard PDP) vs Wariant B (Story-PDP „Historia Krystyny · ciąg dalszy”)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="https://orthomax.pl/products/orthomax-stepmax?ab=A"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: '#a1a1aa',
              textDecoration: 'none',
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#121215',
            }}
          >
            Wariant A ↗
          </a>
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
            Otwórz panel
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
        border: '1px solid rgba(255, 255, 255, 0.09)',
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
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
        }
        .ab-btn:hover { background: #27272a; border-color: rgba(255,255,255,0.18); }
        .ab-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .ab-url-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 860px) {
          .ab-grid-2, .ab-url-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* TOP BAR */}
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
              color: isPaused ? '#a1a1aa' : '#34d399',
              background: isPaused ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${isPaused ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.3)'}`,
              padding: '4px 9px',
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
              ? 'DRAFT · WSTRZYMANY (NIE DOTYKA RUCHU LIVE)'
              : exp?.allocation === '50_50'
              ? 'AKTYWNY · SPLIT 50/50'
              : exp?.allocation === '100_A'
              ? 'AKTYWNY · 100% WARIANT A'
              : 'AKTYWNY · 100% WARIANT B'}
          </span>

          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.01em' }}>
            Lander Split Experiments
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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

      {/* EXPERIMENT TABS + TRAFFIC ALLOCATION SEGMENTED CONTROL */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        {/* Experiment Tabs */}
        <div
          style={{
            display: ' inline-flex',
            background: '#121215',
            padding: 3,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.07)',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {summaries.map(item => {
            const active = item.experiment.id === exp?.id;
            const cleanLabel = item.experiment.brandLabel.replace(/^[^\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+/, '').trim();
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
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                {cleanLabel}
              </button>
            );
          })}
        </div>

        {/* Traffic Allocation Control */}
        {exp && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#71717a', fontWeight: 500 }}>Tryb ruchu:</span>
            <div
              style={{
                display: 'inline-flex',
                background: '#121215',
                padding: 3,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.07)',
                gap: 2,
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
                      fontSize: 12,
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

      {toast && (
        <div
          style={{
            margin: '12px 20px 0',
            padding: '8px 12px',
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 6,
            fontSize: 12,
            color: '#e4e4e7',
          }}
        >
          {toast}
        </div>
      )}

      {/* MAIN BODY */}
      {exp && mA && mB && cmp && (
        <div style={{ padding: 20 }}>
          {/* 3 DIRECT LINKS BAR */}
          <div className="ab-url-grid" style={{ marginBottom: 18 }}>
            {[
              {
                tag: 'WARIANT A · CONTROL',
                title: 'Standardowy PDP (Sklep)',
                url: mA.targetUrlOrSelector,
              },
              {
                tag: 'WARIANT B · CHALLENGER',
                title: 'Noom Story-PDP (Krystyna 62 l.)',
                url: mB.targetUrlOrSelector,
              },
              {
                tag: 'ROUTER 50/50 (DO REKLAMY)',
                title: 'Wspólny link dzielący ruch 50/50',
                url: exp.entryUrl,
              },
            ].map(linkItem => (
              <div
                key={linkItem.tag}
                style={{
                  background: '#121215',
                  border: '1px solid rgba(255,255,255,0.07)',
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
                      letterSpacing: '0.05em',
                      color: '#71717a',
                      marginBottom: 2,
                    }}
                  >
                    {linkItem.tag}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', marginBottom: 4 }}>
                    {linkItem.title}
                  </div>
                  <div
                    className="ab-mono"
                    style={{
                      fontSize: 11,
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
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      padding: '5px 8px',
                      fontSize: 11.5,
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Otwórz stronę ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => copyText(linkItem.url, linkItem.title)}
                    style={{
                      background: 'transparent',
                      color: '#a1a1aa',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6,
                      padding: '5px 10px',
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}
                  >
                    Kopiuj
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SIDE-BY-SIDE VARIANT CARDS */}
          <div className="ab-grid-2" style={{ marginBottom: 16 }}>
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
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: 18,
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          className="ab-mono"
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: '#18181b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#e4e4e7',
                          }}
                        >
                          WARIANT {vKey}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>
                          {vKey === 'A' ? 'Standard PDP (Control)' : 'Noom Story-PDP (Challenger)'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#71717a', marginTop: 3 }}>{m.subtitle}</div>
                    </div>

                    {isLeader && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '3px 8px',
                          borderRadius: 4,
                        }}
                      >
                        Lider RPV
                      </span>
                    )}
                  </div>

                  {/* Hero KPI Row: RPV + Revenue + AOV */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr',
                      gap: 12,
                      padding: '14px 0',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>
                        RPV (Przychód / Wizyta)
                      </div>
                      <div
                        className="ab-num ab-mono"
                        style={{ fontSize: 24, fontWeight: 600, color: '#f4f4f5' }}
                      >
                        {m.rpvPln.toFixed(2)} <span style={{ fontSize: 13, color: '#71717a' }}>PLN</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Przychód</div>
                      <div
                        className="ab-num ab-mono"
                        style={{ fontSize: 18, fontWeight: 600, color: '#e4e4e7', marginTop: 4 }}
                      >
                        {m.revenuePln.toFixed(2)} <span style={{ fontSize: 12, color: '#71717a' }}>PLN</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>AOV (Śr. koszyk)</div>
                      <div
                        className="ab-num ab-mono"
                        style={{ fontSize: 18, fontWeight: 600, color: '#e4e4e7', marginTop: 4 }}
                      >
                        {m.aovPln.toFixed(2)} <span style={{ fontSize: 12, color: '#71717a' }}>PLN</span>
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Funnel Metrics */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        background: '#09090b',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 6,
                        padding: '10px',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Wizyty (UV)</div>
                      <div className="ab-num ab-mono" style={{ fontSize: 16, fontWeight: 600 }}>
                        {m.uniqueViews}
                      </div>
                      <div className="ab-num" style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>
                        {m.pageviews} odsłon
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#09090b',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 6,
                        padding: '10px',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Koszyk (ATC)</div>
                      <div className="ab-num ab-mono" style={{ fontSize: 16, fontWeight: 600 }}>
                        {m.atcRatePct.toFixed(1)}%
                      </div>
                      <div className="ab-num" style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>
                        {m.uniqueAtc} os.
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#09090b',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 6,
                        padding: '10px',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Checkout (IC)</div>
                      <div className="ab-num ab-mono" style={{ fontSize: 16, fontWeight: 600 }}>
                        {m.icRatePct.toFixed(1)}%
                      </div>
                      <div className="ab-num" style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>
                        {m.uniqueIc} os.
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#09090b',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 6,
                        padding: '10px',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Zakupy (CR)</div>
                      <div className="ab-num ab-mono" style={{ fontSize: 16, fontWeight: 600 }}>
                        {m.crPct.toFixed(2)}%
                      </div>
                      <div className="ab-num" style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>
                        {m.orders} zam.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER STATISTICAL BAR */}
          <div
            style={{
              background: '#121215',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
              <span style={{ color: '#a1a1aa' }}>
                Status statystyczny: <strong style={{ color: '#f4f4f5' }}>{cmp.statusText}</strong>
              </span>
              <span className="ab-num" style={{ color: '#71717a' }}>
                Z-Test Confidence: <strong style={{ color: '#e4e4e7' }}>{cmp.confidencePct.toFixed(1)}%</strong> (próg: 95%)
              </span>
              <span className="ab-num" style={{ color: '#71717a' }}>
                Delta RPV:{' '}
                <strong style={{ color: cmp.rpvDeltaPct > 0 ? '#34d399' : '#e4e4e7' }}>
                  {cmp.rpvDeltaPct >= 0 ? '+' : ''}
                  {cmp.rpvDeltaPct}%
                </strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="ab-btn"
                disabled={busyAction !== null}
                onClick={() => handleSimulatePing('A', false)}
              >
                Ping testowy A
              </button>
              <button
                type="button"
                className="ab-btn"
                disabled={busyAction !== null}
                onClick={() => handleSimulatePing('B', true)}
              >
                Ping testowy B
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
                Resetuj liczniki
              </button>
            </div>
          </div>

          {/* 4 DEDICATED NOOM ANTKI (#102–#105) DIRECTLY EMBEDDED IN A/B TEST PANEL */}
          {(() => {
            const activeNoomMeta =
              NOOM_ANTKI_ITEMS.find(item => item.id === selectedNoomAntekId) || NOOM_ANTKI_ITEMS[0];
            const activeNoomCopy = ANTKI_NOOM_KRYSTYNA_COPY[activeNoomMeta.id];
            const wordsCount = activeNoomCopy
              ? activeNoomCopy.primaryText.trim().split(/\s+/).length
              : 0;
            return (
              <div
                style={{
                  marginTop: 18,
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
                    gap: 12,
                    flexWrap: 'wrap',
                    background: '#0c0c0f',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>
                      4 Antki NOOM pod ten A/B Test (#102–#105 · „Historia Krystyny / Kalejdoskop 5 Lekarzy”)
                    </div>
                    <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 2 }}>
                      Każdy Antek kończy się mostem do Wariantu B (<code>/pages/kp-krystyna-1</code>) lub Routera 50/50 (<code>/pages/orthomax-ab</code>)
                    </div>
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
                      Otwórz Batch #102–#105 w Fabryce Antków PL →
                    </a>
                  </div>
                </div>

                {/* 4 TABS FOR #102 - #105 */}
                <div
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                          padding: '9px 11px',
                          borderRadius: 7,
                          border: isSelected
                            ? '1px solid rgba(255,255,255,0.3)'
                            : '1px solid rgba(255,255,255,0.07)',
                          background: isSelected ? '#27272a' : '#09090b',
                          color: '#f4f4f5',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#34d399' : '#a1a1aa' }}>
                            #{item.number} · {item.fanpage}
                          </span>
                          <span style={{ fontSize: 10, color: '#71717a' }}>02.11</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f5', lineHeight: 1.3 }}>
                          {item.narrator}
                        </div>
                        <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2, lineHeight: 1.3 }}>
                          {item.shortTitle}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ACTIVE NOOM ANTEK COPY VIEWER */}
                {activeNoomCopy && (
                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        flexWrap: 'wrap',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                        Fanpage: <strong style={{ color: '#f4f4f5' }}>{activeNoomMeta.fanpage}</strong> · Narrator:{' '}
                        <strong style={{ color: '#f4f4f5' }}>{activeNoomMeta.narrator}</strong> · Długość:{' '}
                        <strong style={{ color: '#34d399' }}>{wordsCount} słów</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ab-btn"
                          onClick={() => copyText(activeNoomCopy.headline, `Nagłówek #${activeNoomMeta.number}`)}
                        >
                          Kopiuj Headline
                        </button>
                        <button
                          type="button"
                          className="ab-btn"
                          style={{ background: '#f4f4f5', color: '#09090b', fontWeight: 600 }}
                          onClick={() => copyText(activeNoomCopy.primaryText, `Primary Text #${activeNoomMeta.number}`)}
                        >
                          Kopiuj cały Primary Text (#{activeNoomMeta.number})
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '9px 12px',
                        borderRadius: 6,
                        background: '#09090b',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginBottom: 10,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#f4f4f5',
                      }}
                    >
                      <span style={{ color: '#71717a', fontWeight: 500, marginRight: 6 }}>Headline:</span>
                      {activeNoomCopy.headline}
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        padding: 14,
                        borderRadius: 6,
                        background: '#09090b',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#e4e4e7',
                        fontSize: 12.5,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: 360,
                        overflowY: 'auto',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                      }}
                    >
                      {activeNoomCopy.primaryText}
                    </pre>
                  </div>
                )}
              </div>
            );
          })()}

          {/* DRAWER: MANUAL ORDER */}
          {activeDrawer === 'manual_order' && (
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
                <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>
                  Wariant
                </label>
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
                <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>
                  Nr zamówienia
                </label>
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
                <label style={{ display: 'block', fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>
                  Kwota (PLN)
                </label>
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
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  Skrypt Shopify (theme.liquid) & Webhook URL
                </span>
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
                  <option value="orthomax">ORTHOMAX PL</option>
                  <option value="feliora-pies">FELIORA PL (Psy)</option>
                  <option value="sardian-szampon">SARDIAN PL</option>
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
                      'Utworzono nowy eksperyment',
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
      )}

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
