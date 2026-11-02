'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AbTestComputedSummary,
  AbTrafficAllocation,
  AbVariantKey,
} from '@/lib/ab-test-tracker';

type SummaryWithSnippets = AbTestComputedSummary & {
  snippets?: {
    headLiquid: string;
    checkoutPixel: string;
  };
};

interface AbTestPanelProps {
  defaultExpanded?: boolean;
  preferredBrandKey?: string;
  standalone?: boolean;
}

export default function AbTestPanel({
  defaultExpanded = false,
  preferredBrandKey,
  standalone = false,
}: AbTestPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || standalone);
  const [summaries, setSummaries] = useState<SummaryWithSnippets[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('orthomax-noom-v1');
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [showSnippets, setShowSnippets] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New test modal state
  const [newBrandKey, setNewBrandKey] = useState<'orthomax' | 'feliora-pies' | 'sardian-szampon' | 'custom'>('orthomax');
  const [newStoreDomain, setNewStoreDomain] = useState('orthomax.pl');
  const [newName, setNewName] = useState('');
  const [newEntryUrl, setNewEntryUrl] = useState('https://orthomax.pl/products/orthomax-stepmax');
  const [newVarALabel, setNewVarALabel] = useState('Wariant A · Standard PDP (Control)');
  const [newVarBLabel, setNewVarBLabel] = useState('Wariant B · Noom Story-PDP („Ciąg dalszy”)');

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/ab-test', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Nie udało się pobrać danych A/B testów');
      }
      setSummaries(data.summaries || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd połączenia z API A/B testów');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-select test matching active brand tab in Antki PL when switching tabs
  useEffect(() => {
    if (!preferredBrandKey || summaries.length === 0) return;
    const match = summaries.find(s => s.experiment.brandKey === preferredBrandKey);
    if (match) {
      setSelectedTestId(match.experiment.id);
    }
  }, [preferredBrandKey, summaries]);

  const activeSummary = useMemo(() => {
    return summaries.find(s => s.experiment.id === selectedTestId) || summaries[0] || null;
  }, [summaries, selectedTestId]);

  const runAction = async (payload: Record<string, unknown>, successMsg?: string) => {
    setBusyAction(String(payload.action || 'busy'));
    setNotice('');
    setError('');
    try {
      const res = await fetch('/api/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Błąd wykonania akcji');
      }
      if (Array.isArray(data.summaries)) {
        setSummaries(data.summaries);
      }
      if (successMsg) setNotice(successMsg);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd');
    } finally {
      setBusyAction(null);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`✅ Skopiowano: ${label}`);
      setTimeout(() => setNotice(''), 3500);
    } catch {
      setError('Nie udało się skopiować do schowka');
    }
  };

  const handleSimulateVisitor = async (variant: AbVariantKey, withPurchase: boolean) => {
    if (!activeSummary) return;
    const testId = activeSummary.experiment.id;
    setBusyAction(`sim_${variant}`);
    try {
      await fetch('/api/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_ping', testId, variant, event: 'view' }),
      });
      await fetch('/api/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_ping', testId, variant, event: 'atc' }),
      });
      if (withPurchase) {
        await fetch('/api/ab-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'simulate_ping',
            testId,
            variant,
            event: 'purchase',
            revenuePln: variant === 'B' ? 129.99 : 99.99,
          }),
        });
      }
      await fetchDashboard(true);
      setNotice(
        withPurchase
          ? `⚡ Wysłano testowe wejście + ATC + Zakup na Wariant ${variant}`
          : `⚡ Wysłano testowe wejście + ATC na Wariant ${variant}`,
      );
    } catch {
      setError('Błąd symulacji zdarzenia');
    } finally {
      setBusyAction(null);
    }
  };

  const totalAllViews = useMemo(
    () => summaries.reduce((acc, s) => acc + s.comparison.totalUniqueViews, 0),
    [summaries],
  );
  const totalAllOrders = useMemo(
    () => summaries.reduce((acc, s) => acc + s.comparison.totalOrders, 0),
    [summaries],
  );

  if (!expanded && !standalone) {
    return (
      <div
        style={{
          marginBottom: '12px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 27, 75, 0.94) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.45)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.28)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '11.5px',
              padding: '4px 9px',
              borderRadius: '7px',
              letterSpacing: '0.03em',
            }}
          >
            🧪 A/B TEST LANDERÓW 50/50
          </span>
          <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>
            {activeSummary ? activeSummary.experiment.name : 'Standard PDP vs Noom Story-PDP („Ciąg dalszy”)'}
          </span>
          {activeSummary && (
            <span
              style={{
                fontSize: '12px',
                color: '#a5b4fc',
                background: 'rgba(99, 102, 241, 0.14)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              A: {activeSummary.metrics.A.uniqueViews} wejść ({activeSummary.metrics.A.rpvPln.toFixed(2)} zł RPV) vs B:{' '}
              {activeSummary.metrics.B.uniqueViews} wejść ({activeSummary.metrics.B.rpvPln.toFixed(2)} zł RPV)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            Wszystkie testy: <strong style={{ color: '#f8fafc' }}>{totalAllViews}</strong> wejść ·{' '}
            <strong style={{ color: '#34d399' }}>{totalAllOrders}</strong> zamówień
          </span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            📊 Otwórz Panel A/B Testów ⌄
          </button>
        </div>
      </div>
    );
  }

  const exp = activeSummary?.experiment;
  const mA = activeSummary?.metrics.A;
  const mB = activeSummary?.metrics.B;
  const cmp = activeSummary?.comparison;

  return (
    <div
      style={{
        marginBottom: '16px',
        background: 'rgba(9, 13, 24, 0.97)',
        border: '1px solid rgba(99, 102, 241, 0.5)',
        borderRadius: '14px',
        padding: '18px',
        color: '#f8fafc',
        boxShadow: '0 10px 32px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '14px',
          marginBottom: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '7px',
              }}
            >
              🧪 ZERO-REDIRECT 50/50 A/B TESTER
            </span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              Panel A/B Testów Landerów (Standard PDP vs Noom Story-PDP „Ciąg dalszy”)
            </h2>
          </div>
          <p style={{ margin: '5px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
            1 wspólny URL w Meta Ads (zero rozbijania Learning Phase i social proofu) · Podział 50/50 w przeglądarce ·
            Śledzenie <strong style={{ color: '#e2e8f0' }}>Views → ATC% → IC% → Zamówienia → CR% → AOV → RPV (zł/wejście)</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => fetchDashboard()}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {loading ? '⏳ Odświeżanie...' : '🔄 Odśwież statystyki'}
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'rgba(16, 185, 129, 0.16)',
              color: '#6ee7b7',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            + Nowy Test A/B
          </button>
          <button
            type="button"
            onClick={() => setShowSnippets(v => !v)}
            style={{
              background: showSnippets
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'rgba(245, 158, 11, 0.16)',
              color: showSnippets ? '#fff' : '#fde68a',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            📋 Kod Shopify 50/50 ({showSnippets ? 'Ukryj' : 'Pokaż'})
          </button>
          {!standalone && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '7px 11px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Zwiń ⌃
            </button>
          )}
        </div>
      </div>

      {/* Experiment Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '7px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        {summaries.map(item => {
          const isSelected = item.experiment.id === activeSummary?.experiment.id;
          return (
            <button
              key={item.experiment.id}
              type="button"
              onClick={() => setSelectedTestId(item.experiment.id)}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'rgba(30, 41, 59, 0.75)',
                color: isSelected ? '#ffffff' : '#cbd5e1',
                border: isSelected
                  ? '1px solid rgba(255,255,255,0.35)'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9px',
                padding: '8px 13px',
                fontSize: '12.5px',
                fontWeight: isSelected ? 800 : 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isSelected ? '0 3px 12px rgba(79, 70, 229, 0.4)' : 'none',
              }}
            >
              <span>{item.experiment.brandLabel}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'rgba(0,0,0,0.3)',
                  color: item.comparison.totalOrders > 0 ? '#34d399' : '#cbd5e1',
                }}
              >
                {item.comparison.totalUniqueViews} wejść · {item.comparison.totalOrders} zam.
              </span>
            </button>
          );
        })}
      </div>

      {notice && (
        <div
          style={{
            marginBottom: '12px',
            padding: '9px 13px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.16)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            fontSize: '12.5px',
            fontWeight: 700,
          }}
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: '12px',
            padding: '9px 13px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '12.5px',
            fontWeight: 700,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {exp && mA && mB && cmp && (
        <>
          {/* Experiment Info & Traffic Allocation Controls */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '11px',
              padding: '13px 15px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{exp.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    fontFamily: 'monospace',
                  }}
                >
                  ID: {exp.id}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{exp.description}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
                🔗 Docelowy URL w Meta Ads:{' '}
                <a
                  href={exp.entryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'underline' }}
                >
                  {exp.entryUrl}
                </a>{' '}
                · Podgląd wymuszony:{' '}
                <a
                  href={`${exp.entryUrl}${exp.entryUrl.includes('?') ? '&' : '?'}ab=A`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#93c5fd', fontWeight: 700 }}
                >
                  [?ab=A]
                </a>{' '}
                /{' '}
                <a
                  href={`${exp.entryUrl}${exp.entryUrl.includes('?') ? '&' : '?'}ab=B`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#c4b5fd', fontWeight: 700 }}
                >
                  [?ab=B]
                </a>
              </div>
            </div>

            {/* Traffic Split Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                PODZIAŁ RUCHU NA SKLEPIE:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(
                  [
                    { key: '50_50', label: '⚖️ 50% A / 50% B' },
                    { key: '100_A', label: '🅰️ 100% Wariant A' },
                    { key: '100_B', label: '🅱️ 100% Wariant B (Winner)' },
                    { key: 'paused', label: '⏸️ Pauza' },
                  ] as Array<{ key: AbTrafficAllocation; label: string }>
                ).map(opt => {
                  const active = exp.allocation === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() =>
                        runAction(
                          { action: 'update_config', testId: exp.id, allocation: opt.key },
                          `Zmieniono podział ruchu na: ${opt.label}`,
                        )
                      }
                      style={{
                        background: active
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'rgba(30, 41, 59, 0.9)',
                        color: active ? '#fff' : '#cbd5e1',
                        border: active
                          ? '1px solid rgba(255,255,255,0.35)'
                          : '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '7px',
                        padding: '6px 10px',
                        fontSize: '11.5px',
                        fontWeight: active ? 800 : 700,
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Verdict / Confidence Banner */}
          <div
            style={{
              background:
                cmp.leaderVariant === 'B'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.1) 100%)'
                  : cmp.leaderVariant === 'A'
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(37, 99, 235, 0.1) 100%)'
                    : 'rgba(30, 41, 59, 0.6)',
              border:
                cmp.leaderVariant === 'B'
                  ? '1px solid rgba(16, 185, 129, 0.45)'
                  : cmp.leaderVariant === 'A'
                    ? '1px solid rgba(59, 130, 246, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '11px 15px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>
                🏆 Werdykt na żywo: {cmp.statusText}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '3px' }}>
                Pewność statystyczna (Z-Test):{' '}
                <strong style={{ color: cmp.confidencePct >= 90 ? '#34d399' : '#fde68a' }}>
                  {cmp.confidencePct.toFixed(1)}%
                </strong>{' '}
                (cel: 95% przy min. 30–40 zamówieniach łącznie) · Różnica ATC:{' '}
                <strong>
                  {cmp.atcDeltaPct >= 0 ? '+' : ''}
                  {cmp.atcDeltaPct}%
                </strong>{' '}
                · Różnica CR:{' '}
                <strong>
                  {cmp.crDeltaPct >= 0 ? '+' : ''}
                  {cmp.crDeltaPct}%
                </strong>{' '}
                · Różnica RPV:{' '}
                <strong>
                  {cmp.rpvDeltaPct >= 0 ? '+' : ''}
                  {cmp.rpvDeltaPct}%
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => handleSimulateVisitor('A', false)}
                style={{
                  background: 'rgba(59, 130, 246, 0.16)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ Ping Testowy A (View+ATC)
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => handleSimulateVisitor('B', true)}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(139, 92, 246, 0.45)',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚡ Ping Testowy B (View+ATC+Zakup)
              </button>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => {
                  if (window.confirm(`Wyzerować wszystkie statystyki testu "${exp.name}"?`)) {
                    runAction({ action: 'reset_stats', testId: exp.id }, '🗑️ Statystyki testu zostały wyzerowane');
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.14)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🗑️ Wyzeruj liczniki
              </button>
            </div>
          </div>

          {/* 2 Variant Comparison Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            {(['A', 'B'] as const).map(vKey => {
              const m = vKey === 'A' ? mA : mB;
              const other = vKey === 'A' ? mB : mA;
              const isLeader = cmp.leaderVariant === vKey;
              const accentColor = vKey === 'A' ? '#3b82f6' : '#8b5cf6';
              const badgeBg = vKey === 'A' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.24)';

              return (
                <div
                  key={vKey}
                  style={{
                    background: 'rgba(15, 23, 42, 0.92)',
                    border: isLeader
                      ? '2px solid #10b981'
                      : `1px solid ${vKey === 'A' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.45)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        background: badgeBg,
                        color: vKey === 'A' ? '#93c5fd' : '#c4b5fd',
                        border: `1px solid ${accentColor}`,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                      }}
                    >
                      WARIANT {vKey} {vKey === 'A' ? '(CONTROL 50%)' : '(CHALLENGER 50%)'}
                    </span>
                    {isLeader && (
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        🏆 LIDER RPV
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{m.subtitle}</div>
                  <div style={{ fontSize: '12px', marginBottom: '14px' }}>
                    <a
                      href={m.targetUrlOrSelector}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: vKey === 'A' ? '#93c5fd' : '#c4b5fd',
                        fontWeight: 700,
                        textDecoration: 'underline',
                        wordBreak: 'break-all',
                      }}
                    >
                      🔗 {m.targetUrlOrSelector} ↗
                    </a>
                  </div>

                  {/* Hero Metric: RPV */}
                  <div
                    style={{
                      background: 'rgba(2, 6, 23, 0.75)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                        💰 RPV (PRZYCHÓD NA 1 WEJŚCIE — KLUCZOWY KPI)
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
                        {m.rpvPln.toFixed(2)} zł
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>PRZYCHÓD ŁĄCZNIE</div>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                        {m.revenuePln.toFixed(2)} zł
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>AOV: {m.aovPln.toFixed(2)} zł</div>
                    </div>
                  </div>

                  {/* Funnel Metrics Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(30, 41, 59, 0.55)',
                        borderRadius: '8px',
                        padding: '9px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>1. WEJŚCIA</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '3px' }}>
                        {m.uniqueViews}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>{m.pageviews} odsłon</div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(30, 41, 59, 0.55)',
                        borderRadius: '8px',
                        padding: '9px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>2. KOSZYK (ATC)</div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 800,
                          color: m.atcRatePct >= other.atcRatePct && m.uniqueAtc > 0 ? '#34d399' : '#fff',
                          marginTop: '3px',
                        }}
                      >
                        {m.atcRatePct.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>{m.uniqueAtc} osób</div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(30, 41, 59, 0.55)',
                        borderRadius: '8px',
                        padding: '9px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>3. KASA (IC)</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '3px' }}>
                        {m.icRatePct.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>{m.uniqueIc} osób</div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(30, 41, 59, 0.55)',
                        borderRadius: '8px',
                        padding: '9px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>4. ZAKUP (CR%)</div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 800,
                          color: m.crPct >= other.crPct && m.orders > 0 ? '#34d399' : '#fff',
                          marginTop: '3px',
                        }}
                      >
                        {m.crPct.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#34d399', fontWeight: 700 }}>
                        {m.orders} zamówień
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ready-to-Paste Shopify Snippets Section */}
          {showSnippets && activeSummary.snippets && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#fde68a' }}>
                🛠️ Gotowe Kody Integracji 50/50 dla sklepu {exp.storeDomain} ({exp.id})
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#cbd5e1' }}>
                1) Wklej poniższy skrypt do <code>layout/theme.liquid</code> tuż przed <code>&lt;/head&gt;</code>.
                Wszystkie elementy na produkcie oznaczone klasą <code>sz-ab-only-b</code> wyświetlą się wyłącznie
                klientom z Wariantu B (50% ruchu), bez przeładowania URL-a i bez utraty parametrów <code>fbclid</code>.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '12px' }}>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#93c5fd' }}>
                      1️⃣ Kod do layout/theme.liquid (&lt;head&gt;)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeSummary.snippets!.headLiquid, 'Kod <head> 50/50 Split')}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      📋 Kopiuj kod &lt;head&gt;
                    </button>
                  </div>
                  <pre
                    style={{
                      background: '#020617',
                      color: '#e2e8f0',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      maxHeight: '210px',
                      overflow: 'auto',
                      border: '1px solid rgba(255,255,255,0.1)',
                      margin: 0,
                    }}
                  >
                    {activeSummary.snippets.headLiquid}
                  </pre>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#6ee7b7' }}>
                      2️⃣ Kod Custom Pixel (Settings → Customer events w Shopify)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(activeSummary.snippets!.checkoutPixel, 'Kod Shopify Checkout Custom Pixel')
                      }
                      style={{
                        background: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      📋 Kopiuj Custom Pixel
                    </button>
                  </div>
                  <pre
                    style={{
                      background: '#020617',
                      color: '#e2e8f0',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      maxHeight: '210px',
                      overflow: 'auto',
                      border: '1px solid rgba(255,255,255,0.1)',
                      margin: 0,
                    }}
                  >
                    {activeSummary.snippets.checkoutPixel}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders Log */}
          {exp.recentOrders && exp.recentOrders.length > 0 && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#e2e8f0', marginBottom: '8px' }}>
                🧾 Ostatnie zamówienia przypisane do testu ({exp.recentOrders.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '160px', overflowY: 'auto' }}>
                {exp.recentOrders.slice(0, 12).map(ord => (
                  <div
                    key={ord.orderId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      padding: '5px 9px',
                      background: 'rgba(2, 6, 23, 0.6)',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '1px 7px',
                          borderRadius: '5px',
                          fontWeight: 800,
                          fontSize: '11px',
                          background: ord.variant === 'B' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                          color: ord.variant === 'B' ? '#c4b5fd' : '#93c5fd',
                        }}
                      >
                        Wariant {ord.variant}
                      </span>
                      <strong style={{ color: '#fff' }}>{ord.orderNumber}</strong>
                      <span style={{ color: '#94a3b8' }}>{ord.itemsSummary}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: '#34d399' }}>{ord.revenuePln.toFixed(2)} zł</strong>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>
                        {new Date(ord.createdAt).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create New Test Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              borderRadius: '14px',
              padding: '20px',
              width: '100%',
              maxWidth: '520px',
              color: '#fff',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '17px', fontWeight: 800 }}>
              🧪 Utwórz nowy test A/B 50/50
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Sklep / Marka:
                <select
                  value={newBrandKey}
                  onChange={e => {
                    const val = e.target.value as 'orthomax' | 'feliora-pies' | 'sardian-szampon' | 'custom';
                    setNewBrandKey(val);
                    if (val === 'orthomax') {
                      setNewStoreDomain('orthomax.pl');
                      setNewEntryUrl('https://orthomax.pl/products/orthomax-stepmax');
                    } else if (val === 'feliora-pies') {
                      setNewStoreDomain('feliora.pl');
                      setNewEntryUrl('https://feliora.pl/products/uspokajajacy-dyfuzor-feromonowy-dla-psow-feliora');
                    } else if (val === 'sardian-szampon') {
                      setNewStoreDomain('sardian.pl');
                      setNewEntryUrl('https://sardian.pl/products/szampon-przeciw-wypadaniu-wlosow-sardian');
                    }
                  }}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '7px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <option value="orthomax">🦶 ORTHOMAX PL (orthomax.pl)</option>
                  <option value="feliora-pies">🐶 FELIORA PL (feliora.pl)</option>
                  <option value="sardian-szampon">🦁 SARDIAN PL (sardian.pl)</option>
                  <option value="custom">🧪 Inny sklep / Custom</option>
                </select>
              </label>

              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Nazwa testu:
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="np. Krystyna 62 l. — Standard PDP vs Story-PDP"
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '7px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />
              </label>

              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Docelowy URL produktu (wklejany do reklam Meta):
                <input
                  type="text"
                  value={newEntryUrl}
                  onChange={e => setNewEntryUrl(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '7px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />
              </label>

              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Opis Wariantu A (Control):
                <input
                  type="text"
                  value={newVarALabel}
                  onChange={e => setNewVarALabel(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '7px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />
              </label>

              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>
                Opis Wariantu B (Challenger):
                <input
                  type="text"
                  value={newVarBLabel}
                  onChange={e => setNewVarBLabel(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '8px',
                    borderRadius: '7px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                }}
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={async () => {
                  const brandLabelMap: Record<string, string> = {
                    orthomax: '🦶 ORTHOMAX PL',
                    'feliora-pies': '🐶 FELIORA PL',
                    'sardian-szampon': '🦁 SARDIAN PL',
                    custom: '🧪 CUSTOM TEST',
                  };
                  await runAction(
                    {
                      action: 'create_test',
                      brandKey: newBrandKey,
                      brandLabel: brandLabelMap[newBrandKey] || '🧪 TEST',
                      storeDomain: newStoreDomain,
                      name: newName || 'Test 50/50 Standard PDP vs Story-PDP',
                      entryUrl: newEntryUrl,
                      variantALabel: newVarALabel,
                      variantBLabel: newVarBLabel,
                    },
                    '✅ Utworzono nowy test A/B 50/50',
                  );
                  setShowCreateModal(false);
                  setNewName('');
                }}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Utwórz Test A/B
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
