'use client';

import React from 'react';
import AbTestPanel from '@/app/components/ab-test-panel';

export default function AbTestPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #090d16 0%, #020617 100%)',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: 1480, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="/"
              style={{
                color: '#93c5fd',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              ← Strona główna Szekspir
            </a>
            <a
              href="/antki-pl"
              style={{
                color: '#fdba74',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(249, 115, 22, 0.14)',
                border: '1px solid rgba(249, 115, 22, 0.35)',
              }}
            >
              🇵🇱 Przejdź do Fabryki Antków PL →
            </a>
          </div>
        </div>

        <AbTestPanel defaultExpanded={true} standalone={true} />
      </div>
    </main>
  );
}
