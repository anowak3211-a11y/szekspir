'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type NativeBrandKind = 'custom' | 'mellow-uk' | 'sardian-strap' | 'feliora' | 'orthomax';
type NativeMarketKind = 'auto' | 'uk' | 'pl';

interface GeneratedCard {
  index: number;
  taskId: string;
  label: string;
  scenePrompt: string;
  includeProductRef: boolean;
  state: 'generating' | 'success' | 'fail';
  resultUrl?: string;
  error?: string;
  rejected?: boolean;
}

interface ScriptFolder {
  id: string;
  name: string;
  headline: string;
  scriptText: string;
  instructionText: string;
  market: NativeMarketKind;
  brand: NativeBrandKind;
  count: 12 | 15;
  productRefDataUrl?: string;
  productRefName?: string;
  cards: GeneratedCard[];
  createdAt: number;
}

interface SavedProductBrief {
  name: string;
  markdown: string;
}

const STORAGE_KEY = 'szekspir_native_iphone_folders_v1';

function makeEmptyFolder(num: number, partial?: Partial<ScriptFolder>): ScriptFolder {
  return {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `Folder ${num}`,
    headline: '',
    scriptText: '',
    instructionText: '',
    market: 'auto',
    brand: 'custom',
    count: 15,
    cards: [],
    createdAt: Date.now(),
    ...partial,
  };
}

export default function NativeImagesStudioPage() {
  const [folders, setFolders] = useState<ScriptFolder[]>(() => [makeEmptyFolder(1)]);
  const [activeFolderId, setActiveFolderId] = useState<string>('');
  const [products, setProducts] = useState<SavedProductBrief[]>([]);
  const [hasKieKey, setHasKieKey] = useState<boolean | null>(null);
  const [submittingFolderId, setSubmittingFolderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filterMode, setFilterMode] = useState<'kept' | 'all' | 'rejected'>('kept');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [editingPromptText, setEditingPromptText] = useState('');

  const pollingTasksRef = useRef<Set<string>>(new Set());

  // Hydrate saved folders + init API
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ScriptFolder[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFolders(parsed);
          setActiveFolderId(parsed[0].id);
        }
      }
    } catch {
      // ignore storage errors
    }

    fetch('/api/native-images?action=init', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (typeof data?.hasKieKey === 'boolean') setHasKieKey(data.hasKieKey);
        if (Array.isArray(data?.products)) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  // Ensure activeFolderId points to a valid folder
  useEffect(() => {
    if (!folders.length) return;
    if (!activeFolderId || !folders.some(f => f.id === activeFolderId)) {
      setActiveFolderId(folders[0].id);
    }
  }, [folders, activeFolderId]);

  // Persist folders (excluding huge base64 productRefDataUrl to stay within localStorage quota)
  useEffect(() => {
    try {
      const compact = folders.map(f => ({
        ...f,
        productRefDataUrl: undefined,
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // ignore quota errors
    }
  }, [folders]);

  const activeFolder = useMemo(
    () => folders.find(f => f.id === activeFolderId) || folders[0],
    [folders, activeFolderId],
  );

  const updateFolder = useCallback((folderId: string, updater: (prev: ScriptFolder) => ScriptFolder) => {
    setFolders(prev => prev.map(f => (f.id === folderId ? updater(f) : f)));
  }, []);

  const pollSingleTask = useCallback(
    async (folderId: string, taskId: string) => {
      if (!taskId || pollingTasksRef.current.has(taskId)) return;
      pollingTasksRef.current.add(taskId);
      try {
        for (let attempt = 0; attempt < 75; attempt++) {
          await new Promise(r => setTimeout(r, 4000));
          try {
            const res = await fetch(`/api/native-images?action=poll&taskId=${encodeURIComponent(taskId)}`, {
              cache: 'no-store',
            });
            const data = await res.json();
            if (data?.state === 'success' && data?.resultUrl) {
              updateFolder(folderId, f => ({
                ...f,
                cards: f.cards.map(c =>
                  c.taskId === taskId ? { ...c, state: 'success', resultUrl: data.resultUrl, error: undefined } : c,
                ),
              }));
              break;
            }
            if (data?.state === 'fail') {
              updateFolder(folderId, f => ({
                ...f,
                cards: f.cards.map(c =>
                  c.taskId === taskId ? { ...c, state: 'fail', error: data.error || 'Błąd generacji Kie.ai' } : c,
                ),
              }));
              break;
            }
          } catch {
            // continue polling
          }
        }
      } finally {
        pollingTasksRef.current.delete(taskId);
      }
    },
    [updateFolder],
  );

  // Resume polling for any in-flight tasks after page reload
  useEffect(() => {
    for (const folder of folders) {
      for (const card of folder.cards) {
        if (card.state === 'generating' && card.taskId) {
          void pollSingleTask(folder.id, card.taskId);
        }
      }
    }
  }, [folders, pollSingleTask]);

  const handleGenerateFolder = useCallback(
    async (folder: ScriptFolder) => {
      if (!folder || submittingFolderId) return;
      if ((folder.scriptText || '').trim().length < 30) {
        setError('Wklej najpierw skrypt reklamy (skrypt.txt - min. 30 znaków).');
        return;
      }
      setError('');
      setNotice(
        `📸 Analizuję cały skrypt w "${folder.name}" i wysyłam ${folder.count} zadań Raw iPhone 3:4 (2K Google AI) do Kie.ai...`,
      );
      setSubmittingFolderId(folder.id);

      try {
        const res = await fetch('/api/native-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'plan_and_submit',
            title: folder.name,
            headline: folder.headline,
            primaryText: folder.scriptText,
            instructionText: folder.instructionText,
            market: folder.market,
            brand: folder.brand,
            count: folder.count,
            aspectRatio: '3:4',
            productReferenceDataUrl: folder.productRefDataUrl,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || 'Nie udało się uruchomić generowania w Kie.ai.');
        }

        const newCards: GeneratedCard[] = (data.tasks || []).map(
          (t: {
            index: number;
            taskId: string;
            label: string;
            scenePrompt: string;
            includeProductRef: boolean;
          }) => ({
            index: t.index,
            taskId: t.taskId,
            label: t.label,
            scenePrompt: t.scenePrompt,
            includeProductRef: t.includeProductRef,
            state: 'generating' as const,
            rejected: false,
          }),
        );

        updateFolder(folder.id, f => ({
          ...f,
          cards: newCards,
        }));
        setFilterMode('kept');
        setNotice(
          `✅ Uruchomiono ${newCards.length} zdjęć Raw iPhone 3:4 (2K · rynek: ${String(
            data.marketResolved || '',
          ).toUpperCase()}) dla "${folder.name}". Pojawią się na żywo poniżej (~25-50 sek.).`,
        );

        for (const card of newCards) {
          void pollSingleTask(folder.id, card.taskId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd komunikacji z Kie.ai');
      } finally {
        setSubmittingFolderId(null);
      }
    },
    [submittingFolderId, updateFolder, pollSingleTask],
  );

  const handleRegenerateSingleCard = useCallback(
    async (card: GeneratedCard, customPrompt?: string) => {
      if (!activeFolder) return;
      setError('');
      const promptToUse = (customPrompt ?? card.scenePrompt).trim();
      if (!promptToUse) return;
      try {
        const res = await fetch('/api/native-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit_single',
            primaryText: activeFolder.scriptText,
            instructionText: activeFolder.instructionText,
            market: activeFolder.market,
            brand: activeFolder.brand,
            aspectRatio: '3:4',
            productReferenceDataUrl: activeFolder.productRefDataUrl,
            scenePrompt: promptToUse,
            label: card.label,
            includeProductRef: card.includeProductRef,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.taskId) {
          throw new Error(data?.error || 'Nie udało się wysłać pojedynczej sceny.');
        }

        updateFolder(activeFolder.id, f => ({
          ...f,
          cards: f.cards.map(c =>
            c.index === card.index
              ? {
                  ...c,
                  taskId: data.taskId,
                  scenePrompt: promptToUse,
                  state: 'generating',
                  resultUrl: undefined,
                  error: undefined,
                  rejected: false,
                }
              : c,
          ),
        }));
        setEditingCardIndex(null);
        void pollSingleTask(activeFolder.id, data.taskId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd regeneracji zdjęcia');
      }
    },
    [activeFolder, updateFolder, pollSingleTask],
  );

  const toggleRejectCard = useCallback(
    (cardIndex: number) => {
      if (!activeFolder) return;
      updateFolder(activeFolder.id, f => ({
        ...f,
        cards: f.cards.map(c => (c.index === cardIndex ? { ...c, rejected: !c.rejected } : c)),
      }));
    },
    [activeFolder, updateFolder],
  );

  const handleTxtFilesUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const txtFiles = Array.from(files).filter(f => /\.(txt|md)$/i.test(f.name) || f.type.startsWith('text/'));
      if (!txtFiles.length) return;

      if (txtFiles.length === 1 && activeFolder && !activeFolder.scriptText.trim()) {
        const content = await txtFiles[0].text();
        updateFolder(activeFolder.id, f => ({
          ...f,
          name: txtFiles[0].name.replace(/\.(txt|md)$/i, '') || f.name,
          scriptText: content,
        }));
        setNotice(`📄 Wczytano plik "${txtFiles[0].name}" do aktywnego folderu.`);
        return;
      }

      const added: ScriptFolder[] = [];
      for (let i = 0; i < txtFiles.length; i++) {
        const content = await txtFiles[i].text();
        added.push(
          makeEmptyFolder(folders.length + i + 1, {
            name: `${folders.length + i + 1} · ${txtFiles[i].name.replace(/\.(txt|md)$/i, '')}`,
            scriptText: content,
          }),
        );
      }
      setFolders(prev => [...prev, ...added]);
      if (added[0]) setActiveFolderId(added[0].id);
      setNotice(`📂 Dodano ${added.length} folder(y) ze skryptami .txt.`);
    },
    [activeFolder, folders.length, updateFolder],
  );

  const handleProductRefUpload = useCallback(
    (file: File | undefined) => {
      if (!file || !activeFolder) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        updateFolder(activeFolder.id, f => ({
          ...f,
          productRefDataUrl: dataUrl,
          productRefName: file.name,
        }));
        setNotice(`📦 Podpięto zdjęcie produktu "${file.name}" (używane tylko na ostatnim kadrze w ruchu).`);
      };
      reader.readAsDataURL(file);
    },
    [activeFolder, updateFolder],
  );

  const visibleCards = useMemo(() => {
    if (!activeFolder) return [];
    if (filterMode === 'all') return activeFolder.cards;
    if (filterMode === 'rejected') return activeFolder.cards.filter(c => c.rejected);
    return activeFolder.cards.filter(c => !c.rejected);
  }, [activeFolder, filterMode]);

  const keptReadyCards = useMemo(
    () => (activeFolder?.cards || []).filter(c => c.state === 'success' && c.resultUrl && !c.rejected),
    [activeFolder],
  );

  const handleDownloadAcceptedPack = useCallback(async () => {
    if (!activeFolder) return;
    if (keptReadyCards.length === 0) {
      setError('Brak gotowych, nieodrzuconych zdjęć do pobrania.');
      return;
    }

    // 1. Download skrypt.txt + instruction.txt locally just like the Loom folder structure
    const triggerBlobDownload = (text: string, filename: string) => {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    };

    const folderSlug = activeFolder.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 24) || 'folder';
    triggerBlobDownload(activeFolder.scriptText, `${folderSlug}_skrypt.txt`);
    if (activeFolder.instructionText.trim()) {
      triggerBlobDownload(activeFolder.instructionText, `${folderSlug}_instruction.txt`);
    }

    for (let i = 0; i < keptReadyCards.length; i++) {
      const card = keptReadyCards[i];
      await new Promise(r => setTimeout(r, 320));
      const a = document.createElement('a');
      a.href = `/api/native-images?action=download&url=${encodeURIComponent(card.resultUrl!)}&name=${encodeURIComponent(
        `${folderSlug}_${card.index}.png`,
      )}`;
      a.download = `${folderSlug}_${card.index}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setNotice(`⬇️ Pobrano ${keptReadyCards.length} zaakceptowanych zdjęć PNG + skrypt.txt dla "${activeFolder.name}".`);
  }, [activeFolder, keptReadyCards]);

  // Keyboard navigation in Lightbox (Left / Right / Backspace or Delete to reject like in Loom!)
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev !== null && prev + 1 < visibleCards.length ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const current = visibleCards[lightboxIndex];
        if (current) {
          e.preventDefault();
          toggleRejectCard(current.index);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, visibleCards, toggleRejectCard]);

  const lightboxCard = lightboxIndex !== null ? visibleCards[lightboxIndex] || null : null;

  return (
    <main
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '24px 20px 64px',
        color: 'var(--text, #f4f4f5)',
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div>
          <a
            href="/"
            style={{
              fontSize: '13px',
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            ← Wróć do Ad Ops (Szekspir)
          </a>
          <h1 style={{ margin: '6px 0 4px', fontSize: '26px', fontWeight: 900 }}>
            📱 Native Images · Raw iPhone 3:4 (2K Google AI)
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', opacity: 0.82 }}>
            Wklej dowolny <code>skrypt.txt</code> (PL lub UK) + opcjonalny <code>instruction.txt</code>.
            Silnik wygeneruje 12 lub 15 surowych zdjęć <code>1792x2400</code> (3:4 · zero flat-layów Noom, zero bokeh,
            prawdziwi ludzie 55-75 lat, scenerie z historii, czyste ściany i okna bez losowych napisów).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {hasKieKey === false && (
            <span
              style={{
                background: '#7f1d1d',
                color: '#fecaca',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              ⚠️ Brak klucza KIE_API_KEY w profilu
            </span>
          )}
          <label
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              padding: '8px 13px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📂 Wgraj pliki skrypt.txt (wiele naraz)
            <input
              type="file"
              accept=".txt,.md,text/plain"
              multiple
              style={{ display: 'none' }}
              onChange={e => void handleTxtFilesUpload(e.target.files)}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const nf = makeEmptyFolder(folders.length + 1);
              setFolders(prev => [...prev, nf]);
              setActiveFolderId(nf.id);
            }}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            + Nowy folder skryptu ({folders.length + 1})
          </button>
        </div>
      </div>

      {/* FOLDER TABS (1, 2, 3, 4, 5 like in Loom Finder!) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '16px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        {folders.map(f => {
          const isActive = f.id === activeFolder?.id;
          const readyCount = f.cards.filter(c => c.state === 'success' && !c.rejected).length;
          const genCount = f.cards.filter(c => c.state === 'generating').length;
          return (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isActive ? '#0f172a' : 'rgba(30, 41, 59, 0.55)',
                border: isActive ? '2px solid #10b981' : '1px solid #334155',
                borderRadius: '9px',
                padding: '6px 11px',
                cursor: 'pointer',
              }}
              onClick={() => setActiveFolderId(f.id)}
            >
              <span style={{ fontSize: '13px', fontWeight: 800, color: isActive ? '#34d399' : '#e2e8f0' }}>
                📁 {f.name}
              </span>
              {f.cards.length > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    background: genCount > 0 ? '#9a3412' : '#065f46',
                    color: '#fff',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontWeight: 700,
                  }}
                >
                  {genCount > 0 ? `⏳ ${readyCount}/${f.cards.length}` : `✓ ${readyCount}`}
                </span>
              )}
              {folders.length > 1 && (
                <button
                  type="button"
                  title="Usuń ten folder"
                  onClick={e => {
                    e.stopPropagation();
                    setFolders(prev => prev.filter(item => item.id !== f.id));
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '0 2px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(127, 29, 29, 0.35)',
            border: '1px solid #ef4444',
            color: '#fecaca',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '14px',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {notice && (
        <div
          style={{
            background: 'rgba(6, 95, 70, 0.3)',
            border: '1px solid #10b981',
            color: '#a7f3d0',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '14px',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          {notice}
        </div>
      )}

      {activeFolder && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 430px) minmax(0, 1fr)',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* LEFT PANEL: skrypt.txt + instruction.txt + SETTINGS */}
          <section
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                  Nazwa folderu
                </label>
                <input
                  value={activeFolder.name}
                  onChange={e => updateFolder(activeFolder.id, f => ({ ...f, name: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#020617',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '7px',
                    padding: '7px 9px',
                    fontSize: '12.5px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                  Rynek / realia na zdjęciach
                </label>
                <select
                  value={activeFolder.market}
                  onChange={e =>
                    updateFolder(activeFolder.id, f => ({ ...f, market: e.target.value as NativeMarketKind }))
                  }
                  style={{
                    width: '100%',
                    background: '#020617',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '7px',
                    padding: '7px 9px',
                    fontSize: '12.5px',
                  }}
                >
                  <option value="auto">🌐 Auto z języka (PL / UK)</option>
                  <option value="uk">🇬🇧 UK · brytyjskie domy i realia</option>
                  <option value="pl">🇵🇱 Polska · polskie domy i realia</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 115px', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                  Produkt / Preset marki
                </label>
                <select
                  value={activeFolder.brand}
                  onChange={e =>
                    updateFolder(activeFolder.id, f => ({ ...f, brand: e.target.value as NativeBrandKind }))
                  }
                  style={{
                    width: '100%',
                    background: '#020617',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '7px',
                    padding: '7px 9px',
                    fontSize: '12.5px',
                  }}
                >
                  <option value="custom">✨ Dowolny produkt (ze skryptu / instruction.txt)</option>
                  <option value="mellow-uk">🇬🇧 Mellow Mood Munchies UK (Saffron Gummies)</option>
                  <option value="sardian-strap">🇵🇱 SARDIAN Opaska Podrzepkowa na kolano</option>
                  <option value="feliora">🇵🇱 Feliora PL Dyfuzor Feromonowy (Koty)</option>
                  <option value="orthomax">🇵🇱 Orthomax StepMax PL Wkładki</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                  Liczba zdjęć
                </label>
                <select
                  value={activeFolder.count}
                  onChange={e =>
                    updateFolder(activeFolder.id, f => ({
                      ...f,
                      count: Number(e.target.value) === 12 ? 12 : 15,
                    }))
                  }
                  style={{
                    width: '100%',
                    background: '#020617',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '7px',
                    padding: '7px 9px',
                    fontSize: '12.5px',
                  }}
                >
                  <option value={15}>15 zdjęć (Loom)</option>
                  <option value={12}>12 zdjęć</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                Headline (opcjonalnie)
              </label>
              <input
                value={activeFolder.headline}
                placeholder="np. My wife said 6 words in the B&Q car park... / Mam 64 lata..."
                onChange={e => updateFolder(activeFolder.id, f => ({ ...f, headline: e.target.value }))}
                style={{
                  width: '100%',
                  background: '#020617',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '7px',
                  padding: '7px 9px',
                  fontSize: '12.5px',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#34d399' }}>
                  📄 skrypt.txt (pełny Primary Text reklamy)
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {activeFolder.scriptText.length.toLocaleString()} zn.
                </span>
              </div>
              <textarea
                rows={13}
                value={activeFolder.scriptText}
                placeholder="Wklej tutaj cały long-form skrypt reklamy natywnej (po polsku lub po angielsku)..."
                onChange={e => updateFolder(activeFolder.id, f => ({ ...f, scriptText: e.target.value }))}
                style={{
                  width: '100%',
                  background: '#020617',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '9px 10px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#cbd5e1' }}>
                  📝 instruction.txt (opcjonalny opis produktu / wskazówki pod kąt)
                </label>
                {products.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={e => {
                      const found = products.find(p => p.name === e.target.value);
                      if (found) {
                        updateFolder(activeFolder.id, f => ({
                          ...f,
                          instructionText: found.markdown.slice(0, 1800),
                        }));
                      }
                    }}
                    style={{
                      background: '#1e293b',
                      color: '#cbd5e1',
                      border: '1px solid #334155',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      padding: '2px 6px',
                    }}
                  >
                    <option value="">Załaduj z Product Briefs...</option>
                    {products.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <textarea
                rows={4}
                value={activeFolder.instructionText}
                placeholder="Opcjonalnie: jak wygląda fizycznie produkt, wiek bohatera, dodatkowe życzenia wizualne..."
                onChange={e => updateFolder(activeFolder.id, f => ({ ...f, instructionText: e.target.value }))}
                style={{
                  width: '100%',
                  background: '#020617',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* OPTIONAL PRODUCT PACKSHOT UPLOAD */}
            <div
              style={{
                background: '#020617',
                border: '1px dashed #334155',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                {activeFolder.productRefName ? (
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    📦 Zdjęcie produktu: {activeFolder.productRefName}
                  </span>
                ) : (
                  'Opcjonalne zdjęcie produktu (tylko do ostatniego kadru #12/#15)'
                )}
              </div>
              <label
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Wgraj foto
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleProductRefUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            <button
              type="button"
              disabled={submittingFolderId === activeFolder.id}
              onClick={() => void handleGenerateFolder(activeFolder)}
              style={{
                width: '100%',
                background:
                  submittingFolderId === activeFolder.id
                    ? '#1e293b'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: '1px solid #34d399',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13.5px',
                fontWeight: 900,
                cursor: submittingFolderId === activeFolder.id ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.28)',
              }}
            >
              {submittingFolderId === activeFolder.id
                ? `⏳ Planuję ${activeFolder.count} scen i wysyłam do Kie.ai...`
                : `📸 Generuj ${activeFolder.count} zdjęć Raw iPhone 3:4 (2K Google AI)`}
            </button>
          </section>

          {/* RIGHT PANEL: 3:4 PORTRAIT GALLERY & LOOM CURATION */}
          <section
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '14px',
              padding: '16px',
              minHeight: '540px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(
                  [
                    {
                      id: 'kept',
                      label: `✓ Zaakceptowane (${activeFolder.cards.filter(c => !c.rejected).length})`,
                    },
                    { id: 'all', label: `Wszystkie (${activeFolder.cards.length})` },
                    {
                      id: 'rejected',
                      label: `🗑️ Odrzucone (${activeFolder.cards.filter(c => c.rejected).length})`,
                    },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterMode(tab.id)}
                    style={{
                      background: filterMode === tab.id ? '#10b981' : '#1e293b',
                      color: filterMode === tab.id ? '#ffffff' : '#cbd5e1',
                      border: 'none',
                      borderRadius: '7px',
                      padding: '6px 11px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {keptReadyCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleDownloadAcceptedPack()}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 13px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ⬇️ Pobierz paczkę folderu ({keptReadyCards.length}x PNG + skrypt.txt)
                </button>
              )}
            </div>

            {activeFolder.cards.length === 0 ? (
              <div
                style={{
                  border: '1px dashed #334155',
                  borderRadius: '12px',
                  padding: '64px 24px',
                  textAlign: 'center',
                  color: '#94a3b8',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📱</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', marginBottom: '6px' }}>
                  Wklej skrypt po lewej i kliknij „Generuj {activeFolder.count} zdjęć Raw iPhone 3:4”
                </div>
                <div style={{ fontSize: '12.5px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.5 }}>
                  Każde zdjęcie generuje się w <code>nano-banana-pro</code> (Google AI) w pionowym formacie{' '}
                  <code>3:4</code> (<code>1792 x 2400</code>). Kliknij dowolne zdjęcie, by przeglądać je na pełnym
                  ekranie strzałkami <code>←</code> <code>→</code> i odrzucać słabsze twarze klawiszem{' '}
                  <code>Backspace</code> dokładnie jak na filmie Loom.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(205px, 1fr))',
                  gap: '12px',
                }}
              >
                {visibleCards.map((card, visibleIdx) => (
                  <div
                    key={`${card.index}-${card.taskId}`}
                    style={{
                      background: '#020617',
                      border: card.rejected ? '1px solid #7f1d1d' : '1px solid #1e293b',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      opacity: card.rejected ? 0.55 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      onClick={() => {
                        if (card.resultUrl) setLightboxIndex(visibleIdx);
                      }}
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '3 / 4',
                        background: '#090d16',
                        cursor: card.resultUrl ? 'zoom-in' : 'default',
                      }}
                    >
                      {card.state === 'success' && card.resultUrl ? (
                        <img
                          src={card.resultUrl}
                          alt={card.label}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top center',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            textAlign: 'center',
                            fontSize: '12px',
                            color: card.state === 'fail' ? '#fca5a5' : '#38bdf8',
                            fontWeight: 700,
                          }}
                        >
                          {card.state === 'fail' ? `⚠️ ${card.error || 'Błąd'}` : '⏳ Generuję 2K 3:4...'}
                        </div>
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: 'rgba(2, 6, 23, 0.82)',
                          color: '#f8fafc',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '5px',
                        }}
                      >
                        {card.index}.png
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '8px 9px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.3, fontWeight: 600 }}>
                        {card.label}
                      </div>

                      {editingCardIndex === card.index ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <textarea
                            rows={4}
                            value={editingPromptText}
                            onChange={e => setEditingPromptText(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0f172a',
                              color: '#f8fafc',
                              border: '1px solid #334155',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              padding: '5px',
                            }}
                          />
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => void handleRegenerateSingleCard(card, editingPromptText)}
                              style={{
                                flex: 1,
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '4px',
                                fontSize: '10.5px',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                            >
                              Generuj
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCardIndex(null)}
                              style={{
                                background: '#334155',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '4px 8px',
                                fontSize: '10.5px',
                                cursor: 'pointer',
                              }}
                            >
                              Anuluj
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => toggleRejectCard(card.index)}
                            style={{
                              flex: 1,
                              background: card.rejected ? '#065f46' : '#7f1d1d',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '4px 6px',
                              fontSize: '10.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            {card.rejected ? '↩ Przywróć' : '🗑️ Odrzuć'}
                          </button>
                          <button
                            type="button"
                            title="Edytuj prompt lub wygeneruj ponownie ten kadr"
                            onClick={() => {
                              setEditingCardIndex(card.index);
                              setEditingPromptText(card.scenePrompt);
                            }}
                            style={{
                              background: '#1e293b',
                              color: '#e2e8f0',
                              border: '1px solid #334155',
                              borderRadius: '5px',
                              padding: '4px 7px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🔄
                          </button>
                          {card.resultUrl && (
                            <a
                              href={`/api/native-images?action=download&url=${encodeURIComponent(
                                card.resultUrl,
                              )}&name=${encodeURIComponent(`${card.index}.png`)}`}
                              download={`${card.index}.png`}
                              style={{
                                background: '#0369a1',
                                color: '#ffffff',
                                textDecoration: 'none',
                                borderRadius: '5px',
                                padding: '4px 7px',
                                fontSize: '10.5px',
                                fontWeight: 800,
                              }}
                            >
                              ⬇️
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {lightboxCard && lightboxCard.resultUrl && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.92)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '640px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <img
              src={lightboxCard.resultUrl}
              alt={lightboxCard.label}
              style={{
                maxHeight: '78vh',
                maxWidth: '100%',
                borderRadius: '10px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.65)',
              }}
            />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', textAlign: 'center' }}>
              {lightboxCard.index}.png · {lightboxCard.label}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={lightboxIndex === 0}
                onClick={() => setLightboxIndex(i => (i !== null && i > 0 ? i - 1 : i))}
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ← Poprzednie
              </button>
              <button
                type="button"
                onClick={() => toggleRejectCard(lightboxCard.index)}
                style={{
                  background: lightboxCard.rejected ? '#059669' : '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {lightboxCard.rejected ? '↩ Przywróć zdjęcie' : '🗑️ Odrzuć (Backspace)'}
              </button>
              <a
                href={`/api/native-images?action=download&url=${encodeURIComponent(
                  lightboxCard.resultUrl,
                )}&name=${encodeURIComponent(`${lightboxCard.index}.png`)}`}
                download={`${lightboxCard.index}.png`}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '7px',
                  padding: '7px 14px',
                  fontWeight: 800,
                }}
              >
                ⬇️ Pobierz PNG
              </a>
              <button
                type="button"
                disabled={lightboxIndex !== null && lightboxIndex + 1 >= visibleCards.length}
                onClick={() =>
                  setLightboxIndex(i => (i !== null && i + 1 < visibleCards.length ? i + 1 : i))
                }
                style={{
                  background: '#1e293b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Następne →
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Zamknij (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
