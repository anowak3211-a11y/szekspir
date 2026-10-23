'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FELIORA_ADVERTORIAL_URL,
  FELIORA_DEFAULT_URL,
  FELIORA_FANPAGES,
  FELIORA_IMAGE_LIBRARY,
  FELIORA_PRESET_ANGLES,
  FELIORA_STAGES,
  buildAllFelioraPrewrittenAds,
  type FelioraAnglePreset,
  type FelioraAwarenessStageId,
  type FelioraImageAsset,
  type FelioraPlGeneratedAd,
  type FelioraProblemCluster,
  type FelioraSophisticationLevel,
} from '@/lib/feliora-pl';

const PROBLEM_CLUSTER_LABELS: Record<FelioraProblemCluster, { label: string; color: string }> = {
  SIKANIE_KOLDRA: { label: '💦 Sikanie na kołdrę / poza kuwetą', color: '#7c3aed' },
  WSTYD_DOM: { label: '🛋️ Wstyd w domu / folia / wycie 3:15', color: '#8b5cf6' },
  ODDANIE_SCHRONISko: { label: '💔 Ultimatum w domu / strach i paraliż', color: '#d97706' },
  FIC_PECHERZ: { label: '🩺 FIC / Pęcherz, łysy brzuch i kuwety', color: '#0284c7' },
  DOKOCENIE_WALKI: { label: '⚡ Dokocenie, walki i mapa węchowa', color: '#b45309' },
  ZDEMASKOWANIE_ZOO: { label: '✂️ Demaskacja obróżek, sprayów i octu', color: '#7c3aed' },
  F3_VS_MAP_FIZYKA: { label: '🔬 M.A.P. + F3 vs stare wtyczki F3', color: '#059669' },
  MATEMATYKA_GWARANCJA: { label: '🛡️ Matematyka 3,16 zł/dzień & 30 dni próby', color: '#0d9488' },
};

const STAGE_ORDER: FelioraAwarenessStageId[] = [
  'stage1_unaware',
  'stage2_problem_aware',
  'stage3_solution_aware',
  'stage4_product_aware',
  'stage5_most_aware',
];

interface FelioraPlWorkspaceProps {
  onSwitchToOrthomax?: () => void;
  onSwitchToStryde?: () => void;
}

export default function FelioraPlWorkspace({ onSwitchToOrthomax, onSwitchToStryde }: FelioraPlWorkspaceProps) {
  const [presets, setPresets] = useState<FelioraAnglePreset[]>(FELIORA_PRESET_ANGLES);
  const [ads, setAds] = useState<FelioraPlGeneratedAd[]>(() => buildAllFelioraPrewrittenAds());
  const [imageLibrary, setImageLibrary] = useState<FelioraImageAsset[]>(FELIORA_IMAGE_LIBRARY);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Sorting & Filtering
  const [stageFilter, setStageFilter] = useState<'all' | FelioraAwarenessStageId>('all');
  const [sophFilter, setSophFilter] = useState<'all' | FelioraSophisticationLevel>('all');
  const [clusterFilter, setClusterFilter] = useState<'all' | FelioraProblemCluster>('all');
  const [fanpageFilter, setFanpageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Active angle & Selection
  const [activeAngleId, setActiveAngleId] = useState<string>('fel-01-koldra-pachnaca-toba');
  const [selectedAngleIds, setSelectedAngleIds] = useState<string[]>([]);

  // Reader vs Editor mode
  const [viewMode, setViewMode] = useState<'reader' | 'editor'>('reader');
  const [editHeadline, setEditHeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrimaryText, setEditPrimaryText] = useState('');
  const [editDestinationUrl, setEditDestinationUrl] = useState(FELIORA_ADVERTORIAL_URL);
  const [editPageId, setEditPageId] = useState('1287239777799682');
  const [editDirty, setEditDirty] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Image Picker Modal & Fullscreen Lightbox
  const [imagePickerSlot, setImagePickerSlot] = useState<null | 'primary' | 'secondary'>(null);
  const [lightboxAsset, setLightboxAsset] = useState<FelioraImageAsset | null>(null);
  const [showVocDetails, setShowVocDetails] = useState(false);
  const customFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Meta Push state
  const [pushUrlMode, setPushUrlMode] = useState<'advertorial' | 'pdp' | 'split_ab'>('advertorial');
  const [pushAdSetName, setPushAdSetName] = useState('22.04 - FELIORA ANTEK BATCH');
  const [pushStatus] = useState<'PAUSED' | 'ACTIVE'>('PAUSED');
  const [pushingMeta, setPushingMeta] = useState(false);

  const loadFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/feliora-pl', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.savedAds) && data.savedAds.length > 0) {
        setAds(data.savedAds);
        if (Array.isArray(data.presets)) setPresets(data.presets);
        if (Array.isArray(data.imageLibrary)) setImageLibrary(data.imageLibrary);
      }
    } catch {
      // Fallback to local prebuilt ads
    }
  }, []);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const adByAngleId = useMemo(() => {
    const map = new Map<string, FelioraPlGeneratedAd>();
    for (const ad of ads) {
      map.set(ad.angleId, ad);
    }
    return map;
  }, [ads]);

  const activePreset = useMemo(
    () => presets.find(p => p.id === activeAngleId) || presets[0],
    [presets, activeAngleId],
  );

  const activeAd = useMemo(
    () => adByAngleId.get(activePreset?.id || '') || ads[0],
    [adByAngleId, activePreset, ads],
  );

  useEffect(() => {
    if (!activeAd) return;
    setEditHeadline(activeAd.headline);
    setEditDescription(activeAd.description);
    setEditPrimaryText(activeAd.primaryText);
    setEditDestinationUrl(activeAd.destinationUrl || FELIORA_ADVERTORIAL_URL);
    setEditPageId(activeAd.pageId || activePreset?.recommendedFanpageId || '1287239777799682');
    setEditDirty(false);
  }, [activeAd, activePreset]);

  const filteredPresets = useMemo(() => {
    return presets.filter(p => {
      if (stageFilter !== 'all' && p.stageId !== stageFilter) return false;
      if (sophFilter !== 'all' && p.sophisticationLevel !== sophFilter) return false;
      if (clusterFilter !== 'all' && p.problemCluster !== clusterFilter) return false;
      if (fanpageFilter !== 'all' && p.recommendedFanpageId !== fanpageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ad = adByAngleId.get(p.id);
        const hay = `${p.number} ${p.code} ${p.title} ${p.shortTitle} ${p.problemLabel} ${p.vocTrigger} ${ad?.primaryText || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [presets, stageFilter, sophFilter, clusterFilter, fanpageFilter, searchQuery, adByAngleId]);

  const groupedByStage = useMemo(() => {
    return STAGE_ORDER.map(stageKey => {
      const stageMeta = FELIORA_STAGES[stageKey];
      const items = filteredPresets.filter(p => p.stageId === stageKey);
      return { stageKey, stageMeta, items };
    }).filter(g => g.items.length > 0);
  }, [filteredPresets]);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setNotice(`Skopiowano: ${label}`);
    setTimeout(() => setNotice(''), 2500);
  }, []);

  const handleSaveAd = useCallback(async () => {
    if (!activeAd || !activePreset) return;
    setSavingEdit(true);
    setError('');
    try {
      const selectedFp = FELIORA_FANPAGES.find(f => f.id === editPageId) || FELIORA_FANPAGES[0];
      const updatedPayload: FelioraPlGeneratedAd = {
        ...activeAd,
        headline: editHeadline,
        description: editDescription,
        primaryText: editPrimaryText,
        destinationUrl: editDestinationUrl,
        pageId: selectedFp.id,
        pageName: selectedFp.name,
      };
      const res = await fetch('/api/feliora-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', ad: updatedPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu.');
      if (Array.isArray(data.savedAds)) setAds(data.savedAds);
      setEditDirty(false);
      setNotice(`Zapisano zmiany dla kąta #${activePreset.number}`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu.');
    } finally {
      setSavingEdit(false);
    }
  }, [activeAd, activePreset, editHeadline, editDescription, editPrimaryText, editDestinationUrl, editPageId]);

  const handleAssignImage = useCallback(
    async (asset: FelioraImageAsset, slot: 'primary' | 'secondary') => {
      if (!activePreset) return;
      try {
        const payload =
          slot === 'primary'
            ? {
                action: 'set_image',
                angleId: activePreset.id,
                imageUrl: asset.url,
                imageHash: asset.imageHash,
              }
            : {
                action: 'set_image',
                angleId: activePreset.id,
                secondImageUrl: asset.url,
                secondImageHash: asset.imageHash,
              };
        const res = await fetch('/api/feliora-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.savedAds)) {
          setAds(data.savedAds);
          setNotice(`Przypisano grafikę (${slot === 'primary' ? 'Kreacja A' : 'Kreacja B'}) do kąta #${activePreset.number}`);
          setTimeout(() => setNotice(''), 2500);
        }
      } catch {
        setError('Nie udało się przypisać grafiki.');
      } finally {
        setImagePickerSlot(null);
      }
    },
    [activePreset],
  );

  const openLightboxForUrl = useCallback(
    (url: string, fallbackLabel = 'Podgląd kreacji') => {
      const found = imageLibrary.find(img => img.url === url);
      if (found) {
        setLightboxAsset(found);
      } else {
        setLightboxAsset({
          id: 'custom-preview',
          label: fallbackLabel,
          url,
          imageHash: '',
          adsetOrigin: 'Podgląd kreacji',
          adOrigin: 'Podgląd',
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
        const res = await fetch('/api/feliora-pl', {
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
        setNotice(`Wgrano grafikę i zsynchronizowano z kontem Meta Feliora!`);
        setImagePickerSlot(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd wgrywania pliku');
      } finally {
        setUploadingImage(false);
        if (customFileRef.current) customFileRef.current.value = '';
      }
    },
    [activePreset],
  );

  const [generatingKie5, setGeneratingKie5] = useState(false);
  const autoTriggeredKieRef = useRef<Set<string>>(new Set());
  const inFlightKieAnglesRef = useRef<Set<string>>(new Set());

  const triggerKieForPreset = useCallback(
    async (targetPreset: FelioraAnglePreset, explicitPrimaryText?: string, explicitHeadline?: string, isManual = false) => {
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
      setNotice(`Wysyłam automatycznie 8 scen (4x Hook + 3x Wzór Noom.pl + 1x Produkt) do Kie.ai dla kąta #${targetPreset.number}...`);
      try {
        const res = await fetch('/api/feliora-pl', {
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
          throw new Error(data.error || 'Błąd uruchamiania 8 zadań Kie.ai.');
        }
        const tasks = data.tasks as Array<{ taskId: string; label: string; prompt: string }>;
        setNotice(`Kie.ai generuje ${tasks.length} zdjęć (4x Hook + 3x Wzór Noom.pl + 1x Produkt) dla kąta #${targetPreset.number} (~20-40s)...`);
        let completed = 0;
        await Promise.all(
          tasks.map(async t => {
            for (let attempt = 0; attempt < 45; attempt++) {
              await new Promise(r => setTimeout(r, 3500));
              try {
                const pollRes = await fetch('/api/feliora-pl', {
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
                  if (Array.isArray(pollData.savedAds)) {
                    setAds(pollData.savedAds);
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
          setNotice(`✅ Wygenerowano ${completed}/${tasks.length} zdjęć (4x Hook + 3x Wzór Noom.pl + 1x Produkt) dla kąta #${targetPreset.number}!`);
        } else {
          autoTriggeredKieRef.current.delete(targetAngleId);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Błąd generowania 8 zdjęć w Kie.ai.';
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
    [adByAngleId, activePreset, editPrimaryText, editHeadline],
  );

  const handleGenerate5KieImages = useCallback(async () => {
    if (!activePreset) return;
    await triggerKieForPreset(activePreset, undefined, undefined, true);
  }, [activePreset, triggerKieForPreset]);

  // Automatycznie generuj 8 obrazków w Kie.ai dla otwartego kąta, jeśli jeszcze ich nie ma
  useEffect(() => {
    if (!activePreset) return;
    const angleId = activePreset.id;
    const existing = imageLibrary.filter(img => img.angleId === angleId);
    if (existing.length >= 2) return;
    if (inFlightKieAnglesRef.current.has(angleId)) return;
    if (autoTriggeredKieRef.current.has(angleId)) return;

    autoTriggeredKieRef.current.add(angleId);
    const ad = adByAngleId.get(angleId);
    void triggerKieForPreset(activePreset, ad?.primaryText, ad?.headline);
  }, [activePreset, imageLibrary, adByAngleId, triggerKieForPreset]);

  // Kolejka w tle dla wszystkich pozostałych 25 kątów Feliora PL
  const batchKieRunnerActiveRef = useRef(false);
  const presetsRef = useRef(presets);
  presetsRef.current = presets;
  const filteredPresetsRef = useRef(filteredPresets);
  filteredPresetsRef.current = filteredPresets;
  const imageLibraryRef = useRef(imageLibrary);
  imageLibraryRef.current = imageLibrary;
  const adByAngleIdRef = useRef(adByAngleId);
  adByAngleIdRef.current = adByAngleId;
  const activeAngleIdRef = useRef(activeAngleId);
  activeAngleIdRef.current = activeAngleId;
  const triggerKieRef = useRef(triggerKieForPreset);
  triggerKieRef.current = triggerKieForPreset;

  useEffect(() => {
    if (batchKieRunnerActiveRef.current || !presets.length) return;
    batchKieRunnerActiveRef.current = true;
    void (async () => {
      try {
        while (true) {
          const allPresets = presetsRef.current;
          const visiblePresets = filteredPresetsRef.current;
          const currentActiveId = activeAngleIdRef.current;
          const lib = imageLibraryRef.current;
          const adsMap = adByAngleIdRef.current;

          const orderedCandidates = [
            ...allPresets.filter(p => p.id === currentActiveId),
            ...visiblePresets.filter(p => p.id !== currentActiveId),
            ...allPresets.filter(p => p.id !== currentActiveId && !visiblePresets.some(v => v.id === p.id)),
          ];

          const nextPreset = orderedCandidates.find(p => {
            if (autoTriggeredKieRef.current.has(p.id)) return false;
            if (inFlightKieAnglesRef.current.has(p.id)) return false;
            const existing = lib.filter(img => img.angleId === p.id);
            return existing.length < 2;
          });

          if (!nextPreset) break;

          autoTriggeredKieRef.current.add(nextPreset.id);
          const ad = adsMap.get(nextPreset.id);
          const ok = await triggerKieRef.current(nextPreset, ad?.primaryText, ad?.headline);
          if (ok === false) break;
        }
      } finally {
        batchKieRunnerActiveRef.current = false;
      }
    })();
  }, [presets.length, activeAngleId]);

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

  const handlePushToMeta = useCallback(
    async (mode: 'active_only' | 'selected') => {
      const targetIds =
        mode === 'selected' && selectedAngleIds.length > 0
          ? selectedAngleIds
          : activePreset
          ? [activePreset.id]
          : [];
      if (!targetIds.length) return;
      setPushingMeta(true);
      setError('');
      try {
        const res = await fetch('/api/feliora-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'push_to_meta',
            angleIds: targetIds,
            adSetName: pushAdSetName,
            urlMode: pushUrlMode,
            adStatus: pushStatus,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Błąd wysyłki do Meta Ads.');
        setNotice(
          `Wysłano do Meta Ads (FEL NATIVE)! Utworzono Ad Set "${data.adSetName}" (${data.adSetId}) oraz ${data.createdAdsCount} reklam.`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd podczas wysyłki do Meta Ads.');
      } finally {
        setPushingMeta(false);
      }
    },
    [selectedAngleIds, activePreset, pushAdSetName, pushUrlMode, pushStatus],
  );

  const activeStageMeta = activePreset ? FELIORA_STAGES[activePreset.stageId] : null;
  const activeClusterMeta = activePreset ? PROBLEM_CLUSTER_LABELS[activePreset.problemCluster] : null;
  const activeFanpage = useMemo(
    () => FELIORA_FANPAGES.find(f => f.id === editPageId) || FELIORA_FANPAGES[0],
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
        background: 'linear-gradient(180deg, #190d30 0%, #0f071e 100%)',
        color: '#fff7ed',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOP BAR: BRAND SWITCHER & A/B TEST WINNER SUMMARY */}
      <header
        style={{
          background: 'linear-gradient(90deg, #2b1508 0%, #190d30 100%)',
          borderBottom: '1px solid #3e2070',
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
              color: '#ddd6fe',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#361b0b',
              border: '1px solid #5c2f14',
            }}
          >
            ← Szekspir Home
          </a>

          <div
            style={{
              display: 'inline-flex',
              background: '#120921',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid #5c2f14',
              gap: '4px',
            }}
          >
            {onSwitchToStryde && (
              <button
                type="button"
                onClick={onSwitchToStryde}
                style={{
                  background: '#09090b',
                  color: '#34d399',
                  border: '1px solid #27272a',
                  borderRadius: '7px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🦿 OPASKA PL · Stryde 1:1 (15 Antków)
              </button>
            )}
            <button
              type="button"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '7px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(139, 92, 246, 0.4)',
              }}
            >
              🐾 FELIORA PL · Batch 1: Koty (25 Antków · 5 Stages)
            </button>
            {onSwitchToOrthomax && (
              <button
                type="button"
                onClick={onSwitchToOrthomax}
                style={{
                  background: 'transparent',
                  color: '#c4b5fd',
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
              background: '#361b0b',
              color: '#a78bfa',
              border: '1px solid #7c3aed',
              borderRadius: '8px',
              padding: '7px 13px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📊 Matryca 5 Awareness Stages & VoC (Miau.pl / Wykop)
          </button>
        </div>

        {/* LIVE A/B WINNER CALLOUT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(139, 92, 246, 0.14)',
            border: '1px solid rgba(139, 92, 246, 0.45)',
            borderRadius: '10px',
            padding: '7px 14px',
            fontSize: '12.5px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🏆</span>
          <div>
            <strong style={{ color: '#a78bfa' }}>WYNIK A/B (FEL NATIVE + MAIN):</strong>{' '}
            <span style={{ color: '#ede9fe' }}>
              <strong>Advertorial (Listicle)</strong> wygrywa <strong>5 : 1</strong> w zakupach (
              <strong>1 129,94 zł</strong> vs 189,99 zł · AOV <strong>225,99 zł</strong>)
            </span>
          </div>
        </div>
      </header>

      {/* NOTIFICATION / ERROR BANNERS */}
      {(notice || error) && (
        <div
          style={{
            padding: '10px 20px',
            background: error ? '#7f1d1d' : '#c2410c',
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

      {/* FILTER BAR: 5 AWARENESS STAGES + SOPHISTICATION + PROBLEM CLUSTER + FANPAGE */}
      <section
        style={{
          background: '#1d1033',
          borderBottom: '1px solid #3e2070',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* ROW 1: 5 SCHWARTZ AWARENESS STAGE PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Etap Świadomości (Schwartz):
          </span>

          <button
            type="button"
            onClick={() => setStageFilter('all')}
            style={{
              padding: '7px 13px',
              borderRadius: '8px',
              border: stageFilter === 'all' ? '1px solid #8b5cf6' : '1px solid #3e2070',
              background: stageFilter === 'all' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : '#180c04',
              color: stageFilter === 'all' ? '#ffffff' : '#ddd6fe',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Wszystkie (25)
          </button>

          {STAGE_ORDER.map(stKey => {
            const st = FELIORA_STAGES[stKey];
            const active = stageFilter === stKey;
            const rangeBadge = `#${(st.stageNumber - 1) * 5 + 1}–#${st.stageNumber * 5}`;
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
                  border: active ? `1px solid ${st.color}` : '1px solid #3e2070',
                  background: active ? `${st.color}38` : '#180c04',
                  color: active ? '#ffffff' : '#ddd6fe',
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
                <span style={{ color: '#c4b5fd', fontSize: '11px' }}>({rangeBadge})</span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: SECONDARY FILTERS (SOPHISTICATION, PROBLEM CLUSTER, FANPAGE, SEARCH) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={sophFilter === 'all' ? 'all' : String(sophFilter)}
            onChange={e =>
              setSophFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as FelioraSophisticationLevel))
            }
            style={{
              background: '#180c04',
              color: '#ede9fe',
              border: '1px solid #5c2f14',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">🔬 Wszystkie Poziomy Sofistykacji (Poziom 3–5)</option>
            <option value="3">Poziom 3: Nowy Mechanizm Przyczyny (Oś Mózg-Pęcherz / VNO)</option>
            <option value="4">Poziom 4: Demaskacja Alternatyw (Obróżki / Spraye / Psychotropy)</option>
            <option value="5">Poziom 5: Przewaga Technologiczna (M.A.P. + F3 / Rdzeń 5W / Dowód)</option>
          </select>

          <select
            value={clusterFilter}
            onChange={e => setClusterFilter(e.target.value as 'all' | FelioraProblemCluster)}
            style={{
              background: '#180c04',
              color: '#ede9fe',
              border: '1px solid #5c2f14',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">🐾 Wszystkie Problemy z Forów (8 klastrów)</option>
            {Object.entries(PROBLEM_CLUSTER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <select
            value={fanpageFilter}
            onChange={e => setFanpageFilter(e.target.value)}
            style={{
              background: '#180c04',
              color: '#ede9fe',
              border: '1px solid #5c2f14',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">📣 Wszystkie Fanpage (4 profile)</option>
            {FELIORA_FANPAGES.map(fp => (
              <option key={fp.id} value={fp.id}>
                {fp.name} ({fp.role})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Szukaj kąta, cytatu z Miau.pl, słowa kluczowego..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: '1 1 220px',
              background: '#180c04',
              color: '#fff7ed',
              border: '1px solid #5c2f14',
              borderRadius: '7px',
              padding: '6px 12px',
              fontSize: '12.5px',
            }}
          />

          {(stageFilter !== 'all' || sophFilter !== 'all' || clusterFilter !== 'all' || fanpageFilter !== 'all' || searchQuery) && (
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
                background: '#361b0b',
                color: '#ddd6fe',
                border: '1px solid #5c2f14',
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

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px minmax(420px, 620px) minmax(480px, 1fr)',
          flex: 1,
          minHeight: 'calc(100vh - 135px)',
          overflow: 'hidden',
        }}
      >
        {/* LEFT COLUMN: SORTED & GROUPED LIST OF 25 ANGLES */}
        <aside
          style={{
            borderRight: '1px solid #3e2070',
            background: '#1c0e05',
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
              borderBottom: '1px solid #3e2070',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#261308',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ede9fe' }}>
              KĄTY ({filteredPresets.length} / 25)
            </span>
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              style={{
                background: '#361b0b',
                color: '#c4b5fd',
                border: '1px solid #5c2f14',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {selectedAngleIds.length > 0 ? `Zaznaczono (${selectedAngleIds.length})` : 'Zaznacz wszystkie'}
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
                    background: 'rgba(124, 58, 237, 0.2)',
                    borderLeft: `4px solid ${stageMeta.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fff7ed', textTransform: 'uppercase' }}>
                      {stageMeta.shortLabel}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#ddd6fe',
                        background: '#361b0b',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      Poz. {stageMeta.sophisticationLevel}
                    </span>
                  </div>
                </div>

                {/* Angle Cards inside Stage */}
                {items.map(preset => {
                  const ad = adByAngleId.get(preset.id);
                  const isActive = preset.id === activePreset?.id;
                  const isSelected = selectedAngleIds.includes(preset.id);
                  const clusterInfo = PROBLEM_CLUSTER_LABELS[preset.problemCluster];

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setActiveAngleId(preset.id)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: '9px',
                        background: isActive ? 'rgba(124, 58, 237, 0.24)' : '#120921',
                        border: isActive ? '2px solid #8b5cf6' : '1px solid #3d200d',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      {/* Top row: Checkbox + Number + Fanpage + Word Count */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
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
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: '#ddd6fe',
                              background: '#261308',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid #5c2f14',
                            }}
                          >
                            {preset.recommendedFanpageName}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: ad?.auditPassed !== false ? '#34d399' : '#fbbf24',
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
                          color: isActive ? '#ffffff' : '#ede9fe',
                          lineHeight: 1.3,
                        }}
                      >
                        {preset.title}
                      </div>

                      {/* Subtitle / Problem Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#ede9fe',
                            background: `${clusterInfo.color}28`,
                            border: `1px solid ${clusterInfo.color}66`,
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

        {/* CENTER COLUMN: COMPACT READER & EDITOR (NARROWER & LESS CLUTTERED) */}
        <main
          style={{
            background: '#120921',
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
              {/* COMPACT STICKY CONTROL BAR */}
              <div
                style={{
                  background: '#1d1033',
                  border: '1px solid #3e2070',
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        background: activeStageMeta?.color || '#7c3aed',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '11px',
                        padding: '3px 7px',
                        borderRadius: '5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      #{String(activePreset.number).padStart(2, '0')} · {activeStageMeta?.shortLabel}
                    </span>
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={activePreset.title}
                    >
                      {activePreset.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowVocDetails(v => !v)}
                      style={{
                        background: showVocDetails ? '#1e293b' : '#0f172a',
                        color: '#38bdf8',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {showVocDetails ? '▲ Ukryj VoC / Hook' : '▼ Pokaż VoC / Hook'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'reader' ? 'editor' : 'reader')}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        background: viewMode === 'editor' ? '#2563eb' : '#1e293b',
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
                          color: '#0f172a',
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

                {/* Row 2: Compact Headline Input + LP Switcher */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>Nagłówek:</span>
                    <input
                      type="text"
                      value={editHeadline}
                      onChange={e => {
                        setEditHeadline(e.target.value);
                        setEditDirty(true);
                      }}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '5px 8px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDestinationUrl(FELIORA_ADVERTORIAL_URL);
                        setEditDirty(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '5px 6px',
                        borderRadius: '6px',
                        border:
                          editDestinationUrl === FELIORA_ADVERTORIAL_URL
                            ? '1px solid #10b981'
                            : '1px solid #334155',
                        background:
                          editDestinationUrl === FELIORA_ADVERTORIAL_URL
                            ? 'rgba(16, 185, 129, 0.18)'
                            : '#0f172a',
                        color: editDestinationUrl === FELIORA_ADVERTORIAL_URL ? '#34d399' : '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🏆 Advertorial (5:1)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDestinationUrl(FELIORA_DEFAULT_URL);
                        setEditDirty(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '5px 6px',
                        borderRadius: '6px',
                        border:
                          editDestinationUrl === FELIORA_DEFAULT_URL
                            ? '1px solid #38bdf8'
                            : '1px solid #334155',
                        background:
                          editDestinationUrl === FELIORA_DEFAULT_URL
                            ? 'rgba(56, 189, 248, 0.18)'
                            : '#0f172a',
                        color: editDestinationUrl === FELIORA_DEFAULT_URL ? '#38bdf8' : '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      📦 PDP
                    </button>
                  </div>
                </div>

                {/* Collapsible VoC & Hook details */}
                {showVocDetails && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '6px',
                      borderTop: '1px solid #1e293b',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#38bdf8' }}>💬 VoC (Fora):</strong> {activePreset.vocTrigger}
                    </div>
                    <div style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#34d399' }}>🧬 Mechanizm:</strong> {activePreset.mechanismCore}
                    </div>
                    <div
                      style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#fef3c7',
                        fontWeight: 600,
                      }}
                    >
                      ⚡ Hook: {paragraphs[0] || ''}
                    </div>
                  </div>
                )}
              </div>

              {/* BODY: CLEAN READER OR FULL TEXTAREA EDITOR */}
              {viewMode === 'reader' ? (
                <article
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #e2e8f0',
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
                          background: activeFanpage.badgeColor || '#0f172a',
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
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                          {activeFanpage.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Sponsorowane · {activeStageMeta?.shortLabel} · {activePreset.sophisticationBadge}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {paragraphs.length} akapitów · {liveWordCount} słów
                    </span>
                  </div>

                  {/* Crisp, High-Contrast Paragraphs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                    {paragraphs.map((para, idx) => {
                      const isPs = /^P\.+S\./.test(para);
                      return (
                        <p
                          key={idx}
                          style={{
                            margin: 0,
                            fontSize: '15px',
                            lineHeight: 1.62,
                            color: '#1e293b',
                            fontWeight: idx === 0 || isPs ? 700 : 400,
                            background: idx === 0 ? '#fef3c7' : isPs ? '#f5f3ff' : 'transparent',
                            borderLeft: isPs ? '3px solid #8b5cf6' : 'none',
                            padding: idx === 0 ? '8px 12px' : isPs ? '6px 10px' : 0,
                            borderRadius: idx === 0 || isPs ? '7px' : 0,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {para}
                        </p>
                      );
                    })}
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
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '2px solid #3b82f6',
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

        {/* RIGHT COLUMN: ENLARGED CREATIVE A/B + ZOOMABLE GALLERY + FB PREVIEW + META PUSH */}
        <aside
          style={{
            borderLeft: '1px solid #3e2070',
            background: '#1c0e05',
            height: 'calc(100vh - 135px)',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* CREATIVE A / B SELECTOR WITH CLICK-TO-ZOOM */}
          {activeAd && activePreset && (
            <div
              style={{
                background: '#1d1033',
                border: '1px solid #3e2070',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#ede9fe', textTransform: 'uppercase' }}>
                  🖼️ Kreacje do Kąta #{activePreset.number} (Kliknij zdjęcie, aby powiększyć 🔍)
                </span>
                <button
                  type="button"
                  onClick={() => customFileRef.current?.click()}
                  disabled={uploadingImage}
                  style={{
                    background: '#361b0b',
                    color: '#a78bfa',
                    border: '1px solid #7c3aed',
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
                    ? '#7c2d12'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  border: '1px solid #a78bfa',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: generatingKie5 ? 'wait' : 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
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
                    background: '#120921',
                    border: '1px solid #5c2f14',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#a78bfa' }}>Kreacja A (Główna)</span>
                    <button
                      type="button"
                      onClick={() => openLightboxForUrl(activeAd.imageUrl, `Kreacja A · Kąt #${activePreset.number}`)}
                      style={{
                        background: 'rgba(139, 92, 246, 0.18)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139, 92, 246, 0.45)',
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
                    title="Kliknij, aby powiększyć na cały ekran"
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
                        background: '#261308',
                        display: 'block',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePickerSlot('primary')}
                    style={{
                      background: '#361b0b',
                      color: '#ede9fe',
                      border: '1px solid #5c2f14',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Zmień Kreację A
                  </button>
                </div>

                {/* Secondary Image (Kreacja B) */}
                <div
                  style={{
                    background: '#120921',
                    border: '1px solid #5c2f14',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#c4b5fd' }}>Kreacja B (Split A/B)</span>
                    <button
                      type="button"
                      onClick={() =>
                        openLightboxForUrl(
                          activeAd.secondImageUrl || activeAd.imageUrl,
                          `Kreacja B · Kąt #${activePreset.number}`,
                        )
                      }
                      style={{
                        background: 'rgba(251, 146, 60, 0.15)',
                        color: '#c4b5fd',
                        border: '1px solid rgba(251, 146, 60, 0.4)',
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
                    title="Kliknij, aby powiększyć na cały ekran"
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
                        background: '#261308',
                        display: 'block',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePickerSlot('secondary')}
                    style={{
                      background: '#361b0b',
                      color: '#ede9fe',
                      border: '1px solid #5c2f14',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Zmień Kreację B
                  </button>
                </div>
              </div>

              {/* ANGLE-SPECIFIC GENERATED PHOTOS (4x HOOK + 3x WZÓR NOOM + 1x PRODUKT) */}
              {imageLibrary.some(img => img.angleId === activePreset.id) && (
                <div
                  style={{
                    background: 'rgba(139, 92, 246, 0.12)',
                    border: '1px solid #8b5cf6',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#c4b5fd' }}>
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
                              background: '#1d1033',
                              border: isA
                                ? '2px solid #8b5cf6'
                                : isB
                                ? '2px solid #fbbf24'
                                : '1px solid #5c2f14',
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
                                borderTop: '1px solid #5c2f14',
                                background: '#120921',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleAssignImage(img, 'primary')}
                                style={{
                                  background: isA ? '#7c3aed' : 'transparent',
                                  color: isA ? '#ffffff' : '#c4b5fd',
                                  border: 'none',
                                  borderRight: '1px solid #5c2f14',
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
                                  background: isB ? '#d97706' : 'transparent',
                                  color: isB ? '#ffffff' : '#fcd34d',
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

              {/* ENLARGED GRID OF ALL 15 KIE.AI RAW PHONE PHOTOS (CLICK TO ZOOM, A/B BUTTONS TO ASSIGN) */}
              <div
                style={{
                  background: '#120921',
                  border: '1px solid #3e2070',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#a78bfa' }}>
                    📸 Surowe zdjęcia z telefonu ({imageLibrary.length} szt. · Kliknij zdjęcie = Powiększ 🔍):
                  </span>
                </div>
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
                          background: '#1d1033',
                          border: isA
                            ? '2px solid #8b5cf6'
                            : isB
                            ? '2px solid #fbbf24'
                            : '1px solid #5c2f14',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          onClick={() => setLightboxAsset(img)}
                          title={`${img.label} — Kliknij, aby powiększyć na cały ekran`}
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
                          <span
                            style={{
                              position: 'absolute',
                              top: '5px',
                              left: '5px',
                              background: 'rgba(22, 11, 4, 0.82)',
                              color: '#fff7ed',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            🔍
                          </span>
                          {(isA || isB) && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: isA ? '#7c3aed' : '#d97706',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Aktywna {isA ? 'A' : 'B'}
                            </span>
                          )}
                        </div>

                        {/* Quick Assign A / B bar below each thumbnail */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            borderTop: '1px solid #3e2070',
                            background: '#1c0e05',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleAssignImage(img, 'primary')}
                            style={{
                              background: isA ? '#7c3aed' : 'transparent',
                              color: isA ? '#ffffff' : '#a78bfa',
                              border: 'none',
                              borderRight: '1px solid #3e2070',
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
                              background: isB ? '#d97706' : 'transparent',
                              color: isB ? '#ffffff' : '#c4b5fd',
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

          {/* FANPAGE SELECTOR */}
          <div
            style={{
              background: '#1d1033',
              border: '1px solid #3e2070',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase' }}>
              Tożsamość Fanpage (Meta Page):
            </label>
            <select
              value={editPageId}
              onChange={e => {
                setEditPageId(e.target.value);
                setEditDirty(true);
              }}
              style={{
                width: '100%',
                marginTop: '6px',
                background: '#120921',
                color: '#fff7ed',
                border: '1px solid #5c2f14',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {FELIORA_FANPAGES.map(fp => (
                <option key={fp.id} value={fp.id}>
                  {fp.name} — {fp.role}
                </option>
              ))}
            </select>
          </div>

          {/* REALISTIC FACEBOOK FEED AD PREVIEW */}
          {activeAd && (
            <div
              style={{
                background: '#ffffff',
                color: '#1c1e21',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: activeFanpage.badgeColor || '#111827',
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
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#050505' }}>{activeFanpage.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#65676b' }}>Sponsorowane · 🌍</div>
                </div>
              </div>

              <div style={{ padding: '0 12px 10px 12px', fontSize: '13.5px', lineHeight: 1.45, color: '#050505' }}>
                {paragraphs.slice(0, 2).join('\n\n')}
                <span style={{ color: '#65676b', fontWeight: 600 }}> ... Zobacz więcej</span>
              </div>

              <img
                src={activeAd.imageUrl}
                alt={editHeadline}
                onClick={() => openLightboxForUrl(activeAd.imageUrl, editHeadline)}
                title="Kliknij, aby powiększyć"
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
              />

              <div
                style={{
                  padding: '10px 12px',
                  background: '#f0f2f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#65676b', textTransform: 'uppercase' }}>
                    FELIORA.PL · {editDestinationUrl.includes('/pages/') ? 'ARTYKUŁ / LISTICLE' : 'SKLEP'}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#050505',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {editHeadline}
                  </div>
                  <div style={{ fontSize: '12px', color: '#65676b' }}>{editDescription}</div>
                </div>
                <span
                  style={{
                    background: '#e4e6eb',
                    color: '#050505',
                    padding: '7px 11px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Więcej informacji
                </span>
              </div>
            </div>
          )}

          {/* 1-CLICK PUSH TO META ADS (FEL NATIVE) */}
          <div
            style={{
              background: '#1d1033',
              border: '1px solid #3e2070',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' }}>
              🚀 Eksport do Meta Ads (FEL NATIVE · 1168927131917359)
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 600 }}>Nazwa nowego zestawu (Ad Set):</label>
              <input
                type="text"
                value={pushAdSetName}
                onChange={e => setPushAdSetName(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#120921',
                  color: '#fff',
                  border: '1px solid #5c2f14',
                  borderRadius: '7px',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 600 }}>Tryb Linku Docelowego:</label>
              <select
                value={pushUrlMode}
                onChange={e => setPushUrlMode(e.target.value as 'advertorial' | 'pdp' | 'split_ab')}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#120921',
                  color: '#fff',
                  border: '1px solid #5c2f14',
                  borderRadius: '7px',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              >
                <option value="advertorial">🏆 Tylko Advertorial / Listicle (Winner 5:1)</option>
                <option value="split_ab">⚡ Split 50/50 A/B (Advertorial + Product Page)</option>
                <option value="pdp">📦 Tylko Product Page (PDP)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={pushingMeta}
                onClick={() => handlePushToMeta('active_only')}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {pushingMeta ? 'Wysyłanie...' : `Wyślij Kąt #${activePreset?.number}`}
              </button>

              {selectedAngleIds.length > 0 && (
                <button
                  type="button"
                  disabled={pushingMeta}
                  onClick={() => handlePushToMeta('selected')}
                  style={{
                    flex: 1,
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {pushingMeta ? 'Wysyłanie...' : `Wyślij Zaznaczone (${selectedAngleIds.length})`}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX / ZOOM MODAL */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.92)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            gap: '14px',
          }}
        >
          {/* Top Bar inside Lightbox */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              maxWidth: '920px',
              background: '#111827',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '10px 16px',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#ffffff' }}>{lightboxAsset.label}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {lightboxAsset.adsetOrigin} · Możesz przełączać zdjęcia strzałkami ← / → na klawiaturze
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  handleAssignImage(lightboxAsset, 'primary');
                }}
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ✅ Ustaw jako Kreację A
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAssignImage(lightboxAsset, 'secondary');
                }}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🟦 Ustaw jako Kreację B
              </button>
              <a
                href={lightboxAsset.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '7px',
                  padding: '7px 11px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                ↗ Otwórz w nowej karcie
              </a>
              <button
                type="button"
                onClick={() => setLightboxAsset(null)}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 13px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Zamknij ✕ (ESC)
              </button>
            </div>
          </div>

          {/* Main Enlarged Image with Prev / Next buttons */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              maxWidth: '95vw',
              maxHeight: '78vh',
            }}
          >
            <button
              type="button"
              onClick={() => {
                const idx = imageLibrary.findIndex(img => img.url === lightboxAsset.url);
                if (idx !== -1 && imageLibrary.length > 0) {
                  setLightboxAsset(imageLibrary[(idx - 1 + imageLibrary.length) % imageLibrary.length]);
                }
              }}
              style={{
                background: '#1e293b',
                color: '#ffffff',
                border: '1px solid #475569',
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                fontSize: '20px',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Poprzednie zdjęcie (←)"
            >
              ←
            </button>

            <img
              src={lightboxAsset.url}
              alt={lightboxAsset.label}
              style={{
                maxHeight: '76vh',
                maxWidth: '80vw',
                width: 'auto',
                height: 'auto',
                borderRadius: '12px',
                border: '2px solid #334155',
                boxShadow: '0 20px 50px rgba(0,0,0,0.75)',
                objectFit: 'contain',
              }}
            />

            <button
              type="button"
              onClick={() => {
                const idx = imageLibrary.findIndex(img => img.url === lightboxAsset.url);
                if (idx !== -1 && imageLibrary.length > 0) {
                  setLightboxAsset(imageLibrary[(idx + 1) % imageLibrary.length]);
                }
              }}
              style={{
                background: '#1e293b',
                color: '#ffffff',
                border: '1px solid #475569',
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                fontSize: '20px',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Następne zdjęcie (→)"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* IMAGE PICKER MODAL */}
      {imagePickerSlot && (
        <div
          onClick={() => setImagePickerSlot(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.78)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111827',
              border: '1px solid #334155',
              borderRadius: '14px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                Wybierz grafikę ({imagePickerSlot === 'primary' ? 'Kreacja A — Główna' : 'Kreacja B — Split A/B'}) dla Kąta #
                {activePreset?.number}
              </h3>
              <button
                type="button"
                onClick={() => setImagePickerSlot(null)}
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                Zamknij ✕
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                gap: '12px',
              }}
            >
              {imageLibrary.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => handleAssignImage(asset, imagePickerSlot)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <img
                    src={asset.url}
                    alt={asset.label}
                    style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#e2e8f0' }}>{asset.label}</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{asset.adsetOrigin}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MATRIX MODAL: 5 AWARENESS STAGES & MARKET SOPHISTICATION */}
      {showMatrixModal && (
        <div
          onClick={() => setShowMatrixModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111827',
              border: '1px solid #334155',
              borderRadius: '14px',
              maxWidth: '980px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#ffffff' }}>
                  📊 Architektura Batcha Feliora PL: 5 Awareness Stages × Poziomy Sofistykacji (VoC Miau.pl / Wykop)
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Wszystkie 25 reklam (1 100–1 350 słów każda) napisane na bazie polskiego języka właścicieli kotów z forów.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Zamknij ✕
              </button>
            </div>

            {STAGE_ORDER.map(stKey => {
              const st = FELIORA_STAGES[stKey];
              const stagePresets = presets.filter(p => p.stageId === stKey);
              return (
                <div
                  key={stKey}
                  style={{
                    background: '#0f172a',
                    border: `1px solid ${st.color}55`,
                    borderLeft: `5px solid ${st.color}`,
                    borderRadius: '10px',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14.5px', color: '#ffffff' }}>{st.title}</strong>
                    <span
                      style={{
                        background: '#1e293b',
                        color: '#38bdf8',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '5px',
                      }}
                    >
                      {st.sophisticationLabel}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#cbd5e1' }}>
                    <strong>Stan umysłu klienta:</strong> {st.subtitle} | <strong>VoC Fora:</strong> {st.vocSummary}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
                    {stagePresets.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveAngleId(p.id);
                          setShowMatrixModal(false);
                        }}
                        style={{
                          background: '#111827',
                          border: '1px solid #1e293b',
                          borderRadius: '7px',
                          padding: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 800, color: st.color }}>
                          #{String(p.number).padStart(2, '0')} · {p.recommendedFanpageName}
                        </div>
                        <div style={{ fontWeight: 600, color: '#f1f5f9', marginTop: '3px' }}>{p.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
