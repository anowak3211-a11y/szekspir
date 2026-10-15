/* ============================================================================
   Ads X-Ray, tryb „Similarities” (13.10.2026 (Ads X-Ray)).
   Port 1:1 narzędzia /similarities (backend/templates/similarities.html, które
   zostaje nietknięte do porównania) na wspólnych silnikach:
   - jednostka = ZDANIE z wspólnego splittera window.XZdania.zakresy (te same granice
     co Skrypty PL: bez cięcia po „Dr.”, „Np.”, w liczbach i adresach), tekst wierszy
     to WYCINEK oryginału (bezstratnie); linia z kilkoma zdaniami w akapicie
     wielolinijkowym jest dzielona dalej XZdania.podzielRegex, żeby inne łamanie linii
     dalej dawało 100% (lekcja 1.1.163); bez XZdania zostaje stary simUnits,
   - parowanie zdań: programowanie dynamiczne simPairBlock bez zmian (1.1.427),
   - słowa w parze: Myers z cdiff.js (CD._t.diffSeq) zamiast naiwnego LCS O(n·m);
     słowa porównane po simNormWord jak dotąd, % = round(200·wspólne/(A+B)),
   - kotwice zdań dla dużych tekstów: też Myers z cdiff.js (stary LCS jako zapas).
   Silnik jest czysty (zero DOM, zero sieci); module.exports pod strażnikiem dla
   testów w node (tests/engine/test_xray_similarities.js).
   ==========================================================================*/
var XSim = (function () {
    'use strict';
    const G = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});

    function simEsc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Stary splitter (similarities.html 1.1.163/1.1.164): zapas, gdy wspólnego XZdania brak.
    function simUnits(text) {
        const lines = (text || '').split(/\r?\n/).map(l => l.trim()).filter(l => l.length);
        const units = [];
        for (const line of lines) {
            const sents = line.split(/(?<=[.!?])\s+/);
            for (const s of sents) {
                const t = s.trim();
                if (t.length) units.push(t);
            }
        }
        return units;
    }

    // 13.10.2026 (Ads X-Ray): zdania z podzielRegex odnalezione w oryginale po znakach innych niż
    // whitespace (splitter przycina brzegi i skleja gołą interpunkcję spacją). Zwraca zakresy
    // [{start, end}] albo null, gdy czegoś nie da się odnaleźć znak w znak (wtedy zostaje cały zakres).
    function simUmiesc(text, s, e, parts) {
        const out = [];
        let p = s;
        for (const part of parts) {
            const zn = String(part).replace(/\s+/g, '');
            if (!zn) continue;
            let k = 0, start = -1;
            while (p < e && k < zn.length) {
                const c = text[p];
                if (/\s/.test(c)) { p++; continue; }
                if (c !== zn[k]) return null;
                if (start < 0) start = p;
                p++; k++;
            }
            if (k < zn.length) return null;
            out.push({ start, end: p });
        }
        if (text.slice(p, e).trim()) return null;
        return out;
    }

    // Zakresy zdań tekstu (bezstratne): wspólny splitter + dalszy podział linii z kilkoma zdaniami.
    // opcje.zakresy / opcje.podzielRegex wstrzykują splitter (testy); null = brak splittera.
    function simZakresy(text, opcje) {
        const XZ = G.XZdania;
        const zak = (opcje && 'zakresy' in opcje) ? opcje.zakresy
            : (XZ && typeof XZ.zakresy === 'function' ? XZ.zakresy : null);
        if (typeof zak !== 'function') return null;
        const reg = (opcje && 'podzielRegex' in opcje) ? opcje.podzielRegex
            : (XZ && typeof XZ.podzielRegex === 'function' ? XZ.podzielRegex : null);
        let spans;
        try { spans = zak(text); } catch (e) { return null; }
        if (!Array.isArray(spans)) return null;
        const out = [];
        let prev = 0;
        for (const sp of spans) {
            if (!sp || !Number.isInteger(sp.start) || !Number.isInteger(sp.end)) return null;
            if (sp.start < prev || sp.end < sp.start || sp.end > text.length) return null;
            prev = sp.end;
            const frag = text.slice(sp.start, sp.end);
            if (!frag.trim()) continue;
            let sub = null;
            // linia akapitu wielolinijkowego może nieść kilka zdań: tniemy ją tymi samymi regułami
            // (zakres z akapitu jednoliniowego, `linie === false`, jest już pocięty regexem)
            if (typeof reg === 'function' && sp.linie !== false && /[.!?…]["'”’)\]»]*\s/.test(frag)) {
                try {
                    const parts = reg(frag);
                    if (Array.isArray(parts) && parts.length > 1) sub = simUmiesc(text, sp.start, sp.end, parts);
                } catch (e) { sub = null; }
            }
            if (sub) out.push(...sub);
            else out.push({ start: sp.start, end: sp.end });
        }
        return out;
    }

    // 13.10.2026 (edycja w panelach): zakresy [{start, end}] przyciętych zdań w tekście, po kolei.
    // Panel edytowalny rysuje z nich zdania w miejscu, w którym stoją w tekście (odstępy zostają tekstem).
    // Zapas bez XZdania: zdania starego simUnits odnalezione po kolei (to wycinki oryginału).
    function simJednostkiZakresy(text, opcje) {
        const t = text || '';
        const z = simZakresy(t, opcje);
        const out = [];
        if (z) {
            for (const sp of z) {
                const frag = t.slice(sp.start, sp.end);
                const rdzen = frag.trim();
                if (!rdzen) continue;
                const lead = frag.length - frag.trimStart().length;
                out.push({ start: sp.start + lead, end: sp.start + lead + rdzen.length });
            }
            return out;
        }
        let p = 0;
        for (const u of simUnits(t)) {
            const i = t.indexOf(u, p);
            if (i < 0) continue;
            out.push({ start: i, end: i + u.length });
            p = i + u.length;
        }
        return out;
    }

    // Jednostki (zdania) tekstu: wycinki oryginału ze wspólnego splittera, zapas: stary simUnits.
    function simJednostki(text, opcje) {
        const t = text || '';
        const z = simZakresy(t, opcje);
        if (!z) return simUnits(t);
        return z.map(sp => t.slice(sp.start, sp.end).trim()).filter(s => s.length);
    }

    // Twardy cap jednostek per tekst (1.1.163), bez zmian.
    const SIM_MAX_UNITS = 3000;

    // Stary LCS (zapas, gdy cdiff.js nie ma): surowa lista ops {type:'same'|'del'|'add', a, b}.
    function simLcs(A, B, eq) {
        const n = A.length, m = B.length;
        const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
        for (let i = n - 1; i >= 0; i--)
            for (let j = m - 1; j >= 0; j--)
                dp[i][j] = eq(A[i], B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        const ops = [];
        let i = 0, j = 0;
        while (i < n && j < m) {
            if (eq(A[i], B[j])) { ops.push({ type: 'same', a: i, b: j }); i++; j++; }
            else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: 'del', a: i, b: -1 }); i++; }
            else { ops.push({ type: 'add', a: -1, b: j }); j++; }
        }
        while (i < n) { ops.push({ type: 'del', a: i++, b: -1 }); }
        while (j < m) { ops.push({ type: 'add', a: -1, b: j++ }); }
        return ops;
    }

    // 13.10.2026 (Ads X-Ray): silnik Myersa z cdiff.js (opcje.cd wstrzykuje go w testach).
    function simCd(opcje) {
        const cd = (opcje && 'cd' in opcje) ? opcje.cd : G.CD;
        return cd && cd._t && typeof cd._t.diffSeq === 'function' && cd.LIMITS ? cd : null;
    }
    // Myers na dwóch listach kluczy (napisów porównywanych ===) → ops jak simLcs albo null
    // (przekroczony budżet cdiff: wtedy caller ma swój zapas).
    function simMyers(A, B, cd) {
        const ids = new Map();
        const id = (w) => { let v = ids.get(w); if (v === undefined) { v = ids.size + 1; ids.set(w, v); } return v; };
        const IA = Int32Array.from(A, id), IB = Int32Array.from(B, id);
        const ctx = { work: 0, traceBytes: cd.LIMITS.traceBytes, maxCells: cd.LIMITS.l2Cells,
                      bail: null, degraded: false, reason: null };
        let raw;
        try { raw = cd._t.diffSeq(IA, IB, ctx); } catch (e) { return null; }
        if (!raw) return null;
        const ops = [];
        for (const o of raw) {
            if (o.t === '=') for (let x = 0; x < o.a1 - o.a0; x++) ops.push({ type: 'same', a: o.a0 + x, b: o.b0 + x });
            else if (o.t === '-') for (let x = o.a0; x < o.a1; x++) ops.push({ type: 'del', a: x, b: -1 });
            else for (let x = o.b0; x < o.b1; x++) ops.push({ type: 'add', a: -1, b: x });
        }
        return ops;
    }

    // ── Parowanie zdań 1.1.427 (bez zmian): Dice słów, grupy 1:k / k:1, numer pary ──
    const SIM_PAIR_MIN = 0.5;
    const SIM_MERGE_MAX = 3;
    const SIM_DP_CELLS = 160000;
    const SIM_LOOKAHEAD = 30;
    const SIM_PART_NEW = 0.6;
    const SIM_EDGE = /^[\p{Pd}\p{Ps}\p{Pe}\p{Pi}\p{Pf}\p{Pc}.,;:!?…"'¡¿]+|[\p{Pd}\p{Ps}\p{Pe}\p{Pi}\p{Pf}\p{Pc}.,;:!?…"'¡¿]+$/gu;
    const SIM_INVISIBLE = /[️­​-‍⁠﻿]/g;
    // Słowa w grupie: Myers do tylu słów razem (budżet cdiff l2Span), stary LCS do 1000 na stronę.
    const SIM_WORDS_LCS = 1000;

    function simNormWord(t) {
        const low = t.normalize('NFKC').replace(SIM_INVISIBLE, '')
            .replace(/[‘’‚‛ʼ′]/g, "'").replace(/[“”„‟″]/g, '"')
            .toLowerCase();
        return low.replace(SIM_EDGE, '') || low;
    }
    function simWords(s) { return (s.match(/\S+/g) || []).map(simNormWord).filter(w => w.length); }
    function simBag(words) {
        const m = new Map();
        for (const w of words) m.set(w, (m.get(w) || 0) + 1);
        return m;
    }
    function simCommon(a, b) {
        let small = a, big = b;
        if (a.size > b.size) { small = b; big = a; }
        let c = 0;
        for (const [w, n] of small) { const k = big.get(w); if (k) c += Math.min(n, k); }
        return c;
    }
    function simMergeBags(bags) {
        const m = new Map();
        for (const b of bags) for (const [w, n] of b) m.set(w, (m.get(w) || 0) + n);
        return m;
    }
    function simDice(a, b) {
        if (!a.length && !b.length) return 1;
        if (!a.length || !b.length) return 0;
        return 2 * simCommon(simBag(a), simBag(b)) / (a.length + b.length);
    }
    function simSent(text) {
        const words = simWords(text);
        return { words, bag: simBag(words), len: words.length, key: words.join(' ') };
    }

    function simPairBlock(dels, adds, SA, SB) {
        const n = dels.length, m = adds.length;
        if (!n || !m) return [];
        if (n * m > SIM_DP_CELLS) {
            const out = [];
            let j = 0;
            for (let i = 0; i < n && j < m; i++) {
                const a = SA[dels[i]];
                let best = -1, bj = -1;
                for (let t = j; t < Math.min(m, j + SIM_LOOKAHEAD); t++) {
                    const b = SB[adds[t]];
                    const d = (a.len + b.len) ? 2 * simCommon(a.bag, b.bag) / (a.len + b.len) : 1;
                    if (d >= SIM_PAIR_MIN && d > best) { best = d; bj = t; }
                }
                if (bj >= 0) { out.push({ as: [dels[i]], bs: [adds[bj]] }); j = bj + 1; }
            }
            return out;
        }
        const win = (idx, S) => {
            const w = [null, idx.map(x => ({ bag: S[x].bag, len: S[x].len }))];
            for (let k = 2; k <= SIM_MERGE_MAX; k++)
                w.push(idx.map((_, e) => e + 1 < k ? null
                    : { bag: simMergeBags(idx.slice(e + 1 - k, e + 1).map(x => S[x].bag)),
                        len: idx.slice(e + 1 - k, e + 1).reduce((t, x) => t + S[x].len, 0) }));
            return w;
        };
        const WA = win(dels, SA), WB = win(adds, SB);
        const W = m + 1;
        const f = new Float64Array((n + 1) * W);
        const from = new Int8Array((n + 1) * W * 2);
        const SHAPES = [[1, 1]];
        for (let k = 2; k <= SIM_MERGE_MAX; k++) SHAPES.push([1, k], [k, 1]);
        for (let i = 0; i <= n; i++)
            for (let j = 0; j <= m; j++) {
                if (!i && !j) continue;
                let best = -1, bi = 0, bj = 0;
                if (i > 0 && f[(i - 1) * W + j] > best) { best = f[(i - 1) * W + j]; bi = 1; bj = 0; }
                if (j > 0 && f[i * W + j - 1] > best) { best = f[i * W + j - 1]; bi = 0; bj = 1; }
                for (const [di, dj] of SHAPES) {
                    if (i < di || j < dj) continue;
                    const a = WA[di][i - 1], b = WB[dj][j - 1];
                    const total = a.len + b.len;
                    const common = simCommon(a.bag, b.bag);
                    if (!total || 2 * common / total < SIM_PAIR_MIN) continue;
                    const score = f[(i - di) * W + j - dj] + common + (di === 1 && dj === 1 ? 1e-6 : 0);
                    if (score > best) { best = score; bi = di; bj = dj; }
                }
                f[i * W + j] = best;
                from[(i * W + j) * 2] = bi; from[(i * W + j) * 2 + 1] = bj;
            }
        const out = [];
        let i = n, j = m;
        while (i > 0 || j > 0) {
            const di = from[(i * W + j) * 2], dj = from[(i * W + j) * 2 + 1];
            if (di && dj) out.push({ as: dels.slice(i - di, i), bs: adds.slice(j - dj, j) });
            i -= di; j -= dj;
        }
        return out.reverse();
    }

    // Zdania A i B → ops same / group / del / add. Kotwice dla dużych tekstów: Myers z cdiff.js
    // (13.10.2026 (Ads X-Ray): stary LCS trzymał 3000×3000 Int32 = 36 MB), zapas: stary LCS.
    function simAlignSentences(A, B, opcje) {
        const SA = A.map(simSent), SB = B.map(simSent);
        const emit = (ops, groups, dels, adds) => {
            let di = 0, ai = 0;
            for (const g of groups) {
                while (dels[di] < g.as[0]) ops.push({ type: 'del', a: dels[di++], b: -1 });
                while (adds[ai] < g.bs[0]) ops.push({ type: 'add', a: -1, b: adds[ai++] });
                if (g.as.length === 1 && g.bs.length === 1 && SA[g.as[0]].key === SB[g.bs[0]].key)
                    ops.push({ type: 'same', a: g.as[0], b: g.bs[0] });
                else ops.push({ type: 'group', as: g.as, bs: g.bs });
                di += g.as.length; ai += g.bs.length;
            }
            while (di < dels.length) ops.push({ type: 'del', a: dels[di++], b: -1 });
            while (ai < adds.length) ops.push({ type: 'add', a: -1, b: adds[ai++] });
        };
        const ops = [];
        if (A.length * B.length <= SIM_DP_CELLS) {
            const all = (n) => Array.from({ length: n }, (_, i) => i);
            emit(ops, simPairBlock(all(A.length), all(B.length), SA, SB), all(A.length), all(B.length));
            return ops;
        }
        const keysA = SA.map(x => x.key), keysB = SB.map(x => x.key);
        const cd = simCd(opcje);
        const raw = (cd && simMyers(keysA, keysB, cd)) || simLcs(keysA, keysB, (x, y) => x === y);
        let k = 0;
        while (k < raw.length) {
            if (raw[k].type === 'same') { ops.push(raw[k]); k++; continue; }
            const dels = [], adds = [];
            while (k < raw.length && raw[k].type !== 'same') {
                if (raw[k].type === 'del') dels.push(raw[k].a); else adds.push(raw[k].b);
                k++;
            }
            emit(ops, simPairBlock(dels, adds, SA, SB), dels, adds);
        }
        return ops;
    }

    const AMBER = 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100';
    const GREEN = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100';

    // Indeksy słów do podświetlenia po obu stronach + liczba wspólnych. Myers z cdiff.js, zapas:
    // stary LCS do SIM_WORDS_LCS słów; null = za duże dla obu (caller świeci całość).
    function simWordMarks(aw, bw, opcje) {
        const cd = simCd(opcje);
        let ops = null;
        if (cd && aw.length + bw.length <= cd.LIMITS.l2Span) ops = simMyers(aw, bw, cd);
        if (!ops && aw.length <= SIM_WORDS_LCS && bw.length <= SIM_WORDS_LCS) ops = simLcs(aw, bw, (x, y) => x === y);
        if (!ops) return null;
        const aMark = new Set(), bMark = new Set();
        let common = 0;
        for (const op of ops) {
            if (op.type === 'same') common++;
            else if (op.type === 'del') aMark.add(op.a);
            else bMark.add(op.b);
        }
        return { aMark, bMark, common };
    }

    // Word-level highlight grupy zdań (semantyka 1.1.427 bez zmian): {aHtml, bHtml, aMarked, bMarked,
    // aNew, bNew, common, totalA, totalB}.
    function simWordDiffParts(aParts, bParts, opcje) {
        const tok = s => s.split(/(\s+)/).filter(t => t.length);
        const isWord = t => !/^\s+$/.test(t);
        const side = (parts) => {
            const toks = parts.map(tok), norm = [], owner = [];
            toks.forEach((ts, pi) => ts.filter(isWord).forEach(t => { norm.push(simNormWord(t)); owner.push(pi); }));
            return { toks, norm, owner };
        };
        const SA = side(aParts), SB = side(bParts);
        const aw = SA.norm, bw = SB.norm;
        const m = simWordMarks(aw, bw, opcje);
        if (!m) {
            // ściana ponad budżet: podświetl całość, % z multiset-przecięcia (bez klifu na 0%, 1.1.162)
            const common = Math.round(simDice(aw, bw) * (aw.length + bw.length) / 2);
            return { aHtml: aParts.map(t => '<mark class="' + AMBER + ' rounded-md px-0.5">' + simEsc(t) + '</mark>'),
                     bHtml: bParts.map(t => '<mark class="' + GREEN + ' rounded-md px-0.5">' + simEsc(t) + '</mark>'),
                     aMarked: aParts.map(() => true), bMarked: bParts.map(() => true),
                     aNew: aParts.map(() => 0), bNew: bParts.map(() => 0),
                     common, totalA: aw.length, totalB: bw.length };
        }
        const render = (S, markSet, cls) => {
            let wi = 0;
            const html = [], marked = [], share = [];
            for (const ts of S.toks) {
                let out = '', nMarked = 0, nWords = 0;
                for (const t of ts) {
                    if (!isWord(t)) { out += simEsc(t); continue; }
                    nWords++;
                    if (markSet.has(wi)) { out += '<mark class="' + cls + ' rounded-md px-0.5">' + simEsc(t) + '</mark>'; nMarked++; }
                    else out += simEsc(t);
                    wi++;
                }
                html.push(out); marked.push(nMarked > 0); share.push(nWords ? nMarked / nWords : 0);
            }
            return { html, marked, share };
        };
        const RA = render(SA, m.aMark, AMBER), RB = render(SB, m.bMark, GREEN);
        return { aHtml: RA.html, bHtml: RB.html, aMarked: RA.marked, bMarked: RB.marked, aNew: RA.share, bNew: RB.share,
                 common: m.common, totalA: aw.length, totalB: bw.length };
    }
    function simWordDiff(aLine, bLine, opcje) {
        const d = simWordDiffParts([aLine], [bLine], opcje);
        return { aHtml: d.aHtml[0], bHtml: d.bHtml[0], common: d.common, totalA: d.totalA, totalB: d.totalB };
    }

    function simIndexAfterMoveToFront(moved, other) {
        if (other === moved) return 0;
        return other < moved ? other + 1 : other;
    }

    // Napis wiersza ⚠ (13.10.2026 (Ads X-Ray): bez długiego myślnika, przez katalog i18n, gdy jest).
    function simTekstUciecia() {
        const szk = '⚠ Tekst ucięty do {0} zdań (limit wydajności), porównano początek.';
        return typeof G.oppenTf === 'function' ? G.oppenTf(szk, [SIM_MAX_UNITS]) : szk.replace('{0}', SIM_MAX_UNITS);
    }

    // Pełny diff pary tekstów → {aRows, bRows, similarity, truncated}; wiersz ma `pair` (null = bez pary).
    // opcje: {zakresy, podzielRegex, cd} wstrzykują silniki (domyślnie window.XZdania i window.CD).
    // 13.10.2026 (edycja w panelach): wiersz niesie `u` (indeks zdania w aZak/bZak, null = wiersz ⚠),
    // a wynik zakresy zdań w tekście (aZak, bZak), z których panel edytowalny rysuje tekst w miejscu.
    function simDiffPair(aText, bText, opcje) {
        const ta = aText || '', tb = bText || '';
        let aZak = simJednostkiZakresy(ta, opcje), bZak = simJednostkiZakresy(tb, opcje);
        const truncated = aZak.length > SIM_MAX_UNITS || bZak.length > SIM_MAX_UNITS;
        if (truncated) { aZak = aZak.slice(0, SIM_MAX_UNITS); bZak = bZak.slice(0, SIM_MAX_UNITS); }
        const A = aZak.map(z => ta.slice(z.start, z.end)), B = bZak.map(z => tb.slice(z.start, z.end));
        const ops = simAlignSentences(A, B, opcje);
        const delRow = (t, u) => ({ kind: 'del', pair: null, u, html: '<mark class="' + AMBER + ' rounded-md px-0.5 line-through decoration-black/30 dark:decoration-white/30">' + simEsc(t) + '</mark>' });
        const addRow = (t, u) => ({ kind: 'add', pair: null, u, html: '<mark class="' + GREEN + ' rounded-md px-0.5">' + simEsc(t) + '</mark>' });
        const aRows = [], bRows = [];
        let common = 0, totalA = 0, totalB = 0, pair = 0;
        const wc = s => (s.match(/\S+/g) || []).length;
        for (const op of ops) {
            if (op.type === 'same') {
                const w = wc(A[op.a]);
                common += w; totalA += w; totalB += wc(B[op.b]);
                aRows.push({ kind: 'same', html: simEsc(A[op.a]), pair, u: op.a });
                bRows.push({ kind: 'same', html: simEsc(B[op.b]), pair, u: op.b });
                pair++;
            } else if (op.type === 'group') {
                const d = simWordDiffParts(op.as.map(i => A[i]), op.bs.map(i => B[i]), opcje);
                common += d.common; totalA += d.totalA; totalB += d.totalB;
                const out = (n, x, isNew) => n > 1 && isNew[x] >= SIM_PART_NEW;
                const kind = d.aMarked.concat(d.bMarked).some(Boolean) ? 'changed' : 'same';
                d.aHtml.forEach((html, x) => aRows.push(out(op.as.length, x, d.aNew) ? delRow(A[op.as[x]], op.as[x]) : { kind, html, pair, u: op.as[x] }));
                d.bHtml.forEach((html, x) => bRows.push(out(op.bs.length, x, d.bNew) ? addRow(B[op.bs[x]], op.bs[x]) : { kind, html, pair, u: op.bs[x] }));
                pair++;
            } else if (op.type === 'del') {
                totalA += wc(A[op.a]);
                aRows.push(delRow(A[op.a], op.a));
            } else {
                totalB += wc(B[op.b]);
                bRows.push(addRow(B[op.b], op.b));
            }
        }
        if (truncated) {
            const warn = '<mark class="' + AMBER + ' rounded-md px-0.5">' + simEsc(simTekstUciecia()) + '</mark>';
            aRows.unshift({ kind: 'changed', html: warn, pair: null, u: null });
            bRows.unshift({ kind: 'changed', html: warn, pair: null, u: null });
        }
        const denom = totalA + totalB;
        const similarity = denom ? Math.round(200 * common / denom) : 100;
        return { aRows, bRows, similarity: Math.min(100, similarity), truncated, aZak, bZak };
    }

    return { simEsc, simUnits, simUmiesc, simZakresy, simJednostkiZakresy, simJednostki, simLcs, simMyers, simNormWord, simWords,
             simDice, simSent, simPairBlock, simAlignSentences, simWordMarks, simWordDiffParts, simWordDiff,
             simIndexAfterMoveToFront, simDiffPair, simTekstUciecia, SIM_MAX_UNITS, SIM_PAIR_MIN, SIM_DP_CELLS };
})();

/* ============================================================================
   13.10.2026 (edycja w panelach): edycja tekstów wprost w panelach wyników, jak w Google Docs.
   Treść panelu to element contenteditable="plaintext-only" z x-ignore: jego dzieci należą do
   TEGO kodu, nie do Alpine (x-for/x-html na edytowalnych dzieciach psuł tekst przy pisaniu).
   Tu są czyste pomocniki (DOM podany z zewnątrz, w testach mały model węzłów):
   - tekstZDom: DOM panelu -> zwykły tekst (BR, bloki DIV/P wstawione przez przeglądarkę,
     ostatni BR-wypełniacz nie jest znakiem) i pozycja punktu (węzeł, przesunięcie) w tym tekście,
   - punkt: pozycja znaku -> (węzeł, przesunięcie), do odtwarzania kursora po przerysowaniu,
   - kawalki/renderuj: tekst + wiersze silnika -> spany zdań (data-sim-row jak dawne wiersze)
     z tym samym podświetleniem słów; odstępy między zdaniami zostają zwykłym tekstem,
   - historia*: stos migawek tekstów do Cofnij/Ponów (jedna migawka na zatwierdzoną przerwę),
   - zmiana: gdzie dwa teksty się różnią (kursor po Cofnij/Ponów staje na końcu zmiany).
   ==========================================================================*/
var XSimEdycja = (function () {
    'use strict';
    const BLOK = /^(DIV|P|LI|UL|OL|H[1-6]|BLOCKQUOTE|PRE|SECTION|ARTICLE|HEADER|FOOTER|TABLE|TR)$/;
    const HISTORIA_MAX = 200;

    // DOM -> tekst. `cel` = {node, offset} (punkt zaznaczenia) daje też `poz` w tym tekście.
    function tekstZDom(korzen, cel) {
        let tekst = '', poz = null, brKoniec = -1, poBloku = false;
        const wezly = [];
        const nowaLinia = () => { if (tekst && tekst[tekst.length - 1] !== '\n') tekst += '\n'; };
        const dfs = (n) => {
            if (n.nodeType === 3) {
                const v = n.nodeValue || '';
                if (v && poBloku) { nowaLinia(); poBloku = false; }
                if (cel && n === cel.node) poz = tekst.length + Math.min(Math.max(0, cel.offset), v.length);
                wezly.push({ node: n, od: tekst.length, dl: v.length, br: false });
                if (v) { tekst += v; brKoniec = -1; }
                return;
            }
            if (n.nodeType !== 1) return;
            if (n.nodeName === 'BR') {
                if (poBloku) { nowaLinia(); poBloku = false; }
                if (cel && n === cel.node) poz = tekst.length;
                wezly.push({ node: n, od: tekst.length, dl: 0, br: true });
                brKoniec = tekst.length;
                tekst += '\n';
                return;
            }
            const blok = n !== korzen && BLOK.test(n.nodeName);
            if (blok) { nowaLinia(); poBloku = false; }
            const dz = n.childNodes || [];
            for (let i = 0; i < dz.length; i++) {
                if (cel && n === cel.node && i === cel.offset && poz === null) poz = tekst.length;
                dfs(dz[i]);
            }
            if (cel && n === cel.node && poz === null) poz = tekst.length;
            if (blok) poBloku = true;
        };
        dfs(korzen);
        // BR na samym końcu (wypełniacz pustej ostatniej linii) nie jest znakiem tekstu.
        if (brKoniec >= 0 && brKoniec === tekst.length - 1) tekst = tekst.slice(0, -1);
        if (poz !== null && poz > tekst.length) poz = tekst.length;
        return { tekst, poz, wezly };
    }

    // Pozycja znaku -> punkt DOM (pierwszy węzeł tekstu, który ją obejmuje; przed BR na tej pozycji).
    function punkt(korzen, poz) {
        const lin = tekstZDom(korzen);
        const p = Math.max(0, Math.min(Number(poz) || 0, lin.tekst.length));
        for (const w of lin.wezly) {
            if (w.br) {
                if (p === w.od && w.node.parentNode) {
                    const rodzic = w.node.parentNode;
                    return { node: rodzic, offset: Array.prototype.indexOf.call(rodzic.childNodes, w.node) };
                }
            } else if (p >= w.od && p <= w.od + w.dl) return { node: w.node, offset: p - w.od };
        }
        return { node: korzen, offset: (korzen.childNodes || []).length };
    }

    // Zaznaczenie wewnątrz korzenia jako pozycje {start: kotwica, end: fokus}; poza nim null.
    function zaznaczenieW(korzen, sel) {
        if (!sel || !sel.rangeCount || !sel.anchorNode || !sel.focusNode) return null;
        if (!korzen.contains(sel.anchorNode) || !korzen.contains(sel.focusNode)) return null;
        const a = tekstZDom(korzen, { node: sel.anchorNode, offset: sel.anchorOffset }).poz;
        const f = tekstZDom(korzen, { node: sel.focusNode, offset: sel.focusOffset }).poz;
        if (a === null || f === null) return null;
        return { start: a, end: f };
    }

    // Tekst + wiersze silnika (z `u`) + zakresy zdań -> kawałki [{tekst, row}] pokrywające CAŁY tekst.
    function kawalki(tekst, rows, zak) {
        const t = String(tekst || ''), out = [];
        const poU = new Map();
        for (const r of (rows || [])) if (r && r.u !== null && r.u !== undefined) poU.set(r.u, r);
        let p = 0;
        (zak || []).forEach((z, u) => {
            const r = poU.get(u);
            if (!r || !z || z.start < p || z.end > t.length) return;
            if (z.start > p) out.push({ tekst: t.slice(p, z.start), row: null });
            out.push({ tekst: t.slice(z.start, z.end), row: r });
            p = z.end;
        });
        if (p < t.length) out.push({ tekst: t.slice(p), row: null });
        return out;
    }

    // HTML wiersza z silnika (tylko escapowany tekst i <mark class="…">) -> kawałki [{tekst, klasa}].
    function htmlNaKawalki(html) {
        const out = [];
        const odEsc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        let klasa = null;
        for (const cz of String(html || '').split(/(<mark class="[^"]*">|<\/mark>)/)) {
            if (!cz) continue;
            const m = /^<mark class="([^"]*)">$/.exec(cz);
            if (m) { klasa = m[1]; continue; }
            if (cz === '</mark>') { klasa = null; continue; }
            out.push({ tekst: odEsc(cz), klasa });
        }
        return out;
    }

    // Przerysowanie panelu: spany zdań (data-sim-row/-pair/-kind) z podświetleniem słów, odstępy jako tekst.
    function renderuj(el, tekst, rows, zak, strona, doc) {
        const t = String(tekst || '');
        while (el.firstChild) el.removeChild(el.firstChild);
        for (const k of kawalki(t, rows, zak)) {
            if (!k.row) { el.appendChild(doc.createTextNode(k.tekst)); continue; }
            const s = doc.createElement('span');
            s.className = 'xr-sim-z';
            s.setAttribute('data-sim-kind', String(k.row.kind));
            if (k.row.pair !== null && k.row.pair !== undefined) {
                s.setAttribute('data-sim-pair', String(k.row.pair));
                s.setAttribute('data-sim-row', strona + '-' + k.row.pair);
            }
            const czesci = htmlNaKawalki(k.row.html);
            // Bezpiecznik: podświetlenie musi nieść DOKŁADNIE tekst zdania, inaczej zdanie bez znaczników.
            if (czesci.map(c => c.tekst).join('') !== k.tekst) {
                s.appendChild(doc.createTextNode(k.tekst));
            } else {
                for (const c of czesci) {
                    if (!c.klasa) { s.appendChild(doc.createTextNode(c.tekst)); continue; }
                    const m = doc.createElement('mark');
                    m.className = c.klasa;
                    m.appendChild(doc.createTextNode(c.tekst));
                    s.appendChild(m);
                }
            }
            el.appendChild(s);
        }
        // Pusta ostatnia linia potrzebuje wypełniacza, inaczej kursor nie ma gdzie stanąć.
        if (t.endsWith('\n')) el.appendChild(doc.createElement('br'));
    }

    // ── Historia migawek (tablice treści tekstów), bez mutacji ──
    function historiaNowa(migawka) { return { stos: [migawka.slice()], poz: 0 }; }
    function historiaTeraz(h) { return h.stos[h.poz]; }
    const takieSame = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
    function historiaDodaj(h, migawka, limit) {
        if (takieSame(historiaTeraz(h), migawka)) return h;
        const max = limit || HISTORIA_MAX;
        const stos = h.stos.slice(0, h.poz + 1).concat([migawka.slice()]);
        const nadmiar = Math.max(0, stos.length - max);
        return { stos: stos.slice(nadmiar), poz: stos.length - 1 - nadmiar };
    }
    function historiaCofnij(h) {
        if (h.poz <= 0) return null;
        const nh = { stos: h.stos, poz: h.poz - 1 };
        return { h: nh, migawka: historiaTeraz(nh).slice() };
    }
    function historiaPonow(h) {
        if (h.poz >= h.stos.length - 1) return null;
        const nh = { stos: h.stos, poz: h.poz + 1 };
        return { h: nh, migawka: historiaTeraz(nh).slice() };
    }

    // Wspólny początek i koniec dwóch tekstów: zmiana to [start, koniecPrzed) -> [start, koniecPo).
    function zmiana(przed, po) {
        const a = String(przed || ''), b = String(po || '');
        let p = 0;
        while (p < a.length && p < b.length && a[p] === b[p]) p++;
        let s = 0;
        while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
        return { start: p, koniecPrzed: a.length - s, koniecPo: b.length - s };
    }

    return { tekstZDom, punkt, zaznaczenieW, kawalki, htmlNaKawalki, renderuj, historiaNowa, historiaTeraz,
             historiaDodaj, historiaCofnij, historiaPonow, zmiana, HISTORIA_MAX };
})();

/* ============================================================================
   13.10.2026 (Auto-scroll jak w Skryptach PL): czysta matematyka wspólnego przewijania paneli.
   Właściciel (1.1.454): „Auto-scroll działa nie najlepiej”: drugi panel ruszał się tylko przy najechaniu
   na zdanie, którego para wyszła poza widok, więc przy kółku panele się rozjeżdżały.
   Teraz panel prowadzący (kółko, palec, pasek, klawiatura) przesuwa drugi w każdej klatce tak, żeby
   punkt pod linią odczytu stał na tej samej wysokości. Mapa jest odcinkami liniowa:
   - położenie w tekście to ciągła współrzędna pionowa: góra linii + ułamek wysokości linii według
     położenia w poziomie (kilka zdań w jednej linii dostaje różne, rosnące położenia),
   - kotwice: początek i koniec każdej pary po obu stronach (zdanie A ↔ zdanie albo grupa zdań B),
     plus początek (0, 0) i koniec tekstów; między kotwicami proporcjonalnie, więc zdania bez pary
     (dodane albo usunięte) idą proporcjonalnie między najbliższymi parami, bez skoków,
   - poza tekstem (dobiegi) przesunięcie 1:1, więc da się wyrównać także pierwsze i ostatnie zdania.
   Ta sama mapa z obu stron jest odwrotnością samej siebie: zmiana panelu prowadzącego nie szarpie.
   ==========================================================================*/
var XSimPrzewijanie = (function () {
    'use strict';
    const ul = (v) => Math.max(0, Math.min(1, v));

    // Punkt prostokąta linii (getClientRects) jako położenie w tekście liczone od góry tekstu.
    // prawy = koniec zdania (prawa krawędź), inaczej początek (lewa krawędź).
    function punktLinii(r, lewo, szer, gora, prawy) {
        const x = prawy ? r.right : r.left;
        return (r.top - gora) + r.height * (szer > 0 ? ul((x - lewo) / szer) : 0);
    }

    // Zdania [{pair, start, end}] -> Map para -> {start, end} (grupa k:1 = od pierwszego do ostatniego zdania).
    function zakresyPar(zdania) {
        const m = new Map();
        for (const z of (zdania || [])) {
            if (!z || z.pair === null || z.pair === undefined || !Number.isFinite(z.start) || !Number.isFinite(z.end)) continue;
            const g = m.get(z.pair);
            if (g) m.set(z.pair, { start: Math.min(g.start, z.start), end: Math.max(g.end, z.end) });
            else m.set(z.pair, { start: z.start, end: Math.max(z.start, z.end) });
        }
        return m;
    }

    // Kotwice mapy [[x panelu prowadzącego, x drugiego panelu], ...], rosnące w obu współrzędnych.
    // Przed pierwszą i za ostatnią parą mapa idzie 1:1, więc zdania bez pary na początku (albo końcu) jednego
    // tekstu stoją naprzeciw dobiegu drugiego, a pierwsza i ostatnia para zostają naprzeciw siebie.
    // Bez żadnej pary: początek do początku, koniec do końca (hZ, hDo = wysokości tekstów).
    function kotwice(zdZ, zdDo, hZ, hDo) {
        const gz = zakresyPar(zdZ), gd = zakresyPar(zdDo);
        const pary = [...gz.keys()].filter(p => gd.has(p)).sort((a, b) => a - b);
        const out = [];
        const dodaj = (x, y) => {
            const o = out[out.length - 1];
            if (o && (x < o[0] || y < o[1] || (x === o[0] && y === o[1]))) return;   // mapa musi rosnąć: bez zawracania
            out.push([x, y]);
        };
        for (const p of pary) {
            const a = gz.get(p), b = gd.get(p);
            dodaj(a.start, b.start);
            dodaj(a.end, b.end);
        }
        if (!out.length) { dodaj(0, 0); dodaj(Number(hZ) || 0, Number(hDo) || 0); }
        return wygladz(out, NACHYLENIE_MAX);
    }

    // Odcinek mapy zbyt stromy w którąkolwiek stronę (np. zdanie A kończy linię, następne zaczyna kolejną, a w B
    // między nimi są trzy linie zdań bez pary: zero pikseli A na trzy linie B) dawał skok drugiego panelu
    // w jednej klatce. Taki odcinek poszerzamy w głąb sąsiednich odcinków (nowe kotwice leżą NA nich, więc reszta
    // mapy się nie zmienia), aż ma nachylenie dokładnie max: różnica rozkłada się na sąsiednie zdania po obu
    // stronach, bez skoku. Odcinek zbyt płaski to stromy w zamienionych osiach, więc mapa B->A dalej jest
    // dokładną odwrotnością A->B.
    const NACHYLENIE_MAX = 3;
    const EPS = 1e-9;
    function stromosc(a, b) {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        if (dx <= 0 && dy <= 0) return 0;
        if (dx <= 0 || dy <= 0) return Infinity;
        return Math.abs(Math.log(dy / dx));
    }
    // Odcinek i..i+1 za stromy (dy > max·dx): przesuwa jego końce po sąsiednich odcinkach.
    function poszerz(pts, i, maks) {
        const A = pts[i], B = pts[i + 1];
        const L = i > 0 ? pts[i - 1] : null, R = i + 2 < pts.length ? pts[i + 2] : null;
        const dxL = L ? A[0] - L[0] : 0, dxR = R ? R[0] - B[0] : 0;
        const mL = dxL > 0 ? (A[1] - L[1]) / dxL : 0, mR = dxR > 0 ? (R[1] - B[1]) / dxR : 0;
        const kL = dxL > 0 ? Math.max(0, maks - mL) : 0, kR = dxR > 0 ? Math.max(0, maks - mR) : 0;
        let brak = (B[1] - A[1]) - maks * (B[0] - A[0]);
        if (kL + kR <= 0) {
            // obu sąsiadów nie da się użyć: kotwica wewnętrzna wypada (odcinek łączy się z sąsiadem)
            if (L) return pts.slice(0, i).concat(pts.slice(i + 1));
            if (R) return pts.slice(0, i + 1).concat(pts.slice(i + 2));
            return pts;
        }
        const d = brak / (kL + kR);
        let dL = kL > 0 ? Math.min(d, dxL) : 0, dR = kR > 0 ? Math.min(d, dxR) : 0;
        brak -= dL * kL + dR * kR;
        if (brak > EPS && kL > 0 && dL < dxL) { const x = Math.min(dxL - dL, brak / kL); dL += x; brak -= x * kL; }
        if (brak > EPS && kR > 0 && dR < dxR) { const x = Math.min(dxR - dR, brak / kR); dR += x; brak -= x * kR; }
        const nA = dL >= dxL - EPS && L ? null : [A[0] - dL, A[1] - dL * mL];
        const nB = dR >= dxR - EPS && R ? null : [B[0] + dR, B[1] + dR * mR];
        return pts.slice(0, i).concat(nA ? [nA] : [], nB ? [nB] : [], pts.slice(i + 2));
    }
    function wygladz(k, maks) {
        const granica = Math.log(maks) + 1e-7;
        const zamien = (p) => [p[1], p[0]];
        let out = k.map(p => p.slice());
        for (let krok = 0; krok < 4 * k.length + 4 && out.length > 2; krok++) {
            let i = -1;
            for (let j = 0; j + 1 < out.length; j++) if (stromosc(out[j], out[j + 1]) > granica) { i = j; break; }
            if (i < 0) break;
            const stromy = (out[i + 1][1] - out[i][1]) > (out[i + 1][0] - out[i][0]);
            out = stromy ? poszerz(out, i, maks) : poszerz(out.map(zamien), i, maks).map(zamien);
        }
        return out;
    }

    // Położenie x w panelu prowadzącym -> położenie w drugim panelu (odcinkami liniowo, poza kotwicami 1:1).
    function mapuj(k, x) {
        if (!k || !k.length) return x;
        if (x <= k[0][0]) return k[0][1] + (x - k[0][0]);
        const n = k.length - 1;
        if (x >= k[n][0]) return k[n][1] + (x - k[n][0]);
        let lo = 0, hi = n;
        while (hi - lo > 1) {
            const s = (lo + hi) >> 1;
            if (k[s][0] <= x) lo = s; else hi = s;
        }
        const [x0, y0] = k[lo], [x1, y1] = k[hi];
        return x1 > x0 ? y0 + (y1 - y0) * (x - x0) / (x1 - x0) : y1;
    }

    // Dodatek do dobiegów, żeby PIERWSZA i OSTATNIA para dały się wyrównać przy panelu przewiniętym do końca:
    // panel, w którym pierwsza para stoi wyżej (mniej tekstu bez pary przed nią), dostaje wyższy górny dobieg,
    // a panel z krótszym ogonem po ostatniej parze wyższy dolny. Zawsze dodatni tylko po jednej stronie.
    function dobiegi(zdZ, zdDo, hZ, hDo) {
        const gz = zakresyPar(zdZ), gd = zakresyPar(zdDo);
        const pary = [...gz.keys()].filter(p => gd.has(p)).sort((a, b) => a - b);
        if (!pary.length) return { goraZ: 0, goraDo: 0, dolZ: 0, dolDo: 0 };
        const p0 = pary[0], pn = pary[pary.length - 1];
        const glowa = gz.get(p0).start - gd.get(p0).start;
        const ogon = (Math.max(0, (Number(hZ) || 0) - gz.get(pn).end)) - (Math.max(0, (Number(hDo) || 0) - gd.get(pn).end));
        return { goraZ: Math.max(0, -glowa), goraDo: Math.max(0, glowa), dolZ: Math.max(0, -ogon), dolDo: Math.max(0, ogon) };
    }

    // Nowy scrollTop drugiego panelu: punkt `celY` (współrzędna ekranu) ma stanąć na wysokości `y`.
    function celPrzewiniecia(scrollTop, maks, celY, y) {
        return Math.max(0, Math.min(Math.max(0, maks), scrollTop + (celY - y)));
    }

    return { punktLinii, zakresyPar, kotwice, wygladz, mapuj, dobiegi, celPrzewiniecia, NACHYLENIE_MAX };
})();

// ─────────────────────────────────────────────────────────────────────────────
// Komponent Alpine trybu „Similarities” (port simTool z similarities.html, 13.10.2026 (Ads X-Ray)).
// Zmiany względem starej strony: identyfikatory xr-, zakresy DOM w obrębie komponentu.
// Wersja samodzielna: bez okna „Z reklamy” i bez ?ad= (brak bazy reklam).
// Szkic tekstów pod TYM SAMYM kluczem co stara strona (xray_sim_texts), więc obie widzą to samo.
// 13.10.2026 (edycja w panelach): panele wyników są edytowalne jak dokument (XSimEdycja wyżej):
// po przerwie w pisaniu, wyjściu z panelu albo przed akcją, która potrzebuje świeżych wyników,
// tekst panelu trafia do texts[i].body (ten sam szkic), porównanie liczy się od nowa, a podświetlenia
// rysują się z kursorem w tym samym miejscu. Cofnij/Ponów to własny stos migawek tekstów.
// ─────────────────────────────────────────────────────────────────────────────
function xraySimilarities() {
    const S = XSim, E = XSimEdycja;
    // 13.10.2026 (edycja w panelach): stan edycji POZA reaktywnym obiektem Alpine (węzły DOM, timery,
    // wyniki diffów): proxy Alpine na nich tylko by spowalniało pisanie.
    const ED = {
        hist: null,            // historia migawek treści (XSimEdycja.historia*)
        pamiec: new Map(),     // 'i,j' -> {a, b, d}: para liczona od nowa tylko po zmianie któregoś tekstu
        nPor: 0,               // ile tekstów jest w porównaniu (od A); wyczyszczony w panelu też zostaje
        gen: 0,                // numer przeliczenia: kroki w tle ze starszego numeru przerywają się same
        kolejka: [],           // kroki przeliczenia czekające w tle
        pisanie: { klucz: null, t: 0 },
        powiazane: [],         // spany z klasą xr-sim-linked
    };
    const PRZERWA_EDYCJI = 700;      // ms bez pisania, po których panel się zatwierdza
    const KROK_BUDZET = 30;          // ms pracy w tle na jedno oddanie sterowania przeglądarce
    const PISANIE_BLOKUJE_SCROLL = 1500;   // ms po ostatnim klawiszu, kiedy linkowanie nie przewija panelu
    // 13.10.2026 (Auto-scroll jak w Skryptach PL): przewijanie paneli poza Alpine (zdarzenia co klatkę).
    const P = XSimPrzewijanie;
    const SC = {
        kierowca: null,        // panel, który przewija użytkownik (kółko, palec, pasek, klawiatura); drugi idzie za nim
        programowe: {},        // panel -> do kiedy (performance.now) jego scroll to nasze przewijanie, nie gest
        raf: null, rafPo: null,
        myszX: null, myszY: null, myszRuch: 0,
        ostatniSync: 0,        // kiedy ostatnio wyrównaliśmy przy przewijaniu (najechanie wtedy czeka)
        najazdT: null,
        wersja: 0,             // rośnie przy przerysowaniu i pisaniu: geometria zdań liczy się od nowa
        geo: {},               // panel -> {wersja, w, h, zdania}
        kotw: null,            // {gZ, gDo, k}: ostatnia mapa kotwic
    };
    const LINIA_ODCZYTU = 0.35;      // linia odczytu bez myszy nad panelem: 35% widocznej wysokości (jak Skrypty PL)
    const PROG_PX = 1;               // mniejszej różnicy nie poprawiamy (bez drgań o ułamek piksela)
    const SYNC_AUTO_MS = 120;        // nasze natychmiastowe przewinięcie: scroll drugiego panelu to nie gest
    const SYNC_PLYNNY_MS = 900;      // płynne przewijanie trwa kilkaset ms i sypie zdarzeniami scroll
    const NAJAZD_ZWLOKA = 90;        // przejechanie myszą przez panel w drodze do drugiego nie przewija
    const NAJAZD_PO_SYNC = 250;      // w trakcie przewijania kółkiem najechanie (zdania płyną pod myszą) czeka
    const RUCH_MYSZY_MS = 150;       // najechanie liczy się tylko po prawdziwym ruchu myszy
    return {
        SIM_MAX_UNITS: S.SIM_MAX_UNITS,
        texts: [{ name: '', body: '' }, { name: '', body: '' }],
        mode: 'edit',
        onlyChanged: false,
        smallFont: false,
        focusIdx: 0,
        panes: [],
        matrix: [],
        matrixTrunc: [],
        matrixVer: 0,
        matrixOpen: true,
        _saveTimer: null,
        autoScroll: true,
        linkHover: null,
        linkPin: null,
        _pinTimer: null, _selAtDown: false,
        _sel: null,

        init() {
            try {
                const saved = JSON.parse(localStorage.getItem('xray_sim_texts') || 'null');
                if (Array.isArray(saved) && saved.length >= 2) {
                    this.texts = saved.slice(0, 6).map(t => ({ name: String((t && t.name) || ''), body: String((t && t.body) || '') }));
                }
            } catch (e) { /* ignore */ }
            this.$watch('texts', () => {
                clearTimeout(this._saveTimer);
                this._saveTimer = setTimeout(() => this._zapiszSzkic(), 400);
            });
            try { this.autoScroll = localStorage.getItem('xray_sim_autoscroll') !== '0'; } catch (e) { /* ignore */ }
            this.$watch('autoScroll', (v) => {
                try { localStorage.setItem('xray_sim_autoscroll', v ? '1' : '0'); } catch (e) { /* ignore */ }
                this._przelaczonoAutoScroll();
            });
            this.$watch('smallFont', () => { SC.wersja++; });
            this.$watch('focusIdx', () => {
                this.linkHover = null; this.linkPin = null; this._clearSel('a');
                this._renderujPanel('a');   // baza podświetla się względem nowego panelu z ramką
                this._odswiezPowiazane();
            });
            this.$watch('linkHover', () => this._odswiezPowiazane());
            this.$watch('linkPin', () => this._odswiezPowiazane());
            this._initSel();
            // 14.10.2026 (historia Ads X-Ray): zapis i wczytanie porównania z historii (xray/historia.js).
            if (window.XHistoria) window.XHistoria.zarejestruj('similarities', {
                stan: () => this._historiaStan(),
                wczytaj: (d) => this._historiaWczytaj(d),
            });
            // Zamknięcie karty w trakcie pisania: niezatwierdzony tekst panelu też trafia do szkicu.
            if (typeof window !== 'undefined' && window.addEventListener) {
                window.addEventListener('pagehide', () => this._zapiszNaWyjsciu());
                document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this._zapiszNaWyjsciu(); });
            }
        },
        _zapiszSzkic() {
            try { localStorage.setItem('xray_sim_texts', JSON.stringify(this.texts)); } catch (e) { /* ignore */ }
        },
        // ── Historia (14.10.2026, historia Ads X-Ray): teksty z nazwami (2 do 6), widok i przełączniki.
        //    Wszystko liczone lokalnie, więc wczytanie po prostu porównuje od nowa (zero kosztu). ──
        _historiaStan() {
            if (this.mode === 'diff') this._zatwierdzWszystko();
            return {
                texts: this.texts.map(t => ({ name: String(t.name || ''), body: String(t.body || '') })),
                tryb: this.mode === 'diff' ? 'diff' : 'edit',
                opcje: { onlyChanged: !!this.onlyChanged, smallFont: !!this.smallFont, autoScroll: !!this.autoScroll,
                         focusIdx: this.focusIdx || 0 },
            };
        },
        _historiaWczytaj(d) {
            const dane = (d && typeof d === 'object') ? d : {};
            if (this.mode === 'diff') this.wrocDoEdycji();
            const lista = (Array.isArray(dane.texts) ? dane.texts : []).slice(0, 6)
                .map(t => ({ name: String((t && t.name) || ''), body: String((t && t.body) || '') }));
            while (lista.length < 2) lista.push({ name: '', body: '' });
            this.texts = lista;
            this._zapiszSzkic();
            const o = (dane.opcje && typeof dane.opcje === 'object') ? dane.opcje : {};
            if (typeof o.onlyChanged === 'boolean') this.onlyChanged = o.onlyChanged;
            if (typeof o.smallFont === 'boolean') this.smallFont = o.smallFont;
            if (typeof o.autoScroll === 'boolean') this.autoScroll = o.autoScroll;
            this.focusIdx = 0;
            if (dane.tryb === 'diff' && this.filledCount() >= 2) {
                this.compare();
                const f = parseInt(o.focusIdx, 10);
                if (f > 0 && f < Math.max(1, this.texts.filter(t => (t.body || '').trim()).length - 1)) this.$nextTick(() => { this.focusIdx = f; });
            }
        },
        _zapiszNaWyjsciu() {
            for (const el of this._edytory()) this._zatwierdz(el, { koniec: true });
            clearTimeout(this._saveTimer);
            this._zapiszSzkic();
        },
        letter(i) { return String.fromCharCode(65 + i); },
        stats(s) {
            const w = ((s || '').match(/\S+/g) || []).length;
            const z = (s || '').length;
            const odm = window.odmien || ((n, a, b, c) => (n === 1 ? a : c));
            return w + ' ' + odm(w, 'słowo', 'słowa', 'słów', 'word', 'words') + ' · '
                 + z + ' ' + odm(z, 'znak', 'znaki', 'znaków', 'character', 'characters');
        },
        uciecieNapis() { return S.simTekstUciecia(); },
        filledCount() { return this.texts.filter(t => (t.body || '').trim().length).length; },
        addText() { if (this.texts.length < 6) this.texts.push({ name: '', body: '' }); },
        removeText(i) {
            if (this.texts.length <= 2) return;
            this.texts.splice(i, 1);
            if (this.focusIdx >= this.texts.length - 1) this.focusIdx = 0;
        },
        wrocDoEdycji() {
            // 13.10.2026 (edycja w panelach): niezatwierdzony tekst panelu najpierw trafia do texts
            this._zatwierdzWszystko();
            this._zatrzymajEdycje();
            // 1.1.172: powrót do edycji zwalnia ciężki DOM diffu
            this.mode = 'edit'; this.panes = []; this.matrix = []; this.matrixTrunc = [];
            this.linkHover = null; this.linkPin = null; this._clearSel();
        },
        clearAll() {
            const doIt = () => {
                this._zatrzymajEdycje();
                this.texts = [{ name: '', body: '' }, { name: '', body: '' }];
                this.panes = []; this.matrix = []; this.matrixTrunc = []; this.mode = 'edit'; this.focusIdx = 0;
                try { localStorage.removeItem('xray_sim_texts'); } catch (e) { /* ignore */ }
                if (window.XHistoria) window.XHistoria.zapomnij('similarities');   // 14.10.2026 (historia Ads X-Ray)
            };
            if (window.appConfirm) { appConfirm(oppenT('Wyczyścić wszystkie teksty? Tego nie da się cofnąć.'), '', { variant: 'danger' }).then(ok => { if (ok) doIt(); }); }
            else doIt();
        },
        compare() {
            this._zatwierdzWszystko();
            const filled = this.texts.filter(t => (t.body || '').trim().length);
            if (filled.length < 2) return;
            this.linkHover = null; this.linkPin = null; this._clearSel();
            // 13.10.2026 (edycja w panelach): końce linii jako LF, tak jak czyta je panel edytowalny
            this.texts = filled.concat(this.texts.filter(t => !(t.body || '').trim().length)).slice(0, this.texts.length)
                .map(t => ({ name: t.name || '', body: String(t.body || '').replace(/\r\n?/g, '\n') }));
            ED.nPor = filled.length;
            ED.pamiec = new Map();
            ED.hist = E.historiaNowa(this._migawka());
            this.panes = Array.from({ length: ED.nPor - 1 }, () => ({ similarity: 0, truncated: false }));
            if (this.focusIdx >= this.panes.length) this.focusIdx = 0;
            this._przelicz({ teraz: true });
            this.mode = 'diff';
            this._nowePrzewijanie();
            if (typeof this.$nextTick === 'function') this.$nextTick(() => this._renderujPoPokazaniu());
        },
        // 13.10.2026 (przegląd w przeglądarce): panele powstają w <template x-if> i x-for, czasem PO $nextTick,
        // więc pierwsze rysowanie trafiało w próżnię i panele zostawały puste. Rysujemy, aż każdy panel
        // z niepustym tekstem ma treść (maks. ~20 klatek).
        _renderujPoPokazaniu(proba) {
            const n = proba || 0;
            this._renderujWszystko({ wymus: true });
            const eds = this._edytory();
            const brak = eds.length < 1 + this.panes.length || eds.some(el => !el.firstChild && !el._simBrudny);
            const ktorys = this.texts.some(t => String(t.body || '').trim());
            if (brak && ktorys && n < 20 && typeof requestAnimationFrame === 'function') requestAnimationFrame(() => this._renderujPoPokazaniu(n + 1));
            else this._ustawPoczatekPaneli();
        },
        matrixTitle(i, j, v) {
            let t = oppenTf('{0} × {1}: {2}% podobieństwa', [this.letter(i), this.letter(j), v]);
            if (v >= 85) t += '. ' + oppenT('Możliwy duplikat!');
            if (this.matrixTrunc[i] && this.matrixTrunc[i][j]) t += oppenTf(' (para liczona z ucięciem do {0} zdań)', [this.SIM_MAX_UNITS]);
            return t + oppenTf('. Kliknij, żeby zobaczyć diff tej pary (wiersz {0} stanie się bazą).', [this.letter(i)]);
        },
        matrixPick(i, j) {
            if (i === j) return;
            this._zatwierdzWszystko();
            if (i !== 0) {
                const moved = this.texts[i];
                this.texts = [moved].concat(this.texts.filter((_, k) => k !== i));
                j = S.simIndexAfterMoveToFront(i, j);
                this.compare();
            }
            this.focusIdx = Math.max(0, j - 1);
            this.$nextTick(() => {
                const el = document.getElementById('xr-sim-panes');
                if (!el || !el.scrollIntoView) return;
                let navH = 0;
                const nav = document.querySelector('nav');
                if (nav) {
                    const pos = getComputedStyle(nav).position;
                    if (pos === 'sticky' || pos === 'fixed') navH = nav.getBoundingClientRect().height;
                }
                el.style.scrollMarginTop = Math.ceil(navH + 16) + 'px';
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        },
        chipClass(pane) {
            if (pane.truncated) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
            if (pane.similarity >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200';
            if (pane.similarity >= 50) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
            return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200';
        },

        // ── 13.10.2026 (edycja w panelach): przeliczanie po zmianie tekstów ──
        _klucz(i) { return i === 0 ? 'a' : 'p' + (i - 1); },
        _kluczIndeks(klucz) { return klucz === 'a' ? 0 : parseInt(String(klucz).slice(1), 10) + 1; },
        _migawka() { return this.texts.map(t => t.body || ''); },
        _body(i) { return this.texts[i] ? (this.texts[i].body || '') : ''; },
        // Diff pary tekstów z pamięci; liczony od nowa tylko, gdy któryś z dwóch tekstów się zmienił.
        _diff(i, j) {
            const a = this._body(i), b = this._body(j), k = i + ',' + j;
            const m = ED.pamiec.get(k);
            if (m && m.a === a && m.b === b) return m.d;
            const d = S.simDiffPair(a, b);
            ED.pamiec.set(k, { a, b, d });
            return d;
        },
        // Diff tylko z pamięci i tylko zgodny z OBECNYMI tekstami (null = przeliczenie jeszcze w drodze).
        _diffAktualny(i, j) {
            const m = ED.pamiec.get(i + ',' + j);
            return m && m.a === this._body(i) && m.b === this._body(j) ? m.d : null;
        },
        // Wynik panelu pi (A kontra tekst pi+1) dla widoku: wiersze obu stron i zakresy zdań.
        _wynikPanelu(pi) { return this._diffAktualny(0, pi + 1); },
        // Najpierw para bazy z panelem z ramką (to widać od razu), potem reszta paneli i macierz kawałkami
        // w tle (setTimeout), żeby kilka długich tekstów nie mroziło pisania. `teraz` = wszystko od razu.
        _przelicz(opcje) {
            const o = opcje || {};
            const gen = ++ED.gen;
            const n = ED.nPor;
            if (n < 2) { ED.kolejka = []; return; }
            const f = Math.min(Math.max(0, this.focusIdx), n - 2);
            const kolej = [f].concat(Array.from({ length: n - 1 }, (_, k) => k).filter(k => k !== f));
            const kroki = kolej.map(pi => () => this._krokPanelu(pi));
            for (let i = 1; i < n; i++) for (let j = i + 1; j < n; j++) kroki.push(() => { this._diff(i, j); });
            kroki.push(() => this._zlozMacierz());
            ED.kolejka = kroki;
            if (o.teraz) { this._dokonczPrzeliczenie(); return; }
            ED.kolejka.shift()();
            this._planujKroki(gen);
        },
        _planujKroki(gen) {
            if (!ED.kolejka.length) return;
            setTimeout(() => {
                if (gen !== ED.gen) return;
                const t0 = Date.now();
                while (ED.kolejka.length && Date.now() - t0 < KROK_BUDZET) ED.kolejka.shift()();
                this._planujKroki(gen);
            }, 0);
        },
        _dokonczPrzeliczenie() { while (ED.kolejka.length) ED.kolejka.shift()(); },
        _krokPanelu(pi) {
            const d = this._diff(0, pi + 1);
            const stary = this.panes[pi];
            if (!stary || stary.similarity !== d.similarity || stary.truncated !== !!d.truncated) {
                const nowy = { similarity: d.similarity, truncated: !!d.truncated };
                this.panes = this.panes.map((p, k) => (k === pi ? nowy : p));
            }
            this._renderujPanel('p' + pi);
            if (pi === this.focusIdx) this._renderujPanel('a');
        },
        _zlozMacierz() {
            const n = ED.nPor;
            if (n < 3) {
                if (this.matrix.length) { this.matrix = []; this.matrixTrunc = []; this.matrixVer++; }
                return;
            }
            const m = Array.from({ length: n }, () => Array(n).fill(100));
            const mt = Array.from({ length: n }, () => Array(n).fill(false));
            for (let j = 1; j < n; j++) {
                const d = this._diff(0, j);
                m[0][j] = m[j][0] = d.similarity;
                mt[0][j] = mt[j][0] = !!d.truncated;
            }
            for (let i = 1; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const d = this._diff(i, j);
                    m[i][j] = m[j][i] = d.similarity;
                    mt[i][j] = mt[j][i] = !!d.truncated;
                }
            }
            if (JSON.stringify([m, mt]) === JSON.stringify([this.matrix, this.matrixTrunc])) return;
            this.matrix = m;
            this.matrixTrunc = mt;
            this.matrixVer++;
        },
        // Nowa treść tekstu i (z panelu): szkic (watch texts), migawka historii, przeliczenie.
        _ustawTekst(i, tekst, opcje) {
            this.texts = this.texts.map((t, k) => (k === i ? { name: t.name || '', body: tekst } : t));
            if (ED.hist) ED.hist = E.historiaDodaj(ED.hist, this._migawka());
            this._przelicz(opcje);
        },

        // ── 13.10.2026 (edycja w panelach): panele edytowalne (DOM poza Alpine) ──
        // 13.10.2026 (przegląd): $root liczy się od elementu, z którego przyszło zdarzenie; po „Porównaj” przycisk
        // znika razem z ekranem wklejania i odłączony $root nie widział paneli (puste panele). Stały korzeń trybu.
        _korzen() {
            if (typeof document === 'undefined') return null;
            const r = this.$root;
            if (r && r.querySelector && r.isConnected !== false) return r;
            const stalyKorzen = typeof document.querySelector === 'function' ? document.querySelector('[data-xray-tryb="similarities"]') : null;
            return stalyKorzen || r || null;
        },
        _edytor(klucz) {
            if (typeof document === 'undefined' || !this._korzen() || !this._korzen().querySelector) return null;
            const w = this._korzen().querySelector('[data-sim-scroll="' + klucz + '"]');
            return w ? w.querySelector('[data-sim-ed]') : null;
        },
        _edytory() {
            const out = [];
            if (typeof document === 'undefined' || !this._korzen() || !this._korzen().querySelectorAll) return out;
            this._korzen().querySelectorAll('[data-sim-scroll]').forEach(w => {
                const el = w.querySelector('[data-sim-ed]');
                if (el) out.push(el);
            });
            return out;
        },
        _zatrzymajEdycje() {
            ED.gen++;
            ED.kolejka = [];
            for (const el of this._edytory()) {
                clearTimeout(el._simT);
                el._simBrudny = false; el._simNieaktualny = false; el._simPodpis = null; el._simNad = null;
                while (el.firstChild) el.removeChild(el.firstChild);
            }
            ED.powiazane = [];
        },
        _renderujWszystko(opcje) {
            if (this.mode !== 'diff') return;
            this._renderujPanel('a', opcje);
            for (let pi = 0; pi < this.panes.length; pi++) this._renderujPanel('p' + pi, opcje);
        },
        // Przerysowanie panelu z wyniku zgodnego z obecnym tekstem. Panelu, w którym trwa składanie znaku
        // (IME, martwy klawisz) albo jest niezatwierdzony tekst, nie ruszamy: wpisane ma pierwszeństwo.
        _renderujPanel(klucz, opcje) {
            if (this.mode !== 'diff') return;
            const el = this._edytor(klucz);
            if (!el) return;
            this._podepnij(el, klucz);
            const o = opcje || {};
            if (el._simSklada || (el._simBrudny && !o.wymus)) { el._simNieaktualny = true; return; }
            const i = this._kluczIndeks(klucz);
            const pi = klucz === 'a' ? this.focusIdx : i - 1;
            const d = this._wynikPanelu(pi);
            if (!d) return;
            const tekst = this._body(i);
            if (!o.wymus && el._simPodpis && el._simPodpis.d === d && el._simPodpis.tekst === tekst) return;
            const aktywny = document.activeElement === el;
            const zazn = aktywny ? E.zaznaczenieW(el, window.getSelection()) : null;
            const w = el.closest('[data-sim-scroll]');
            const top = w ? w.scrollTop : 0;
            E.renderuj(el, tekst, klucz === 'a' ? d.aRows : d.bRows, klucz === 'a' ? d.aZak : d.bZak, klucz, document);
            el._simPodpis = { d, tekst };
            el._simBrudny = false;
            el._simNieaktualny = false;
            if (w) w.scrollTop = top;
            if (zazn) this._ustawZaznaczenie(el, zazn.start, zazn.end);
            this._clearSel(klucz);
            this._odswiezPowiazane();
            SC.wersja++;
            this._ustawDobiegi();
            this._dosynchronizuj();
        },
        _ustawZaznaczenie(el, start, end) {
            try {
                const a = E.punkt(el, start), f = E.punkt(el, end);
                window.getSelection().setBaseAndExtent(a.node, a.offset, f.node, f.offset);
            } catch (e) { /* węzeł zniknął w międzyczasie: kursor zostaje, gdzie postawiła go przeglądarka */ }
        },
        // Tekst z panelu do texts (po przerwie, przy wyjściu z panelu, przed Cofnij i akcjami na wynikach).
        _zatwierdz(el, opcje) {
            if (!el) return false;
            const o = opcje || {};
            const klucz = el.getAttribute('data-sim-text');
            if (!el._simBrudny) {
                if (el._simNieaktualny && !el._simSklada) this._renderujPanel(klucz);
                return false;
            }
            clearTimeout(el._simT);
            if (el._simSklada && !o.koniec) return false;   // compositionend zaplanuje zatwierdzenie
            const i = this._kluczIndeks(klucz);
            if (this.mode !== 'diff' || !this.texts[i] || i >= ED.nPor) { el._simBrudny = false; return false; }
            const tekst = E.tekstZDom(el).tekst;
            el._simBrudny = false;
            if (tekst === this._body(i)) {
                if (el._simNieaktualny) this._renderujPanel(klucz);
                return false;
            }
            this._ustawTekst(i, tekst);
            return true;
        },
        _zatwierdzWszystko() {
            let zmiana = false;
            for (const el of this._edytory()) zmiana = this._zatwierdz(el, { koniec: true }) || zmiana;
            this._dokonczPrzeliczenie();
            return zmiana;
        },
        // Skrót historii z klawiatury: Cmd/Ctrl+Z cofa, Cmd/Ctrl+Shift+Z i Ctrl/Cmd+Y ponawiają.
        _skrotHistorii(e) {
            if (!e || !(e.metaKey || e.ctrlKey) || e.altKey) return null;
            const k = String(e.key || '').toLowerCase();
            if (k === 'z') return e.shiftKey ? 'ponow' : 'cofnij';
            if (k === 'y' && !e.shiftKey) return 'ponow';
            return null;
        },
        cofnij() { this._krokHistorii(E.historiaCofnij); },
        ponow() { this._krokHistorii(E.historiaPonow); },
        _krokHistorii(fn) {
            if (this.mode !== 'diff' || !ED.hist) return;
            this._zatwierdzWszystko();
            const r = fn(ED.hist);
            if (!r) return;
            ED.hist = r.h;
            const przed = this._migawka();
            const i = przed.findIndex((b, k) => k < r.migawka.length && b !== r.migawka[k]);
            this.texts = this.texts.map((t, k) => (k < r.migawka.length ? { name: t.name || '', body: r.migawka[k] } : t));
            // Zmiana w innym panelu niż ten z ramką: ramka idzie za zmianą (baza świeci względem niego).
            if (i > 0 && i - 1 !== this.focusIdx) this.focusIdx = i - 1;
            this._przelicz({ teraz: true });
            this._renderujWszystko();
            if (i >= 0) this._kursorPoZmianie(i, przed[i], r.migawka[i]);
        },
        _kursorPoZmianie(i, przed, po) {
            const el = this._edytor(this._klucz(i));
            if (!el) return;
            const z = E.zmiana(przed, po);
            try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
            this._ustawZaznaczenie(el, z.koniecPo, z.koniecPo);
            this._pokazKursor(el);
        },
        // Kursor poza widokiem panelu (Cofnij w długim tekście): przewiń panel tak, żeby był widać.
        _pokazKursor(el) {
            const w = el.closest('[data-sim-scroll]');
            const sel = window.getSelection();
            if (!w || !sel || !sel.rangeCount) return;
            const r = sel.getRangeAt(0);
            let rect = r.getClientRects && r.getClientRects()[0];
            if (!rect) {
                const n = r.startContainer;
                const e1 = n && (n.nodeType === 1 ? n : n.parentElement);
                rect = e1 ? e1.getBoundingClientRect() : null;
            }
            if (!rect) return;
            const box = w.getBoundingClientRect();
            if (rect.top < box.top || rect.bottom > box.bottom) w.scrollTop += rect.top - box.top - box.height / 3;
            if (w.scrollIntoView) w.scrollIntoView({ block: 'nearest' });
        },
        // Kopiuj / Wytnij / Wklej zawsze jako zwykły tekst (bez znaczników podświetleń).
        _kopiuj(el, e, wytnij) {
            const zazn = E.zaznaczenieW(el, window.getSelection());
            if (!zazn || zazn.start === zazn.end || !e.clipboardData) return;
            const t = E.tekstZDom(el).tekst.slice(Math.min(zazn.start, zazn.end), Math.max(zazn.start, zazn.end));
            e.clipboardData.setData('text/plain', t);
            e.preventDefault();
            if (wytnij) document.execCommand('delete');   // zdarzenie input zaplanuje zatwierdzenie
        },
        _wklej(el, e) {
            const dt = e.clipboardData;
            if (!dt) return;
            e.preventDefault();
            const t = String(dt.getData('text/plain') || '').replace(/\r\n?/g, '\n');
            if (!t) return;
            let ok = false;
            try { ok = document.execCommand('insertText', false, t); } catch (x) { ok = false; }
            if (ok) return;
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const r = sel.getRangeAt(0);
            r.deleteContents();
            const n = document.createTextNode(t);
            r.insertNode(n);
            r.setStartAfter(n);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        },
        _zdanieZ(el, cel) {
            const e1 = cel && (cel.nodeType === 1 ? cel : cel.parentElement);
            const s = e1 && e1.closest ? e1.closest('.xr-sim-z') : null;
            return s && el.contains(s) ? s : null;
        },
        _para(span) {
            const v = span ? span.getAttribute('data-sim-pair') : null;
            return v === null ? null : Number(v);
        },
        // Zdarzenia panelu (raz na element): pisanie, składanie znaku, historia, schowek, linkowanie zdań.
        _podepnij(el, klucz) {
            if (el.getAttribute('data-sim-text') !== klucz) el.setAttribute('data-sim-text', klucz);
            const etykieta = oppenTf('Treść tekstu {0}', [this.letter(this._kluczIndeks(klucz))]);
            if (el.getAttribute('aria-label') !== etykieta) el.setAttribute('aria-label', etykieta);
            if (el._simPodpiety) return;
            el._simPodpiety = true;
            try { el.contentEditable = 'plaintext-only'; } catch (e) { /* przeglądarka bez plaintext-only */ }
            if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
            el.setAttribute('data-placeholder', oppenT('Wklej tu całą treść reklamy…'));
            const kl = () => el.getAttribute('data-sim-text');
            const zaplanuj = () => {
                el._simBrudny = true;
                ED.pisanie = { klucz: kl(), t: Date.now() };
                clearTimeout(el._simT);
                el._simT = setTimeout(() => this._zatwierdz(el), PRZERWA_EDYCJI);
            };
            el.addEventListener('input', (e) => {
                SC.wersja++;   // tekst się przesunął: położenia zdań do przeliczenia
                if (!e.isComposing) zaplanuj();
            });
            el.addEventListener('compositionstart', () => { el._simSklada = true; clearTimeout(el._simT); });
            el.addEventListener('compositionend', () => { el._simSklada = false; zaplanuj(); });
            // Cofnij/Ponów z menu Edycja albo z menu kontekstowego: też nasz stos, nie natywny.
            el.addEventListener('beforeinput', (e) => {
                if (e.inputType === 'historyUndo') { e.preventDefault(); this.cofnij(); }
                else if (e.inputType === 'historyRedo') { e.preventDefault(); this.ponow(); }
            });
            el.addEventListener('keydown', (e) => {
                if (e.isComposing || e.keyCode === 229) return;
                const skrot = this._skrotHistorii(e);
                if (skrot) { e.preventDefault(); this[skrot](); return; }
                ED.pisanie = { klucz: kl(), t: Date.now() };
            });
            el.addEventListener('keyup', (e) => { if (/^(Arrow|Home|End|Page)/.test(e.key)) this._pinPoKursorze(el); });
            // Po wyjściu z panelu zatwierdzamy dopiero w następnym zadaniu: klik w inny panel zdąży postawić kursor.
            el.addEventListener('blur', () => { el._simNad = null; setTimeout(() => this._zatwierdz(el, { koniec: true }), 0); });
            el.addEventListener('copy', (e) => this._kopiuj(el, e, false));
            el.addEventListener('cut', (e) => this._kopiuj(el, e, true));
            el.addEventListener('paste', (e) => this._wklej(el, e));
            el.addEventListener('mouseover', (e) => {
                const s = this._zdanieZ(el, e.target);
                if (!s || s === el._simNad) return;
                el._simNad = s;
                this.mysz(e);   // najechanie po prawdziwym ruchu myszy, nie po przewinięciu tekstu pod nią
                this.linkEnter(kl(), this._para(s), s, e.clientY);
            });
            el.addEventListener('mouseleave', () => { el._simNad = null; });
            el.addEventListener('mousedown', () => this.linkDown());
            el.addEventListener('click', (e) => {
                const s = this._zdanieZ(el, e.target);
                this.linkClick(kl(), s ? this._para(s) : null, e);
            });
        },
        // Kursor przesunięty klawiaturą: para zdania, w którym stoi, świeci i staje na tej samej wysokości.
        _pinPoKursorze(el) {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount || !sel.isCollapsed) return;
            const kl = el.getAttribute('data-sim-text');
            if (!this._linkSide(kl)) return;
            const s = this._zdanieZ(el, sel.focusNode);
            const pair = s ? this._para(s) : null;
            this.linkHover = null;
            if (this.linkPin === pair) return;
            this.linkPin = pair;
            if (s && pair !== null) this._wyrownajDoKursora(kl, s, sel);
        },
        // Klasa xr-sim-linked na spanach pary (najechanie ma pierwszeństwo przed przypięciem).
        _odswiezPowiazane() {
            for (const s of ED.powiazane) s.classList.remove('xr-sim-linked');
            ED.powiazane = [];
            if (this.mode !== 'diff' || typeof document === 'undefined' || !this._korzen() || !this._korzen().querySelectorAll) return;
            const pair = this.linkHover !== null ? this.linkHover : this.linkPin;
            if (pair === null || pair === undefined) return;
            for (const k of ['a', 'p' + this.focusIdx]) {
                this._korzen().querySelectorAll('[data-sim-row="' + k + '-' + pair + '"]').forEach(s => {
                    s.classList.add('xr-sim-linked');
                    ED.powiazane.push(s);
                });
            }
        },
        // Panel, w którym ktoś właśnie pisze, nie jest przewijany przez linkowanie zdań.
        _wTrakciePisania(klucz) {
            const el = this._edytor(klucz);
            if (el && (el._simSklada || el._simBrudny)) return true;
            return ED.pisanie.klucz === klucz && Date.now() - ED.pisanie.t < PISANIE_BLOKUJE_SCROLL;
        },

        // ── Śledzenie zdań (1.1.427) między A i panelem z ramką ──
        _linkSide(side) { return side === 'a' || side === 'p' + this.focusIdx; },
        linkEnter(side, pair, el, y) {
            if (!this._linkSide(side)) return;
            this.linkHover = pair;
            if (pair === null) return;
            this._wyrownajPoNajechaniu(side, typeof y === 'number' ? y : null, el);
        },

        // ── 13.10.2026 (Auto-scroll jak w Skryptach PL): wspólne przewijanie A i panelu z ramką ──
        // Przed: drugi panel ruszał się tylko przy najechaniu na zdanie, którego para była poza widokiem,
        // a kółko, pasek i klawiatura nie przesuwały go wcale, więc panele się rozjeżdżały.
        // Teraz jak w Skryptach PL: panel pod gestem użytkownika prowadzi (prowadzi), każde jego przewinięcie
        // (przewinieto) w tej samej klatce ustawia drugi panel mapą XSimPrzewijanie, a nasze własne przewinięcia
        // (SC.programowe) nie robią z drugiego panelu prowadzącego, więc panele się nie przepychają.
        _drugiPanel(kl) {
            if (kl === 'a') return this.panes.length ? 'p' + this.focusIdx : null;
            return kl === 'p' + this.focusIdx ? 'a' : null;   // 3+ teksty: A idzie tylko za panelem z ramką
        },
        _scroll(kl) {
            const r = this._korzen();
            return r && r.querySelector ? r.querySelector('[data-sim-scroll="' + kl + '"]') : null;
        },
        _teraz() { return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now(); },
        // Panel, którego nie wolno przesuwać: ktoś w nim pisze (także składanie znaku i niezatwierdzony tekst)
        // albo zaznacza tekst. Sam kursor w panelu go nie blokuje: klik w zdanie stawia kursor, a para i tak
        // ma iść za przewijaniem drugiego panelu; po powrocie do pisania przeglądarka sama pokaże kursor.
        _chroniony(kl) {
            const el = this._edytor(kl);
            if (!el) return true;
            if (this._wTrakciePisania(kl)) return true;
            if (typeof document === 'undefined' || document.activeElement !== el || typeof window.getSelection !== 'function') return false;
            const sel = window.getSelection();
            return !!(sel && !sel.isCollapsed && sel.anchorNode && el.contains(sel.anchorNode));
        },
        // Gest użytkownika w panelu (kółko, palec, wciśnięcie, w tym na pasku przewijania, klawisz).
        prowadzi(kl) {
            SC.kierowca = kl;
            SC.programowe = Object.assign({}, SC.programowe, { [kl]: 0 });   // gest przerywa nasze płynne przewijanie
        },
        mysz(e) {
            if (!e || typeof e.clientY !== 'number') return;
            if (e.clientX !== SC.myszX || e.clientY !== SC.myszY) SC.myszRuch = this._teraz();
            SC.myszX = e.clientX;
            SC.myszY = e.clientY;
        },
        przewinieto(kl) {
            if (SC.kierowca !== kl || !this.autoScroll || this.mode !== 'diff') return;
            if (this._teraz() < (SC.programowe[kl] || 0)) return;
            if (SC.raf || typeof requestAnimationFrame !== 'function') return;
            SC.raf = requestAnimationFrame(() => {
                SC.raf = null;
                SC.ostatniSync = this._teraz();
                clearTimeout(SC.najazdT);
                this._synchronizuj(kl, this._liniaOdczytu(kl), 'auto');
            });
        },
        // Linia odczytu: mysz nad panelem, inaczej 35% jego widocznej części.
        _liniaOdczytu(kl) {
            const w = this._scroll(kl);
            if (!w) return 0;
            const r = w.getBoundingClientRect();
            const x = SC.myszX, y = SC.myszY;
            if (y !== null && x !== null && y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) return y;
            const wys = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : r.bottom;
            const gora = Math.max(r.top, 0), dol = Math.min(r.bottom, wys);
            return dol > gora ? gora + (dol - gora) * LINIA_ODCZYTU : r.top + r.height * LINIA_ODCZYTU;
        },
        // Położenia zdań z parą w tekście panelu (od góry tekstu, więc niezależne od przewinięcia), z pamięci.
        _geometria(kl) {
            const el = this._edytor(kl);
            if (!el) return null;
            const c = SC.geo[kl];
            if (c && c.el === el && c.wersja === SC.wersja && c.w === el.offsetWidth && c.h === el.offsetHeight) return c;
            const r0 = el.getBoundingClientRect();
            const zdania = [];
            el.querySelectorAll('.xr-sim-z[data-sim-pair]').forEach(s => {
                const rs = s.getClientRects();
                if (!rs || !rs.length) return;
                zdania.push({ pair: Number(s.getAttribute('data-sim-pair')),
                              start: P.punktLinii(rs[0], r0.left, r0.width, r0.top, false),
                              end: P.punktLinii(rs[rs.length - 1], r0.left, r0.width, r0.top, true) });
            });
            const g = { el, wersja: SC.wersja, w: el.offsetWidth, h: el.offsetHeight, zdania };
            SC.geo = Object.assign({}, SC.geo, { [kl]: g });
            return g;
        },
        _kotwice(gZ, gDo) {
            const k = SC.kotw;
            if (k && k.gZ === gZ && k.gDo === gDo) return k.k;
            SC.kotw = { gZ, gDo, k: P.kotwice(gZ.zdania, gDo.zdania, gZ.h, gDo.h) };
            return SC.kotw.k;
        },
        // Ustawia drugi panel tak, żeby punkt tekstu pod wysokością y w panelu kl stał w nim na tej samej wysokości.
        _synchronizuj(kl, y, zachowanie) {
            if (!this.autoScroll || this.mode !== 'diff' || typeof y !== 'number') return false;
            const inny = this._drugiPanel(kl);
            if (!inny || this._chroniony(inny)) return false;
            const elZ = this._edytor(kl), elDo = this._edytor(inny);
            if (!elZ || !elDo) return false;
            // Oba panele narysowane z TEGO SAMEGO wyniku, inaczej numery par się nie zgadzają (przeliczenie w drodze).
            if (!elZ._simPodpis || !elDo._simPodpis || elZ._simPodpis.d !== elDo._simPodpis.d) return false;
            const wDo = elDo.closest('[data-sim-scroll]');
            const gZ = this._geometria(kl), gDo = this._geometria(inny);
            if (!wDo || !gZ || !gDo) return false;
            const xDo = P.mapuj(this._kotwice(gZ, gDo), y - elZ.getBoundingClientRect().top);
            const top = P.celPrzewiniecia(wDo.scrollTop, wDo.scrollHeight - wDo.clientHeight, elDo.getBoundingClientRect().top + xDo, y);
            if (Math.abs(top - wDo.scrollTop) < PROG_PX) return false;
            const plynnie = zachowanie === 'smooth' && typeof wDo.scrollTo === 'function';
            SC.programowe = Object.assign({}, SC.programowe, { [inny]: this._teraz() + (plynnie ? SYNC_PLYNNY_MS : SYNC_AUTO_MS) });
            if (plynnie) wDo.scrollTo({ top, behavior: 'smooth' });
            else wDo.scrollTop = top;
            return true;
        },
        // Najechanie na zdanie: para staje na wysokości myszy (płynnie, po krótkiej zwłoce). W trakcie
        // przewijania kółkiem zdania płyną pod nieruchomą myszą; wtedy najechanie nic nie przewija.
        _wyrownajPoNajechaniu(kl, y, el) {
            clearTimeout(SC.najazdT);
            if (!this.autoScroll || !this._drugiPanel(kl)) return;
            const teraz = this._teraz();
            if (teraz - SC.ostatniSync < NAJAZD_PO_SYNC || teraz - SC.myszRuch > RUCH_MYSZY_MS) return;
            SC.najazdT = setTimeout(() => {
                if (!el || el.isConnected === false || this._teraz() - SC.ostatniSync < NAJAZD_PO_SYNC) return;
                const r = el.getClientRects ? el.getClientRects()[0] : null;
                const yy = SC.myszY !== null ? SC.myszY : (y !== null ? y : (r ? r.top + r.height / 2 : null));
                this._synchronizuj(kl, yy, 'smooth');
            }, NAJAZD_ZWLOKA);
        },
        // Kursor przesunięty klawiaturą: para zdania z kursorem staje na wysokości kursora.
        _wyrownajDoKursora(kl, s, sel) {
            if (!this.autoScroll) return;
            let r = null;
            try { r = sel && sel.rangeCount ? sel.getRangeAt(0).getClientRects()[0] : null; } catch (e) { r = null; }
            if (!r && s && s.getClientRects) r = s.getClientRects()[0];
            if (r) this._synchronizuj(kl, r.top + r.height / 2, 'smooth');
        },
        // Po przerysowaniu (przeliczenie, przełączenie panelu z ramką) drugi panel wraca na miejsce
        // względem tego, który ostatnio prowadził; prowadził panel bez ramki (3+ teksty) = nowy panel z ramką idzie za A.
        _dosynchronizuj() {
            if (!this.autoScroll || !SC.kierowca || SC.rafPo || typeof requestAnimationFrame !== 'function') return;
            SC.rafPo = requestAnimationFrame(() => {
                SC.rafPo = null;
                const k = SC.kierowca && this._drugiPanel(SC.kierowca) ? SC.kierowca : 'a';
                if (this._drugiPanel(k)) this._synchronizuj(k, this._liniaOdczytu(k), 'auto');
            });
        },
        // Nowe porównanie: panele zaczynają od początku tekstu (za górnym dobiegiem), nikt nie prowadzi.
        _nowePrzewijanie() {
            SC.kierowca = null;
            SC.programowe = {};
            SC.geo = {};
            SC.kotw = null;
            clearTimeout(SC.najazdT);
            const r = this._korzen();
            if (r && r.querySelectorAll) r.querySelectorAll('[data-sim-scroll]').forEach(w => { w._simStart = false; });
        },
        _ustawPoczatekPaneli() {
            const r = this._korzen();
            if (!r || !r.querySelectorAll) return;
            this._ustawDobiegi();
            r.querySelectorAll('[data-sim-scroll]').forEach(w => {
                if (w._simStart) return;
                const d = w.querySelector('.xr-sim-dobieg-gora');
                w._simStart = true;
                SC.programowe = Object.assign({}, SC.programowe, { [w.getAttribute('data-sim-scroll')]: this._teraz() + SYNC_AUTO_MS });
                // tekst od góry panelu; dodatek dobiegu (zdania bez pary na początku drugiego tekstu) zostaje
                // widoczny, więc pierwsze pary stoją od razu naprzeciw siebie
                const dodatek = w._simDobiegi ? w._simDobiegi.gora : 0;
                w.scrollTop = d ? Math.max(0, d.offsetHeight - dodatek) : 0;
            });
        },
        // Dodatki dobiegów A i panelu z ramką (XSimPrzewijanie.dobiegi); inne panele bez dodatku. Zmiana górnego
        // dobiegu przesuwa tekst, więc panel przewijamy o tyle samo: na ekranie nic nie skacze.
        _ustawDobiegi() {
            if (!this.autoScroll || this.mode !== 'diff') return;
            const kb = 'p' + this.focusIdx;
            const ea = this._edytor('a'), eb = this._edytor(kb);
            if (!ea || !eb || !ea._simPodpis || !eb._simPodpis || ea._simPodpis.d !== eb._simPodpis.d) return;
            const ga = this._geometria('a'), gb = this._geometria(kb);
            if (!ga || !gb) return;
            const d = P.dobiegi(ga.zdania, gb.zdania, ga.h, gb.h);
            const r = this._korzen();
            r.querySelectorAll('[data-sim-scroll]').forEach(w => {
                const kl = w.getAttribute('data-sim-scroll');
                const gora = kl === 'a' ? d.goraZ : (kl === kb ? d.goraDo : 0);
                const dol = kl === 'a' ? d.dolZ : (kl === kb ? d.dolDo : 0);
                const stare = w._simDobiegi || { gora: 0, dol: 0 };
                if (Math.abs(stare.gora - gora) < PROG_PX && Math.abs(stare.dol - dol) < PROG_PX) return;
                const el = w.querySelector('[data-sim-ed]');
                const przed = el ? el.getBoundingClientRect().top - w.getBoundingClientRect().top : 0;
                w._simDobiegi = { gora, dol };
                w.style.setProperty('--xr-sim-dg', Math.round(gora) + 'px');
                w.style.setProperty('--xr-sim-dd', Math.round(dol) + 'px');
                const dy = el ? el.getBoundingClientRect().top - w.getBoundingClientRect().top - przed : 0;
                if (Math.abs(dy) >= PROG_PX) {
                    SC.programowe = Object.assign({}, SC.programowe, { [kl]: this._teraz() + SYNC_AUTO_MS });
                    w.scrollTop += dy;
                }
            });
        },
        // Włączenie albo wyłączenie Auto-scroll pokazuje albo chowa dobiegi: tekst zostaje w tym samym miejscu.
        _przelaczonoAutoScroll() {
            clearTimeout(SC.najazdT);
            const r = this._korzen();
            if (!r || !r.querySelectorAll || typeof this.$nextTick !== 'function') return;
            const przed = [];
            r.querySelectorAll('[data-sim-scroll]').forEach(w => {
                const el = w.querySelector('[data-sim-ed]');
                if (el) przed.push({ w, el, dy: el.getBoundingClientRect().top - w.getBoundingClientRect().top });
            });
            this.$nextTick(() => {
                for (const p of przed) {
                    const dy = p.el.getBoundingClientRect().top - p.w.getBoundingClientRect().top - p.dy;
                    if (Math.abs(dy) < PROG_PX) continue;
                    SC.programowe = Object.assign({}, SC.programowe, { [p.w.getAttribute('data-sim-scroll')]: this._teraz() + SYNC_AUTO_MS });
                    p.w.scrollTop += dy;
                }
                this._ustawDobiegi();   // przy wyłączonym Auto-scroll dodatki dobiegów się nie liczyły
            });
        },
        // Klik w dobieg (puste miejsce nad albo pod tekstem): kursor na początek albo koniec tekstu, jak w dokumencie.
        kursorNaBrzeg(kl, naKoniec, e) {
            const el = this._edytor(kl);
            if (!el || this.mode !== 'diff') return;
            if (e && e.preventDefault) e.preventDefault();
            try { el.focus({ preventScroll: true }); } catch (x) { /* ignore */ }
            const n = naKoniec ? E.tekstZDom(el).tekst.length : 0;
            this._ustawZaznaczenie(el, n, n);
        },
        linkDown() {
            const sel = window.getSelection && window.getSelection();
            this._selAtDown = !!(sel && !sel.isCollapsed);
        },
        // 13.10.2026 (edycja w panelach): klik stawia kursor, więc para idzie za kursorem (klik w zdanie
        // przypina jego parę, klik poza parą ją zdejmuje); podwójny klik i przeciągnięcie nic nie przypinają.
        linkClick(side, pair, e) {
            clearTimeout(this._pinTimer);
            if (!this._linkSide(side)) {
                const pi = parseInt(String(side).slice(1), 10);
                if (side !== 'a' && Number.isInteger(pi) && pi !== this.focusIdx) this.focusIdx = pi;
                return;
            }
            if ((e && e.detail > 1) || this._selAtDown) return;
            this._pinTimer = setTimeout(() => {
                const sel = window.getSelection && window.getSelection();
                if (sel && !sel.isCollapsed) return;
                this.linkPin = pair === undefined ? null : pair;
            }, 260);
        },
        // ── Zaznaczenie w każdym panelu osobno (CSS Custom Highlight API, 1.1.427) ──
        _initSel() {
            if (!(window.CSS && CSS.highlights && typeof window.Highlight === 'function')) return;
            const hl = new Highlight();
            CSS.highlights.set('xr-sim-sel', hl);
            const ranges = new Map();
            const root = this._korzen();
            const paneOf = (node) => {
                const el = node && (node.nodeType === 1 ? node : node.parentElement);
                const p = el && el.closest ? el.closest('[data-sim-text]') : null;
                return p && root.contains(p) ? p : null;
            };
            const draw = (active) => {
                hl.clear();
                for (const [key, r] of ranges) if (key !== active) hl.add(r);
            };
            this._sel = { hl, ranges, draw };
            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape' || e.defaultPrevented) return;
                if (typeof window.xrayHistoriaOtwarte === 'function' && window.xrayHistoriaOtwarte()) return;   // 14.10.2026 (historia Ads X-Ray)
                const a = document.activeElement;
                if (a && a.closest && a.closest('input, textarea, select, [contenteditable], [role="dialog"], [role="menu"]')) return;
                if ([...document.querySelectorAll('[role="dialog"], [aria-modal="true"]')].some(d => d.offsetParent !== null)) return;
                const sel = document.getSelection();
                const inPane = sel && sel.rangeCount && paneOf(sel.getRangeAt(0).startContainer);
                if (!ranges.size && !inPane) return;
                ranges.clear();
                hl.clear();
                if (inPane) sel.removeAllRanges();
            });
            document.addEventListener('selectionchange', () => {
                const sel = document.getSelection();
                if (!sel || !sel.rangeCount) { draw(null); return; }
                const r = sel.getRangeAt(0);
                const pa = paneOf(r.startContainer);
                if (!pa || pa !== paneOf(r.endContainer)) { draw(null); return; }
                const key = pa.getAttribute('data-sim-text');
                if (r.collapsed) ranges.delete(key);
                else ranges.set(key, r.cloneRange());
                draw(r.collapsed ? null : key);
            });
        },
        _clearSel(key) {
            if (!this._sel) return;
            if (key) this._sel.ranges.delete(key);
            else this._sel.ranges.clear();
            this._sel.draw(null);
        },
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Object.assign({}, XSim, { XSimEdycja, XSimPrzewijanie, xraySimilarities });
}
