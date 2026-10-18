'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AntkiPlFunnelStage,
  AntkiPlGeneratedAd,
  AntkiPlPresetAngle,
  AntkiPlSegment,
} from '@/lib/antki-pl';

type AngleRunStatus = 'idle' | 'queued' | 'generating' | 'done' | 'error';

interface StageMeta {
  label: string;
  shortLabel?: string;
  badge: string;
  awareness?: string;
  sophistication?: string;
  description: string;
}

const STAGE_ORDER: AntkiPlFunnelStage[] = [
  'stage1_domowe_odkrycie',
  'stage2_efekt_domina',
  'stage2_szkola_wf',
  'stage3_wypalone_matki',
  'ryciak_rip3_variations',
  'zal_po_operacji',
  'dorosli_jesien_zima',
];

export default function AntkiPlPage() {
  const [presets, setPresets] = useState<AntkiPlPresetAngle[]>([]);
  const [stages, setStages] = useState<Record<string, StageMeta>>({});
  const [savedAds, setSavedAds] = useState<AntkiPlGeneratedAd[]>([]);
  const [brain, setBrain] = useState<{ provider: string; model: string }>({ provider: 'openai', model: 'gpt-5.4' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Domyślnie skupiamy się na dzieciach ("Porady Mamy Gosi"), dorośli są na razie schowani pod przełącznikiem
  const [stageFilter, setStageFilter] = useState<'all_kids' | 'all' | AntkiPlFunnelStage>('all_kids');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAngleId, setActiveAngleId] = useState<string | null>(null);

  // Generation settings
  const [destinationUrl, setDestinationUrl] = useState('https://orthomax.pl/products/orthomax-stepmax');
  const [pageName, setPageName] = useState('Porady Mamy Gosi');
  const [customInstructions, setCustomInstructions] = useState('');
  const [concurrency, setConcurrency] = useState(3);
  const [defaultMediaUrl, setDefaultMediaUrl] = useState('');

  // Status tracking per angle
  const [statuses, setStatuses] = useState<Record<string, AngleRunStatus>>({});
  const [angleErrors, setAngleErrors] = useState<Record<string, string>>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const cancelBatchRef = useRef(false);

  // Editor state for active generated ad
  const [editHeadline, setEditHeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrimaryText, setEditPrimaryText] = useState('');
  const [editDirty, setEditDirty] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Custom angle creator modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customSegment, setCustomSegment] = useState<AntkiPlSegment>('dzieci');
  const [customStage, setCustomStage] = useState<AntkiPlFunnelStage>('stage1_domowe_odkrycie');
  const [customNarrator, setCustomNarrator] = useState('Małgorzata (38 lat, Gdańsk)');
  const [customProtagonist, setCustomProtagonist] = useState('Kasia (10 lat)');
  const [customHook, setCustomHook] = useState('');
  const [customScene, setCustomScene] = useState('');
  const [customMath, setCustomMath] = useState('Buty 599 zł + trampki 180 zł + żel 45 zł = 824 zł');
  const [customBridge, setCustomBridge] = useState(
    'Post na grupie mam na Facebooku i dziesiątki zdjęć wkładek Orthomax StepMax w komentarzach.',
  );

  const loadInit = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/antki-pl', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd ładowania Antki PL.');
      setPresets(data.presets || []);
      setStages(data.stages || {});
      setSavedAds(data.savedAds || []);
      if (data.brain) setBrain(data.brain);
      if (data.defaultUrl) setDestinationUrl(data.defaultUrl);
      if (data.presets?.length && !activeAngleId) {
        setActiveAngleId(data.presets[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się załadować danych.');
    } finally {
      setLoading(false);
    }
  }, [activeAngleId]);

  useEffect(() => {
    void loadInit();
  }, [loadInit]);

  // Map angleId -> latest generated ad
  const adByAngleId = useMemo(() => {
    const map: Record<string, AntkiPlGeneratedAd> = {};
    for (const ad of savedAds) {
      if (!map[ad.angleId] || ad.updatedAt > map[ad.angleId].updatedAt) {
        map[ad.angleId] = ad;
      }
    }
    return map;
  }, [savedAds]);

  const activeAngle = useMemo(
    () => presets.find(a => a.id === activeAngleId) || null,
    [presets, activeAngleId],
  );

  const activeAd = useMemo(
    () => (activeAngleId ? adByAngleId[activeAngleId] || null : null),
    [adByAngleId, activeAngleId],
  );

  // Sync editor fields when switching active angle/ad
  useEffect(() => {
    if (activeAd) {
      setEditHeadline(activeAd.headline);
      setEditDescription(activeAd.description);
      setEditPrimaryText(activeAd.primaryText);
      setEditDirty(false);
    } else if (activeAngle) {
      setEditHeadline(activeAngle.defaultHeadline);
      setEditDescription('');
      setEditPrimaryText('');
      setEditDirty(false);
    }
  }, [activeAngleId, activeAd, activeAngle]);

  const filteredPresets = useMemo(() => {
    return presets.filter(item => {
      if (stageFilter === 'all_kids') {
        if (item.funnelStage === 'dorosli_jesien_zima') return false;
      } else if (stageFilter !== 'all') {
        if (item.funnelStage !== stageFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.number} ${item.code} ${item.title} ${item.hookIdea} ${item.sceneBeat} ${item.protagonist} ${item.awarenessStage} ${item.sophistication}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [presets, stageFilter, searchQuery]);

  const generateSingleAngle = useCallback(
    async (angleId: string) => {
      setStatuses(prev => ({ ...prev, [angleId]: 'generating' }));
      setAngleErrors(prev => ({ ...prev, [angleId]: '' }));
      try {
        const res = await fetch('/api/antki-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            angleId,
            customInstructions,
            destinationUrl,
            pageName,
          }),
          signal: AbortSignal.timeout(240_000),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Błąd generowania.');
        if (data.savedAds) {
          setSavedAds(data.savedAds);
        } else if (data.ad) {
          setSavedAds(prev => [data.ad, ...prev.filter(a => a.angleId !== angleId)]);
        }
        setStatuses(prev => ({ ...prev, [angleId]: 'done' }));
        return data.ad as AntkiPlGeneratedAd;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Błąd generowania';
        setStatuses(prev => ({ ...prev, [angleId]: 'error' }));
        setAngleErrors(prev => ({ ...prev, [angleId]: msg }));
        throw err;
      }
    },
    [customInstructions, destinationUrl, pageName],
  );

  const runBatchGeneration = useCallback(
    async (targetIds: string[]) => {
      if (!targetIds.length || isBatchRunning) return;
      setIsBatchRunning(true);
      cancelBatchRef.current = false;
      setError('');
      setNotice(`Rozpoczynam generowanie ${targetIds.length} polskich Antków (równoległość: ${concurrency}x)...`);

      setStatuses(prev => {
        const next = { ...prev };
        for (const id of targetIds) next[id] = 'queued';
        return next;
      });

      let cursor = 0;
      let completed = 0;
      let failed = 0;

      const worker = async () => {
        while (cursor < targetIds.length && !cancelBatchRef.current) {
          const currentIndex = cursor++;
          const id = targetIds[currentIndex];
          if (!id) break;
          try {
            await generateSingleAngle(id);
            completed++;
          } catch {
            failed++;
          }
          setNotice(
            `Postęp paczki: ${completed + failed} / ${targetIds.length} (gotowe: ${completed}${
              failed ? `, błędy: ${failed}` : ''
            })`,
          );
        }
      };

      const workers = Array.from({ length: Math.min(concurrency, targetIds.length) }, () => worker());
      await Promise.all(workers);

      setIsBatchRunning(false);
      if (cancelBatchRef.current) {
        setNotice(`Zatrzymano paczkę. Wygenerowano: ${completed}, błędy: ${failed}.`);
      } else {
        setNotice(`Paczka zakończona! Gotowe teksty: ${completed} / ${targetIds.length}${failed ? ` (błędy: ${failed})` : ''}.`);
      }
    },
    [concurrency, generateSingleAngle, isBatchRunning],
  );

  const saveEditedAd = async () => {
    if (!activeAngle) return;
    setSavingEdit(true);
    setError('');
    try {
      const baseAd: AntkiPlGeneratedAd = activeAd || {
        id: `antek-pl-${activeAngle.code}-${Date.now()}`,
        angleId: activeAngle.id,
        code: activeAngle.code,
        title: activeAngle.title,
        segment: activeAngle.segment,
        funnelStage: activeAngle.funnelStage,
        pageName,
        headline: editHeadline,
        description: editDescription,
        primaryText: editPrimaryText,
        destinationUrl,
        cta: 'LEARN_MORE',
        wordCount: 0,
        characterCount: 0,
        auditPassed: true,
        auditWarnings: [],
        auditFixesApplied: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const res = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          ad: {
            ...baseAd,
            headline: editHeadline,
            description: editDescription,
            primaryText: editPrimaryText,
            destinationUrl,
            pageName,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się zapisać zmian.');
      setSavedAds(data.savedAds || []);
      setEditDirty(false);
      setNotice('Zapisano i przefiltrowano tekst (0 em-dashów, liczba mnoga, pełna walidacja).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleGenerateCustomAngle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customHook.trim()) return;
    const newId = `custom-${Date.now()}`;
    const stageMeta = stages[customStage];
    const newAngle: AntkiPlPresetAngle = {
      id: newId,
      number: presets.length + 1,
      code: (customCode || customTitle).toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40),
      title: customTitle.trim(),
      segment: customSegment,
      funnelStage: customStage,
      funnelLabel: stageMeta?.shortLabel || stageMeta?.badge || 'Własny kąt',
      awarenessStage: stageMeta?.awareness || 'Stage 2: Problem Aware',
      sophistication: stageMeta?.sophistication || 'Poziom 3/4',
      narrator: customNarrator,
      protagonist: customProtagonist,
      hookIdea: customHook,
      sceneBeat: customScene,
      failedSolutionsMath: customMath,
      discoveryBridge: customBridge,
      defaultHeadline: customTitle.trim(),
    };

    setPresets(prev => [newAngle, ...prev]);
    setActiveAngleId(newId);
    setShowCustomModal(false);
    setStatuses(prev => ({ ...prev, [newId]: 'generating' }));

    try {
      const res = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          customAngle: newAngle,
          customInstructions,
          destinationUrl,
          pageName,
        }),
        signal: AbortSignal.timeout(240_000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd generowania własnego kąta.');
      setSavedAds(data.savedAds || []);
      setStatuses(prev => ({ ...prev, [newId]: 'done' }));
      setNotice(`Wygenerowano nowy kąt: ${newAngle.title}`);
    } catch (err) {
      setStatuses(prev => ({ ...prev, [newId]: 'error' }));
      setError(err instanceof Error ? err.message : 'Błąd generowania.');
    }
  };

  // Export functions
  const readyAdsForExport = useMemo(() => {
    const chosenSet = new Set(selectedIds);
    const list = presets
      .filter(p => (chosenSet.size ? chosenSet.has(p.id) : true))
      .map(p => adByAngleId[p.id])
      .filter((a): a is AntkiPlGeneratedAd => !!a && !!a.primaryText);
    return list;
  }, [presets, selectedIds, adByAngleId]);

  const exportMarkdownFile = () => {
    if (!readyAdsForExport.length) {
      setError('Najpierw wygeneruj przynajmniej jeden tekst do eksportu.');
      return;
    }
    const content = readyAdsForExport
      .map(
        (ad, idx) =>
          `# ${idx + 1}. [${ad.code}] ${ad.title}\n` +
          `- **Fanpage:** ${ad.pageName}\n` +
          `- **Segment:** ${ad.segment.toUpperCase()} | **Etap:** ${ad.funnelStage}\n` +
          `- **Słowa:** ${ad.wordCount} | **Znaki:** ${ad.characterCount}\n` +
          `- **Nagłówek (Headline):** ${ad.headline}\n` +
          `- **Opis (Description):** ${ad.description}\n` +
          `- **URL:** ${ad.destinationUrl}\n\n` +
          `## Primary Text (Tekst główny)\n\n${ad.primaryText}\n\n` +
          `================================================================================\n`,
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ANTKI_PL_ORTHOMAX_${new Date().toISOString().slice(0, 10)}_${readyAdsForExport.length}_szt.md`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Pobrano plik Markdown z ${readyAdsForExport.length} gotowymi Antkami.`);
  };

  const exportUploaderJson = () => {
    if (!readyAdsForExport.length) {
      setError('Brak gotowych tekstów do eksportu JSON.');
      return;
    }
    const adsPayload = readyAdsForExport.map(ad => ({
      key: ad.code,
      name: `ANT_PL_${ad.code}`,
      url: ad.destinationUrl || destinationUrl,
      cta: ad.cta || 'LEARN_MORE',
      primaryTexts: [ad.primaryText],
      headline: ad.headline,
      headlines: [ad.headline],
      description: ad.description,
      descriptions: [ad.description],
      ...(defaultMediaUrl.trim()
        ? {
            media: {
              kind: 'image' as const,
              url: defaultMediaUrl.trim(),
              filename: `${ad.code}.jpg`,
            },
          }
        : {}),
    }));

    const blob = new Blob([JSON.stringify({ ads: adsPayload }, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SZEKSPIR_ADS_ANTKI_PL_${new Date().toISOString().slice(0, 10)}_${readyAdsForExport.length}_szt.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Pobrano plik JSON (${readyAdsForExport.length} reklam) gotowy do wczytania w Szekspir Ads -> Paste table / JSON.`);
  };

  const totalGeneratedCount = Object.keys(adByAngleId).length;
  const activeStageMeta =
    stageFilter !== 'all' && stageFilter !== 'all_kids' ? stages[stageFilter] : null;

  return (
    <main className="wrap" style={{ maxWidth: 1460, margin: '0 auto', padding: '20px 20px 80px' }}>
      <p className="crumb">
        <a href="/">← Home (Szekspir)</a> · <a href="/uploader">Szekspir Ads (Uploader) ↗</a> ·{' '}
        <a href="/profile">
          Mózg AI ({brain.provider}: {brain.model}) ↗
        </a>
      </p>

      {/* NAGŁÓWEK Z CZYSTYM KONTRASTEM */}
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 18,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 14,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, color: 'var(--text)' }}>
            🇵🇱 ANTKI PL · Porady Mamy Gosi (Orthomax StepMax)
          </h1>
          <p className="sub" style={{ margin: 0, fontSize: 13 }}>
            Pakiet <strong>1+1 GRATIS (2 pary za 99,99 zł = 50 zł/para)</strong> + <strong>30 dni gwarancji</strong> ·
            Styl Mellow · Liczba mnoga („wkładki są zrobione”) · Cyfrowe godziny · 0 em-dashów.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid var(--accent)',
              background: 'var(--card)',
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            + Własny kąt / Hook
          </button>

          <button
            type="button"
            onClick={exportMarkdownFile}
            disabled={!totalGeneratedCount}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: totalGeneratedCount ? 'var(--text)' : 'var(--muted)',
              fontWeight: 600,
              fontSize: 13,
              opacity: totalGeneratedCount ? 1 : 0.55,
              cursor: totalGeneratedCount ? 'pointer' : 'not-allowed',
            }}
          >
            ⬇ Pobierz Markdown ({readyAdsForExport.length})
          </button>

          <button
            type="button"
            onClick={exportUploaderJson}
            disabled={!totalGeneratedCount}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid #059669',
              background: totalGeneratedCount ? '#059669' : 'var(--card)',
              color: totalGeneratedCount ? '#ffffff' : 'var(--muted)',
              fontWeight: 700,
              fontSize: 13,
              opacity: totalGeneratedCount ? 1 : 0.55,
              cursor: totalGeneratedCount ? 'pointer' : 'not-allowed',
            }}
          >
            🚀 Eksport JSON do Szekspir Ads ({readyAdsForExport.length})
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={{ background: 'transparent', border: 0, color: '#991b1b', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#065f46',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>{notice}</span>
          <button
            onClick={() => setNotice('')}
            style={{ background: 'transparent', border: 0, color: '#065f46', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* CZYSTY PASEK: AWARENESS STAGE & MARKET SOPHISTICATION + AKCJE BATCH */}
      <section
        style={{
          padding: '14px 16px',
          borderRadius: 10,
          marginBottom: 16,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginRight: 4 }}>
              Awareness Stage / Poziom Sofistykacji:
            </span>

            <button
              type="button"
              onClick={() => setStageFilter('all_kids')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: stageFilter === 'all_kids' ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: stageFilter === 'all_kids' ? 'var(--accent)' : 'var(--bg)',
                color: stageFilter === 'all_kids' ? '#ffffff' : 'var(--text)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Wszystkie Dzieci (30)
            </button>

            {STAGE_ORDER.map(stageKey => {
              const meta = stages[stageKey];
              if (!meta) return null;
              const isActive = stageFilter === stageKey;
              const count = presets.filter(p => p.funnelStage === stageKey).length;
              return (
                <button
                  key={stageKey}
                  type="button"
                  onClick={() => setStageFilter(stageKey)}
                  style={{
                    padding: '6px 11px',
                    borderRadius: 6,
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: isActive ? 'var(--accent)' : 'var(--bg)',
                    color: isActive ? '#ffffff' : 'var(--text)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {meta.shortLabel || meta.badge} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Opis wybranego Awareness Stage & Sophistication */}
        {activeStageMeta && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              fontSize: 12,
              color: 'var(--text)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <span>
              <strong>Awareness:</strong> {activeStageMeta.awareness || activeStageMeta.label}
            </span>
            <span>·</span>
            <span>
              <strong>Sofistykacja:</strong> {activeStageMeta.sophistication || 'Poziom 3/4'}
            </span>
            <span>·</span>
            <span style={{ color: 'var(--muted)' }}>{activeStageMeta.description}</span>
          </div>
        )}

        {/* Wyszukiwarka + Przyciski Zaznaczania + Generowania + Zwijane Ustawienia */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Szukaj kąta (np. 599, kasza, ryciak, beton, operacja)..."
              style={{
                padding: '7px 11px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 13,
                minWidth: 260,
              }}
            />

            <button
              type="button"
              onClick={() => setSelectedIds(filteredPresets.map(p => p.id))}
              style={{
                padding: '7px 11px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Zaznacz widok ({filteredPresets.length})
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                style={{
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Odznacz ({selectedIds.length})
              </button>
            )}

            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>
              Gotowe: <strong style={{ color: 'var(--text)' }}>{totalGeneratedCount}</strong> / {presets.length}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {isBatchRunning ? (
              <button
                type="button"
                onClick={() => {
                  cancelBatchRef.current = true;
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 7,
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 0,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ⏹ Zatrzymaj serię
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!selectedIds.length}
                  onClick={() => void runBatchGeneration(selectedIds)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 7,
                    background: selectedIds.length ? 'var(--accent)' : 'var(--bg)',
                    color: selectedIds.length ? '#ffffff' : 'var(--muted)',
                    border: selectedIds.length ? '1px solid var(--accent)' : '1px solid var(--border)',
                    fontWeight: 700,
                    fontSize: 13,
                    opacity: selectedIds.length ? 1 : 0.6,
                    cursor: selectedIds.length ? 'pointer' : 'not-allowed',
                  }}
                >
                  ⚡ Generuj zaznaczone ({selectedIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const missing = filteredPresets.filter(p => !adByAngleId[p.id]).map(p => p.id);
                    void runBatchGeneration(missing.length ? missing : filteredPresets.map(p => p.id));
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 7,
                    background: '#059669',
                    border: '1px solid #059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  🔥 Generuj brakujące w widoku ({filteredPresets.filter(p => !adByAngleId[p.id]).length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Zwijane ustawienia zaawansowane (żeby nie zaśmiecały widoku) */}
        <details style={{ fontSize: 12, color: 'var(--muted)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
            ⚙️ Ustawienia kampanii (Fanpage, URL, równoległość AI, dodatkowa instrukcja)
          </summary>
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Fanpage / Persona</span>
              <input
                value={pageName}
                onChange={e => setPageName(e.target.value)}
                style={{
                  padding: '6px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Link docelowy (Orthomax PL)</span>
              <input
                value={destinationUrl}
                onChange={e => setDestinationUrl(e.target.value)}
                style={{
                  padding: '6px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Równoległe wątki AI (Batch)</span>
              <select
                value={concurrency}
                onChange={e => setConcurrency(Number(e.target.value))}
                style={{
                  padding: '6px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                }}
              >
                <option value={1}>1 naraz</option>
                <option value={3}>3 naraz (zalecane)</option>
                <option value={5}>5 naraz (szybka produkcja)</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Domyślny URL grafiki (pod JSON Uploader)</span>
              <input
                value={defaultMediaUrl}
                onChange={e => setDefaultMediaUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  padding: '6px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
              <span>Dodatkowa instrukcja dla bota (opcjonalnie)</span>
              <input
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="Np. Wpleć jesienną aurę, deszczowy październik i zmianę butów..."
                style={{
                  padding: '6px 9px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                }}
              />
            </label>
          </div>
        </details>
      </section>

      {/* GŁÓWNY UKŁAD DWUKOLUMNOWY: LISTA KĄTÓW PO LEWEJ, EDYTOR I PODGLĄD PO PRAWEJ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 440px) 1fr',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* LEWA KOLUMNA: LISTA KĄTÓW */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight: '80vh',
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Wczytywanie matrycy Antków PL...</p>
          ) : (
            filteredPresets.map(angle => {
              const ad = adByAngleId[angle.id];
              const runState = statuses[angle.id] || (ad ? 'done' : 'idle');
              const isSelected = selectedIds.includes(angle.id);
              const isActive = activeAngleId === angle.id;
              const errText = angleErrors[angle.id];

              return (
                <article
                  key={angle.id}
                  onClick={() => setActiveAngleId(angle.id)}
                  style={{
                    padding: '11px 13px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    background: 'var(--card)',
                    border: isActive
                      ? '2px solid var(--accent)'
                      : ad
                      ? '1px solid #10b981'
                      : '1px solid var(--border)',
                    boxShadow: isActive ? '0 2px 8px rgba(29,78,216,0.12)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <label
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e =>
                          setSelectedIds(prev =>
                            e.target.checked ? [...prev, angle.id] : prev.filter(id => id !== angle.id),
                          )
                        }
                      />
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: angle.segment === 'dzieci' ? '#dbeafe' : '#f3e8ff',
                          color: angle.segment === 'dzieci' ? '#1e40af' : '#6b21a8',
                          fontWeight: 700,
                        }}
                      >
                        {angle.funnelLabel}
                      </span>
                    </label>

                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 99,
                        fontWeight: 700,
                        background:
                          runState === 'done'
                            ? '#d1fae5'
                            : runState === 'generating'
                            ? '#fef3c7'
                            : runState === 'queued'
                            ? '#dbeafe'
                            : runState === 'error'
                            ? '#fee2e2'
                            : 'var(--bg)',
                        color:
                          runState === 'done'
                            ? '#065f46'
                            : runState === 'generating'
                            ? '#92400e'
                            : runState === 'queued'
                            ? '#1e40af'
                            : runState === 'error'
                            ? '#991b1b'
                            : 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {runState === 'done' && ad
                        ? `✓ Gotowe (${ad.wordCount} sł.)`
                        : runState === 'generating'
                        ? '⏳ Piszę...'
                        : runState === 'queued'
                        ? 'W kolejce'
                        : runState === 'error'
                        ? 'Błąd'
                        : 'Do napisania'}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', marginBottom: 4, lineHeight: 1.35 }}>
                    #{angle.number} · {angle.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.35 }}>
                    <strong>{angle.awarenessStage}</strong> · {angle.sophistication}
                  </div>
                  {errText && (
                    <div style={{ color: '#dc2626', fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                      Błąd: {errText}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* PRAWA KOLUMNA: SZCZEGÓŁY KĄTA + PEŁNY EDYTOR TEKSTU + AUDYT */}
        <section
          style={{
            padding: 20,
            borderRadius: 10,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          {!activeAngle ? (
            <p style={{ color: 'var(--muted)' }}>Wybierz kąt z listy po lewej stronie.</p>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 14,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ maxWidth: 680 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#dbeafe',
                        color: '#1e40af',
                      }}
                    >
                      {activeAngle.awarenessStage}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#fef3c7',
                        color: '#92400e',
                      }}
                    >
                      Sofistykacja: {activeAngle.sophistication}
                    </span>
                    <code style={{ fontSize: 11, color: 'var(--muted)' }}>#{activeAngle.number} · {activeAngle.code}</code>
                  </div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 19, color: 'var(--text)', lineHeight: 1.3 }}>
                    {activeAngle.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)' }}>
                    <strong>Narratorka:</strong> {activeAngle.narrator} · <strong>Postać:</strong> {activeAngle.protagonist}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={statuses[activeAngle.id] === 'generating'}
                    onClick={() => void generateSingleAngle(activeAngle.id)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      background: 'var(--accent)',
                      color: '#ffffff',
                      border: 0,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: statuses[activeAngle.id] === 'generating' ? 'wait' : 'pointer',
                    }}
                  >
                    {statuses[activeAngle.id] === 'generating'
                      ? '⏳ Generuję MSL...'
                      : activeAd
                      ? '🔄 Wygeneruj nową wersję'
                      : '✨ Wygeneruj ten Antek teraz'}
                  </button>

                  {editPrimaryText && (
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(editPrimaryText);
                        setNotice('Skopiowano Primary Text do schowka!');
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      📋 Kopiuj tekst
                    </button>
                  )}
                </div>
              </div>

              {/* BRIEF KĄTA */}
              <details
                open={!activeAd}
                style={{
                  marginBottom: 14,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
                  📌 Brief kąta, matematyka kwot i most odkrycia (kliknij, aby zwinąć/rozwinąć)
                </summary>
                <div style={{ marginTop: 10, display: 'grid', gap: 8, lineHeight: 1.5 }}>
                  <div>
                    <strong>Hook / Otwarcie (Mellow style):</strong> {activeAngle.hookIdea}
                  </div>
                  <div>
                    <strong>Scena i mechanizm:</strong> {activeAngle.sceneBeat}
                  </div>
                  <div>
                    <strong>Matematyka nieudanych prób (Failed Solutions):</strong> {activeAngle.failedSolutionsMath}
                  </div>
                  <div>
                    <strong>Most odkrycia (Organiczny Reveal &rarr; Orthomax StepMax):</strong> {activeAngle.discoveryBridge}
                  </div>
                </div>
              </details>

              {/* STATUS AUDYTU POLSZCZYZNY I CHECKLISTY */}
              {activeAd && (
                <div
                  style={{
                    marginBottom: 14,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: activeAd.auditPassed ? '#ecfdf5' : '#fffbeb',
                    border: activeAd.auditPassed ? '1px solid #10b981' : '1px solid #f59e0b',
                    color: activeAd.auditPassed ? '#065f46' : '#92400e',
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>
                      {activeAd.auditPassed
                        ? '✅ Audyt Checklisty: ZALICZONY (0 em-dashów, liczba mnoga, cyfrowe godziny, 99,99 zł + 30 dni)'
                        : '⚠️ Audyt Checklisty: Sprawdź uwagi poniżej'}
                    </strong>
                    <span>
                      <strong>{activeAd.wordCount}</strong> słów · <strong>{activeAd.characterCount}</strong> znaków
                    </span>
                  </div>
                  {activeAd.auditFixesApplied?.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: 12 }}>
                      Automatyczne poprawki: {activeAd.auditFixesApplied.join(' | ')}
                    </div>
                  )}
                  {activeAd.auditWarnings?.length > 0 && (
                    <ul style={{ margin: '6px 0 0 18px', padding: 0, fontWeight: 600 }}>
                      {activeAd.auditWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* POLA EDYTORA */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                  <span>Nagłówek reklamy (Headline w stylu Mellow)</span>
                  <input
                    value={editHeadline}
                    onChange={e => {
                      setEditHeadline(e.target.value);
                      setEditDirty(true);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: 13,
                    }}
                  />
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <strong>Primary Text (Pełny polski MSL na „{pageName}”)</strong>
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {(editPrimaryText.match(/\p{L}+/gu) || []).length} słów · {editPrimaryText.length} znaków
                  </span>
                </div>
                <textarea
                  rows={24}
                  value={editPrimaryText}
                  onChange={e => {
                    setEditPrimaryText(e.target.value);
                    setEditDirty(true);
                  }}
                  placeholder={
                    statuses[activeAngle.id] === 'generating'
                      ? 'Trwa pisanie pełnego polskiego Antka według zasad Awareness Stage i Mózgu Antków...'
                      : 'Kliknij „Wygeneruj ten Antek teraz” powyżej lub zaznacz kąty po lewej stronie i uruchom serię.'
                  }
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    lineHeight: 1.6,
                    resize: 'vertical',
                  }}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  disabled={!editDirty || savingEdit || !editPrimaryText.trim()}
                  onClick={() => void saveEditedAd()}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    background: editDirty ? '#059669' : 'var(--bg)',
                    color: editDirty ? '#ffffff' : 'var(--muted)',
                    border: editDirty ? '1px solid #059669' : '1px solid var(--border)',
                    fontWeight: 700,
                    fontSize: 13,
                    opacity: editDirty ? 1 : 0.6,
                    cursor: editDirty ? 'pointer' : 'not-allowed',
                  }}
                >
                  {savingEdit ? 'Zapisuję...' : '💾 Zapisz i uruchom audyt polszczyzny'}
                </button>

                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Zapisywane automatycznie na Twoim koncie Szekspira.
                </span>
              </div>
            </>
          )}
        </section>
      </div>

      {/* MODAL DODAWANIA WŁASNEGO KĄTA */}
      {showCustomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <form
            onSubmit={handleGenerateCustomAngle}
            style={{
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 22,
              maxWidth: 660,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>Dodaj własny kąt Antka PL</h2>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                style={{ background: 'transparent', border: 0, color: 'var(--text)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                <span>Tytuł / Nagłówek w stylu Mellow *</span>
                <input
                  required
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Np. Kupiłam córce buty za 599 zł. Po 3 tygodniach zamarłam"
                  style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                <span>Kod roboczy</span>
                <input
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  placeholder="np. nike_599_przedpokoj"
                  style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                <span>Segment</span>
                <select
                  value={customSegment}
                  onChange={e => setCustomSegment(e.target.value as AntkiPlSegment)}
                  style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="dzieci">Dzieci (Porady Mamy Gosi)</option>
                  <option value="dorosli">Dorośli (Zapasowy)</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                <span>Awareness Stage / Poziom Sofistykacji</span>
                <select
                  value={customStage}
                  onChange={e => setCustomStage(e.target.value as AntkiPlFunnelStage)}
                  style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  {STAGE_ORDER.map(k => (
                    <option key={k} value={k}>
                      {stages[k]?.label || k}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                <span>Narratorka</span>
                <input
                  value={customNarrator}
                  onChange={e => setCustomNarrator(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                <span>Główna postać (dziecko)</span>
                <input
                  value={customProtagonist}
                  onChange={e => setCustomProtagonist(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
              <span>Hook otwierający / Pierwsza scena *</span>
              <textarea
                required
                rows={3}
                value={customHook}
                onChange={e => setCustomHook(e.target.value)}
                placeholder="Opisz pierwsze 2-3 zdania wchodzące prosto w scenę..."
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
              <span>Rozwinięcie sceny i mechanizm</span>
              <textarea
                rows={3}
                value={customScene}
                onChange={e => setCustomScene(e.target.value)}
                placeholder="Co wyszło na jaw i jak działa mechanizm..."
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
              <span>Matematyka wcześniejszych wydatków (Failed Solutions)</span>
              <input
                value={customMath}
                onChange={e => setCustomMath(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
              <span>Most odkrycia (np. grupa mam na Facebooku / forum)</span>
              <input
                value={customBridge}
                onChange={e => setCustomBridge(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                Anuluj
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: 7,
                  background: 'var(--accent)',
                  color: '#ffffff',
                  border: 0,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Dodaj i wygeneruj teraz
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
