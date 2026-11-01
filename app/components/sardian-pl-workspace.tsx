'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AntkiPlBrandSwitcher, {
  formatAntekFullDate,
  formatAntekShortDate,
  type AntkiPlBrandKey,
} from '@/app/components/antki-pl-brand-switcher';
import {
  SARDIAN_FANPAGES,
  SARDIAN_IMAGE_LIBRARY,
  SARDIAN_META_NATIVE_CAMPAIGN_ID,
  SARDIAN_PDP_URL,
  SARDIAN_PRESET_ANGLES,
  SARDIAN_STAGES,
  buildAllSardianPrewrittenAds,
  type SardianAnglePreset,
  type SardianAwarenessStageId,
  type SardianImageAsset,
  type SardianPlGeneratedAd,
  type SardianProblemCluster,
} from '@/lib/sardian-pl';

const PROBLEM_CLUSTER_LABELS: Record<SardianProblemCluster, { label: string; color: string }> = {
  TEST_PACK_ANTI_SALES: { label: '👎 Test Pack: Anti-Sales (3)', color: '#dc2626' },
  TEST_PACK_ANTI_ALLEGRO: { label: '🛒 Test Pack: Anti-Allegro (3)', color: '#ea580c' },
  K2_PRYSZNIC_ODPLYW: { label: '🚿 Kąt 2: Prysznic, Sitko & Żona (5)', color: '#d97706' },
  K3_SZWAGIER_TURCJA: { label: '✈️ Kąt 3: Szwagier Turcja 17 000 zł vs Trycholog (5)', color: '#dc2626' },
  K4_STARY_FRYZJER: { label: '💈 Kąt 4: Stary Fryzjer Męski 35 lat (5)', color: '#b45309' },
  K5_REVERSE_FRYZJER: { label: '🪞 Kąt 5: Reverse Fryzjer POV Klienta (3)', color: '#0284c7' },
  K7_PERSPEKTYWA_ZONY: { label: '👩 Kąt 7: Perspektywa Żony · Fanpage Sardian (5)', color: '#be185d' },
  NOWY_DESIRE_A_CZOP_DHT: { label: '🔬 Nowy Desire A: Czop Łojowo-DHT / Sebum-Cement (5)', color: '#1d4ed8' },
  NOWY_DESIRE_B_ZEGAR_ANAGENU: { label: '⏱️ Nowy Desire B: Pułapka 3-Tygodniowego Włosa (5)', color: '#047857' },
  NOWY_DESIRE_C_REBOUND_SLS: { label: '🧪 Nowy Desire C: Efekt Odbicia SLS / Rebound DHT (5)', color: '#7c3aed' },
};

const STAGE_ORDER: SardianAwarenessStageId[] = [
  'stage5_anti_sales_allegro',
  'stage1_batch1_winner_desire',
  'stage2_new_desire_a',
  'stage3_new_desire_b',
  'stage4_new_desire_c',
];

interface SardianPlWorkspaceProps {
  onSwitchToBennettUk?: () => void;
  onSwitchToStryde?: () => void;
  onSwitchToFeliora?: () => void;
  onSwitchToFelioraPies?: () => void;
  onSwitchToOrthomax?: () => void;
}

export default function SardianPlWorkspace({
  onSwitchToBennettUk,
  onSwitchToStryde,
  onSwitchToFeliora,
  onSwitchToFelioraPies,
  onSwitchToOrthomax,
}: SardianPlWorkspaceProps) {
  const [presets, setPresets] = useState<SardianAnglePreset[]>(SARDIAN_PRESET_ANGLES);
  const [ads, setAds] = useState<SardianPlGeneratedAd[]>(() => buildAllSardianPrewrittenAds());
  const [imageLibrary, setImageLibrary] = useState<SardianImageAsset[]>(SARDIAN_IMAGE_LIBRARY);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Filtering & Sorting
  const [sidebarSort, setSidebarSort] = useState<'newest' | 'oldest' | 'stages'>('newest');
  const [stageFilter, setStageFilter] = useState<'all' | SardianAwarenessStageId>('all');
  const [clusterFilter, setClusterFilter] = useState<'all' | SardianProblemCluster>('all');
  const [fanpageFilter, setFanpageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active angle & Selection
  const [activeAngleId, setActiveAngleId] = useState<string>('sardian_tp_as_01');
  const [selectedAngleIds, setSelectedAngleIds] = useState<string[]>([]);

  // Reader vs Editor mode
  const [viewMode, setViewMode] = useState<'reader' | 'editor'>('reader');
  const [editHeadline, setEditHeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrimaryText, setEditPrimaryText] = useState('');
  const [editDestinationUrl, setEditDestinationUrl] = useState(SARDIAN_PDP_URL);
  const [editPageId, setEditPageId] = useState('1363490303507686');
  const [editDirty, setEditDirty] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Image Picker & AI Photo Generator state
  const [showImagePicker, setShowImagePicker] = useState(true);
  const [showFullGalleryModal, setShowFullGalleryModal] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'for_angle' | 'ai_generated'>('all');
  const [lightboxAsset, setLightboxAsset] = useState<SardianImageAsset | null>(null);
  const customFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // AI Native Photo Batch & Custom Generator
  const [generatingKie, setGeneratingKie] = useState(false);
  const [kieProgressText, setKieProgressText] = useState('');
  const [kieBatchCount, setKieBatchCount] = useState<4 | 8 | 12>(8);
  const [kieCustomPrompt, setKieCustomPrompt] = useState('');
  const [kieCustomCount, setKieCustomCount] = useState<1 | 4 | 8>(4);
  const [kieIncludeProductRef, setKieIncludeProductRef] = useState(false);
  const [kieAutoAssign, setKieAutoAssign] = useState(true);

  // Meta Push state
  const [pushCampaignId, setPushCampaignId] = useState<string>(SARDIAN_META_NATIVE_CAMPAIGN_ID);
  const [pushAdSetName, setPushAdSetName] = useState('29.10 - SARDIAN ANTEK BATCH 1 (WINNER DESIRE)');
  const [pushStatus, setPushStatus] = useState<'PAUSED' | 'ACTIVE'>('PAUSED');
  const [pushingMeta, setPushingMeta] = useState(false);

  const loadFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/sardian-pl', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.savedAds) && data.savedAds.length > 0) {
        setAds(data.savedAds);
        if (Array.isArray(data.presets)) setPresets(data.presets);
        if (Array.isArray(data.imageLibrary)) setImageLibrary(data.imageLibrary);
      }
    } catch {
      // Keep local prewritten fallback
    }
  }, []);

  useEffect(() => {
    void loadFromServer();
  }, [loadFromServer]);

  const adByAngleId = useMemo(() => {
    const map: Record<string, SardianPlGeneratedAd> = {};
    for (const item of ads) {
      map[item.angleId] = item;
    }
    return map;
  }, [ads]);

  const activePreset = useMemo(
    () => presets.find(p => p.id === activeAngleId) || presets[0],
    [presets, activeAngleId],
  );

  const activeAd = useMemo(
    () => (activePreset ? adByAngleId[activePreset.id] : undefined),
    [activePreset, adByAngleId],
  );

  useEffect(() => {
    if (!activeAd) return;
    setEditHeadline(activeAd.headline);
    setEditDescription(activeAd.description);
    setEditPrimaryText(activeAd.primaryText);
    setEditDestinationUrl(activeAd.destinationUrl || SARDIAN_PDP_URL);
    setEditPageId(activeAd.pageId || activePreset?.recommendedFanpageId || '1363490303507686');
    setEditDirty(false);
  }, [activeAd, activePreset]);

  const filteredPresets = useMemo(() => {
    return presets.filter(preset => {
      if (stageFilter !== 'all' && preset.stageId !== stageFilter) return false;
      if (clusterFilter !== 'all' && preset.problemCluster !== clusterFilter) return false;
      const ad = adByAngleId[preset.id];
      const pageId = ad?.pageId || preset.recommendedFanpageId;
      if (fanpageFilter !== 'all' && pageId !== fanpageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${preset.code} ${preset.title} ${ad?.headline || ''} ${ad?.primaryText || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [presets, stageFilter, clusterFilter, fanpageFilter, searchQuery, adByAngleId]);

  const sortedPresetsForSidebar = useMemo(() => {
    if (sidebarSort === 'stages') return filteredPresets;
    return [...filteredPresets].sort((a, b) => {
      const adA = adByAngleId[a.id];
      const adB = adByAngleId[b.id];
      const tsA = adA?.updatedAt || adA?.createdAt || 0;
      const tsB = adB?.updatedAt || adB?.createdAt || 0;
      if (tsA !== tsB) {
        return sidebarSort === 'oldest' ? tsA - tsB : tsB - tsA;
      }
      return a.number - b.number;
    });
  }, [filteredPresets, adByAngleId, sidebarSort]);

  const handleBrandSelect = useCallback(
    (brand: AntkiPlBrandKey) => {
      if (brand === 'bennett-uk') {
        if (onSwitchToBennettUk) onSwitchToBennettUk();
        else window.location.href = '/antki-pl?brand=bennett-uk';
      } else if (brand === 'stryde') {
        if (onSwitchToStryde) onSwitchToStryde();
        else window.location.href = '/antki-pl?brand=stryde';
      } else if (brand === 'feliora') {
        if (onSwitchToFeliora) onSwitchToFeliora();
        else window.location.href = '/antki-pl?brand=feliora';
      } else if (brand === 'feliora-pies') {
        if (onSwitchToFelioraPies) onSwitchToFelioraPies();
        else window.location.href = '/antki-pl?brand=feliora-pies';
      } else if (brand === 'orthomax') {
        if (onSwitchToOrthomax) onSwitchToOrthomax();
        else window.location.href = '/antki-pl?brand=orthomax';
      }
    },
    [onSwitchToBennettUk, onSwitchToStryde, onSwitchToFeliora, onSwitchToFelioraPies, onSwitchToOrthomax],
  );

  const toggleSelectAngle = (id: string) => {
    setSelectedAngleIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const selectAllFiltered = () => {
    const ids = filteredPresets.map(p => p.id);
    const allSelected = ids.every(id => selectedAngleIds.includes(id));
    if (allSelected) {
      setSelectedAngleIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedAngleIds( Array.from(new Set([...selectedAngleIds, ...ids])) );
    }
  };

  const selectBatch1 = () => {
    const ids = presets.filter(p => p.stageId === 'stage1_batch1_winner_desire').map(p => p.id);
    setSelectedAngleIds(ids);
    setPushAdSetName('29.10 - SARDIAN BATCH 1 (23x WINNER DESIRE)');
    setNotice('Zaznaczono wszystkie 23 kreacje z Batch #1 (Przebudowane na Starym Winner Desire).');
  };

  const selectBatch2 = () => {
    const ids = presets.filter(p => p.stageId !== 'stage1_batch1_winner_desire').map(p => p.id);
    setSelectedAngleIds(ids);
    setPushAdSetName('29.10 - SARDIAN BATCH 2 (15x NOWE DESIRE A/B/C)');
    setNotice('Zaznaczono wszystkie 15 kreacji z Batch #2 (3 Nowe Desire A + B + C).');
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`Skopiowano do schowka: ${label}`);
    } catch {
      setError('Nie udało się skopiować tekstu.');
    }
  };

  const handleSaveEdit = async () => {
    if (!activeAd || !activePreset) return;
    setSavingEdit(true);
    setError('');
    setNotice('');
    try {
      const fanpage = SARDIAN_FANPAGES.find(f => f.id === editPageId) || SARDIAN_FANPAGES[0];
      const payloadAd: SardianPlGeneratedAd = {
        ...activeAd,
        headline: editHeadline,
        description: editDescription,
        primaryText: editPrimaryText,
        destinationUrl: editDestinationUrl || SARDIAN_PDP_URL,
        pageId: fanpage.id,
        pageName: fanpage.name,
      };
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', ad: payloadAd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu.');
      if (Array.isArray(data.savedAds)) setAds(data.savedAds);
      setEditDirty(false);
      setNotice(`Zapisano zmiany w kreacji ${activePreset.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAssignImage = async (asset: SardianImageAsset) => {
    if (!activePreset) return;
    setError('');
    try {
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_image',
          angleId: activePreset.id,
          imageUrl: asset.url,
          imageHash: asset.imageHash || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd przypisywania zdjęcia.');
      if (Array.isArray(data.savedAds)) setAds(data.savedAds);
      setShowImagePicker(false);
      setNotice(`Przypisano grafikę „${asset.label}” do ${activePreset.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd przypisywania zdjęcia.');
    }
  };

  const handleUploadCustomFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePreset) return;
    setUploadingImage(true);
    setError('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_custom_image',
          angleId: activePreset.id,
          fileName: file.name,
          label: `${activePreset.code} · ${file.name}`,
          dataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd wgrywania zdjęcia.');
      if (Array.isArray(data.imageLibrary)) setImageLibrary(data.imageLibrary);
      if (Array.isArray(data.savedAds)) setAds(data.savedAds);
      setNotice(`Wgrano i przypisano grafikę ${file.name} do ${activePreset.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd wgrywania pliku.');
    } finally {
      setUploadingImage(false);
      if (customFileRef.current) customFileRef.current.value = '';
    }
  };

  const filteredGalleryImages = useMemo(() => {
    if (galleryFilter === 'for_angle' && activePreset) {
      const matched = imageLibrary.filter(
        img =>
          img.angleId === activePreset.id ||
          img.id === activePreset.defaultImageId ||
          img.label.toLowerCase().includes(activePreset.code.toLowerCase()),
      );
      return matched.length > 0 ? matched : imageLibrary;
    }
    if (galleryFilter === 'ai_generated') {
      return imageLibrary.filter(img => img.id.startsWith('kie-sardian-') || img.id.startsWith('sardian-custom-'));
    }
    return imageLibrary;
  }, [imageLibrary, galleryFilter, activePreset]);

  const pollKieTasks = async (
    tasks: Array<{
      taskId: string;
      angleId?: string;
      label: string;
      prompt: string;
      autoAssign?: boolean;
    }>,
    batchDescription: string,
  ) => {
    let completed = 0;
    setKieProgressText(`Generowanie w Kie.ai (0/${tasks.length}): ${batchDescription}...`);
    await Promise.all(
      tasks.map(async t => {
        for (let attempt = 0; attempt < 48; attempt++) {
          await new Promise(r => setTimeout(r, 3500));
          try {
            const pollRes = await fetch('/api/sardian-pl', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'poll_kie_image',
                taskId: t.taskId,
                angleId: t.angleId || activePreset?.id || '',
                label: t.label,
                prompt: t.prompt,
                autoAssign: t.autoAssign,
              }),
            });
            const pollData = await pollRes.json();
            if (pollData.state === 'success' && pollData.asset) {
              completed += 1;
              setKieProgressText(`Wygenerowano ${completed}/${tasks.length} zdjęć AI (${batchDescription})...`);
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
    return completed;
  };

  const handleGenerateKieScriptBatch = async (customCount?: 4 | 8 | 12) => {
    if (!activePreset || !activeAd) return;
    const countToGen = customCount || kieBatchCount;
    setGeneratingKie(true);
    setError('');
    setNotice('');
    setKieProgressText(`Planowanie ${countToGen} scen z copy ${activePreset.code} i wysyłka do Kie.ai...`);
    try {
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_kie_images',
          isManual: true,
          mode: 'script_batch',
          angleId: activePreset.id,
          primaryText: editPrimaryText || activeAd.primaryText,
          headline: editHeadline || activeAd.headline,
          title: activePreset.title,
          count: countToGen,
          includeProductRef: kieIncludeProductRef,
          autoAssign: kieAutoAssign,
          aspectRatio: '1:1',
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.tasks) || data.tasks.length === 0) {
        throw new Error(data.error || 'Błąd uruchamiania generatora zdjęć AI.');
      }
      setShowImagePicker(true);
      const completed = await pollKieTasks(data.tasks, `${countToGen} zdjęć do ${activePreset.code}`);
      if (completed > 0) {
        setNotice(`Wygenerowano ${completed}/${data.tasks.length} nowych zdjęć Raw iPhone 1:1 dla ${activePreset.code}!`);
      } else {
        setError('Zadania Kie.ai przekroczyły czas oczekiwania lub nie zwróciły obrazu.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd generowania batchu zdjęć AI.');
    } finally {
      setGeneratingKie(false);
      setKieProgressText('');
    }
  };

  const handleGenerateKieCustomPrompt = async () => {
    if (!kieCustomPrompt.trim()) {
      setError('Wpisz opis własnego zdjęcia (po polsku lub angielsku) przed uruchomieniem generacji.');
      return;
    }
    setGeneratingKie(true);
    setError('');
    setNotice('');
    setKieProgressText(`Wysyłanie ${kieCustomCount} własnych ujęć do Kie.ai...`);
    try {
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_kie_images',
          isManual: true,
          mode: 'custom_prompt',
          angleId: activePreset?.id || '',
          customPrompt: kieCustomPrompt.trim(),
          count: kieCustomCount,
          includeProductRef: kieIncludeProductRef,
          autoAssign: kieAutoAssign,
          aspectRatio: '1:1',
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.tasks) || data.tasks.length === 0) {
        throw new Error(data.error || 'Błąd uruchamiania własnej generacji AI.');
      }
      setShowImagePicker(true);
      const completed = await pollKieTasks(data.tasks, `Własny prompt (${kieCustomCount} szt.)`);
      if (completed > 0) {
        setNotice(`Wygenerowano ${completed}/${data.tasks.length} własnych zdjęć Raw iPhone 1:1 i dodano do biblioteki!`);
      } else {
        setError('Zadania Kie.ai przekroczyły czas oczekiwania.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd generowania własnych zdjęć.');
    } finally {
      setGeneratingKie(false);
      setKieProgressText('');
    }
  };

  const handleGenerateKieMultiAngleBatch = async () => {
    const targetIds =
      selectedAngleIds.length > 0
        ? selectedAngleIds.slice(0, 15)
        : filteredPresets.slice(0, 12).map(p => p.id);
    if (!targetIds.length) {
      setError('Zaznacz kreacje na liście po lewej stronie, dla których chcesz wygenerować nowy batch zdjęć.');
      return;
    }
    setGeneratingKie(true);
    setError('');
    setNotice('');
    setKieProgressText(`Planowanie i uruchamianie nowego batchu (${targetIds.length} zdjęć do ${targetIds.length} kopii)...`);
    try {
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_kie_images',
          isManual: true,
          mode: 'multi_angle_batch',
          angleIds: targetIds,
          includeProductRef: kieIncludeProductRef,
          aspectRatio: '1:1',
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.tasks) || data.tasks.length === 0) {
        throw new Error(data.error || 'Błąd uruchamiania batchu dla wielu kopii.');
      }
      setShowImagePicker(true);
      const completed = await pollKieTasks(data.tasks, `Batch do ${targetIds.length} kopii`);
      if (completed > 0) {
        setNotice(
          `Wygenerowano i automatycznie przypisano ${completed}/${data.tasks.length} nowych zdjęć do wybranych kopii!`,
        );
      } else {
        setError('Nie udało się pobrać wyników z Kie.ai.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd generowania batchu dla wielu kopii.');
    } finally {
      setGeneratingKie(false);
      setKieProgressText('');
    }
  };

  const handleDeleteCustomImage = async (asset: SardianImageAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_image',
          assetId: asset.id,
          imageUrl: asset.url,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.imageLibrary)) {
        setImageLibrary(data.imageLibrary);
        setNotice(`Usunięto zdjęcie „${asset.label}” z biblioteki.`);
      }
    } catch {
      // ignore
    }
  };

  const [syncingFanpages, setSyncingFanpages] = useState(false);
  const [discoveredFanpages, setDiscoveredFanpages] = useState<
    Record<string, { id: string; name: string; pictureUploaded?: boolean }>
  >({});

  const handleSyncFanpages = async () => {
    setSyncingFanpages(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_fanpages' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd synchronizacji fanpage’y.');
      setDiscoveredFanpages(data.discoveredPages || {});
      const foundKeys = Object.keys(data.discoveredPages || {});
      if (foundKeys.length > 0) {
        const summary = foundKeys
          .map(k => {
            const item = data.discoveredPages[k];
            return `${item.name} (ID: ${item.id}${item.pictureUploaded ? ' · zdjęcie profilowe ustawione!' : ''})`;
          })
          .join(', ');
        setNotice(`Wykryto na Meta i zsynchronizowano: ${summary}`);
      } else {
        setNotice(
          `Sprawdzono ${data.totalMetaPagesChecked || 0} stron w BM. Utwórz strony „Barbershop Perfekcja” i „Pokonać Łysienie — Historie i Testy” jednym kliknięciem poniżej i kliknij Synchronizuj ponownie.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd synchronizacji fanpage’y.');
    } finally {
      setSyncingFanpages(false);
    }
  };

  const handlePushToMeta = async (targetIds: string[], customAdSetName?: string) => {
    if (!targetIds.length) {
      setError('Zaznacz przynajmniej 1 kreację do wysyłki na Meta Ads.');
      return;
    }
    setPushingMeta(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/sardian-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'push_to_meta',
          angleIds: targetIds,
          campaignId: pushCampaignId,
          adSetName: customAdSetName || pushAdSetName,
          adStatus: pushStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd wysyłki do Meta Ads.');
      setNotice(
        `Wysłano ${data.createdAdsCount} kreacji SARDIAN do zestawu reklam „${data.adSetName}” (ID: ${data.adSetId}) w statusie ${pushStatus}!`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd wysyłki do Meta Ads.');
    } finally {
      setPushingMeta(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: 64,
      }}
    >
      <input
        ref={customFileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadCustomFile}
      />

      {/* TOP BAR + BRAND SWITCHER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 55%, #0c0a09 100%)',
          borderBottom: '1px solid #b45309',
          padding: '14px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1720,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="/"
              style={{
                color: '#fcd34d',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              ← Szekspir Hub
            </a>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: '#fbbf24' }}>
                  🦁 SARDIAN PL — Fabryka 38 Antków Natywnych (Batch #1 + Batch #2)
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fcd34d',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                  }}
                >
                  23 Przebudowane (Winner Desire) + 15 Nowych (3x5 Nowe Desire) · 100% Product Page
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 2 }}>
                Konto Meta: <strong style={{ color: '#e7e5e4' }}>act_1168927131917359</strong> · Kampania Native CBO:{' '}
                <strong style={{ color: '#fcd34d' }}>CBO 5 nativ (120250060540350298)</strong> · Link docelowy:{' '}
                <strong style={{ color: '#34d399' }}>/products/sardian-szampon-aktywujacy-korzenie</strong>
              </div>
            </div>
          </div>

          {/* BRAND SWITCHER */}
          <AntkiPlBrandSwitcher activeBrand="sardian-szampon" onSelectBrand={handleBrandSelect} />
        </div>
      </div>

      {/* NOTICES & ERRORS */}
      <div style={{ maxWidth: 1720, margin: '12px auto 0', padding: '0 24px' }}>
        {notice && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              color: '#6ee7b7',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>✅ {notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              style={{ background: 'transparent', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* STAGE / BATCH TABS */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '12px 14px',
            borderRadius: 12,
            background: '#111827',
            border: '1px solid #1f2937',
            marginBottom: 14,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setStageFilter('all');
                setClusterFilter('all');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: stageFilter === 'all' ? '2px solid #f59e0b' : '1px solid #374151',
                background: stageFilter === 'all' ? 'rgba(245, 158, 11, 0.18)' : '#1f2937',
                color: stageFilter === 'all' ? '#fcd34d' : '#d1d5db',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Wszystkie kreacje (38)
            </button>
            {STAGE_ORDER.map(stId => {
              const st = SARDIAN_STAGES[stId];
              const active = stageFilter === stId;
              return (
                <button
                  key={stId}
                  type="button"
                  onClick={() => {
                    setStageFilter(stId);
                    setClusterFilter('all');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: active ? `2px solid ${st.color}` : '1px solid #374151',
                    background: active ? 'rgba(255,255,255,0.1)' : '#1f2937',
                    color: active ? '#ffffff' : '#d1d5db',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {st.shortLabel}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={selectBatch1}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #f59e0b',
                background: 'rgba(180, 83, 9, 0.25)',
                color: '#fde68a',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ☑️ Zaznacz cały Batch #1 (23 szt.)
            </button>
            <button
              type="button"
              onClick={selectBatch2}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #3b82f6',
                background: 'rgba(29, 78, 216, 0.25)',
                color: '#bfdbfe',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ☑️ Zaznacz cały Batch #2 · 3 Nowe Desire (15 szt.)
            </button>
          </div>
        </div>

        {/* CLUSTER & FANPAGE FILTERS */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <select
            value={clusterFilter}
            onChange={e => setClusterFilter(e.target.value as 'all' | SardianProblemCluster)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <option value="all">Wszystkie kąty i Desire (8 grup)</option>
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
              padding: '8px 12px',
              borderRadius: 8,
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <option value="all">Wszystkie Fanpage (Pokonać Łysienie, Barbershop Perfekcja, Dr Skrzypiński, Mama Gosia, Karol, Sardian)</option>
            {SARDIAN_FANPAGES.map(fp => (
              <option key={fp.id} value={fp.id}>
                {fp.name} ({fp.id})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Szukaj po kodzie (np. K2_V1, ND_A1, szwagier, sitko, SLS)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: 240,
              padding: '8px 12px',
              borderRadius: 8,
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              fontSize: 12,
            }}
          />
        </div>

        {/* MAIN 3-COLUMN WORKSPACE */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr 560px',
            gap: 18,
            alignItems: 'start',
          }}
        >
          {/* LEFT SIDEBAR: 38 ANGLES LIST */}
          <div
            style={{
              background: '#111827',
              border: '1px solid #1f2937',
              borderRadius: 14,
              padding: 12,
              maxHeight: '82vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: '1px solid #1f2937',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>
                  Widoczne: {filteredPresets.length} / 38 · Zaznaczone: {selectedAngleIds.length}
                </span>
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #374151',
                    background: '#1f2937',
                    color: '#e5e7eb',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Zaznacz / Odznacz widoczne
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(
                  [
                    { key: 'newest', label: '🕒 Najnowsze' },
                    { key: 'oldest', label: '📅 Najstarsze' },
                    { key: 'stages', label: '📊 Kolejność #1–#38' },
                  ] as const
                ).map(opt => {
                  const active = sidebarSort === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSidebarSort(opt.key)}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        borderRadius: 6,
                        border: active ? '1px solid #f59e0b' : '1px solid #374151',
                        background: active ? 'rgba(245, 158, 11, 0.2)' : '#1f2937',
                        color: active ? '#fde68a' : '#9ca3af',
                        fontSize: 10.5,
                        fontWeight: active ? 800 : 600,
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {sortedPresetsForSidebar.map(preset => {
                const ad = adByAngleId[preset.id];
                const isSelected = activePreset?.id === preset.id;
                const isChecked = selectedAngleIds.includes(preset.id);
                const clusterMeta = PROBLEM_CLUSTER_LABELS[preset.problemCluster];
                const dateShort = formatAntekShortDate(ad?.updatedAt || ad?.createdAt);
                return (
                  <div
                    key={preset.id}
                    onClick={() => setActiveAngleId(preset.id)}
                    style={{
                      padding: '10px 11px',
                      borderRadius: 10,
                      border: isSelected ? '2px solid #f59e0b' : '1px solid #1f2937',
                      background: isSelected ? 'rgba(245, 158, 11, 0.12)' : '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        e.stopPropagation();
                        toggleSelectAngle(preset.id);
                      }}
                      onClick={e => e.stopPropagation()}
                      style={{ marginTop: 3, cursor: 'pointer' }}
                    />
                    <img
                      src={ad?.imageUrl || preset.defaultImageUrl}
                      alt={preset.code}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 8,
                        objectFit: 'cover',
                        border: '1px solid #334155',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 5,
                            background: clusterMeta?.color || '#b45309',
                            color: '#ffffff',
                          }}
                        >
                          {preset.code}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: '#0f172a',
                            color: '#fcd34d',
                            border: '1px solid rgba(245,158,11,0.35)',
                          }}
                        >
                          📅 {dateShort}
                        </span>
                        <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
                          {ad?.pageName || preset.recommendedFanpageName} · {ad?.wordCount || 0} słów
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#f1f5f9',
                          marginTop: 4,
                          lineHeight: 1.3,
                        }}
                      >
                        {preset.shortTitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER COLUMN: FULL COPY READER / EDITOR */}
          <div
            style={{
              background: '#111827',
              border: '1px solid #1f2937',
              borderRadius: 14,
              padding: 20,
            }}
          >
            {activePreset && activeAd && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                    paddingBottom: 14,
                    borderBottom: '1px solid #1f2937',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: 6,
                          background: PROBLEM_CLUSTER_LABELS[activePreset.problemCluster]?.color || '#b45309',
                          color: '#fff',
                        }}
                      >
                        {activePreset.code}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 6,
                          background: '#1e293b',
                          color: '#fcd34d',
                          border: '1px solid #334155',
                        }}
                      >
                        {activePreset.sophisticationBadge}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                        {activeAd.wordCount} słów · {activeAd.characterCount} znaków
                      </span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', margin: '8px 0 4px' }}>
                      {activePreset.title}
                    </h2>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Mechanizm Desire: <strong style={{ color: '#e2e8f0' }}>{activePreset.mechanismCore}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyText(activeAd.primaryText, `Primary Text (${activePreset.code})`)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #f59e0b',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fcd34d',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      📋 Kopiuj Primary Text
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(activeAd.headline, `Headline (${activePreset.code})`)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        background: '#1e293b',
                        color: '#e2e8f0',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      📋 Kopiuj Headline
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'reader' ? 'editor' : 'reader')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #3b82f6',
                        background: viewMode === 'editor' ? '#1d4ed8' : '#1e293b',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {viewMode === 'reader' ? '✏️ Edytuj tekst' : '👁️ Tryb czytania'}
                    </button>
                  </div>
                </div>

                {/* HEADLINE & DESCRIPTION BAR */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    marginBottom: 14,
                    padding: 12,
                    borderRadius: 10,
                    background: '#1e293b',
                    border: '1px solid #334155',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                      NAGŁÓWEK (HEADLINE):
                    </div>
                    {viewMode === 'editor' ? (
                      <input
                        type="text"
                        value={editHeadline}
                        onChange={e => {
                          setEditHeadline(e.target.value);
                          setEditDirty(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 6,
                          background: '#0f172a',
                          border: '1px solid #475569',
                          color: '#f8fafc',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fcd34d' }}>{activeAd.headline}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                      OPIS (DESCRIPTION) & FANPAGE:
                    </div>
                    {viewMode === 'editor' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={e => {
                            setEditDescription(e.target.value);
                            setEditDirty(true);
                          }}
                          style={{
                            flex: 1,
                            padding: '7px 10px',
                            borderRadius: 6,
                            background: '#0f172a',
                            border: '1px solid #475569',
                            color: '#f8fafc',
                            fontSize: 12,
                          }}
                        />
                        <select
                          value={editPageId}
                          onChange={e => {
                            setEditPageId(e.target.value);
                            setEditDirty(true);
                          }}
                          style={{
                            padding: '7px 10px',
                            borderRadius: 6,
                            background: '#0f172a',
                            border: '1px solid #475569',
                            color: '#f8fafc',
                            fontSize: 12,
                          }}
                        >
                          {SARDIAN_FANPAGES.map(fp => (
                            <option key={fp.id} value={fp.id}>
                              {fp.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#e2e8f0' }}>
                        {activeAd.description} ·{' '}
                        <strong style={{ color: '#34d399' }}>Fanpage: {activeAd.pageName}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* PRIMARY TEXT BODY */}
                {viewMode === 'editor' ? (
                  <div>
                    <textarea
                      value={editPrimaryText}
                      onChange={e => {
                        setEditPrimaryText(e.target.value);
                        setEditDirty(true);
                      }}
                      rows={28}
                      style={{
                        width: '100%',
                        padding: 14,
                        borderRadius: 10,
                        background: '#0f172a',
                        border: '1px solid #475569',
                        color: '#f8fafc',
                        fontSize: 14,
                        lineHeight: 1.65,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                      <button
                        type="button"
                        disabled={!editDirty || savingEdit}
                        onClick={handleSaveEdit}
                        style={{
                          padding: '10px 18px',
                          borderRadius: 8,
                          border: 'none',
                          background: editDirty ? '#10b981' : '#334155',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: editDirty ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {savingEdit ? 'Zapisywanie...' : '💾 Zapisz zmiany w kreacji'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '18px 20px',
                      borderRadius: 12,
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      whiteSpace: 'pre-wrap',
                      fontSize: 14.5,
                      lineHeight: 1.72,
                      color: '#f1f5f9',
                      maxHeight: '68vh',
                      overflowY: 'auto',
                    }}
                  >
                    {activeAd.primaryText}
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN: FACEBOOK PREVIEW + IMAGE PICKER + 1-CLICK META UPLOAD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activePreset && activeAd && (
              <div
                style={{
                  background: '#ffffff',
                  color: '#1c1e21',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e4e6eb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {SARDIAN_FANPAGES.find(f => f.id === activeAd.pageId)?.avatarUrl ? (
                      <img
                        src={SARDIAN_FANPAGES.find(f => f.id === activeAd.pageId)?.avatarUrl}
                        alt={activeAd.pageName}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid #d1d5db',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background:
                            SARDIAN_FANPAGES.find(f => f.id === activeAd.pageId)?.badgeColor || '#b45309',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        {SARDIAN_FANPAGES.find(f => f.id === activeAd.pageId)?.initials || 'SR'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#050505' }}>{activeAd.pageName}</div>
                      <div style={{ fontSize: 11, color: '#65676b' }}>Sponsorowane · 🌍</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: '#f0f2f5',
                      color: '#050505',
                    }}
                  >
                    {activePreset.code}
                  </span>
                </div>

                {/* PREVIEW SNIPPET */}
                <div
                  style={{
                    padding: '10px 14px',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: '#050505',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {activeAd.primaryText.split('\n\n').slice(0, 4).join('\n\n')}
                  <span style={{ color: '#65676b', fontWeight: 600 }}>{'\n\n'}... Wyświetl więcej</span>
                </div>

                {/* 1:1 IMAGE */}
                <div style={{ position: 'relative', background: '#000' }}>
                  <img
                    src={activeAd.imageUrl}
                    alt={activePreset.code}
                    style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      display: 'flex',
                      gap: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowFullGalleryModal(true)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #f59e0b',
                        background: 'rgba(15, 23, 42, 0.92)',
                        color: '#fcd34d',
                        fontWeight: 800,
                        fontSize: 11.5,
                        cursor: 'pointer',
                      }}
                    >
                      🖼️ Biblioteka & Generator AI ({imageLibrary.length} szt.)
                    </button>
                    <button
                      type="button"
                      onClick={() => customFileRef.current?.click()}
                      disabled={uploadingImage}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'rgba(15, 23, 42, 0.92)',
                        color: '#f8fafc',
                        fontWeight: 700,
                        fontSize: 11.5,
                        cursor: 'pointer',
                      }}
                    >
                      {uploadingImage ? 'Wgrywanie...' : '⬆️ Wgraj własną z dysku'}
                    </button>
                  </div>
                </div>

                {/* LINK BAR */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#f0f2f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#65676b', textTransform: 'uppercase' }}>
                      SPROBUJSARDIAN.PL
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#050505',
                        lineHeight: 1.25,
                        marginTop: 2,
                      }}
                    >
                      {activeAd.headline}
                    </div>
                    <div style={{ fontSize: 12, color: '#65676b', marginTop: 2 }}>{activeAd.description}</div>
                  </div>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#e4e6eb',
                      color: '#050505',
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    Więcej informacji
                  </div>
                </div>
              </div>
            )}

            {/* LARGE AI PHOTO GENERATOR + IMAGE LIBRARY TILE */}
            <div
              style={{
                background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
                border: '2px solid #d97706',
                borderRadius: 16,
                padding: 18,
                boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  paddingBottom: 10,
                  borderBottom: '1px solid #334155',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fbbf24' }}>
                    📸 Generator Zdjęć Native AI & Biblioteka ({imageLibrary.length} szt.)
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                    Wygeneruj nowy batch zdjęć pod bieżącą kopię, wiele kopii naraz lub z własnego opisu (2K Google AI · 1:1)
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setShowFullGalleryModal(true)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 8,
                      border: '1px solid #f59e0b',
                      background: 'rgba(245, 158, 11, 0.18)',
                      color: '#fde68a',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    🔍 Powiększ na cały ekran
                  </button>
                  <button
                    type="button"
                    onClick={() => customFileRef.current?.click()}
                    disabled={uploadingImage}
                    style={{
                      padding: '7px 11px',
                      borderRadius: 8,
                      border: '1px solid #475569',
                      background: '#1e293b',
                      color: '#f8fafc',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {uploadingImage ? '⏳...' : '+ Wgraj z dysku'}
                  </button>
                </div>
              </div>

              {/* KIE.AI PROGRESS BANNER */}
              {generatingKie && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.18)',
                    border: '1px solid #f59e0b',
                    color: '#fde68a',
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  ⏳ {kieProgressText || 'Generowanie zdjęć Raw iPhone 1:1 w Kie.ai (~25-45s)...'}
                </div>
              )}

              {/* SECTION 1: 1-CLICK BATCH DO KOPII */}
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#f8fafc' }}>
                    ⚡ 1. Wygeneruj nowy batch zdjęć automatycznie pod copy:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Ilość na strzała:</span>
                    {([4, 8, 12] as const).map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setKieBatchCount(cnt)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 6,
                          border: kieBatchCount === cnt ? '1px solid #f59e0b' : '1px solid #475569',
                          background: kieBatchCount === cnt ? 'rgba(245, 158, 11, 0.25)' : '#0f172a',
                          color: kieBatchCount === cnt ? '#fde68a' : '#cbd5e1',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {cnt} szt.
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    disabled={generatingKie || !activePreset}
                    onClick={() => void handleGenerateKieScriptBatch()}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #fbbf24',
                      background: generatingKie
                        ? '#78350f'
                        : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      color: '#fffbeb',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: generatingKie ? 'wait' : 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    📸 Nowy batch ({kieBatchCount} zdjęć) do {activePreset?.code || 'bieżącej kopii'}
                  </button>

                  <button
                    type="button"
                    disabled={generatingKie}
                    onClick={() => void handleGenerateKieMultiAngleBatch()}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #38bdf8',
                      background: generatingKie
                        ? '#1e3a8a'
                        : 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
                      color: '#f0f9ff',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: generatingKie ? 'wait' : 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    🔥 Nowy batch do{' '}
                    {selectedAngleIds.length > 0
                      ? `zaznaczonych (${Math.min(15, selectedAngleIds.length)} kopii)`
                      : `widocznych (${Math.min(12, filteredPresets.length)} kopii)`}
                  </button>
                </div>
              </div>

              {/* SECTION 2: WŁASNY OPIS ZDJĘCIA (CUSTOM PROMPT) */}
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#f8fafc' }}>
                    ✍️ 2. Wygeneruj własne zdjęcia AI (własny opis sceny):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeAd || !activePreset) return;
                      const firstLines = activeAd.primaryText.split('\n\n').slice(0, 2).join(' ');
                      setKieCustomPrompt(
                        `Clean, sharp first-person iPhone 15 photo literally depicting the exact Hook artifact/place/document from this story (strictly NO product bottle in frame): ${firstLines.slice(0, 260)}`,
                      );
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #475569',
                      background: '#0f172a',
                      color: '#fcd34d',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📋 Wklej scenę 1:1 z hooka {activePreset?.code} (bez produktu)
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={kieCustomPrompt}
                  onChange={e => setKieCustomPrompt(e.target.value)}
                  placeholder="Np. Hagia Sophia w Stambule i broszura kliniki przeszczepu włosów 17 000 zł na stoliku kawiarni / Ulotka z apteki z zakreślonymi skutkami ubocznymi w aucie / Mikroskop USB 79 zł podłączony do laptopa (domyślnie BEZ wpychania butelki produktu!)..."
                  style={{
                    width: '100%',
                    padding: '9px 11px',
                    borderRadius: 8,
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: '#f8fafc',
                    fontSize: 12,
                    lineHeight: 1.45,
                    resize: 'vertical',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={kieIncludeProductRef}
                        onChange={e => setKieIncludeProductRef(e.target.checked)}
                      />
                      🧴 Wymuś butelkę SARDIAN w kadrze (domyślnie WYŁ. — czysty natyw pod Hooka)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={kieAutoAssign}
                        onChange={e => setKieAutoAssign(e.target.checked)}
                      />
                      🎯 Przypisz do {activePreset?.code}
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {([1, 4, 8] as const).map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setKieCustomCount(cnt)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: kieCustomCount === cnt ? '1px solid #10b981' : '1px solid #475569',
                          background: kieCustomCount === cnt ? 'rgba(16, 185, 129, 0.22)' : '#0f172a',
                          color: kieCustomCount === cnt ? '#6ee7b7' : '#cbd5e1',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {cnt}x
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={generatingKie}
                      onClick={() => void handleGenerateKieCustomPrompt()}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: '1px solid #10b981',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ecfdf5',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: generatingKie ? 'wait' : 'pointer',
                      }}
                    >
                      ✨ Generuj własne ({kieCustomCount} szt.)
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EXPANDED IMAGE LIBRARY GRID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('all')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 7,
                      border: galleryFilter === 'all' ? '1px solid #f59e0b' : '1px solid #374151',
                      background: galleryFilter === 'all' ? 'rgba(245, 158, 11, 0.2)' : '#1f2937',
                      color: galleryFilter === 'all' ? '#fcd34d' : '#cbd5e1',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Wszystkie zdjęcia ({imageLibrary.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('for_angle')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 7,
                      border: galleryFilter === 'for_angle' ? '1px solid #f59e0b' : '1px solid #374151',
                      background: galleryFilter === 'for_angle' ? 'rgba(245, 158, 11, 0.2)' : '#1f2937',
                      color: galleryFilter === 'for_angle' ? '#fcd34d' : '#cbd5e1',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Dedykowane do {activePreset?.code}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('ai_generated')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 7,
                      border: galleryFilter === 'ai_generated' ? '1px solid #10b981' : '1px solid #374151',
                      background: galleryFilter === 'ai_generated' ? 'rgba(16, 185, 129, 0.2)' : '#1f2937',
                      color: galleryFilter === 'ai_generated' ? '#6ee7b7' : '#cbd5e1',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Własne / Nowe AI (
                    {imageLibrary.filter(img => img.id.startsWith('kie-sardian-') || img.id.startsWith('sardian-custom-')).length}
                    )
                  </button>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  Kliknij zdjęcie = przypisz do {activePreset?.code} · 🔍 = powiększ
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 12,
                  maxHeight: 680,
                  overflowY: 'auto',
                  paddingRight: 4,
                }}
              >
                {filteredGalleryImages.map(asset => {
                  const isAssigned = activeAd?.imageUrl === asset.url;
                  const isCustomOrAi =
                    asset.id.startsWith('kie-sardian-') || asset.id.startsWith('sardian-custom-');
                  return (
                    <div
                      key={asset.id}
                      onClick={() => void handleAssignImage(asset)}
                      style={{
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: isAssigned ? '3px solid #f59e0b' : '1px solid #374151',
                        cursor: 'pointer',
                        background: '#1f2937',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: isAssigned ? '0 0 14px rgba(245, 158, 11, 0.45)' : 'none',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={asset.url}
                          alt={asset.label}
                          style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                        />
                        {isAssigned && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 6,
                              left: 6,
                              background: '#d97706',
                              color: '#fffbeb',
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: 6,
                            }}
                          >
                            ✓ AKTYWNE
                          </span>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            display: 'flex',
                            gap: 4,
                          }}
                        >
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setLightboxAsset(asset);
                            }}
                            title="Powiększ zdjęcie"
                            style={{
                              background: 'rgba(15, 23, 42, 0.85)',
                              color: '#f8fafc',
                              border: '1px solid #475569',
                              borderRadius: 6,
                              padding: '3px 6px',
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            🔍
                          </button>
                          {isCustomOrAi && (
                            <button
                              type="button"
                              onClick={e => void handleDeleteCustomImage(asset, e)}
                              title="Usuń z biblioteki"
                              style={{
                                background: 'rgba(127, 29, 29, 0.9)',
                                color: '#fecaca',
                                border: '1px solid #ef4444',
                                borderRadius: 6,
                                padding: '3px 6px',
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '7px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#e5e7eb',
                          lineHeight: 1.3,
                        }}
                      >
                        {asset.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2 NEW FANPAGES & AVATARS PANEL */}
            <div
              style={{
                background: '#111827',
                border: '1px solid #334155',
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
                  💈 2 Nowe Fanpage’e & Gotowe Zdjęcia Profilowe
                </div>
                <a
                  href="https://www.facebook.com/pages/create"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  + Utwórz stronę na FB
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
                {SARDIAN_FANPAGES.slice(0, 2).map(fp => {
                  const synced = discoveredFanpages[fp.id];
                  return (
                    <div
                      key={fp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 8,
                        borderRadius: 10,
                        background: '#1e293b',
                        border: '1px solid #334155',
                      }}
                    >
                      <img
                        src={fp.avatarUrl}
                        alt={fp.name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${fp.badgeColor}`,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#f8fafc' }}>{fp.name}</div>
                        <div style={{ fontSize: 10.5, color: '#34d399', fontWeight: 700, marginTop: 2 }}>
                          ✅ Połączono z Meta BM · ID: {synced?.id || fp.id}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                          {fp.role}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleCopyText(fp.name, `Nazwę fanpage’a (${fp.name})`)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '1px solid #475569',
                            background: '#0f172a',
                            color: '#e2e8f0',
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          📋 Kopiuj nazwę
                        </button>
                        <a
                          href={fp.avatarUrl}
                          download
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '1px solid #f59e0b',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#fcd34d',
                            fontSize: 10.5,
                            fontWeight: 700,
                            textDecoration: 'none',
                            textAlign: 'center',
                          }}
                        >
                          ⬇️ Pobierz avatar
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={syncingFanpages}
                onClick={handleSyncFanpages}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #10b981',
                  background: 'rgba(16, 185, 129, 0.16)',
                  color: '#6ee7b7',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: syncingFanpages ? 'wait' : 'pointer',
                }}
              >
                {syncingFanpages
                  ? '⏳ Synchronizacja z Meta Graph API...'
                  : '🔄 Synchronizuj ID nowych stron & ustaw zdjęcia profilowe przez API'}
              </button>
            </div>

            {/* 1-CLICK META ADS UPLOAD PANEL */}
            <div
              style={{
                background: '#111827',
                border: '1px solid #b45309',
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fcd34d', marginBottom: 4 }}>
                🚀 1-Click Push do Meta Ads (Konto: act_1168927131917359)
              </div>
              <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 12 }}>
                Tworzy nowy AdSet w kampanii <strong>CBO 5 nativ (120250060540350298)</strong> z linkiem prosto na{' '}
                <strong>Product Page (/products/sardian-szampon-aktywujacy-korzenie)</strong>. Kreacje są przypisane do:{' '}
                <strong>Pokonać Łysienie — Historie i Testy</strong>, <strong>Barbershop Perfekcja</strong>,{' '}
                <strong>Dr n. med. Janusz Skrzypiński</strong>, <strong>Porady Mamy Gosi</strong> oraz{' '}
                <strong>Karol Mikołajczyk</strong>.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    Nazwa nowego zestawu reklam (Ad Set Name):
                  </label>
                  <input
                    type="text"
                    value={pushAdSetName}
                    onChange={e => setPushAdSetName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label
                      style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}
                    >
                      Kampania CBO ID:
                    </label>
                    <input
                      type="text"
                      value={pushCampaignId}
                      onChange={e => setPushCampaignId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: 12,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}
                    >
                      Status po wgraniu:
                    </label>
                    <select
                      value={pushStatus}
                      onChange={e => setPushStatus(e.target.value as 'PAUSED' | 'ACTIVE')}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <option value="PAUSED">PAUSED (Bezpieczny Draft)</option>
                      <option value="ACTIVE">ACTIVE (Od razu aktywne)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={pushingMeta || !activePreset}
                  onClick={() =>
                    activePreset &&
                    handlePushToMeta(
                      selectedAngleIds.length > 0 ? selectedAngleIds : [activePreset.id],
                      pushAdSetName,
                    )
                  }
                  style={{
                    marginTop: 4,
                    padding: '11px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                    color: '#fffbeb',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: pushingMeta ? 'wait' : 'pointer',
                  }}
                >
                  {pushingMeta
                    ? '⏳ Wysyłanie kreacji do Meta Ads...'
                    : selectedAngleIds.length > 0
                    ? `🚀 Wyślij zaznaczone (${selectedAngleIds.length} szt.) do Meta Ads (${pushStatus})`
                    : `🚀 Wyślij bieżącą kreację (${activePreset?.code}) do Meta Ads (${pushStatus})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN GALLERY & AI BATCH GENERATOR MODAL */}
      {showFullGalleryModal && (
        <div
          onClick={() => setShowFullGalleryModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(9, 13, 22, 0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 1460,
              maxHeight: '92vh',
              background: '#0f172a',
              border: '2px solid #f59e0b',
              borderRadius: 18,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.75)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>
                  📸 Pełnoekranowy Generator Zdjęć Native AI & Biblioteka SARDIAN ({imageLibrary.length} szt.)
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 3 }}>
                  Aktywna kreacja: <strong style={{ color: '#fcd34d' }}>{activePreset?.code}</strong> ({activePreset?.title})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullGalleryModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: '1px solid #475569',
                  background: '#1e293b',
                  color: '#f8fafc',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ✕ Zamknij okno
              </button>
            </div>

            {generatingKie && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(245, 158, 11, 0.18)',
                  border: '1px solid #f59e0b',
                  color: '#fde68a',
                  fontSize: 13.5,
                  fontWeight: 700,
                }}
              >
                ⏳ {kieProgressText || 'Generowanie zdjęć Raw iPhone 1:1 w Kie.ai...'}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* LEFT: BATCH GENERATOR */}
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 14,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fcd34d' }}>
                  ⚡ Wygeneruj nowy batch zdjęć pod kopie (1-Click):
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={generatingKie}
                    onClick={() => void handleGenerateKieScriptBatch(8)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #fbbf24',
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      color: '#fffbeb',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: generatingKie ? 'wait' : 'pointer',
                    }}
                  >
                    📸 Generuj 8 zdjęć do {activePreset?.code}
                  </button>
                  <button
                    type="button"
                    disabled={generatingKie}
                    onClick={() => void handleGenerateKieScriptBatch(12)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #fbbf24',
                      background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
                      color: '#fffbeb',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: generatingKie ? 'wait' : 'pointer',
                    }}
                  >
                    📸 Generuj 12 zdjęć do {activePreset?.code}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={generatingKie}
                  onClick={() => void handleGenerateKieMultiAngleBatch()}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #38bdf8',
                    background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
                    color: '#f0f9ff',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: generatingKie ? 'wait' : 'pointer',
                  }}
                >
                  🔥 Wygeneruj nowy batch zdjęć dla wielu kopii naraz (
                  {selectedAngleIds.length > 0
                    ? `${Math.min(15, selectedAngleIds.length)} zaznaczonych kopii`
                    : `${Math.min(12, filteredPresets.length)} widocznych kopii`}
                  )
                </button>
              </div>

              {/* RIGHT: CUSTOM PROMPT */}
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 14,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: '#6ee7b7' }}>
                  ✍️ Wygeneruj własne zdjęcia z opisu:
                </div>
                <textarea
                  rows={3}
                  value={kieCustomPrompt}
                  onChange={e => setKieCustomPrompt(e.target.value)}
                  placeholder="Opisz scenę własnymi słowami (np. 3 czarne butelki SARDIAN na półce w łazience obok prysznica, poranne światło)..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#0f172a',
                    border: '1px solid #475569',
                    color: '#f8fafc',
                    fontSize: 13,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
                    <input
                      type="checkbox"
                      checked={kieIncludeProductRef}
                      onChange={e => setKieIncludeProductRef(e.target.checked)}
                    />
                    🧴 Dołącz butelkę SARDIAN (1:1 z referencji)
                  </label>
                  <button
                    type="button"
                    disabled={generatingKie}
                    onClick={() => void handleGenerateKieCustomPrompt()}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: '1px solid #10b981',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ecfdf5',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: generatingKie ? 'wait' : 'pointer',
                    }}
                  >
                    ✨ Wygeneruj własne zdjęcia ({kieCustomCount} szt.)
                  </button>
                </div>
              </div>
            </div>

            {/* 5-COLUMN FULL GALLERY */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                gap: 14,
              }}
            >
              {imageLibrary.map(asset => {
                const isAssigned = activeAd?.imageUrl === asset.url;
                return (
                  <div
                    key={`modal-${asset.id}`}
                    onClick={() => {
                      void handleAssignImage(asset);
                      setShowFullGalleryModal(false);
                    }}
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: isAssigned ? '3px solid #f59e0b' : '1px solid #334155',
                      background: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <img
                      src={asset.url}
                      alt={asset.label}
                      style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: '#f8fafc', lineHeight: 1.3 }}>
                      {asset.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <img
            src={lightboxAsset.url}
            alt={lightboxAsset.label}
            style={{
              maxWidth: '88vw',
              maxHeight: '80vh',
              borderRadius: 14,
              border: '2px solid #f59e0b',
              objectFit: 'contain',
            }}
          />
          <div style={{ marginTop: 12, color: '#f8fafc', fontSize: 14, fontWeight: 700 }}>
            {lightboxAsset.label}
          </div>
        </div>
      )}
    </div>
  );
}
