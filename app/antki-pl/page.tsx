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
  badge: string;
  description: string;
}

export default function AntkiPlPage() {
  const [presets, setPresets] = useState<AntkiPlPresetAngle[]>([]);
  const [stages, setStages] = useState<Record<string, StageMeta>>({});
  const [savedAds, setSavedAds] = useState<AntkiPlGeneratedAd[]>([]);
  const [brain, setBrain] = useState<{ provider: string; model: string }>({ provider: 'openai', model: 'gpt-5.4' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filters & Selection
  const [stageFilter, setStageFilter] = useState<'all' | AntkiPlFunnelStage>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | AntkiPlSegment>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAngleId, setActiveAngleId] = useState<string | null>(null);

  // Generation settings
  const [destinationUrl, setDestinationUrl] = useState('https://orthomax.pl/products/stepmax');
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
  const [customStage, setCustomStage] = useState<AntkiPlFunnelStage>('ryciak_rip3_variations');
  const [customNarrator, setCustomNarrator] = useState('Małgorzata (38 lat, Gdańsk)');
  const [customProtagonist, setCustomProtagonist] = useState('Kasia (10 lat)');
  const [customHook, setCustomHook] = useState('');
  const [customScene, setCustomScene] = useState('');
  const [customMath, setCustomMath] = useState('Maść 35 zł + lekarz 150 zł + fizjoterapeuta 180 zł = 365 zł');
  const [customBridge, setCustomBridge] = useState('Wieczorne szukanie na forum rodziców i powtarzająca się nazwa Orthomax StepMax.');

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
      setEditDescription('Pakiet 1+1 GRATIS (2 pary za 99,99 zł) · 30 dni gwarancji zwrotu');
      setEditPrimaryText('');
      setEditDirty(false);
    }
  }, [activeAngleId, activeAd, activeAngle]);

  const filteredPresets = useMemo(() => {
    return presets.filter(item => {
      if (stageFilter !== 'all' && item.funnelStage !== stageFilter) return false;
      if (segmentFilter !== 'all' && item.segment !== segmentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.number} ${item.code} ${item.title} ${item.hookIdea} ${item.sceneBeat} ${item.protagonist}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [presets, stageFilter, segmentFilter, searchQuery]);

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
      setNotice('Zapisano i przefiltrowano tekst (0 em-dashów, pełna walidacja).');
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
    const newAngle: AntkiPlPresetAngle = {
      id: newId,
      number: presets.length + 1,
      code: (customCode || customTitle).toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40),
      title: customTitle.trim(),
      segment: customSegment,
      funnelStage: customStage,
      funnelLabel: stages[customStage]?.badge || 'Własny kąt',
      awarenessStage: 'Własny kąt',
      sophistication: 'Stage 3/4',
      narrator: customNarrator,
      protagonist: customProtagonist,
      hookIdea: customHook,
      sceneBeat: customScene,
      failedSolutionsMath: customMath,
      discoveryBridge: customBridge,
      defaultHeadline:
        customSegment === 'dorosli'
          ? 'Zanim zapiszesz się na zabieg lub kupisz kolejną maść, przeczytaj to ☝️'
          : 'Jeśli Twoje dziecko bolą stopy, przeczytaj to ☝️',
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

  const selectGroup = (group: 'first20_kids' | 'ryciak_rip3' | 'zal_operacja' | 'dorosli_zima' | 'all') => {
    if (group === 'all') {
      setSelectedIds(presets.map(p => p.id));
      return;
    }
    if (group === 'first20_kids') {
      setSelectedIds(
        presets
          .filter(p =>
            [
              'stage1_domowe_odkrycie',
              'stage2_efekt_domina',
              'stage2_szkola_wf',
              'stage3_wypalone_matki',
            ].includes(p.funnelStage),
          )
          .map(p => p.id),
      );
      return;
    }
    if (group === 'ryciak_rip3') {
      setSelectedIds(presets.filter(p => p.funnelStage === 'ryciak_rip3_variations').map(p => p.id));
      return;
    }
    if (group === 'zal_operacja') {
      setSelectedIds(presets.filter(p => p.funnelStage === 'zal_po_operacji').map(p => p.id));
      return;
    }
    if (group === 'dorosli_zima') {
      setSelectedIds(presets.filter(p => p.funnelStage === 'dorosli_jesien_zima').map(p => p.id));
      return;
    }
  };

  const totalGeneratedCount = Object.keys(adByAngleId).length;

  return (
    <main className="wrap" style={{ maxWidth: 1480, margin: '0 auto', padding: '24px 20px 80px' }}>
      <p className="crumb">
        <a href="/">← Home (Szekspir)</a> · <a href="/uploader">Szekspir Ads (Uploader) ↗</a> ·{' '}
        <a href="/profile">Mózg AI i Klucze ({brain.provider}: {brain.model}) ↗</a>
      </p>

      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 20,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 16,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 28 }}>
            🇵🇱 ANTKI PL · Fabryka MSL Orthomax StepMax (30+/dzień)
          </h1>
          <p className="sub" style={{ margin: 0 }}>
            Porady Mamy Gosi & Segment Dorosły · Nowy cennik: <strong>99,99 zł (Pakiet 1+1 GRATIS = 50 zł/para)</strong> +{' '}
            <strong>30 dni gwarancji zwrotu</strong> · Automatyczny audyt (0 em-dashów, Pan/Pani, brak „, i”, most odkrycia).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #3864f5',
              background: 'rgba(56,100,245,0.15)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Dodaj własny kąt / Hook
          </button>
          <button
            type="button"
            onClick={exportMarkdownFile}
            disabled={!totalGeneratedCount}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
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
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #10b981',
              background: 'rgba(16,185,129,0.18)',
              color: '#fff',
              fontWeight: 600,
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
            background: 'rgba(239,68,68,0.16)',
            border: '1px solid #ef4444',
            color: '#fecaca',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            background: 'rgba(16,185,129,0.14)',
            border: '1px solid #10b981',
            color: '#a7f3d0',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{notice}</span>
          <button onClick={() => setNotice('')} style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      {/* PANEL STEROWANIA LEJKIEM I GENERATOREM */}
      <section
        className="vopanel"
        style={{
          padding: 18,
          borderRadius: 12,
          marginBottom: 20,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            <span>Fanpage / Persona</span>
            <input
              value={pageName}
              onChange={e => setPageName(e.target.value)}
              placeholder="Porady Mamy Gosi"
              style={{ padding: '8px 10px', borderRadius: 6 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            <span>Link docelowy (Orthomax PL)</span>
            <input
              value={destinationUrl}
              onChange={e => setDestinationUrl(e.target.value)}
              placeholder="https://orthomax.pl/products/stepmax"
              style={{ padding: '8px 10px', borderRadius: 6 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            <span>Równoległe wątki AI (Batch)</span>
            <select
              value={concurrency}
              onChange={e => setConcurrency(Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 6 }}
            >
              <option value={1}>1 naraz (najbezpieczniej)</option>
              <option value={3}>3 naraz (zalecane)</option>
              <option value={5}>5 naraz (szybka fabryka 30/dzień)</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            <span>Domyślny URL grafiki (opcjonalnie pod JSON Uploader)</span>
            <input
              value={defaultMediaUrl}
              onChange={e => setDefaultMediaUrl(e.target.value)}
              placeholder="https://... (lub dodaj grafiki w Szekspir Ads)"
              style={{ padding: '8px 10px', borderRadius: 6 }}
            />
          </label>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, marginBottom: 14 }}>
          <span>Dodatkowa instrukcja dla całej serii (opcjonalnie)</span>
          <input
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            placeholder="Np. Wpleć jesienną aurę, deszczowy październik i zmianę butów na zimowe..."
            style={{ padding: '8px 10px', borderRadius: 6 }}
          />
        </label>

        {/* SZYBKIE PRZYCISKI ETAPÓW LEJKA WG USTALEŃ */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <strong style={{ fontSize: 13, marginRight: 4 }}>Wybierz etap lejka:</strong>
            <button
              type="button"
              onClick={() => selectGroup('first20_kids')}
              style={{ padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              1. Koszyki 1–4 Dzieci (20 szt.)
            </button>
            <button
              type="button"
              onClick={() => selectGroup('ryciak_rip3')}
              style={{ padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              2. Ryciak Rip 3 · Nowe Wersje (5 szt.)
            </button>
            <button
              type="button"
              onClick={() => selectGroup('zal_operacja')}
              style={{ padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              3. Żal po operacji / Wózek (5 szt.)
            </button>
            <button
              type="button"
              onClick={() => selectGroup('dorosli_zima')}
              style={{ padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              4. Dorośli Jesień/Zima (5 szt.)
            </button>
            <button
              type="button"
              onClick={() => selectGroup('all')}
              style={{ padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              Zaznacz wszystkie ({presets.length})
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                style={{ padding: '7px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, opacity: 0.8 }}
              >
                Odznacz ({selectedIds.length})
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {isBatchRunning ? (
              <button
                type="button"
                onClick={() => {
                  cancelBatchRef.current = true;
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: '#ef4444',
                  color: '#fff',
                  border: 0,
                  fontWeight: 700,
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
                    padding: '10px 18px',
                    borderRadius: 8,
                    background: selectedIds.length ? '#3864f5' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 0,
                    fontWeight: 700,
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
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: 'rgba(16,185,129,0.2)',
                    border: '1px solid #10b981',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🔥 Generuj brakujące w widoku ({filteredPresets.filter(p => !adByAngleId[p.id]).length})
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FILTRY LISTY */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value as 'all' | AntkiPlFunnelStage)}
            style={{ padding: '8px 12px', borderRadius: 8 }}
          >
            <option value="all">Wszystkie etapy lejka ({presets.length})</option>
            {Object.entries(stages).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>

          <select
            value={segmentFilter}
            onChange={e => setSegmentFilter(e.target.value as 'all' | AntkiPlSegment)}
            style={{ padding: '8px 12px', borderRadius: 8 }}
          >
            <option value="all">Wszystkie segmenty (Dzieci + Dorośli)</option>
            <option value="dzieci">Tylko Dzieci (Porady Mamy Gosi)</option>
            <option value="dorosli">Tylko Dorośli (Haluksy / Ostroga / Zima)</option>
          </select>

          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Szukaj po kodzie, hooku, scenie (np. ryciak, buty, kapcie, operacja)..."
            style={{ padding: '8px 12px', borderRadius: 8, minWidth: 280 }}
          />
        </div>

        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Gotowe w bibliotece: <strong>{totalGeneratedCount}</strong> / {presets.length} kątów
        </div>
      </div>

      {/* GŁÓWNY UKŁAD DWUKOLUMNOWY: LISTA KĄTÓW PO LEWEJ, EDYTOR I PODGLĄD PO PRAWEJ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(380px, 460px) 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* LEWA KOLUMNA: LISTA KĄTÓW W LEJKU */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight: '82vh',
            overflowY: 'auto',
            paddingRight: 6,
          }}
        >
          {loading ? (
            <p>Wczytywanie matrycy Antków PL...</p>
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
                    padding: '12px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isActive ? 'rgba(56,100,245,0.16)' : 'rgba(255,255,255,0.03)',
                    border: isActive
                      ? '1px solid #3864f5'
                      : ad
                      ? '1px solid rgba(16,185,129,0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <label
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}
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
                          background: angle.segment === 'dzieci' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)',
                          color: angle.segment === 'dzieci' ? '#93c5fd' : '#d8b4fe',
                          fontWeight: 600,
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
                        fontWeight: 600,
                        background:
                          runState === 'done'
                            ? 'rgba(16,185,129,0.2)'
                            : runState === 'generating'
                            ? 'rgba(245,158,11,0.25)'
                            : runState === 'queued'
                            ? 'rgba(59,130,246,0.2)'
                            : runState === 'error'
                            ? 'rgba(239,68,68,0.25)'
                            : 'rgba(255,255,255,0.07)',
                        color:
                          runState === 'done'
                            ? '#6ee7b7'
                            : runState === 'generating'
                            ? '#fcd34d'
                            : runState === 'error'
                            ? '#fca5a5'
                            : '#cbd5e1',
                      }}
                    >
                      {runState === 'done' && ad
                        ? `✓ Gotowe (${ad.wordCount} słów)`
                        : runState === 'generating'
                        ? '⏳ Piszę...'
                        : runState === 'queued'
                        ? 'W kolejce'
                        : runState === 'error'
                        ? 'Błąd'
                        : 'Nie wygenerowano'}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.35 }}>
                    #{angle.number} · {angle.title}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.72, lineHeight: 1.4 }}>
                    <code>{angle.code}</code> · {angle.awarenessStage}
                  </div>
                  {errText && (
                    <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 6 }}>
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
          className="vopanel"
          style={{
            padding: 22,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {!activeAngle ? (
            <p>Wybierz kąt z listy po lewej stronie.</p>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div>
                  <span style={{ fontSize: 12, opacity: 0.75 }}>
                    #{activeAngle.number} · <code>{activeAngle.code}</code> · {activeAngle.awarenessStage} ·{' '}
                    {activeAngle.sophistication}
                  </span>
                  <h2 style={{ margin: '4px 0 6px', fontSize: 20 }}>{activeAngle.title}</h2>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
                    <strong>Narratorka:</strong> {activeAngle.narrator} | <strong>Postać:</strong>{' '}
                    {activeAngle.protagonist}
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
                      background: '#3864f5',
                      color: '#fff',
                      border: 0,
                      fontWeight: 700,
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
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#fff',
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
                  marginBottom: 16,
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: 13,
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  📌 Brief kąta, matematyka kwot i most odkrycia (kliknij, aby zwinąć/rozwinąć)
                </summary>
                <div style={{ marginTop: 10, display: 'grid', gap: 8, lineHeight: 1.5 }}>
                  <div>
                    <strong>Hook / Otwarcie:</strong> {activeAngle.hookIdea}
                  </div>
                  <div>
                    <strong>Scena i mechanizm:</strong> {activeAngle.sceneBeat}
                  </div>
                  <div>
                    <strong>Matematyka nieudanych prób (Failed Solutions):</strong> {activeAngle.failedSolutionsMath}
                  </div>
                  <div>
                    <strong>Most odkrycia (Bridge &rarr; Orthomax StepMax):</strong> {activeAngle.discoveryBridge}
                  </div>
                </div>
              </details>

              {/* STATUS AUDYTU POLSZCZYZNY I CHECKLISTY */}
              {activeAd && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: activeAd.auditPassed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.15)',
                    border: activeAd.auditPassed ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(245,158,11,0.4)',
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>
                      {activeAd.auditPassed
                        ? '✅ Audyt Checklisty: ZALICZONY (0 em-dashów, brak „, i”, nowy cennik 99,99 zł + 30 dni gwarancji)'
                        : '⚠️ Audyt Checklisty: Sprawdź uwagi poniżej'}
                    </strong>
                    <span>
                      <strong>{activeAd.wordCount}</strong> słów · <strong>{activeAd.characterCount}</strong> znaków
                    </span>
                  </div>
                  {activeAd.auditFixesApplied?.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.85 }}>
                      Automatyczne poprawki: {activeAd.auditFixesApplied.join(' | ')}
                    </div>
                  )}
                  {activeAd.auditWarnings?.length > 0 && (
                    <ul style={{ margin: '6px 0 0 18px', padding: 0, color: '#fde68a' }}>
                      {activeAd.auditWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* POLA EDYTORA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  <span>Nagłówek reklamy (Headline pod grafiką / karuzelą)</span>
                  <input
                    value={editHeadline}
                    onChange={e => {
                      setEditHeadline(e.target.value);
                      setEditDirty(true);
                    }}
                    style={{ padding: '8px 10px', borderRadius: 6 }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  <span>Opis dodatkowy (Description)</span>
                  <input
                    value={editDescription}
                    onChange={e => {
                      setEditDescription(e.target.value);
                      setEditDirty(true);
                    }}
                    style={{ padding: '8px 10px', borderRadius: 6 }}
                  />
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>Primary Text (Pełny polski MSL na „{pageName}”)</strong>
                  </span>
                  <span>
                    {(editPrimaryText.match(/\p{L}+/gu) || []).length} słów · {editPrimaryText.length} znaków
                  </span>
                </div>
                <textarea
                  rows={26}
                  value={editPrimaryText}
                  onChange={e => {
                    setEditPrimaryText(e.target.value);
                    setEditDirty(true);
                  }}
                  placeholder={
                    statuses[activeAngle.id] === 'generating'
                      ? 'Trwa pisanie pełnego polskiego Antka według zasad Mózgu Antków...'
                      : 'Kliknij „Wygeneruj ten Antek teraz” powyżej lub zaznacz pakiet po lewej stronie i uruchom serię.'
                  }
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 14,
                    lineHeight: 1.55,
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
                    padding: '10px 18px',
                    borderRadius: 8,
                    background: editDirty ? '#10b981' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: 0,
                    fontWeight: 700,
                    cursor: editDirty ? 'pointer' : 'not-allowed',
                  }}
                >
                  {savingEdit ? 'Zapisuję...' : '💾 Zapisz i uruchom audyt polszczyzny'}
                </button>

                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  Wszystkie wygenerowane teksty zapisują się automatycznie na Twoim koncie Szekspira.
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
            background: 'rgba(0,0,0,0.75)',
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
              background: '#161922',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: 24,
              maxWidth: 680,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Nowy kąt Antka PL</h2>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                style={{ background: 'transparent', border: 0, color: '#fff', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                <span>Tytuł kąta *</span>
                <input
                  required
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Np. Nauczycielka przedszkola zauważyła jak syn siada w literę W"
                />
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                <span>Kod roboczy (do nazwy reklamy)</span>
                <input
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  placeholder="np. siad_w_przedszkole"
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                <span>Segment</span>
                <select value={customSegment} onChange={e => setCustomSegment(e.target.value as AntkiPlSegment)}>
                  <option value="dzieci">Dzieci (Porady Mamy Gosi)</option>
                  <option value="dorosli">Dorośli (Haluksy / Ostroga / Zima)</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                <span>Etap lejka</span>
                <select value={customStage} onChange={e => setCustomStage(e.target.value as AntkiPlFunnelStage)}>
                  {Object.entries(stages).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                <span>Narratorka</span>
                <input value={customNarrator} onChange={e => setCustomNarrator(e.target.value)} />
              </label>
              <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                <span>Główna postać (dziecko / bliski)</span>
                <input value={customProtagonist} onChange={e => setCustomProtagonist(e.target.value)} />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              <span>Hook otwierający / Pierwsza scena *</span>
              <textarea
                required
                rows={3}
                value={customHook}
                onChange={e => setCustomHook(e.target.value)}
                placeholder="Opisz pierwsze 2-3 zdania lub sytuację otwierającą..."
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              <span>Rozwinięcie sceny i mechanizm</span>
              <textarea
                rows={3}
                value={customScene}
                onChange={e => setCustomScene(e.target.value)}
                placeholder="Co pokazał fizjoterapeuta/lekarz lub jaki test wykonano w domu..."
              />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              <span>Matematyka wcześniejszych wydatków (Failed Solutions)</span>
              <input value={customMath} onChange={e => setCustomMath(e.target.value)} />
            </label>

            <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
              <span>Most odkrycia (skąd dowiedziała się o Orthomax StepMax)</span>
              <input value={customBridge} onChange={e => setCustomBridge(e.target.value)} />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                style={{ padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
              >
                Anuluj
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: '#3864f5',
                  color: '#fff',
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
