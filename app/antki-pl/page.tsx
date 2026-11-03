'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AntkiPlBrandSwitcher, {
  formatAntekFullDate,
  formatAntekShortDate,
} from '@/app/components/antki-pl-brand-switcher';
import BennettUkWorkspace from '@/app/components/bennett-uk-workspace';
import FelioraPlWorkspace from '@/app/components/feliora-pl-workspace';
import FelioraPiesPlWorkspace from '@/app/components/feliora-pies-pl-workspace';
import SardianPlWorkspace from '@/app/components/sardian-pl-workspace';
import {
  ANTKI_PL_IMAGE_LIBRARY,
  ANTKI_PL_PRESET_ANGLES,
  ANTKI_PL_STAGE_LABELS,
  getDefaultImageForAngle,
  type AntkiPlFunnelStage,
  type AntkiPlGeneratedAd,
  type AntkiPlImageAsset,
  type AntkiPlPresetAngle,
  type AntkiPlSegment,
} from '@/lib/antki-pl';
import { buildAllArgonPrewrittenAds } from '@/lib/antki-pl-argon-library';

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
  'noom_krystyna_kalejdoskop',
  'sport_gory_szlaki',
  'sport_tenis_padel',
  'sport_pilka_orlik',
  'sport_bieganie_marsze',
  'anti_sales_allegro',
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
  { id: '1363490303507686', name: 'Karol Mikołajczyk', initials: 'KM', note: 'NOOM #103 + SPORT (#82-#83, #87-#89, #93-#95, #97, #100-#101) + TP#81 (1. os. męski)' },
  { id: '866702399857726', name: 'Centrum Dobrego Kroku', initials: 'CK', instagramUserId: '17841477743222560', note: 'NOOM #105 + SPORT (#85, #90 Fizjo), D3_RYCIAK, D4_OSTROGA, D32/D34/D35, TP#77/TP#80' },
  { id: '945290751994002', name: 'Dziennik Zdrowego Ciała', initials: 'DZ', instagramUserId: '17841446201609005', note: 'D1_SOR, D07/D09 (syn), D31/D33' },
  { id: '798916893308685', name: 'Porady Mamy Gosi', initials: 'MG', instagramUserId: '17841473314157729', note: 'NOOM #104 + SPORT (#91-#92, #96, #99) + D06/D08/D10 + Batch 1 Dzieci + TP#76/TP#79' },
  { id: '1194345203770949', name: 'Iwona Kożuchowska', initials: 'IK', instagramUserId: '17841412233487287', note: 'NOOM #102 + SPORT (#84, #86, #98) + D5_HALUKS, D6_ZAL, TP#78 (profil osobowy 50+)' },
  { id: '1204366092764321', name: 'Dr. Magdalena Rokicińska', initials: 'MR', instagramUserId: '17841439381913725', note: 'Profil ekspercki' },
  { id: '1339041252618036', name: 'Dr n. med. Janusz Skrzypiński', initials: 'JS', instagramUserId: '17841437463666297', note: 'Profil lekarski' },
];

const DOROSLI_ANGLE_NATIVE_PAGE_MAP: Record<string, string> = {
  'dorosli-01-sor-zablokowane-kolano': '945290751994002',
  'dorosli-02-sor-rwa-kulszowa-kregoslup': '945290751994002',
  'dorosli-03-sor-biodro-blokada-schody': '945290751994002',
  'dorosli-04-sor-piekacy-nerwiak-przodostopie': '945290751994002',
  'dorosli-05-sor-skrecona-kostka-niestabilnosc': '945290751994002',
  'dorosli-06-m-jakuba-miska-z-woda': '798916893308685',
  'dorosli-07-m-jakuba-szuflada-lekow': '945290751994002',
  'dorosli-08-m-jakuba-spacer-lawka': '798916893308685',
  'dorosli-09-m-jakuba-ojciec-dzialka': '945290751994002',
  'dorosli-10-m-jakuba-wesele-buty-w-reku': '798916893308685',
  'dorosli-11-ryciak-dorosli-bark-i-kark': '866702399857726',
  'dorosli-12-ryciak-dorosli-ledzwie-dyskopatia': '866702399857726',
  'dorosli-13-ryciak-dorosli-kolano-zwyrodnienie': '866702399857726',
  'dorosli-14-ryciak-dorosli-biodro-asymetria': '866702399857726',
  'dorosli-15-ryciak-dorosli-slow-mo-bieznia': '866702399857726',
  'dorosli-16-ostroga-pierwszy-krok-6-rano': '866702399857726',
  'dorosli-17-ostroga-fala-uderzeniowa-1500zl': '866702399857726',
  'dorosli-18-ostroga-zamrozona-butelka': '866702399857726',
  'dorosli-19-ostroga-zelowe-podpietki-mit': '866702399857726',
  'dorosli-20-ostroga-strach-po-postoju': '866702399857726',
  'dorosli-21-haluks-zimowe-botki-zamek': '1194345203770949',
  'dorosli-22-haluks-wstyd-rozmiar-40': '1194345203770949',
  'dorosli-23-haluks-separatory-i-szyny-mit': '1194345203770949',
  'dorosli-24-haluks-zdarte-buty-od-srodka': '1194345203770949',
  'dorosli-25-haluks-mokry-slad-w-lazience': '1194345203770949',
  'dorosli-26-zal-lewa-stopa-sruby-8200zl': '1194345203770949',
  'dorosli-27-zal-haluks-siostry-wrocil': '1194345203770949',
  'dorosli-28-zal-uchwyt-pod-prysznicem-52-lata': '1194345203770949',
  'dorosli-29-zal-za-5-lat-endoproteza': '1194345203770949',
  'dorosli-30-zal-artroskopia-kolana-powrot-bolu': '1194345203770949',
  'dorosli-31-praca-8h-na-nogach-kuchnia': '945290751994002',
  'dorosli-32-praca-mit-twardych-wkladek-400zl': '866702399857726',
  'dorosli-33-praca-12h-dyzur-szpitalny-beton': '945290751994002',
  'dorosli-34-praca-mechanizm-4-kroki': '866702399857726',
  'dorosli-35-powrot-dorosli-14h-w-domu-i-pracy': '866702399857726',
  'tp-76-as-dzieci-kapcie-szkolne': '798916893308685',
  'tp-77-as-dzieci-fizjo-okno': '866702399857726',
  'tp-78-as-dorosli-szatnia-2dzien': '1194345203770949',
  'tp-79-al-dzieci-nalesnik-23zl': '798916893308685',
  'tp-80-al-dorosli-zel-19zl': '866702399857726',
  'tp-81-al-dorosli-podrobka-27zl': '1363490303507686',
  'sport-82-gory-zejscie-morskie-oko-kolana': '1363490303507686',
  'sport-83-gory-wyjeta-wkladka-800zl': '1363490303507686',
  'sport-84-gory-karkonosze-zona-schronisko': '1194345203770949',
  'sport-85-gory-fizjo-3x-masa-ciala': '866702399857726',
  'sport-86-gory-palace-piety-po-20km': '1194345203770949',
  'sport-87-padel-poranny-gwozdz-w-piete': '1363490303507686',
  'sport-88-padel-hamowanie-bokiem-kostka': '1363490303507686',
  'sport-89-tenis-achilles-sztywny-jak-lina': '1363490303507686',
  'sport-90-padel-ranking-fizjo-kort': '866702399857726',
  'sport-91-tenis-kobieta-pieczenie-srodstopia': '798916893308685',
  'sport-92-pilka-syn-orlik-bol-piet-severa': '798916893308685',
  'sport-93-pilka-dorosli-orlik-kolana-38lat': '1363490303507686',
  'sport-94-pilka-korki-tektura-test': '1363490303507686',
  'sport-95-pilka-ojciec-i-syn-pakiet-1plus1': '1363490303507686',
  'sport-96-pilka-zdarte-korki-od-srodka': '798916893308685',
  'sport-97-bieganie-asfalt-piszczele-5km': '1363490303507686',
  'sport-98-marsze-nordic-walking-15tys-krokow': '1194345203770949',
  'sport-99-bieganie-slow-mo-pronacja-asfalt': '798916893308685',
  'sport-100-hala-siatkowka-parkiet-ladowanie': '1363490303507686',
  'sport-101-bieganie-anti-allegro-zel-vs-sprezyna': '1363490303507686',
  'noom-102-krystyna-62-wroclaw-schody': '1194345203770949',
  'noom-103-karol-64-endoproteza-kalejdoskop': '1363490303507686',
  'noom-104-corka-gosia-mama-62-wroclaw': '798916893308685',
  'noom-105-fizjo-5-lekarzy-przed-endoproteza': '866702399857726',
};

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
  const [activeBrand, setActiveBrand] = useState<'bennett-uk' | 'sardian-szampon' | 'stryde' | 'feliora' | 'feliora-pies' | 'orthomax'>('orthomax');
  const [sidebarSort, setSidebarSort] = useState<'newest' | 'oldest' | 'days'>('newest');
  const [presets, setPresets] = useState<AntkiPlPresetAngle[]>(() =>
    ANTKI_PL_PRESET_ANGLES.map(angle => {
      const defaultImg = getDefaultImageForAngle(angle.number);
      return {
        ...angle,
        defaultImageUrl: angle.defaultImageUrl || defaultImg.url,
        defaultImageHash: angle.defaultImageHash || defaultImg.imageHash,
      };
    }),
  );
  const [stages, setStages] = useState<Record<string, StageMeta>>(() => ANTKI_PL_STAGE_LABELS);
  const [savedAds, setSavedAds] = useState<AntkiPlGeneratedAd[]>(() => buildAllArgonPrewrittenAds());
  const [imageLibrary, setImageLibrary] = useState<AntkiPlImageAsset[]>(ANTKI_PL_IMAGE_LIBRARY);
  const [brain, setBrain] = useState<{ provider: string; model: string }>({
    provider: 'argon',
    model: 'Argon (105 autorskich punchy winnerów · 6 Batchy)',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Image Gallery & Preview state
  const [showGalleryPanel, setShowGalleryPanel] = useState(false);
  const [showAwarenessPanel, setShowAwarenessPanel] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'for_angle' | 'all' | 'ai' | 'meta' | 'custom'>('for_angle');
  const [lightboxAsset, setLightboxAsset] = useState<AntkiPlImageAsset | null>(null);
  const [assigningImage, setAssigningImage] = useState(false);
  const [uploadingCustomImage, setUploadingCustomImage] = useState(false);
  const customImageInputRef = useRef<HTMLInputElement | null>(null);
  const [fbPreviewExpanded, setFbPreviewExpanded] = useState(true);

  // Domyślnie pokazujemy wszystkie 105 Antków posortowane po batchach i dniach od najnowszych (Batch 6 NOOM 02.11 na samej górze)
  const [stageFilter, setStageFilter] = useState<
    | 'batch6_noom'
    | 'batch5_sport'
    | 'batch4_testpack'
    | 'batch3_zal_v2'
    | 'dorosli_35'
    | 'dorosli_d1'
    | 'dorosli_d2'
    | 'dorosli_d3'
    | 'dorosli_d4'
    | 'dorosli_d5'
    | 'dorosli_d6'
    | 'dorosli_d7'
    | 'all_kids'
    | 'day_02_11'
    | 'day_01_11'
    | 'day_29_10'
    | 'day_23_10'
    | 'day_20_10'
    | 'all'
    | AntkiPlFunnelStage
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAngleId, setActiveAngleId] = useState<string | null>('noom-102-krystyna-62-wroclaw-schody');

  // Generation & Fanpage settings (domyślnie natywny fanpage dopasowany do kąta)
  const [destinationUrl, setDestinationUrl] = useState(ORTHOMAX_PL_DEFAULT_URL);
  const [selectedPageId, setSelectedPageId] = useState('1194345203770949');
  const [pageName, setPageName] = useState('Iwona Kożuchowska');
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
  const [metaCostCapPln, setMetaCostCapPln] = useState(35);
  const [metaDailyBudgetPln, setMetaDailyBudgetPln] = useState(1500);
  const [creatingMetaCampaign, setCreatingMetaCampaign] = useState(false);
  const [updatingCostCap, setUpdatingCostCap] = useState(false);
  const [syncingMetaCc35, setSyncingMetaCc35] = useState(false);
  const [showCampaignPanel, setShowCampaignPanel] = useState(false);

  const isDorosliBatchView =
    stageFilter.startsWith('dorosli_') ||
    stageFilter === 'batch6_noom' ||
    stageFilter === 'batch3_zal_v2' ||
    stageFilter === 'batch4_testpack' ||
    stageFilter === 'batch5_sport' ||
    stageFilter === 'day_02_11' ||
    stageFilter === 'day_01_11' ||
    stageFilter === 'day_29_10' ||
    stageFilter === 'day_23_10';

  useEffect(() => {
    const activeObj = presets.find(a => a.id === activeAngleId);
    if (activeObj?.defaultDestinationUrl) {
      setDestinationUrl(activeObj.defaultDestinationUrl);
    } else if (activeObj && activeObj.number >= 82 && activeObj.number <= 101) {
      setDestinationUrl('https://orthomax.pl/products/orthomax-stepmax-pro');
    } else {
      setDestinationUrl('https://orthomax.pl/products/orthomax-stepmax');
    }

    if (manualPageOverride) return;
    const explicitMappedId = activeAngleId ? DOROSLI_ANGLE_NATIVE_PAGE_MAP[activeAngleId] : undefined;
    if (explicitMappedId) {
      const found = AVAILABLE_META_FANPAGES.find(p => p.id === explicitMappedId);
      setSelectedPageId(explicitMappedId);
      setPageName(found?.name || 'Centrum Dobrego Kroku');
      setMetaCampaignName(dorosliCampaignStructure?.campaignName || 'ANTKI DOROSLI CC30');
    } else if (activeObj && activeObj.number >= 71 && activeObj.number <= 75) {
      setSelectedPageId('1194345203770949');
      setPageName('Iwona Kożuchowska');
      setMetaCampaignName(dorosliCampaignStructure?.campaignName || 'ANTKI DOROSLI CC30');
    } else if (isDorosliBatchView) {
      setSelectedPageId('866702399857726');
      setPageName('Centrum Dobrego Kroku');
      setMetaCampaignName(dorosliCampaignStructure?.campaignName || 'ANTKI DOROSLI CC30');
    } else {
      setSelectedPageId('798916893308685');
      setPageName('Porady Mamy Gosi');
      setMetaCampaignName(campaignStructure?.campaignName || 'ANTKI CC35');
    }
  }, [isDorosliBatchView, activeAngleId, manualPageOverride, dorosliCampaignStructure, campaignStructure, presets]);

  const handleSelectFanpage = useCallback((newPageId: string) => {
    setManualPageOverride(true);
    setSelectedPageId(newPageId);
    const found = AVAILABLE_META_FANPAGES.find(p => p.id === newPageId);
    if (found) setPageName(found.name);
  }, []);

  const applyLocalImageOverrides = useCallback((adsList: AntkiPlGeneratedAd[]): AntkiPlGeneratedAd[] => {
    try {
      const rawLocal = typeof window !== 'undefined' ? window.localStorage.getItem('antki_pl_saved_images_v6_clean_ab') : null;
      if (!rawLocal) return adsList;
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
      return adsList.map(ad => {
        const loc = parsedLocal[ad.angleId];
        if (!loc) return ad;
        const serverHasKie1 = Boolean(ad.imageUrl && ad.imageUrl.startsWith('http'));
        const serverHasKie2 = Boolean(ad.secondImageUrl && ad.secondImageUrl.startsWith('http'));
        const locHasKie1 = Boolean(loc.imageUrl && (loc.imageUrl.startsWith('http') || loc.imageUrl.startsWith('data:')));
        const locHasKie2 = Boolean(loc.secondImageUrl && (loc.secondImageUrl.startsWith('http') || loc.secondImageUrl.startsWith('data:')));
        return {
          ...ad,
          imageUrl: serverHasKie1 && !locHasKie1 ? ad.imageUrl : loc.imageUrl || ad.imageUrl,
          imageHash: serverHasKie1 && !locHasKie1 ? ad.imageHash : loc.imageHash || ad.imageHash,
          secondImageUrl:
            serverHasKie2 && !locHasKie2
              ? ad.secondImageUrl
              : loc.secondImageUrl !== undefined
              ? loc.secondImageUrl || undefined
              : ad.secondImageUrl,
          secondImageHash:
            serverHasKie2 && !locHasKie2
              ? ad.secondImageHash
              : loc.secondImageHash !== undefined
              ? loc.secondImageHash || undefined
              : ad.secondImageHash,
          updatedAt: Math.max(ad.updatedAt || 0, loc.updatedAt || 0),
        };
      });
    } catch {
      return adsList;
    }
  }, []);

  const loadInit = useCallback(async () => {
    setError('');
    setSavedAds(prev => applyLocalImageOverrides(prev.length ? prev : buildAllArgonPrewrittenAds()));
    try {
      const res = await fetch('/api/antki-pl', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) return;
      const loadedAds: AntkiPlGeneratedAd[] =
        Array.isArray(data.savedAds) && data.savedAds.length > 0
          ? applyLocalImageOverrides(data.savedAds)
          : applyLocalImageOverrides(buildAllArgonPrewrittenAds());
      if (Array.isArray(data.presets) && data.presets.length > 0) setPresets(data.presets);
      if (data.stages && Object.keys(data.stages).length > 0) setStages(data.stages);
      setSavedAds(loadedAds);
      if (Array.isArray(data.imageLibrary) && data.imageLibrary.length > 0) {
        setImageLibrary(data.imageLibrary);
      }
      if (data.adSetBlueprints) setAdSetBlueprints(data.adSetBlueprints);
      if (data.dorosliAdSetBlueprints) setDorosliAdSetBlueprints(data.dorosliAdSetBlueprints);
      if (data.campaignStructure) {
        setCampaignStructure(data.campaignStructure);
        setMetaCostCapPln(data.campaignStructure.costCapPln || 35);
        setMetaDailyBudgetPln(data.campaignStructure.dailyBudgetPln || 1500);
      }
      if (data.dorosliCampaignStructure) {
        setDorosliCampaignStructure(data.dorosliCampaignStructure);
      }
      if (data.brain) setBrain(data.brain);
      if (data.presets?.length) {
        setActiveAngleId(prev => prev || 'noom-102-krystyna-62-wroclaw-schody');
      }
    } catch {
      // Keep preloaded 101 Argon ads + local image overrides seamlessly
    } finally {
      setLoading(false);
    }
  }, [applyLocalImageOverrides]);

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
      if (stageFilter === 'batch6_noom' || stageFilter === 'day_02_11' || stageFilter === 'noom_krystyna_kalejdoskop') {
        if (item.number < 102 || item.number > 105) return false;
      } else if (stageFilter === 'batch5_sport') {
        if (item.number < 82 || item.number > 101) return false;
      } else if (stageFilter === 'batch4_testpack' || stageFilter === 'anti_sales_allegro') {
        if (item.number < 76 || item.number > 81) return false;
      } else if (stageFilter === 'batch3_zal_v2') {
        if (item.number < 71 || item.number > 75) return false;
      } else if (stageFilter === 'dorosli_35' || stageFilter === 'day_23_10') {
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
      } else if (stageFilter === 'all_kids' || stageFilter === 'day_20_10') {
        if (item.number < 1 || item.number > 35) return false;
      } else if (stageFilter === 'day_01_11') {
        if (item.number < 76 || item.number > 101) return false;
      } else if (stageFilter === 'day_29_10') {
        if (item.number < 71 || item.number > 75) return false;
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
        const raw = window.localStorage.getItem('antki_pl_saved_images_v6_clean_ab');
        const current = raw ? JSON.parse(raw) : {};
        const merged = { ...current, ...updates };
        window.localStorage.setItem('antki_pl_saved_images_v6_clean_ab', JSON.stringify(merged));
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

      // 0ms OPTIMISTIC UI UPDATE — slot 1 modifies ONLY Kreacja A, slot 2 modifies ONLY Kreacja B!
      setSavedAds(prev => {
        const next = [...prev];
        for (const angleId of targetAngleIds) {
          const idx = next.findIndex(item => item.angleId === angleId);
          const preset = presets.find(p => p.id === angleId);
          const fallbackAsset = getDefaultImageForAngle(preset?.number || 1);
          if (idx >= 0) {
            const cur = next[idx];
            const pUrl = slot === 1 ? asset.url : cur.imageUrl || preset?.defaultImageUrl || fallbackAsset.url;
            const pHash = slot === 1 ? asset.imageHash : cur.imageHash || preset?.defaultImageHash || fallbackAsset.imageHash;
            const sUrl = slot === 2 ? asset.url : cur.secondImageUrl || preset?.defaultSecondImageUrl;
            const sHash = slot === 2 ? asset.imageHash : cur.secondImageHash || preset?.defaultSecondImageHash;
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
          } else if (preset) {
            const pUrl = slot === 1 ? asset.url : preset.defaultImageUrl || fallbackAsset.url;
            const pHash = slot === 1 ? asset.imageHash : preset.defaultImageHash || fallbackAsset.imageHash;
            const sUrl = slot === 2 ? asset.url : preset.defaultSecondImageUrl;
            const sHash = slot === 2 ? asset.imageHash : preset.defaultSecondImageHash;
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
      } else {
        setPresets(prev =>
          prev.map(p =>
            targetSet.has(p.id)
              ? { ...p, defaultSecondImageUrl: asset.url, defaultSecondImageHash: asset.imageHash }
              : p,
          ),
        );
      }

      setNotice(
        slot === 2
          ? `🔥 Ustawiono Kreację B (2. zdjęcie A/B) dla ${labelForNotice}: "${asset.label}"`
          : `⚡ Ustawiono Kreację A (Główną) dla ${labelForNotice}: "${asset.label}"`,
      );

      // Send ONLY the changed slot to the server so it never overwrites the other slot!
      try {
        const res = await fetch('/api/antki-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'set_image',
            angleIds: targetAngleIds,
            ...(slot === 1
              ? { imageUrl: asset.url, imageHash: asset.imageHash || '' }
              : { secondImageUrl: asset.url, secondImageHash: asset.imageHash || '' }),
          }),
        });
        const data = await res.json().catch(() => null);
        if (res.ok) {
          setImagesSavedFlash(true);
          setTimeout(() => setImagesSavedFlash(false), 2500);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch {
        // Already updated optimistically + in localStorage
      }
    },
    [presets, pageName, destinationUrl, imageSlotTarget, persistAngleImagesLocally],
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
    if (!activeAngle) return;
    setSavingImages(true);
    setError('');
    try {
      const now = Date.now();
      const curAd = savedAds.find(a => a.angleId === activeAngle.id);
      const fallback = getDefaultImageForAngle(activeAngle.number);
      const pUrl = curAd?.imageUrl || activeAngle.defaultImageUrl || fallback.url;
      const pHash = curAd?.imageHash || activeAngle.defaultImageHash || fallback.imageHash;
      const sUrl = curAd?.secondImageUrl ?? activeAngle.defaultSecondImageUrl ?? '';
      const sHash = curAd?.secondImageHash ?? activeAngle.defaultSecondImageHash ?? '';

      persistAngleImagesLocally({
        [activeAngle.id]: {
          imageUrl: pUrl,
          imageHash: pHash || '',
          secondImageUrl: sUrl || '',
          secondImageHash: sHash || '',
          updatedAt: now,
        },
      });

      const res = await fetch('/api/antki-pl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_image',
          angleIds: [activeAngle.id],
          imageUrl: pUrl,
          imageHash: pHash,
          secondImageUrl: sUrl,
          secondImageHash: sHash,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu obrazków.');
      setImagesSavedFlash(true);
      setNotice(`✅ Zapisano wybór Kreacji A i B dla Antka #${activeAngle.number}!`);
      setTimeout(() => setImagesSavedFlash(false), 3500);
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
  const autoTriggeredKieRef = useRef<Set<string>>(new Set());
  const inFlightKieAnglesRef = useRef<Set<string>>(new Set());
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

  const triggerKie10ImagesForAngle = useCallback(
    async (targetAngle: AntkiPlPresetAngle, explicitCopyText?: string, explicitHeadline?: string, isManual = false) => {
      if (!isManual) return false;
      const targetAngleId = targetAngle.id;
      if (inFlightKieAnglesRef.current.has(targetAngleId)) return false;

      const adForAngle = adByAngleId[targetAngleId];
      const copyText = (
        explicitCopyText ||
        (activeAngle?.id === targetAngleId ? editPrimaryText : '') ||
        adForAngle?.primaryText ||
        targetAngle.hookIdea ||
        targetAngle.sceneBeat ||
        targetAngle.title ||
        ''
      ).trim();
      const copyHeadline = (
        explicitHeadline ||
        (activeAngle?.id === targetAngleId ? editHeadline : '') ||
        adForAngle?.headline ||
        targetAngle.defaultHeadline ||
        targetAngle.title ||
        ''
      ).trim();
      if (!copyText) return false;

      inFlightKieAnglesRef.current.add(targetAngleId);
      const targetAngleNumber = targetAngle.number;
      setGeneratingKie5AngleId(targetAngleId);
      setError('');

      setNotice(
        `📸 Uruchamiam generowanie 12 zdjęć Raw iPhone 3:4 (2K Google AI · styl NHS / cały skrypt) do Antka #${targetAngleNumber} w Kie.ai...`,
      );

      try {
        const startRes = await fetch('/api/antki-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_10_kie_images',
            angleId: targetAngleId,
            primaryText: copyText,
            headline: copyHeadline,
            title: targetAngle.title,
            segment: targetAngle.segment,
            isManual: true,
          }),
        });
        const startData = await startRes.json();
        if (!startRes.ok || !Array.isArray(startData.tasks) || startData.tasks.length === 0) {
          throw new Error(startData.error || 'Nie udało się uruchomić generowania zdjęć w Kie.ai.');
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
        const totalTasksCount = initialTasks.length || 10;
        const finishedByIndex: Record<number, AntkiPlImageAsset> = {};

        await Promise.all(
          initialTasks.map(async task => {
            const maxAttempts = 50;
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
                  finishedByIndex[task.index] = asset;
                  if (Array.isArray(pollData.imageLibrary)) {
                    setImageLibrary(pollData.imageLibrary);
                  } else {
                    setImageLibrary(prev => [asset, ...prev.filter(x => x.id !== asset.id)]);
                  }
                  if (Array.isArray(pollData.savedAds)) {
                    setSavedAds(pollData.savedAds);
                  }
                  setKieTasksByAngle(prev => ({
                    ...prev,
                    [targetAngleId]: (prev[targetAngleId] || []).map(item =>
                      item.taskId === task.taskId ? { ...item, state: 'success', asset } : item,
                    ),
                  }));

                  if (task.index === 1) {
                    await assignImageToAngles([targetAngleId], asset, `Antek #${targetAngleNumber} (Obrazek A - Hook)`, 1);
                  } else if (task.index === 2) {
                    await assignImageToAngles([targetAngleId], asset, `Antek #${targetAngleNumber} (Obrazek B - Paragon)`, 2);
                  }

                  setNotice(
                    `📸 Wygenerowano ${completedCount}/${totalTasksCount} surowych zdjęć z Antka #${targetAngleNumber} w Kie.ai („${task.label}”)!`,
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

        const orderedAssets = Object.keys(finishedByIndex)
          .map(Number)
          .sort((a, b) => a - b)
          .map(idx => finishedByIndex[idx]);

        if (orderedAssets.length >= 2) {
          await assignImageToAngles([targetAngleId], orderedAssets[0], `Antek #${targetAngleNumber} (Obrazek A)`, 1);
          await assignImageToAngles([targetAngleId], orderedAssets[1], `Antek #${targetAngleNumber} (Obrazek B - Paragon)`, 2);
          setNotice(
            `✅ Gotowe! Wygenerowano ${orderedAssets.length}/${totalTasksCount} surowych zdjęć do Antka #${targetAngleNumber} (Kreacja A = Hook, Kreacja B = Paragon)!`,
          );
        } else if (orderedAssets.length === 1) {
          await assignImageToAngles([targetAngleId], orderedAssets[0], `Antek #${targetAngleNumber} (Obrazek A)`, 1);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Błąd podczas generowania zdjęć w Kie.ai.';
        setError(msg);
        return false;
      } finally {
        inFlightKieAnglesRef.current.delete(targetAngleId);
        setGeneratingKie5AngleId(prev => (prev === targetAngleId ? null : prev));
      }
      return true;
    },
    [adByAngleId, activeAngle, editPrimaryText, editHeadline, assignImageToAngles],
  );

  const handleGenerate5KieImagesForActiveAngle = useCallback(async () => {
    if (!activeAngle) return;
    await triggerKie10ImagesForAngle(activeAngle, undefined, undefined, true);
  }, [activeAngle, triggerKie10ImagesForAngle]);

  // Automatycznie pokazuj w siatce wszystkie już wygenerowane w Kie.ai zdjęcia dla każdego kąta (bez odpalania nowych zadań w tle!)
  useEffect(() => {
    if (!imageLibrary.length) return;
    const byAngle: Record<string, AntkiPlImageAsset[]> = {};
    for (const img of imageLibrary) {
      if (img.angleId && (img.id.startsWith('kie-') || img.url.startsWith('http'))) {
        if (!byAngle[img.angleId]) byAngle[img.angleId] = [];
        if (!byAngle[img.angleId].some(x => x.url === img.url)) {
          byAngle[img.angleId].push(img);
        }
      }
    }
    setKieTasksByAngle(prev => {
      const next = { ...prev };
      for (const [angleId, assets] of Object.entries(byAngle)) {
        if (inFlightKieAnglesRef.current.has(angleId)) continue;
        // Sort by scene number (1., 2., ..., 10.)
        const sorted = [...assets].sort((a, b) => {
          const mA = (a.label || '').match(/(?:^|·\s*)(\d+)\./);
          const mB = (b.label || '').match(/(?:^|·\s*)(\d+)\./);
          const nA = mA ? Number(mA[1]) : 99;
          const nB = mB ? Number(mB[1]) : 99;
          return nA - nB;
        });
        next[angleId] = sorted.slice(0, 10).map((asset, idx) => ({
          index: idx + 1,
          label: asset.label,
          prompt: asset.kiePrompt || '',
          taskId: asset.id,
          state: 'success' as const,
          asset,
        }));
      }
      return next;
    });
  }, [imageLibrary]);

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
      // 1. Flush current browser image selections to server state first
      const imagesByAngle: Record<
        string,
        { imageUrl?: string; imageHash?: string; secondImageUrl?: string; secondImageHash?: string }
      > = {};
      for (const ad of savedAds) {
        if (ad?.angleId && ad.imageUrl) {
          imagesByAngle[ad.angleId] = {
            imageUrl: ad.imageUrl,
            imageHash: ad.imageHash || '',
            secondImageUrl: ad.secondImageUrl || '',
            secondImageHash: ad.secondImageHash || '',
          };
        }
      }
      if (Object.keys(imagesByAngle).length > 0) {
        await fetch('/api/antki-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_all_images', imagesByAngle }),
        }).catch(() => {});
      }

      // 2. Sync group by group so all 35 angles (up to 70 A/B ads + Kie.ai image uploads) complete without timeout
      const groupsToSync = activeAdSetBlueprints.length > 0 ? activeAdSetBlueprints : [{ code: '', label: 'Wszystkie' }];
      let totalCreated = 0;
      let totalFailed = 0;
      let resolvedCampId = activeCampaignStructure?.campaignId || '';

      for (let i = 0; i < groupsToSync.length; i++) {
        const g = groupsToSync[i];
        setNotice(
          `⏳ Synchronizuję zestaw ${i + 1}/${groupsToSync.length} (${g.label || g.code}) w kampanii ${
            batchMode === 'dorosli' ? 'ANTKI DOROSLI' : 'ANTKI DZIECI'
          }...`,
        );
        const res = await fetch('/api/antki-pl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_meta_cc35',
            batch: batchMode,
            group: g.code || undefined,
            campaignId: resolvedCampId || activeCampaignStructure?.campaignId,
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
        if (!res.ok) throw new Error(data.error || `Błąd synchronizacji zestawu ${g.label || g.code}.`);
        if (data.campaignId) resolvedCampId = data.campaignId;
        totalCreated += Number(data.createdCount || 0) + Number(data.updatedCount || 0);
        totalFailed += Number(data.failedCount || 0);
      }

      setNotice(
        `✅ Zsynchronizowano kampanię ${batchMode === 'dorosli' ? 'ANTKI DOROSLI CC30' : 'ANTKI CC30'} (ID: ${
          resolvedCampId || activeCampaignStructure?.campaignId || '120249912191200300'
        } · PAUSED) na fanpage „${pageName}” (${selectedPageId}): utworzono/zaktualizowano ${totalCreated} reklam (błędów: ${totalFailed}).`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd synchronizacji z Meta.');
    } finally {
      setSyncingMetaCc35(false);
    }
  }, [
    isDorosliBatchView,
    savedAds,
    activeAdSetBlueprints,
    activeCampaignStructure,
    metaCampaignName,
    metaCostCapPln,
    metaDailyBudgetPln,
    selectedPageId,
    activeFanpageMeta,
    destinationUrl,
    pageName,
  ]);

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

  const forAngleImages = useMemo(() => {
    if (!activeAngle) return [];
    const seen = new Set<string>();
    const list: AntkiPlImageAsset[] = [];

    const tasks = kieTasksByAngle[activeAngle.id] || [];
    for (const t of tasks) {
      if (t.state === 'success' && t.asset && !seen.has(t.asset.url)) {
        seen.add(t.asset.url);
        list.push(t.asset);
      }
    }

    for (const img of imageLibrary) {
      const matchesAngle =
        img.angleId === activeAngle.id ||
        img.id.includes(`-${activeAngle.id}-`) ||
        img.label.includes(`Antek #${activeAngle.number} `) ||
        img.label.includes(`Antek #${activeAngle.number}:`) ||
        img.label.includes(`(#${activeAngle.number})`);
      if (matchesAngle && !seen.has(img.url)) {
        seen.add(img.url);
        list.push(img);
      }
    }

    // Also include up to 3 shared Kie.ai variants per scene number (1..10) so we don't need 30 duplicate foot/basin photos across angles
    if (activeAngle.segment === 'dorosli') {
      const sceneCounts = new Map<number, number>();
      for (const item of list) {
        const m = (item.label || '').match(/(?:^|·\s*)(\d+)\./);
        if (m) {
          const sNum = Number(m[1]);
          sceneCounts.set(sNum, (sceneCounts.get(sNum) || 0) + 1);
        }
      }
      for (const img of imageLibrary) {
        if (img.source !== 'ai' || seen.has(img.url)) continue;
        const m = (img.label || '').match(/(?:^|·\s*)(\d+)\./);
        if (!m) continue;
        const sNum = Number(m[1]);
        const currentCount = sceneCounts.get(sNum) || 0;
        if (currentCount < 1) {
          seen.add(img.url);
          list.push(img);
          sceneCounts.set(sNum, currentCount + 1);
        }
      }
    }

    return list.sort((a, b) => {
      const mA = (a.label || '').match(/(?:^|·\s*)(\d+)\./);
      const mB = (b.label || '').match(/(?:^|·\s*)(\d+)\./);
      return (mA ? Number(mA[1]) : 99) - (mB ? Number(mB[1]) : 99);
    });
  }, [activeAngle, kieTasksByAngle, imageLibrary]);

  const deduplicatedImageLibrary = useMemo(() => {
    const counts = new Map<string, number>();
    return imageLibrary.filter(img => {
      if (img.source !== 'ai') return true;
      const cleanTitle = (img.label || '')
        .replace(/^#\d+\s*·\s*/, '')
        .replace(/\(\s*\d[\d\s,]*zł\s*\)/gi, '')
        .trim()
        .toLowerCase();
      if (!cleanTitle) return true;
      const c = counts.get(cleanTitle) || 0;
      if (c >= 3) return false;
      counts.set(cleanTitle, c + 1);
      return true;
    });
  }, [imageLibrary]);

  const aiImagesCount = useMemo(() => deduplicatedImageLibrary.filter(i => i.source === 'ai').length, [deduplicatedImageLibrary]);
  const metaImagesCount = useMemo(() => deduplicatedImageLibrary.filter(i => i.source === 'meta').length, [deduplicatedImageLibrary]);
  const customImagesCount = useMemo(() => deduplicatedImageLibrary.filter(i => i.source === 'custom').length, [deduplicatedImageLibrary]);
  const filteredGalleryImages = useMemo(() => {
    if (galleryTab === 'for_angle') return forAngleImages;
    if (galleryTab === 'ai') return deduplicatedImageLibrary.filter(i => i.source === 'ai');
    if (galleryTab === 'meta') return deduplicatedImageLibrary.filter(i => i.source === 'meta');
    if (galleryTab === 'custom') return deduplicatedImageLibrary.filter(i => i.source === 'custom');
    return deduplicatedImageLibrary;
  }, [deduplicatedImageLibrary, galleryTab, forAngleImages]);

  const activeResolvedImage = useMemo(() => {
    if (!activeAngle) return imageLibrary[0];
    const defaultUrl = activeAngle.defaultImageUrl || getDefaultImageForAngle(activeAngle.number).url;
    const rawSavedUrl = activeAd?.imageUrl;
    const isBrokenLegacyNoomUrl =
      rawSavedUrl &&
      (rawSavedUrl.includes('kie-dorosli-43-spacer-lawka') ||
        rawSavedUrl.includes('kie-dorosli-41-miska-z-woda') ||
        rawSavedUrl.endsWith('.png'));
    const savedUrl = isBrokenLegacyNoomUrl ? defaultUrl : rawSavedUrl;
    const dedicatedFirst = forAngleImages[0];
    const userModified = Boolean(activeAd?.updatedAt && activeAd.updatedAt > 1792616400000);
    const isUnmodifiedPlaceholder =
      !savedUrl || (!userModified && savedUrl === defaultUrl && !savedUrl.startsWith('http') && !savedUrl.startsWith('data:'));
    const currentUrl = isUnmodifiedPlaceholder && dedicatedFirst ? dedicatedFirst.url : savedUrl || defaultUrl;
    return (
      imageLibrary.find(item => item.url === currentUrl) ||
      forAngleImages.find(item => item.url === currentUrl) || {
        id: 'custom-assigned',
        url: currentUrl,
        label: `Przypisana kreacja (#${activeAngle.number})`,
        source: (currentUrl.startsWith('data:image/') ? 'custom' : 'ai') as 'ai' | 'meta' | 'custom',
        imageHash: activeAd?.imageHash || activeAngle.defaultImageHash,
      }
    );
  }, [activeAngle, activeAd, imageLibrary, forAngleImages]);

  const activeResolvedSecondImage = useMemo(() => {
    if (!activeAngle) return null;
    const defaultSecondUrl = activeAngle.defaultSecondImageUrl;
    const savedSecondUrl = activeAd?.secondImageUrl;
    const dedicatedSecond = forAngleImages[1];
    const userModified = Boolean(activeAd?.updatedAt && activeAd.updatedAt > 1792616400000);
    const isUnmodifiedSecond =
      !savedSecondUrl ||
      (!userModified && savedSecondUrl === defaultSecondUrl && !savedSecondUrl.startsWith('http') && !savedSecondUrl.startsWith('data:'));
    const secondUrl = isUnmodifiedSecond && dedicatedSecond ? dedicatedSecond.url : savedSecondUrl ?? defaultSecondUrl;
    if (!secondUrl) return null;
    return (
      imageLibrary.find(item => item.url === secondUrl) ||
      forAngleImages.find(item => item.url === secondUrl) || {
        id: 'custom-assigned-2',
        url: secondUrl,
        label: `2. kreacja (#${activeAngle.number})`,
        source: (secondUrl.startsWith('data:image/') ? 'custom' : 'ai') as 'ai' | 'meta' | 'custom',
        imageHash: activeAd?.secondImageHash || activeAngle.defaultSecondImageHash,
      }
    );
  }, [activeAngle, activeAd, imageLibrary, forAngleImages]);


  const [isEditingCopy, setIsEditingCopy] = useState(false);
  const [showAngleDetails, setShowAngleDetails] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const b = params.get("brand");
    if (b === "bennett" || b === "bennett-uk" || b === "bennettseed") {
      setActiveBrand("bennett-uk");
    } else if (b === "sardian" || b === "sardian-szampon" || b === "szampon" || b === "stryde") {
      setActiveBrand("sardian-szampon");
    } else if (b === "orthomax" || b === "feliora") {
      setActiveBrand(b);
    } else if (b === "feliora-pies" || b === "psy" || b === "pies") {
      setActiveBrand("feliora-pies");
    }
    const batchParam = params.get("batch");
    if (batchParam === "noom" || batchParam === "batch6" || batchParam === "krystyna") {
      setActiveBrand("orthomax");
      setStageFilter("batch6_noom");
      setActiveAngleId("noom-102-krystyna-62-wroclaw-schody");
    } else if (batchParam === "sport" || batchParam === "batch5") {
      setActiveBrand("orthomax");
      setStageFilter("batch5_sport");
      setActiveAngleId("sport-82-gory-zejscie-morskie-oko-kolana");
    }
    const angleParam = params.get("angle");
    if (angleParam) {
      setActiveBrand("orthomax");
      setActiveAngleId(angleParam);
    }
  }, []);

  const groupedPresetsForSidebar = useMemo(() => {
    const getBatchRank = (num: number): number => {
      if (num >= 102) return 6; // Batch 6: NOOM / A/B Test Krystyna 62 l. (02.11)
      if (num >= 82 && num <= 101) return 5; // Batch 5: Sport (01.11 wieczór)
      if (num >= 76 && num <= 81) return 4; // Batch 4: Test Pack (01.11)
      if (num >= 71 && num <= 75) return 3; // Batch 3: Żal V2 (29.10)
      if (num >= 36 && num <= 70) return 2; // Batch 2: Dorośli 35 (23.10)
      return 1; // Batch 1: Dzieci 35 (20.10)
    };

    const getDayKeyForAngle = (num: number, ad?: AntkiPlGeneratedAd): string => {
      if (num >= 102) return '02.11.2026';
      if (num >= 76 && num <= 101) return '01.11.2026';
      if (num >= 71 && num <= 75) return '29.10.2026';
      if (num >= 36 && num <= 70) return '23.10.2026';
      if (num >= 1 && num <= 35) return '20.10.2026';
      return formatAntekFullDate(ad?.updatedAt || ad?.createdAt);
    };

    const sorted = [...filteredPresets].sort((a, b) => {
      const rankA = getBatchRank(a.number);
      const rankB = getBatchRank(b.number);
      if (rankA !== rankB) {
        return sidebarSort === 'oldest' ? rankA - rankB : rankB - rankA;
      }
      return a.number - b.number;
    });

    if (sidebarSort === 'days') {
      const dayDefs: Array<{ day: string; badge: string; label: string; color: string }> = [
        {
          day: '02.11.2026',
          badge: '📅 DZIEŃ 02.11.2026 · DZISIAJ (NOOM A/B TEST)',
          label: 'Batch 6: NOOM / A/B Test Krystyna 62 l. · Kalejdoskop 5 Lekarzy (#102–#105 · 4 szt.) · LP: /pages/kp-krystyna-1',
          color: '#10b981',
        },
        {
          day: '01.11.2026',
          badge: '📅 DZIEŃ 01.11.2026',
          label: 'Batch 5: Sport & Aktywni (#82–#101 · 20 szt.) + Batch 4: Test Pack Anti-Sales & Allegro (#76–#81 · 6 szt.)',
          color: '#16a34a',
        },
        {
          day: '29.10.2026',
          badge: '📅 DZIEŃ 29.10.2026',
          label: 'Batch 3: ŻAL V2 Iteracje Winnera (#71–#75 · 5 szt.)',
          color: '#dc2626',
        },
        {
          day: '23.10.2026',
          badge: '📅 DZIEŃ 23.10.2026',
          label: 'Batch 2: DOROŚLI 35 (#36–#70 · D01–D35 · 35 szt.)',
          color: '#ea580c',
        },
        {
          day: '20.10.2026',
          badge: '📅 DZIEŃ 20.10.2026',
          label: 'Batch 1: DZIECI CC35 (#1–#35 · 35 szt.)',
          color: '#0284c7',
        },
      ];

      const map = new Map<string, AntkiPlPresetAngle[]>();
      for (const item of sorted) {
        const dayKey = getDayKeyForAngle(item.number, adByAngleId[item.id]);
        const bucket = map.get(dayKey) || [];
        bucket.push(item);
        map.set(dayKey, bucket);
      }

      return dayDefs
        .map(d => ({
          key: `day-${d.day}`,
          badge: `${d.badge} (${(map.get(d.day) || []).length} Antków)`,
          label: d.label,
          color: d.color,
          items: map.get(d.day) || [],
        }))
        .filter(g => g.items.length > 0);
    }

    const batchGroups: Array<{
      key: string;
      rank: number;
      badge: string;
      label: string;
      color: string;
      items: AntkiPlPresetAngle[];
    }> = [
      {
        key: 'batch6_noom',
        rank: 6,
        badge: '🔥 BATCH 6 · 📅 02.11.2026 · #102–#105 (4 ANTKI NOOM A/B TEST)',
        label: 'NOOM / A/B TEST: Historia Krystyny 62 l. · Kalejdoskop 5 Lekarzy (#102–#105) · LP: /pages/kp-krystyna-1',
        color: '#10b981',
        items: [],
      },
      {
        key: 'batch5_sport',
        rank: 5,
        badge: '🏔️⚽🎾🏃 BATCH 5 · 📅 01.11.2026 · #82–#101 (20 ANTKÓW)',
        label: 'SPORT & AKTYWNI: Góry (#82–86), Padel/Tenis (#87–91), Orlik (#92–96), Bieganie/Marsze (#97–101) · LP: orthomax-stepmax-pro',
        color: '#16a34a',
        items: [],
      },
      {
        key: 'batch4_testpack',
        rank: 4,
        badge: '👎 BATCH 4 · 📅 01.11.2026 · #76–#81 (6 ANTKÓW)',
        label: 'TEST PACK: 3x Odwrócenie Winy (Anti-Sales #76–78) + 3x Demaskacja tanich wkładek z Allegro (#79–81)',
        color: '#f97316',
        items: [],
      },
      {
        key: 'batch3_zal_v2',
        rank: 3,
        badge: '🔥 BATCH 3 · 📅 29.10.2026 · #71–#75 (5 ANTKÓW)',
        label: 'ŻAL V2 ITERACJE WINNERA: 5 kątów dorosłych na szkielecie winnera ZAL (6,29x ROAS)',
        color: '#dc2626',
        items: [],
      },
      {
        key: 'batch2_dorosli',
        rank: 2,
        badge: '👩 BATCH 2 · 📅 23.10.2026 · #36–#70 (35 ANTKÓW)',
        label: 'DOROŚLI 35 (D01–D35): SOR, 64-letnia Mama, Fizjo Test Łuku, Ostroga 6:00, Haluks, Żal, Praca 8–12h',
        color: '#d97706',
        items: [],
      },
      {
        key: 'batch1_dzieci',
        rank: 1,
        badge: '👶 BATCH 1 · 📅 20.10.2026 · #1–#35 (35 ANTKÓW)',
        label: 'DZIECI CC35: 35 kątów dziecięcych (Dom, Efekt Domina, Szkoła/WF, Wypalone matki, Ryciak, Żal, Zima)',
        color: '#0284c7',
        items: [],
      },
    ];

    for (const item of sorted) {
      if (item.number >= 102) batchGroups[0].items.push(item);
      else if (item.number >= 82 && item.number <= 101) batchGroups[1].items.push(item);
      else if (item.number >= 76 && item.number <= 81) batchGroups[2].items.push(item);
      else if (item.number >= 71 && item.number <= 75) batchGroups[3].items.push(item);
      else if (item.number >= 36 && item.number <= 70) batchGroups[4].items.push(item);
      else batchGroups[5].items.push(item);
    }

    const nonEmpty = batchGroups.filter(g => g.items.length > 0);
    return sidebarSort === 'oldest' ? [...nonEmpty].sort((a, b) => a.rank - b.rank) : nonEmpty;
  }, [filteredPresets, sidebarSort, adByAngleId]);

  const activeWordCount = useMemo(() => {
    const t = (editPrimaryText || activeAd?.primaryText || "").trim();
    return t ? t.split(/\s+/).length : 0;
  }, [editPrimaryText, activeAd]);

  if (activeBrand === "bennett-uk") {
    return (
      <BennettUkWorkspace
        onSwitchToFelioraPies={() => setActiveBrand("feliora-pies")}
        onSwitchToSardianSzampon={() => setActiveBrand("sardian-szampon")}
        onSwitchToStryde={() => setActiveBrand("sardian-szampon")}
        onSwitchToFeliora={() => setActiveBrand("feliora")}
        onSwitchToOrthomax={() => setActiveBrand("orthomax")}
      />
    );
  }

  if (activeBrand === "sardian-szampon" || activeBrand === "stryde") {
    return (
      <SardianPlWorkspace
        onSwitchToBennettUk={() => setActiveBrand("bennett-uk")}
        onSwitchToStryde={() => setActiveBrand("sardian-szampon")}
        onSwitchToFeliora={() => setActiveBrand("feliora")}
        onSwitchToFelioraPies={() => setActiveBrand("feliora-pies")}
        onSwitchToOrthomax={() => setActiveBrand("orthomax")}
      />
    );
  }

  if (activeBrand === "feliora") {
    return (
      <FelioraPlWorkspace
        onSwitchToBennettUk={() => setActiveBrand("bennett-uk")}
        onSwitchToSardianSzampon={() => setActiveBrand("sardian-szampon")}
        onSwitchToOrthomax={() => setActiveBrand("orthomax")}
        onSwitchToStryde={() => setActiveBrand("sardian-szampon")}
        onSwitchToFelioraPies={() => setActiveBrand("feliora-pies")}
      />
    );
  }

  if (activeBrand === "feliora-pies") {
    return (
      <FelioraPiesPlWorkspace
        onSwitchToBennettUk={() => setActiveBrand("bennett-uk")}
        onSwitchToSardianSzampon={() => setActiveBrand("sardian-szampon")}
        onSwitchToStryde={() => setActiveBrand("sardian-szampon")}
        onSwitchToFeliora={() => setActiveBrand("feliora")}
        onSwitchToOrthomax={() => setActiveBrand("orthomax")}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1f1006 0%, #140a04 100%)",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
        paddingBottom: 60,
      }}
    >
      <input
        ref={customImageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => void handleUploadCustomImageFiles(e.target.files)}
      />

      {/* TOP BAR WITH BRAND SWITCHER */}
      <div
        style={{
          background: "linear-gradient(135deg, #2d1606 0%, #431407 55%, #1c0d04 100%)",
          borderBottom: "1px solid #5c2d10",
          padding: "14px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1680,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/"
              style={{
                color: "#fdba74",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              ← Szekspir
            </a>

            {/* BRAND SWITCHER PILLS */}
            <AntkiPlBrandSwitcher
              activeBrand="orthomax"
              onSelectBrand={b => setActiveBrand(b === "stryde" ? "sardian-szampon" : b)}
              onOpenNoomBatch={() => {
                setStageFilter("batch6_noom");
                setActiveAngleId("noom-102-krystyna-62-wroclaw-schody");
              }}
            />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                  ANTKI PL · Orthomax StepMax (6 Batchy wg Dni · #1–#105)
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "rgba(16, 185, 129, 0.22)",
                    color: "#6ee7b7",
                    border: "1px solid rgba(16, 185, 129, 0.45)",
                  }}
                >
                  6 BATCHY (20.10 → 02.11) · {totalGeneratedCount}/{presets.length || 105} GOTOWYCH (W TYM 4 NOOM #102–#105)
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#fdba74", marginTop: 2 }}>
                Fanpage: <strong>{pageName}</strong> ({selectedPageId}) · Pakiet 1+1 GRATIS (2 pary za 99,99 zł) · LP:{" "}
                <span style={{ color: "#fb923c" }}>{destinationUrl}</span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <a
              href="/ab-test"
              style={{
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "#18181b",
                color: "#f4f4f5",
                fontWeight: 700,
                fontSize: 12.5,
                textDecoration: "none",
              }}
            >
              🧪 Pełny Panel A/B Testu (DRAFT) ↗
            </a>
            <button
              type="button"
              onClick={() => setShowCampaignPanel(prev => !prev)}
              style={{
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid #7c2d12",
                background: showCampaignPanel ? "#ea580c" : "rgba(234, 88, 12, 0.16)",
                color: "#ffedd5",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              📅 Kampania Meta & 7 Ad Setów
            </button>
            <button
              type="button"
              onClick={() => setShowGalleryPanel(prev => !prev)}
              style={{
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid #4a2610",
                background: showGalleryPanel ? "#ea580c" : "#241207",
                color: "#ffedd5",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              🖼️ Pełna Galeria Kreacji ({imageLibrary.length})
            </button>
            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              style={{
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid #4a2610",
                background: "#241207",
                color: "#fed7aa",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              + Własny kąt / Hook
            </button>
            <button
              type="button"
              onClick={exportMarkdownFile}
              style={{
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid #4a2610",
                background: "#241207",
                color: "#f8fafc",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              ⬇ Markdown ({readyAdsForExport.length})
            </button>
            <button
              type="button"
              onClick={exportUploaderJson}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: 0,
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 12.5,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(234, 88, 12, 0.4)",
              }}
            >
              🚀 Eksport JSON ({readyAdsForExport.length})
            </button>
          </div>
        </div>

        {/* DIRECT QUICK-ACCESS BAR FOR 4 NOOM ANTKI (#102-#105) + LANDER A/B TEST */}
        <div
          style={{
            maxWidth: 1680,
            margin: "10px auto 0",
            padding: "10px 14px",
            borderRadius: 10,
            background: "#09090b",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: 6,
                background: "rgba(16, 185, 129, 0.16)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.35)",
              }}
            >
              🔥 NOWY BATCH 6 · 02.11 · NOOM A/B TEST
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#f4f4f5" }}>
              Kliknij, aby od razu otworzyć 1 z 4 Antków NOOM („Historia Krystyny 62 l. / Kalejdoskop 5 lekarzy”):
            </span>
            {[
              { id: "noom-102-krystyna-62-wroclaw-schody", label: "#102 · Iwona Kożuchowska (62 l. Wrocław)" },
              { id: "noom-103-karol-64-endoproteza-kalejdoskop", label: "#103 · Karol Mikołajczyk (64 l. Endoproteza)" },
              { id: "noom-104-corka-gosia-mama-62-wroclaw", label: "#104 · Porady Mamy Gosi (Córka o Mamie)" },
              { id: "noom-105-fizjo-5-lekarzy-przed-endoproteza", label: "#105 · Centrum Dobrego Kroku (Fizjo)" },
            ].map(noomBtn => {
              const isSelected = activeAngleId === noomBtn.id;
              return (
                <button
                  key={noomBtn.id}
                  type="button"
                  onClick={() => {
                    setStageFilter("batch6_noom");
                    setActiveAngleId(noomBtn.id);
                  }}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: isSelected ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.14)",
                    background: isSelected ? "#059669" : "#18181b",
                    color: "#ffffff",
                    fontSize: 11.5,
                    fontWeight: isSelected ? 800 : 600,
                    cursor: "pointer",
                  }}
                >
                  {noomBtn.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <a
              href="/pages/kp-krystyna-1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#e4e4e7",
                fontSize: 11.5,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Lander Wariant B (/pages/kp-krystyna-1) ↗
            </a>
            <a
              href="/ab-test"
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "#f4f4f5",
                color: "#09090b",
                fontSize: 11.5,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Panel A/B Testu (DRAFT) →
            </a>
          </div>
        </div>
      </div>

      {/* NOTICES & ERRORS */}
      <div style={{ maxWidth: 1680, margin: "0 auto", padding: "0 24px" }}>
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.16)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fecaca",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              style={{ background: "transparent", border: 0, color: "#fecaca", cursor: "pointer", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}
        {notice && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(249, 115, 22, 0.18)",
              border: "1px solid rgba(249, 115, 22, 0.45)",
              color: "#ffedd5",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>🔥 {notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              style={{ background: "transparent", border: 0, color: "#ffedd5", cursor: "pointer", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* COLLAPSIBLE META CAMPAIGN & 7 AD SETS PANEL */}
        {showCampaignPanel && (
          <div
            style={{
              marginTop: 14,
              padding: 18,
              borderRadius: 14,
              background: "#241207",
              border: "1px solid #7c2d12",
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#ffedd5" }}>
                  📅 Struktura Kampanii Meta ({isDorosliBatchView ? "Batch 2: ANTKI DOROSLI CC30" : "Batch 1: ANTKI CC35"}) — 7 Zestawów Reklam (PAUSED)
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#fdba74" }}>
                  Konto reklamowe: <strong>1109284831182252</strong> · Każdy zestaw reklam zawiera 5 Antków z danej grupy tematycznej · Wszystkie kreacje lądują jako <strong>PAUSED</strong>.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={metaCampaignName}
                  onChange={e => setMetaCampaignName(e.target.value)}
                  placeholder="Nazwa kampanii"
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: "1px solid #4a2610",
                    background: "#160b04",
                    color: "#f8fafc",
                    fontSize: 12.5,
                    fontWeight: 700,
                    width: 210,
                  }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#fed7aa" }}>
                  Cost Cap (PLN):
                  <input
                    type="number"
                    value={metaCostCapPln}
                    onChange={e => setMetaCostCapPln(Number(e.target.value) || 30)}
                    style={{
                      width: 68,
                      padding: "6px 8px",
                      borderRadius: 7,
                      border: "1px solid #4a2610",
                      background: "#160b04",
                      color: "#ffffff",
                      fontWeight: 700,
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={updatingCostCap}
                  onClick={() => void handleUpdateCostCap(metaCostCapPln)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid #ea580c",
                    background: "rgba(234, 88, 12, 0.2)",
                    color: "#fdba74",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {updatingCostCap ? "Aktualizuję..." : `Zmień Cost Cap (${metaCostCapPln} zł)`}
                </button>
                <button
                  type="button"
                  disabled={creatingMetaCampaign}
                  onClick={() => void handleCreateMetaCampaign(true)}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 8,
                    border: 0,
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {creatingMetaCampaign ? "Tworzę w Meta..." : "🚀 Utwórz 7 Ad Setów w Meta (PAUSED)"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCampaignPanel(false)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    border: "1px solid #4a2610",
                    background: "#160b04",
                    color: "#fdba74",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Zamknij
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {displayedGroups.map(group => (
                <div
                  key={group.code}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "#160b04",
                    border: "1px solid #4a2610",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fb923c" }}>{group.code}</span>
                    <span style={{ fontSize: 10.5, color: "#fdba74", fontWeight: 700 }}>{group.shortRange}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{group.label}</div>
                  <div style={{ fontSize: 11.5, color: "#d6d3d1", lineHeight: 1.4 }}>{group.description}</div>
                  {typeof (group as { adSetId?: string }).adSetId === "string" && (group as { adSetId?: string }).adSetId && (
                    <div style={{ marginTop: 6, fontSize: 10.5, color: "#86efac", fontFamily: "monospace" }}>
                      AdSet ID: {(group as { adSetId?: string }).adSetId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COLLAPSIBLE FULL GALLERY PANEL */}
        {showGalleryPanel && (
          <div
            style={{
              marginTop: 14,
              padding: 18,
              borderRadius: 14,
              background: "#241207",
              border: "1px solid #5c2d10",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#ffedd5" }}>
                  🖼️ Biblioteka Kreacji Orthomax StepMax ({imageLibrary.length} zdjęć — kliknij, aby przypisać do #{activeAngle?.number || 36})
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#fdba74" }}>
                  Surowe zdjęcia z telefonu (Kie.ai Shit Quality) + biblioteka natywna. Możesz przypisać osobne zdjęcie A i osobne zdjęcie B (Test A/B).
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {(["for_angle", "all", "ai", "meta", "custom"] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setGalleryTab(tab)}
                    style={{
                      padding: "6px 11px",
                      borderRadius: 7,
                      border: "1px solid #4a2610",
                      background: galleryTab === tab ? "#ea580c" : "#160b04",
                      color: galleryTab === tab ? "#ffffff" : "#fed7aa",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {tab === "for_angle"
                      ? `🎯 Pod to copy #${activeAngle?.number || 36} (${forAngleImages.length})`
                      : tab === "all"
                      ? `Wszystkie (${imageLibrary.length})`
                      : tab === "ai"
                      ? `Surowe AI / Kie (${aiImagesCount})`
                      : tab === "meta"
                      ? `Meta Library (${metaImagesCount})`
                      : `Własne (${customImagesCount})`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => customImageInputRef.current?.click()}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid #f97316",
                    background: "rgba(249, 115, 22, 0.18)",
                    color: "#ffedd5",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Wgraj własne zdjęcia
                </button>
                <button
                  type="button"
                  onClick={() => setShowGalleryPanel(false)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid #4a2610",
                    background: "#160b04",
                    color: "#fdba74",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Zamknij
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
                gap: 10,
                maxHeight: 420,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {filteredGalleryImages.map(asset => {
                const isPrimary = activeResolvedImage?.url === asset.url;
                const isSecond = activeResolvedSecondImage?.url === asset.url;
                return (
                  <div
                    key={asset.id}
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#160b04",
                      border: isPrimary
                        ? "2px solid #f97316"
                        : isSecond
                        ? "2px solid #fbbf24"
                        : "1px solid #4a2610",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{ position: "relative", aspectRatio: "1/1", background: "#090d16", cursor: "pointer" }}
                      onClick={() => setLightboxAsset(asset)}
                    >
                      <img
                        src={asset.url}
                        alt={asset.label}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {(isPrimary || isSecond) && (
                        <span
                          style={{
                            position: "absolute",
                            top: 6,
                            left: 6,
                            padding: "2px 7px",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 800,
                            background: isPrimary ? "#ea580c" : "#d97706",
                            color: "#ffffff",
                          }}
                        >
                          {isPrimary ? "KREACJA A" : "KREACJA B"}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#ffedd5",
                          fontWeight: 600,
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {asset.label}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: "auto" }}>
                        <button
                          type="button"
                          onClick={() =>
                            activeAngle && void assignImageToAngles([activeAngle.id], asset, `Antek #${activeAngle.number}`, 1)
                          }
                          style={{
                            flex: 1,
                            padding: "4px 6px",
                            borderRadius: 5,
                            border: 0,
                            background: isPrimary ? "#ea580c" : "#3b1d0a",
                            color: "#ffffff",
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {isPrimary ? "✓ Aktywne" : "Ustaw zdjęcie"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTER & BATCH SELECTOR BAR (PO BATCHACH I DNIACH) */}
        <div
          style={{
            marginTop: 14,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#241207",
            border: "1px solid #4a2610",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* ROW 1: 5 BATCH PILLS (CHRONOLOGICAL NEWEST -> OLDEST) + FANPAGE + SEARCH */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => {
                  setStageFilter("all");
                  const first = presets.find(p => p.number === 102);
                  if (first) setActiveAngleId(first.id);
                }}
                style={{
                  padding: "7px 13px",
                  borderRadius: 8,
                  border: stageFilter === "all" ? "1px solid #fb923c" : "1px solid #4a2610",
                  background: stageFilter === "all" ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "#160b04",
                  color: stageFilter === "all" ? "#ffffff" : "#fdba74",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: stageFilter === "all" ? "0 2px 10px rgba(234, 88, 12, 0.35)" : "none",
                }}
              >
                📚 Wszystkie Batche ({presets.length || 105})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageFilter("batch6_noom");
                  const first = presets.find(p => p.number === 102);
                  if (first) setActiveAngleId(first.id);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: stageFilter === "batch6_noom" ? "1px solid #34d399" : "1px solid #4a2610",
                  background:
                    stageFilter === "batch6_noom"
                      ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                      : "#160b04",
                  color: stageFilter === "batch6_noom" ? "#ffffff" : "#a7f3d0",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: stageFilter === "batch6_noom" ? "0 2px 10px rgba(16, 185, 129, 0.35)" : "none",
                }}
              >
                🔥 Batch 6 · 02.11: NOOM / KRYSTYNA A/B (4 · #102–#105)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageFilter("batch5_sport");
                  const first = presets.find(p => p.number === 82);
                  if (first) setActiveAngleId(first.id);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: stageFilter === "batch5_sport" ? "1px solid #4ade80" : "1px solid #4a2610",
                  background:
                    stageFilter === "batch5_sport"
                      ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                      : "#160b04",
                  color: stageFilter === "batch5_sport" ? "#ffffff" : "#bbf7d0",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: stageFilter === "batch5_sport" ? "0 2px 10px rgba(22, 163, 74, 0.35)" : "none",
                }}
              >
                🏔️ Batch 5 · 01.11: SPORT & AKTYWNI (20 · #82–#101)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageFilter("batch4_testpack");
                  const first = presets.find(p => p.number === 76);
                  if (first) setActiveAngleId(first.id);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border:
                    stageFilter === "batch4_testpack" || stageFilter === "anti_sales_allegro"
                      ? "1px solid #fb923c"
                      : "1px solid #4a2610",
                  background:
                    stageFilter === "batch4_testpack" || stageFilter === "anti_sales_allegro"
                      ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                      : "#160b04",
                  color:
                    stageFilter === "batch4_testpack" || stageFilter === "anti_sales_allegro"
                      ? "#ffffff"
                      : "#fed7aa",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow:
                    stageFilter === "batch4_testpack" || stageFilter === "anti_sales_allegro"
                      ? "0 2px 10px rgba(234, 88, 12, 0.35)"
                      : "none",
                }}
              >
                👎 Batch 4 · 01.11: TEST PACK (6 · #76–#81)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageFilter("batch3_zal_v2");
                  const first = presets.find(p => p.number === 71);
                  if (first) setActiveAngleId(first.id);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: stageFilter === "batch3_zal_v2" ? "1px solid #f87171" : "1px solid #4a2610",
                  background:
                    stageFilter === "batch3_zal_v2"
                      ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                      : "#160b04",
                  color: stageFilter === "batch3_zal_v2" ? "#ffffff" : "#fecaca",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: stageFilter === "batch3_zal_v2" ? "0 2px 10px rgba(220, 38, 38, 0.35)" : "none",
                }}
              >
                🔥 Batch 3 · 29.10: ŻAL V2 (5 · #71–#75)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageFilter("dorosli_35");
                  const first = presets.find(p => p.number === 36);
                  if (first) setActiveAngleId(first.id);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: stageFilter.startsWith("dorosli_") ? "1px solid #fb923c" : "1px solid #4a2610",
                  background: stageFilter.startsWith("dorosli_")
                    ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                    : "#160b04",
                  color: stageFilter.startsWith("dorosli_") ? "#ffffff" : "#fed7aa",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: stageFilter.startsWith("dorosli_") ? "0 2px 10px rgba(234, 88, 12, 0.35)" : "none",
                }}
              >
                👩 Batch 2 · 23.10: DOROŚLI 35 (#36–#70)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStageFilter("all_kids");
                  const first = presets.find(p => p.number === 1);
                  if (first) setActiveAngleId(first.id);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: stageFilter === "all_kids" ? "1px solid #38bdf8" : "1px solid #4a2610",
                  background:
                    stageFilter === "all_kids"
                      ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                      : "#160b04",
                  color: stageFilter === "all_kids" ? "#ffffff" : "#bae6fd",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: stageFilter === "all_kids" ? "0 2px 10px rgba(2, 132, 199, 0.35)" : "none",
                }}
              >
                👶 Batch 1 · 20.10: DZIECI CC35 (35 · #1–#35)
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <select
                value={selectedPageId}
                onChange={e => handleSelectFanpage(e.target.value)}
                style={{
                  padding: "7px 11px",
                  borderRadius: 8,
                  border: "1px solid #4a2610",
                  background: "#160b04",
                  color: "#ffedd5",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {AVAILABLE_META_FANPAGES.map(fp => (
                  <option key={fp.id} value={fp.id}>
                    Fanpage: {fp.name} ({fp.note})
                  </option>
                ))}
              </select>

              <input
                type="search"
                placeholder="Szukaj kąta, hooka, #82, D01..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid #4a2610",
                  background: "#160b04",
                  color: "#f8fafc",
                  fontSize: 12.5,
                  minWidth: 230,
                }}
              />
            </div>
          </div>

          {/* ROW 2: DAY CALENDAR FILTER PILLS & SORT ORDER (ZERO MESSY CATEGORIES) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fb923c", marginRight: 4 }}>
                🗓️ FILTR PO DNIACH:
              </span>
              {(
                [
                  { id: "all", label: "Wszystkie dni (105)", firstNum: 102 },
                  { id: "day_02_11", label: "📅 02.11.2026 · Dzisiaj (4 szt. · Batch 6 NOOM Krystyna #102–#105)", firstNum: 102 },
                  { id: "day_01_11", label: "📅 01.11.2026 (26 szt. · Batch 5 Sport + Batch 4 Test Pack)", firstNum: 82 },
                  { id: "day_29_10", label: "📅 29.10.2026 (5 szt. · Batch 3 Żal V2 #71–#75)", firstNum: 71 },
                  { id: "day_23_10", label: "📅 23.10.2026 (35 szt. · Batch 2 Dorośli #36–#70)", firstNum: 36 },
                  { id: "day_20_10", label: "📅 20.10.2026 (35 szt. · Batch 1 Dzieci #1–#35)", firstNum: 1 },
                ] as const
              ).map(dayItem => {
                const active = stageFilter === dayItem.id;
                return (
                  <button
                    key={dayItem.id}
                    type="button"
                    onClick={() => {
                      setStageFilter(dayItem.id);
                      const first = presets.find(p => p.number === dayItem.firstNum);
                      if (first) setActiveAngleId(first.id);
                    }}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 7,
                      border: active ? "1px solid #fb923c" : "1px solid #3b1d0a",
                      background: active ? "rgba(234, 88, 12, 0.28)" : "#160b04",
                      color: active ? "#ffffff" : "#fdba74",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {dayItem.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fb923c" }}>SORTOWANIE:</span>
              {(
                [
                  { key: "newest", label: "🕒 Od najnowszych (Batch 6 → 1)" },
                  { key: "oldest", label: "📅 Od najstarszych (Batch 1 → 6)" },
                  { key: "days", label: "🗓️ Kalendarz Dni" },
                ] as const
              ).map(opt => {
                const active = sidebarSort === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSidebarSort(opt.key)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 7,
                      border: active ? "1px solid #f97316" : "1px solid #3b1d0a",
                      background: active ? "rgba(234, 88, 12, 0.28)" : "#160b04",
                      color: active ? "#ffffff" : "#fdba74",
                      fontSize: 11,
                      fontWeight: active ? 800 : 600,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN 3-COLUMN WORKSPACE (IDENTICAL 1:1 LAYOUT TO FELIORA PL, BRAND ORANGE THEME) */}
      <div
        style={{
          marginTop: 10,
          borderTop: "1px solid #4a2610",
          display: "grid",
          gridTemplateColumns: "320px minmax(420px, 600px) minmax(440px, 1fr)",
          alignItems: "start",
          flex: 1,
          minHeight: "calc(100vh - 135px)",
        }}
      >
        {/* LEFT COLUMN: SORTED & GROUPED LIST OF 105 ANGLES BY BATCH & DAY */}
        <aside
          style={{
            borderRight: "1px solid #4a2610",
            background: "#160b04",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            maxHeight: "100vh",
            overflowY: "auto",
            paddingBottom: 120,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #4a2610",
              display: "flex",
              flexDirection: "column",
              gap: 7,
              background: "#241207",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#ffedd5" }}>
                ANTKI WG BATCHY ({filteredPresets.length} / {presets.length || 105})
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setSelectedIds(filteredPresets.map(p => p.id))}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #5c2d10",
                    background: "#361b0b",
                    color: "#fdba74",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {selectedIds.length > 0 ? `Zaznaczono (${selectedIds.length})` : "Zaznacz wszystkie"}
                </button>
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #5c2d10",
                      background: "#241207",
                      color: "#fca5a5",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    Wyczyść
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(
                [
                  { key: "newest", label: "🕒 Najnowsze Batche" },
                  { key: "oldest", label: "📅 Najstarsze Batche" },
                  { key: "days", label: "🗓️ Po Dniach" },
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
                      padding: "4px 6px",
                      borderRadius: 6,
                      border: active ? "1px solid #f97316" : "1px solid #5c2d10",
                      background: active ? "rgba(234, 88, 12, 0.25)" : "#160b04",
                      color: active ? "#ffedd5" : "#fdba74",
                      fontSize: 10.5,
                      fontWeight: active ? 800 : 600,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 14 }}>
            {loading && (
              <div style={{ padding: 24, textAlign: "center", color: "#fdba74", fontSize: 13 }}>
                Ładowanie 105 polskich Antków Orthomax StepMax...
              </div>
            )}
            {groupedPresetsForSidebar.map(group => (
              <div key={group.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    padding: "6px 9px",
                    borderRadius: 7,
                    background: "rgba(234, 88, 12, 0.16)",
                    borderLeft: `4px solid ${group.color}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fb923c", textTransform: "uppercase" }}>
                    {group.badge}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#ffedd5" }}>{group.label}</div>
                </div>

                {group.items.map(angle => {
                  const isActive = angle.id === activeAngleId;
                  const isChecked = selectedIds.includes(angle.id);
                  const ad = adByAngleId[angle.id];
                  const words = ad?.wordCount || (ad?.primaryText ? ad.primaryText.trim().split(/\s+/).length : 0);
                  const status = statuses[angle.id] || "idle";
                  const dateShort =
                    angle.number >= 102
                      ? "02.11"
                      : angle.number >= 76
                      ? "01.11"
                      : angle.number >= 71
                      ? "29.10"
                      : angle.number >= 36
                      ? "23.10"
                      : angle.number >= 1
                      ? "20.10"
                      : formatAntekShortDate(ad?.updatedAt || ad?.createdAt);
                  const batchTag =
                    angle.number >= 102
                      ? "🔥 Batch 6 · NOOM Krystyna (02.11)"
                      : angle.number >= 82
                      ? "🏔️ Batch 5 · Sport (01.11)"
                      : angle.number >= 76
                      ? "👎 Batch 4 · Test Pack (01.11)"
                      : angle.number >= 71
                      ? "🔥 Batch 3 · Żal V2 (29.10)"
                      : angle.number >= 36
                      ? "👩 Batch 2 · Dorośli (23.10)"
                      : "👶 Batch 1 · Dzieci (20.10)";

                  return (
                    <div
                      key={angle.id}
                      id={`antek-card-${angle.id}`}
                      onClick={() => setActiveAngleId(angle.id)}
                      style={{
                        padding: "9px 10px",
                        borderRadius: 9,
                        background: isActive ? "rgba(234, 88, 12, 0.24)" : "#1f0f05",
                        border: isActive ? "2px solid #f97316" : "1px solid #3b1d0a",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              e.stopPropagation();
                              setSelectedIds(prev =>
                                prev.includes(angle.id) ? prev.filter(x => x !== angle.id) : [...prev, angle.id],
                              );
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{ cursor: "pointer", width: 13, height: 13 }}
                          />
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: "1px 6px",
                              borderRadius: 4,
                              background: group.color,
                              color: "#ffffff",
                            }}
                          >
                            #{String(angle.number).padStart(2, "0")}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 5px",
                              borderRadius: 4,
                              background: "#160b04",
                              color: "#fcd34d",
                              border: "1px solid rgba(251, 191, 36, 0.3)",
                            }}
                          >
                            📅 {dateShort}
                          </span>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 4,
                              background: "#261308",
                              color: "#fed7aa",
                              border: "1px solid #5c2d10",
                            }}
                          >
                            {angle.narrator}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: status === "generating" ? "#fbbf24" : words >= 1150 ? "#34d399" : "#fdba74",
                          }}
                        >
                          {status === "generating" ? "⏳..." : `${words} sł. ✓`}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: isActive ? "#ffffff" : "#ffedd5",
                          lineHeight: 1.3,
                        }}
                      >
                        {angle.title}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#fed7aa",
                            background: "rgba(249, 115, 22, 0.14)",
                            border: "1px solid rgba(249, 115, 22, 0.35)",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {batchTag}
                        </span>
                        {ad?.secondImageUrl && (
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: "#fde68a",
                              background: "rgba(217, 119, 6, 0.25)",
                              padding: "1px 5px",
                              borderRadius: 4,
                            }}
                          >
                            A/B 2 ZDJĘCIA
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER COLUMN: COMPACT BAR + CLEAN WHITE PAPER READER (SCROLLS NATURALLY) */}
        <main
          style={{
            background: "#140a04",
            minHeight: "calc(100vh - 135px)",
            padding: "12px 16px 200px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {activeAngle && (
            <>
              {/* COMPACT CONTROL BAR (SCROLLS AWAY WHEN READING) */}
              <div
                style={{
                  background: "#241207",
                  border: "1px solid #4a2610",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: 11,
                        padding: "3px 7px",
                        borderRadius: 5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{String(activeAngle.number).padStart(2, "0")} · {activeAngle.code.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={activeAngle.title}
                    >
                      {activeAngle.title}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => cycleActiveCopy(-1)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #4a2610",
                        background: "#160b04",
                        color: "#fed7aa",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => cycleActiveCopy(1)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #4a2610",
                        background: "#160b04",
                        color: "#fed7aa",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAngleDetails(prev => !prev)}
                      style={{
                        background: showAngleDetails ? "#3b1d0a" : "#160b04",
                        color: "#fdba74",
                        border: "1px solid #5c2d10",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {showAngleDetails ? "▲ Ukryj Scenę / Hook" : "▼ Pokaż Scenę / Hook"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingCopy(prev => !prev)}
                      style={{
                        padding: "4px 9px",
                        borderRadius: 6,
                        border: "1px solid #f97316",
                        background: isEditingCopy ? "#ea580c" : "#160b04",
                        color: "#ffffff",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {isEditingCopy ? "📖 Czytaj" : "✏️ Edytuj"}
                    </button>

                    <button
                      type="button"
                      disabled={statuses[activeAngle.id] === "generating"}
                      onClick={() => void generateSingleAngle(activeAngle.id)}
                      style={{
                        padding: "4px 9px",
                        borderRadius: 6,
                        border: "1px solid #fb923c",
                        background: "rgba(249, 115, 22, 0.2)",
                        color: "#ffedd5",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {statuses[activeAngle.id] === "generating" ? "⏳..." : "✨ AI"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(editPrimaryText || activeAd?.primaryText || "");
                        setNotice(`Skopiowano tekst kąta #${activeAngle.number} do schowka.`);
                      }}
                      style={{
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      📋 Kopiuj ({activeWordCount} sł.)
                    </button>

                    {editDirty && (
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => void saveEditedAd()}
                        style={{
                          background: "#f59e0b",
                          color: "#0f172a",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {savingEdit ? "..." : "💾 Zapisz"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Compact Headline Input + LP Input */}
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fdba74", whiteSpace: "nowrap" }}>Nagłówek:</span>
                    <input
                      type="text"
                      value={editHeadline}
                      onChange={e => {
                        setEditHeadline(e.target.value);
                        setEditDirty(true);
                      }}
                      style={{
                        width: "100%",
                        background: "#160b04",
                        color: "#ffffff",
                        border: "1px solid #4a2610",
                        borderRadius: 6,
                        padding: "5px 8px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={destinationUrl}
                    onChange={e => setDestinationUrl(e.target.value)}
                    placeholder="Destination LP URL"
                    style={{
                      width: "100%",
                      background: "#160b04",
                      color: "#fb923c",
                      border: "1px solid #4a2610",
                      borderRadius: 6,
                      padding: "5px 8px",
                      fontSize: 11.5,
                    }}
                  />
                </div>

                {/* Collapsible Scene / Hook details */}
                {showAngleDetails && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      paddingTop: 6,
                      borderTop: "1px solid #4a2610",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ color: "#ffedd5" }}>
                      <strong style={{ color: "#fb923c" }}>🎬 Scena:</strong> {activeAngle.sceneBeat}
                    </div>
                    <div style={{ color: "#fde68a" }}>
                      <strong>💸 Matematyka:</strong> {activeAngle.failedSolutionsMath}
                    </div>
                    <div style={{ color: "#fed7aa" }}>
                      <strong>🌉 Most:</strong> {activeAngle.discoveryBridge}
                    </div>
                    <div
                      style={{
                        background: "rgba(245, 158, 11, 0.12)",
                        border: "1px solid rgba(245, 158, 11, 0.35)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        color: "#fef3c7",
                        fontWeight: 600,
                      }}
                    >
                      ⚡ Hook: {activeAngle.hookIdea}
                    </div>
                  </div>
                )}
              </div>

              {/* BODY: CLEAN WHITE PAPER READER OR FULL TEXTAREA EDITOR (1:1 FELIORA STYLE) */}
              {!isEditingCopy ? (
                <article
                  onClick={() => setIsEditingCopy(true)}
                  title="Kliknij w tekst, aby przejść do edycji"
                  style={{
                    background: "#ffffff",
                    color: "#0f172a",
                    borderRadius: 12,
                    padding: "20px 24px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                    width: "100%",
                    cursor: "text",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {activeFanpageMeta.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{pageName}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          Sponsorowane · {activeAngle.narrator} · {activeAngle.awarenessStage}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {(editPrimaryText || activeAd?.primaryText || "").split(/\n\s*\n/).filter(Boolean).length} akapitów ·{" "}
                      {activeWordCount} słów ✓
                    </span>
                  </div>

                  {/* Crisp High-Contrast Paragraphs with P.S. Highlight */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    {(editPrimaryText || activeAd?.primaryText || "")
                      .split(/\n\s*\n/)
                      .map(p => p.trim())
                      .filter(Boolean)
                      .map((para, idx) => {
                        const isPs = /^P\.+S\./.test(para);
                        return (
                          <p
                            key={idx}
                            style={{
                              margin: 0,
                              fontSize: 15,
                              lineHeight: 1.62,
                              color: "#1e293b",
                              fontWeight: idx === 0 || isPs ? 700 : 400,
                              background: idx === 0 ? "#fef3c7" : isPs ? "#fff7ed" : "transparent",
                              borderLeft: isPs ? "3px solid #f97316" : "none",
                              padding: idx === 0 ? "8px 12px" : isPs ? "6px 10px" : 0,
                              borderRadius: idx === 0 || isPs ? 7 : 0,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {para}
                          </p>
                        );
                      })}
                  </div>
                </article>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    value={editPrimaryText}
                    onChange={e => {
                      setEditPrimaryText(e.target.value);
                      setEditDirty(true);
                    }}
                    rows={32}
                    style={{
                      width: "100%",
                      background: "#ffffff",
                      color: "#0f172a",
                      border: "2px solid #f97316",
                      borderRadius: 12,
                      padding: 18,
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* RIGHT COLUMN: ENLARGED CREATIVE A/B + 10 SHIT IMAGES KIE.AI + CONNECTED OLD PHOTO LIBRARY + FB PREVIEW */}
        <aside
          style={{
            borderLeft: "1px solid #4a2610",
            background: "#160b04",
            position: "sticky",
            top: 0,
            maxHeight: "100vh",
            overflowY: "auto",
            padding: "16px 16px 120px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {activeAngle && (
            <>
              <div
                style={{
                  background: "#241207",
                  border: "1px solid #4a2610",
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "#ffedd5", textTransform: "uppercase" }}>
                    🖼️ Kreacje do Kąta #{activeAngle.number} (Kliknij zdjęcie, aby powiększyć 🔍)
                  </span>
                  <button
                    type="button"
                    onClick={() => customImageInputRef.current?.click()}
                    disabled={uploadingCustomImage}
                    style={{
                      background: "#361b0b",
                      color: "#fdba74",
                      border: "1px solid #f97316",
                      borderRadius: 6,
                      padding: "4px 9px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {uploadingCustomImage ? "Wgrywanie..." : "+ Wgraj własne"}
                  </button>
                </div>

                {/* KIE.AI 12 RAW IPHONE 3:4 NHS-STYLE PHOTOS BUTTON */}
                <button
                  type="button"
                  disabled={generatingKie5AngleId === activeAngle.id}
                  onClick={() => void handleGenerate5KieImagesForActiveAngle()}
                  style={{
                    width: "100%",
                    background:
                      generatingKie5AngleId === activeAngle.id
                        ? "#431407"
                        : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    color: "#ffffff",
                    border: "1px solid #fb923c",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: generatingKie5AngleId === activeAngle.id ? "wait" : "pointer",
                    textAlign: "center",
                    boxShadow: "0 2px 10px rgba(234, 88, 12, 0.35)",
                  }}
                >
                  {generatingKie5AngleId === activeAngle.id
                    ? `⏳ Generuję 12 zdjęć Raw iPhone 3:4 (2K Google AI · styl NHS) z treści Antka #${activeAngle.number}...`
                    : `📸 Generuj 12 zdjęć Raw iPhone 3:4 pod ten kąt (2K Google AI · styl NHS z całego skryptu)`}
                </button>

                {/* LIVE 12 KIE.AI TASKS STATUS IF PRESENT */}
                {kieTasksByAngle[activeAngle.id] && kieTasksByAngle[activeAngle.id].length > 0 && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: "#160b04",
                      border: "1px solid #5c2d10",
                    }}
                  >
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#fdba74", marginBottom: 8 }}>
                      📸 12 zdjęć Raw iPhone 3:4 (styl NHS) z Kie.ai dla Antka #{activeAngle.number}:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                      {kieTasksByAngle[activeAngle.id].map(task => (
                        <div
                          key={task.taskId}
                          style={{
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#241207",
                            border: "1px solid #4a2610",
                            padding: 4,
                            fontSize: 10,
                          }}
                        >
                          {task.state === "success" && task.asset ? (
                            <>
                              <img
                                src={task.asset.url}
                                alt={task.label}
                                onClick={() => setLightboxAsset(task.asset!)}
                                style={{
                                  width: "100%",
                                  aspectRatio: "3 / 4",
                                  objectFit: "cover",
                                  objectPosition: "top center",
                                  borderRadius: 5,
                                  cursor: "zoom-in",
                                }}
                              />
                              <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void assignImageToAngles([activeAngle.id], task.asset!, `Antek #${activeAngle.number}`, 1)
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "2px 0",
                                    fontSize: 9.5,
                                    fontWeight: 800,
                                    background: "#ea580c",
                                    color: "#fff",
                                    border: 0,
                                    borderRadius: 4,
                                    cursor: "pointer",
                                  }}
                                >
                                  Ustaw
                                </button>
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                aspectRatio: "1 / 1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                color: task.state === "fail" ? "#fca5a5" : "#fdba74",
                                padding: 4,
                              }}
                            >
                              {task.state === "fail" ? "Błąd" : "⏳ Kie.ai..."}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SINGLE 1:1 DEDICATED IMAGE PREVIEW (ZERO SPLIT A/B) */}
                <div
                  style={{
                    background: "#160b04",
                    border: "2px solid #f97316",
                    borderRadius: 10,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#fb923c" }}>
                      📸 Dedykowane zdjęcie 1:1 (Antek #{activeAngle.number})
                    </span>
                    {activeResolvedImage && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setLightboxAsset(activeResolvedImage);
                        }}
                        style={{
                          background: "rgba(249, 115, 22, 0.18)",
                          color: "#fdba74",
                          border: "1px solid rgba(249, 115, 22, 0.45)",
                          borderRadius: 5,
                          padding: "3px 9px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🔍 Powiększ
                      </button>
                    )}
                  </div>
                  {activeResolvedImage && (
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        setLightboxAsset(activeResolvedImage);
                      }}
                      title="Kliknij, aby powiększyć na cały ekran"
                      style={{ position: "relative", cursor: "zoom-in" }}
                    >
                      <img
                        src={activeResolvedImage.url}
                        alt={activeResolvedImage.label}
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                          borderRadius: 8,
                          background: "#261308",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "#ffedd5",
                      fontWeight: 600,
                      lineHeight: 1.35,
                    }}
                  >
                    {activeResolvedImage?.label}
                  </div>
                </div>

                {/* CONNECTED PHOTO LIBRARY WITH FILTER TABS (STARE ZDJĘCIA Z META + SUROWE KIE.AI + WŁASNE) */}
                <div
                  style={{
                    background: "#160b04",
                    border: "1px solid #4a2610",
                    borderRadius: 10,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: "#fdba74" }}>
                      📚 Biblioteka Zdjęć ({filteredGalleryImages.length} szt. · Kliknij zdjęcie = Powiększ 🔍):
                    </span>
                    <button
                      type="button"
                      disabled={savingImages}
                      onClick={() => void handleSaveImages()}
                      style={{
                        padding: "3px 9px",
                        borderRadius: 6,
                        border: 0,
                        background: imagesSavedFlash ? "#16a34a" : "#ea580c",
                        color: "#ffffff",
                        fontSize: 10.5,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {savingImages ? "Zapisuję..." : imagesSavedFlash ? "✓ Zapisano!" : "💾 Zapisz wybór"}
                    </button>
                  </div>

                  {/* Filter tabs: FIRST = Pod to copy (#XX) | Wszystkie | Stare Zdjęcia z Meta | Surowe Kie.ai | Własne */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(
                      [
                        {
                          id: "for_angle",
                          label: `🎯 Pod to copy #${activeAngle.number} (${forAngleImages.length}${
                            (kieTasksByAngle[activeAngle.id] || []).some(t => t.state === "generating") ? " ⏳" : ""
                          })`,
                        },
                        { id: "all", label: `Wszystkie (${imageLibrary.length})` },
                        { id: "meta", label: `📚 Stare z Meta (${metaImagesCount})` },
                        { id: "ai", label: `📸 Surowe Kie.ai (${aiImagesCount})` },
                        { id: "custom", label: `Własne (${customImagesCount})` },
                      ] as const
                    ).map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setGalleryTab(tab.id)}
                        style={{
                          padding: "4px 9px",
                          borderRadius: 6,
                          border: galleryTab === tab.id ? "1px solid #fb923c" : "1px solid #3b1d0a",
                          background: galleryTab === tab.id ? "#ea580c" : "#241207",
                          color: galleryTab === tab.id ? "#ffffff" : "#fed7aa",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 3-Column Enlarged Photo Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    {filteredGalleryImages.map(asset => {
                      const isA = activeResolvedImage?.url === asset.url;
                      return (
                        <div
                          key={asset.id}
                          style={{
                            position: "relative",
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#241207",
                            border: isA ? "2px solid #f97316" : "1px solid #4a2610",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            onClick={() => setLightboxAsset(asset)}
                            title={`${asset.label} — Kliknij, aby powiększyć na cały ekran`}
                            style={{ position: "relative", cursor: "zoom-in" }}
                          >
                            <img
                              src={asset.url}
                              alt={asset.label}
                              style={{
                                width: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: asset.source === "meta" ? "rgba(2, 132, 199, 0.88)" : "rgba(0,0,0,0.72)",
                                color: "#fff",
                                fontSize: 9.5,
                                fontWeight: 800,
                                padding: "2px 5px",
                                borderRadius: 4,
                              }}
                            >
                              {asset.source === "meta" ? "📚 META" : "🔍"}
                            </span>
                            {isA && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  padding: "2px 5px",
                                  borderRadius: 4,
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  background: "#ea580c",
                                  color: "#ffffff",
                                }}
                              >
                                ✓ AKTYWNE
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              padding: "5px 6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                              flex: 1,
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "#ffedd5",
                                lineHeight: 1.25,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                              title={asset.label}
                            >
                              {asset.label}
                            </div>
                            <button
                              type="button"
                              onClick={() => void assignImageToAngles([activeAngle.id], asset, `Antek #${activeAngle.number}`, 1)}
                              style={{
                                width: "100%",
                                padding: "4px 0",
                                borderRadius: 4,
                                border: 0,
                                background: isA ? "#ea580c" : "#361b0b",
                                color: "#ffffff",
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {isA ? "✓ Aktywne zdjęcie" : "Ustaw zdjęcie"}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Live Kie.ai generating cards inside 'for_angle' tab */}
                    {galleryTab === "for_angle" &&
                      (kieTasksByAngle[activeAngle.id] || [])
                        .filter(task => task.state !== "success")
                        .map(task => (
                          <div
                            key={task.taskId}
                            style={{
                              borderRadius: 8,
                              overflow: "hidden",
                              background: "#241207",
                              border: "1px dashed #ea580c",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                aspectRatio: "3 / 4",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 8,
                                textAlign: "center",
                                color: task.state === "fail" ? "#fca5a5" : "#fdba74",
                                fontSize: 11,
                                fontWeight: 700,
                                background: "#1a0c04",
                              }}
                            >
                              {task.state === "fail" ? "⚠️ Błąd Kie.ai" : "⏳ Generuję w Kie.ai..."}
                            </div>
                            <div style={{ padding: "5px 6px", fontSize: 10, color: "#fed7aa", lineHeight: 1.25 }}>
                              {task.label}
                            </div>
                          </div>
                        ))}
                  </div>

                  {galleryTab === "for_angle" &&
                    filteredGalleryImages.length === 0 &&
                    (kieTasksByAngle[activeAngle.id] || []).length === 0 && (
                      <div
                        onClick={() => void handleGenerate5KieImagesForActiveAngle()}
                        style={{
                          padding: "14px 12px",
                          borderRadius: 8,
                          background: "#241207",
                          border: "1px dashed #ea580c",
                          color: "#fed7aa",
                          fontSize: 11.5,
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        📸 Kliknij tutaj, aby wygenerować 12 zdjęć Raw iPhone 3:4 (2K Google AI · styl NHS) z treści Antka #{activeAngle.number}
                      </div>
                    )}
                </div>
              </div>

              {/* REALISTIC FACEBOOK FEED PREVIEW */}
              <div
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid #4a2610",
                  boxShadow: "0 8px 26px rgba(0, 0, 0, 0.35)",
                }}
              >
                <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {activeFanpageMeta.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{pageName}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Sponsorowane · 🌍</div>
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "#fff7ed",
                      color: "#ea580c",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    Podgląd FB Feed
                  </span>
                </div>

                <div style={{ padding: "0 14px 10px", fontSize: 13.5, lineHeight: 1.48, color: "#0f172a", whiteSpace: "pre-line" }}>
                  {(editPrimaryText || activeAd?.primaryText || "").slice(0, 290)}
                  {(editPrimaryText || activeAd?.primaryText || "").length > 290 && (
                    <span
                      onClick={() => setIsEditingCopy(false)}
                      style={{ color: "#64748b", fontWeight: 600, cursor: "pointer" }}
                    >
                      ... Wyświetl więcej
                    </span>
                  )}
                </div>

                {activeResolvedImage && (
                  <div
                    onClick={() => setLightboxAsset(activeResolvedImage)}
                    style={{ aspectRatio: "1/1", background: "#090d16", cursor: "zoom-in" }}
                  >
                    <img
                      src={activeResolvedImage.url}
                      alt={activeResolvedImage.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}

                <div
                  style={{
                    padding: "10px 14px",
                    background: "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, color: "#64748b", textTransform: "uppercase" }}>ORTHOMAX.PL</div>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {editHeadline || activeAngle.defaultHeadline}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "7px 12px",
                      borderRadius: 6,
                      background: "#e2e8f0",
                      color: "#0f172a",
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Więcej informacji
                  </span>
                </div>
              </div>

              {/* META ADS SYNC BOX */}
              <div
                style={{
                  background: "#241207",
                  borderRadius: 14,
                  border: "1px solid #5c2d10",
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#ffedd5", marginBottom: 4 }}>
                  🚀 Eksport i Synchronizacja z Meta Ads (1109284831182252)
                </div>
                <div style={{ fontSize: 11.5, color: "#fdba74", marginBottom: 10 }}>
                  Kampania: <strong>{isDorosliBatchView ? "ANTKI DOROSLI CC30 (7 Ad Setów D1–D7)" : "ANTKI CC35 (7 Ad Setów Dzieci)"}</strong> · Wszystkie reklamy jako <strong>PAUSED</strong>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={syncingMetaCc35}
                    onClick={() => void syncToMetaCc35()}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 9,
                      border: 0,
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: syncingMetaCc35 ? "wait" : "pointer",
                      boxShadow: "0 4px 12px rgba(234, 88, 12, 0.35)",
                    }}
                  >
                    {syncingMetaCc35
                      ? "⏳ Synchronizuję z Meta Ads..."
                      : `☁️ Zsynchronizuj ${isDorosliBatchView ? "Batch 2 Dorośli" : "Batch 1 Dzieci"} w Meta (PAUSED)`}
                  </button>
                  <button
                    type="button"
                    onClick={exportUploaderJson}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 9,
                      border: "1px solid #f97316",
                      background: "#160b04",
                      color: "#fed7aa",
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                  >
                    ⬇ JSON ({readyAdsForExport.length})
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxAsset && (
        <div
          onClick={() => setLightboxAsset(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.86)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 720,
              width: "100%",
              background: "#241207",
              borderRadius: 16,
              border: "1px solid #f97316",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            <img
              src={lightboxAsset.url}
              alt={lightboxAsset.label}
              style={{ width: "100%", maxHeight: "72vh", objectFit: "contain", background: "#000", display: "block" }}
            />
            <div style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ffedd5" }}>{lightboxAsset.label}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {activeAngle && (
                  <button
                    type="button"
                    onClick={() => {
                      void assignImageToAngles([activeAngle.id], lightboxAsset, `Antek #${activeAngle.number}`, 1);
                      setLightboxAsset(null);
                    }}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 7,
                      border: 0,
                      background: "#ea580c",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✓ Ustaw to zdjęcie
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxAsset(null)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 7,
                    border: "1px solid #4a2610",
                    background: "#160b04",
                    color: "#fed7aa",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ANGLE MODAL */}
      {showCustomModal && (
        <div
          onClick={() => setShowCustomModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={handleGenerateCustomAngle}
            style={{
              width: "100%",
              maxWidth: 620,
              background: "#241207",
              borderRadius: 16,
              border: "1px solid #f97316",
              padding: 22,
              display: "grid",
              gap: 12,
              color: "#f8fafc",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#ffedd5" }}>
              + Dodaj własny kąt / Hook (Orthomax StepMax)
            </h3>
            <input
              required
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              placeholder="Tytuł kąta (np. D36: Ból pięty po zmianie w piekarni)"
              style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid #4a2610", background: "#160b04", color: "#fff" }}
            />
            <textarea
              required
              rows={3}
              value={customHook}
              onChange={e => setCustomHook(e.target.value)}
              placeholder="Hook otwierający (pierwsze 2–3 zdania historii)"
              style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid #4a2610", background: "#160b04", color: "#fff" }}
            />
            <textarea
              rows={2}
              value={customScene}
              onChange={e => setCustomScene(e.target.value)}
              placeholder="Scena i sytuacja z życia"
              style={{ padding: "8px 11px", borderRadius: 8, border: "1px solid #4a2610", background: "#160b04", color: "#fff" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #4a2610", background: "#160b04", color: "#fed7aa", cursor: "pointer" }}
              >
                Anuluj
              </button>
              <button
                type="submit"
                style={{ padding: "8px 16px", borderRadius: 8, border: 0, background: "#ea580c", color: "#ffffff", fontWeight: 800, cursor: "pointer" }}
              >
                Wygeneruj nowy Antek
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
