'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type KieModel = 'nano-banana-pro' | 'gpt-image-2-image-to-image' | 'recraft/crisp-upscale';
type ItemStatus = 'idle' | 'submitting' | 'polling' | 'done' | 'error';

interface BuiltInRef {
  id: string;
  label: string;
  path: string;
}

interface ProductOption {
  name: string;
  markdown: string;
}

interface CustomReferenceItem {
  id: string;
  name: string;
  dataUrl: string;
}

interface RipperItem {
  id: string;
  fileName: string;
  sourceDataUrl: string;
  width: number;
  height: number;
  aspectRatio: string;
  status: ItemStatus;
  taskId?: string;
  resultUrl?: string;
  upscaledUrl?: string;
  error?: string;
  customInstructions: string;
  prompt: string;
  visionSummary?: string;
}

function detectClientAspectRatio(w: number, h: number): string {
  if (!w || !h) return '1:1';
  const r = w / h;
  if (r <= 0.62) return '9:16';
  if (r >= 1.4) return '16:9';
  if (Math.abs(r - 1) <= 0.08) return '1:1';
  if (Math.abs(r - 0.8) <= 0.04) return '4:5';
  if (Math.abs(r - 0.75) <= 0.05) return '3:4';
  return r < 0.78 ? '3:4' : r < 0.92 ? '4:5' : '1:1';
}

async function readImageFileOptimized(file: File): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: string;
}> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Nie udało się odczytać pliku ${file.name}`));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error(`Nie udało się załadować obrazu ${file.name}`));
    el.src = rawDataUrl;
  });

  const width = img.naturalWidth || img.width || 1080;
  const height = img.naturalHeight || img.height || 1080;
  const aspectRatio = detectClientAspectRatio(width, height);

  const maxDim = 2048;
  const needsCompress = file.size > 3_800_000 || width > maxDim || height > maxDim;
  if (!needsCompress) {
    return { dataUrl: rawDataUrl, width, height, aspectRatio };
  }

  const scale = Math.min(1, maxDim / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: rawDataUrl, width, height, aspectRatio };
  }
  ctx.drawImage(img, 0, 0, targetW, targetH);
  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
  return {
    dataUrl: compressedDataUrl,
    width: targetW,
    height: targetH,
    aspectRatio,
  };
}

export default function ImageRipperPage() {
  const [kieConfigured, setKieConfigured] = useState<boolean | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('Mellow Mood Munchies');
  const [brandBookText, setBrandBookText] = useState<string>('');
  const [showBrandBook, setShowBrandBook] = useState<boolean>(false);

  const [model, setModel] = useState<KieModel>('nano-banana-pro');
  const [useVision, setUseVision] = useState<boolean>(true);
  const [batchInstructions, setBatchInstructions] = useState<string>('');

  const [defaultRefs, setDefaultRefs] = useState<BuiltInRef[]>([
    {
      id: 'mellow-packshot-front-uk',
      label: 'Packshot Front UK (Pouch + Żelki)',
      path: '/brand-references/mellow-packshot-front-uk.jpg',
    },
    {
      id: 'mellow-kie-gold-01',
      label: 'Kie Gold Style — Dark Navy + Saffron',
      path: '/brand-references/mellow-kie-gold-01.jpg',
    },
    {
      id: 'mellow-kie-gold-02',
      label: 'Kie Gold Style — Pale Ice-Blue Studio',
      path: '/brand-references/mellow-kie-gold-02.jpg',
    },
  ]);
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([
    'mellow-packshot-front-uk',
    'mellow-kie-gold-01',
    'mellow-kie-gold-02',
  ]);
  const [customRefs, setCustomRefs] = useState<CustomReferenceItem[]>([]);

  const [items, setItems] = useState<RipperItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [batchRunning, setBatchRunning] = useState<boolean>(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customRefInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<RipperItem[]>(items);
  itemsRef.current = items;

  useEffect(() => {
    fetch('/api/image-ripper?action=init')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.kieConfigured === 'boolean') setKieConfigured(data.kieConfigured);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.defaultReferences)) setDefaultRefs(data.defaultReferences);
        if (typeof data.mellowBrandBook === 'string') setBrandBookText(data.mellowBrandBook);
      })
      .catch(() => {
        setKieConfigured(false);
      });
  }, []);

  // Poll active tasks every 4 seconds
  useEffect(() => {
    const timer = setInterval(async () => {
      const pollingItems = itemsRef.current.filter(
        (it) => it.status === 'polling' && it.taskId
      );
      if (pollingItems.length === 0) return;

      await Promise.all(
        pollingItems.map(async (item) => {
          try {
            const res = await fetch(
              `/api/image-ripper?action=poll&taskId=${encodeURIComponent(item.taskId!)}`
            );
            const data = await res.json();
            if (data.state === 'success' && data.resultUrl) {
              setItems((prev) =>
                prev.map((p) =>
                  p.id === item.id
                    ? { ...p, status: 'done', resultUrl: data.resultUrl, error: undefined }
                    : p
                )
              );
            } else if (data.state === 'fail' || data.error) {
              setItems((prev) =>
                prev.map((p) =>
                  p.id === item.id
                    ? {
                        ...p,
                        status: 'error',
                        error: data.error || 'Kie.ai zwróciło błąd generowania',
                      }
                    : p
                )
              );
            }
          } catch {
            // keep polling on transient network errors
          }
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleFilesSelected = useCallback(async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList).filter((f) =>
      /\.(jpe?g|png|webp|gif)$/i.test(f.name) || f.type.startsWith('image/')
    );
    if (arr.length === 0) return;

    const loaded: RipperItem[] = [];
    for (const file of arr.slice(0, 25)) {
      try {
        const info = await readImageFileOptimized(file);
        loaded.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fileName: file.name,
          sourceDataUrl: info.dataUrl,
          width: info.width,
          height: info.height,
          aspectRatio: info.aspectRatio,
          status: 'idle',
          customInstructions: '',
          prompt: '',
        });
      } catch {
        // skip unreadable file
      }
    }

    setItems((prev) => [...prev, ...loaded].slice(0, 25));
  }, []);

  const handleCustomRefUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const added: CustomReferenceItem[] = [];
    for (const file of Array.from(fileList).slice(0, 3)) {
      try {
        const info = await readImageFileOptimized(file);
        added.push({
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          dataUrl: info.dataUrl,
        });
      } catch {
        // ignore
      }
    }
    setCustomRefs((prev) => [...prev, ...added].slice(0, 3));
  }, []);

  const toggleRefId = (id: string) => {
    setSelectedRefIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const runSingleItem = useCallback(
    async (itemId: string) => {
      const target = itemsRef.current.find((i) => i.id === itemId);
      if (!target) return;

      setItems((prev) =>
        prev.map((p) =>
          p.id === itemId ? { ...p, status: 'submitting', error: undefined } : p
        )
      );

      const combinedInstructions = [
        batchInstructions.trim(),
        target.customInstructions.trim(),
      ]
        .filter(Boolean)
        .join('\n');

      try {
        const res = await fetch('/api/image-ripper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit',
            sourceDataUrl: target.sourceDataUrl,
            fileName: target.fileName,
            aspectRatio: target.aspectRatio,
            width: target.width,
            height: target.height,
            productName: selectedProduct,
            customInstructions: combinedInstructions,
            customPrompt: target.prompt.trim() || undefined,
            model,
            referenceIds: selectedRefIds,
            customReferenceDataUrls: customRefs.map((c) => c.dataUrl),
            useVision,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.taskId) {
          throw new Error(data.error || `Błąd uruchomienia zadania (HTTP ${res.status})`);
        }

        const visionSummary = data.visionAnalysis
          ? [
              data.visionAnalysis.layoutType
                ? `Układ: ${data.visionAnalysis.layoutType}`
                : '',
              data.visionAnalysis.headline
                ? `Headline: "${data.visionAnalysis.headline}"`
                : '',
              data.visionAnalysis.backgroundMode
                ? `Tło: ${data.visionAnalysis.backgroundMode}`
                : '',
            ]
              .filter(Boolean)
              .join(' • ')
          : undefined;

        setItems((prev) =>
          prev.map((p) =>
            p.id === itemId
              ? {
                  ...p,
                  status: 'polling',
                  taskId: data.taskId,
                  prompt: data.prompt || p.prompt,
                  visionSummary: visionSummary || p.visionSummary,
                }
              : p
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nieznany błąd wysyłki';
        setItems((prev) =>
          prev.map((p) =>
            p.id === itemId ? { ...p, status: 'error', error: message } : p
          )
        );
      }
    },
    [batchInstructions, customRefs, model, selectedProduct, selectedRefIds, useVision]
  );

  const runBatchAll = useCallback(async () => {
    const queue = itemsRef.current.filter(
      (i) => i.status === 'idle' || i.status === 'error'
    );
    if (queue.length === 0) return;

    setBatchRunning(true);
    const concurrency = 4;
    let idx = 0;

    const worker = async () => {
      while (idx < queue.length) {
        const current = queue[idx++];
        if (current) {
          await runSingleItem(current.id);
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, queue.length) }, () => worker())
    );
    setBatchRunning(false);
  }, [runSingleItem]);

  const upscaleItem = useCallback(async (itemId: string) => {
    const target = itemsRef.current.find((i) => i.id === itemId);
    if (!target || !target.resultUrl) return;

    setItems((prev) =>
      prev.map((p) =>
        p.id === itemId ? { ...p, status: 'submitting', error: undefined } : p
      )
    );

    try {
      const res = await fetch('/api/image-ripper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upscale',
          imageUrl: target.resultUrl,
          fileName: target.fileName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        throw new Error(data.error || 'Błąd uruchomienia Upscale 2K');
      }
      setItems((prev) =>
        prev.map((p) =>
          p.id === itemId ? { ...p, status: 'polling', taskId: data.taskId } : p
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Błąd Upscale';
      setItems((prev) =>
        prev.map((p) =>
          p.id === itemId ? { ...p, status: 'error', error: message } : p
        )
      );
    }
  }, []);

  const upscaleAllCompleted = useCallback(async () => {
    const completed = itemsRef.current.filter((i) => i.status === 'done' && i.resultUrl);
    for (const item of completed) {
      await upscaleItem(item.id);
    }
  }, [upscaleItem]);

  const downloadImage = (url: string, fileName: string, index: number) => {
    const cleanBase = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const outName = `mellow-2k-${String(index + 1).padStart(2, '0')}-${cleanBase}.jpg`;
    const downloadHref = `/api/image-ripper?action=download&url=${encodeURIComponent(
      url
    )}&name=${encodeURIComponent(outName)}`;
    const a = document.createElement('a');
    a.href = downloadHref;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllCompleted = () => {
    const ready = items.filter((i) => i.resultUrl);
    ready.forEach((item, idx) => {
      setTimeout(() => {
        if (item.resultUrl) {
          downloadImage(item.resultUrl, item.fileName, idx);
        }
      }, idx * 450);
    });
  };

  const readyCount = items.filter((i) => i.status === 'idle' || i.status === 'error').length;
  const doneCount = items.filter((i) => i.status === 'done' && i.resultUrl).length;
  const activeCount = items.filter(
    (i) => i.status === 'submitting' || i.status === 'polling'
  ).length;

  return (
    <main
      style={{
        maxWidth: 1380,
        margin: '0 auto',
        padding: '28px 20px 80px',
        color: '#f4f4f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Navigation & Status Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <a
            href="/"
            style={{
              color: '#a1a1aa',
              textDecoration: 'none',
              fontSize: 14,
              display: 'inline-block',
              marginBottom: 6,
            }}
          >
            ← Szekspir Home
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            🖼️ IMAGE RIPPER — 2K Brand Reworker (Kie.ai)
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: 14, margin: '6px 0 0' }}>
            Wrzuć do 25 grafik konkurencji naraz. Automatyczna analiza układu Vision AI + przeróbka 1:1 w 2K na Mellow Mood Munchies UK (lub wybrany brand) z oficjalnymi packshotami.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              background:
                kieConfigured === null
                  ? '#27272a'
                  : kieConfigured
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.18)',
              color:
                kieConfigured === null
                  ? '#a1a1aa'
                  : kieConfigured
                  ? '#34d399'
                  : '#f87171',
              border: `1px solid ${
                kieConfigured ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'
              }`,
            }}
          >
            {kieConfigured === null
              ? 'Sprawdzanie KIE_API_KEY...'
              : kieConfigured
              ? '● KIE_API_KEY Aktywny (2K Ready)'
              : '⚠️ Brak KIE_API_KEY (Ustaw w Profil → Moje klucze)'}
          </span>
          <a
            href="/profile"
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              background: '#27272a',
              color: '#e4e4e7',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ⚙️ Klucze API
          </a>
        </div>
      </div>

      {/* Configuration Panel */}
      <section
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 16,
          padding: 22,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 18,
          }}
        >
          {/* Target Product */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: '#d4d4d8',
                marginBottom: 8,
              }}
            >
              1. Produkt docelowy & Brand Book
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                background: '#09090b',
                border: '1px solid #3f3f46',
                color: '#f4f4f5',
                fontSize: 14,
              }}
            >
              <option value="Mellow Mood Munchies">
                Mellow Mood Munchies (Saffron Gummies UK — Pełny Brand Book PDP)
              </option>
              {products.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} (z Product Briefs)
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowBrandBook((v) => !v)}
                style={{
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  color: '#e4e4e7',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {showBrandBook
                  ? 'Ukryj Brand Book Mellow PDP'
                  : '📖 Podgląd zasad Brand Book & PDP (Mellow UK)'}
              </button>
              <a
                href="/product"
                style={{
                  color: '#60a5fa',
                  fontSize: 12,
                  textDecoration: 'none',
                  alignSelf: 'center',
                }}
              >
                Edytuj Product Briefs →
              </a>
            </div>
          </div>

          {/* Kie.ai Model */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: '#d4d4d8',
                marginBottom: 8,
              }}
            >
              2. Model Kie.ai (2K / 4K Rebrand)
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as KieModel)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                background: '#09090b',
                border: '1px solid #3f3f46',
                color: '#f4f4f5',
                fontSize: 14,
              }}
            >
              <option value="nano-banana-pro">
                Nano Banana Pro — 2K Studio Rebrand (Rekomendowany)
              </option>
              <option value="gpt-image-2-image-to-image">
                GPT-Image-2 — 4K Image-to-Image
              </option>
              <option value="recraft/crisp-upscale">
                Recraft Crisp — Tylko Upscale 2K
              </option>
            </select>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 10,
                fontSize: 13,
                color: '#d4d4d8',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={useVision}
                onChange={(e) => setUseVision(e.target.checked)}
              />
              Analizuj układ i teksty każdej grafiki przez Vision AI przed wysyłką do Kie
            </label>
          </div>

          {/* Global Batch Instructions */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: '#d4d4d8',
                marginBottom: 8,
              }}
            >
              3. Dodatkowe wytyczne dla całego batcha (opcjonalnie)
            </label>
            <textarea
              rows={3}
              value={batchInstructions}
              onChange={(e) => setBatchInstructions(e.target.value)}
              placeholder="np. Zamień wszystkie oferty na Buy 2 Get 1 Free, używaj jasnego tła #DCECF5, zachowaj układ porównania Us vs Them..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                background: '#09090b',
                border: '1px solid #3f3f46',
                color: '#f4f4f5',
                fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Collapsible Brand Book Preview */}
        {showBrandBook && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: '#09090b',
              border: '1px solid #27272a',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#38bdf8',
                marginBottom: 6,
              }}
            >
              AKTYWNY BRAND BOOK: MELLOW MOOD MUNCHIES (UK SAFFRON GUMMIES PDP)
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                fontSize: 12,
                lineHeight: 1.5,
                color: '#d4d4d8',
                maxHeight: 260,
                overflowY: 'auto',
              }}
            >
              {brandBookText}
            </pre>
          </div>
        )}

        {/* Reference Packshots Selector */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #27272a' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#d4d4d8' }}>
              4. Referencje Packshotów & Stylu (wysyłane do Kie.ai razem z grafiką konkurencji):
            </span>
            <div>
              <input
                ref={customRefInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleCustomRefUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => customRefInputRef.current?.click()}
                style={{
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  color: '#e4e4e7',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Dodaj własny packshot referencyjny
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {defaultRefs.map((ref) => {
              const active = selectedRefIds.includes(ref.id);
              return (
                <label
                  key={ref.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: active ? 'rgba(56, 189, 248, 0.12)' : '#09090b',
                    border: `1px solid ${active ? '#38bdf8' : '#27272a'}`,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleRefId(ref.id)}
                  />
                  <img
                    src={ref.path}
                    alt={ref.label}
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: '1px solid #3f3f46',
                    }}
                  />
                  <span style={{ fontWeight: 600, color: active ? '#f4f4f5' : '#a1a1aa' }}>
                    {ref.label}
                  </span>
                </label>
              );
            })}

            {customRefs.map((cref) => (
              <div
                key={cref.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  fontSize: 13,
                }}
              >
                <img
                  src={cref.dataUrl}
                  alt={cref.name}
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: 'cover',
                    borderRadius: 6,
                  }}
                />
                <span>{cref.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setCustomRefs((prev) => prev.filter((x) => x.id !== cref.id))
                  }
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Image Dropzone */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.length) {
            handleFilesSelected(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#38bdf8' : '#3f3f46'}`,
          background: isDragging ? 'rgba(56, 189, 248, 0.08)' : '#121215',
          borderRadius: 16,
          padding: '32px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 24,
          transition: 'all 0.15s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) handleFilesSelected(e.target.files);
            e.target.value = '';
          }}
        />
        <div style={{ fontSize: 36, marginBottom: 8 }}>📥</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f4f4f5', marginBottom: 4 }}>
          Przeciągnij i upuść grafiki konkurencji tutaj (do 25 obrazów naraz)
        </div>
        <div style={{ fontSize: 13, color: '#a1a1aa' }}>
          Obsługiwane formaty: JPG, PNG, WEBP • Automatyczne wykrywanie proporcji (1:1, 4:5, 9:16) i generacja w 2K przez Kie.ai
        </div>
      </section>

      {/* Batch Action Bar */}
      {items.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 18px',
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 14,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14 }}>
            <span>
              Załadowane grafiki: <strong>{items.length}</strong>
            </span>
            {activeCount > 0 && (
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                ⏳ W trakcie generowania: {activeCount}
              </span>
            )}
            {doneCount > 0 && (
              <span style={{ color: '#34d399', fontWeight: 600 }}>
                ✓ Gotowe 2K: {doneCount}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              disabled={readyCount === 0 || batchRunning}
              onClick={runBatchAll}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: readyCount > 0 ? '#2563eb' : '#27272a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                cursor: readyCount > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              🚀 Przerób wszystkie ({readyCount}) w 2K
            </button>

            {doneCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={upscaleAllCompleted}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid #3f3f46',
                    background: '#27272a',
                    color: '#f4f4f5',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  ✨ Upscale 2K dla wygenerowanych ({doneCount})
                </button>

                <button
                  type="button"
                  onClick={downloadAllCompleted}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  ⬇️ Pobierz wszystkie gotowe ({doneCount})
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setItems([])}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #3f3f46',
                background: 'transparent',
                color: '#a1a1aa',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Wyczyść listę
            </button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(560px, 1fr))',
          gap: 20,
        }}
      >
        {items.map((item, idx) => {
          const statusLabel =
            item.status === 'idle'
              ? 'Gotowe do startu'
              : item.status === 'submitting'
              ? 'Analiza & Upload...'
              : item.status === 'polling'
              ? 'Kie.ai generuje 2K...'
              : item.status === 'done'
              ? 'Gotowe 2K ✓'
              : 'Błąd';

          const statusColor =
            item.status === 'done'
              ? '#34d399'
              : item.status === 'error'
              ? '#f87171'
              : item.status === 'submitting' || item.status === 'polling'
              ? '#38bdf8'
              : '#a1a1aa';

          return (
            <div
              key={item.id}
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 16,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      background: '#27272a',
                      color: '#f4f4f5',
                      fontWeight: 700,
                      fontSize: 12,
                      padding: '4px 9px',
                      borderRadius: 6,
                    }}
                  >
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      maxWidth: 240,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.fileName}
                  >
                    {item.fileName}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#a1a1aa',
                      background: '#09090b',
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid #27272a',
                    }}
                  >
                    {item.aspectRatio} ({item.width}×{item.height})
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: statusColor,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#09090b',
                    border: `1px solid ${statusColor}`,
                  }}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Side-by-Side Comparison */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                {/* Left: Competitor Source */}
                <div
                  style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: 12,
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>
                    Oryginał konkurencji
                  </div>
                  <img
                    src={item.sourceDataUrl}
                    alt={item.fileName}
                    onClick={() => setLightboxUrl(item.sourceDataUrl)}
                    style={{
                      width: '100%',
                      height: 290,
                      objectFit: 'contain',
                      borderRadius: 8,
                      background: '#121215',
                      cursor: 'zoom-in',
                    }}
                  />
                </div>

                {/* Right: 2K Rebranded Output */}
                <div
                  style={{
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: 12,
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: item.resultUrl ? '#34d399' : '#a1a1aa',
                    }}
                  >
                    Przeróbka 2K ({selectedProduct})
                  </div>
                  {item.resultUrl ? (
                    <img
                      src={item.resultUrl}
                      alt={`2K ${item.fileName}`}
                      onClick={() => setLightboxUrl(item.resultUrl!)}
                      style={{
                        width: '100%',
                        height: 290,
                        objectFit: 'contain',
                        borderRadius: 8,
                        background: '#121215',
                        cursor: 'zoom-in',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 290,
                        borderRadius: 8,
                        background: '#121215',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        textAlign: 'center',
                        color: '#71717a',
                        fontSize: 13,
                      }}
                    >
                      {item.status === 'submitting' || item.status === 'polling' ? (
                        <>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
                          <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                            {item.status === 'submitting'
                              ? 'Analiza układu i wysyłka referencji do Kie.ai...'
                              : 'Kie.ai renderuje grafikę w 2K...'}
                          </div>
                          {item.taskId && (
                            <div style={{ fontSize: 11, marginTop: 6, color: '#71717a' }}>
                              Task ID: {item.taskId}
                            </div>
                          )}
                        </>
                      ) : item.status === 'error' ? (
                        <div style={{ color: '#f87171', fontWeight: 600 }}>
                          ❌ {item.error || 'Błąd generowania'}
                        </div>
                      ) : (
                        <div>Kliknij „▶️ Przerób” lub uruchom cały batch</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Vision Summary if available */}
              {item.visionSummary && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#cbd5e1',
                    background: '#09090b',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #27272a',
                  }}
                >
                  🔍 {item.visionSummary}
                </div>
              )}

              {/* Per-Card Custom Instruction & Prompt Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  value={item.customInstructions}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItems((prev) =>
                      prev.map((p) =>
                        p.id === item.id ? { ...p, customInstructions: val } : p
                      )
                    );
                  }}
                  placeholder="Dodatkowa instrukcja tylko dla tej grafiki (np. zmień nagłówek na 'Calm Mornings in 7 Days')..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#09090b',
                    border: '1px solid #27272a',
                    color: '#f4f4f5',
                    fontSize: 13,
                  }}
                />

                <details style={{ fontSize: 12, color: '#a1a1aa' }}>
                  <summary style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Podgląd / ręczna edycja promptu Kie.ai
                  </summary>
                  <textarea
                    rows={5}
                    value={item.prompt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItems((prev) =>
                        prev.map((p) => (p.id === item.id ? { ...p, prompt: val } : p))
                      );
                    }}
                    placeholder="Prompt wygeneruje się automatycznie przy starcie (lub wpisz własny prompt tutaj)..."
                    style={{
                      width: '100%',
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 8,
                      background: '#09090b',
                      border: '1px solid #27272a',
                      color: '#e4e4e7',
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}
                  />
                </details>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  paddingTop: 6,
                  borderTop: '1px solid #27272a',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    disabled={item.status === 'submitting' || item.status === 'polling'}
                    onClick={() => runSingleItem(item.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor:
                        item.status === 'submitting' || item.status === 'polling'
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    {item.resultUrl ? '🔄 Regeneruj 2K' : '▶️ Przerób w 2K'}
                  </button>

                  {item.resultUrl && (
                    <>
                      <button
                        type="button"
                        disabled={
                          item.status === 'submitting' || item.status === 'polling'
                        }
                        onClick={() => upscaleItem(item.id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 8,
                          border: '1px solid #3f3f46',
                          background: '#27272a',
                          color: '#f4f4f5',
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        ✨ Upscale 2K
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadImage(item.resultUrl!, item.fileName, idx)
                        }
                        style={{
                          padding: '7px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#059669',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        ⬇️ Pobierz 2K
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((p) => p.id !== item.id))
                  }
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: '#a1a1aa',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  🗑️ Usuń
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightboxUrl}
            alt="Powiększenie 2K"
            style={{
              maxWidth: '94vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          />
        </div>
      )}
    </main>
  );
}
