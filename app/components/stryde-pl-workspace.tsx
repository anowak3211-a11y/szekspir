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
  const [presets, setPresets] = useState<StrydeAnglePreset[]>(STRYDE_PRESET_ANGLES);
  const [ads, setAds] = useState<StrydePlGeneratedAd[]>(() => buildAllStrydePrewrittenAds());
  const [imageLibrary, setImageLibrary] = useState<StrydeImageAsset[]>(STRYDE_IMAGE_LIBRARY);

  // Filters
  const [stageFilter, setStageFilter] = useState<'all' | 'new10' | StrydeAwarenessStageId>('all');
  const [sophFilter, setSophFilter] = useState<'all' | StrydeSophisticationLevel>('all');
  const [clusterFilter, setClusterFilter] = useState<'all' | StrydeProblemCluster>('all');
  const [fanpageFilter, setFanpageFilter] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active angle selection
  const [activeAngleId, setActiveAngleId] = useState<string>(STRYDE_PRESET_ANGLES[0]?.id || '');
  const [selectedAngleIds, setSelectedAngleIds] = useState<string[]>([]);

  // View mode for center column: 'reader' vs 'editor'
  const [viewMode, setViewMode] = useState<'reader' | 'editor'>('reader');
  const [showVocDetails, setShowVocDetails] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const centerColumnRef = useRef<HTMLElement | null>(null);

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

  const STRYDE_LOCAL_IMAGES_KEY = 'stryde_pl_saved_images_v3';

  const applyLocalImageOverrides = useCallback((list: StrydePlGeneratedAd[]): StrydePlGeneratedAd[] => {
    try {
      if (typeof window === 'undefined') return list;
      const raw = window.localStorage.getItem(STRYDE_LOCAL_IMAGES_KEY);
      if (!raw) return list;
      const localMap = JSON.parse(raw) as Record<
        string,
        {
          imageUrl?: string;
          imageHash?: string;
          secondImageUrl?: string;
          secondImageHash?: string;
          updatedAt?: number;
        }
      >;
      return list.map(ad => {
        const loc = localMap[ad.angleId];
        if (!loc) return ad;
        return {
          ...ad,
          ...(loc.imageUrl ? { imageUrl: loc.imageUrl, imageHash: loc.imageHash || ad.imageHash } : {}),
          ...(loc.secondImageUrl
            ? { secondImageUrl: loc.secondImageUrl, secondImageHash: loc.secondImageHash || ad.secondImageHash }
            : {}),
          updatedAt: Math.max(ad.updatedAt || 0, loc.updatedAt || 0),
        };
      });
    } catch {
      return list;
    }
  }, []);

  const persistLocalImageOverride = useCallback(
    (
      angleId: string,
      patch: {
        imageUrl?: string;
        imageHash?: string;
        secondImageUrl?: string;
        secondImageHash?: string;
        updatedAt: number;
      },
    ) => {
      try {
        if (typeof window === 'undefined') return;
        const raw = window.localStorage.getItem(STRYDE_LOCAL_IMAGES_KEY);
        const current = raw ? JSON.parse(raw) : {};
        current[angleId] = {
          ...(current[angleId] || {}),
          ...patch,
        };
        window.localStorage.setItem(STRYDE_LOCAL_IMAGES_KEY, JSON.stringify(current));
      } catch {
        // Ignore storage errors
      }
    },
    [],
  );

  const CLIENT_UI_VERSION = '2026-10-25-static-bar-v9';

  // Load persisted edits from API + auto-refresh stale background tabs on focus after deploys
  useEffect(() => {
    let cancelled = false;
    setAds(prev => applyLocalImageOverrides(prev));

    const syncFromApi = (checkVersionReload: boolean) => {
      fetch(`/api/stryde-pl?_t=${Date.now()}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (cancelled) return;
          if (
            checkVersionReload &&
            typeof data?.uiVersion === 'string' &&
            data.uiVersion !== CLIENT_UI_VERSION &&
            !editDirty
          ) {
            window.location.reload();
            return;
          }
          if (Array.isArray(data?.presets) && data.presets.length > 0) {
            setPresets(data.presets);
          }
          if (Array.isArray(data?.savedAds) && data.savedAds.length > 0) {
            setAds(applyLocalImageOverrides(data.savedAds));
          }
          if (Array.isArray(data?.imageLibrary) && data.imageLibrary.length > 0) {
            setImageLibrary(data.imageLibrary);
          }
        })
        .catch(() => {
          // Fallback to prewritten in-memory ads
        });
    };

    syncFromApi(false);

    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        syncFromApi(true);
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, [applyLocalImageOverrides, editDirty]);

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
      if (stageFilter === 'new10') {
        if (!p.id.startsWith('orthevia-')) return false;
      } else if (stageFilter !== 'all' && p.stageId !== stageFilter) {
        return false;
      }
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
        setAds(applyLocalImageOverrides(data.savedAds));
      }
      setEditDirty(false);
      showToast(`Zapisano zmiany w kącie #${activePreset.number} (${activePreset.code}).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu.');
    } finally {
      setSavingEdit(false);
    }
  }, [activeAd, activePreset, editHeadline, editDescription, editPrimaryText, editPageId, editDestinationUrl, showToast, applyLocalImageOverrides]);

  const handleAssignImage = useCallback(
    async (asset: StrydeImageAsset, slot: 'primary' | 'secondary', closeLightbox = false) => {
      if (!activePreset) return;
      const targetAngleId = activePreset.id;
      const now = Date.now();

      setAds(prev =>
        prev.map(ad =>
          ad.angleId === targetAngleId
            ? {
                ...ad,
                ...(slot === 'primary'
                  ? { imageUrl: asset.url, imageHash: asset.imageHash || ad.imageHash }
                  : { secondImageUrl: asset.url, secondImageHash: asset.imageHash || ad.secondImageHash }),
                updatedAt: now,
              }
            : ad,
        ),
      );
      persistLocalImageOverride(
        targetAngleId,
        slot === 'primary'
          ? { imageUrl: asset.url, imageHash: asset.imageHash || '', updatedAt: now }
          : { secondImageUrl: asset.url, secondImageHash: asset.imageHash || '', updatedAt: now },
      );
      setImagePickerSlot(null);
      if (closeLightbox) {
        setLightboxAsset(null);
      }
      setError('');
      showToast(
        slot === 'primary'
          ? `✅ Ustawiono Kreację A (Główną) dla Kąta #${activePreset.number}: „${asset.label}”`
          : `🟦 Ustawiono Kreację B (Split A/B) dla Kąta #${activePreset.number}: „${asset.label}”`,
      );

      try {
        await fetch('/api/stryde-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'set_image',
            angleId: targetAngleId,
            ...(slot === 'primary'
              ? { imageUrl: asset.url, imageHash: asset.imageHash }
              : { secondImageUrl: asset.url, secondImageHash: asset.imageHash }),
          }),
        });
      } catch {
        // Optimistic + localStorage already saved
      }
    },
    [activePreset, showToast, persistLocalImageOverride],
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
          adsetOrigin: 'Sardian PL',
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
  const autoTriggeredKieRef = useRef<Set<string>>(new Set());
  const inFlightKieAnglesRef = useRef<Set<string>>(new Set());

  const triggerKieForPreset = useCallback(
    async (targetPreset: StrydeAnglePreset, explicitPrimaryText?: string, explicitHeadline?: string, isManual = false) => {
      const targetAngleId = targetPreset.id;
      if (!isManual && inFlightKieAnglesRef.current.has(targetAngleId)) return;

      const adForAngle = adByAngleId.get(targetAngleId);
      const copyText = (
        explicitPrimaryText ||
        (activePreset?.id === targetAngleId ? editPrimaryText : '') ||
        adForAngle?.primaryText ||
        targetPreset.vocTrigger ||
        targetPreset.title
      ).trim();
      const copyHeadline = (
        explicitHeadline ||
        (activePreset?.id === targetAngleId ? editHeadline : '') ||
        adForAngle?.headline ||
        targetPreset.title
      ).trim();
      if (!copyText) return;

      inFlightKieAnglesRef.current.add(targetAngleId);
      setGeneratingKie5(true);
      setError('');
      setNotice(`Analizuję cały skrypt i wysyłam 12 scen Raw iPhone 3:4 (2K Google AI · styl NHS) do Kie.ai dla kąta #${targetPreset.number}...`);
      try {
        const res = await fetch('/api/stryde-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_5_kie_images',
            angleId: targetAngleId,
            primaryText: copyText,
            headline: copyHeadline,
            title: targetPreset.title,
            isManual,
          }),
        });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data.tasks) || data.tasks.length === 0) {
          throw new Error(data.error || 'Błąd uruchamiania 12 zadań Kie.ai.');
        }
        const tasks = data.tasks as Array<{ taskId: string; label: string; prompt: string }>;
        setNotice(`Google AI (Kie.ai) generuje ${tasks.length} zdjęć Raw iPhone 3:4 (2K) z całego skryptu dla kąta #${targetPreset.number} (~25-45s)...`);
        let completed = 0;
        await Promise.all(
          tasks.map(async t => {
            for (let attempt = 0; attempt < 45; attempt++) {
              await new Promise(r => setTimeout(r, 3500));
              try {
                const pollRes = await fetch('/api/stryde-pl', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'poll_kie_image',
                    taskId: t.taskId,
                    angleId: targetAngleId,
                    label: t.label,
                    prompt: t.prompt,
                  }),
                });
                const pollData = await pollRes.json();
                if (pollData.state === 'success' && pollData.asset) {
                  completed += 1;
                  if (Array.isArray(pollData.imageLibrary)) {
                    setImageLibrary(pollData.imageLibrary);
                  }
                  const isScene1 = /^1\./.test(t.label);
                  const isScene2 = /^2\./.test(t.label);
                  if (isScene1) {
                    persistLocalImageOverride(targetAngleId, {
                      imageUrl: pollData.asset.url,
                      imageHash: pollData.asset.imageHash,
                      updatedAt: Date.now(),
                    });
                  } else if (isScene2) {
                    persistLocalImageOverride(targetAngleId, {
                      secondImageUrl: pollData.asset.url,
                      secondImageHash: pollData.asset.imageHash,
                      updatedAt: Date.now(),
                    });
                  }
                  if (Array.isArray(pollData.savedAds)) {
                    setAds(applyLocalImageOverrides(pollData.savedAds));
                  }
                  break;
                }
                if (pollData.state === 'fail') break;
              } catch {
                // continue polling
              }
            }
          }),
        );
        if (completed > 0) {
          showToast(`Wygenerowano ${completed}/${tasks.length} zdjęć Raw iPhone 3:4 (2K) dla kąta #${targetPreset.number}!`);
        } else {
          autoTriggeredKieRef.current.delete(targetAngleId);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Błąd generowania 12 zdjęć w Kie.ai.';
        autoTriggeredKieRef.current.delete(targetAngleId);
        setError(msg);
        if (/402|kredyt|Podłącz KIE/i.test(msg)) {
          return false;
        }
      } finally {
        inFlightKieAnglesRef.current.delete(targetAngleId);
        setGeneratingKie5(false);
      }
      return true;
    },
    [adByAngleId, activePreset, editPrimaryText, editHeadline, showToast, persistLocalImageOverride, applyLocalImageOverrides],
  );

  const handleGenerate5KieImages = useCallback(async () => {
    if (!activePreset) return;
    await triggerKieForPreset(activePreset, undefined, undefined, true);
  }, [activePreset, triggerKieForPreset]);

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
              🦿 SARDIAN PL · Opaska (25 Antków · 5×5)
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
            Wszystkie ({presets.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setStageFilter('new10');
              const firstNew = presets.find(p => p.id.startsWith('orthevia-'));
              if (firstNew) setActiveAngleId(firstNew.id);
            }}
            style={{
              padding: '7px 13px',
              borderRadius: '8px',
              border: stageFilter === 'new10' ? '1px solid #f59e0b' : '1px solid #b45309',
              background:
                stageFilter === 'new10'
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'rgba(245, 158, 11, 0.12)',
              color: stageFilter === 'new10' ? '#09090b' : '#fcd34d',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✨ NOWE Polskie Kąty ({presets.filter(p => p.id.startsWith('orthevia-')).length})
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
            <option value="all">📣 Wszystkie Fanpage ({STRYDE_FANPAGES.length} profile)</option>
            {STRYDE_FANPAGES.map(fp => (
              <option key={fp.id} value={fp.id}>
                {fp.name} ({fp.role})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Szukaj imienia (Tadeusz, Darek, Henryk, Zdzisław, Halina, Marek), schodów, sprzęgła, wanny..."
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
          alignItems: 'start',
          flex: 1,
          minHeight: 'calc(100vh - 135px)',
          background: '#000000',
        }}
      >
        {/* LEFT COLUMN: LIST OF 25 SARDIAN PL ANGLES */}
        <aside
          style={{
            borderRight: '1px solid #27272a',
            background: '#050507',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            maxHeight: '100vh',
            overflowY: 'auto',
            paddingBottom: '120px',
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
              ANTKI SARDIAN ({filteredPresets.length} / {presets.length})
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
                      onClick={() => {
                        setActiveAngleId(preset.id);
                        if (typeof window !== 'undefined' && window.scrollY > 240) {
                          centerColumnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
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
                          {preset.id.startsWith('orthevia-') && (
                            <span
                              style={{
                                background: '#f59e0b',
                                color: '#09090b',
                                fontWeight: 900,
                                fontSize: '9.5px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                letterSpacing: '0.03em',
                              }}
                            >
                              NOWE
                            </span>
                          )}
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
          ref={centerColumnRef}
          style={{
            position: 'static',
            background: '#000000',
            minHeight: 'calc(100vh - 135px)',
            padding: '12px 16px 200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {activePreset && activeAd && (
            <>
              {/* SLIM 1-LINE CONTROL BAR (POSITION: STATIC — SCROLLS COMPLETELY OFF SCREEN) */}
              <div
                style={{
                  position: 'static',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Row 1: Angle badge + Title + Settings toggle + Copy/Edit buttons */}
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
                        background: showVocDetails ? '#14532d' : '#18181b',
                        color: '#34d399',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {showVocDetails ? '▲ Zwiń Nagłówek & LP' : '⚙️ Nagłówek & LP'}
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

                {/* Collapsible Drawer: Headline Input + 4 Advertorials / PDP + Polish Localization */}
                {showVocDetails && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid #27272a',
                      fontSize: '12px',
                    }}
                  >
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

                    <div style={{ color: '#d4d4d8' }}>
                      <strong style={{ color: '#34d399' }}>🇵🇱 Polska Lokalizacja (Bohaterowie & Realia):</strong>{' '}
                      {activePreset.vocTrigger}
                    </div>
                    <div style={{ color: '#d4d4d8' }}>
                      <strong style={{ color: '#38bdf8' }}>🧬 Mechanizm Biomechaniczny:</strong>{' '}
                      {activePreset.mechanismCore}
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
                          whiteSpace: 'pre-line',
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

              {/* BOTTOM BAR UNDER FULL COPY */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                  padding: '10px 14px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(editPrimaryText, `Tekst #${activePreset.number}`)}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📋 Kopiuj cały tekst ({liveWordCount} sł.)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === 'reader' ? 'editor' : 'reader')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #27272a',
                      background: viewMode === 'editor' ? '#2563eb' : '#18181b',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {viewMode === 'reader' ? '✏️ Edytuj tekst' : '📖 Wróć do czytania'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #27272a',
                    background: '#18181b',
                    color: '#a1a1aa',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ↑ Przewiń na górę
                </button>
              </div>
            </>
          )}
        </main>

        {/* RIGHT COLUMN: CREATIVE A/B + GALLERY + FB PREVIEW ON PURE BLACK */}
        <aside
          style={{
            borderLeft: '1px solid #27272a',
            background: '#050507',
            position: 'sticky',
            top: 0,
            maxHeight: '100vh',
            overflowY: 'auto',
            padding: '16px 16px 120px',
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
                  ? '⏳ Generuję 12 zdjęć Raw iPhone 3:4 (2K Google AI · styl NHS) w Kie.ai...'
                  : '📸 Generuj 12 zdjęć Raw iPhone 3:4 pod ten kąt (2K Google AI · styl NHS z całego skryptu)'}
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
                        aspectRatio: '3 / 4',
                        objectFit: 'cover',
                        objectPosition: 'top center',
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
                        aspectRatio: '3 / 4',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        borderRadius: '8px',
                        background: '#000',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ANGLE-SPECIFIC GENERATED PHOTOS (12x RAW IPHONE 3:4 NHS STYLE) */}
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
                    ✨ Nowo wygenerowane specjalnie do Kąta #{activePreset.number} (Raw iPhone 3:4 · styl NHS ·{' '}
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
                              border: isB
                                ? '2px solid #38bdf8'
                                : isA
                                ? '2px solid #10b981'
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
                                  aspectRatio: '3 / 4',
                                  objectFit: 'cover',
                                  objectPosition: 'top center',
                                  display: 'block',
                                }}
                              />
                              {(isA || isB) && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: isA && isB ? '#059669' : isB ? '#0284c7' : '#10b981',
                                    color: '#fff',
                                    fontSize: '9.5px',
                                    fontWeight: 800,
                                    padding: '2px 5px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {isA && isB ? 'A + B' : isB ? 'Kreacja B' : 'Kreacja A'}
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
                                onClick={() => void handleAssignImage(img, 'primary')}
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
                                {isA ? '✓ Kreacja A' : 'Ustaw A'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleAssignImage(img, 'secondary')}
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
                                {isB ? '✓ Kreacja B' : 'Ustaw B'}
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
                          border: isB
                            ? '2px solid #38bdf8'
                            : isA
                            ? '2px solid #10b981'
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
                                background: isA && isB ? '#059669' : isB ? '#0284c7' : '#10b981',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              {isA && isB ? 'A + B' : isB ? 'Kreacja B' : 'Kreacja A'}
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
                            onClick={() => void handleAssignImage(img, 'primary')}
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
                            {isA ? '✓ Kreacja A' : 'Ustaw A'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleAssignImage(img, 'secondary')}
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
                            {isB ? '✓ Kreacja B' : 'Ustaw B'}
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
                    SPROBUJSARDIAN.PL · 60 DNI GWARANCJI
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
              maxWidth: '860px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                {lightboxAsset.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    void handleAssignImage(lightboxAsset, 'primary', true);
                  }}
                  style={{
                    background: activeAd?.imageUrl === lightboxAsset.url ? '#047857' : '#059669',
                    color: '#ffffff',
                    border: activeAd?.imageUrl === lightboxAsset.url ? '2px solid #6ee7b7' : 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {activeAd?.imageUrl === lightboxAsset.url ? '✓ Aktywna Kreacja A' : '✅ Ustaw jako Kreację A'}
                </button>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    void handleAssignImage(lightboxAsset, 'secondary', true);
                  }}
                  style={{
                    background: activeAd?.secondImageUrl === lightboxAsset.url ? '#d97706' : '#0284c7',
                    color: '#ffffff',
                    border: activeAd?.secondImageUrl === lightboxAsset.url ? '2px solid #fde68a' : 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {activeAd?.secondImageUrl === lightboxAsset.url ? '✓ Aktywna Kreacja B' : '🟦 Ustaw jako Kreację B'}
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxAsset(null)}
                  style={{
                    background: '#18181b',
                    color: '#ffffff',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  ✕ Zamknij (ESC)
                </button>
              </div>
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
                🇵🇱 Matryca 25 Kątów SARDIAN (5×5) & Przewaga nad Ankole.pl
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
              Kompletna matryca <strong>25 kątów (5 kategorii × 5 Antków)</strong> dla opaski podrzepkowej <strong>SARDIAN</strong> na domenie <strong>sprobujsardian.pl</strong> (15 adaptacji 1:1 z UK/FR + 10 polskich kątów VOC z forów ortopedycznych):
            </p>
            <ul style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: 1.7 }}>
              <li><strong>#01–#05 Męska duma i fach w ręku (5 kątów):</strong> Brukarz Tadeusz (64 l.), Glazurnik Darek (131 nocy w fotelu), Instalator Staszek i 78-letni brat na drabinie, Kierowca Henryk (66 l., sprzęgło na A4) oraz Działkowiec Zdzisław (70 l., taborecik na ROD).</li>
              <li><strong>#06–#10 Wnuki, rodzina i kościół (5 kątów):</strong> Babcia Zuzanna („kulawe kolanko”), Babcia Krystyna vs druga babcia, Barbara w Kołobrzegu (wózek elektryczny), Babcia Halina (68 l., ostatnia ławka w kościele i Komunia) oraz Dziadek Roman (67 l., rower z wnukiem).</li>
              <li><strong>#11–#15 Strach przed utratą samodzielności (5 kątów):</strong> Kadrowa Gosia (toaleta w biurze), Wdowa Janina (Otodom i dom po mężu), Laura (67 l., dancingi), Pani Teresa (68 l., 4. piętro bez windy z lastryko) oraz Pani Danuta (70 l., utknięcie w wannie).</li>
              <li><strong>#16–#20 Gniew na kliniki, zastrzyki i suple (5 kątów):</strong> 6 000 zł w gabinetach, orteza zegarowa za 1 600 zł w szafie, 3 zastrzyki kwasu hialuronowego za 2 400 zł (5 tyg. ulgi), 8 puszek kolagenu i zrujnowany żołądek oraz Fizjoterapeuta mgr Marek Kowalczyk (16 lat praktyki).</li>
              <li><strong>#21–#25 Krótkie kąty Inolyo FR & SARDIAN BOF (5 kątów):</strong> „To NIE chrząstka (-34% napięcia)”, „Nie zjeżdża na łydkę”, „Przetrwać kolejkę na NFZ”, „Oryginał 8 mm vs podróbki” oraz „Test 2 palców pod rzepką w 10 sekund”.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
