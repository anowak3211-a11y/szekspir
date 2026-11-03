'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AntkiPlBrandSwitcher, {
  formatAntekFullDate,
  formatAntekShortDate,
  type AntkiPlBrandKey,
} from '@/app/components/antki-pl-brand-switcher';
import {
  FELIORA_PIES_DEFAULT_URL,
  FELIORA_PIES_FANPAGES,
  FELIORA_PIES_IMAGE_LIBRARY,
  FELIORA_PIES_PDP_URL,
  FELIORA_PIES_PRESET_ANGLES,
  FELIORA_PIES_STAGES,
  buildAllFelioraPiesPrewrittenAds,
  type FelioraPiesAnglePreset,
  type FelioraPiesAwarenessStageId,
  type FelioraPiesImageAsset,
  type FelioraPiesPlGeneratedAd,
  type FelioraPiesProblemCluster,
  type FelioraPiesSophisticationLevel,
} from '@/lib/feliora-pies-pl';

const PROBLEM_CLUSTER_LABELS: Record<FelioraPiesProblemCluster, { label: string; color: string }> = {
  KARTKA_SASIEDZI_WYCIE: { label: '📝 Kartka na drzwiach / wycie 8h / kamera Live', color: '#ea580c' },
  DEMOLKA_DRZWI_KANAPA: { label: '🚪 Wydrapane drzwi MDF / kanapa 5 500 zł', color: '#dc2626' },
  SCHRONISKO_KLATKA_KALUZE: { label: '🐾 Pies po przejściach / klatka / kałuże', color: '#0284c7' },
  BURZE_PETARDY_SYLWESTER: { label: '⛈️ Burze, petardy i dług kortyzolowy 72h', color: '#7c3aed' },
  ZDEMASKOWANIE_TRENINGU_SEDACJI: { label: '✂️ Demaskacja 30 sekund, Sedalinu i obroży', color: '#d97706' },
  DAP_PRZEDPOKOJ_DUZE_PSY: { label: '🔬 Rdzeń 5W, polski przedpokój & owczarek 38 kg', color: '#059669' },
  MATEMATYKA_GWARANCJA_30DNI: { label: '🛡️ Matematyka 2 524 zł vs 94,99 zł/szt. & 30 dni', color: '#0d9488' },
};

const STAGE_ORDER: FelioraPiesAwarenessStageId[] = [
  'stage1_unaware',
  'stage2_problem_aware',
  'stage3_solution_aware',
  'stage4_product_aware',
  'stage5_most_aware',
];

interface FelioraPiesPlWorkspaceProps {
  onSwitchToBennettUk?: () => void;
  onSwitchToSardianSzampon?: () => void;
  onSwitchToStryde?: () => void;
  onSwitchToFeliora?: () => void;
  onSwitchToOrthomax?: () => void;
}

export default function FelioraPiesPlWorkspace({
  onSwitchToBennettUk,
  onSwitchToSardianSzampon,
  onSwitchToStryde,
  onSwitchToFeliora,
  onSwitchToOrthomax,
}: FelioraPiesPlWorkspaceProps) {
  const [presets, setPresets] = useState<FelioraPiesAnglePreset[]>(FELIORA_PIES_PRESET_ANGLES);
  const [ads, setAds] = useState<FelioraPiesPlGeneratedAd[]>(() => buildAllFelioraPiesPrewrittenAds());
  const [imageLibrary, setImageLibrary] = useState<FelioraPiesImageAsset[]>(FELIORA_PIES_IMAGE_LIBRARY);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Sorting & Filtering
  const [sidebarSort, setSidebarSort] = useState<'newest' | 'oldest' | 'stages'>('newest');
  const [stageFilter, setStageFilter] = useState<'all' | FelioraPiesAwarenessStageId>('all');
  const [sophFilter, setSophFilter] = useState<'all' | FelioraPiesSophisticationLevel>('all');
  const [clusterFilter, setClusterFilter] = useState<'all' | FelioraPiesProblemCluster>('all');
  const [fanpageFilter, setFanpageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Active angle & Selection
  const [activeAngleId, setActiveAngleId] = useState<string>('dog-01-anonimowa-kartka-na-drzwiach-art51');
  const [selectedAngleIds, setSelectedAngleIds] = useState<string[]>([]);

  // Reader vs Editor mode
  const [viewMode, setViewMode] = useState<'reader' | 'editor'>('reader');
  const [editHeadline, setEditHeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrimaryText, setEditPrimaryText] = useState('');
  const [editDestinationUrl, setEditDestinationUrl] = useState(FELIORA_PIES_PDP_URL);
  const [editPageId, setEditPageId] = useState('798916893308685');
  const [editDirty, setEditDirty] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Image Picker Modal & Fullscreen Lightbox
  const [imagePickerSlot, setImagePickerSlot] = useState<null | 'primary'>(null);
  const [lightboxAsset, setLightboxAsset] = useState<FelioraPiesImageAsset | null>(null);
  const [showVocDetails, setShowVocDetails] = useState(false);
  const customFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Meta Push state
  const [pushCampaignId, setPushCampaignId] = useState<string>('120250116221490298');
  const [pushAdSetName, setPushAdSetName] = useState('01.11 - FELIORA PSY ANTEK BATCH');
  const [pushStatus] = useState<'PAUSED' | 'ACTIVE'>('PAUSED');
  const [pushingMeta, setPushingMeta] = useState(false);

  const FELIORA_PIES_LOCAL_IMAGES_KEY = 'feliora_pies_pl_saved_images_v4';

  const applyLocalImageOverrides = useCallback((list: FelioraPiesPlGeneratedAd[]): FelioraPiesPlGeneratedAd[] => {
    try {
      if (typeof window === 'undefined') return list;
      const raw = window.localStorage.getItem(FELIORA_PIES_LOCAL_IMAGES_KEY);
      if (!raw) return list;
      const localMap = JSON.parse(raw) as Record<
        string,
        {
          imageUrl?: string;
          imageHash?: string;
          updatedAt?: number;
        }
      >;
      return list.map(ad => {
        const loc = localMap[ad.angleId];
        if (!loc) return ad;
        return {
          ...ad,
          ...(loc.imageUrl ? { imageUrl: loc.imageUrl, imageHash: loc.imageHash || ad.imageHash } : {}),
          secondImageUrl: undefined,
          secondImageHash: undefined,
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
        updatedAt: number;
      },
    ) => {
      try {
        if (typeof window === 'undefined') return;
        const raw = window.localStorage.getItem(FELIORA_PIES_LOCAL_IMAGES_KEY);
        const current = raw ? JSON.parse(raw) : {};
        current[angleId] = {
          ...(current[angleId] || {}),
          ...patch,
        };
        window.localStorage.setItem(FELIORA_PIES_LOCAL_IMAGES_KEY, JSON.stringify(current));
      } catch {
        // Ignore storage errors
      }
    },
    [],
  );

  const loadFromServer = useCallback(async () => {
    try {
      setAds(prev => applyLocalImageOverrides(prev));
      const res = await fetch('/api/feliora-pies-pl', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.savedAds) && data.savedAds.length > 0) {
        setAds(applyLocalImageOverrides(data.savedAds));
        if (Array.isArray(data.presets)) setPresets(data.presets);
        if (Array.isArray(data.imageLibrary)) setImageLibrary(data.imageLibrary);
      }
    } catch {
      // Fallback to local prebuilt ads
    }
  }, [applyLocalImageOverrides]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const adByAngleId = useMemo(() => {
    const map = new Map<string, FelioraPiesPlGeneratedAd>();
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
    setEditDestinationUrl(activeAd.destinationUrl || FELIORA_PIES_PDP_URL);
    setEditPageId(activeAd.pageId || activePreset?.recommendedFanpageId || '798916893308685');
    setEditDirty(false);
  }, [activeAd, activePreset]);

  const filteredPresets = useMemo(() => {
    return presets.filter(p => {
      if (stageFilter !== 'all' && p.stageId !== stageFilter) return false;
      if (sophFilter !== 'all' && p.sophisticationLevel !== sophFilter) return false;
      if (clusterFilter !== 'all' && p.problemCluster !== clusterFilter) return false;
      const ad = adByAngleId.get(p.id);
      const effectivePageId = ad?.pageId || p.recommendedFanpageId;
      if (fanpageFilter !== 'all' && effectivePageId !== fanpageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${p.number} ${p.code} ${p.title} ${p.shortTitle} ${p.problemLabel} ${p.vocTrigger} ${ad?.primaryText || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [presets, stageFilter, sophFilter, clusterFilter, fanpageFilter, searchQuery, adByAngleId]);

  const groupedByStage = useMemo(() => {
    return STAGE_ORDER.map(stageKey => {
      const stageMeta = FELIORA_PIES_STAGES[stageKey];
      const items = filteredPresets.filter(p => p.stageId === stageKey);
      return { stageKey, stageMeta, items };
    }).filter(g => g.items.length > 0);
  }, [filteredPresets]);

  const groupedByDate = useMemo(() => {
    const sorted = [...filteredPresets].sort((a, b) => {
      const adA = adByAngleId.get(a.id);
      const adB = adByAngleId.get(b.id);
      const tsA = adA?.updatedAt || adA?.createdAt || 0;
      const tsB = adB?.updatedAt || adB?.createdAt || 0;
      if (tsA !== tsB) {
        return sidebarSort === 'oldest' ? tsA - tsB : tsB - tsA;
      }
      return sidebarSort === 'oldest' ? a.number - b.number : a.number - b.number;
    });
    const map = new Map<string, FelioraPiesAnglePreset[]>();
    for (const p of sorted) {
      const ad = adByAngleId.get(p.id);
      const dayLabel = formatAntekFullDate(ad?.updatedAt || ad?.createdAt);
      const bucket = map.get(dayLabel) || [];
      bucket.push(p);
      map.set(dayLabel, bucket);
    }
    return Array.from(map.entries()).map(([dateLabel, items]) => ({ dateLabel, items }));
  }, [filteredPresets, adByAngleId, sidebarSort]);

  const handleBrandSelect = useCallback(
    (brand: AntkiPlBrandKey) => {
      if (brand === 'bennett-uk') {
        if (onSwitchToBennettUk) onSwitchToBennettUk();
        else window.location.href = '/antki-pl?brand=bennett-uk';
      } else if (brand === 'sardian-szampon') {
        if (onSwitchToSardianSzampon) onSwitchToSardianSzampon();
        else window.location.href = '/antki-pl?brand=sardian-szampon';
      } else if (brand === 'stryde') {
        if (onSwitchToStryde) onSwitchToStryde();
        else window.location.href = '/antki-pl?brand=stryde';
      } else if (brand === 'feliora') {
        if (onSwitchToFeliora) onSwitchToFeliora();
        else window.location.href = '/antki-pl?brand=feliora';
      } else if (brand === 'orthomax') {
        if (onSwitchToOrthomax) onSwitchToOrthomax();
        else window.location.href = '/antki-pl?brand=orthomax';
      }
    },
    [onSwitchToBennettUk, onSwitchToSardianSzampon, onSwitchToStryde, onSwitchToFeliora, onSwitchToOrthomax],
  );

  const handleSyncFanpages = useCallback(async () => {
    try {
      setError('');
      const res = await fetch('/api/feliora-pies-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_fanpages' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd synchronizacji Fanpage.');
      if (Array.isArray(data.savedAds)) setAds(applyLocalImageOverrides(data.savedAds));
      setNotice('✅ Zsynchronizowano wszystkie 25 kątów z właściwymi Fanpage’ami z BM (Weterynarz / Opiekunowie / Społeczność)!');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd synchronizacji Fanpage.');
    }
  }, [applyLocalImageOverrides]);

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
      const selectedFp = FELIORA_PIES_FANPAGES.find(f => f.id === editPageId) || FELIORA_PIES_FANPAGES[0];
      const updatedPayload: FelioraPiesPlGeneratedAd = {
        ...activeAd,
        headline: editHeadline,
        description: editDescription,
        primaryText: editPrimaryText,
        destinationUrl: editDestinationUrl,
        pageId: selectedFp.id,
        pageName: selectedFp.name,
      };
      const res = await fetch('/api/feliora-pies-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', ad: updatedPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu.');
      if (Array.isArray(data.savedAds)) setAds(applyLocalImageOverrides(data.savedAds));
      setEditDirty(false);
      setNotice(`Zapisano zmiany dla kąta #${activePreset.number}`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu.');
    } finally {
      setSavingEdit(false);
    }
  }, [activeAd, activePreset, editHeadline, editDescription, editPrimaryText, editDestinationUrl, editPageId, applyLocalImageOverrides]);

  const handleAssignImage = useCallback(
    async (asset: FelioraPiesImageAsset, closeLightbox = false) => {
      if (!activePreset) return;
      const targetAngleId = activePreset.id;
      const now = Date.now();

      setAds(prev =>
        prev.map(ad =>
          ad.angleId === targetAngleId
            ? {
                ...ad,
                imageUrl: asset.url,
                imageHash: asset.imageHash || ad.imageHash,
                secondImageUrl: undefined,
                secondImageHash: undefined,
                updatedAt: now,
              }
            : ad,
        ),
      );
      persistLocalImageOverride(targetAngleId, {
        imageUrl: asset.url,
        imageHash: asset.imageHash || '',
        updatedAt: now,
      });
      setImagePickerSlot(null);
      if (closeLightbox) {
        setLightboxAsset(null);
      }
      setError('');
      const msg = `✅ Ustawiono obrazek 1:1 dla Kąta #${activePreset.number}: „${asset.label}”`;
      setNotice(msg);
      setTimeout(() => {
        setNotice(prev => (prev === msg ? '' : prev));
      }, 3500);

      try {
        await fetch('/api/feliora-pies-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'set_image',
            angleId: targetAngleId,
            imageUrl: asset.url,
            imageHash: asset.imageHash,
            secondImageUrl: null,
          }),
        });
      } catch {
        // Optimistic + localStorage already saved
      }
    },
    [activePreset, persistLocalImageOverride],
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
        const res = await fetch('/api/feliora-pies-pl', {
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
  const inFlightKieAnglesRef = useRef<Set<string>>(new Set());

  const triggerKieForPreset = useCallback(
    async (targetPreset: FelioraPiesAnglePreset) => {
      const targetAngleId = targetPreset.id;
      if (inFlightKieAnglesRef.current.has(targetAngleId)) return;

      const adForAngle = adByAngleId.get(targetAngleId);
      const copyText = (
        (activePreset?.id === targetAngleId ? editPrimaryText : '') ||
        adForAngle?.primaryText ||
        targetPreset.vocTrigger ||
        targetPreset.title
      ).trim();
      const copyHeadline = (
        (activePreset?.id === targetAngleId ? editHeadline : '') ||
        adForAngle?.headline ||
        targetPreset.title
      ).trim();
      if (!copyText) return;

      inFlightKieAnglesRef.current.add(targetAngleId);
      setGeneratingKie5(true);
      setError('');
      setNotice(
        `Analizuję Hook i generuję 1 dedykowany obrazek iPhone 15 Pro 1:1 (Styl Sardian · 2K) w Kie.ai dla kąta #${targetPreset.number}...`,
      );
      try {
        const res = await fetch('/api/feliora-pies-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_5_kie_images',
            angleId: targetAngleId,
            primaryText: copyText,
            headline: copyHeadline,
            title: targetPreset.title,
            single: true,
            count: 1,
            isManual: true,
          }),
        });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data.tasks) || data.tasks.length === 0) {
          throw new Error(data.error || 'Błąd uruchamiania zadania Kie.ai.');
        }
        const tasks = data.tasks as Array<{ taskId: string; label: string; prompt: string }>;
        setNotice(
          `Google AI (Kie.ai) generuje ${tasks.length} czystych zdjęć iPhone 15 Pro 1:1 (Styl Sardian · 2K) dla kąta #${targetPreset.number} (~25-45s)...`,
        );
        let completed = 0;
        await Promise.all(
          tasks.map(async t => {
            for (let attempt = 0; attempt < 45; attempt++) {
              await new Promise(r => setTimeout(r, 3500));
              try {
                const pollRes = await fetch('/api/feliora-pies-pl', {
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
                  const isScene1 = /^1\./.test(t.label) || tasks.length === 1;
                  if (isScene1) {
                    persistLocalImageOverride(targetAngleId, {
                      imageUrl: pollData.asset.url,
                      imageHash: pollData.asset.imageHash,
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
          setNotice(`✅ Wygenerowano ${completed}/${tasks.length} czystych zdjęć iPhone 1:1 (Styl Sardian · 2K) dla kąta #${targetPreset.number}!`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Błąd generowania zdjęć Clean iPhone 1:1 w Kie.ai.';
        setError(msg);
      } finally {
        inFlightKieAnglesRef.current.delete(targetAngleId);
        setGeneratingKie5(false);
      }
    },
    [adByAngleId, activePreset, editPrimaryText, editHeadline, persistLocalImageOverride, applyLocalImageOverrides],
  );

  const handleGenerate5KieImages = useCallback(async () => {
    if (!activePreset) return;
    await triggerKieForPreset(activePreset);
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
        const res = await fetch('/api/feliora-pies-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'push_to_meta',
            angleIds: targetIds,
            campaignId: pushCampaignId,
            adSetName: pushAdSetName,
            urlMode: 'pdp',
            adStatus: pushStatus,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Błąd wysyłki do Meta Ads.');
        setNotice(
          `Wysłano do Meta Ads! Utworzono Ad Set "${data.adSetName}" (${data.adSetId}) oraz ${data.createdAdsCount} reklam (1 obrazek / kopię).`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd podczas wysyłki do Meta Ads.');
      } finally {
        setPushingMeta(false);
      }
    },
    [selectedAngleIds, activePreset, pushCampaignId, pushAdSetName, pushStatus],
  );

  const activeStageMeta = activePreset ? FELIORA_PIES_STAGES[activePreset.stageId] : null;
  const activeFanpage = useMemo(
    () => FELIORA_PIES_FANPAGES.find(f => f.id === editPageId) || FELIORA_PIES_FANPAGES[0],
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
        background: 'linear-gradient(180deg, #1b0f08 0%, #100804 100%)',
        color: '#fff7ed',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOP BAR: BRAND SWITCHER & FELIORA DOG OFFER SUMMARY */}
      <header
        style={{
          background: 'linear-gradient(90deg, #2d1608 0%, #17251e 100%)',
          borderBottom: '1px solid #5c2f14',
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
              color: '#fed7aa',
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

          <AntkiPlBrandSwitcher activeBrand="feliora-pies" onSelectBrand={handleBrandSelect} />

          <button
            type="button"
            onClick={() => setShowMatrixModal(true)}
            style={{
              background: '#361b0b',
              color: '#fcd34d',
              border: '1px solid #d97706',
              borderRadius: '8px',
              padding: '7px 13px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📊 Matryca 5 Stages & VoC Psiarzy (Dogomania / Wykop / Reddit)
          </button>
        </div>

        {/* DOG OFFER & VOC CALLOUT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            borderRadius: '10px',
            padding: '7px 14px',
            fontSize: '12.5px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🐶</span>
          <div>
            <strong style={{ color: '#6ee7b7' }}>FELIORA D.A.P. DLA PSÓW:</strong>{' '}
            <span style={{ color: '#ecfdf5' }}>
              Pakiet 2 Pokoje <strong>189,99 zł</strong> (<strong>94,99 zł/szt.</strong>) · 1 wkład = do{' '}
              <strong>60 dni</strong> · <strong>30 Dni Gwarancji Zwrotu</strong>
            </span>
          </div>
        </div>
      </header>

      {/* NOTIFICATION / ERROR BANNERS */}
      {(notice || error) && (
        <div
          style={{
            padding: '10px 20px',
            background: error ? '#7f1d1d' : '#047857',
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
          background: '#221208',
          borderBottom: '1px solid #5c2f14',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* ROW 1: 5 SCHWARTZ AWARENESS STAGE PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#fdba74', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Etap Świadomości (Schwartz):
          </span>

          <button
            type="button"
            onClick={() => setStageFilter('all')}
            style={{
              padding: '7px 13px',
              borderRadius: '8px',
              border: stageFilter === 'all' ? '1px solid #d97706' : '1px solid #5c2f14',
              background: stageFilter === 'all' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : '#140a04',
              color: stageFilter === 'all' ? '#ffffff' : '#fed7aa',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Wszystkie (25)
          </button>

          {STAGE_ORDER.map(stKey => {
            const st = FELIORA_PIES_STAGES[stKey];
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
                  border: active ? `1px solid ${st.color}` : '1px solid #5c2f14',
                  background: active ? `${st.color}38` : '#140a04',
                  color: active ? '#ffffff' : '#fed7aa',
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
                <span style={{ color: '#fdba74', fontSize: '11px' }}>({rangeBadge})</span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: SECONDARY FILTERS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={sophFilter === 'all' ? 'all' : String(sophFilter)}
            onChange={e =>
              setSophFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as FelioraPiesSophisticationLevel))
            }
            style={{
              background: '#140a04',
              color: '#ffedd5',
              border: '1px solid #5c2f14',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">🔬 Wszystkie Poziomy Sofistykacji (Poziom 3–5)</option>
            <option value="3">Poziom 3: Mechanizm Paniki (Blokada Trawienia / Dług Kortyzolowy 72h)</option>
            <option value="4">Poziom 4: Demaskacja Alternatyw (30 Sekund / Sedalin / Mit 38 kg)</option>
            <option value="5">Poziom 5: Przewaga Technologiczna (D.A.P. / Rdzeń 5W / 60 Dni)</option>
          </select>

          <select
            value={clusterFilter}
            onChange={e => setClusterFilter(e.target.value as 'all' | FelioraPiesProblemCluster)}
            style={{
              background: '#140a04',
              color: '#ffedd5',
              border: '1px solid #5c2f14',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">🐶 Wszystkie Problemy Psiarzy z Forów (7 klastrów)</option>
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
              background: '#140a04',
              color: '#ffedd5',
              border: '1px solid #5c2f14',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            <option value="all">
              📣 Wszystkie Fanpage ({FELIORA_PIES_FANPAGES.length} spójnych profili: Weterynarz / Opiekunowie / Społeczność)
            </option>
            {FELIORA_PIES_FANPAGES.map(fp => (
              <option key={fp.id} value={fp.id}>
                {fp.name} ({fp.role})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void handleSyncFanpages()}
            title="Przypisz wszystkim 25 kątom właściwe fanpage’e person/eksperta z BM dopasowane do płci i głosu narratora"
            style={{
              background: 'rgba(16, 185, 129, 0.16)',
              color: '#6ee7b7',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              borderRadius: '7px',
              padding: '6px 11px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔄 Synchronizuj Fanpage z BM
          </button>

          <input
            type="text"
            placeholder="🔍 Szukaj kąta, cytatu z Dogomanii, art. 51 KW, owczarek, petardy..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: '1 1 220px',
              background: '#140a04',
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
                color: '#fed7aa',
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
          alignItems: 'start',
          flex: 1,
          minHeight: 'calc(100vh - 135px)',
        }}
      >
        {/* LEFT COLUMN: SORTED & GROUPED LIST OF 25 ANGLES */}
        <aside
          style={{
            borderRight: '1px solid #5c2f14',
            background: '#180c05',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            maxHeight: '100vh',
            overflowY: 'auto',
            paddingBottom: '120px',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #5c2f14',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
              background: '#261308',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffedd5' }}>
                KĄTY PSY ({filteredPresets.length} / 25)
              </span>
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                style={{
                  background: '#361b0b',
                  color: '#fcd34d',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
              {[
                { id: 'newest' as const, label: '🕒 Najnowsze' },
                { id: 'oldest' as const, label: '📅 Najstarsze' },
                { id: 'stages' as const, label: '📊 Stages' },
              ].map(opt => {
                const active = sidebarSort === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSidebarSort(opt.id)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      fontWeight: active ? 800 : 600,
                      cursor: 'pointer',
                      border: active ? '1px solid #f59e0b' : '1px solid #5c2f14',
                      background: active ? 'rgba(245, 158, 11, 0.24)' : '#140a04',
                      color: active ? '#fffbeb' : '#fed7aa',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(sidebarSort === 'stages'
              ? groupedByStage.map(({ stageKey, stageMeta, items }) => ({
                  groupKey: stageKey,
                  bannerTitle: stageMeta.shortLabel,
                  bannerRight: `Poz. ${stageMeta.sophisticationLevel}`,
                  bannerColor: stageMeta.color,
                  items,
                }))
              : groupedByDate.map(({ dateLabel, items }) => ({
                  groupKey: dateLabel,
                  bannerTitle: `📅 ${dateLabel}`,
                  bannerRight: `${items.length} szt.`,
                  bannerColor: '#f59e0b',
                  items,
                }))
            ).map(({ groupKey, bannerTitle, bannerRight, bannerColor, items }) => (
              <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{
                    padding: '6px 9px',
                    borderRadius: '7px',
                    background: 'rgba(217, 119, 6, 0.16)',
                    borderLeft: `4px solid ${bannerColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fff7ed', textTransform: 'uppercase' }}>
                      {bannerTitle}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#fed7aa',
                        background: '#361b0b',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      {bannerRight}
                    </span>
                  </div>
                </div>

                {items.map(preset => {
                  const ad = adByAngleId.get(preset.id);
                  const isActive = preset.id === activePreset?.id;
                  const isSelected = selectedAngleIds.includes(preset.id);
                  const clusterInfo = PROBLEM_CLUSTER_LABELS[preset.problemCluster];
                  const stageMeta = FELIORA_PIES_STAGES[preset.stageId];
                  const resolvedFpName = ad?.pageName || preset.recommendedFanpageName;
                  const resolvedFpId = ad?.pageId || preset.recommendedFanpageId;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setActiveAngleId(preset.id)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: '9px',
                        background: isActive ? 'rgba(217, 119, 6, 0.22)' : '#120904',
                        border: isActive ? '2px solid #f59e0b' : '1px solid #3d200d',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
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
                              fontWeight: 800,
                              color: '#fde68a',
                              background: 'rgba(245, 158, 11, 0.16)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                            }}
                            title={`Utworzono: ${formatAntekFullDate(ad?.createdAt)} · Ostatnia edycja: ${formatAntekFullDate(ad?.updatedAt)}`}
                          >
                            📅 {formatAntekShortDate(ad?.updatedAt || ad?.createdAt)}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: resolvedFpId === '1287239777799682' ? '#bfdbfe' : '#a7f3d0',
                              background: '#261308',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid #5c2f14',
                            }}
                          >
                            {resolvedFpName}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: ad?.auditPassed !== false ? '#34d399' : '#fbbf24',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {ad?.wordCount || 1180} sł. ✓
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: isActive ? '#ffffff' : '#ffedd5',
                          lineHeight: 1.3,
                        }}
                      >
                        {preset.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#ffedd5',
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

        {/* CENTER COLUMN: READER & EDITOR */}
        <main
          style={{
            position: 'static',
            background: '#120904',
            minHeight: 'calc(100vh - 135px)',
            padding: '12px 16px 200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {activePreset && activeAd && (
            <>
              <div
                style={{
                  position: 'static',
                  background: '#221208',
                  border: '1px solid #5c2f14',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        background: activeStageMeta?.color || '#d97706',
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
                      {showVocDetails ? '▲ Zwiń Nagłówek & VoC' : '⚙️ Nagłówek & VoC'}
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

                {showVocDetails && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid #3d200d',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '8px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#fdba74', whiteSpace: 'nowrap' }}>Nagłówek:</span>
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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#fdba74', whiteSpace: 'nowrap' }}>Link PDP:</span>
                        <input
                          type="text"
                          value={editDestinationUrl}
                          onChange={e => {
                            setEditDestinationUrl(e.target.value || FELIORA_PIES_DEFAULT_URL);
                            setEditDirty(true);
                          }}
                          style={{
                            width: '100%',
                            background: '#0f172a',
                            color: '#34d399',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ color: '#ffedd5' }}>
                      <strong style={{ color: '#38bdf8' }}>💬 VoC (Fora psiarzy):</strong> {activePreset.vocTrigger}
                    </div>
                    <div style={{ color: '#ffedd5' }}>
                      <strong style={{ color: '#34d399' }}>🧬 Mechanizm D.A.P.:</strong> {activePreset.mechanismCore}
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
                          background: activeFanpage.badgeColor || '#047857',
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
                            background: idx === 0 ? '#fef3c7' : isPs ? '#ecfdf5' : 'transparent',
                            borderLeft: isPs ? '3px solid #059669' : 'none',
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
                      border: '2px solid #d97706',
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

        {/* RIGHT COLUMN: CREATIVE A/B + ZOOMABLE GALLERY + FB PREVIEW + META PUSH */}
        <aside
          style={{
            borderLeft: '1px solid #5c2f14',
            background: '#180c05',
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
                background: '#221208',
                border: '1px solid #5c2f14',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#ffedd5', textTransform: 'uppercase' }}>
                  🖼️ Kreacje do Kąta #{activePreset.number} (Kliknij zdjęcie, aby powiększyć 🔍)
                </span>
                <button
                  type="button"
                  onClick={() => customFileRef.current?.click()}
                  disabled={uploadingImage}
                  style={{
                    background: '#361b0b',
                    color: '#fcd34d',
                    border: '1px solid #d97706',
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
                    : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#ffffff',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: generatingKie5 ? 'wait' : 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 2px 10px rgba(217, 119, 6, 0.3)',
                }}
              >
                {generatingKie5
                  ? '⏳ Generuję 1 czysty obrazek iPhone 15 Pro 1:1 pod Hook tego kąta (Styl Sardian · 2K)...'
                  : '📸 Wygeneruj 1 nowy obrazek iPhone 1:1 pod Hook tego kąta (Bez Splitu A/B)'}
              </button>

              {/* Single Active 1:1 Hook-Congruent Image */}
              <div
                style={{
                  background: '#120904',
                  border: '1px solid #5c2f14',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399' }}>
                    ✓ Aktywny Obrazek 1:1 · Kąt #{activePreset.number} (Bez A/B Testu)
                  </span>
                  <button
                    type="button"
                    onClick={() => openLightboxForUrl(activeAd.imageUrl, `Obrazek · Kąt #${activePreset.number}`)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.18)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      borderRadius: '5px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔍 Powiększ
                  </button>
                </div>
                <div
                  onClick={() => openLightboxForUrl(activeAd.imageUrl, `Obrazek · Kąt #${activePreset.number}`)}
                  title="Kliknij, aby powiększyć na cały ekran"
                  style={{ position: 'relative', cursor: 'zoom-in', maxWidth: '340px', width: '100%', margin: '0 auto' }}
                >
                  <img
                    src={activeAd.imageUrl}
                    alt={`Kąt #${activePreset.number}`}
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      objectFit: 'cover',
                      objectPosition: 'center',
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
                    color: '#ffedd5',
                    border: '1px solid #5c2f14',
                    borderRadius: '6px',
                    padding: '7px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Zmień obrazek z biblioteki (25 dedykowanych 1:1)
                </button>
              </div>

              {/* ANGLE-SPECIFIC PHOTOS */}
              {imageLibrary.some(img => img.angleId === activePreset.id) && (
                <div
                  style={{
                    background: 'rgba(217, 119, 6, 0.12)',
                    border: '1px solid #d97706',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fcd34d' }}>
                    ✨ Dedykowany obrazek 1:1 pod Hook Kąta #{activePreset.number} ({imageLibrary.filter(img => img.angleId === activePreset.id).length} szt.):
                  </span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {imageLibrary
                      .filter(img => img.angleId === activePreset.id)
                      .map(img => {
                        const isA = activeAd.imageUrl === img.url;
                        return (
                          <div
                            key={`angle-${img.id}`}
                            style={{
                              position: 'relative',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: '#221208',
                              border: isA ? '2px solid #10b981' : '1px solid #5c2f14',
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
                                  objectPosition: 'center',
                                  display: 'block',
                                }}
                              />
                              {isA && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: '#047857',
                                    color: '#fff',
                                    fontSize: '9.5px',
                                    fontWeight: 800,
                                    padding: '2px 5px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Aktywny
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => void handleAssignImage(img)}
                              style={{
                                background: isA ? '#047857' : '#120904',
                                color: isA ? '#ffffff' : '#6ee7b7',
                                border: 'none',
                                borderTop: '1px solid #5c2f14',
                                padding: '6px 4px',
                                fontSize: '10.5px',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                            >
                              {isA ? '✓ Aktywny obrazek' : 'Ustaw ten obrazek'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* IMAGE LIBRARY GRID */}
              <div
                style={{
                  background: '#120904',
                  border: '1px solid #5c2f14',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#fcd34d' }}>
                    📸 Wszystkie 25 dedykowanych kreacji 1:1 ({imageLibrary.length} szt. · Kliknij = Powiększ 🔍):
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
                    return (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#221208',
                          border: isA ? '2px solid #10b981' : '1px solid #5c2f14',
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
                          {isA && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: '#047857',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Aktywny
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleAssignImage(img)}
                          style={{
                            background: isA ? '#047857' : '#180c05',
                            color: isA ? '#ffffff' : '#6ee7b7',
                            border: 'none',
                            borderTop: '1px solid #5c2f14',
                            padding: '6px 4px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          {isA ? '✓ Aktywny obrazek' : 'Ustaw obrazek'}
                        </button>
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
              background: '#221208',
              border: '1px solid #5c2f14',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#fdba74', textTransform: 'uppercase' }}>
              Tożsamość Fanpage (Meta Page · Spójny Głos Narratora):
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
                background: '#120904',
                color: '#fff7ed',
                border: '1px solid #5c2f14',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {FELIORA_PIES_FANPAGES.map(fp => (
                <option key={fp.id} value={fp.id}>
                  {fp.name} - {fp.role}
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
              <div
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: activeFanpage.badgeColor || '#047857',
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

                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                  }}
                >
                  1:1 Hook Photo
                </span>
              </div>

              <div style={{ padding: '10px 12px', fontSize: '13.5px', lineHeight: 1.45, color: '#050505' }}>
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
                    FELIORA.PL · DYFUZOR DLA PSÓW
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

          {/* 1-CLICK PUSH TO META ADS */}
          <div
            style={{
              background: '#221208',
              border: '1px solid #5c2f14',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#fcd34d', textTransform: 'uppercase' }}>
              🚀 Eksport do Meta Ads (Konto 1168927131917359 · Pixel ORTH F)
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#fed7aa', fontWeight: 600 }}>Kampania docelowa (Meta CBO):</label>
              <select
                value={pushCampaignId}
                onChange={e => setPushCampaignId(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#120904',
                  color: '#fff',
                  border: '1px solid #5c2f14',
                  borderRadius: '7px',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              >
                <option value="120250116221490298">🐶 pieski fel · CBO (120250116221490298 · Dedykowana Psy)</option>
                <option value="CREATE_NEW_DOG_CBO">✨ Nowa osobna kampania CBO: FEL PSY NATIVE (150 zł/d · PAUSED)</option>
                <option value="120248696945370298">🐾 FEL NATIVE · CBO (120248696945370298 · Wspólna)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#fed7aa', fontWeight: 600 }}>Nazwa nowego zestawu (Ad Set):</label>
              <input
                type="text"
                value={pushAdSetName}
                onChange={e => setPushAdSetName(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#120904',
                  color: '#fff',
                  border: '1px solid #5c2f14',
                  borderRadius: '7px',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                }}
              />
            </div>

            <div
              style={{
                background: '#120904',
                border: '1px solid #5c2f14',
                borderRadius: '7px',
                padding: '7px 10px',
                fontSize: '12px',
                color: '#6ee7b7',
                fontWeight: 700,
              }}
            >
              🐶 1 Obrazek 1:1 pod Hook → Karta Produktu Feliora Pies (Bez Splitu A/B)
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={pushingMeta}
                onClick={() => handlePushToMeta('active_only')}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
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

      {/* FLOATING TOAST */}
      {(notice || error) && (
        <div
          style={{
            position: 'fixed',
            bottom: '22px',
            right: '22px',
            zIndex: 10000,
            maxWidth: '480px',
            background: error ? '#991b1b' : '#065f46',
            color: '#ffffff',
            border: error ? '2px solid #f87171' : '2px solid #34d399',
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 14px 36px rgba(0, 0, 0, 0.65)',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ flex: 1 }}>{error || notice}</span>
          <button
            type="button"
            onClick={() => {
              setNotice('');
              setError('');
            }}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 15, 0.92)',
            zIndex: 9000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            gap: '14px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 9010,
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
                {lightboxAsset.adsetOrigin} · Przełączaj zdjęcia strzałkami ← / →
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  void handleAssignImage(lightboxAsset, true);
                }}
                style={{
                  background: activeAd?.imageUrl === lightboxAsset.url ? '#047857' : '#059669',
                  color: '#ffffff',
                  border: activeAd?.imageUrl === lightboxAsset.url ? '2px solid #6ee7b7' : 'none',
                  borderRadius: '7px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {activeAd?.imageUrl === lightboxAsset.url ? '✓ Aktywny obrazek tego kąta' : '✅ Ustaw ten obrazek dla kąta'}
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
            zIndex: 8500,
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
                Wybierz obrazek 1:1 dla Kąta #{activePreset?.number}
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
              {imageLibrary.map(asset => {
                const isSelected = activeAd?.imageUrl === asset.url;
                return (
                  <div
                    key={asset.id}
                    onClick={() => void handleAssignImage(asset)}
                    style={{
                      background: '#0f172a',
                      border: isSelected ? '2px solid #fbbf24' : '1px solid #334155',
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
                    <div style={{ fontSize: '10.5px', color: isSelected ? '#fcd34d' : '#94a3b8', fontWeight: isSelected ? 800 : 400 }}>
                      {isSelected ? '✓ Aktualnie wybrana' : asset.adsetOrigin}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MATRIX MODAL: 5 AWARENESS STAGES & DOG OWNERS VOC */}
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
                  📊 Architektura Batcha Feliora PL (Psy): 5 Awareness Stages × VoC Polskich Psiarzy
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  25 długich historii (1 050 - 1 350 słów) na bazie prawdziwych wątków z Dogomanii, Wykop #psy, Reddit r/Polska, Gazeta.pl i Allegro.
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
              const st = FELIORA_PIES_STAGES[stKey];
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
