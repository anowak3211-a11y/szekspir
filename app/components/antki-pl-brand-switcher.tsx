'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AbTestPanel from './ab-test-panel';

export type AntkiPlBrandKey =
  | 'bennett-uk'
  | 'feliora-pies'
  | 'sardian-szampon'
  | 'stryde'
  | 'feliora'
  | 'orthomax';

export interface AntkiPlBrandBatchMeta {
  key: AntkiPlBrandKey;
  emoji: string;
  shortLabel: string;
  countLabel: string;
  createdDateLabel: string;
  updatedDateLabel: string;
  sortTimestamp: number;
  activeGradient: string;
  activeShadow: string;
  inactiveColor: string;
  badgeColor: string;
}

export const ANTKI_PL_BRAND_BATCHES: AntkiPlBrandBatchMeta[] = [
  {
    key: 'orthomax',
    emoji: '🦶',
    shortLabel: 'ORTHOMAX PL · StepMax',
    countLabel: '105 Antków',
    createdDateLabel: '18.10',
    updatedDateLabel: '02.11.2026',
    sortTimestamp: Date.parse('2026-11-02T22:00:00+01:00'),
    activeGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    activeShadow: '0 2px 10px rgba(234, 88, 12, 0.45)',
    inactiveColor: '#fdba74',
    badgeColor: '#ffedd5',
  },
  {
    key: 'sardian-szampon',
    emoji: '🦁',
    shortLabel: 'SARDIAN PL · Szampon',
    countLabel: '44 Antków',
    createdDateLabel: '29.10',
    updatedDateLabel: '01.11.2026',
    sortTimestamp: Date.parse('2026-11-01T16:45:00+01:00'),
    activeGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    activeShadow: '0 2px 10px rgba(245, 158, 11, 0.45)',
    inactiveColor: '#fde68a',
    badgeColor: '#fef3c7',
  },
  {
    key: 'feliora',
    emoji: '🐾',
    shortLabel: 'FELIORA PL · Koty',
    countLabel: '31 Antków',
    createdDateLabel: '22.10',
    updatedDateLabel: '01.11.2026',
    sortTimestamp: Date.parse('2026-11-01T16:44:00+01:00'),
    activeGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    activeShadow: '0 2px 10px rgba(139, 92, 246, 0.4)',
    inactiveColor: '#ddd6fe',
    badgeColor: '#ede9fe',
  },
  {
    key: 'bennett-uk',
    emoji: '🎃',
    shortLabel: 'BENNETT & SEED UK',
    countLabel: '30 LFS',
    createdDateLabel: '30.10',
    updatedDateLabel: '01.11.2026',
    sortTimestamp: Date.parse('2026-11-01T15:30:00+01:00'),
    activeGradient: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)',
    activeShadow: '0 2px 10px rgba(22, 163, 74, 0.45)',
    inactiveColor: '#6ee7b7',
    badgeColor: '#d1fae5',
  },
  {
    key: 'feliora-pies',
    emoji: '🐶',
    shortLabel: 'FELIORA PL · Psy',
    countLabel: '25 Antków',
    createdDateLabel: '26.10',
    updatedDateLabel: '01.11.2026',
    sortTimestamp: Date.parse('2026-11-01T11:05:00+01:00'),
    activeGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    activeShadow: '0 2px 10px rgba(217, 119, 6, 0.45)',
    inactiveColor: '#fcd34d',
    badgeColor: '#fef3c7',
  },
];

export function formatAntekShortDate(ts?: number): string {
  if (!ts || !Number.isFinite(ts)) return '26.10';
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

export function formatAntekFullDate(ts?: number): string {
  if (!ts || !Number.isFinite(ts)) return '26.10.2026';
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

const BRAND_SORT_STORAGE_KEY = 'antki_pl_brand_bar_sort_v2';

interface AntkiPlBrandSwitcherProps {
  activeBrand: AntkiPlBrandKey;
  onSelectBrand: (brand: AntkiPlBrandKey) => void;
  onOpenNoomBatch?: () => void;
}

export default function AntkiPlBrandSwitcher({
  activeBrand,
  onSelectBrand,
  onOpenNoomBatch,
}: AntkiPlBrandSwitcherProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showAbModal, setShowAbModal] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(BRAND_SORT_STORAGE_KEY);
      if (saved === 'oldest' || saved === 'newest') {
        setSortOrder(saved);
      }
    } catch {
      // Ignore storage access issues
    }
  }, []);

  const toggleSortOrder = () => {
    const next = sortOrder === 'newest' ? 'oldest' : 'newest';
    setSortOrder(next);
    try {
      window.localStorage.setItem(BRAND_SORT_STORAGE_KEY, next);
    } catch {
      // Ignore
    }
  };

  const sortedBatches = useMemo(() => {
    return [...ANTKI_PL_BRAND_BATCHES].sort((a, b) =>
      sortOrder === 'newest' ? b.sortTimestamp - a.sortTimestamp : a.sortTimestamp - b.sortTimestamp,
    );
  }, [sortOrder]);

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(9, 9, 11, 0.92)',
          padding: '4px',
          borderRadius: '11px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          gap: '5px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={toggleSortOrder}
          title="Przełącz kolejność zakładek Antków według daty edycji/utworzenia"
          style={{
            background: 'rgba(245, 158, 11, 0.14)',
            color: '#fde68a',
            border: '1px solid rgba(245, 158, 11, 0.42)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{sortOrder === 'newest' ? '🕒 Batche: Od najnowszych' : '📅 Batche: Od najstarszych'}</span>
        </button>

        {sortedBatches.map(batch => {
          const isActive = batch.key === activeBrand;
          return (
            <button
              key={batch.key}
              type="button"
              onClick={() => {
                if (!isActive) onSelectBrand(batch.key);
              }}
              style={{
                background: isActive ? batch.activeGradient : 'rgba(24, 24, 27, 0.72)',
                color: isActive ? '#ffffff' : batch.inactiveColor,
                border: isActive ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '6px 11px',
                fontSize: '12.5px',
                fontWeight: isActive ? 800 : 700,
                cursor: isActive ? 'default' : 'pointer',
                boxShadow: isActive ? batch.activeShadow : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>
                {batch.emoji} {batch.shortLabel} ({batch.countLabel.replace(' Antków', '')})
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(0, 0, 0, 0.32)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#ffffff' : batch.badgeColor,
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  whiteSpace: 'nowrap',
                }}
                title={`Utworzono: ${batch.createdDateLabel}.2026 · Ostatnia aktualizacja: ${batch.updatedDateLabel}`}
              >
                📅 {batch.updatedDateLabel.slice(0, 5)}
              </span>
            </button>
          );
        })}

        {/* DIRECT PILL TO 4 NOOM ANTKI (#102-#105) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenNoomBatch) {
              onOpenNoomBatch();
            } else {
              window.location.href = '/antki-pl?brand=orthomax&batch=noom&angle=noom-102-krystyna-62-wroclaw-schody';
            }
          }}
          title="Przejdź bezpośrednio do 4 nowych Antków NOOM (#102–#105 · Krystyna 62 l. / Kalejdoskop 5 lekarzy)"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            border: '1px solid rgba(52, 211, 153, 0.45)',
            borderRadius: '8px',
            padding: '6px 11px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🔥 4 Antki NOOM (#102–#105)</span>
          <span
            style={{
              fontSize: '10px',
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#a7f3d0',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '4px',
            }}
          >
            02.11
          </span>
        </button>

        {/* A/B TEST PANEL BUTTON (CLEAN MONOCHROME, DRAFT BY DEFAULT) */}
        <button
          type="button"
          onClick={() => setShowAbModal(v => !v)}
          title="Otwórz panel A/B testów landerów (Standard PDP vs Noom Story-PDP „Ciąg dalszy”) + 4 Antki NOOM"
          style={{
            background: showAbModal ? '#f4f4f5' : '#18181b',
            color: showAbModal ? '#09090b' : '#f4f4f5',
            border: showAbModal
              ? '1px solid #f4f4f5'
              : '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '8px',
            padding: '6px 11px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🧪 A/B Test Landerów</span>
          <span
            style={{
              fontSize: '10px',
              background: showAbModal ? 'rgba(9, 9, 11, 0.12)' : 'rgba(255, 255, 255, 0.08)',
              color: showAbModal ? '#09090b' : '#a1a1aa',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            DRAFT
          </span>
        </button>
      </div>

      {showAbModal && (
        <div style={{ width: '100%', marginTop: '10px' }}>
          <AbTestPanel defaultExpanded={true} preferredBrandKey={activeBrand} standalone={true} />
        </div>
      )}
    </>
  );
}
