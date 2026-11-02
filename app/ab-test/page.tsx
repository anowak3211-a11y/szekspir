'use client';

import React from 'react';
import AbTestPanel from '@/app/components/ab-test-panel';

export default function AbTestPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#09090b',
        color: '#f4f4f5',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '28px 24px 64px',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 18,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a
              href="/"
              style={{
                color: '#a1a1aa',
                textDecoration: 'none',
                fontSize: 12.5,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 6,
                background: '#121215',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              ← Szekspir
            </a>
            <a
              href="/antki-pl"
              style={{
                color: '#e4e4e7',
                textDecoration: 'none',
                fontSize: 12.5,
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 6,
                background: '#18181b',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Fabryka Antków PL →
            </a>
          </div>
          <div style={{ fontSize: 12, color: '#71717a' }}>
            Tryb bezpieczny: <strong style={{ color: '#e4e4e7' }}>DRAFT · WSTRZYMANY</strong> (zero ingerencji w live ruch orthomax.pl)
          </div>
        </div>

        <AbTestPanel defaultExpanded={true} standalone={true} />
      </div>
    </main>
  );
}
