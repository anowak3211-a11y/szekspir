'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ANTKI_PL_IMAGE_LIBRARY,
  getDefaultImageForAngle,
  type AntkiPlFunnelStage,
  type AntkiPlGeneratedAd,
  type AntkiPlImageAsset,
  type AntkiPlPresetAngle,
  type AntkiPlSegment,
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

const GROUP_ANGLE_RANGES: Record<string, { label: string; shortRange: string; numbers: number[] }> = {
  DOM: { label: 'DOM', shortRange: '#1–#5', numbers: [1, 2, 3, 4, 5] },
  RUCH: { label: 'RUCH', shortRange: '#6–#10', numbers: [6, 7, 8, 9, 10] },
  GRUPA: { label: 'GRUPA', shortRange: '#11–#15', numbers: [11, 12, 13, 14, 15] },
  MIT: { label: 'MIT', shortRange: '#16–#20', numbers: [16, 17, 18, 19, 20] },
  RYCIAK: { label: 'RYCIAK', shortRange: '#21–#25', numbers: [21, 22, 23, 24, 25] },
  ZAL: { label: 'ŻAL', shortRange: '#26–#30', numbers: [26, 27, 28, 29, 30] },
  ZIMA: { label: 'ZIMA', shortRange: '#31–#35', numbers: [31, 32, 33, 34, 35] },
};

const AVAILABLE_META_FANPAGES: Array<{
  id: string;
  name: string;
  initials: string;
  instagramUserId?: string;
  note: string;
}> = [
  { id: '866702399857726', name: 'Centrum Dobrego Kroku', initials: 'CK', instagramUserId: '17841477743222560', note: 'Poradnikowo-ekspercki (Rekomendowany Dorośli)' },
  { id: '945290751994002', name: 'Dziennik Zdrowego Ciała', initials: 'DZ', instagramUserId: '17841446201609005', note: 'Codziennik i Historie (Dorośli)' },
  { id: '798916893308685', name: 'Porady Mamy Gosi', initials: 'MG', instagramUserId: '17841473314157729', note: 'Batch 1 Dzieci (ANTKI CC35)' },
  { id: '752135021308884', name: 'Orthomax Sklep', initials: 'OS', instagramUserId: '17841472034688013', note: 'Sklep / Brand' },
  { id: '875160819014767', name: 'Orthomax.pl', initials: 'OP', instagramUserId: '17841478897452356', note: 'Sklep / Domena' },
  { id: '832791273240857', name: 'Orthomax', initials: 'OM', instagramUserId: '17841476823809834', note: 'Brand' },
  { id: '1204366092764321', name: 'Dr. Magdalena Rokicińska', initials: 'MR', instagramUserId: '17841439381913725', note: 'Profil ekspercki' },
  { id: '1339041252618036', name: 'Dr n. med. Janusz Skrzypiński', initials: 'JS', instagramUserId: '17841437463666297', note: 'Profil lekarski' },
  { id: '1194345203770949', name: 'Iwona Kożuchowska', initials: 'IK', instagramUserId: '17841412233487287', note: 'Profil osobowy' },
];

type CampaignStructureState = {
  accountId: string;
  accountName: string;
  campaignId: string;
  campaignName: string;
  costCapPln: number;
  bidAmountMinor: number;
  dailyBudgetPln: number;
  budgetMode: 'CBO' | 'ABO';
  sourceCampaignName: string;
  sourceAdSetName: string;
  pixelId?: string;
  createdAt: number;
  groups: Array<{
    code: string;
    label: string;
    shortRange: string;
    description: string;
    angleIds: string[];
    adSetId?: string;
    adSetName?: string;
    bidAmountMinor?: number;
    status?: string;
  }>;
};

export default function AntkiPlPage() {
  const [presets, setPresets] = useState<AntkiPlPresetAngle[]>([]);
  const [stages, setStages] = useState<Record<string, StageMeta>>({});
  const [savedAds, setSavedAds] = useState<AntkiPlGeneratedAd[]>([]);
  const [imageLibrary, setImageLibrary] = useState<AntkiPlImageAsset[]>(ANTKI_PL_IMAGE_LIBRARY);
  const [brain, setBrain] = useState<{ provider: string; model: string }>({ provider: 'openai', model: 'gpt-5.4' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Image Gallery & Preview state
  const [showGalleryPanel, setShowGalleryPanel] = useState(false);
  const [showAwarenessPanel, setShowAwarenessPanel] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'all' | 'ai' | 'meta' | 'custom'>('all');
  const [lightboxAsset, setLightboxAsset] = useState<AntkiPlImageAsset | null>(null);
  const [assigningImage, setAssigningImage] = useState(false);
  const [uploadingCustomImage, setUploadingCustomImage] = useState(false);
  const customImageInputRef = useRef<HTMLInputElement | null>(null);
  const [fbPreviewExpanded, setFbPreviewExpanded] = useState(true);

  // Domyślnie pokazujemy nowy Batch 2: 35 Copy dla Dorosłych (#36-#70, D01-D35) z łatwym przełącznikiem na Batch 1: Dzieci CC35 (#1-#35)
  const [stageFilter, setStageFilter] = useState<
    | 'dorosli_35'
    | 'dorosli_d1'
    | 'dorosli_d2'
    | 'dorosli_d3'
    | 'dorosli_d4'
    | 'dorosli_d5'
    | 'dorosli_d6'
    | 'dorosli_d7'
    | 'all_kids'
    | 'all'
    | AntkiPlFunnelStage
  >('dorosli_35');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAngleId, setActiveAngleId] = useState<string | null>('dorosli-01-sor-zablokowane-kolano');

  // Generation & Fanpage settings (domyślnie dla Batch 2 Dorośli: Centrum Dobrego Kroku · 866702399857726)
  const [destinationUrl, setDestinationUrl] = useState('https://orthomax.pl/products/orthomax-stepmax');
  const [selectedPageId, setSelectedPageId] = useState('866702399857726');
  const [pageName, setPageName] = useState('Centrum Dobrego Kroku');
  const [manualPageOverride, setManualPageOverride] = useState(false);
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

  // Meta Cost Cap Campaign & 7 Ad Sets state (UMOWA ALLCAN PROJECTS SP ZOO ORTHOMAX · 1109284831182252)
  const [adSetBlueprints, setAdSetBlueprints] = useState<
    Array<{ code: string; label: string; shortRange: string; description: string; angleIds: string[] }>
  >([]);
  const [dorosliAdSetBlueprints, setDorosliAdSetBlueprints] = useState<
    Array<{ code: string; label: string; shortRange: string; description: string; angleIds: string[] }>
  >([]);
  const [campaignStructure, setCampaignStructure] = useState<CampaignStructureState | null>(null);
  const [dorosliCampaignStructure, setDorosliCampaignStructure] = useState<CampaignStructureState | null>(null);
  const [metaCampaignName, setMetaCampaignName] = useState('ANTKI DOROSLI CC30');
  const [metaCostCapPln, setMetaCostCapPln] = useState(30);
  const [metaDailyBudgetPln, setMetaDailyBudgetPln] = useState(1500);
  const [creatingMetaCampaign, setCreatingMetaCampaign] = useState(false);
  const [updatingCostCap, setUpdatingCostCap] = useState(false);
  const [syncingMetaCc35, setSyncingMetaCc35] = useState(false);
  const [showCampaignPanel, setShowCampaignPanel] = useState(false);

  const isDorosliBatchView = stageFilter.startsWith('dorosli_');

  useEffect(() => {
    if (manualPageOverride) return;
    if (isDorosliBatchView) {
      setSelectedPageId('866702399857726');
      setPageName('Centrum Dobrego Kroku');
      setMetaCampaignName(dorosliCampaignStructure?.campaignName || 'ANTKI DOROSLI CC30');
    } else {
      setSelectedPageId('798916893308685');
      setPageName('Porady Mamy Gosi');
      setMetaCampaignName(campaignStructure?.campaignName || 'ANTKI CC35');
    }
  }, [isDorosliBatchView, manualPageOverride, dorosliCampaignStructure, campaignStructure]);

  const handleSelectFanpage = useCallback((newPageId: string) => {
    setManualPageOverride(true);
    setSelectedPageId(newPageId);
    const found = AVAILABLE_META_FANPAGES.find(p => p.id === newPageId);
    if (found) setPageName(found.name);
  }, []);

  const loadInit = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/antki-pl', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd ładowania Antki PL.');
      let loadedAds: AntkiPlGeneratedAd[] = Array.isArray(data.savedAds) ? data.savedAds : [];
      try {
        const rawLocal = typeof window !== 'undefined' ? window.localStorage.getItem('antki_pl_saved_images_v2') : null;
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal) as Record<
            string,
            {
              imageUrl?: string;
              imageHash?: string;
              secondImageUrl?: string;
              secondImageHash?: string;
              updatedAt?: number;
            }
          >;
          loadedAds = loadedAds.map(ad => {
            const loc = parsedLocal[ad.angleId];
            if (!loc) return ad;
            return {
              ...ad,
              imageUrl: loc.imageUrl || ad.imageUrl,
              imageHash: loc.imageHash || ad.imageHash,
              secondImageUrl: loc.secondImageUrl !== undefined ? loc.secondImageUrl || undefined : ad.secondImageUrl,
              secondImageHash: loc.secondImageHash !== undefined ? loc.secondImageHash || undefined : ad.secondImageHash,
              updatedAt: Math.max(ad.updatedAt || 0, loc.updatedAt || 0),
            };
          });
        }
      } catch {
        // Ignore localStorage parse errors
      }
      setPresets(data.presets || []);
      setStages(data.stages || {});
      setSavedAds(loadedAds);
      if (Array.isArray(data.imageLibrary) && data.imageLibrary.length > 0) {
        setImageLibrary(data.imageLibrary);
      }
      if (data.adSetBlueprints) setAdSetBlueprints(data.adSetBlueprints);
      if (data.dorosliAdSetBlueprints) setDorosliAdSetBlueprints(data.dorosliAdSetBlueprints);
      if (data.campaignStructure) {
        setCampaignStructure(data.campaignStructure);
        setMetaCostCapPln(data.campaignStructure.costCapPln || 30);
        setMetaDailyBudgetPln(data.campaignStructure.dailyBudgetPln || 1500);
      }
      if (data.dorosliCampaignStructure) {
        setDorosliCampaignStructure(data.dorosliCampaignStructure);
      }
      if (data.brain) setBrain(data.brain);
      if (data.defaultUrl) setDestinationUrl(data.defaultUrl);
      if (data.presets?.length) {
        setActiveAngleId(prev => prev || data.presets[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się załadować danych.');
    } finally {
      setLoading(false);
    }
  }, []);

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
      if (stageFilter === 'dorosli_35') {
        if (item.number < 36 || item.number > 70) return false;
      } else if (stageFilter === 'dorosli_d1') {
        if (item.number < 36 || item.number > 40) return false;
      } else if (stageFilter === 'dorosli_d2') {
        if (item.number < 41 || item.number > 45) return false;
      } else if (stageFilter === 'dorosli_d3') {
        if (item.number < 46 || item.number > 50) return false;
      } else if (stageFilter === 'dorosli_d4') {
        if (item.number < 51 || item.number > 55) return false;
      } else if (stageFilter === 'dorosli_d5') {
        if (item.number < 56 || item.number > 60) return false;
      } else if (stageFilter === 'dorosli_d6') {
        if (item.number < 61 || item.number > 65) return false;
      } else if (stageFilter === 'dorosli_d7') {
        if (item.number < 66 || item.number > 70) return false;
      } else if (stageFilter === 'all_kids') {
        if (item.number > 35 || item.funnelStage === 'dorosli_jesien_zima') return false;
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

  // Export functions (domyślnie eksportuje zaznaczone lub aktualnie wybrany Batch / widok)
  const readyAdsForExport = useMemo(() => {
    const chosenSet = new Set(selectedIds);
    const sourcePresets = chosenSet.size ? presets.filter(p => chosenSet.has(p.id)) : filteredPresets;
    const list = sourcePresets
      .map(p => adByAngleId[p.id])
      .filter((a): a is AntkiPlGeneratedAd => !!a && !!a.primaryText);
    return list;
  }, [presets, filteredPresets, selectedIds, adByAngleId]);

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

  const handleCreateMetaCampaign = async (forceNew = true) => {
    setCreatingMetaCampaign(true);
    setError('');
    const batchMode = isDorosliBatchView ? 'dorosli' : 'dzieci';
    setNotice(
      `Tworzę kampanię "${metaCampaignName}" (${batchMode === 'dorosli' ? 'Batch 2: 35 Dorośli' : 'Batch 1: 35 Dzieci'}) + 7 zestawów reklam (Cost Cap ${metaCostCapPln} PLN) na koncie UMOWA ALLCAN PROJECTS SP ZOO ORTHOMAX (1109284831182252)...`,
    );
    try {
      const res = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-meta-campaign',
          batch: batchMode,
          accountId: '1109284831182252',
          campaignName: metaCampaignName,
          costCapPln: metaCostCapPln,
          dailyBudgetPln: metaDailyBudgetPln,
          forceNew,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Nie udało się utworzyć kampanii w Meta.');
      if (batchMode === 'dorosli') {
        setDorosliCampaignStructure(data.campaignStructure);
      } else {
        setCampaignStructure(data.campaignStructure);
      }
      setNotice(
        `Gotowe! Utworzono kampanię "${data.campaignStructure.campaignName}" (ID: ${data.campaignStructure.campaignId}) oraz 7 Ad Setów z Cost Cap ${data.campaignStructure.costCapPln} PLN (PAUSED) na koncie UMOWA ALLCAN PROJECTS SP ZOO ORTHOMAX.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd tworzenia kampanii w Meta.');
    } finally {
      setCreatingMetaCampaign(false);
    }
  };

  const handleUpdateCostCap = async (targetPln = metaCostCapPln) => {
    setUpdatingCostCap(true);
    setError('');
    try {
      const res = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_cost_cap',
          costCapPln: targetPln,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zmiany Cost Cap.');
      setMetaCostCapPln(targetPln);
      setCampaignStructure(prev => (prev ? { ...prev, costCapPln: targetPln, bidAmountMinor: Math.round(targetPln * 100) } : prev));
      setDorosliCampaignStructure(prev => (prev ? { ...prev, costCapPln: targetPln, bidAmountMinor: Math.round(targetPln * 100) } : prev));
      setNotice(
        `✅ Zmieniono Cost Cap na ${targetPln} PLN (${Math.round(targetPln * 100)} gr) w ${data.updatedCount || 0} zestawach reklam w Meta!`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zmienić Cost Cap.');
    } finally {
      setUpdatingCostCap(false);
    }
  };

  const [inlinePickerAngleId, setInlinePickerAngleId] = useState<string | null>(null);
  const [imageSlotTarget, setImageSlotTarget] = useState<1 | 2>(1);
  const [savingImages, setSavingImages] = useState(false);
  const [imagesSavedFlash, setImagesSavedFlash] = useState(false);

  const persistAngleImagesLocally = useCallback(
    (
      updates: Record<
        string,
        {
          imageUrl?: string;
          imageHash?: string;
          secondImageUrl?: string;
          secondImageHash?: string;
          updatedAt: number;
        }
      >,
    ) => {
      try {
        if (typeof window === 'undefined') return;
        const raw = window.localStorage.getItem('antki_pl_saved_images_v2');
        const current = raw ? JSON.parse(raw) : {};
        const merged = { ...current, ...updates };
        window.localStorage.setItem('antki_pl_saved_images_v2', JSON.stringify(merged));
      } catch {
        // Ignore storage errors
      }
    },
    [],
  );

  const assignImageToAngles = useCallback(
    async (
      targetAngleIds: string[],
      asset: AntkiPlImageAsset,
      labelForNotice: string,
      explicitSlot?: 1 | 2,
    ) => {
      if (!targetAngleIds.length) return;
      setError('');
      setImagesSavedFlash(false);
      const slot = explicitSlot || imageSlotTarget;
      const now = Date.now();
      const targetSet = new Set(targetAngleIds);

      const sampleAngleId = targetAngleIds[0];
      const existingAd = savedAds.find(item => item.angleId === sampleAngleId);
      const samplePreset = presets.find(p => p.id === sampleAngleId);
      const fallbackAsset = getDefaultImageForAngle(samplePreset?.number || 1);
      const currentPrimaryUrl = existingAd?.imageUrl || samplePreset?.defaultImageUrl || fallbackAsset.url;
      const currentPrimaryHash = existingAd?.imageHash || samplePreset?.defaultImageHash || fallbackAsset.imageHash;
      const currentSecondUrl = existingAd?.secondImageUrl || '';
      const currentSecondHash = existingAd?.secondImageHash || '';

      const nextPrimaryUrl = slot === 1 ? asset.url : currentPrimaryUrl;
      const nextPrimaryHash = slot === 1 ? asset.imageHash : currentPrimaryHash;
      const nextSecondUrl = slot === 2 ? asset.url : currentSecondUrl;
      const nextSecondHash = slot === 2 ? asset.imageHash : currentSecondHash;

      const localUpdates: Record<
        string,
        {
          imageUrl?: string;
          imageHash?: string;
          secondImageUrl?: string;
          secondImageHash?: string;
          updatedAt: number;
        }
      > = {};

      // 0ms OPTIMISTIC UI UPDATE — 2 osobne zdjęcia na A/B test (bez sklejania w kolaż!)
      setSavedAds(prev => {
        const next = [...prev];
        for (const angleId of targetAngleIds) {
          const idx = next.findIndex(item => item.angleId === angleId);
          if (idx >= 0) {
            const cur = next[idx];
            const pUrl = slot === 1 ? asset.url : cur.imageUrl || currentPrimaryUrl;
            const pHash = slot === 1 ? asset.imageHash : cur.imageHash || currentPrimaryHash;
            const sUrl = slot === 2 ? asset.url : cur.secondImageUrl;
            const sHash = slot === 2 ? asset.imageHash : cur.secondImageHash;
            localUpdates[angleId] = {
              imageUrl: pUrl,
              imageHash: pHash,
              secondImageUrl: sUrl || '',
              secondImageHash: sHash || '',
              updatedAt: now,
            };
            next[idx] = {
              ...cur,
              imageUrl: pUrl,
              imageHash: pHash,
              secondImageUrl: sUrl,
              secondImageHash: sHash,
              combinedSplitImageUrl: undefined,
              combinedSplitImageHash: undefined,
              updatedAt: now,
            };
          } else {
            const preset = presets.find(p => p.id === angleId);
            if (preset) {
              const pUrl = slot === 1 ? asset.url : preset.defaultImageUrl;
              const pHash = slot === 1 ? asset.imageHash : preset.defaultImageHash;
              const sUrl = slot === 2 ? asset.url : undefined;
              const sHash = slot === 2 ? asset.imageHash : undefined;
              localUpdates[angleId] = {
                imageUrl: pUrl,
                imageHash: pHash,
                secondImageUrl: sUrl || '',
                secondImageHash: sHash || '',
                updatedAt: now,
              };
              next.unshift({
                id: `antek-pl-${preset.code}-${now}`,
                angleId: preset.id,
                code: preset.code,
                title: preset.title,
                segment: preset.segment,
                funnelStage: preset.funnelStage,
                pageName,
                headline: preset.defaultHeadline,
                description: '',
                primaryText: '',
                destinationUrl,
                cta: 'LEARN_MORE',
                imageUrl: pUrl,
                imageHash: pHash,
                secondImageUrl: sUrl,
                secondImageHash: sHash,
                wordCount: 0,
                characterCount: 0,
                auditPassed: true,
                auditWarnings: [],
                auditFixesApplied: [],
                createdAt: now,
                updatedAt: now,
              });
            }
          }
        }
        persistAngleImagesLocally(localUpdates);
        return next;
      });

      if (slot === 1) {
        setPresets(prev =>
          prev.map(p =>
            targetSet.has(p.id)
              ? { ...p, defaultImageUrl: asset.url, defaultImageHash: asset.imageHash }
              : p,
          ),
        );
      }

      setNotice(
        slot === 2
          ? `🔥 Ustawiono osobny Obrazek B (Test A/B — 2. osobna reklama w adsecie) dla ${labelForNotice}: "${asset.label}"`
          : `⚡ Ustawiono Obrazek A (Główny) dla ${labelForNotice}: "${asset.label}"`,
      );

      void fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_image',
          angleIds: targetAngleIds,
          imageUrl: nextPrimaryUrl,
          imageHash: nextPrimaryHash,
          secondImageUrl: nextSecondUrl,
          secondImageHash: nextSecondHash,
        }),
      }).catch(() => {});
    },
    [presets, pageName, destinationUrl, imageSlotTarget, savedAds, persistAngleImagesLocally],
  );

  const updateTwoImageConfig = useCallback(
    async (
      angleId: string,
      opts: {
        imageUrl: string;
        imageHash?: string;
        secondImageUrl: string;
        secondImageHash?: string;
      },
      noticeMsg: string,
    ) => {
      const now = Date.now();
      setImagesSavedFlash(false);
      persistAngleImagesLocally({
        [angleId]: {
          imageUrl: opts.imageUrl,
          imageHash: opts.imageHash || '',
          secondImageUrl: opts.secondImageUrl || '',
          secondImageHash: opts.secondImageHash || '',
          updatedAt: now,
        },
      });
      setSavedAds(prev =>
        prev.map(item =>
          item.angleId === angleId
            ? {
                ...item,
                imageUrl: opts.imageUrl,
                imageHash: opts.imageHash,
                secondImageUrl: opts.secondImageUrl || undefined,
                secondImageHash: opts.secondImageHash || undefined,
                combinedSplitImageUrl: undefined,
                combinedSplitImageHash: undefined,
                updatedAt: now,
              }
            : item,
        ),
      );
      if (!opts.secondImageUrl) {
        setImageSlotTarget(1);
      }
      setNotice(noticeMsg);

      void fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_image',
          angleIds: [angleId],
          imageUrl: opts.imageUrl,
          imageHash: opts.imageHash,
          secondImageUrl: opts.secondImageUrl,
          secondImageHash: opts.secondImageHash,
        }),
      }).catch(() => {});
    },
    [persistAngleImagesLocally],
  );

  const handleSaveImages = useCallback(async () => {
    setSavingImages(true);
    setError('');
    try {
      const now = Date.now();
      const imagesByAngle: Record<
        string,
        {
          imageUrl?: string;
          imageHash?: string;
          secondImageUrl?: string | null;
          secondImageHash?: string | null;
        }
      > = {};
      const localUpdates: Record<
        string,
        {
          imageUrl?: string;
          imageHash?: string;
          secondImageUrl?: string;
          secondImageHash?: string;
          updatedAt: number;
        }
      > = {};

      for (const ad of savedAds) {
        if (!ad.angleId) continue;
        imagesByAngle[ad.angleId] = {
          imageUrl: ad.imageUrl,
          imageHash: ad.imageHash,
          secondImageUrl: ad.secondImageUrl || null,
          secondImageHash: ad.secondImageHash || null,
        };
        localUpdates[ad.angleId] = {
          imageUrl: ad.imageUrl,
          imageHash: ad.imageHash || '',
          secondImageUrl: ad.secondImageUrl || '',
          secondImageHash: ad.secondImageHash || '',
          updatedAt: now,
        };
      }

      if (activeAngle) {
        const curAd = savedAds.find(a => a.angleId === activeAngle.id);
        const fallback = getDefaultImageForAngle(activeAngle.number);
        const pUrl = curAd?.imageUrl || activeAngle.defaultImageUrl || fallback.url;
        const pHash = curAd?.imageHash || activeAngle.defaultImageHash || fallback.imageHash;
        const sUrl = curAd?.secondImageUrl || null;
        const sHash = curAd?.secondImageHash || null;
        imagesByAngle[activeAngle.id] = {
          imageUrl: pUrl,
          imageHash: pHash,
          secondImageUrl: sUrl,
          secondImageHash: sHash,
        };
        localUpdates[activeAngle.id] = {
          imageUrl: pUrl,
          imageHash: pHash || '',
          secondImageUrl: sUrl || '',
          secondImageHash: sHash || '',
          updatedAt: now,
        };
      }

      persistAngleImagesLocally(localUpdates);

      const res = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_all_images',
          imagesByAngle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu obrazków.');
      setImagesSavedFlash(true);
      const abCount = Object.values(imagesByAngle).filter(v => Boolean(v.secondImageUrl)).length;
      setNotice(
        `✅ Zapisano obrazki na stałe! (${Object.keys(imagesByAngle).length} Antków zapisanych w bazie${
          abCount > 0 ? `, w tym ${abCount} z 2 osobnymi zdjęciami A/B` : ''
        })`,
      );
      setTimeout(() => setImagesSavedFlash(false), 4500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać obrazków.');
    } finally {
      setSavingImages(false);
    }
  }, [savedAds, activeAngle, persistAngleImagesLocally]);

  const [arrowKeyTarget, setArrowKeyTarget] = useState<'copy' | 'image'>('copy');

  const compressImageFileToDataUrl = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Nie udało się odczytać pliku zdjęcia.'));
      reader.onload = () => {
        const rawDataUrl = String(reader.result || '');
        const img = new Image();
        img.onerror = () => resolve(rawDataUrl);
        img.onload = () => {
          try {
            const maxDim = 1280;
            let w = img.naturalWidth || img.width || 1080;
            let h = img.naturalHeight || img.height || 1080;
            if (w > maxDim || h > maxDim) {
              if (w >= h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(rawDataUrl);
              return;
            }
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.86));
          } catch {
            resolve(rawDataUrl);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleUploadCustomImageFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      const fileArray = Array.from(files).filter(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(f.name));
      if (!fileArray.length) {
        setError('Wybierz plik graficzny (JPG, PNG lub WEBP).');
        return;
      }

      setUploadingCustomImage(true);
      setError('');
      try {
        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const dataUrl = await compressImageFileToDataUrl(file);
          const cleanName = file.name.replace(/\.[^.]+$/, '');
          const tempAsset: AntkiPlImageAsset = {
            id: `custom-local-${Date.now()}-${i}`,
            url: dataUrl,
            label: `Twoje zdjęcie: ${cleanName}`,
            source: 'custom',
            aspectRatio: '1:1',
          };

          // Natychmiastowe dodanie do galerii (0ms) i przypisanie do aktywnego Antka
          setImageLibrary(prev => [tempAsset, ...prev]);
          if (i === 0 && activeAngle) {
            setSavedAds(prev => {
              const next = [...prev];
              const idx = next.findIndex(item => item.angleId === activeAngle.id);
              if (idx >= 0) {
                next[idx] = { ...next[idx], imageUrl: dataUrl, updatedAt: Date.now() };
              }
              return next;
            });
            setPresets(prev =>
              prev.map(p => (p.id === activeAngle.id ? { ...p, defaultImageUrl: dataUrl } : p)),
            );
          }

          setNotice(`Wgrywam "${file.name}" do Szekspira i Biblioteki Meta (act_1109284831182252)...`);

          const res = await fetch('/api/antki-pl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'upload_custom_image',
              dataUrl,
              fileName: file.name,
              label: `Twoje zdjęcie: ${cleanName}`,
              angleId: i === 0 && activeAngle ? activeAngle.id : undefined,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Błąd wgrywania zdjęcia.');

          if (Array.isArray(data.imageLibrary)) {
            setImageLibrary(data.imageLibrary);
          } else if (data.asset) {
            setImageLibrary(prev => [data.asset, ...prev.filter(item => item.id !== tempAsset.id)]);
          }

          if (i === 0 && activeAngle && data.asset) {
            const uploadedAsset = data.asset as AntkiPlImageAsset;
            setSavedAds(prev =>
              prev.map(item =>
                item.angleId === activeAngle.id
                  ? {
                      ...item,
                      imageUrl: uploadedAsset.url,
                      imageHash: uploadedAsset.imageHash || item.imageHash,
                      updatedAt: Date.now(),
                    }
                  : item,
              ),
            );
            setPresets(prev =>
              prev.map(p =>
                p.id === activeAngle.id
                  ? {
                      ...p,
                      defaultImageUrl: uploadedAsset.url,
                      defaultImageHash: uploadedAsset.imageHash || p.defaultImageHash,
                    }
                  : p,
              ),
            );
            setNotice(
              `✓ Wgrano własne zdjęcie "${cleanName}"${
                uploadedAsset.imageHash ? ` (Meta hash: ${uploadedAsset.imageHash})` : ''
              } i przypisano na stałe do Antka #${activeAngle.number}${
                data.metaSynced ? ' (zaktualizowano reklamę w Meta ANTKI CC35)' : ''
              }!`,
            );
          } else {
            setNotice(`✓ Wgrano własne zdjęcie "${cleanName}" do galerii kreacji!`);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nie udało się wgrać własnego zdjęcia.');
      } finally {
        setUploadingCustomImage(false);
        if (customImageInputRef.current) {
          customImageInputRef.current.value = '';
        }
      }
    },
    [activeAngle, compressImageFileToDataUrl],
  );

  const handleDeleteImageFromLibrary = useCallback(
    async (asset: AntkiPlImageAsset) => {
      // Natychmiastowe usunięcie z UI (0ms)
      setImageLibrary(prev => prev.filter(item => item.id !== asset.id && item.url !== asset.url));
      setNotice(`Usunięto zdjęcie „${asset.label}” z biblioteki.`);
      try {
        const res = await fetch('/api/antki-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_image',
            imageId: asset.id,
            imageUrl: asset.url,
          }),
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.imageLibrary)) {
          setImageLibrary(data.imageLibrary);
        }
      } catch {
        // Already removed from state
      }
    },
    [],
  );

  const [generatingKie5AngleId, setGeneratingKie5AngleId] = useState<string | null>(null);
  const [kieTasksByAngle, setKieTasksByAngle] = useState<
    Record<
      string,
      Array<{
        index: number;
        label: string;
        prompt: string;
        taskId: string;
        state: 'generating' | 'success' | 'fail';
        asset?: AntkiPlImageAsset;
        error?: string;
      }>
    >
  >({});

  const handleGenerate5KieImagesForActiveAngle = useCallback(async () => {
    if (!activeAngle) return;
    const copyText = (editPrimaryText || activeAd?.primaryText || '').trim();
    const copyHeadline = (editHeadline || activeAd?.headline || activeAngle.defaultHeadline || '').trim();
    if (!copyText) {
      setError('Najpierw wygeneruj lub wpisz tekst Antka, aby Kie.ai miało z czego wyciągnąć 5 scen.');
      return;
    }

    const targetAngleId = activeAngle.id;
    const targetAngleNumber = activeAngle.number;
    setGeneratingKie5AngleId(targetAngleId);
    setError('');
    setNotice(
      `📸 Wyciągam 5 konkretnych scen z tekstu Antka #${targetAngleNumber} i odpalam 5 surowych zdjęć w Kie.ai (Shit Quality / Zero AI Glow)...`,
    );

    try {
      const startRes = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_5_kie_images',
          angleId: targetAngleId,
          primaryText: copyText,
          headline: copyHeadline,
          title: activeAngle.title,
          segment: activeAngle.segment,
        }),
      });
      const startData = await startRes.json();
      if (!startRes.ok || !Array.isArray(startData.tasks)) {
        throw new Error(startData.error || 'Nie udało się uruchomić generowania 5 zdjęć w Kie.ai.');
      }

      const initialTasks = (startData.tasks as Array<{
        index: number;
        label: string;
        prompt: string;
        taskId: string;
      }>).map(t => ({
        ...t,
        state: 'generating' as const,
      }));

      setKieTasksByAngle(prev => ({
        ...prev,
        [targetAngleId]: initialTasks,
      }));

      let completedCount = 0;
      const finishedAssets: AntkiPlImageAsset[] = [];

      await Promise.all(
        initialTasks.map(async task => {
          const maxAttempts = 45;
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(r => setTimeout(r, 3500));
            try {
              const pollRes = await fetch('/api/antki-pl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'poll_kie_image',
                  taskId: task.taskId,
                  angleId: targetAngleId,
                  label: task.label,
                  prompt: task.prompt,
                }),
              });
              const pollData = await pollRes.json();
              if (pollData.state === 'success' && pollData.asset) {
                const asset = pollData.asset as AntkiPlImageAsset;
                completedCount += 1;
                finishedAssets.push(asset);
                if (Array.isArray(pollData.imageLibrary)) {
                  setImageLibrary(pollData.imageLibrary);
                } else {
                  setImageLibrary(prev => [asset, ...prev.filter(x => x.id !== asset.id)]);
                }
                setKieTasksByAngle(prev => ({
                  ...prev,
                  [targetAngleId]: (prev[targetAngleId] || []).map(item =>
                    item.taskId === task.taskId ? { ...item, state: 'success', asset } : item,
                  ),
                }));
                setNotice(
                  `📸 Wygenerowano ${completedCount}/5 surowych zdjęć z Antka #${targetAngleNumber} w Kie.ai („${task.label}”)!`,
                );
                return;
              }
              if (pollData.state === 'fail') {
                setKieTasksByAngle(prev => ({
                  ...prev,
                  [targetAngleId]: (prev[targetAngleId] || []).map(item =>
                    item.taskId === task.taskId
                      ? { ...item, state: 'fail', error: pollData.error || 'Błąd Kie.ai' }
                      : item,
                  ),
                }));
                return;
              }
            } catch {
              // continue polling
            }
          }
        }),
      );

      if (finishedAssets.length >= 2) {
        await assignImageToAngles([targetAngleId], finishedAssets[0], `Antek #${targetAngleNumber} (Obrazek A)`, 1);
        await assignImageToAngles([targetAngleId], finishedAssets[1], `Antek #${targetAngleNumber} (Obrazek B)`, 2);
        setNotice(
          `✅ Gotowe! Wygenerowano ${finishedAssets.length}/5 surowych zdjęć z Antka #${targetAngleNumber} (Shit Quality) i przypisano 2 pierwsze jako Obrazek A + Obrazek B. Możesz poniżej kliknąć dowolne z 5 zdjęć, żeby podmienić A lub B!`,
        );
      } else if (finishedAssets.length === 1) {
        await assignImageToAngles([targetAngleId], finishedAssets[0], `Antek #${targetAngleNumber} (Obrazek A)`, 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas generowania 5 zdjęć w Kie.ai.');
    } finally {
      setGeneratingKie5AngleId(null);
    }
  }, [activeAngle, editPrimaryText, activeAd, editHeadline, assignImageToAngles]);

  const cycleAngleImage = useCallback(
    (angle: AntkiPlPresetAngle, delta: -1 | 1, explicitSlot?: 1 | 2) => {
      const slot = explicitSlot || (activeAngle?.id === angle.id ? imageSlotTarget : 1);
      const pool = imageLibrary.length > 0 ? imageLibrary : ANTKI_PL_IMAGE_LIBRARY;
      const ad = adByAngleId[angle.id];
      const currentUrl =
        slot === 2
          ? ad?.secondImageUrl || ''
          : ad?.imageUrl || angle.defaultImageUrl || getDefaultImageForAngle(angle.number).url;
      const currentIdx = pool.findIndex(item => item.url === currentUrl);
      const nextIdx = currentIdx < 0 ? 0 : (currentIdx + delta + pool.length) % pool.length;
      const nextAsset = pool[nextIdx];
      if (nextAsset) {
        void assignImageToAngles([angle.id], nextAsset, `Antek #${angle.number}`, slot);
      }
    },
    [imageLibrary, adByAngleId, assignImageToAngles, activeAngle, imageSlotTarget],
  );

  const cycleActiveCopy = useCallback(
    (delta: -1 | 1) => {
      if (!filteredPresets.length) return;
      const idx = activeAngle ? filteredPresets.findIndex(p => p.id === activeAngle.id) : 0;
      const nextIdx = idx < 0 ? 0 : (idx + delta + filteredPresets.length) % filteredPresets.length;
      const next = filteredPresets[nextIdx];
      if (next) {
        setActiveAngleId(next.id);
        setTimeout(() => {
          document.getElementById(`antek-card-${next.id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
      }
    },
    [filteredPresets, activeAngle],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }

      if (lightboxAsset) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setLightboxAsset(null);
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const pool = imageLibrary.length > 0 ? imageLibrary : ANTKI_PL_IMAGE_LIBRARY;
          const idx = pool.findIndex(item => item.url === lightboxAsset.url);
          const delta = e.key === 'ArrowRight' ? 1 : -1;
          const next = pool[(idx + delta + pool.length) % pool.length];
          if (next) setLightboxAsset(next);
          return;
        }
      }

      if (!activeAngle) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const delta: -1 | 1 = e.key === 'ArrowRight' ? 1 : -1;
        const switchImage = e.shiftKey ? arrowKeyTarget === 'copy' : arrowKeyTarget === 'image';
        if (switchImage) {
          cycleAngleImage(activeAngle, delta);
        } else {
          cycleActiveCopy(delta);
        }
      } else if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        cycleAngleImage(activeAngle, e.key === ']' ? 1 : -1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeAngle, arrowKeyTarget, cycleActiveCopy, cycleAngleImage, imageLibrary, lightboxAsset]);

  const activeFanpageMeta = useMemo(
    () => AVAILABLE_META_FANPAGES.find(p => p.id === selectedPageId) || AVAILABLE_META_FANPAGES[0],
    [selectedPageId],
  );

  const activeCampaignStructure = isDorosliBatchView ? dorosliCampaignStructure : campaignStructure;
  const activeAdSetBlueprints = isDorosliBatchView ? dorosliAdSetBlueprints : adSetBlueprints;

  const syncToMetaCc35 = useCallback(async () => {
    setSyncingMetaCc35(true);
    setError('');
    setNotice('');
    const batchMode = isDorosliBatchView ? 'dorosli' : 'dzieci';
    try {
      const res = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_meta_cc35',
          batch: batchMode,
          campaignId: activeCampaignStructure?.campaignId,
          campaignName: metaCampaignName,
          costCapPln: metaCostCapPln,
          dailyBudgetPln: metaDailyBudgetPln,
          pageId: selectedPageId,
          instagramUserId: activeFanpageMeta.instagramUserId,
          destinationUrl,
          updateExisting: true,
        }),
        signal: AbortSignal.timeout(290_000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd synchronizacji z Meta.');
      setNotice(
        `Zsynchronizowano kampanię ${batchMode === 'dorosli' ? 'ANTKI DOROSLI CC35' : 'ANTKI CC35'} (ID: ${data.campaignId || activeCampaignStructure?.campaignId || '120249912191200300'} · PAUSED) na fanpage „${pageName}” (${selectedPageId}): utworzono/zaktualizowano ${data.createdCount || 0} reklam (błędów: ${data.failedCount || 0}).`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd synchronizacji z Meta.');
    } finally {
      setSyncingMetaCc35(false);
    }
  }, [isDorosliBatchView, activeCampaignStructure, metaCampaignName, metaCostCapPln, metaDailyBudgetPln, selectedPageId, activeFanpageMeta, destinationUrl, pageName]);

  const exportUploaderJson = () => {
    if (!readyAdsForExport.length) {
      setError('Brak gotowych tekstów do eksportu JSON.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const adsPayload = readyAdsForExport.flatMap((ad, idx) => {
      const preset = presets.find(p => p.id === ad.angleId);
      const matchedGroup = activeCampaignStructure?.groups?.find(g => g.angleIds.includes(ad.angleId));
      const cleanDesc = (ad.description || '').trim();
      const adNumber = preset?.number || idx + 1;
      const defaultAsset = getDefaultImageForAngle(adNumber);
      const rawImgUrlA =
        ad.imageUrl ||
        defaultMediaUrl.trim() ||
        preset?.defaultImageUrl ||
        defaultAsset.url;
      const resolvedUrlA = rawImgUrlA.startsWith('/') && origin ? `${origin}${rawImgUrlA}` : rawImgUrlA;
      const resolvedHashA =
        ad.imageHash ||
        imageLibrary.find(item => item.url === rawImgUrlA)?.imageHash ||
        preset?.defaultImageHash ||
        defaultAsset.imageHash;

      const baseName = ad.code.startsWith('D') ? ad.code : `ad ${adNumber}`;
      const hasSecondAbImage = Boolean(ad.secondImageUrl && ad.secondImageUrl.trim());

      const buildItem = (
        suffix: '' | '_A' | '_B',
        nameSuffix: '' | ' A' | ' B',
        imgUrl: string,
        imgHash?: string,
      ) => ({
        key: `${ad.code}${suffix}`,
        name: `${baseName}${nameSuffix}`,
        url: ad.destinationUrl || destinationUrl,
        cta: ad.cta || 'LEARN_MORE',
        pageId: selectedPageId,
        ...(activeFanpageMeta.instagramUserId ? { instagramUserId: activeFanpageMeta.instagramUserId } : {}),
        primaryTexts: [ad.primaryText],
        headline: ad.headline,
        headlines: [ad.headline],
        ...(cleanDesc ? { description: cleanDesc, descriptions: [cleanDesc] } : { description: '', descriptions: [] }),
        ...(activeCampaignStructure?.accountId ? { accountId: activeCampaignStructure.accountId } : { accountId: '1109284831182252' }),
        ...(activeCampaignStructure?.campaignId && matchedGroup ? { campaignId: activeCampaignStructure.campaignId } : {}),
        ...(matchedGroup?.adSetId ? { adSetId: matchedGroup.adSetId } : {}),
        ...(imgUrl
          ? {
              media: {
                kind: 'image' as const,
                url: imgUrl,
                ...(imgHash ? { imageHash: imgHash } : {}),
                filename: `${ad.code}${suffix}.jpg`,
              },
            }
          : {}),
      });

      if (!hasSecondAbImage) {
        return [buildItem('', '', resolvedUrlA, resolvedHashA)];
      }

      const rawImgUrlB = ad.secondImageUrl!.trim();
      const resolvedUrlB = rawImgUrlB.startsWith('/') && origin ? `${origin}${rawImgUrlB}` : rawImgUrlB;
      const resolvedHashB =
        ad.secondImageHash ||
        imageLibrary.find(item => item.url === rawImgUrlB)?.imageHash;

      return [
        buildItem('_A', ' A', resolvedUrlA, resolvedHashA),
        buildItem('_B', ' B', resolvedUrlB, resolvedHashB),
      ];
    });

    const isBatch2 = stageFilter.startsWith('dorosli_');
    const batchSlug = isBatch2 ? 'BATCH2_DOROSLI_35' : 'BATCH1_DZIECI';
    const blob = new Blob([JSON.stringify({ ads: adsPayload }, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SZEKSPIR_ADS_ANTKI_PL_${batchSlug}_${new Date().toISOString().slice(0, 10)}_${adsPayload.length}_szt.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(
      `Pobrano plik JSON (${adsPayload.length} osobnych kreacji z ${readyAdsForExport.length} kątów · Fanpage: ${pageName} · ${batchSlug}) ze zdjęciami A/B i image_hash, gotowy do wczytania w Szekspir Ads (/uploader).`,
    );
  };

  const totalGeneratedCount = Object.keys(adByAngleId).length;
  const activeStageMeta =
    stageFilter !== 'all' &&
    stageFilter !== 'all_kids' &&
    !stageFilter.startsWith('dorosli_')
      ? stages[stageFilter]
      : null;
  const displayedGroups = activeCampaignStructure?.groups?.length ? activeCampaignStructure.groups : activeAdSetBlueprints;

  const aiImagesCount = useMemo(() => imageLibrary.filter(i => i.source === 'ai').length, [imageLibrary]);
  const metaImagesCount = useMemo(() => imageLibrary.filter(i => i.source === 'meta').length, [imageLibrary]);
  const customImagesCount = useMemo(() => imageLibrary.filter(i => i.source === 'custom').length, [imageLibrary]);
  const filteredGalleryImages = useMemo(() => {
    if (galleryTab === 'ai') return imageLibrary.filter(i => i.source === 'ai');
    if (galleryTab === 'meta') return imageLibrary.filter(i => i.source === 'meta');
    if (galleryTab === 'custom') return imageLibrary.filter(i => i.source === 'custom');
    return imageLibrary;
  }, [imageLibrary, galleryTab]);

  const activeResolvedImage = useMemo(() => {
    if (!activeAngle) return imageLibrary[0];
    const currentUrl = activeAd?.imageUrl || activeAngle.defaultImageUrl || getDefaultImageForAngle(activeAngle.number).url;
    return (
      imageLibrary.find(item => item.url === currentUrl) || {
        id: 'custom-assigned',
        url: currentUrl,
        label: `Przypisana kreacja (#${activeAngle.number})`,
        source: (currentUrl.startsWith('data:image/') ? 'custom' : 'ai') as 'ai' | 'meta' | 'custom',
        imageHash: activeAd?.imageHash || activeAngle.defaultImageHash,
      }
    );
  }, [activeAngle, activeAd, imageLibrary]);

  const activeResolvedSecondImage = useMemo(() => {
    if (!activeAngle || !activeAd?.secondImageUrl) return null;
    const secondUrl = activeAd.secondImageUrl;
    return (
      imageLibrary.find(item => item.url === secondUrl) || {
        id: 'custom-assigned-2',
        url: secondUrl,
        label: `2. kreacja (#${activeAngle.number})`,
        source: (secondUrl.startsWith('data:image/') ? 'custom' : 'ai') as 'ai' | 'meta' | 'custom',
        imageHash: activeAd?.secondImageHash,
      }
    );
  }, [activeAngle, activeAd, imageLibrary]);

  return (
    <main className="wrap" style={{ maxWidth: 1460, margin: '0 auto', padding: '20px 20px 80px' }}>
      <input
        ref={customImageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => void handleUploadCustomImageFiles(e.target.files)}
      />
      <p className="crumb">
        <a href="/">← Home (Szekspir)</a> · <a href="/uploader">Szekspir Ads (Uploader) ↗</a> ·{' '}
        <a href="/profile">
          Mózg AI ({brain.provider}: {brain.model}) ↗
        </a>
      </p>

      {/* NAGŁÓWEK Z CZYSTYM KONTRASTEM + SZYBKI WYBÓR FANPAGE'A */}
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
            🇵🇱 ANTKI PL · {pageName} (Orthomax StepMax)
          </h1>
          <div className="sub" style={{ margin: 0, fontSize: 13, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span>
              Pakiet <strong>1+1 GRATIS (2 pary za 99,99 zł = 50 zł/para)</strong> + <strong>30 dni gwarancji</strong> ·
              Konto: <strong>1109284831182252</strong> · Fanpage:
            </span>
            <select
              value={selectedPageId}
              onChange={e => handleSelectFanpage(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                border: '1.5px solid #2563eb',
                background: '#eff6ff',
                color: '#1e3a8a',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {AVAILABLE_META_FANPAGES.map(fp => (
                <option key={fp.id} value={fp.id}>
                  {fp.name} ({fp.id}) — {fp.note}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowGalleryPanel(v => !v)}
            style={{
              padding: '8px 13px',
              borderRadius: 8,
              border: '1px solid #7c3aed',
              background: showGalleryPanel ? '#7c3aed' : 'var(--card)',
              color: showGalleryPanel ? '#ffffff' : '#6d28d9',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            🖼️ Galeria Kreacji ({imageLibrary.length}) {showGalleryPanel ? '▴' : '▾'}
          </button>

          <button
            type="button"
            onClick={() => setShowCampaignPanel(v => !v)}
            style={{
              padding: '8px 13px',
              borderRadius: 8,
              border: '1px solid #2563eb',
              background: showCampaignPanel ? '#2563eb' : 'var(--card)',
              color: showCampaignPanel ? '#ffffff' : '#1d4ed8',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            📅 Work Day Ad Sety ({displayedGroups.length}) {showCampaignPanel ? '▴' : '▾'}
          </button>

          <button
            type="button"
            onClick={() => setShowAwarenessPanel(v => !v)}
            style={{
              padding: '8px 13px',
              borderRadius: 8,
              border: '1px solid #0284c7',
              background: showAwarenessPanel ? '#0284c7' : 'var(--card)',
              color: showAwarenessPanel ? '#ffffff' : '#0369a1',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            🧠 Architektura Awareness Stage {showAwarenessPanel ? '▴' : '▾'}
          </button>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            style={{
              padding: '8px 13px',
              borderRadius: 8,
              border: '1px solid var(--accent)',
              background: 'var(--card)',
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: 12.5,
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
              padding: '8px 13px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: totalGeneratedCount ? 'var(--text)' : 'var(--muted)',
              fontWeight: 600,
              fontSize: 12.5,
              opacity: totalGeneratedCount ? 1 : 0.55,
              cursor: totalGeneratedCount ? 'pointer' : 'not-allowed',
            }}
          >
            ⬇ Markdown ({readyAdsForExport.length})
          </button>

          <button
            type="button"
            onClick={exportUploaderJson}
            disabled={!totalGeneratedCount}
            style={{
              padding: '8px 13px',
              borderRadius: 8,
              border: '1px solid #059669',
              background: totalGeneratedCount ? '#059669' : 'var(--card)',
              color: totalGeneratedCount ? '#ffffff' : 'var(--muted)',
              fontWeight: 700,
              fontSize: 12.5,
              opacity: totalGeneratedCount ? 1 : 0.55,
              cursor: totalGeneratedCount ? 'pointer' : 'not-allowed',
            }}
          >
            🚀 Eksport JSON ({readyAdsForExport.length})
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

      {/* 1. ROZWIJANA GALERIA KREACJI (SAMA CZYSTA SIATKA MINIATUR) */}
      <details
        open={showGalleryPanel}
        onToggle={e => setShowGalleryPanel((e.currentTarget as HTMLDetailsElement).open)}
        style={{
          borderRadius: 10,
          marginBottom: 10,
          background: 'var(--card)',
          border: '1px solid #ddd6fe',
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            padding: '11px 16px',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            fontWeight: 800,
            fontSize: 14,
            color: 'var(--text)',
          }}
        >
          <span>
            🖼️ Galeria Kreacji ({imageLibrary.length} zdjęć · {aiImagesCount} AI Native + {metaImagesCount} z Biblioteki Antków)
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9' }}>
            {showGalleryPanel ? 'Zwiń ▴' : 'Rozwiń ▾'}
          </span>
        </summary>

        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 12, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setGalleryTab('all')}
                style={{
                  padding: '6px 11px',
                  borderRadius: 7,
                  border: galleryTab === 'all' ? '1px solid #7c3aed' : '1px solid var(--border)',
                  background: galleryTab === 'all' ? '#7c3aed' : 'var(--bg)',
                  color: galleryTab === 'all' ? '#ffffff' : 'var(--text)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Wszystkie ({imageLibrary.length})
              </button>
              <button
                type="button"
                onClick={() => setGalleryTab('meta')}
                style={{
                  padding: '6px 11px',
                  borderRadius: 7,
                  border: galleryTab === 'meta' ? '1px solid #2563eb' : '1px solid var(--border)',
                  background: galleryTab === 'meta' ? '#2563eb' : 'var(--bg)',
                  color: galleryTab === 'meta' ? '#ffffff' : 'var(--text)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                📚 Stare z Biblioteki Antków ({metaImagesCount})
              </button>
              <button
                type="button"
                onClick={() => setGalleryTab('ai')}
                style={{
                  padding: '6px 11px',
                  borderRadius: 7,
                  border: galleryTab === 'ai' ? '1px solid #059669' : '1px solid var(--border)',
                  background: galleryTab === 'ai' ? '#059669' : 'var(--bg)',
                  color: galleryTab === 'ai' ? '#ffffff' : 'var(--text)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ✨ Nowe AI Native ({aiImagesCount})
              </button>
              {customImagesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setGalleryTab('custom')}
                  style={{
                    padding: '6px 11px',
                    borderRadius: 7,
                    border: galleryTab === 'custom' ? '1px solid #d97706' : '1px solid var(--border)',
                    background: galleryTab === 'custom' ? '#d97706' : 'var(--bg)',
                    color: galleryTab === 'custom' ? '#ffffff' : 'var(--text)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  📤 Twoje zdjęcia ({customImagesCount})
                </button>
              )}
              <button
                type="button"
                disabled={uploadingCustomImage}
                onClick={() => customImageInputRef.current?.click()}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: '1.5px solid #059669',
                  background: '#ecfdf5',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: uploadingCustomImage ? 'wait' : 'pointer',
                }}
              >
                {uploadingCustomImage ? '⏳ Wgrywanie zdjęcia…' : '📤 + Dodaj swoje zdjęcie'}
              </button>
            </div>

            <button
              type="button"
              onClick={syncToMetaCc35}
              disabled={syncingMetaCc35}
              style={{
                padding: '7px 13px',
                borderRadius: 7,
                border: '1px solid #0f766e',
                background: '#0f766e',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12,
                cursor: syncingMetaCc35 ? 'wait' : 'pointer',
                opacity: syncingMetaCc35 ? 0.7 : 1,
              }}
            >
              {syncingMetaCc35
                ? `⏳ Synchronizacja 35 reklam (${isDorosliBatchView ? 'Dorośli' : 'Dzieci'}) z Meta (PAUSED)…`
                : `🔄 Zsynchronizuj 35 reklam w ${isDorosliBatchView ? 'ANTKI DOROSLI CC35' : 'ANTKI CC35'} → ${pageName} (PAUSED)`}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
              gap: 8,
              maxHeight: 420,
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {filteredGalleryImages.map(asset => {
              const isAssignedToActive = activeResolvedImage?.url === asset.url;
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (activeAngle) {
                      void assignImageToAngles([activeAngle.id], asset, `Antek #${activeAngle.number}`);
                    }
                  }}
                  title={`Kliknij, aby przypisać do Antka #${activeAngle?.number || 1}: ${asset.label}`}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    borderRadius: 8,
                    border: isAssignedToActive ? '3px solid #7c3aed' : '1px solid var(--border)',
                    background: '#0f172a',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={asset.url}
                    alt={asset.label}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 5,
                      left: 5,
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: 4,
                      background: asset.source === 'ai' ? '#059669' : '#2563eb',
                      color: '#ffffff',
                    }}
                  >
                    {asset.source === 'ai' ? 'AI' : 'LIB'}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setLightboxAsset(asset);
                    }}
                    title="Powiększ zdjęcie 1:1"
                    style={{
                      position: 'absolute',
                      bottom: 5,
                      left: 5,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: 4,
                      border: 0,
                      background: 'rgba(15,23,42,0.75)',
                      color: '#ffffff',
                      cursor: 'zoom-in',
                    }}
                  >
                    🔍
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      void handleDeleteImageFromLibrary(asset);
                    }}
                    title="Usuń to zdjęcie z biblioteki"
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '2px 6px',
                      borderRadius: 4,
                      border: 0,
                      background: 'rgba(220,38,38,0.88)',
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </details>

      {/* 2. ROZWIJANE WORK DAY AD SETY (POSORTOWANE PO BATCHACH / DNIACH WYTWORZENIA) */}
      <details
        open={showCampaignPanel}
        onToggle={e => setShowCampaignPanel((e.currentTarget as HTMLDetailsElement).open)}
        style={{
          borderRadius: 10,
          marginBottom: 10,
          background: 'var(--card)',
          border: '1px solid #bfdbfe',
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            padding: '11px 16px',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            fontWeight: 800,
            fontSize: 14,
            color: 'var(--text)',
          }}
        >
          <span>
            📅 Work Day Ad Sety ({isDorosliBatchView ? 'Batch 2: Dorośli #36–#70' : 'Batch 1: Dzieci #1–#35'} · {displayedGroups.length} Ad Setów Cost Cap {metaCostCapPln} PLN)
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
            {showCampaignPanel ? 'Zwiń ▴' : 'Rozwiń ▾'}
          </span>
        </summary>

        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 12, display: 'grid', gap: 14 }}>
          {/* KARTA BATCHA Z DNIA WYTWORZENIA (NAJNOWSZY NA GÓRZE) */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 9,
              background: 'var(--bg)',
              border: '1px solid #93c5fd',
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 99,
                    background: '#1d4ed8',
                    color: '#ffffff',
                  }}
                >
                  🗓️ BATCH DZIEŃ:{' '}
                  {new Date(activeCampaignStructure?.createdAt || Date.now()).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
                <strong style={{ fontSize: 13.5, color: 'var(--text)' }}>
                  Kampania: {activeCampaignStructure?.campaignName || metaCampaignName} (ID:{' '}
                  {activeCampaignStructure?.campaignId || (isDorosliBatchView ? 'nowa po utworzeniu' : '120249912191200300')})
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: '#dcfce7',
                    color: '#166534',
                  }}
                >
                  COST_CAP = {metaCostCapPln} PLN · 7 Ad Setów · 35 Reklam · Fanpage: {pageName} ({selectedPageId})
                </span>
              </div>

              {activeCampaignStructure?.campaignId && (
                <a
                  href={`https://adsmanager.facebook.com/adsmanager/manage/adsets?act=${activeCampaignStructure.accountId || '1109284831182252'}&selected_campaign_ids=${activeCampaignStructure.campaignId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}
                >
                  Otwórz w Meta Ads Manager ↗
                </a>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 8,
              }}
            >
              {displayedGroups.map((group, gIdx) => {
                const adSetId = 'adSetId' in group ? group.adSetId : undefined;
                const batchDayStr = new Date(activeCampaignStructure?.createdAt || Date.now()).toLocaleDateString('pl-PL', {
                  day: '2-digit',
                  month: '2-digit',
                });
                return (
                  <div
                    key={group.code}
                    style={{
                      padding: '9px 11px',
                      borderRadius: 8,
                      border: adSetId ? '1px solid #86efac' : '1px solid var(--border)',
                      background: 'var(--card)',
                      display: 'grid',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 12, color: 'var(--text)' }}>
                        [{batchDayStr} · Batch #{gIdx + 1}] {group.label}
                      </strong>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: adSetId ? '#dcfce7' : '#f1f5f9',
                          color: adSetId ? '#166534' : '#475569',
                        }}
                      >
                        {adSetId ? `ID: ${adSetId}` : `5 Antków (${group.shortRange})`}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', lineHeight: 1.35 }}>{group.description}</p>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'monospace' }}>
                      Kąty: {group.angleIds.map(id => id.replace(/^pl-/, '#').replace(/^dorosli-/, 'D')).join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TWORZENIE KOLEJNEGO WORK DAY BATCHA W META */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', paddingTop: 4 }}>
            <label style={{ display: 'grid', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              Nazwa nowego Work Day Batcha (Kampanii)
              <input
                type="text"
                value={metaCampaignName}
                onChange={e => setMetaCampaignName(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: 12,
                  width: 240,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              Cost Cap (PLN)
              <input
                type="number"
                min={10}
                max={200}
                step={1}
                value={metaCostCapPln}
                onChange={e => setMetaCostCapPln(Number(e.target.value) || 30)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: 12,
                  width: 72,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              Budżet dzienny (PLN)
              <input
                type="number"
                min={100}
                max={50000}
                step={50}
                value={metaDailyBudgetPln}
                onChange={e => setMetaDailyBudgetPln(Number(e.target.value) || 1500)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: 12,
                  width: 90,
                }}
              />
            </label>

            <button
              type="button"
              disabled={updatingCostCap}
              onClick={() => void handleUpdateCostCap(metaCostCapPln)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #059669',
                background: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12,
                cursor: updatingCostCap ? 'wait' : 'pointer',
                opacity: updatingCostCap ? 0.7 : 1,
              }}
            >
              {updatingCostCap
                ? 'Aktualizuję w Meta...'
                : `💰 Zmień Cost Cap na ${metaCostCapPln} zł w aktywnych Ad Setach`}
            </button>

            <button
              type="button"
              disabled={creatingMetaCampaign}
              onClick={() => void handleCreateMetaCampaign(true)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #1d4ed8',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12,
                cursor: creatingMetaCampaign ? 'wait' : 'pointer',
                opacity: creatingMetaCampaign ? 0.7 : 1,
              }}
            >
              {creatingMetaCampaign
                ? 'Tworzę w Meta Ads...'
                : `⚡ Utwórz nowy Work Day Batch + 7 Ad Setów (CC ${metaCostCapPln} zł)`}
            </button>
          </div>
        </div>
      </details>

      {/* 3. ROZWIJANA ARCHITEKTURA AWARENESS STAGE (FILTRY ETAPÓW ŚWIADOMOŚCI + WYSZUKIWARKA + AKCJE BATCH) */}
      <details
        open={showAwarenessPanel}
        onToggle={e => setShowAwarenessPanel((e.currentTarget as HTMLDetailsElement).open)}
        style={{
          borderRadius: 10,
          marginBottom: 14,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            padding: '11px 16px',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            fontWeight: 800,
            fontSize: 14,
            color: 'var(--text)',
          }}
        >
          <span>
            🧠 Architektura Awareness Stage (Poziomy świadomości, wyszukiwarka i akcje batch · Gotowe {totalGeneratedCount}/{presets.length})
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
            {showAwarenessPanel ? 'Zwiń ▴' : 'Rozwiń ▾'}
          </span>
        </summary>

        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 12, display: 'grid', gap: 12 }}>
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

          <div
            style={{
              paddingTop: 10,
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
              fontSize: 12,
              color: 'var(--muted)',
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
        </div>
      </details>

      {/* PASEK PRZEŁĄCZANIA PAKIETÓW: BATCH 2 DOROŚLI 35 (#36-#70) vs BATCH 1 DZIECI CC35 (#1-#35) */}
      <div
        style={{
          marginBottom: 14,
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Wybierz pakiet Copy:
            </span>
            <button
              type="button"
              onClick={() => {
                setStageFilter('dorosli_35');
                const firstAdult = presets.find(p => p.number === 36);
                if (firstAdult) setActiveAngleId(firstAdult.id);
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: stageFilter.startsWith('dorosli_') ? '2px solid #7c3aed' : '1px solid var(--border)',
                background: stageFilter.startsWith('dorosli_') ? '#7c3aed' : 'var(--bg)',
                color: stageFilter.startsWith('dorosli_') ? '#ffffff' : 'var(--text)',
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              👵 Batch 2: DOROŚLI 35 NOWE (#36–#70 · D01–D35)
            </button>

            <button
              type="button"
              onClick={() => {
                setStageFilter('all_kids');
                const firstKid = presets.find(p => p.number === 1);
                if (firstKid) setActiveAngleId(firstKid.id);
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: stageFilter === 'all_kids' ? '2px solid #2563eb' : '1px solid var(--border)',
                background: stageFilter === 'all_kids' ? '#2563eb' : 'var(--bg)',
                color: stageFilter === 'all_kids' ? '#ffffff' : 'var(--text)',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              👶 Batch 1: DZIECI CC35 (#1–#30)
            </button>

            <button
              type="button"
              onClick={() => setStageFilter('all')}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: stageFilter === 'all' ? '2px solid #059669' : '1px solid var(--border)',
                background: stageFilter === 'all' ? '#059669' : 'var(--bg)',
                color: stageFilter === 'all' ? '#ffffff' : 'var(--text)',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              📚 Wszystkie ({presets.length})
            </button>
          </div>

          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Widoczne w liście: <strong style={{ color: 'var(--text)' }}>{filteredPresets.length}</strong> kątów
          </span>
        </div>

        {stageFilter.startsWith('dorosli_') && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#6d28d9', marginRight: 4 }}>
              7 Grup Dorośli (po 5 reklam):
            </span>
            {[
              { id: 'dorosli_35', label: 'Wszystkie 35 Dorośli (D01–D35)' },
              { id: 'dorosli_d1', label: 'D1: SOR i Nagła Blokada (D01–D05)' },
              { id: 'dorosli_d2', label: 'D2: M_Jakuba · O Mamie/Tacie (D06–D10)' },
              { id: 'dorosli_d3', label: 'D3: Ryciak Dorośli · 10-Sek Test (D11–D15)' },
              { id: 'dorosli_d4', label: 'D4: Ostroga i 6:00 Rano (D16–D20)' },
              { id: 'dorosli_d5', label: 'D5: Haluks i Rozmiar 40 (D21–D25)' },
              { id: 'dorosli_d6', label: 'D6: Żal po Operacji i Skalpel (D26–D30)' },
              { id: 'dorosli_d7', label: 'D7: Praca Stojąca i 4 Kroki (D31–D35)' },
            ].map(tab => {
              const active = stageFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStageFilter(tab.id as typeof stageFilter)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: active ? '1px solid #7c3aed' : '1px solid var(--border)',
                    background: active ? '#ede9fe' : 'var(--bg)',
                    color: active ? '#5b21b6' : 'var(--text)',
                    fontWeight: active ? 800 : 500,
                    fontSize: 11.5,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

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
              const assignedImgUrl =
                ad?.imageUrl || angle.defaultImageUrl || getDefaultImageForAngle(angle.number).url;
              const assignedAsset = imageLibrary.find(item => item.url === assignedImgUrl);

              return (
                <article
                  id={`antek-card-${angle.id}`}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 7 }}>
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

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          setActiveAngleId(angle.id);
                          setInlinePickerAngleId(prev => (prev === angle.id ? null : angle.id));
                        }}
                        style={{
                          display: 'flex',
                          gap: 3,
                          cursor: 'pointer',
                        }}
                        title="Kliknij miniaturę, aby rozwinąć szybki wybór zdjęcia tutaj na liście"
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: ad?.secondImageUrl ? 46 : 54,
                            height: ad?.secondImageUrl ? 46 : 54,
                            minWidth: ad?.secondImageUrl ? 46 : 54,
                            borderRadius: 7,
                            overflow: 'hidden',
                            border: inlinePickerAngleId === angle.id ? '2px solid #7c3aed' : '1px solid var(--border)',
                            background: '#0f172a',
                          }}
                        >
                          <img
                            src={assignedImgUrl}
                            alt={`Antek #${angle.number} (A)`}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 1,
                              right: 1,
                              fontSize: 8,
                              fontWeight: 800,
                              padding: '1px 3px',
                              borderRadius: 3,
                              background: ad?.secondImageUrl
                                ? '#2563eb'
                                : assignedAsset?.source === 'meta'
                                ? '#2563eb'
                                : '#059669',
                              color: '#ffffff',
                            }}
                          >
                            {ad?.secondImageUrl ? 'A' : assignedAsset?.source === 'meta' ? 'META' : 'AI'}
                          </span>
                        </div>
                        {ad?.secondImageUrl && (
                          <div
                            style={{
                              position: 'relative',
                              width: 46,
                              height: 46,
                              minWidth: 46,
                              borderRadius: 7,
                              overflow: 'hidden',
                              border: '2px solid #ea580c',
                              background: '#0f172a',
                            }}
                          >
                            <img
                              src={ad.secondImageUrl}
                              alt={`Antek #${angle.number} (B)`}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                bottom: 1,
                                right: 1,
                                fontSize: 8,
                                fontWeight: 800,
                                padding: '1px 3px',
                                borderRadius: 3,
                                background: '#ea580c',
                                color: '#ffffff',
                              }}
                            >
                              B
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 2, width: 54 }}>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            cycleAngleImage(angle, -1);
                          }}
                          title="Poprzednie zdjęcie (0ms)"
                          style={{
                            flex: 1,
                            padding: '2px 0',
                            fontSize: 10,
                            fontWeight: 800,
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            lineHeight: 1.1,
                          }}
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setActiveAngleId(angle.id);
                            setInlinePickerAngleId(prev => (prev === angle.id ? null : angle.id));
                          }}
                          title="Rozwiń pasek miniaturek pod tym Antkiem"
                          style={{
                            flex: 1,
                            padding: '2px 0',
                            fontSize: 9,
                            fontWeight: 800,
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            background: inlinePickerAngleId === angle.id ? '#7c3aed' : 'var(--bg)',
                            color: inlinePickerAngleId === angle.id ? '#ffffff' : 'var(--text)',
                            cursor: 'pointer',
                            lineHeight: 1.1,
                          }}
                        >
                          ▾
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            cycleAngleImage(angle, 1);
                          }}
                          title="Następne zdjęcie (0ms)"
                          style={{
                            flex: 1,
                            padding: '2px 0',
                            fontSize: 10,
                            fontWeight: 800,
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            lineHeight: 1.1,
                          }}
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', marginBottom: 3, lineHeight: 1.3 }}>
                        #{angle.number} · {angle.title}
                      </div>
                      {ad?.primaryText ? (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: isActive ? '#1d4ed8' : 'var(--muted)',
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          „{ad.primaryText.slice(0, 140)}…”
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.3 }}>
                          <strong>{angle.awarenessStage}</strong> · {angle.sophistication}
                        </div>
                      )}
                    </div>
                  </div>

                  {inlinePickerAngleId === angle.id && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        marginTop: 4,
                        padding: 6,
                        borderRadius: 7,
                        background: 'var(--card)',
                        border: '1px solid #c4b5fd',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'var(--muted)',
                        }}
                      >
                        <span>Szybka podmiana zdjęcia (#{angle.number}):</span>
                        <button
                          type="button"
                          onClick={() => setInlinePickerAngleId(null)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          ✕ Zamknij
                        </button>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(46px, 1fr))',
                          gap: 4,
                          maxHeight: 165,
                          overflowY: 'auto',
                        }}
                      >
                        {imageLibrary.map(asset => {
                          const isSelected = assignedImgUrl === asset.url;
                          return (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => {
                                void assignImageToAngles([angle.id], asset, `Antek #${angle.number}`);
                              }}
                              title={asset.label}
                              style={{
                                position: 'relative',
                                padding: 0,
                                height: 46,
                                borderRadius: 5,
                                overflow: 'hidden',
                                border: isSelected ? '2.5px solid #7c3aed' : '1px solid var(--border)',
                                cursor: 'pointer',
                                background: '#0f172a',
                              }}
                            >
                              <img
                                src={asset.url}
                                alt={asset.label}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

        {/* PRAWA KOLUMNA: SZCZEGÓŁY KĄTA + PODGLĄD POSTA FB + PEŁNY EDYTOR TEKSTU + AUDYT */}
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
              {/* PASEK 1-KLIK + NAWIGACJA STRZAŁKAMI KLAWIATURY (← / →) */}
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  border: '1px solid #bfdbfe',
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1e40af', marginRight: 2 }}>
                    ⚡ Przełącz copy 1-klikiem:
                  </span>
                  <button
                    type="button"
                    onClick={() => cycleActiveCopy(-1)}
                    title="Skrót klawiaturowy: Strzałka w lewo (←)"
                    style={{
                      padding: '4px 9px',
                      borderRadius: 6,
                      border: '1px solid #93c5fd',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: 800,
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}
                  >
                    ◀ Poprzednie copy (←)
                  </button>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
                    {filteredPresets.map(p => {
                      const isCur = p.id === activeAngle.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setActiveAngleId(p.id)}
                          title={`#${p.number} · ${p.title}`}
                          style={{
                            padding: '3px 7px',
                            borderRadius: 5,
                            border: isCur ? '1.5px solid #1d4ed8' : '1px solid var(--border)',
                            background: isCur ? '#2563eb' : 'var(--card)',
                            color: isCur ? '#ffffff' : 'var(--text)',
                            fontWeight: 800,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          #{p.number}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => cycleActiveCopy(1)}
                    title="Skrót klawiaturowy: Strzałka w prawo (→)"
                    style={{
                      padding: '4px 9px',
                      borderRadius: 6,
                      border: '1px solid #93c5fd',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: 800,
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}
                  >
                    Następne copy (→) ▶
                  </button>
                </div>

                {/* TRYB STRZAŁEK KLAWIATURY (← / →) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    paddingTop: 5,
                    borderTop: '1px dashed #cbd5e1',
                    fontSize: 11,
                    color: 'var(--muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <strong style={{ color: 'var(--text)' }}>⌨️ Strzałki na klawiaturze (← / →) przełączają:</strong>
                    <button
                      type="button"
                      onClick={() => setArrowKeyTarget('copy')}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 5,
                        border: arrowKeyTarget === 'copy' ? '1.5px solid #2563eb' : '1px solid var(--border)',
                        background: arrowKeyTarget === 'copy' ? '#2563eb' : 'var(--card)',
                        color: arrowKeyTarget === 'copy' ? '#ffffff' : 'var(--text)',
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      📄 Copy (#1–#35)
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrowKeyTarget('image')}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 5,
                        border: arrowKeyTarget === 'image' ? '1.5px solid #7c3aed' : '1px solid var(--border)',
                        background: arrowKeyTarget === 'image' ? '#7c3aed' : 'var(--card)',
                        color: arrowKeyTarget === 'image' ? '#ffffff' : 'var(--text)',
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      🖼️ Zdjęcie w aktywnym Antku
                    </button>
                  </div>
                  <span>
                    {arrowKeyTarget === 'copy'
                      ? 'Tip: ← / → zmienia Copy, a Shift + ← / → (lub [ / ]) zmienia Zdjęcie'
                      : 'Tip: ← / → zmienia Zdjęcie, a Shift + ← / → zmienia Copy'}
                  </span>
                </div>
              </div>

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

              {/* REALISTYCZNY PODGLĄD POSTA „PORADY MAMY GOSI” + SZYBKI PRZEŁĄCZNIK KREACJI */}
              <div
                style={{
                  marginBottom: 16,
                  padding: 14,
                  borderRadius: 10,
                  background: 'var(--bg)',
                  border: '1px solid #ddd6fe',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(320px, 410px) 1fr',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                {/* KARTA FACEBOOK FEED PREVIEW */}
                <div
                  style={{
                    borderRadius: 10,
                    border: '2px solid #3b82f6',
                    background: '#ffffff',
                    color: '#0f172a',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.12)',
                  }}
                >
                  {/* PASEK NAGŁÓWKA WSKAZUJĄCY KTÓRE COPY JEST W PODGLĄDZIE */}
                  <div
                    style={{
                      padding: '6px 10px',
                      background: '#eff6ff',
                      borderBottom: '1px solid #bfdbfe',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8' }}>
                      📄 COPY #{activeAngle.number}: {activeAngle.title.slice(0, 38)}
                      {activeAngle.title.length > 38 ? '…' : ''}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = filteredPresets.findIndex(p => p.id === activeAngle.id);
                          if (idx >= 0) {
                            setActiveAngleId(filteredPresets[(idx - 1 + filteredPresets.length) % filteredPresets.length].id);
                          }
                        }}
                        title="Poprzednie copy"
                        style={{
                          padding: '2px 7px',
                          borderRadius: 4,
                          border: '1px solid #93c5fd',
                          background: '#ffffff',
                          color: '#1d4ed8',
                          fontWeight: 800,
                          fontSize: 10.5,
                          cursor: 'pointer',
                        }}
                      >
                        ◀ Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = filteredPresets.findIndex(p => p.id === activeAngle.id);
                          if (idx >= 0) {
                            setActiveAngleId(filteredPresets[(idx + 1) % filteredPresets.length].id);
                          }
                        }}
                        title="Następne copy"
                        style={{
                          padding: '2px 7px',
                          borderRadius: 4,
                          border: '1px solid #93c5fd',
                          background: '#ffffff',
                          color: '#1d4ed8',
                          fontWeight: 800,
                          fontSize: 10.5,
                          cursor: 'pointer',
                        }}
                      >
                        Copy ▶
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {activeFanpageMeta.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>
                        {pageName || 'Centrum Dobrego Kroku'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Sponsorowane · 🌐 · ID: {selectedPageId}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFbPreviewExpanded(v => !v)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 5,
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: 10.5,
                        cursor: 'pointer',
                      }}
                    >
                      {fbPreviewExpanded ? 'Skróć tekst' : 'Pełne copy'}
                    </button>
                  </div>

                  <div
                    style={{
                      padding: '0 12px 10px',
                      fontSize: 12.5,
                      color: '#1e293b',
                      lineHeight: 1.48,
                      whiteSpace: 'pre-wrap',
                      maxHeight: fbPreviewExpanded ? 260 : undefined,
                      overflowY: fbPreviewExpanded ? 'auto' : undefined,
                      borderBottom: fbPreviewExpanded ? '1px solid #e2e8f0' : undefined,
                    }}
                  >
                    {fbPreviewExpanded
                      ? editPrimaryText
                      : (editPrimaryText || '').slice(0, 230) + ((editPrimaryText || '').length > 230 ? '… ' : '')}
                    {!fbPreviewExpanded && (editPrimaryText || '').length > 230 && (
                      <button
                        type="button"
                        onClick={() => setFbPreviewExpanded(true)}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: '#2563eb',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Zobacz więcej
                      </button>
                    )}
                  </div>

                  {activeResolvedImage && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {activeResolvedSecondImage ? (
                        <div
                          style={{
                            padding: 8,
                            background: '#fff7ed',
                            borderTop: '1px solid #fed7aa',
                            borderBottom: '1px solid #fed7aa',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#9a3412',
                              marginBottom: 6,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 6,
                            }}
                          >
                            <span>🔥 A/B TEST: 2 OSOBNE OBRAZKI W ADSECIE (pełny kwadrat 1:1 każdy)</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 10.5 }}>Kliknij A lub B, aby wybrać edytowany wariant</span>
                              <button
                                type="button"
                                disabled={savingImages}
                                onClick={() => void handleSaveImages()}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  border: imagesSavedFlash ? '1.5px solid #15803d' : '1.5px solid #16a34a',
                                  background: imagesSavedFlash ? '#15803d' : '#16a34a',
                                  color: '#ffffff',
                                  fontWeight: 900,
                                  fontSize: 11,
                                  cursor: savingImages ? 'wait' : 'pointer',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.14)',
                                }}
                              >
                                {savingImages
                                  ? '⏳ Zapisywanie...'
                                  : imagesSavedFlash
                                  ? '✅ Obrazki zapisane!'
                                  : '💾 Zapisz obrazki'}
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div
                              onClick={() => setImageSlotTarget(1)}
                              style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '1 / 1',
                                borderRadius: 8,
                                overflow: 'hidden',
                                border: imageSlotTarget === 1 ? '3px solid #2563eb' : '1px solid #cbd5e1',
                                background: '#0f172a',
                                cursor: 'pointer',
                              }}
                            >
                              <img
                                src={activeResolvedImage.url}
                                alt={activeResolvedImage.label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 6,
                                  left: 6,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 99,
                                  background: imageSlotTarget === 1 ? '#2563eb' : 'rgba(15,23,42,0.8)',
                                  color: '#ffffff',
                                }}
                              >
                                Kreacja A (Zdj. 1) {imageSlotTarget === 1 ? '●' : ''}
                              </span>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setLightboxAsset(activeResolvedImage);
                                }}
                                style={{
                                  position: 'absolute',
                                  bottom: 6,
                                  right: 6,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  border: 0,
                                  background: 'rgba(15,23,42,0.75)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                }}
                              >
                                🔍 Powiększ A
                              </button>
                            </div>

                            <div
                              onClick={() => setImageSlotTarget(2)}
                              style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '1 / 1',
                                borderRadius: 8,
                                overflow: 'hidden',
                                border: imageSlotTarget === 2 ? '3px solid #ea580c' : '1px solid #cbd5e1',
                                background: '#0f172a',
                                cursor: 'pointer',
                              }}
                            >
                              <img
                                src={activeResolvedSecondImage.url}
                                alt={activeResolvedSecondImage.label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 6,
                                  left: 6,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 99,
                                  background: imageSlotTarget === 2 ? '#ea580c' : 'rgba(15,23,42,0.8)',
                                  color: '#ffffff',
                                }}
                              >
                                Kreacja B (Zdj. 2) {imageSlotTarget === 2 ? '●' : ''}
                              </span>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setLightboxAsset(activeResolvedSecondImage);
                                }}
                                style={{
                                  position: 'absolute',
                                  bottom: 6,
                                  right: 6,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  border: 0,
                                  background: 'rgba(15,23,42,0.75)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                }}
                              >
                                🔍 Powiększ B
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setLightboxAsset(activeResolvedImage)}
                          title="Kliknij, aby powiększyć kreację"
                          style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1 / 1',
                            background: '#0f172a',
                            cursor: 'zoom-in',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={activeResolvedImage.url}
                            alt={activeResolvedImage.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              cycleAngleImage(activeAngle, -1);
                            }}
                            title="Poprzednie zdjęcie (0ms)"
                            style={{
                              position: 'absolute',
                              left: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              border: '1px solid rgba(255,255,255,0.4)',
                              background: 'rgba(15,23,42,0.75)',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: 14,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              cycleAngleImage(activeAngle, 1);
                            }}
                            title="Następne zdjęcie (0ms)"
                            style={{
                              position: 'absolute',
                              right: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              border: '1px solid rgba(255,255,255,0.4)',
                              background: 'rgba(15,23,42,0.75)',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: 14,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ▶
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      padding: '10px 12px',
                      background: '#f1f5f9',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10.5, color: '#64748b', textTransform: 'uppercase' }}>
                        orthomax.pl
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: '#0f172a',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {editHeadline || activeAngle.defaultHeadline}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '7px 11px',
                        borderRadius: 6,
                        background: '#e2e8f0',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: 11.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Więcej informacji
                    </span>
                  </div>
                </div>

                {/* SZYBKI WYBÓR ZDJĘCIA DLA AKTYWNEGO ANTKA + TEST A/B 2 OSOBNYCH ZDJĘĆ */}
                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    {/* PASEK TESTU A/B 2 OSOBNYCH ZDJĘĆ */}
                    <div
                      style={{
                        padding: '8px 10px',
                        marginBottom: 8,
                        borderRadius: 8,
                        border: activeResolvedSecondImage ? '1.5px solid #ea580c' : '1px dashed #94a3b8',
                        background: activeResolvedSecondImage ? '#fff7ed' : 'var(--bg)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#9a3412' }}>
                          🔥 Test A/B 2 osobnych zdjęć:
                        </span>
                        <button
                          type="button"
                          onClick={() => setImageSlotTarget(1)}
                          style={{
                            padding: '4px 9px',
                            borderRadius: 6,
                            border: imageSlotTarget === 1 ? '1.5px solid #2563eb' : '1px solid var(--border)',
                            background: imageSlotTarget === 1 ? '#2563eb' : '#ffffff',
                            color: imageSlotTarget === 1 ? '#ffffff' : '#0f172a',
                            fontWeight: 800,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          🖼️ Obrazek A (Kreacja 1)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageSlotTarget(2);
                            if (!activeResolvedSecondImage && activeAngle) {
                              const pool = imageLibrary.length > 0 ? imageLibrary : ANTKI_PL_IMAGE_LIBRARY;
                              const curIdx = pool.findIndex(i => i.url === activeResolvedImage?.url);
                              const secondCandidate = pool[(curIdx + 1) % pool.length];
                              if (secondCandidate) {
                                void assignImageToAngles([activeAngle.id], secondCandidate, `Antek #${activeAngle.number}`, 2);
                              }
                            }
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: imageSlotTarget === 2 ? '1.5px solid #ea580c' : '1.5px solid #fdba74',
                            background: imageSlotTarget === 2 ? '#ea580c' : '#ffedd5',
                            color: imageSlotTarget === 2 ? '#ffffff' : '#9a3412',
                            fontWeight: 800,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          {activeResolvedSecondImage ? '🖼️ Obrazek B (2. osobna kreacja A/B)' : '🔥 + Dodaj 2. osobny obrazek (A/B Test)'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        {activeResolvedSecondImage && activeAngle && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                void updateTwoImageConfig(
                                  activeAngle.id,
                                  {
                                    imageUrl: activeResolvedSecondImage.url,
                                    imageHash: activeResolvedSecondImage.imageHash,
                                    secondImageUrl: activeResolvedImage?.url || '',
                                    secondImageHash: activeResolvedImage?.imageHash,
                                  },
                                  'Zamieniono miejscami Obrazek A ↔ Obrazek B.',
                                )
                              }
                              style={{
                                padding: '3px 8px',
                                borderRadius: 5,
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontWeight: 800,
                                fontSize: 10.5,
                                cursor: 'pointer',
                              }}
                            >
                              ⇄ Zamień A↔B
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void updateTwoImageConfig(
                                  activeAngle.id,
                                  {
                                    imageUrl: activeResolvedImage?.url || '',
                                    imageHash: activeResolvedImage?.imageHash,
                                    secondImageUrl: '',
                                    secondImageHash: '',
                                  },
                                  'Usunięto Obrazek B — powrót do pojedynczej kreacji.',
                                )
                              }
                              style={{
                                padding: '3px 8px',
                                borderRadius: 5,
                                border: '1px solid #fca5a5',
                                background: '#fef2f2',
                                color: '#b91c1c',
                                fontWeight: 800,
                                fontSize: 10.5,
                                cursor: 'pointer',
                              }}
                            >
                              ✕ Usuń Obrazek B
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          disabled={savingImages}
                          onClick={() => void handleSaveImages()}
                          style={{
                            padding: '4px 11px',
                            borderRadius: 6,
                            border: imagesSavedFlash ? '1.5px solid #15803d' : '1.5px solid #16a34a',
                            background: imagesSavedFlash ? '#15803d' : '#16a34a',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: 11,
                            cursor: savingImages ? 'wait' : 'pointer',
                          }}
                        >
                          {savingImages
                            ? '⏳ Zapisywanie...'
                            : imagesSavedFlash
                            ? '✅ Zapisano obrazki!'
                            : '💾 Zapisz obrazki'}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background:
                              activeResolvedImage?.source === 'meta'
                                ? '#dbeafe'
                                : activeResolvedImage?.source === 'custom'
                                ? '#fef3c7'
                                : '#dcfce7',
                            color:
                              activeResolvedImage?.source === 'meta'
                                ? '#1e40af'
                                : activeResolvedImage?.source === 'custom'
                                ? '#92400e'
                                : '#166534',
                          }}
                        >
                          {activeResolvedImage?.source === 'meta'
                            ? '📚 KREACJA Z BIBLIOTEKI META'
                            : activeResolvedImage?.source === 'custom'
                            ? '📤 TWOJE WŁASNE ZDJĘCIE'
                            : '✨ KREACJA AI NATIVE (CZYSTA)'}
                        </span>
                        {activeResolvedImage?.imageHash && (
                          <code style={{ fontSize: 11, color: 'var(--muted)' }}>
                            hash A: {activeResolvedImage.imageHash}
                            {activeResolvedSecondImage?.imageHash ? ` · hash B: ${activeResolvedSecondImage.imageHash}` : ''}
                          </code>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => cycleAngleImage(activeAngle, -1)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                            background: 'var(--card)',
                            color: 'var(--text)',
                            fontWeight: 800,
                            fontSize: 11.5,
                            cursor: 'pointer',
                          }}
                        >
                          ◀ Poprzednie zdj. ({imageSlotTarget === 2 ? 'Obrazek B' : 'Obrazek A'})
                        </button>
                        <button
                          type="button"
                          onClick={() => cycleAngleImage(activeAngle, 1)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                            background: 'var(--card)',
                            color: 'var(--text)',
                            fontWeight: 800,
                            fontSize: 11.5,
                            cursor: 'pointer',
                          }}
                        >
                          Następne zdj. ({imageSlotTarget === 2 ? 'Obrazek B' : 'Obrazek A'}) ▶
                        </button>
                        <button
                          type="button"
                          disabled={uploadingCustomImage}
                          onClick={() => customImageInputRef.current?.click()}
                          style={{
                            padding: '4px 11px',
                            borderRadius: 6,
                            border: '1.5px solid #059669',
                            background: '#ecfdf5',
                            color: '#065f46',
                            fontWeight: 800,
                            fontSize: 11.5,
                            cursor: uploadingCustomImage ? 'wait' : 'pointer',
                          }}
                        >
                          {uploadingCustomImage ? '⏳ Wgrywanie…' : '📤 + Dodaj swoje zdjęcie'}
                        </button>
                        <button
                          type="button"
                          disabled={savingImages}
                          onClick={() => void handleSaveImages()}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            border: imagesSavedFlash ? '1.5px solid #15803d' : '1.5px solid #16a34a',
                            background: imagesSavedFlash ? '#15803d' : '#16a34a',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: 11.5,
                            cursor: savingImages ? 'wait' : 'pointer',
                          }}
                        >
                          {savingImages
                            ? '⏳ Zapisywanie...'
                            : imagesSavedFlash
                            ? '✅ Zapisano obrazki!'
                            : '💾 Zapisz obrazki'}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>
                      Obrazek A: {activeResolvedImage?.label}
                      {activeResolvedSecondImage ? `  ·  Obrazek B: ${activeResolvedSecondImage.label}` : ''}
                    </div>
                    <p style={{ margin: '2px 0 6px', fontSize: 12, color: 'var(--muted)' }}>
                      {imageSlotTarget === 2
                        ? '🔥 Wybierasz teraz OBRAZEK B (2. osobna kreacja A/B w adsecie) — kliknij dowolną miniaturę poniżej:'
                        : 'Kliknij miniaturę (aby ustawić Obrazek A) lub przełącz wyżej na „+ Dodaj 2. osobny obrazek (A/B Test)”, aby przetestować 2 osobne zdjęcia 1:1 w adsecie:'}
                    </p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setGalleryTab('all')}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 6,
                          border: galleryTab === 'all' ? '1px solid #7c3aed' : '1px solid var(--border)',
                          background: galleryTab === 'all' ? '#7c3aed' : 'var(--card)',
                          color: galleryTab === 'all' ? '#ffffff' : 'var(--text)',
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Wszystkie ({imageLibrary.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryTab('meta')}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 6,
                          border: galleryTab === 'meta' ? '1px solid #2563eb' : '1px solid var(--border)',
                          background: galleryTab === 'meta' ? '#2563eb' : 'var(--card)',
                          color: galleryTab === 'meta' ? '#ffffff' : 'var(--text)',
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        📚 Stare z Biblioteki Antków ({metaImagesCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryTab('ai')}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 6,
                          border: galleryTab === 'ai' ? '1px solid #059669' : '1px solid var(--border)',
                          background: galleryTab === 'ai' ? '#059669' : 'var(--card)',
                          color: galleryTab === 'ai' ? '#ffffff' : 'var(--text)',
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        ✨ Nowe AI Native ({aiImagesCount})
                      </button>
                      {customImagesCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setGalleryTab('custom')}
                          style={{
                            padding: '4px 9px',
                            borderRadius: 6,
                            border: galleryTab === 'custom' ? '1px solid #d97706' : '1px solid var(--border)',
                            background: galleryTab === 'custom' ? '#d97706' : 'var(--card)',
                            color: galleryTab === 'custom' ? '#ffffff' : 'var(--text)',
                            fontWeight: 700,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          📤 Twoje zdjęcia ({customImagesCount})
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={Boolean(generatingKie5AngleId)}
                        onClick={() => void handleGenerate5KieImagesForActiveAngle()}
                        title="Wyciąga 5 konkretnych scen z treści tego Antka i generuje w Kie.ai 5 surowych, lekko rozmytych zdjęć z telefonu (shit quality, zero AI glow)"
                        style={{
                          padding: '5px 11px',
                          borderRadius: 6,
                          border: '1.5px solid #dc2626',
                          background: generatingKie5AngleId === activeAngle.id ? '#991b1b' : '#dc2626',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: 11,
                          cursor: generatingKie5AngleId ? 'wait' : 'pointer',
                          boxShadow: '0 2px 6px rgba(220,38,38,0.28)',
                        }}
                      >
                        {generatingKie5AngleId === activeAngle.id
                          ? '⏳ Kie.ai generuje 5 surowych zdjęć z tego Antka…'
                          : '📸 Wygeneruj 5 zdjęć z tego Antka (Kie.ai — Shit Quality)'}
                      </button>
                      <button
                        type="button"
                        disabled={uploadingCustomImage}
                        onClick={() => customImageInputRef.current?.click()}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1.5px dashed #059669',
                          background: '#f0fdf4',
                          color: '#15803d',
                          fontWeight: 800,
                          fontSize: 11,
                          cursor: uploadingCustomImage ? 'wait' : 'pointer',
                        }}
                      >
                        {uploadingCustomImage ? '⏳ Wgrywanie…' : '+ Dodaj swoje zdjęcie'}
                      </button>
                    </div>
                  </div>

                  {/* DEDYKOWANY PASEK 5 SUROWYCH ZDJĘĆ Z KIE.AI DLA AKTYWNEGO ANTKA */}
                  {(() => {
                    const activeKieTasks = kieTasksByAngle[activeAngle.id] || [];
                    const persistedAngleAssets = imageLibrary.filter(item => item.angleId === activeAngle.id);
                    if (activeKieTasks.length === 0 && persistedAngleAssets.length === 0) return null;
                    return (
                      <div
                        style={{
                          marginBottom: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: '#fef2f2',
                          border: '1.5px solid #fca5a5',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 6,
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ fontSize: 11.5, fontWeight: 900, color: '#991b1b' }}>
                            📸 5 surowych zdjęć wygenerowanych w Kie.ai pod Antka #{activeAngle.number} (Shit Quality · Zero AI Glow) — wybierz 2 najlepsze jako Obrazek A i B:
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                            gap: 8,
                          }}
                        >
                          {activeKieTasks.length > 0
                            ? activeKieTasks.map(task => {
                                const asset = task.asset;
                                const isSlotA = Boolean(asset && activeResolvedImage?.url === asset.url);
                                const isSlotB = Boolean(asset && activeResolvedSecondImage?.url === asset.url);
                                return (
                                  <div
                                    key={task.taskId}
                                    style={{
                                      borderRadius: 8,
                                      border: isSlotB
                                        ? '2.5px solid #ea580c'
                                        : isSlotA
                                        ? '2.5px solid #7c3aed'
                                        : '1px solid #fecaca',
                                      background: '#ffffff',
                                      padding: 6,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 5,
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        background: '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        textAlign: 'center',
                                      }}
                                    >
                                      {asset ? (
                                        <img
                                          src={asset.url}
                                          alt={task.label}
                                          onClick={() => setLightboxAsset(asset)}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                                        />
                                      ) : task.state === 'fail' ? (
                                        <span style={{ color: '#fca5a5', padding: 6 }}>❌ {task.error || 'Błąd'}</span>
                                      ) : (
                                        <span style={{ padding: 6 }}>⏳ Kie.ai renderuje #{task.index}…</span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', lineHeight: 1.25 }}>
                                      {task.label}
                                    </div>
                                    {asset && (
                                      <div style={{ display: 'flex', gap: 4 }}>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            void assignImageToAngles(
                                              [activeAngle.id],
                                              asset,
                                              `Antek #${activeAngle.number} (Obrazek A)`,
                                              1,
                                            )
                                          }
                                          style={{
                                            flex: 1,
                                            padding: '3px 5px',
                                            borderRadius: 5,
                                            border: '1px solid #7c3aed',
                                            background: isSlotA ? '#7c3aed' : '#f5f3ff',
                                            color: isSlotA ? '#ffffff' : '#6d28d9',
                                            fontWeight: 800,
                                            fontSize: 9.5,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          {isSlotA ? '✓ Obrazek A' : 'Ustaw A'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            void assignImageToAngles(
                                              [activeAngle.id],
                                              asset,
                                              `Antek #${activeAngle.number} (Obrazek B)`,
                                              2,
                                            )
                                          }
                                          style={{
                                            flex: 1,
                                            padding: '3px 5px',
                                            borderRadius: 5,
                                            border: '1px solid #ea580c',
                                            background: isSlotB ? '#ea580c' : '#fff7ed',
                                            color: isSlotB ? '#ffffff' : '#c2410c',
                                            fontWeight: 800,
                                            fontSize: 9.5,
                                            cursor: 'pointer',
                                          }}
                                        >
                                          {isSlotB ? '✓ Obrazek B' : 'Ustaw B'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            : persistedAngleAssets.slice(0, 5).map(asset => {
                                const isSlotA = activeResolvedImage?.url === asset.url;
                                const isSlotB = activeResolvedSecondImage?.url === asset.url;
                                return (
                                  <div
                                    key={asset.id}
                                    style={{
                                      borderRadius: 8,
                                      border: isSlotB
                                        ? '2.5px solid #ea580c'
                                        : isSlotA
                                        ? '2.5px solid #7c3aed'
                                        : '1px solid #fecaca',
                                      background: '#ffffff',
                                      padding: 6,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 5,
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        background: '#0f172a',
                                      }}
                                    >
                                      <img
                                        src={asset.url}
                                        alt={asset.label}
                                        onClick={() => setLightboxAsset(asset)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                                      />
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', lineHeight: 1.25 }}>
                                      {asset.label}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void assignImageToAngles(
                                            [activeAngle.id],
                                            asset,
                                            `Antek #${activeAngle.number} (Obrazek A)`,
                                            1,
                                          )
                                        }
                                        style={{
                                          flex: 1,
                                          padding: '3px 5px',
                                          borderRadius: 5,
                                          border: '1px solid #7c3aed',
                                          background: isSlotA ? '#7c3aed' : '#f5f3ff',
                                          color: isSlotA ? '#ffffff' : '#6d28d9',
                                          fontWeight: 800,
                                          fontSize: 9.5,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        {isSlotA ? '✓ Obrazek A' : 'Ustaw A'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void assignImageToAngles(
                                            [activeAngle.id],
                                            asset,
                                            `Antek #${activeAngle.number} (Obrazek B)`,
                                            2,
                                          )
                                        }
                                        style={{
                                          flex: 1,
                                          padding: '3px 5px',
                                          borderRadius: 5,
                                          border: '1px solid #ea580c',
                                          background: isSlotB ? '#ea580c' : '#fff7ed',
                                          color: isSlotB ? '#ffffff' : '#c2410c',
                                          fontWeight: 800,
                                          fontSize: 9.5,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        {isSlotB ? '✓ Obrazek B' : 'Ustaw B'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                        </div>
                      </div>
                    );
                  })()}

                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer?.files?.length) {
                        void handleUploadCustomImageFiles(e.dataTransfer.files);
                      }
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                      gap: 7,
                      maxHeight: 360,
                      overflowY: 'auto',
                      padding: 4,
                    }}
                  >
                    {/* KAFELEK + DODAJ SWOJE ZDJĘCIE */}
                    <button
                      type="button"
                      disabled={uploadingCustomImage}
                      onClick={() => customImageInputRef.current?.click()}
                      title="Wgraj własne zdjęcie z komputera (albo przeciągnij i upuść tutaj)"
                      style={{
                        padding: 4,
                        height: 68,
                        borderRadius: 7,
                        border: '2px dashed #059669',
                        background: '#f0fdf4',
                        color: '#065f46',
                        cursor: uploadingCustomImage ? 'wait' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        fontWeight: 800,
                        fontSize: 9.5,
                        lineHeight: 1.15,
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>📤</span>
                      <span>{uploadingCustomImage ? 'Wgrywam…' : '+ Dodaj swoje zdj.'}</span>
                    </button>

                    {filteredGalleryImages.map(asset => {
                      const isCurrent1 = activeResolvedImage?.url === asset.url;
                      const isCurrent2 = activeResolvedSecondImage?.url === asset.url;
                      const isCurrent = isCurrent1 || isCurrent2;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => {
                            if (!assigningImage) {
                              void assignImageToAngles([activeAngle.id], asset, `Antek #${activeAngle.number}`, imageSlotTarget);
                            }
                          }}
                          title={`${asset.label}${asset.imageHash ? ` (hash: ${asset.imageHash})` : ''}`}
                          style={{
                            position: 'relative',
                            padding: 0,
                            height: 68,
                            borderRadius: 7,
                            overflow: 'hidden',
                            border: isCurrent2
                              ? '3px solid #ea580c'
                              : isCurrent1
                              ? '3px solid #7c3aed'
                              : '1px solid var(--border)',
                            cursor: 'pointer',
                            background: '#0f172a',
                            opacity: isCurrent ? 1 : 0.9,
                          }}
                        >
                          <img
                            src={asset.url}
                            alt={asset.label}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          {(isCurrent1 || isCurrent2) && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 2,
                                left: 2,
                                fontSize: 8.5,
                                fontWeight: 900,
                                padding: '1px 4px',
                                borderRadius: 3,
                                background: isCurrent2 ? '#ea580c' : '#7c3aed',
                                color: '#ffffff',
                              }}
                            >
                              {isCurrent1 && isCurrent2 ? '1+2' : isCurrent2 ? 'ZDJ 2' : 'ZDJ 1'}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              void handleDeleteImageFromLibrary(asset);
                            }}
                            title="Usuń to zdjęcie z biblioteki"
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              fontSize: 9,
                              fontWeight: 900,
                              padding: '1px 4px',
                              borderRadius: 3,
                              border: 0,
                              background: 'rgba(220,38,38,0.85)',
                              color: '#ffffff',
                              cursor: 'pointer',
                              lineHeight: 1.1,
                            }}
                          >
                            ✕
                          </button>
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              fontSize: 8,
                              fontWeight: 800,
                              padding: '1px 3px',
                              borderRadius: 3,
                              background:
                                asset.source === 'ai'
                                  ? '#059669'
                                  : asset.source === 'custom'
                                  ? '#d97706'
                                  : '#2563eb',
                              color: '#ffffff',
                            }}
                          >
                            {asset.source === 'ai' ? 'AI' : asset.source === 'custom' ? 'WŁASNE' : 'LIB'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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

      {/* LIGHTBOX POWIĘKSZENIA ZDJĘCIA */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)',
              color: 'var(--text)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              maxWidth: 760,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 18,
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{lightboxAsset.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Źródło: {lightboxAsset.source === 'ai' ? '✨ Wygenerowane AI (czyste zdjęcie natywne)' : '📚 Biblioteka Meta (act_1109284831182252)'}
                  {lightboxAsset.imageHash ? ` · image_hash: ${lightboxAsset.imageHash}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxAsset(null)}
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'var(--text)',
                  fontSize: 20,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#0f172a',
                borderRadius: 8,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                maxHeight: '70vh',
              }}
            >
              <img
                src={lightboxAsset.url}
                alt={lightboxAsset.label}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              {activeAngle && (
                <button
                  type="button"
                  onClick={() => {
                    void assignImageToAngles([activeAngle.id], lightboxAsset, `Antek #${activeAngle.number}`);
                    setLightboxAsset(null);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 7,
                    border: 0,
                    background: '#7c3aed',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                  }}
                >
                  Przypisz tę kreację do aktywnego Antka (#{activeAngle.number})
                </button>
              )}
              <button
                type="button"
                onClick={() => setLightboxAsset(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                Zamknij podgląd
              </button>
            </div>
          </div>
        </div>
      )}

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
