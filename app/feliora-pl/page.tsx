'use client';

import React from 'react';
import FelioraPlWorkspace from '@/app/components/feliora-pl-workspace';

export default function FelioraPlPage() {
  return (
    <FelioraPlWorkspace
      onSwitchToOrthomax={() => {
        window.location.href = '/antki-pl?brand=orthomax';
      }}
    />
  );
}
