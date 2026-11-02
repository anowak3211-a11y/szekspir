'use client';

import React, { useEffect, useState } from 'react';
import KrystynaStoryPdpPage from '../kp-krystyna-1/page';

export default function OrthomaxAbRouterPage() {
  const [assigned, setAssigned] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const forced = sp.get('ab')?.toUpperCase();
      const key = '_sz_ab_orthomax-noom-v1';
      let v = localStorage.getItem(key) as 'A' | 'B' | null;

      if (forced === 'A' || forced === 'B') {
        v = forced;
        localStorage.setItem(key, v);
      } else if (v !== 'A' && v !== 'B') {
        v = Math.random() < 0.5 ? 'A' : 'B';
        localStorage.setItem(key, v);
      }

      let vid = localStorage.getItem('_sz_ab_vid');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('_sz_ab_vid', vid);
      }

      if (v === 'A') {
        fetch('/api/ab-test/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experimentId: 'orthomax-noom-v1',
            variant: 'A',
            event: 'view',
            visitorId: vid,
            url: window.location.href,
          }),
          keepalive: true,
        }).catch(() => {});

        sp.set('ab', 'A');
        sp.set('_sz_ab_exp', 'orthomax-noom-v1');
        sp.set('_sz_ab_var', 'A');
        window.location.replace(`https://orthomax.pl/products/orthomax-stepmax?${sp.toString()}`);
        return;
      }

      setAssigned('B');
    } catch {
      setAssigned('B');
    }
  }, []);

  if (assigned !== 'B') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F5F2EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#121633',
          fontSize: 15,
        }}
      >
        Ładowanie strony Orthomax Polska...
      </div>
    );
  }

  return <KrystynaStoryPdpPage />;
}
