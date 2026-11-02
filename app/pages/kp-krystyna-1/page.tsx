'use client';

import React, { useEffect, useMemo, useState } from 'react';

type ColorOption = 'Pomarańczowy' | 'Czarny';
type SizeOption =
  | '29-30'
  | '31-32'
  | '33-34'
  | '35-36'
  | '37-38'
  | '39-40'
  | '41-42'
  | '43-44'
  | '45-46'
  | '47-48'
  | '49-50';

const SIZES: Array<{ size: SizeOption; mm: number }> = [
  { size: '29-30', mm: 205 },
  { size: '31-32', mm: 215 },
  { size: '33-34', mm: 225 },
  { size: '35-36', mm: 235 },
  { size: '37-38', mm: 245 },
  { size: '39-40', mm: 255 },
  { size: '41-42', mm: 265 },
  { size: '43-44', mm: 275 },
  { size: '45-46', mm: 285 },
  { size: '47-48', mm: 295 },
  { size: '49-50', mm: 305 },
];

const VARIANT_MAP: Record<ColorOption, Record<SizeOption, number>> = {
  Pomarańczowy: {
    '29-30': 52263610777937,
    '31-32': 52263610810705,
    '33-34': 52263610843473,
    '35-36': 51651759571281,
    '37-38': 51651759604049,
    '39-40': 51651759636817,
    '41-42': 51651759669585,
    '43-44': 51651759702353,
    '45-46': 51651759735121,
    '47-48': 52557286015313,
    '49-50': 52557286048081,
  },
  Czarny: {
    '29-30': 52418348581201,
    '31-32': 52418348613969,
    '33-34': 52418348646737,
    '35-36': 52418348679505,
    '37-38': 52418348712273,
    '39-40': 52418348745041,
    '41-42': 52418348777809,
    '43-44': 52418348810577,
    '45-46': 52418348843345,
    '47-48': 52557286080849,
    '49-50': 52557286113617,
  },
};

const PRODUCT_IMAGES = [
  'https://cdn.shopify.com/s/files/1/0957/2355/3105/files/1_3fecbcbf-f4d2-4ca0-951d-17b7b52afbdd.png?v=1766882086',
  'https://cdn.shopify.com/s/files/1/0957/2355/3105/files/cz_1.png?v=1768005083',
  'https://cdn.shopify.com/s/files/1/0957/2355/3105/files/2_b62311d4-2d83-49d3-85a4-1b5d123d2db3.png?v=1768005083',
  'https://cdn.shopify.com/s/files/1/0957/2355/3105/files/c678d0b5-5794-452c-b809-0f2fab65204c.png?v=1768005083',
  'https://cdn.shopify.com/s/files/1/0957/2355/3105/files/5b8a3eb4-a019-4a98-8f27-0ef5ee9a9152.png?v=1768005083',
  'https://cdn.shopify.com/s/files/1/0957/2355/3105/files/Your_paragraph_text_4.png?v=1768005083',
];

// Kaching Bundles base64 property values verified on orthomax.pl
const KACHING_PROP_2_PAIRS =
  'eyJkZWFsIjoiaFBHViIsInBwIjoxMDI4NjQ3ODU5MDI4OSwibWFpbiI6dHJ1ZSwidiI6ImU2MGYyZjliLTdhYTUtNDRiOC05ZWM2LTIzNzg4NDVlZDY0OCIsImlkIjoia2NoMiIsImJpZCI6InRLVDkifQ==';
const KACHING_PROP_4_PAIRS =
  'eyJkZWFsIjoiaFBHViIsInBwIjoxMDI4NjQ3ODU5MDI4OSwibWFpbiI6dHJ1ZSwidiI6ImU2MGYyZjliLTdhYTUtNDRiOC05ZWM2LTIzNzg4NDVlZDY0OCIsImlkIjoia2NoNCIsImJpZCI6IlNnV1IifQ==';

type PairSelection = {
  color: ColorOption;
  size: SizeOption;
};

export default function KrystynaStoryPdpPage() {
  const [bundleQty, setBundleQty] = useState<1 | 2 | 4>(2);
  const [pairs, setPairs] = useState<PairSelection[]>([
    { color: 'Pomarańczowy', size: '39-40' },
    { color: 'Czarny', size: '39-40' },
    { color: 'Pomarańczowy', size: '41-42' },
    { color: 'Czarny', size: '41-42' },
  ]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [visitorId, setVisitorId] = useState('v_anon');
  const [trackingAttrs, setTrackingAttrs] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      let vid = localStorage.getItem('_sz_ab_vid');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('_sz_ab_vid', vid);
      }
      setVisitorId(vid);

      const sp = new URLSearchParams(window.location.search);
      const attrs: Record<string, string> = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'].forEach(k => {
        const v = sp.get(k);
        if (v) attrs[k] = v;
      });
      setTrackingAttrs(attrs);

      const viewOnceKey = '_sz_viewed_orthomax-noom-v1_B';
      if (!sessionStorage.getItem(viewOnceKey)) {
        sessionStorage.setItem(viewOnceKey, '1');
        fetch('/api/ab-test/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experimentId: 'orthomax-noom-v1',
            variant: 'B',
            event: 'view',
            visitorId: vid,
            url: window.location.href,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  }, []);

  const activePairs = useMemo(() => pairs.slice(0, bundleQty), [pairs, bundleQty]);

  function updatePair(idx: number, patch: Partial<PairSelection>) {
    setPairs(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
    if (patch.color === 'Czarny') setActiveImageIdx(1);
    if (patch.color === 'Pomarańczowy') setActiveImageIdx(0);
  }

  function scrollToBuybox(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    const el = document.getElementById('kup');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCheckoutSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitting(true);
    try {
      const payload = {
        experimentId: 'orthomax-noom-v1',
        variant: 'B',
        visitorId,
        url: window.location.href,
      };
      fetch('/api/ab-test/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, event: 'atc' }),
        keepalive: true,
      }).catch(() => {});
      fetch('/api/ab-test/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, event: 'ic' }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
    // Native form POST continues to https://orthomax.pl/cart/add -> /checkout
    void e;
  }

  const kachingProp =
    bundleQty === 2 ? KACHING_PROP_2_PAIRS : bundleQty === 4 ? KACHING_PROP_4_PAIRS : '';

  return (
    <div className="flhl">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@400;500;600;700;800&display=swap"
      />
      <style>{`
        .flhl {
          --cream: #F5F2EC;
          --warm-white: #FDFBF8;
          --sand: #EAE4D8;
          --border: #DDD6C8;
          --ink: #121633;
          --body: #2A2E45;
          --muted: #666A7E;
          --accent: #E8521A;
          --accent-dark: #C43E0C;
          --accent-soft: #FFF1EB;
          --green: #1E7A46;
          --green-soft: #EAF6EE;
          --red: #B91C1C;
          --red-soft: #FEF2F2;
          font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--body);
          background: var(--cream);
          line-height: 1.65;
          font-size: 17px;
          -webkit-font-smoothing: antialiased;
          padding-bottom: 84px;
        }
        .flhl * { box-sizing: border-box; }
        .flhl h1, .flhl h2, .flhl h3, .flhl .serif {
          font-family: 'Instrument Serif', Georgia, serif;
          color: var(--ink);
          font-weight: 400;
          line-height: 1.16;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .flhl-topbar {
          background: var(--ink);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 16px;
          text-align: center;
          letter-spacing: 0.01em;
        }
        .flhl-topbar span { color: #FBBF24; }
        .flhl-header {
          background: var(--warm-white);
          border-bottom: 1px solid var(--border);
          padding: 12px 20px;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .flhl-header-inner {
          max-width: 1040px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .flhl-brand {
          font-weight: 800;
          font-size: 20px;
          color: var(--ink);
          letter-spacing: -0.03em;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .flhl-brand-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--accent);
          display: inline-block;
        }
        .flhl-header-cta {
          background: var(--accent);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 16px;
          border-radius: 999px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .flhl-header-cta:hover { background: var(--accent-dark); }
        .flhl-wrap {
          max-width: 780px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .flhl-wrap-wide {
          max-width: 1020px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .flhl-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 18px;
        }
        .flhl-hero {
          padding: 36px 0 32px;
          border-bottom: 1px solid var(--border);
        }
        .flhl-hero h1 {
          font-size: clamp(34px, 5.2vw, 52px);
          margin-bottom: 16px;
        }
        .flhl-hero h1 em {
          font-style: italic;
          color: var(--accent);
        }
        .flhl-sub {
          font-size: clamp(17px, 2.2vw, 20px);
          color: var(--body);
          margin-bottom: 24px;
          line-height: 1.55;
        }
        .flhl-notatka {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-left: 4px solid var(--accent);
          border-radius: 14px;
          padding: 20px 22px;
          margin: 24px 0;
          box-shadow: 0 6px 20px rgba(18, 22, 51, 0.04);
        }
        .flhl-notatka-hdr {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .flhl-avatar {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          background: var(--sand);
          color: var(--ink);
          font-weight: 800;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          flex-shrink: 0;
        }
        .flhl-sec {
          padding: 48px 0;
          border-bottom: 1px solid var(--border);
        }
        .flhl-sec-tag {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 10px;
        }
        .flhl-sec h2 {
          font-size: clamp(28px, 4.2vw, 40px);
          margin-bottom: 18px;
        }
        .flhl-card {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          margin: 20px 0;
        }
        .flhl-chain {
          background: var(--ink);
          color: #fff;
          border-radius: 16px;
          padding: 26px 24px;
          margin: 24px 0;
        }
        .flhl-chain-step {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 15px;
        }
        .flhl-chain-arrow {
          text-align: center;
          color: #FB923C;
          font-size: 20px;
          font-weight: 800;
          padding: 6px 0;
        }
        .flhl-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .flhl-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 720px) {
          .flhl-grid-2, .flhl-grid-3, .flhl-buybox-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .flhl-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: var(--accent);
          color: #fff;
          font-weight: 800;
          font-size: 17px;
          padding: 17px 26px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(232, 82, 26, 0.28);
          transition: transform 0.12s, background 0.15s;
        }
        .flhl-btn-primary:hover {
          background: var(--accent-dark);
          transform: translateY(-1px);
        }
        .flhl-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--warm-white);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          font-size: 14px;
        }
        .flhl-table th, .flhl-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          text-align: left;
        }
        .flhl-table th {
          background: var(--sand);
          color: var(--ink);
          font-weight: 700;
        }
        .flhl-table tr.highlight td {
          background: var(--accent-soft);
          font-weight: 700;
          color: var(--ink);
        }
        .flhl-buybox-grid {
          display: grid;
          grid-template-columns: 1fr 1.08fr;
          gap: 28px;
          align-items: start;
        }
        .flhl-tier {
          border: 2px solid var(--border);
          background: #fff;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }
        .flhl-tier.active {
          border-color: var(--accent);
          background: var(--accent-soft);
          box-shadow: 0 6px 18px rgba(232, 82, 26, 0.12);
        }
        .flhl-tier-badge {
          position: absolute;
          top: -11px;
          right: 14px;
          background: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 999px;
          letter-spacing: 0.04em;
        }
        .flhl-sticky {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(18, 22, 51, 0.96);
          backdrop-filter: blur(8px);
          color: #fff;
          padding: 12px 16px;
          z-index: 50;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
      `}</style>

      {/* TOP BAR */}
      <div className="flhl-topbar">
        <span>★★★★★</span> Oceniane 4.8/5 przez ponad 80 000+ Polaków ·{' '}
        <strong style={{ textDecoration: 'underline' }}>30 dni na test w swoich butach albo zwrot pieniędzy</strong>
      </div>

      {/* STICKY HEADER */}
      <header className="flhl-header">
        <div className="flhl-header-inner">
          <a href="#kup" onClick={scrollToBuybox} className="flhl-brand">
            <span className="flhl-brand-dot" />
            ORTHOMAX <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>StepMax · Polska</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'none' }} className="sm-show">
              Historia Krystyny, 62 lata, Wrocław
            </span>
            <button type="button" onClick={scrollToBuybox} className="flhl-header-cta">
              Odbierz 1+1 GRATIS →
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="flhl-hero">
        <div className="flhl-wrap">
          <div className="flhl-eyebrow">
            <span>📖</span> Historia Krystyny, 62 lata, Wrocław · <strong>ciąg dalszy</strong>
          </div>

          <h1>
            „Zaczęłabym od przyczyny.” Moje kolano cierpiało 4 lata, bo <em>nikt nie spojrzał na moje stopy</em>.
          </h1>

          <p className="flhl-sub">
            Przez 4 lata i u 5 specjalistów leczyłam sam skutek w kolanie — maściami, tabletkami, zastrzykami za 1500 zł i fizjoterapią. Dopiero 10-sekundowy test u ostatniego specjalisty pokazał, dlaczego przy każdym kroku moja kość tarła o kość.
          </p>

          {/* NOTATKA OD KRYSTYNY */}
          <div className="flhl-notatka">
            <div className="flhl-notatka-hdr">
              <div className="flhl-avatar">KW</div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 15 }}>
                  Krystyna, 62 lata (Wrocław)
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Zweryfikowana klientka Orthomax · 3. piętro bez windy
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 15.5, color: 'var(--body)' }}>
              „Jeśli przyszłaś lub przyszedłeś tutaj z mojego wpisu — dziękuję, że przeczytałaś moją historię do końca. Dostaję dziesiątki wiadomości z jednym pytaniem: <strong>jak dokładnie działają te 3 punkty podparcia i dlaczego zwykłe wkładki z apteki mi nie pomogły?</strong> Poniżej zebraliśmy razem z zespołem Orthomax całą kartkę, którą rozrysował mi lekarz, porównanie kosztów i mój dziennik z pierwszych 6 tygodni.”
            </p>
          </div>

          {/* 3 QUICK PILLS */}
          <div className="flhl-grid-3" style={{ margin: '22px 0' }}>
            <div className="flhl-card" style={{ margin: 0, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
                1. KORYTKO PIĘTY (U-CUP)
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700, marginBottom: 4 }}>
                Blokuje uciekanie kostki do środka
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Zatrzymuje nadmierną pronację, która przy każdym kroku wykręca piszczel i kolano jak śrubę.
              </div>
            </div>
            <div className="flhl-card" style={{ margin: 0, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
                2. DYNAMICZNY MOSTEK ŁUKU
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700, marginBottom: 4 }}>
                Pracuje jak resor, nie jak plastik
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Podpiera łuk podłużny i poprzeczny bez wbijania się w stopę i bez wysadzania pięty z buta.
              </div>
            </div>
            <div className="flhl-card" style={{ margin: 0, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
                3. TARCZA ANTYWSTRZĄSOWA
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 700, marginBottom: 4 }}>
                Pochłania uderzenie o beton i schody
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Zdejmuje mikro-wstrząsy z pięty i szpary stawowej kolana przy schodzeniu ze schodów.
              </div>
            </div>
          </div>

          <button type="button" onClick={scrollToBuybox} className="flhl-btn-primary">
            Sprawdź dostępność swojego rozmiaru (Pakiet 1+1 GRATIS) ↓
          </button>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
            🔒 30 dni na test w swoich butach (nawet po przycięciu) · Wysyłka z Polski w 24h
          </div>
        </div>
      </section>

      {/* SECTION 1: KARTKA OD LEKARZA / MECHANIZM */}
      <section className="flhl-sec">
        <div className="flhl-wrap">
          <div className="flhl-sec-tag">KARTKA, KTÓRĄ NARYSOWAŁ MI LEKARZ</div>
          <h2>Kość trze o kość w kolanie. Ale dlaczego? Bo przy każdym kroku zapada się fundament.</h2>
          <p>
            Kiedy drugi ortopeda powiedział słowo <strong>„endoproteza — 35 000 zł prywatnie albo lata czekania”</strong>, myślałam, że moje kolano po prostu się zużyło ze starości. Ale zadaj sobie jedno pytanie: dlaczego zużyło się akurat od wewnętrznej strony i dlaczego każde 15 minut spaceru kończyło się nocnym pulsowaniem o 2:00 nad ranem?
          </p>
          <p>
            Odpowiedź zobaczyłam dopiero wtedy, gdy ostatni lekarz kazał mi zdjąć buty, stanąć boso i przez 10 sekund uniósł dłońmi łuki moich stóp o 8 milimetrów w górę. W jednej chwili kłucie pod rzepką przy przysiadzie zniknęło o połowę. Wtedy narysował mi na kartce ten prosty łańcuch:
          </p>

          <div className="flhl-chain">
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#FB923C', marginBottom: 14 }}>
              ŁAŃCUCH PRZECIĄŻENIOWY (EFEKT DOMINA OD STOPY DO KOLANA)
            </div>
            <div className="flhl-chain-step">
              <strong>1. Płaska fabryczna wkładka w bucie (2 mm pianki):</strong> Po 40. roku życia więzadła stopy słabną. Na płaskiej podeszwie łuk stopy nie ma żadnego oparcia i przy każdym kroku opada w dół.
            </div>
            <div className="flhl-chain-arrow">↓</div>
            <div className="flhl-chain-step">
              <strong>2. Uciekająca do środka pięta (nadmierna pronacja o 10–12°):</strong> Kość piętowa przechyla się do wewnątrz jak w zdartym od środka bucie.
            </div>
            <div className="flhl-chain-arrow">↓</div>
            <div className="flhl-chain-step">
              <strong>3. Rotacja kości piszczelowej jak śruba:</strong> Skoro kostka ucieka do środka, piszczel obraca się razem z nią przy każdym z 5000 kroków dziennie.
            </div>
            <div className="flhl-chain-arrow">↓</div>
            <div className="flhl-chain-step" style={{ borderColor: '#F97316', background: 'rgba(249, 115, 22, 0.16)' }}>
              <strong>4. Zmiażdżona szpara stawowa kolana (Poranna sztywność, schody i nocny ból):</strong> Kolano to zawias, który ma zginać się prosto, a nie skręcać. Wykręcona piszczel dociska jedną stronę chrząstki i łąkotki jak w imadle — stąd stan zapalny, który budzi Cię o 2:00 w nocy.
            </div>
          </div>

          <p style={{ fontWeight: 600, color: 'var(--ink)' }}>
            Dopóki nie ustawisz pięty i łuku stopy z powrotem w osi, każdy krok po schodach czy chodniku na nowo rozgniata kolano — niezależnie od tego, czym posmarujesz skórę z wierzchu.
          </p>
        </div>
      </section>

      {/* SECTION 2: DLACZEGO WSZYSTKO POMAGAŁO TYLKO NA CHWILĘ */}
      <section className="flhl-sec">
        <div className="flhl-wrap">
          <div className="flhl-sec-tag">TO NIE TWOJA WINA</div>
          <h2>Dlaczego wszystko, czego próbowałam przez 4 lata, pomagało tylko na chwilę?</h2>
          <p>
            Przez 4 lata wydałam w aptekach i gabinetach ponad 3200 zł. Każda z tych metod miała jeden i ten sam błąd: próbowała wyciszyć alarm w kolanie, zostawiając zapadniętą stopę na dole bez zmian.
          </p>

          <div className="flhl-grid-2">
            <div className="flhl-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: 'var(--ink)', fontSize: 17 }}>1. Maści i żele z apteki</strong>
                <span style={{ background: 'var(--red-soft)', color: 'var(--red)', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                  Głębokość: 2–3 mm
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--muted)' }}>
                Substancja z żelu przenika przez skórę na 2–3 milimetry. Przeciążona szpara stawowa kolana leży na głębokości 2–3 centymetrów, a żel w żaden sposób nie prostuje uciekającej pięty. Chłodzi skórę na 2 godziny, po czym ból wraca.
              </p>
            </div>

            <div className="flhl-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: 'var(--ink)', fontSize: 17 }}>2. Tabletki przeciwbólowe</strong>
                <span style={{ background: 'var(--red-soft)', color: 'var(--red)', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                  Działanie: 4–6 godzin
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--muted)' }}>
                Blokują sygnał bólowy w układzie nerwowym na kilka godzin i obciążają żołądek, podczas gdy mechaniczny nacisk w krzywo ustawionym kolanie trwa nadal przy każdym kroku.
              </p>
            </div>

            <div className="flhl-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: 'var(--ink)', fontSize: 17 }}>3. Zastrzyki kwasu hialuronowego</strong>
                <span style={{ background: 'var(--red-soft)', color: 'var(--red)', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                  Koszt: ~1500 zł / seria
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--muted)' }}>
                Smarują staw od środka i dały mi 3 miesiące ulgi. Ale wlewanie najdroższego oleju do zawiasu, który jest wygięty pod kątem, kończy się tak samo: po 4 miesiącach kwas się ściera i wracasz do punktu wyjścia.
              </p>
            </div>

            <div className="flhl-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: 'var(--ink)', fontSize: 17 }}>4. Fizjoterapia (NFZ / 150 zł prywatnie)</strong>
                <span style={{ background: 'var(--red-soft)', color: 'var(--red)', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                  Ulga: 2 dni po wizycie
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--muted)' }}>
                Fizjoterapeutka rozluźniała napięte mięśnie na 45 minut. Ale zaraz po wyjściu z gabinetu wkładałam te same płaskie buty i przez kolejne 5000 kroków stopa znów wykręcała kolano do środka.
              </p>
            </div>
          </div>

          <div className="flhl-card" style={{ background: '#FFFDF9', borderLeft: '4px solid var(--ink)' }}>
            <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>
              A co ze zwykłymi wkładkami z marketu (29 zł) albo twardymi na wymiar (400 zł)?
            </strong>
            <p style={{ margin: 0, fontSize: 14.5 }}>
              Tanie żelowe wkładki z drogerii są miękkie jak galareta — pod ciężarem ciała ugniatają się do 1 mm i w ogóle nie trzymają pięty w pionie. Z kolei sztywne, plastikowe wkładki z punktu ortopedycznego za 400 zł są twarde jak deska, wysadzają piętę z buta i obcierają podbicie przy chodzeniu.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: 3 RZECZY NARAZ + TABELA PORÓWNAWCZA */}
      <section className="flhl-sec">
        <div className="flhl-wrap">
          <div className="flhl-sec-tag">MECHANIZM 3 PUNKTÓW PODPARCIA</div>
          <h2>Głębokie korytko pięty, sprężysty łuk i tarcza pod piętą. 3 rzeczy naraz.</h2>
          <p>
            Wkładki profilowane <strong>Orthomax StepMax</strong> zostały zaprojektowane tak, by od pierwszego kroku po założeniu butów przywrócić naturalną oś: <strong>stopa → kostka → kolano → biodro</strong>, bez efektu twardego plastiku.
          </p>

          <div style={{ overflowX: 'auto', margin: '24px 0' }}>
            <table className="flhl-table">
              <thead>
                <tr>
                  <th>Metoda</th>
                  <th>Koszt</th>
                  <th>Czy ustawia oś kolana?</th>
                  <th>Jak długo działa?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Maści i tabletki przeciwbólowe</td>
                  <td>60–120 zł / mies.</td>
                  <td>❌ Nie (tylko maskuje ból)</td>
                  <td>2–6 godzin</td>
                </tr>
                <tr>
                  <td>Zastrzyki kwasu hialuronowego</td>
                  <td>1200–1800 zł</td>
                  <td>❌ Nie (smaruje krzywy staw)</td>
                  <td>3–4 miesiące</td>
                </tr>
                <tr>
                  <td>Prywatna fizjoterapia</td>
                  <td>600–1200 zł / mies.</td>
                  <td>⚠️ Tylko w gabinecie</td>
                  <td>1–2 dni po sesji</td>
                </tr>
                <tr>
                  <td>Twarde wkładki na wymiar</td>
                  <td>380–450 zł / 1 para</td>
                  <td>⚠️ Sztywne, wysadzają piętę</td>
                  <td>Pasują tylko do 1 pary butów</td>
                </tr>
                <tr className="highlight">
                  <td><strong>Wkładki Orthomax StepMax (1+1 GRATIS)</strong></td>
                  <td><strong>99,99 zł za 2 pary (50 zł/para)</strong></td>
                  <td><strong>✅ Tak — przy każdym kroku</strong></td>
                  <td><strong>Codziennie przez 12+ miesięcy (30 dni gwarancji)</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 4: MOJE PIERWSZE 6 TYGODNI (TIMELINE) */}
      <section className="flhl-sec">
        <div className="flhl-wrap">
          <div className="flhl-sec-tag">DZIENNIK KRYSTYNY</div>
          <h2>Co się działo, kiedy zaczęłam? Moje pierwsze 6 tygodni bez koloryzowania.</h2>
          <p>
            Nie wierzę w cuda z reklam, które obiecują, że po 5 minutach pobiegniesz maraton. Moje kolano cierpiało 4 lata, więc potrzebowało czasu, żeby stan zapalny wokół odciążonego stawu wygasł. Tak wyglądało to u mnie tydzień po tygodniu:
          </p>

          <div className="flhl-card">
            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 13, marginBottom: 4 }}>
              ETAP 0 · TU ZACZĘŁAM
            </div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 18, marginBottom: 6 }}>
              Poranna sztywność 30 minut, lęk przed schodami na 3. piętro i pobudki o 2:00 w nocy
            </div>
            <p style={{ margin: 0, fontSize: 15 }}>
              Zakładałam skarpetki wyłącznie na siedząco na brzegu łóżka. Na klatce schodowej sąsiedzi wyprzedzali mnie w ciszy, a ja trzymałam się poręczy obiema rękami. Zamówiłam pakiet 1+1 GRATIS (jedna para do półbutów na dwór, druga do domowych kapci) tylko dlatego, że było 30 dni na zwrot. Pudełko zostawiłam na szafie z myślą: jak nic to nie da, odsyłam.
            </p>
          </div>

          <div className="flhl-card">
            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 13, marginBottom: 4 }}>
              DNI 1–3 · PIERWSZE WRAŻENIE
            </div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 18, marginBottom: 6 }}>
              Wyraźne podparcie pod łukiem i pierwszy wieczór bez „rozpychania” w kolanie
            </div>
            <p style={{ margin: 0, fontSize: 15 }}>
              Przez pierwsze 2 godziny w butach czułam pod stopą wyraźny sprężysty profil — to normalne, bo stopa przez lata leżała na płasko. Ale już 3. dnia wieczorem, kiedy wróciłam z zakupów w Biedronce, złapałam się na tym, że siedzę w fotelu i kolano nie pulsuje tępym bólem.
            </p>
          </div>

          <div className="flhl-card">
            <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 13, marginBottom: 4 }}>
              TYDZIEŃ 2 · PRZESPANA NOC
            </div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 18, marginBottom: 6 }}>
              Pierwsza noc od kilkunastu miesięcy bez budzenia się o 2:00 i 3:00 nad ranem
            </div>
            <p style={{ margin: 0, fontSize: 15 }}>
              Kiedy przestałam miażdżyć wewnętrzną stronę kolana w dzień, nocny stan zapalny zaczął wreszcie wygasać. Rano pierwsze kroki do kuchni nie przypominały już chodzenia na zardzewiałym zawiasie — sztywność skróciła się z 30 minut do kilkunastu sekund.
            </p>
          </div>

          <div className="flhl-card" style={{ borderLeft: '4px solid var(--green)' }}>
            <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 13, marginBottom: 4 }}>
              TYDZIEŃ 4–6 · SCHODY I SPACERY
            </div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 18, marginBottom: 6 }}>
              Wchodzę na 3. piętro normalnym krokiem. Wróciłam do 45-minutowych spacerów.
            </div>
            <p style={{ margin: 0, fontSize: 15 }}>
              Napiszę uczciwie: to nie jest tak, że w wieku 62 lat mam kolana 20-latki. Przy nagłej zmianie pogody na deszcz czasem jeszcze lekko je poczuję. Ale ból zszedł z 8/10 na 1/10, pudełko z tabletkami leży nietknięte w szufladzie, a temat operacji za 35 000 zł przestał istnieć. To nie był cud. To była czysta biomechanika.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: BUYBOX (#kup) */}
      <section id="kup" className="flhl-sec" style={{ background: 'var(--warm-white)' }}>
        <div className="flhl-wrap-wide">
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 32px' }}>
            <div className="flhl-sec-tag">OFICJALNE ZAMÓWIENIE ORTHOMAX POLSKA</div>
            <h2>Wybierz swój pakiet i przetestuj StepMax przez 30 dni bez ryzyka</h2>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>
              Większość czytelników historii Krystyny wybiera <strong>Pakiet 1+1 GRATIS (2 pary za 99,99 zł)</strong> — 1 parę wkładają do butów wyjściowych, a 2. parę do obuwia domowego lub dla małżonka (możesz wybrać 2 różne rozmiary i kolory!).
            </p>
          </div>

          <div className="flhl-buybox-grid">
            {/* LEFT: GALLERY */}
            <div>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <img
                  src={PRODUCT_IMAGES[activeImageIdx]}
                  alt="Wkładki Profilowane Orthomax StepMax"
                  style={{ width: '100%', height: 'auto', borderRadius: 12, display: 'block' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {PRODUCT_IMAGES.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    style={{
                      padding: 4,
                      borderRadius: 10,
                      border: activeImageIdx === i ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={src} alt="" style={{ width: '100%', borderRadius: 6, display: 'block' }} />
                  </button>
                ))}
              </div>

              {/* GUARANTEE CARD BELOW GALLERY */}
              <div
                className="flhl-card"
                style={{
                  background: 'var(--green-soft)',
                  borderColor: '#A7F3D0',
                  marginTop: 18,
                  padding: 18,
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 15, marginBottom: 4 }}>
                  🛡️ 30-dniowa Gwarancja Satysfakcji Orthomax (Nawet po docięciu!)
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: '#065F46' }}>
                  Włóż wkładki do swoich ulubionych butów, dopasuj je nożyczkami wzdłuż linii rozmiaru i chodź w nich przez pełne 30 dni. Jeśli Twoje kolana, pięty i stopy nie poczują wyraźnej ulgi na schodach i spacerach — napisz do nas, a zwrócimy Ci 100% pieniędzy.
                </p>
              </div>
            </div>

            {/* RIGHT: INTERACTIVE BUNDLE PICKER & FORM POST TO ORTHOMAX.PL */}
            <div
              style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 18,
                padding: 24,
                boxShadow: '0 12px 32px rgba(18, 22, 51, 0.06)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>
                ● W magazynie w Polsce — wysyłka w 24h (InPost / Kurier)
              </div>
              <h3 style={{ fontSize: 28, marginBottom: 6 }}>Wkładki Profilowane Orthomax StepMax</h3>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 18 }}>
                ★★★★★ <strong>4.8/5</strong> (7238 zweryfikowanych opinii klientów)
              </div>

              {/* BUNDLE TIERS */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
                  1. WYBIERZ PAKIET:
                </div>

                {/* TIER 1 */}
                <div
                  className={`flhl-tier ${bundleQty === 1 ? 'active' : ''}`}
                  onClick={() => setBundleQty(1)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="radio" checked={bundleQty === 1} onChange={() => setBundleQty(1)} />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 16 }}>
                          1 para (Pakiet Testowy)
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                          Do 1 pary butów · 99,99 zł / para
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>99,99 zł</div>
                    </div>
                  </div>
                </div>

                {/* TIER 2: 1+1 GRATIS */}
                <div
                  className={`flhl-tier ${bundleQty === 2 ? 'active' : ''}`}
                  onClick={() => setBundleQty(2)}
                >
                  <div className="flhl-tier-badge">WYBÓR KRYSTYNY · 1+1 GRATIS!</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="radio" checked={bundleQty === 2} onChange={() => setBundleQty(2)} />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 16 }}>
                          KUP 1, otrzymaj 1 GRATIS! (2 pary)
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--accent-dark)', fontWeight: 700 }}>
                          Tylko 50,00 zł / para · Druga para za 0 zł!
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--accent)' }}>99,99 zł</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>
                        199,98 zł
                      </div>
                    </div>
                  </div>
                </div>

                {/* TIER 3: 2+2 GRATIS */}
                <div
                  className={`flhl-tier ${bundleQty === 4 ? 'active' : ''}`}
                  onClick={() => setBundleQty(4)}
                >
                  <div className="flhl-tier-badge" style={{ background: 'var(--ink)' }}>
                    NAJBARDZIEJ OPŁACALNE + DARMOWA DOSTAWA
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="radio" checked={bundleQty === 4} onChange={() => setBundleQty(4)} />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 16 }}>
                          KUP 2, otrzymaj 2 GRATIS! (4 pary)
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--green)', fontWeight: 700 }}>
                          Tylko 38,75 zł / para + DARMOWA WYSYŁKA
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--ink)' }}>155,00 zł</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>
                        399,96 zł
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PER-PAIR COLOR & SIZE SELECTORS */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
                    2. WYBIERZ KOLOR I ROZMIAR DLA KAŻDEJ PARY:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    📏 Tabela rozmiarów (mm)
                  </button>
                </div>

                {activePairs.map((pair, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '76px 1fr 1fr',
                      gap: 8,
                      alignItems: 'center',
                      background: 'var(--cream)',
                      padding: '10px 12px',
                      borderRadius: 10,
                      marginBottom: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
                      Para #{idx + 1}
                      {idx >= bundleQty / 2 && bundleQty > 1 && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: 10,
                            color: 'var(--green)',
                            fontWeight: 800,
                          }}
                        >
                          GRATIS
                        </span>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>
                        Kolor
                      </label>
                      <select
                        value={pair.color}
                        onChange={e => updatePair(idx, { color: e.target.value as ColorOption })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: '#fff',
                          fontWeight: 600,
                          fontSize: 13.5,
                          color: 'var(--ink)',
                        }}
                      >
                        <option value="Pomarańczowy">🟠 Pomarańczowy</option>
                        <option value="Czarny">⚫ Czarny</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>
                        Rozmiar UE
                      </label>
                      <select
                        value={pair.size}
                        onChange={e => updatePair(idx, { size: e.target.value as SizeOption })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: '#fff',
                          fontWeight: 700,
                          fontSize: 13.5,
                          color: 'var(--ink)',
                        }}
                      >
                        {SIZES.map(s => (
                          <option key={s.size} value={s.size}>
                            {s.size} ({s.mm} mm)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* NATIVE SHOPIFY CART/ADD FORM -> CHECKOUT */}
              <form
                method="POST"
                action="https://orthomax.pl/cart/add"
                onSubmit={handleCheckoutSubmit}
              >
                <input type="hidden" name="return_to" value="/checkout" />
                <input type="hidden" name="attributes[_sz_ab_exp]" value="orthomax-noom-v1" />
                <input type="hidden" name="attributes[_sz_ab_var]" value="B" />
                <input type="hidden" name="attributes[_sz_ab_vid]" value={visitorId} />
                {Object.entries(trackingAttrs).map(([k, v]) => (
                  <input key={k} type="hidden" name={`attributes[${k}]`} value={v} />
                ))}

                {activePairs.map((pair, idx) => {
                  const variantId = VARIANT_MAP[pair.color][pair.size];
                  return (
                    <React.Fragment key={idx}>
                      <input type="hidden" name={`items[${idx}][id]`} value={String(variantId)} />
                      <input type="hidden" name={`items[${idx}][quantity]`} value="1" />
                      {kachingProp && (
                        <input
                          type="hidden"
                          name={`items[${idx}][properties][__kaching_bundles]`}
                          value={kachingProp}
                        />
                      )}
                    </React.Fragment>
                  );
                })}

                <button type="submit" className="flhl-btn-primary" disabled={submitting}>
                  {submitting
                    ? 'Przekierowywanie do bezpiecznej kasy Orthomax.pl...'
                    : bundleQty === 2
                    ? 'ZAMAWIAM PAKIET 1+1 GRATIS (99,99 ZŁ) →'
                    : bundleQty === 4
                    ? 'ZAMAWIAM PAKIET 2+2 GRATIS (155,00 ZŁ) →'
                    : 'ZAMAWIAM 1 PARĘ Z GWARANCJĄ 30 DNI (99,99 ZŁ) →'}
                </button>
              </form>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  fontSize: 12,
                  color: 'var(--muted)',
                  marginTop: 14,
                }}
              >
                <span>✅ BLIK / Przelewy24 / Karta / Apple Pay</span>
                <span>✅ 30 dni na zwrot</span>
                <span>✅ Wysyłka z Polski</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ */}
      <section className="flhl-sec">
        <div className="flhl-wrap">
          <div className="flhl-sec-tag">NAJCZĘSTSZE PYTANIA</div>
          <h2>Pytania, które najczęściej zadajecie po przeczytaniu mojej historii</h2>

          {[
            {
              q: 'Czy wkładki Orthomax StepMax zmieszczą się do moich zwykłych butów i jesiennych botków?',
              a: 'Tak. W przeciwieństwie do grubych plastikowych wkładek z punktów ortopedycznych za 400 zł, które wysadzają piętę z buta, StepMax mają smukły profil w przedniej części. Wystarczy wyjąć fabryczną, płaską wkładkę z buta i na jej miejsce włożyć StepMax.',
            },
            {
              q: 'Co jeśli wybiorę rozmiar na granicy (np. między 38 a 39)?',
              a: 'Każda para posiada na przodzie wyraźne linie docięcia. Jeśli jesteś pomiędzy rozmiarami, wybierz większy i w 30 sekund przytnij sam czubek zwykłymi nożyczkami domowymi, przykładając swoją starą wkładkę jako wzór. Nasza 30-dniowa gwarancja zwrotu obowiązuje nawet po docięciu wkładek!',
            },
            {
              q: 'Dlaczego najbardziej opłaca się wziąć pakiet 1+1 GRATIS (2 pary)?',
              a: 'Po pierwsze: płacisz dokładnie tyle samo co za 1 parę (99,99 zł zamiast 199,98 zł), a drugą parę dostajesz za 0 zł. Po drugie: żeby kolano przestało boleć, stopa potrzebuje podparcia również w domu na twardych panelach i płytkach — 1 parę wkładasz do butów wyjściowych, a 2. parę do domowych kapci lub drugich butów bez ciągłego przekładania.',
            },
            {
              q: 'Jak działa 30-dniowa gwarancja zwrotu pieniędzy?',
              a: 'Masz pełne 30 dni od odebrania paczki, żeby chodzić we wkładkach na co dzień. Jeśli nie poczujesz wyraźnej ulgi w kolanach, piętach i stopach przy chodzeniu po schodach czy spacerach, po prostu napisz do naszego polskiego biura obsługi na kontakt@orthomax.pl, a zwrócimy Ci pieniądze.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flhl-card"
              style={{ margin: '12px 0', padding: '18px 20px', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <strong style={{ color: 'var(--ink)', fontSize: 16 }}>{item.q}</strong>
                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 20 }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </div>
              {openFaq === i && (
                <p style={{ margin: '10px 0 0', fontSize: 15, color: 'var(--body)' }}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SIZE MODAL */}
      {showSizeModal && (
        <div
          onClick={() => setShowSizeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 22, 51, 0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 24 }}>Tabela rozmiarów StepMax</h3>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <table className="flhl-table">
              <thead>
                <tr>
                  <th>Rozmiar UE</th>
                  <th>Długość wkładki (mm)</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map(s => (
                  <tr key={s.size}>
                    <td><strong>{s.size}</strong></td>
                    <td>{s.mm} mm (możliwość docięcia)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM BAR */}
      <div className="flhl-sticky">
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              Orthomax StepMax · Pakiet 1+1 GRATIS
            </div>
            <div style={{ fontSize: 12, color: '#CBD5E1' }}>
              2 pary za 99,99 zł (50 zł/para) · 30 dni na test bez ryzyka
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToBuybox}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 13.5,
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Wybierz rozmiar →
          </button>
        </div>
      </div>
    </div>
  );
}
