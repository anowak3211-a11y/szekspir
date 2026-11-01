'use client';

import React from 'react';
import FelioraPlWorkspace from '@/app/components/feliora-pl-workspace';

export default function FelioraPlPage() {
  return (
    <FelioraPlWorkspace
      onSwitchToSardianSzampon={() => {
        window.location.href = '/antki-pl?brand=sardian-szampon';
      }}
      onSwitchToStryde={() => {
        window.location.href = '/antki-pl?brand=stryde';
      }}
      onSwitchToFelioraPies={() => {
        window.location.href = '/antki-pl?brand=feliora-pies';
      }}
      onSwitchToOrthomax={() => {
        window.location.href = '/antki-pl?brand=orthomax';
      }}
    />
  );
}
