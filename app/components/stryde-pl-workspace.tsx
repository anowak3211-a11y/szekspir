'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  STRYDE_ADVERTORIAL_URLS,
  STRYDE_FANPAGES,
  STRYDE_IMAGE_LIBRARY,
  STRYDE_LISTICLE_URL,
  STRYDE_PDP_URL,
  STRYDE_PRESET_ANGLES,
  STRYDE_PROBLEM_CLUSTER_LABELS,
  STRYDE_STAGES,
  buildAllStrydePrewrittenAds,
  type StrydeAnglePreset,
  type StrydeAwarenessStageId,
  type StrydeImageAsset,
  type StrydePlGeneratedAd,
  type StrydeProblemCluster,
  type StrydeSophisticationLevel,
} from '@/lib/stryde-pl';

interface StrydePlWorkspaceProps {
  onSwitchToFeliora?: () => void;
  onSwitchToOrthomax?: () => void;
}

const STAGE_ORDER: StrydeAwarenessStageId[] = [
  'stage1_mens_pride',
  'stage2_family_grandkids',
  'stage3_independence_fear',
  'stage4_medical_anger',
  'stage5_inolyo_stryde_direct',
];

export default function StrydePlWorkspace({
  onSwitchToFeliora,
  onSwitchToOrthomax,
}: StrydePlWorkspaceProps) {
  const [presets] = useState<StrydeAnglePreset[]>(STRYDE_PRESET_ANGLES);
  const [ads, setAds] = useState<StrydePlGeneratedAd[]>(() => buildAllStrydePrewrittenAds());
  const [imageLibrary, setImageLibrary] = useState<StrydeImageAsset[]>(STRYDE_IMAGE_LIBRARY);

  // Filters
  const [stageFilter, setStageFilter] = useState<'all' | StrydeAwarenessStageId>('all');
  const [sophFilter, setSophFilter] = useState<'all' | StrydeSophisticationLevel>('all');
  const [clusterFilter, setClusterFilter] = useState<'all' | StrydeProblemCluster>('all');
  const [fanpageFilter, setFanpageFilter] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active angle selection
  const [activeAngleId, setActiveAngleId] = useState<string>(STRYDE_PRESET_ANGLES[0]?.id || '');
  const [selectedAngleIds, setSelectedAngleIds] = useState<string[]>([]);

  // View mode for center column: 'reader' vs 'editor'
  const [viewMode, setViewMode] = useState<'reader' | 'editor'>('reader');
  const [showVocDetails, setShowVocDetails] = useState(true);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Editor state
  const [editHeadline, setEditHeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrimaryText, setEditPrimaryText] = useState('');
  const [editPageId, setEditPageId] = useState('');
  const [editDestinationUrl, setEditDestinationUrl] = useState(STRYDE_LISTICLE_URL);
  const [editDirty, setEditDirty] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Image picker modal & Fullscreen Lightbox state
  const [imagePickerSlot, setImagePickerSlot] = useState<'primary' | 'secondary' | null>(null);
  const [lightboxAsset, setLightboxAsset] = useState<StrydeImageAsset | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const customFileRef = useRef<HTMLInputElement | null>(null);

  // Toast / status
  const [notice, setNotice] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load persisted edits from API
  useEffect(() => {
    let cancelled = false;
    fetch('/api/stryde-pl')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data?.savedAds) && data.savedAds.length > 0) {
          setAds(data.savedAds);
        }
        if (Array.isArray(data?.imageLibrary) && data.imageLibrary.length > 0) {
          setImageLibrary(data.imageLibrary);
        }
      })
      .catch(() => {
        // Fallback to prewritten in-memory ads
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const adByAngleId = useMemo(() => {
    const map = new Map<string, StrydePlGeneratedAd>();
    for (const ad of ads) {
      map.set(ad.angleId, ad);
    }
    return map;
  }, [ads]);

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return presets.filter(p => {
      if (stageFilter !== 'all' && p.stageId !== stageFilter) return false;
      if (sophFilter !== 'all' && p.sophisticationLevel !== sophFilter) return false;
      if (clusterFilter !== 'all' && p.problemCluster !== clusterFilter) return false;
      if (fanpageFilter !== 'all' && p.recommendedFanpageId !== fanpageFilter) return false;
      if (q) {
        const ad = adByAngleId.get(p.id);
        const hay = `${p.code} ${p.title} ${p.shortTitle} ${p.problemLabel} ${p.vocTrigger} ${
          ad?.headline || ''
        } ${ad?.primaryText || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [presets, stageFilter, sophFilter, clusterFilter, fanpageFilter, searchQuery, adByAngleId]);

  const groupedByStage = useMemo(() => {
    return STAGE_ORDER.map(stKey => ({
      stageKey: stKey,
      stageMeta: STRYDE_STAGES[stKey],
      items: filteredPresets.filter(p => p.stageId === stKey),
    })).filter(g => g.items.length > 0);
  }, [filteredPresets]);

  const activePreset = useMemo(
    () => presets.find(p => p.id === activeAngleId) || filteredPresets[0] || presets[0],
    [presets, activeAngleId, filteredPresets],
  );

  const activeAd = useMemo(
    () => (activePreset ? adByAngleId.get(activePreset.id) : undefined),
    [activePreset, adByAngleId],
  );

  useEffect(() => {
    if (!activeAd || !activePreset) return;
    setEditHeadline(activeAd.headline);
    setEditDescription(activeAd.description);
    setEditPrimaryText(activeAd.primaryText);
    setEditPageId(activeAd.pageId || activePreset.recommendedFanpageId);
    setEditDestinationUrl(
      activeAd.destinationUrl || activePreset.defaultDestinationUrl || STRYDE_LISTICLE_URL,
    );
    setEditDirty(false);
  }, [activeAd, activePreset]);

  const showToast = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice(prev => (prev === msg ? '' : prev));
    }, 4500);
  }, []);

  const handleCopy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`Skopiowano: ${label}`);
      } catch {
        setError('Nie udało się skopiować do schowka.');
      }
    },
    [showToast],
  );

  const handleSaveAd = useCallback(async () => {
    if (!activeAd || !activePreset) return;
    setSavingEdit(true);
    setError('');
    try {
      const fanpage = STRYDE_FANPAGES.find(f => f.id === editPageId) || STRYDE_FANPAGES[0];
      const payloadAd: StrydePlGeneratedAd = {
        ...activeAd,
        headline: editHeadline,
        description: editDescription,
        primaryText: editPrimaryText,
        pageId: fanpage.id,
        pageName: fanpage.name,
        destinationUrl: editDestinationUrl,
      };
      const res = await fetch('/api/stryde-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', ad: payloadAd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu.');
      if (Array.isArray(data.savedAds)) {
        setAds(data.savedAds);
      }
      setEditDirty(false);
      showToast(`Zapisano zmiany w kącie #${activePreset.number} (${activePreset.code}).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu.');
    } finally {
      setSavingEdit(false);
    }
  }, [activeAd, activePreset, editHeadline, editDescription, editPrimaryText, editPageId, editDestinationUrl, showToast]);

  const handleAssignImage = useCallback(
    async (asset: StrydeImageAsset, slot: 'primary' | 'secondary') => {
      if (!activePreset) return;
      try {
        const res = await fetch('/api/stryde-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'set_image',
            angleId: activePreset.id,
            ...(slot === 'primary'
              ? { imageUrl: asset.url, imageHash: asset.imageHash }
              : { secondImageUrl: asset.url, secondImageHash: asset.imageHash }),
          }),
        });
        const data = await res.json();
        if (Array.isArray(data.savedAds)) {
          setAds(data.savedAds);
        }
        setImagePickerSlot(null);
        showToast(
          `Przypisano grafikę „${asset.label}” jako ${slot === 'primary' ? 'Kreację A' : 'Kreację B'}.`,
        );
      } catch {
        setError('Błąd przypisywania grafiki.');
      }
    },
    [activePreset, showToast],
  );

  const openLightboxForUrl = useCallback(
    (url: string, fallbackLabel: string) => {
      const found = imageLibrary.find(img => img.url === url);
      if (found) {
        setLightboxAsset(found);
      } else {
        setLightboxAsset({
          id: 'preview-custom',
          url,
          imageHash: '',
          label: fallbackLabel,
          adsetOrigin: 'Orthevia PL',
          adOrigin: fallbackLabel,
          aspectRatio: '1:1',
        });
      }
    },
    [imageLibrary],
  );

  useEffect(() => {
    if (!lightboxAsset) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxAsset(null);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const idx = imageLibrary.findIndex(img => img.url === lightboxAsset.url);
        if (idx !== -1 && imageLibrary.length > 0) {
          const nextIdx =
            e.key === 'ArrowRight'
              ? (idx + 1) % imageLibrary.length
              : (idx - 1 + imageLibrary.length) % imageLibrary.length;
          setLightboxAsset(imageLibrary[nextIdx]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxAsset, imageLibrary]);

  const handleUploadCustomImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activePreset) return;
      setUploadingImage(true);
      setError('');
      try {
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
          reader.readAsDataURL(file);
        });
        const res = await fetch('/api/stryde-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload_custom_image',
            angleId: activePreset.id,
            dataUrl,
            fileName: file.name,
            label: file.name,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Błąd wgrywania obrazu');
        if (Array.isArray(data.imageLibrary)) setImageLibrary(data.imageLibrary);
        if (Array.isArray(data.savedAds)) setAds(data.savedAds);
        showToast(`Wgrano grafikę do biblioteki Opaska PL!`);
        setImagePickerSlot(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd wgrywania pliku');
      } finally {
        setUploadingImage(false);
        if (customFileRef.current) customFileRef.current.value = '';
      }
    },
    [activePreset, showToast],
  );

  const [generatingKie5, setGeneratingKie5] = useState(false);

  const handleGenerate5KieImages = useCallback(async () => {
    if (!activePreset || !activeAd) return;
    setGeneratingKie5(true);
    setError('');
    setNotice(`Wysyłam 8 scen (4x Hook + 3x Wzór Noom.pl + 1x Produkt) do Kie.ai dla kąta #${activePreset.number}...`);
    try {
      const res = await fetch('/api/stryde-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_5_kie_images',
          angleId: activePreset.id,
          primaryText: editPrimaryText || activeAd.primaryText,
          headline: editHeadline || activeAd.headline,
          title: activePreset.title,
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.tasks)) {
        throw new Error(data.error || 'Błąd uruchamiania 8 zadań Kie.ai.');
      }
      const tasks = data.tasks as Array<{ taskId: string; label: string; prompt: string }>;
      setNotice(`Kie.ai generuje ${tasks.length} zdjęć (4x Hook + 3x Wzór Noom.pl + 1x Produkt) dla kąta #${activePreset.number} (~20-40s)...`);
      await Promise.all(
        tasks.map(async t => {
          for (let attempt = 0; attempt < 40; attempt++) {
            await new Promise(r => setTimeout(r, 3500));
            const pollRes = await fetch('/api/stryde-pl', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'poll_kie_image',
                taskId: t.taskId,
                angleId: activePreset.id,
                label: t.label,
                prompt: t.prompt,
              }),
            });
            const pollData = await pollRes.json();
            if (pollData.state === 'success' && pollData.asset) {
              if (Array.isArray(pollData.imageLibrary)) {
                setImageLibrary(pollData.imageLibrary);
              }
              break;
            }
            if (pollData.state === 'fail') break;
          }
        }),
      );
      showToast(`Wygenerowano ${tasks.length} zdjęć (4x Hook + 3x Wzór Noom.pl + 1x Produkt) dla kąta #${activePreset.number}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd generowania 8 zdjęć w Kie.ai.');
    } finally {
      setGeneratingKie5(false);
    }
  }, [activePreset, activeAd, editPrimaryText, editHeadline, showToast]);

  const handleToggleSelectAngle = useCallback((id: string) => {
    setSelectedAngleIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const handleSelectAllFiltered = useCallback(() => {
    const filteredIds = filteredPresets.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedAngleIds.includes(id));
    if (allSelected) {
      setSelectedAngleIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedAngleIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  }, [filteredPresets, selectedAngleIds]);

  const activeStageMeta = activePreset ? STRYDE_STAGES[activePreset.stageId] : null;
  const activeFanpage = useMemo(
    () => STRYDE_FANPAGES.find(f => f.id === editPageId) || STRYDE_FANPAGES[0],
    [editPageId],
  );

  const paragraphs = useMemo(() => {
    return (editPrimaryText || '')
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);
  }, [editPrimaryText]);

  const liveWordCount = useMemo(() => {
    return (editPrimaryText || '').trim().split(/\s+/).filter(Boolean).length;
  }, [editPrimaryText]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#f4f4f5',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOP BAR: BRAND SWITCHER (PURE BLACK THEME) */}
      <header
        style={{
          background: '#050507',
          borderBottom: '1px solid #27272a',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              color: '#e4e4e7',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#111114',
              border: '1px solid #27272a',
            }}
          >
            ← Szekspir Home
          </a>

          <div
            style={{
              display: 'inline-flex',
              background: '#09090b',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid #27272a',
              gap: '4px',
            }}
          >
            <button
              type="button"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '7px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
              }}
            >
              🦿 OPASKA PL · Stryde 1:1 (15 Antków · Czarny Motyw)
            </button>

            {onSwitchToFeliora && (
              <button
                type="button"
                onClick={onSwitchToFeliora}
                style={{
                  background: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🐾 FELIORA PL · Koty (25 Antków)
              </button>
            )}

            {onSwitchToOrthomax && (
              <button
                type="button"
                onClick={onSwitchToOrthomax}
                style={{
                  background: 'transparent',
                  color: '#a1a1aa',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🦶 ORTHOMAX PL · StepMax (70 Antków)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMatrixModal(true)}
            style={{
              background: '#111114',
              color: '#34d399',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '7px 13px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📊 Matryca Lokalizacji PL & Przewaga vs Ankole.pl
          </button>
        </div>

        {/* LOCALIZATION & ADVERTORIAL BADGE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#111114',
            border: '1px solid #27272a',
            borderRadius: '10px',
            padding: '7px 14px',
            fontSize: '12.5px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🇵🇱</span>
          <div>
            <strong style={{ color: '#34d399' }}>100% POLSKA LOKALIZACJA 1:1 (UK/FR → PL):</strong>{' '}
            <span style={{ color: '#e4e4e7' }}>
              Nietknięte kąty z <strong>Not Done Yet</strong>, <strong>The Knee Diary</strong> i{' '}
              <strong>Inolyo (820k reach)</strong> + <strong>4 Advertoriale</strong>
            </span>
          </div>
        </div>
      </header>

      {/* NOTIFICATION / ERROR BANNERS */}
      {(notice || error) && (
        <div
          style={{
            padding: '10px 20px',
            background: error ? '#7f1d1d' : '#065f46',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error || notice}</span>
          <button
            type="button"
            onClick={() => {
              setError('');
              setNotice('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* FILTER BAR: 5 GROUPS + CLUSTER + FANPAGE + SEARCH */}
      <section
        style={{
          background: '#09090b',
          borderBottom: '1px solid #27272a',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* ROW 1: 5 GROUP PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Kategoria Kątów 1:1:
          </span>

          <button
            type="button"
            onClick={() => setStageFilter('all')}
            style={{
              padding: '7px 13px',
              borderRadius: '8px',
              border: stageFilter === 'all' ? '1px solid #10b981' : '1px solid #27272a',
              background:
                stageFilter === 'all'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#111114',
              color: stageFilter === 'all' ? '#ffffff' : '#d4d4d8',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Wszystkie (15)
          </button>

          {STAGE_ORDER.map(stKey => {
            const st = STRYDE_STAGES[stKey];
            const active = stageFilter === stKey;
            const countInGroup = presets.filter(p => p.stageId === stKey).length;
            return (
              <button
                key={stKey}
                type="button"
                onClick={() => {
                  setStageFilter(stKey);
                  const firstInStage = presets.find(p => p.stageId === stKey);
                  if (firstInStage) setActiveAngleId(firstInStage.id);
                }}
                style={{
                  padding: '7px 13px',
                  borderRadius: '8px',
                  border: active ? `1px solid ${st.color}` : '1px solid #27272a',
                  background: active ? `${st.color}28` : '#111114',
                  color: active ? '#ffffff' : '#d4d4d8',
                  fontSize: '12.5px',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: st.color,
                    display: 'inline-block',
                  }}
                />
                <span>{st.shortLabel}</span>
                <span style={{ color: '#a1a1aa', fontSize: '11px' }}>({countInGroup})</span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: SECONDARY FILTERS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={clusterFilter}
            onChange={e => setClusterFilter(e.target.value as 'all' | StrydeProblemCluster)}
            style={{
              background: '#111114',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">🦿 Wszystkie Klastry Psychologiczne (7 klastrów)</option>
            {Object.entries(STRYDE_PROBLEM_CLUSTER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <select
            value={fanpageFilter}
            onChange={e => setFanpageFilter(e.target.value)}
            style={{
              background: '#111114',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">📣 Wszystkie Fanpage (3 profile)</option>
            {STRYDE_FANPAGES.map(fp => (
              <option key={fp.id} value={fp.id}>
                {fp.name} ({fp.role})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Szukaj imienia (Tadeusz, Zosia, Darek, Oskarek, Gienek), schodów, wózka, Otodom..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: '1 1 240px',
              background: '#111114',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              borderRadius: '7px',
              padding: '6px 12px',
              fontSize: '12.5px',
            }}
          />

          {(stageFilter !== 'all' ||
            sophFilter !== 'all' ||
            clusterFilter !== 'all' ||
            fanpageFilter !== 'all' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStageFilter('all');
                setSophFilter('all');
                setClusterFilter('all');
                setFanpageFilter('all');
                setSearchQuery('');
              }}
              style={{
                background: '#18181b',
                color: '#e4e4e7',
                border: '1px solid #3f3f46',
                borderRadius: '7px',
                padding: '6px 11px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Resetuj filtry
            </button>
          )}
        </div>
      </section>

      {/* MAIN 3-COLUMN WORKSPACE (PURE BLACK BACKGROUND) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px minmax(440px, 650px) minmax(460px, 1fr)',
          flex: 1,
          minHeight: 'calc(100vh - 135px)',
          overflow: 'hidden',
          background: '#000000',
        }}
      >
        {/* LEFT COLUMN: LIST OF 15 POLISH-LOCALIZED ANGLES */}
        <aside
          style={{
            borderRight: '1px solid #27272a',
            background: '#050507',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 135px)',
            overflowY: 'auto',
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #27272a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#09090b',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f4f4f5' }}>
              ANTKI 1:1 ({filteredPresets.length} / 15)
            </span>
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              style={{
                background: '#18181b',
                color: '#34d399',
                border: '1px solid #27272a',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {selectedAngleIds.length > 0
                ? `Zaznaczono (${selectedAngleIds.length})`
                : 'Zaznacz wszystkie'}
            </button>
          </div>

          {/* Grouped Angles List */}
          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {groupedByStage.map(({ stageKey, stageMeta, items }) => (
              <div key={stageKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Stage Group Banner */}
                <div
                  style={{
                    padding: '6px 9px',
                    borderRadius: '7px',
                    background: '#111114',
                    borderLeft: `4px solid ${stageMeta.color}`,
                    borderTop: '1px solid #27272a',
                    borderRight: '1px solid #27272a',
                    borderBottom: '1px solid #27272a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#f4f4f5',
                        textTransform: 'uppercase',
                      }}
                    >
                      {stageMeta.shortLabel}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#a1a1aa',
                        background: '#18181b',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      1:1 PL
                    </span>
                  </div>
                </div>

                {/* Angle Cards inside Stage */}
                {items.map(preset => {
                  const ad = adByAngleId.get(preset.id);
                  const isActive = preset.id === activePreset?.id;
                  const isSelected = selectedAngleIds.includes(preset.id);
                  const clusterInfo = STRYDE_PROBLEM_CLUSTER_LABELS[preset.problemCluster];

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setActiveAngleId(preset.id)}
                      style={{
                        padding: '10px 11px',
                        borderRadius: '9px',
                        background: isActive ? '#141418' : '#09090b',
                        border: isActive ? '2px solid #10b981' : '1px solid #27272a',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      {/* Top row: Checkbox + Number + Source Badge + Word Count */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              e.stopPropagation();
                              handleToggleSelectAngle(preset.id);
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{ cursor: 'pointer', width: '13px', height: '13px' }}
                          />
                          <span
                            style={{
                              background: stageMeta.color,
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '10.5px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            #{String(preset.number).padStart(2, '0')}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#d4d4d8',
                              background: '#18181b',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid #27272a',
                            }}
                          >
                            {preset.sophisticationBadge}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: '#34d399',
                          }}
                        >
                          {ad?.wordCount || 1200} sł. ✓
                        </span>
                      </div>

                      {/* Title */}
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: isActive ? '#ffffff' : '#e4e4e7',
                          lineHeight: 1.32,
                        }}
                      >
                        {preset.title}
                      </div>

                      {/* Subtitle / Polish Localization Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#e4e4e7',
                            background: `${clusterInfo.color}22`,
                            border: `1px solid ${clusterInfo.color}55`,
                            padding: '1px 5px',
                            borderRadius: '4px',
                          }}
                        >
                          {preset.problemLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER COLUMN: READER & EDITOR ON PURE BLACK CANVAS */}
        <main
          style={{
            background: '#000000',
            height: 'calc(100vh - 135px)',
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {activePreset && activeAd && (
            <>
              {/* STICKY CONTROL BAR */}
              <div
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 15,
                }}
              >
                {/* Row 1: Angle badge + Title + VoC toggle + Copy/Edit buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        background: activeStageMeta?.color || '#10b981',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '11px',
                        padding: '3px 7px',
                        borderRadius: '5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      #{String(activePreset.number).padStart(2, '0')} · {activePreset.code}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={activePreset.title}
                    >
                      {activePreset.shortTitle}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowVocDetails(v => !v)}
                      style={{
                        background: '#18181b',
                        color: '#34d399',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {showVocDetails ? '▲ Ukryj Lokalizację PL' : '▼ Pokaż Lokalizację PL'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'reader' ? 'editor' : 'reader')}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: '1px solid #27272a',
                        background: viewMode === 'editor' ? '#2563eb' : '#18181b',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {viewMode === 'reader' ? '✏️ Edytuj' : '📖 Czytaj'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(editPrimaryText, `Tekst #${activePreset.number}`)}
                      style={{
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      📋 Kopiuj ({liveWordCount} sł.)
                    </button>

                    {editDirty && (
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={handleSaveAd}
                        style={{
                          background: '#f59e0b',
                          color: '#09090b',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {savingEdit ? '...' : '💾 Zapisz'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Headline Input + 4 Advertorials / PDP Quick Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: '#a1a1aa',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Nagłówek FB:
                    </span>
                    <input
                      type="text"
                      value={editHeadline}
                      onChange={e => {
                        setEditHeadline(e.target.value);
                        setEditDirty(true);
                      }}
                      style={{
                        width: '100%',
                        background: '#111114',
                        color: '#ffffff',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        padding: '5px 8px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(editHeadline, 'Nagłówek FB')}
                      style={{
                        background: '#18181b',
                        color: '#e4e4e7',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        padding: '5px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Kopiuj HL
                    </button>
                  </div>

                  {/* Quick Selector for the 4 Polish Advertorials + PDP */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: '#a1a1aa',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Docelowy LP:
                    </span>
                    {STRYDE_ADVERTORIAL_URLS.map(item => {
                      const isCurrent = editDestinationUrl === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setEditDestinationUrl(item.url);
                            setEditDirty(true);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: isCurrent ? '1px solid #10b981' : '1px solid #27272a',
                            background: isCurrent ? 'rgba(16, 185, 129, 0.18)' : '#111114',
                            color: isCurrent ? '#34d399' : '#a1a1aa',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {item.shortLabel}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleCopy(editDestinationUrl, 'Docelowy URL')}
                      style={{
                        background: '#18181b',
                        color: '#38bdf8',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔗 Kopiuj URL
                    </button>
                  </div>
                </div>

                {/* Collapsible Polish Localization & Hook Details */}
                {showVocDetails && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      paddingTop: '6px',
                      borderTop: '1px solid #27272a',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ color: '#d4d4d8' }}>
                      <strong style={{ color: '#34d399' }}>🇵🇱 Polska Lokalizacja (Bohaterowie & Realia):</strong>{' '}
                      {activePreset.vocTrigger}
                    </div>
                    <div style={{ color: '#d4d4d8' }}>
                      <strong style={{ color: '#38bdf8' }}>🧬 Mechanizm Biomechaniczny:</strong>{' '}
                      {activePreset.mechanismCore}
                    </div>
                    <div
                      style={{
                        background: '#141418',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#fef08a',
                        fontWeight: 600,
                      }}
                    >
                      ⚡ Hook otwierający: {paragraphs[0] || ''}
                    </div>
                  </div>
                )}
              </div>

              {/* BODY: DARK READER OR FULL TEXTAREA EDITOR */}
              {viewMode === 'reader' ? (
                <article
                  style={{
                    background: '#09090b',
                    color: '#f4f4f5',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    border: '1px solid #27272a',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #27272a',
                      paddingBottom: '10px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: activeFanpage.badgeColor || '#10b981',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '12px',
                        }}
                      >
                        {activeFanpage.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>
                          {activeFanpage.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                          Sponsorowane · {activePreset.sophisticationBadge} · {editDestinationUrl.replace('https://r0fgvk-0t.myshopify.com', '')}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        background: '#18181b',
                        color: '#34d399',
                        border: '1px solid #27272a',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {paragraphs.length} akapitów · {liveWordCount} słów
                    </span>
                  </div>

                  {/* Crisp Paragraphs on Dark/Black Reader */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                    {paragraphs.map((para, idx) => (
                      <p
                        key={idx}
                        style={{
                          margin: 0,
                          fontSize: '15px',
                          lineHeight: 1.65,
                          color: idx === 0 ? '#ffffff' : '#e4e4e7',
                          fontWeight: idx === 0 ? 700 : 400,
                          background: idx === 0 ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                          borderLeft: idx === 0 ? '3px solid #10b981' : 'none',
                          padding: idx === 0 ? '8px 12px' : 0,
                          borderRadius: idx === 0 ? '6px' : 0,
                        }}
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </article>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    value={editPrimaryText}
                    onChange={e => {
                      setEditPrimaryText(e.target.value);
                      setEditDirty(true);
                    }}
                    rows={32}
                    style={{
                      width: '100%',
                      background: '#09090b',
                      color: '#f4f4f5',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      padding: '18px',
                      fontSize: '14.5px',
                      lineHeight: 1.6,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* RIGHT COLUMN: CREATIVE A/B + GALLERY + FB PREVIEW ON PURE BLACK */}
        <aside
          style={{
            borderLeft: '1px solid #27272a',
            background: '#050507',
            height: 'calc(100vh - 135px)',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {activeAd && activePreset && (
            <div
              style={{
                background: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#f4f4f5', textTransform: 'uppercase' }}>
                  🖼️ Kreacje do Kąta #{activePreset.number} (Kliknij = Powiększ 🔍)
                </span>
                <button
                  type="button"
                  onClick={() => customFileRef.current?.click()}
                  disabled={uploadingImage}
                  style={{
                    background: '#18181b',
                    color: '#34d399',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {uploadingImage ? 'Wgrywanie...' : '+ Wgraj własne'}
                </button>
                <input
                  ref={customFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCustomImage}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate5KieImages}
                disabled={generatingKie5}
                style={{
                  width: '100%',
                  background: generatingKie5
                    ? '#18181b'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: '1px solid #34d399',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: generatingKie5 ? 'wait' : 'pointer',
                  textAlign: 'center',
                }}
              >
                {generatingKie5
                  ? '⏳ Generuję 8 zdjęć (4x Hook + 3x Wzór Noom.pl + 1x Produkt) w Kie.ai...'
                  : '📸 Generuj 8 zdjęć pod ten kąt: 4x Hook + 3x Wzór Noom.pl + 1x Produkt (Kie.ai)'}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Primary Image (Kreacja A) */}
                <div
                  style={{
                    background: '#111114',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#34d399' }}>Kreacja A (Główna)</span>
                    <button
                      type="button"
                      onClick={() => openLightboxForUrl(activeAd.imageUrl, `Kreacja A · Kąt #${activePreset.number}`)}
                      style={{
                        background: '#18181b',
                        color: '#34d399',
                        border: '1px solid #27272a',
                        borderRadius: '5px',
                        padding: '2px 7px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔍 Powiększ
                    </button>
                  </div>
                  <div
                    onClick={() => openLightboxForUrl(activeAd.imageUrl, `Kreacja A · Kąt #${activePreset.number}`)}
                    style={{ position: 'relative', cursor: 'zoom-in' }}
                  >
                    <img
                      src={activeAd.imageUrl}
                      alt="Kreacja A"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        background: '#000',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>

                {/* Secondary Image (Kreacja B) */}
                <div
                  style={{
                    background: '#111114',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#38bdf8' }}>Kreacja B (Split A/B)</span>
                    <button
                      type="button"
                      onClick={() =>
                        openLightboxForUrl(
                          activeAd.secondImageUrl || activeAd.imageUrl,
                          `Kreacja B · Kąt #${activePreset.number}`,
                        )
                      }
                      style={{
                        background: '#18181b',
                        color: '#38bdf8',
                        border: '1px solid #27272a',
                        borderRadius: '5px',
                        padding: '2px 7px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔍 Powiększ
                    </button>
                  </div>
                  <div
                    onClick={() =>
                      openLightboxForUrl(
                        activeAd.secondImageUrl || activeAd.imageUrl,
                        `Kreacja B · Kąt #${activePreset.number}`,
                      )
                    }
                    style={{ position: 'relative', cursor: 'zoom-in' }}
                  >
                    <img
                      src={activeAd.secondImageUrl || activeAd.imageUrl}
                      alt="Kreacja B"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        background: '#000',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ANGLE-SPECIFIC GENERATED PHOTOS (4x HOOK + 3x WZÓR NOOM + 1x PRODUKT) */}
              {imageLibrary.some(img => img.angleId === activePreset.id) && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid #10b981',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#34d399' }}>
                    ✨ Nowo wygenerowane specjalnie do Kąta #{activePreset.number} (4x Hook + 3x Wzór Noom.pl + 1x Produkt ·{' '}
                    {imageLibrary.filter(img => img.angleId === activePreset.id).length} szt.):
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {imageLibrary
                      .filter(img => img.angleId === activePreset.id)
                      .map(img => {
                        const isA = activeAd.imageUrl === img.url;
                        const isB = activeAd.secondImageUrl === img.url;
                        return (
                          <div
                            key={`angle-${img.id}`}
                            style={{
                              position: 'relative',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: '#09090b',
                              border: isA
                                ? '2px solid #10b981'
                                : isB
                                ? '2px solid #38bdf8'
                                : '1px solid #27272a',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <div
                              onClick={() => setLightboxAsset(img)}
                              title={img.label}
                              style={{ position: 'relative', cursor: 'zoom-in' }}
                            >
                              <img
                                src={img.url}
                                alt={img.label}
                                style={{
                                  width: '100%',
                                  aspectRatio: '1 / 1',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            </div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                borderTop: '1px solid #27272a',
                                background: '#09090b',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleAssignImage(img, 'primary')}
                                style={{
                                  background: isA ? '#10b981' : 'transparent',
                                  color: isA ? '#ffffff' : '#34d399',
                                  border: 'none',
                                  borderRight: '1px solid #27272a',
                                  padding: '5px 4px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Ustaw A
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignImage(img, 'secondary')}
                                style={{
                                  background: isB ? '#0284c7' : 'transparent',
                                  color: isB ? '#ffffff' : '#38bdf8',
                                  border: 'none',
                                  padding: '5px 4px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Ustaw B
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* GALLERY OF 15 STRYDE / UGC PHOTOS */}
              <div
                style={{
                  background: '#111114',
                  border: '1px solid #27272a',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#e4e4e7' }}>
                  📸 Biblioteka Kreacji Opaska PL ({imageLibrary.length} szt.):
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '10px',
                  }}
                >
                  {imageLibrary.map(img => {
                    const isA = activeAd.imageUrl === img.url;
                    const isB = activeAd.secondImageUrl === img.url;
                    return (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#09090b',
                          border: isA
                            ? '2px solid #10b981'
                            : isB
                            ? '2px solid #38bdf8'
                            : '1px solid #27272a',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          onClick={() => setLightboxAsset(img)}
                          title={img.label}
                          style={{ position: 'relative', cursor: 'zoom-in' }}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            style={{
                              width: '100%',
                              aspectRatio: '1 / 1',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          {(isA || isB) && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: isA ? '#10b981' : '#0284c7',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              {isA ? 'A' : 'B'}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            borderTop: '1px solid #27272a',
                            background: '#09090b',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleAssignImage(img, 'primary')}
                            style={{
                              background: isA ? '#10b981' : 'transparent',
                              color: isA ? '#ffffff' : '#34d399',
                              border: 'none',
                              borderRight: '1px solid #27272a',
                              padding: '5px 4px',
                              fontSize: '10.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Ustaw A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAssignImage(img, 'secondary')}
                            style={{
                              background: isB ? '#0284c7' : 'transparent',
                              color: isB ? '#ffffff' : '#38bdf8',
                              border: 'none',
                              padding: '5px 4px',
                              fontSize: '10.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Ustaw B
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* REALISTIC FACEBOOK FEED AD PREVIEW */}
          {activeAd && (
            <div
              style={{
                background: '#111114',
                color: '#f4f4f5',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #27272a',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: activeFanpage.badgeColor || '#10b981',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  {activeFanpage.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#ffffff' }}>
                    {activeFanpage.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#a1a1aa' }}>Sponsorowane · 🌍</div>
                </div>
              </div>

              <div
                style={{
                  padding: '0 12px 10px 12px',
                  fontSize: '13.5px',
                  lineHeight: 1.45,
                  color: '#e4e4e7',
                  whiteSpace: 'pre-line',
                }}
              >
                {paragraphs.slice(0, 2).join('\n\n')}
                <span style={{ color: '#34d399', fontWeight: 600 }}> ... Zobacz więcej</span>
              </div>

              <img
                src={activeAd.imageUrl}
                alt={editHeadline}
                onClick={() => openLightboxForUrl(activeAd.imageUrl, editHeadline)}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  display: 'block',
                  cursor: 'zoom-in',
                }}
              />

              <div
                style={{
                  padding: '10px 12px',
                  background: '#18181b',
                  borderTop: '1px solid #27272a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '10.5px', color: '#a1a1aa', textTransform: 'uppercase' }}>
                    STRYDE.PL · 60 DNI GWARANCJI
                  </div>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 800,
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {editHeadline}
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#a1a1aa',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {editDescription}
                  </div>
                </div>
                <a
                  href={editDestinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#27272a',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Więcej informacji
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '760px',
              width: '100%',
              background: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                {lightboxAsset.label}
              </span>
              <button
                type="button"
                onClick={() => setLightboxAsset(null)}
                style={{
                  background: '#18181b',
                  color: '#ffffff',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕ Zamknij (ESC)
              </button>
            </div>
            <img
              src={lightboxAsset.url}
              alt={lightboxAsset.label}
              style={{
                width: '100%',
                maxHeight: '72vh',
                objectFit: 'contain',
                borderRadius: '10px',
                background: '#000000',
              }}
            />
          </div>
        </div>
      )}

      {/* MATRIX MODAL: POLISH LOCALIZATION & ANKOLE GAP ANALYSIS */}
      {showMatrixModal && (
        <div
          onClick={() => setShowMatrixModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '920px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '14px',
              padding: '24px',
              color: '#f4f4f5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                🇵🇱 Matryca Lokalizacji 1:1 (UK/FR → PL) & Przewaga nad Ankole.pl
              </h2>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                style={{
                  background: '#18181b',
                  color: '#fff',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕ Zamknij
              </button>
            </div>
            <p style={{ fontSize: '13.5px', color: '#d4d4d8', lineHeight: 1.6 }}>
              Wszystkie 15 kątów w tej zakładce to nietknięte przez <strong>Ankole.pl</strong> reklamy 1:1 z brytyjskich profili satelickich{' '}
              <strong>Not Done Yet</strong>, <strong>The Knee Diary</strong> oraz francuskiego <strong>Inolyo.com</strong>, zaadaptowane w 100% do polskich realiów:
            </p>
            <ul style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: 1.7 }}>
              <li><strong>#01 Brukarz Tadeusz (64 l.) i żona Zosia (52 l.):</strong> 30 lat na kolanach przy kostce brukowej, pomocnik Łukasz i 70-letni Gienek ze składu budowlanego.</li>
              <li><strong>#02 Glazurnik Darek (63 l.) i żona Karolina:</strong> 131 nocy w fotelu w salonie, 14 stopni na piętro, wnuczka Maja (5 l.) i kolega Marek na działce.</li>
              <li><strong>#03 Instalator Staszek (72 l.) i 78-letni brat Edek:</strong> zatkana rynna nad wykuszem, żona Halinka dzwoni po starszego brata po zawale.</li>
              <li><strong>#04 Babcia Zuzanna (66 l.) i 4-letni Oskarek:</strong> wielkanocny obiad, wnuk kopiuje utykanie babci i pyta o „kulawe kolanko”.</li>
              <li><strong>#05 Babcia Krystyna (68 l.) vs druga babcia Dorota (64 l.):</strong> wnuki Iga i Leoś wolą piątki u drugiej babci, która biega z nimi w parku.</li>
              <li><strong>#06 Barbara (69 l.) na wyjeździe w Kołobrzegu:</strong> córka Magda rezerwuje skuter inwalidzki na nazwisko mamy, a 71-letnia swatowa Karolina chodzi po klifach.</li>
              <li><strong>#07 Kadrowa Julia (34 l.) i pani Gosia (61 l.):</strong> 22 minuty utknięcia na niskiej toalecie w biurze i wycofana rezygnacja z pracy.</li>
              <li><strong>#08 Wdowa Janina (71 l.) i linki z Otodom:</strong> 41 lat w domu z dębową poręczą zmarłego męża Alka, agent nieruchomości i 79-letnia pani Irena.</li>
              <li><strong>#09 Laura (67 l.) i czwartkowe dancingi:</strong> mąż Krzysiek odchodzi po 44 latach do 72-letniej wdowy Sylwii, spotkanie przy umywalce.</li>
              <li><strong>#10–#11 Gniew na kliniki i ortezy (Janina 61 l. & kolejarz Bronisław 71 l.):</strong> 6 000 zł w prywatnych gabinetach i sztywna orteza za 1 600 zł w szafie kontra pasek pod rzepką.</li>
              <li><strong>#12–#15 Krótkie kąty Inolyo FR & Stryde BOF:</strong> „To NIE chrząstka (-34% napięcia)”, „Nie zjeżdża na łydkę”, „Przetrwać kolejkę na NFZ” i „Oryginał z rdzeniem 8 mm vs miękkie podróbki”.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
