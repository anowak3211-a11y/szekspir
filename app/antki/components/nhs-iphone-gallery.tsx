'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AntkiWork } from '@/lib/antki-model';

interface NhsCard {
  index: number;
  taskId: string;
  label: string;
  scenePrompt: string;
  state: 'generating' | 'success' | 'fail';
  resultUrl?: string;
  error?: string;
  rejected?: boolean;
}

export default function NhsIphoneGallery({
  adId,
  scriptText,
  headline,
  title,
  productName,
  disabled,
  onWorkUpdated,
}: {
  adId: string;
  scriptText: string;
  headline: string;
  title: string;
  productName?: string;
  disabled?: boolean;
  onWorkUpdated: (work: AntkiWork, msg: string) => void;
}) {
  const storageKey = `antki_uk_nhs_cards_${adId}`;
  const [cards, setCards] = useState<NhsCard[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [applyingUrl, setApplyingUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const pollingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as NhsCard[];
        if (Array.isArray(parsed)) setCards(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      if (cards.length > 0) {
        window.localStorage.setItem(storageKey, JSON.stringify(cards));
      }
    } catch {
      // ignore
    }
  }, [cards, storageKey]);

  const pollTask = useCallback(async (taskId: string) => {
    if (!taskId || pollingRef.current.has(taskId)) return;
    pollingRef.current.add(taskId);
    try {
      for (let i = 0; i < 70; i++) {
        await new Promise(r => setTimeout(r, 4000));
        try {
          const res = await fetch(`/api/native-images?action=poll&taskId=${encodeURIComponent(taskId)}`, {
            cache: 'no-store',
          });
          const data = await res.json();
          if (data?.state === 'success' && data?.resultUrl) {
            setCards(prev =>
              prev.map(c => (c.taskId === taskId ? { ...c, state: 'success', resultUrl: data.resultUrl } : c)),
            );
            break;
          }
          if (data?.state === 'fail') {
            setCards(prev =>
              prev.map(c => (c.taskId === taskId ? { ...c, state: 'fail', error: data.error || 'Failed' } : c)),
            );
            break;
          }
        } catch {
          // continue
        }
      }
    } finally {
      pollingRef.current.delete(taskId);
    }
  }, []);

  useEffect(() => {
    for (const c of cards) {
      if (c.state === 'generating' && c.taskId) {
        void pollTask(c.taskId);
      }
    }
  }, [cards, pollTask]);

  const handleGenerate = async () => {
    if (!scriptText || scriptText.trim().length < 40) {
      setError('Prepare UK or source script text first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const isMellow = !productName || /mellow|saffron|mood\s*munchies/i.test(productName);
      const res = await fetch('/api/native-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'plan_and_submit',
          title,
          headline,
          primaryText: scriptText,
          instructionText: productName ? `Target UK product: ${productName}` : '',
          market: 'uk',
          brand: isMellow ? 'mellow-uk' : 'custom',
          count: 12,
          aspectRatio: '3:4',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Could not start Kie.ai NHS batch.');
      }
      const nextCards: NhsCard[] = (data.tasks || []).map(
        (t: { index: number; taskId: string; label: string; scenePrompt: string }) => ({
          index: t.index,
          taskId: t.taskId,
          label: t.label,
          scenePrompt: t.scenePrompt,
          state: 'generating' as const,
          rejected: false,
        }),
      );
      setCards(nextCards);
      for (const c of nextCards) {
        void pollTask(c.taskId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseForUkAd = async (url: string) => {
    setApplyingUrl(url);
    setError('');
    try {
      const res = await fetch('/api/antki/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: adId,
          action: 'use-nhs-image',
          imageUrl: url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not attach image to UK Antki.');
      if (data.work) {
        onWorkUpdated(data.work, 'Raw iPhone 3:4 NHS photo archived to Drive and queued for Sheet delivery.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not set UK photo.');
    } finally {
      setApplyingUrl(null);
    }
  };

  return (
    <section className="vopanel" aria-label="Raw iPhone 3:4 NHS Script Photos" style={{ marginTop: 18 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>📱 Raw iPhone 3:4 · Styl NHS z całego skryptu (2K Google AI)</h2>
          <p className="sub" style={{ margin: '4px 0 0' }}>
            Generuje 12 natywnych zdjęć 1792x2400 (NHS doctor selfie, real UK people 55-75yo, bin scroll-stopper,
            clinic monitor, car note) bez flat-layów i bez bokeh.
          </p>
        </div>
        <button
          type="button"
          className="primary-action"
          disabled={submitting || disabled}
          onClick={() => void handleGenerate()}
        >
          {submitting
            ? '⏳ Generuję 12 zdjęć Raw iPhone 3:4 (NHS)...'
            : '📸 Generuj 12 zdjęć Raw iPhone 3:4 z tego skryptu'}
        </button>
      </div>

      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}

      {cards.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
            gap: 10,
            marginTop: 12,
          }}
        >
          {cards
            .filter(c => !c.rejected)
            .map(card => (
              <div
                key={`${card.index}-${card.taskId}`}
                style={{
                  border: '1px solid var(--border, #334155)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--card, #0f172a)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  onClick={() => card.resultUrl && setLightboxUrl(card.resultUrl)}
                  style={{
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 8,
                        textAlign: 'center',
                        fontSize: 11.5,
                      }}
                    >
                      {card.state === 'fail' ? `⚠️ ${card.error || 'Error'}` : '⏳ Kie.ai 3:4...'}
                    </div>
                  )}
                </div>
                <div style={{ padding: 7, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ lineHeight: 1.25 }}>{card.label}</div>
                  {card.resultUrl && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        disabled={Boolean(applyingUrl) || disabled}
                        onClick={() => void handleUseForUkAd(card.resultUrl!)}
                        style={{ flex: 1, fontSize: 10.5, padding: '4px 6px' }}
                      >
                        {applyingUrl === card.resultUrl ? 'Saving...' : '✓ Use for UK Ad'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCards(prev =>
                            prev.map(item => (item.index === card.index ? { ...item, rejected: true } : item)),
                          )
                        }
                        style={{ fontSize: 10.5, padding: '4px 6px' }}
                        title="Odrzuć zdjęcie"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <img
            src={lightboxUrl}
            alt="NHS Raw iPhone preview"
            style={{ maxHeight: '88vh', maxWidth: '92vw', borderRadius: 10 }}
          />
        </div>
      )}
    </section>
  );
}
