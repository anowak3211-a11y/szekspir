'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  'stage1_batch1_winner_desire',
  'stage2_new_desire_a',
  'stage3_new_desire_b',
  'stage4_new_desire_c',
];

interface SardianPlWorkspaceProps {
  onSwitchToStryde?: () => void;
  onSwitchToFeliora?: () => void;
  onSwitchToFelioraPies?: () => void;
  onSwitchToOrthomax?: () => void;
}

export default function SardianPlWorkspace({
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

  // Filtering
  const [stageFilter, setStageFilter] = useState<'all' | SardianAwarenessStageId>('all');
  const [clusterFilter, setClusterFilter] = useState<'all' | SardianProblemCluster>('all');
  const [fanpageFilter, setFanpageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active angle & Selection
  const [activeAngleId, setActiveAngleId] = useState<string>('sardian_k2_v1');
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

  // Image Picker Modal
  const [showImagePicker, setShowImagePicker] = useState(false);
  const customFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{
                padding: '8px 14px',
                borderRadius: 9,
                border: '2px solid #f59e0b',
                background: 'linear-gradient(135deg, #b45309, #78350f)',
                color: '#fffbeb',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'default',
              }}
            >
              🦁 SARDIAN PL (38)
            </button>
            {onSwitchToStryde && (
              <button
                type="button"
                onClick={onSwitchToStryde}
                style={{
                  padding: '8px 12px',
                  borderRadius: 9,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#cbd5e1',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                🦶 STRYDE PL (25)
              </button>
            )}
            {onSwitchToFeliora && (
              <button
                type="button"
                onClick={onSwitchToFeliora}
                style={{
                  padding: '8px 12px',
                  borderRadius: 9,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#cbd5e1',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                🐱 FELIORA KOTY (25)
              </button>
            )}
            {onSwitchToFelioraPies && (
              <button
                type="button"
                onClick={onSwitchToFelioraPies}
                style={{
                  padding: '8px 12px',
                  borderRadius: 9,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#cbd5e1',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                🐶 FELIORA PSY (25)
              </button>
            )}
            {onSwitchToOrthomax && (
              <button
                type="button"
                onClick={onSwitchToOrthomax}
                style={{
                  padding: '8px 12px',
                  borderRadius: 9,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#cbd5e1',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                🦵 ORTHOMAX PL (70)
              </button>
            )}
          </div>
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
            gridTemplateColumns: '360px 1fr 420px',
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
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: '1px solid #1f2937',
              }}
            >
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {filteredPresets.map(preset => {
                const ad = adByAngleId[preset.id];
                const isSelected = activePreset?.id === preset.id;
                const isChecked = selectedAngleIds.includes(preset.id);
                const clusterMeta = PROBLEM_CLUSTER_LABELS[preset.problemCluster];
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
                      onClick={() => setShowImagePicker(!showImagePicker)}
                      style={{
                        padding: '7px 11px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'rgba(15, 23, 42, 0.88)',
                        color: '#fcd34d',
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      🖼️ Zmień grafikę (23)
                    </button>
                    <button
                      type="button"
                      onClick={() => customFileRef.current?.click()}
                      disabled={uploadingImage}
                      style={{
                        padding: '7px 11px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'rgba(15, 23, 42, 0.88)',
                        color: '#f8fafc',
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {uploadingImage ? 'Wgrywanie...' : '⬆️ Wgraj własną'}
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

            {/* IMAGE PICKER DRAWER */}
            {showImagePicker && (
              <div
                style={{
                  background: '#111827',
                  border: '1px solid #374151',
                  borderRadius: 14,
                  padding: 14,
                  maxHeight: 380,
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fcd34d' }}>
                    Wybierz zdjęcie z biblioteki SARDIAN ({imageLibrary.length} szt.):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {imageLibrary.map(asset => (
                    <div
                      key={asset.id}
                      onClick={() => handleAssignImage(asset)}
                      style={{
                        borderRadius: 8,
                        overflow: 'hidden',
                        border:
                          activeAd?.imageUrl === asset.url ? '2px solid #f59e0b' : '1px solid #374151',
                        cursor: 'pointer',
                        background: '#1f2937',
                      }}
                    >
                      <img
                        src={asset.url}
                        alt={asset.label}
                        style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{ padding: 5, fontSize: 10, color: '#e5e7eb', lineHeight: 1.2 }}>
                        {asset.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                        <div style={{ fontSize: 10.5, color: synced ? '#34d399' : '#94a3b8', marginTop: 2 }}>
                          {synced
                            ? `Połączono ID: ${synced.id}${synced.pictureUploaded ? ' · Avatar wgrany' : ''}`
                            : fp.role}
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
    </div>
  );
}
