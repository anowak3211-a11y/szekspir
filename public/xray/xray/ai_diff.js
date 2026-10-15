/*
 * 13.10.2026 (Ads X-Ray): tryb „AI Diff” w zakładce ?tryb=ai-diff.
 *
 * Port 1:1 strony /ai-diff (backend/templates/ai_diff.html, tamtej strony NIE ruszamy:
 * właściciel porównuje stare z nowym). Dwie warstwy jak w oryginale:
 *   1. mechaniczny diff w przeglądarce (cdiff.js, zero kosztu),
 *   2. PŁATNY werdykt AI (POST /api/xray/ai-diff), wyłącznie po jawnym kliknięciu
 *      przycisku z ceną (data-cost-op="ai_diff_verdict").
 *
 * Różnice względem starej strony:
 *   - wersja samodzielna: bez okna „Z reklamy” i bez ?a=/?b= (brak bazy reklam);
 *   - id elementów z przedrostkiem xr- (stare id zostają na starej stronie);
 *   - ULEPSZENIE: zapłacony werdykt AI zapamiętany w localStorage 'xray_aidiff_werdykt'
 *     pod kluczem pary tekstów; przełączenie trybu albo F5 nie wyrzuca już opłaconego wyniku,
 *     a powrót tej samej pary przywraca go BEZ nowego wywołania;
 *   - klucz pary liczony z CAŁEGO tekstu (stary odcisk próbkował co n-ty znak, więc
 *     podmiana słowa tej samej długości w długim tekście nie zmieniała klucza; przy
 *     przywracaniu zapisanego werdyktu taka kolizja pokazałaby wynik innej pary).
 *
 * 13.10.2026 (edycja w panelach): w widoku „Obok siebie” A i B poprawia się wprost w diffie, jak w
 * Dokumentach Google (strona = jeden contenteditable, siatka z subgrid trzyma wyrównanie wierszy);
 * zapis do tego samego szkicu po przerwie w pisaniu, własne Cofnij/Ponów, werdykt AI po edycji tylko
 * oznaczony jako nieaktualny (blok EDYCJA-W-PANELACH nie woła sieci). „Pod sobą” zostaje do czytania.
 *
 * Renderer diffu = vanilla DOM (lekcja 1.1.172: 36k węzłów pod proxy Alpine). Wynik silnika
 * trzymany POZA Alpine, w zmiennych tego modułu.
 *
 * Plik musi się wykonać PRZED startem Alpine (zwykły <script>, bez defer), bo x-data
 * woła globalną funkcję xrayAiDiff().
 */
(function (root) {
    'use strict';

    const KLUCZ_TEKSTOW = 'xray_aidiff_texts';          // ten sam co na starej stronie
    const KLUCZ_WERDYKTOW = 'xray_aidiff_werdykt';  // nowe: zapamiętane płatne werdykty
    const MAX_WERDYKTOW = 6;
    const LIMIT_ZNAKOW = 500000;
    const ZAPIS_MS = 400;
    const EDYCJA_MS = 700;      // 13.10.2026 (edycja w panelach): przerwa w pisaniu przed przeliczeniem diffu

    // ─────────────────────────────────────────────────────────────────────────
    // Czyste pomocniki (eksportowane do testów node).
    // ─────────────────────────────────────────────────────────────────────────

    // Polska liczba mnoga: 1 zmiana / 2-4 zmiany / 5+ zmian (z wyjątkiem 12-14).
    function adPlural(n, one, few, many) {
        if (n === 1) return one;
        const m10 = n % 10, m100 = n % 100;
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
        return many;
    }

    function adNorm(s) {
        // normalize NFC: silnik trzyma teksty w NFC, ale cytat AI wraca z surowego body.
        return (s || '').normalize('NFC').toLowerCase()
            .replace(/[‘’ʼ‚]/g, "'")
            .replace(/[“”„‟]/g, '”')
            .replace(/[\u2013\u2014\u2212\u2015]/g, '-')   // pauzy i minusy jako zwykły łącznik
            .replace(/…/g, '...')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function adTextOfSegs(segs) {
        let s = '';
        for (let i = 0; i < (segs || []).length; i++) s += segs[i].text;
        return s;
    }

    // „Tylko zmiany”: zmienione wiersze + kontekst ±2; krótkie przerwy (<4) zostają,
    // dłuższe zwinięte w znacznik liczby ukrytych linii.
    function adBuildPlan(rows, onlyChanged) {
        if (!onlyChanged) return rows.map(r => ({ row: r }));
        const CTX = 2, MINGAP = 4, n = rows.length, keep = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
            const r = rows[i];
            if ((r.changeIdx !== null && r.changeIdx !== undefined) || r.kind === 'move-in') {
                for (let j = Math.max(0, i - CTX); j <= Math.min(n - 1, i + CTX); j++) keep[j] = 1;
            }
        }
        let run = 0;
        for (let i = 0; i <= n; i++) {
            if (i < n && !keep[i]) { run++; continue; }
            if (run && run < MINGAP) for (let j = i - run; j < i; j++) keep[j] = 1;
            run = 0;
        }
        const out = [];
        run = 0;
        for (let i = 0; i < n; i++) {
            if (keep[i]) {
                // 13.10.2026 (edycja w panelach): `od` = indeks pierwszego ukrytego wiersza; edytowalne
                // strony trzymają ukryte linie poza DOM i oddają je przy czytaniu tekstu.
                if (run) { out.push({ gap: run, od: i - run }); run = 0; }
                out.push({ row: rows[i] });
            } else run++;
        }
        if (run) out.push({ gap: run, od: n - run });
        return out;
    }

    // Odcisk jednego tekstu: dwa 32-bitowe skróty (djb2-xor i FNV-1a) po KAŻDYM znaku + długość.
    // 500 tys. znaków to kilka milisekund, a klucz musi rozróżniać pary, bo przywraca opłacony wynik.
    function odciskTekstu(s) {
        const t = String(s || '');
        let h1 = 5381, h2 = 0x811c9dc5;
        for (let i = 0; i < t.length; i++) {
            const c = t.charCodeAt(i);
            h1 = ((h1 * 33) ^ c) >>> 0;
            h2 = Math.imul(h2 ^ c, 0x01000193) >>> 0;
        }
        return h1.toString(36) + h2.toString(36) + ':' + t.length;
    }
    // Klucz pary (kolejność ma znaczenie: werdykt mówi o A i B, a cytaty są przypięte do stron).
    function kluczPary(a, b) {
        return odciskTekstu(a) + '|' + odciskTekstu(b);
    }

    // Werdykt z pamięci musi mieć kształt, którego oczekuje szablon; uszkodzony wpis = brak wpisu.
    function poprawnyWerdykt(v) {
        if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
        const score = Number(v.overall_score);
        if (!isFinite(score) || typeof v.verdict !== 'string' || typeof v.summary !== 'string') return null;
        const lista = x => (Array.isArray(x) ? x : []);
        return {
            overall_score: Math.max(0, Math.min(100, Math.round(score))),
            verdict: v.verdict,
            summary: v.summary,
            structure: lista(v.structure).filter(r => r && typeof r === 'object' && typeof r.section === 'string'),
            pairs: lista(v.pairs).filter(p => p && typeof p === 'object'
                && typeof p.a_quote === 'string' && typeof p.b_quote === 'string'),
            beyond_diff: typeof v.beyond_diff === 'string' ? v.beyond_diff : '',
            recommendations: lista(v.recommendations).filter(r => typeof r === 'string'),
        };
    }

    function czytajWerdykty(storage) {
        try {
            const surowe = JSON.parse((storage && storage.getItem(KLUCZ_WERDYKTOW)) || 'null');
            if (!surowe || typeof surowe !== 'object' || Array.isArray(surowe)) return {};
            const out = {};
            Object.keys(surowe).forEach(k => {
                const w = surowe[k];
                const verdict = w && poprawnyWerdykt(w.verdict);
                if (!verdict) return;
                out[k] = {
                    verdict,
                    model: typeof w.model === 'string' ? w.model : '',
                    truncatedA: !!w.truncatedA,
                    truncatedB: !!w.truncatedB,
                    ts: Number(w.ts) || 0,
                };
            });
            return out;
        } catch (e) { return {}; }
    }

    function werdyktZPamieci(storage, klucz) {
        if (!klucz) return null;
        const w = czytajWerdykty(storage);
        return Object.prototype.hasOwnProperty.call(w, klucz) ? w[klucz] : null;
    }

    // Zapis z limitem: zostaje MAX_WERDYKTOW najświeższych wpisów. Zwraca true, gdy się udało.
    function zapiszWerdykt(storage, klucz, wpis, teraz, max) {
        const verdict = wpis && poprawnyWerdykt(wpis.verdict);
        if (!storage || !klucz || !verdict) return false;
        const limit = max || MAX_WERDYKTOW;
        const w = czytajWerdykty(storage);
        w[klucz] = {
            verdict,
            model: String(wpis.model || ''),
            truncatedA: !!wpis.truncatedA,
            truncatedB: !!wpis.truncatedB,
            ts: Number(teraz) || Date.now(),
        };
        const zostaw = Object.keys(w).sort((x, y) => w[y].ts - w[x].ts).slice(0, limit);
        const out = {};
        zostaw.forEach(k => { out[k] = w[k]; });
        try { storage.setItem(KLUCZ_WERDYKTOW, JSON.stringify(out)); return true; }
        catch (e) { return false; }
    }

    function usunWerdykt(storage, klucz) {
        if (!storage || !klucz) return false;
        const w = czytajWerdykty(storage);
        if (!Object.prototype.hasOwnProperty.call(w, klucz)) return false;
        delete w[klucz];
        try { storage.setItem(KLUCZ_WERDYKTOW, JSON.stringify(w)); return true; }
        catch (e) { return false; }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 13.10.2026 (edycja w panelach): czyste pomocniki edycji A i B wprost w diffie.
    // Strona (A albo B) to JEDEN kontener contenteditable="plaintext-only" z komórkami linii;
    // tekst czytamy z DOM dokładnie (linie, <br>, bloki dodane przez przeglądarkę), ukryte linie
    // „tylko zmian” i puste komórki wyrównania nigdy nie trafiają do tekstu jako coś innego niż są.
    // ─────────────────────────────────────────────────────────────────────────
    const ED_BLOKI = { DIV: 1, P: 1, LI: 1, UL: 1, OL: 1, PRE: 1, BLOCKQUOTE: 1, SECTION: 1, ARTICLE: 1,
                       H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, TABLE: 1, TR: 1 };

    function adLiczLinie(t) { return t === '' ? 0 : String(t).split('\n').length; }

    // Tekst strony z DOM + pozycje znaków dla punktów {node, offset} (zaznaczenie, kursor).
    // rej = { ukryte: Map(element luki -> [linie]), puste: Set(komórek wyrównania) }.
    //  - komórka (blok) = linia; <br> i „\n” w tekście = podział linii; JEDEN końcowy podział
    //    w bloku nie tworzy linii (tak go rysuje przeglądarka: wypełniacz pustej linii);
    //  - komórka wyrównania bez treści = brak linii (z treścią = nowa linia w tym miejscu);
    //  - pusty blok bez tekstu i bez <br> ma zerową wysokość = brak linii;
    //  - luka „ukryto N linii” oddaje zapamiętane linie, jej napis nigdy nie trafia do tekstu;
    //  - element contenteditable="false" (dekoracja) jest pomijany.
    // brakLuk = true, gdy z DOM zniknęła luka (edycja usunęłaby ukryte linie).
    function adCzytajStrone(strona, rej, punkty) {
        const ukryte = (rej && rej.ukryte) || new Map();
        const puste = (rej && rej.puste) || new Set();
        const pkt = punkty || [];
        const poz = pkt.map(() => null);
        const zrobione = pkt.map(() => false);
        let out = '', bylo = false, blok = null, czekajace = [], luki = 0;

        function nowyBlok(ph) { blok = { t: '', m: [], ph: !!ph, tresc: false }; }
        function wypisz(t, znaczniki) {
            if (bylo) out += '\n';
            const baza = out.length;
            czekajace.forEach(i => { poz[i] = baza; });
            czekajace = [];
            znaczniki.forEach(([i, k]) => { poz[i] = baza + Math.min(k, t.length); });
            out += t;
            bylo = true;
        }
        function zamknij() {
            if (!blok) return;
            const b = blok;
            blok = null;
            let t = b.t;
            if (t.length && t[t.length - 1] === '\n') t = t.slice(0, -1);
            if (t === '' && (b.ph || !b.tresc)) { b.m.forEach(([i]) => czekajace.push(i)); return; }
            wypisz(t, b.m);
        }
        function oznacz(i, wBloku) {
            zrobione[i] = true;
            if (blok && wBloku !== null) blok.m.push([i, wBloku]);
            else czekajace.push(i);
        }
        function punktyElementu(n, k) {
            for (let i = 0; i < pkt.length; i++) {
                if (!zrobione[i] && pkt[i].node === n && pkt[i].offset === k) oznacz(i, blok ? blok.t.length : null);
            }
        }
        function punktyWewnatrz(n) {
            // Punkt w pominiętym poddrzewie (luka, dekoracja): pozycja tuż przed nim.
            for (let i = 0; i < pkt.length; i++) {
                if (zrobione[i]) continue;
                for (let x = pkt[i].node; x; x = x.parentNode) {
                    if (x === n) { oznacz(i, blok ? blok.t.length : null); break; }
                    if (x === strona) break;
                }
            }
        }
        function idz(n) {
            if (n.nodeType === 3) {
                const v = String(n.nodeValue || '');
                if (!blok) nowyBlok(false);
                for (let i = 0; i < pkt.length; i++) {
                    if (!zrobione[i] && pkt[i].node === n) oznacz(i, blok.t.length + Math.max(0, Math.min(v.length, pkt[i].offset)));
                }
                if (v.length) blok.tresc = true;
                blok.t += v;
                return;
            }
            if (n.nodeType !== 1) return;
            if (ukryte.has(n)) {
                zamknij();
                luki++;
                punktyWewnatrz(n);
                const linie = ukryte.get(n);
                if (linie.length) wypisz(linie.join('\n'), []);
                return;
            }
            if (n.getAttribute && n.getAttribute('contenteditable') === 'false') { punktyWewnatrz(n); return; }
            const tag = String(n.nodeName || n.tagName || '').toUpperCase();
            if (tag === 'BR') {
                if (!blok) nowyBlok(false);
                punktyElementu(n, 0);
                blok.tresc = true;
                blok.t += '\n';
                return;
            }
            const jestBlok = !!ED_BLOKI[tag];
            if (jestBlok) { zamknij(); nowyBlok(puste.has(n)); }
            dzieci(n);
            if (jestBlok) zamknij();
        }
        function dzieci(n) {
            const ch = n.childNodes || [];
            for (let k = 0; k <= ch.length; k++) {
                punktyElementu(n, k);
                if (k < ch.length) idz(ch[k]);
            }
        }
        dzieci(strona);
        zamknij();
        czekajace.forEach(i => { poz[i] = out.length; });
        pkt.forEach((p, i) => { if (poz[i] === null) poz[i] = out.length; });
        return { tekst: out, poz, brakLuk: luki < ukryte.size };
    }

    // Punkt {node, offset} dla kolumny `kol` w świeżo zbudowanej komórce (tekst = linia 1:1).
    function adPunktWKomorce(kom, kol) {
        let ostatni = null, suma = 0;
        function szukaj(n) {
            for (const c of (n.childNodes || [])) {
                if (c.nodeType === 3) {
                    const d = String(c.nodeValue || '').length;
                    if (kol <= suma + d) return { node: c, offset: kol - suma };
                    suma += d;
                    ostatni = c;
                } else if (c.nodeType === 1 && !(c.getAttribute && c.getAttribute('contenteditable') === 'false')) {
                    const r = szukaj(c);
                    if (r) return r;
                }
            }
            return null;
        }
        const r = szukaj(kom);
        if (r) return r;
        if (ostatni) return { node: ostatni, offset: String(ostatni.nodeValue || '').length };
        return { node: kom, offset: 0 };
    }

    // Pozycja znaku w tekście strony -> punkt w DOM. Linia ukryta w „tylko zmianach”: początek
    // najbliższej widocznej linii po niej (albo koniec ostatniej widocznej przed nią).
    function adPunktDlaPozycji(strona, rej, tekst, poz) {
        const p = Math.max(0, Math.min(String(tekst).length, poz | 0));
        const przed = String(tekst).slice(0, p);
        const linia = (przed.match(/\n/g) || []).length;
        const kol = p - (przed.lastIndexOf('\n') + 1);
        const kom = (rej && rej.komorki) || [];
        if (kom[linia]) return adPunktWKomorce(kom[linia], kol);
        for (let j = linia + 1; j < kom.length; j++) if (kom[j]) return adPunktWKomorce(kom[j], 0);
        for (let j = Math.min(linia, kom.length) - 1; j >= 0; j--) if (kom[j]) return adPunktWKomorce(kom[j], Infinity);
        return { node: strona, offset: 0 };
    }

    // Historia edycji w miejscu (niemutowalna): stan = { a, b } (oba teksty), jeden wpis na
    // zatwierdzoną przerwę w pisaniu albo operację (wklejenie, wycięcie, łączenie linii).
    const HISTORIA_MAX = 100;
    const HISTORIA_MAX_ZNAKOW = 10000000;
    function nowaHistoria(stan) { return { undo: [], redo: [], stan: { a: String(stan.a), b: String(stan.b) } }; }
    function samaPara(x, y) { return !!x && !!y && x.a === y.a && x.b === y.b; }
    function historiaZapisz(h, stan, max) {
        const nowy = { a: String(stan.a), b: String(stan.b) };
        if (samaPara(h.stan, nowy)) return h;
        let undo = h.undo.concat([h.stan]).slice(-(max || HISTORIA_MAX));
        let znaki = undo.reduce((n, s) => n + s.a.length + s.b.length, 0);
        while (undo.length > 1 && znaki > HISTORIA_MAX_ZNAKOW) {
            znaki -= undo[0].a.length + undo[0].b.length;
            undo = undo.slice(1);
        }
        return { undo, redo: [], stan: nowy };
    }
    function historiaCofnij(h) {
        if (!h || !h.undo.length) return null;
        return { undo: h.undo.slice(0, -1), redo: h.redo.concat([h.stan]), stan: h.undo[h.undo.length - 1] };
    }
    function historiaPonow(h) {
        if (!h || !h.redo.length) return null;
        return { undo: h.undo.concat([h.stan]), redo: h.redo.slice(0, -1), stan: h.redo[h.redo.length - 1] };
    }
    // Kursor po Cofnij/Ponów: koniec zmienionego fragmentu w tekście docelowym.
    function miejsceZmiany(przed, po) {
        const a = String(przed), b = String(po);
        let p = 0;
        while (p < a.length && p < b.length && a[p] === b[p]) p++;
        let s = 0;
        while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
        return b.length - s;
    }
    // Zwykły tekst ze schowka: CRLF/CR -> LF (silnik i tak tak normalizuje).
    function adTekstZeSchowka(t) { return String(t || '').replace(/\r\n|\r/g, '\n'); }

    // ─────────────────────────────────────────────────────────────────────────
    // Renderer diffu (vanilla DOM), 1:1 ze starej strony.
    // ─────────────────────────────────────────────────────────────────────────
    let adRes = null;        // wynik CD.compare
    let adRowIdx = [];       // [{el, aNorm, bNorm}], do kotwiczenia cytatów AI
    let adChangeEls = [];    // element per changeIdx: buildRail/goTo bez O(N²) querySelectorów
    // 13.10.2026 (edycja w panelach): edytowalny widok „Obok siebie” (żyje poza Alpine).
    let adChangePary = [];   // [komórka A, komórka B] per changeIdx (obrys bieżącej zmiany na obu stronach)
    let adSiatka = null;     // siatka A | rynna | B; strony przetrwają przebudowę, więc fokus zostaje
    let adRynna = null;
    let adStrony = [null, null];     // kontenery contenteditable stron A i B
    let adRejestr = [null, null];    // { komorki, ukryte, puste } z adZbudujStrony
    function adStronaTekst(s) { return adRes ? (s === 0 ? adRes.textA : adRes.textB) : ''; }

    function adEl(id) { return document.getElementById(id); }

    function adMarkClass(type, marksOnly) {
        if (marksOnly) {
            return type === 'ins'
                ? 'underline decoration-emerald-600 dark:decoration-emerald-400 decoration-2 underline-offset-2'
                : 'line-through decoration-amber-700/80 dark:decoration-amber-400/80 decoration-2';
        }
        return type === 'ins'
            ? 'xr-ad-ins rounded-md px-0.5 no-underline'
            : 'xr-ad-del rounded-md px-0.5 line-through decoration-black/30 dark:decoration-white/30';
    }
    // Jeden element per RUN segmentów tego samego typu (nie per para).
    function adRenderSegs(host, segs, marksOnly) {
        let i = 0, first = null;
        while (i < segs.length) {
            const t = segs[i].type;
            if (t === 'eq') { host.appendChild(document.createTextNode(segs[i].text)); i++; continue; }
            const last = host.lastChild;
            if (last && last.nodeType === 1 && (last.tagName === 'DEL' || last.tagName === 'INS')
                && last.tagName !== (t === 'ins' ? 'INS' : 'DEL')) {
                host.appendChild(document.createTextNode(' '));
            }
            const el = document.createElement(t === 'ins' ? 'ins' : 'del');
            el.className = adMarkClass(t, marksOnly);
            while (i < segs.length && segs[i].type === t) {
                if (segs[i].mark) {
                    const m = document.createElement('span');
                    m.className = 'font-bold';
                    m.textContent = segs[i].text;
                    el.appendChild(m);
                } else el.appendChild(document.createTextNode(segs[i].text));
                i++;
            }
            if (el.childNodes.length) { host.appendChild(el); if (!first) first = el; }
        }
        return first;
    }
    function adPilcrow() {
        const p = document.createElement('span');
        p.className = 'text-black/65 dark:text-white/55 select-none';
        p.textContent = '¶';
        return p;
    }
    function adMoveBadge(row) {
        const b = document.createElement('span');
        b.className = 'inline-block align-middle text-xs font-mono border border-black/25 dark:border-white/30 rounded-md px-1 mr-1 select-none text-black/75 dark:text-white/60';
        b.textContent = (row.kind === 'move-out' ? '↧' : '↥') + row.moveId;
        b.title = row.kind === 'move-out'
            ? 'Akapit przeniesiony w inne miejsce (para ↥' + row.moveId + ')'
            : 'Akapit przeniesiony tutaj (para ↧' + row.moveId + ')';
        return b;
    }
    function adFillCell(c, row, segs, side, marksOnly) {
        if (row.kind === 'move-out' || row.kind === 'move-in') {
            c.appendChild(adMoveBadge(row));
            const w = document.createElement('span');
            w.className = 'underline decoration-dotted decoration-black/40 dark:decoration-white/40 underline-offset-2';
            w.textContent = adTextOfSegs(segs);
            c.appendChild(w);
            return;
        }
        if (row.heavy) {
            // ≥90% przepisane: oznacz cały run jednym elementem.
            const el = document.createElement(side === 'l' ? 'del' : 'ins');
            el.className = adMarkClass(side === 'l' ? 'del' : 'ins', marksOnly);
            el.textContent = adTextOfSegs(segs);
            c.appendChild(el);
            return;
        }
        adRenderSegs(c, segs, marksOnly);
        if (!adTextOfSegs(segs).length && row.kind !== 'equal' && row.kind !== 'equal-normalized') c.appendChild(adPilcrow());
    }
    // 14.10.2026 (właściciel: „bardziej widać, które zdania są zmienione”): cała zmieniona linia dostaje
    // tło i pasek z lewej (A bursztyn = zmienione/wycięte, B zieleń = dodane/zmienione), nie tylko słowa.
    const AD_ZMIANY = { change: 1, 'replace-unrelated': 1, delete: 1, insert: 1 };
    function adOznaczZmiane(c, row, strona) {
        if (AD_ZMIANY[row.kind]) c.setAttribute('data-ad-zmiana', strona);
    }
    function adCell(row, side, marksOnly) {
        const c = document.createElement('div');
        const segs = side === 'l' ? row.left : row.right;
        c.className = 'min-w-0 whitespace-pre-wrap break-words px-2 py-0.5';
        c.setAttribute('data-i18n-skip', '');   // treść reklamy: katalog i18n jej nie tłumaczy
        if (segs === null) { c.className += ' bg-black/[0.03] dark:bg-white/[0.04]'; return c; }
        if (row.kind === 'equal-normalized') c.className += ' bg-black/[0.02] dark:bg-white/[0.03]';
        adOznaczZmiane(c, row, side === 'l' ? 'a' : 'b');
        adFillCell(c, row, segs, side, marksOnly);
        return c;
    }
    function adUnifiedCell(row, marksOnly) {
        const c = document.createElement('div');
        c.className = 'min-w-0 whitespace-pre-wrap break-words px-3 py-0.5';
        c.setAttribute('data-i18n-skip', '');
        if (row.kind === 'equal-normalized') c.className += ' bg-black/[0.02] dark:bg-white/[0.03]';
        adOznaczZmiane(c, row, row.kind === 'delete' ? 'a' : (row.kind === 'insert' ? 'b' : 'ab'));
        if (row.heavy) {
            if (row.left && adTextOfSegs(row.left)) {
                const d = document.createElement('del');
                d.className = adMarkClass('del', marksOnly);
                d.textContent = adTextOfSegs(row.left);
                c.appendChild(d);
            }
            if (row.right && adTextOfSegs(row.right)) {
                if (c.childNodes.length) c.appendChild(document.createTextNode(' '));
                const a = document.createElement('ins');
                a.className = adMarkClass('ins', marksOnly);
                a.textContent = adTextOfSegs(row.right);
                c.appendChild(a);
            }
            return c;
        }
        if (row.kind === 'move-out' || row.kind === 'move-in') {
            adFillCell(c, row, row.kind === 'move-out' ? row.left : row.right, row.kind === 'move-out' ? 'l' : 'r', marksOnly);
            return c;
        }
        adRenderSegs(c, row.uni, marksOnly);
        if (!adTextOfSegs(row.uni).length && row.kind !== 'equal' && row.kind !== 'equal-normalized') c.appendChild(adPilcrow());
        return c;
    }


    // ── 13.10.2026 (edycja w panelach): edytowalny widok „Obok siebie” ──
    // Siatka 3 kolumn (A | rynna | B); strona A i strona B to po JEDNYM kontenerze contenteditable,
    // każdy rozpięty na wszystkie wiersze siatki z `grid-template-rows: subgrid`. Komórki A i B tego
    // samego wiersza diffu dzielą więc tor wiersza (wyrównanie zostaje), a każda strona jest ciągłym
    // dokumentem: przeciąganie zaznaczenia, Shift/Option/Cmd+strzałki i Cmd+A działają w jej obrębie.
    // Dekoracje (¶, ↧n/↥n) są pseudo-elementami CSS (data-ad-pil / data-ad-mv), więc nie są tekstem.
    function adEtykietaLuki(n) {
        const szkielet = adPlural(n, 'ukryto {0} linię bez zmian', 'ukryto {0} linie bez zmian', 'ukryto {0} linii bez zmian');
        return root.oppenTf ? root.oppenTf(szkielet, [n]) : szkielet.replace('{0}', String(n));
    }
    function adKomorkaEdyt(row, strona, marksOnly) {
        const c = document.createElement('div');
        const segs = strona === 0 ? row.left : row.right;
        c.className = 'min-w-0 whitespace-pre-wrap break-words px-2 py-0.5';
        c.setAttribute('data-i18n-skip', '');
        if (segs === null) {
            // Komórka wyrównania: po tej stronie nie ma linii (druga strona ma tu dodany/wycięty akapit).
            c.className += ' bg-black/[0.03] dark:bg-white/[0.04]';
            c.setAttribute('data-ad-puste', '');
            return c;
        }
        if (row.kind === 'equal-normalized') c.className += ' bg-black/[0.02] dark:bg-white/[0.03]';
        adOznaczZmiane(c, row, strona === 0 ? 'a' : 'b');
        const tekst = adTextOfSegs(segs);
        if (row.kind === 'move-out' || row.kind === 'move-in') {
            c.setAttribute('data-ad-mv', (row.kind === 'move-out' ? '↧' : '↥') + row.moveId);
            c.setAttribute('title', row.kind === 'move-out'
                ? 'Akapit przeniesiony w inne miejsce (para ↥' + row.moveId + ')'
                : 'Akapit przeniesiony tutaj (para ↧' + row.moveId + ')');
            const w = document.createElement('span');
            w.className = 'underline decoration-dotted decoration-black/40 dark:decoration-white/40 underline-offset-2';
            w.textContent = tekst;
            c.appendChild(w);
        } else if (row.heavy) {
            const el = document.createElement(strona === 0 ? 'del' : 'ins');
            el.className = adMarkClass(strona === 0 ? 'del' : 'ins', marksOnly);
            el.textContent = tekst;
            c.appendChild(el);
        } else {
            adRenderSegs(c, segs, marksOnly);
        }
        if (!tekst.length) {
            // Pusta linia: <br> daje jej wysokość i miejsce na kursor (czytanie go pomija).
            if (row.kind !== 'equal' && row.kind !== 'equal-normalized') c.setAttribute('data-ad-pil', '');
            c.appendChild(document.createElement('br'));
        }
        return c;
    }
    // Wypełnia dwie strony (puste kontenery) i rynnę; zwraca rejestr do czytania tekstu i kursora.
    function adZbudujStrony(strony, rynna, res, plan, marksOnly) {
        const nLinii = [adLiczLinie(res.textA), adLiczLinie(res.textB)];
        const rej = [0, 1].map(s => ({ komorki: new Array(nLinii[s]).fill(null), ukryte: new Map(), puste: new Set() }));
        const zmiany = [], indeks = [];
        let wiersze = 0;
        for (const item of plan) {
            wiersze++;
            if (item.gap) {
                const ukryteWiersze = res.rows.slice(item.od, item.od + item.gap);
                for (const s of [0, 1]) {
                    const g = document.createElement('div');
                    g.className = 'text-center text-xs italic text-black/65 dark:text-white/55 border-y border-dashed border-black/10 dark:border-white/15 py-1 my-1 select-none';
                    g.setAttribute('contenteditable', 'false');
                    g.setAttribute('data-ad-luka', String(item.gap));
                    g.textContent = adEtykietaLuki(item.gap);
                    rej[s].ukryte.set(g, ukryteWiersze
                        .map(r => (s === 0 ? r.left : r.right))
                        .filter(x => x !== null)
                        .map(adTextOfSegs));
                    strony[s].appendChild(g);
                }
                continue;
            }
            const row = item.row;
            const para = [0, 1].map(s => {
                const c = adKomorkaEdyt(row, s, marksOnly);
                const nr = s === 0 ? row.aLine : row.bLine;
                if ((s === 0 ? row.left : row.right) === null) rej[s].puste.add(c);
                else if (nr !== null && nr !== undefined) rej[s].komorki[nr] = c;
                strony[s].appendChild(c);
                return c;
            });
            if (row.changeIdx !== null && row.changeIdx !== undefined) {
                para.forEach(c => c.setAttribute('data-c', row.changeIdx));
                zmiany[row.changeIdx] = para;
            }
            indeks.push({
                el: para[0], elA: para[0], elB: para[1],
                aNorm: row.left === null ? '' : adNorm(adTextOfSegs(row.left)),
                bNorm: row.right === null ? '' : adNorm(adTextOfSegs(row.right)),
            });
        }
        // Pusta strona (tekst wycięty do zera): kursor musi mieć gdzie stanąć, więc pierwsza komórka
        // wyrównania (albo nowa, gdy nie ma żadnego wiersza) staje się jedyną, pustą linią.
        for (const s of [0, 1]) {
            if (nLinii[s] !== 0) continue;
            let c = null;
            for (const p of rej[s].puste) { c = p; break; }
            if (c) {
                rej[s].puste.delete(c);
                c.removeAttribute('data-ad-puste');
            } else {
                c = document.createElement('div');
                c.className = 'min-w-0 whitespace-pre-wrap break-words px-2 py-0.5';
                c.setAttribute('data-i18n-skip', '');
                strony[s].appendChild(c);
            }
            c.appendChild(document.createElement('br'));
            rej[s].komorki = [c];
        }
        wiersze = Math.max(1, wiersze);
        [strony[0], rynna, strony[1]].forEach(el => { el.style.gridRow = '1 / span ' + wiersze; });
        return { rej, zmiany, indeks };
    }

    function toast(msg, opts) { if (root.appToast) root.appToast(msg, opts); }
    function T(s) { return root.oppenT ? root.oppenT(s) : s; }
    function blad(e) { return root.appBlad ? root.appBlad(e) : String((e && e.message) || e); }
    function pamiec() { try { return root.localStorage; } catch (e) { return null; } }

    // ─────────────────────────────────────────────────────────────────────────
    // Komponent Alpine.
    // ─────────────────────────────────────────────────────────────────────────
    function xrayAiDiff() {
        return {
            texts: [{ name: '', body: '', slug: '' }, { name: '', body: '', slug: '' }],
            mode: 'edit',
            opts: { view: 'aligned', gran: 'word', icase: false, punct: false, typo: true, ws: true,
                    marksOnly: false, onlyChanged: false, smallFont: false },
            stats: null,
            degraded: false,
            degradedReason: '',
            nChanges: 0,
            cur: -1,
            // restored = werdykt wczytany z pamięci przeglądarki (zapłacony wcześniej, zero nowego wywołania).
            ai: { busy: false, verdict: null, model: '', truncatedA: false, truncatedB: false, key: '', stale: false, restored: false },
            _saveTimer: null,
            _naWybor: null,
            // 13.10.2026 (edycja w panelach): stan edycji A/B wprost w diffie.
            edCofnij: 0,            // liczba kroków do cofnięcia (przyciski na pasku)
            edPonow: 0,
            edStan: '',             // '' | 'pisze' | 'zapisano'
            _brudne: [false, false],    // strona ma w DOM wpisany, jeszcze nieprzeliczony tekst
            _edT: null,
            _edStanT: null,
            _edCzas: 0,             // ile trwało ostatnie przeliczenie (dłuższe teksty = dłuższa przerwa)
            _sklada: false,         // trwa składanie znaku (IME, martwy klawisz): bez przebudowy
            _mysz: false,           // wciśnięty przycisk myszy w diffie (przeciąganie zaznaczenia)
            _poMyszy: false,
            _hist: null,
            _edSluch: null,

            init() {
                try {
                    const saved = JSON.parse(localStorage.getItem(KLUCZ_TEKSTOW) || 'null');
                    // Przegląd 13.10.2026: zły zapis (null w tablicy) nie może wywrócić init().
                    if (saved && Array.isArray(saved.texts) && saved.texts.length === 2) this.texts = saved.texts.map(t => ({ name: String((t && t.name) || ''), body: String((t && t.body) || ''), slug: String((t && t.slug) || '') }));
                    if (saved && saved.opts) Object.keys(this.opts).forEach(k => {
                        if (saved.opts[k] !== undefined && typeof saved.opts[k] === typeof this.opts[k]) this.opts[k] = saved.opts[k];
                    });
                } catch (e) { /* ignore */ }
                if (window.innerWidth < 860 && this.opts.view === 'aligned') this.opts.view = 'unified';
                this._synchronizujWerdykt();
                this.$watch('texts', () => {
                    clearTimeout(this._saveTimer);
                    this._saveTimer = setTimeout(() => { this._save(); this._synchronizujWerdykt(); }, ZAPIS_MS);
                });
                // 14.10.2026 (historia Ads X-Ray): zapis i wczytanie porównania z historii (xray/historia.js).
                if (window.XHistoria) window.XHistoria.zarejestruj('ai-diff', {
                    stan: () => this._historiaStan(),
                    wczytaj: (d) => this._historiaWczytaj(d),
                    zajety: () => (this.ai.busy ? T('Trwa analiza AI (płatna). Poczekaj na wynik, potem wczytaj wpis.') : ''),
                });
                this.$nextTick(() => this._podepnijEdycje());
            },
            destroy() {
                clearTimeout(this._saveTimer);
                clearTimeout(this._edT);
                clearTimeout(this._edStanT);
                const sl = this._edSluch;
                if (sl) {
                    Object.keys(sl.h).forEach(k => sl.host.removeEventListener(k, sl.h[k]));
                    window.removeEventListener('mouseup', sl.puszczono);
                    window.removeEventListener('blur', sl.puszczono);
                    this._edSluch = null;
                }
                this._zwolnijStrony();
            },
            _save() {
                try { localStorage.setItem(KLUCZ_TEKSTOW, JSON.stringify({ texts: this.texts, opts: this.opts })); } catch (e) { /* ignore */ }
            },
            _pairKey() {
                return kluczPary(this.texts[0].body || '', this.texts[1].body || '');
            },
            // ── Historia (14.10.2026, historia Ads X-Ray): teksty A/B z nazwami, opcje widoku i opłacony
            //    werdykt AI tej pary (jeśli jest). Wczytanie przywraca werdykt z danych, BEZ wywołania AI. ──
            _historiaStan() {
                this._zatwierdzEdycje();
                const a = this.ai;
                return {
                    texts: this.texts.map(t => ({ name: String(t.name || ''), body: String(t.body || ''), slug: String(t.slug || '') })),
                    opts: Object.assign({}, this.opts),
                    tryb: this.mode,
                    ai: a.verdict ? { verdict: JSON.parse(JSON.stringify(a.verdict)), model: a.model || '', truncatedA: !!a.truncatedA,
                                      truncatedB: !!a.truncatedB, key: a.key || '', stale: !!a.stale } : null,
                };
            },
            _historiaWczytaj(d) {
                const dane = (d && typeof d === 'object') ? d : {};
                this._zatwierdzEdycje();
                if (this.mode === 'results') this.backToEdit();
                this._aiGen = (this._aiGen || 0) + 1;   // analiza w locie dotyczy poprzedniej pary
                const lista = Array.isArray(dane.texts) ? dane.texts : [];
                this.texts = [0, 1].map(i => {
                    const t = lista[i] || {};
                    return { name: String(t.name || ''), body: String(t.body || ''), slug: String(t.slug || '') };
                });
                if (dane.opts && typeof dane.opts === 'object') Object.keys(this.opts).forEach(k => {
                    if (dane.opts[k] !== undefined && typeof dane.opts[k] === typeof this.opts[k]) this.opts[k] = dane.opts[k];
                });
                this._brudne = [false, false];
                this._hist = null;
                this._liczHist();
                const klucz = this._pairKey();
                const w = dane.ai && poprawnyWerdykt(dane.ai.verdict);
                this.ai.verdict = null; this.ai.model = ''; this.ai.key = ''; this.ai.stale = false; this.ai.restored = false;
                this.ai.truncatedA = false; this.ai.truncatedB = false;
                if (w) {
                    const wpis = { verdict: w, model: String(dane.ai.model || ''), truncatedA: !!dane.ai.truncatedA, truncatedB: !!dane.ai.truncatedB };
                    const pasuje = dane.ai.key === klucz;
                    Object.assign(this.ai, wpis, { key: pasuje ? klucz : String(dane.ai.key || ''), stale: !pasuje || !!dane.ai.stale, restored: true });
                    // Zapłacony werdykt tej pary wraca też do pamięci przeglądarki (jak po „Porównaj”).
                    if (pasuje && !dane.ai.stale) zapiszWerdykt(pamiec(), klucz, wpis, Date.now());
                } else {
                    this._synchronizujWerdykt();
                }
                this._save();
                if (dane.tryb === 'results' && this.canCompare()) this.$nextTick(() => this.compare());
            },
            // Werdykt na ekranie ma pasować do bieżącej pary: jeśli nie pasuje, a pamięć ma werdykt
            // dla TEJ pary, przywracamy go (bez wywołania AI); inaczej stary werdykt zostaje jako nieaktualny.
            _synchronizujWerdykt() {
                const key = this._pairKey();
                if (this.ai.verdict && this.ai.key === key) { this.ai.stale = false; return; }
                const w = werdyktZPamieci(pamiec(), key);
                if (w) {
                    this.ai.verdict = w.verdict;
                    this.ai.model = w.model;
                    this.ai.truncatedA = w.truncatedA;
                    this.ai.truncatedB = w.truncatedB;
                    this.ai.key = key;
                    this.ai.stale = false;
                    this.ai.restored = true;
                    return;
                }
                this.ai.stale = !!this.ai.verdict;
            },
            letter(i) { return String.fromCharCode(65 + i); },
            txtStats(s) {
                const w = ((s || '').match(/\S+/g) || []).length;
                const z = (s || '').length;
                return w + ' ' + window.odmien(w, 'słowo', 'słowa', 'słów', 'word', 'words') + ' · '
                     + z + ' ' + window.odmien(z, 'znak', 'znaki', 'znaków', 'character', 'characters');
            },
            readTime(mins) {
                const s = Math.round((mins || 0) * 60);
                return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
            },
            plural(n, one, few, many) { return adPlural(n, one, few, many); },
            canCompare() {
                return this.texts.every(t => (t.body || '').trim().length && (t.body || '').length <= LIMIT_ZNAKOW);
            },
            swapTexts() {
                this._zatwierdzEdycje();
                this.texts = [this.texts[1], this.texts[0]];
                if (this.mode === 'results') this.compare();
            },
            clearAll() {
                const doIt = () => {
                    // Komunikat obiecuje, że werdykt zniknie, więc kasujemy też jego kopię w pamięci.
                    const st = pamiec();
                    if (this.ai.key) usunWerdykt(st, this.ai.key);
                    usunWerdykt(st, this._pairKey());
                    this.texts = [{ name: '', body: '', slug: '' }, { name: '', body: '', slug: '' }];
                    this._brudne = [false, false];
                    this.backToEdit();
                    this._hist = null;
                    this._liczHist();
                    this.ai.verdict = null;
                    this.ai.key = '';
                    this.ai.stale = false;
                    this.ai.restored = false;
                    this._aiGen = (this._aiGen || 0) + 1;   // unieważnij analizę w locie
                    try { localStorage.removeItem(KLUCZ_TEKSTOW); } catch (e) { /* ignore */ }
                    if (window.XHistoria) window.XHistoria.zapomnij('ai-diff');   // 14.10.2026 (historia Ads X-Ray)
                };
                if (window.appConfirm) { appConfirm(T('Wyczyścić oba teksty? Zniknie też werdykt AI i tego nie da się cofnąć.'), '', { variant: 'danger' }).then(ok => { if (ok) doIt(); }); }
                else doIt();
            },
            backToEdit() {
                this._zatwierdzEdycje();   // 13.10.2026 (edycja w panelach): nic wpisanego w diffie nie ginie
                // Powrót do edycji ZWALNIA ciężki DOM diffu (lekcja 1.1.172).
                this._zwolnijStrony();
                this.mode = 'edit';
                adRes = null;
                adRowIdx = [];
                adChangeEls = [];
                this.stats = null;
                this.nChanges = 0;
                this.cur = -1;
                if (adEl('xr-ad-host')) adEl('xr-ad-host').textContent = '';
                if (adEl('xr-ad-rail')) adEl('xr-ad-rail').textContent = '';
            },
            compare() {
                if (!window.CD) {
                    toast(T('Silnik porównywania jeszcze się ładuje, spróbuj za chwilę'), { variant: 'info' });
                    return;
                }
                if (!this.canCompare()) return;
                if (!this._silnik()) return;
                this.mode = 'results';
                this.$nextTick(() => this.renderNow());
            },
            // Silnik diffu na bieżących tekstach (bez renderu). 13.10.2026 (edycja w panelach): wspólne
            // dla „Porównaj” i przeliczenia po edycji w miejscu (tam jedna strona może być pusta).
            _silnik() {
                if (!window.CD) {
                    toast(T('Silnik porównywania jeszcze się ładuje, spróbuj za chwilę'), { variant: 'info' });
                    return false;
                }
                const a = this.texts[0].body || '', b = this.texts[1].body || '';
                let res;
                try {
                    res = CD.compare(a, b, { gran: this.opts.gran, icase: this.opts.icase,
                                             punct: this.opts.punct, typo: this.opts.typo, ws: this.opts.ws });
                } catch (e) {
                    toast(T('Porównanie nie powiodło się: ') + blad(e), { variant: 'error', durationMs: 6000 });
                    return false;
                }
                adRes = res;
                const s = res.stats;
                this.stats = { similarity: Math.round(s.similarity * 100), changes: s.changes, added: s.added,
                               removed: s.removed, rewritten: s.rewritten, moved: s.moved,
                               wordsA: s.wordsA, wordsB: s.wordsB, readA: s.readA, readB: s.readB };
                this.degraded = !!res.degraded;
                this.degradedReason = res.reason || '';
                this.nChanges = res.changes.length;
                this.cur = -1;
                this._synchronizujWerdykt();
                this._histDla();     // teksty zmienione poza edycją w miejscu = nowa historia
                this._liczHist();
                return true;
            },
            setOpt(key, val) {
                this._zatwierdzEdycje();
                if (val !== undefined) this.opts[key] = val;
                this._save();
                if (this.mode !== 'results') return;
                const needsEngine = ['gran', 'icase', 'punct', 'typo', 'ws'].includes(key);
                if (needsEngine) this.compare();
                else this.$nextTick(() => this.renderNow());
            },
            renderNow() {
                const host = adEl('xr-ad-host');
                if (!host || !adRes) return;
                adRowIdx = [];
                adChangeEls = [];
                adChangePary = [];
                const plan = adBuildPlan(adRes.rows, this.opts.onlyChanged);
                const marksOnly = this.opts.marksOnly;
                if (this.opts.view === 'aligned') {
                    this._renderObokSiebie(host, plan, marksOnly);
                } else {
                    this._zwolnijStrony();
                    host.textContent = '';
                    const frag = document.createDocumentFragment();
                    for (const item of plan) {
                        if (item.gap) {
                            const g = document.createElement('div');
                            g.className = 'text-center text-xs italic text-black/65 dark:text-white/55 border-y border-dashed border-black/10 dark:border-white/15 py-1 my-1';
                            g.textContent = adEtykietaLuki(item.gap);
                            frag.appendChild(g);
                            continue;
                        }
                        const row = item.row;
                        const el = adUnifiedCell(row, marksOnly);
                        if (row.changeIdx !== null && row.changeIdx !== undefined) {
                            el.setAttribute('data-c', row.changeIdx);
                            adChangeEls[row.changeIdx] = el;
                            adChangePary[row.changeIdx] = [el];
                        }
                        adRowIdx.push({
                            el,
                            aNorm: row.left === null ? '' : adNorm(adTextOfSegs(row.left)),
                            bNorm: row.right === null ? '' : adNorm(adTextOfSegs(row.right)),
                        });
                        frag.appendChild(el);
                    }
                    host.appendChild(frag);
                }
                this.$nextTick(() => this.buildRail());
            },
            // 13.10.2026 (edycja w panelach): „Obok siebie” = siatka A | rynna | B, strony edytowalne.
            _renderObokSiebie(host, plan, marksOnly) {
                if (!adSiatka || adSiatka.parentNode !== host) {
                    host.textContent = '';
                    adSiatka = document.createElement('div');
                    adSiatka.className = 'grid grid-cols-[1fr_14px_1fr] items-stretch';
                    adStrony = [0, 1].map(s => {
                        const el = document.createElement('div');
                        el.setAttribute('data-ad-strona', s === 0 ? 'a' : 'b');
                        el.setAttribute('contenteditable', 'plaintext-only');
                        // Przeglądarka bez plaintext-only: zwykłe contenteditable (formatowanie i tak blokujemy).
                        if (el.contentEditable !== undefined && el.contentEditable !== 'plaintext-only') el.setAttribute('contenteditable', 'true');
                        el.setAttribute('role', 'textbox');
                        el.setAttribute('aria-multiline', 'true');
                        el.setAttribute('aria-label', s === 0 ? 'Tekst A, edycja w miejscu' : 'Tekst B, edycja w miejscu');
                        el.setAttribute('spellcheck', 'false');
                        el.setAttribute('autocorrect', 'off');
                        el.setAttribute('autocapitalize', 'off');
                        el.className = 'min-w-0 whitespace-pre-wrap outline-none cursor-text';
                        el.style.display = 'grid';
                        el.style.gridTemplateRows = 'subgrid';
                        el.style.gridTemplateColumns = 'minmax(0, 1fr)';
                        el.style.gridColumn = s === 0 ? '1' : '3';
                        return el;
                    });
                    adRynna = document.createElement('div');
                    adRynna.className = 'border-x border-black/10 dark:border-white/15';
                    adRynna.style.gridColumn = '2';
                    adSiatka.appendChild(adStrony[0]);
                    adSiatka.appendChild(adRynna);
                    adSiatka.appendChild(adStrony[1]);
                    host.appendChild(adSiatka);
                } else {
                    adStrony.forEach(el => { el.textContent = ''; });
                }
                const b = adZbudujStrony(adStrony, adRynna, adRes, plan, marksOnly);
                adRejestr = b.rej;
                adRowIdx = b.indeks;
                b.zmiany.forEach((para, i) => { if (para) { adChangeEls[i] = para[0]; adChangePary[i] = para; } });
                this._brudne = [false, false];
            },
            _zwolnijStrony() {
                clearTimeout(this._edT);
                this._edT = null;
                adSiatka = null;
                adRynna = null;
                adStrony = [null, null];
                adRejestr = [null, null];
                this._brudne = [false, false];
            },
            _offsetIn(sc, el) {
                return el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
            },
            buildRail() {
                const rail = adEl('xr-ad-rail'), sc = adEl('xr-ad-scroller');
                if (!rail || !sc || !adRes) return;
                rail.textContent = '';
                const H = Math.max(1, sc.scrollHeight), rh = rail.clientHeight;
                if (!rh) return;
                for (let i = 0; i < adRes.changes.length; i++) {
                    const el = adChangeEls[i];
                    if (!el) continue;
                    const r = adRes.rows[adRes.changes[i]];
                    const t = document.createElement('div');
                    const kind = (r.kind === 'delete' || r.kind === 'move-out') ? 'bg-amber-500'
                        : (r.kind === 'insert') ? 'bg-emerald-500' : 'bg-amber-400';
                    t.className = 'absolute left-0 right-0 h-1 rounded-md pointer-events-none ' + kind;
                    t.style.top = Math.round(Math.max(0, Math.min(rh - 4, this._offsetIn(sc, el) / H * rh))) + 'px';
                    t.setAttribute('data-rc', i);
                    rail.appendChild(t);
                }
                this.railSync();
            },
            railSync() { /* hook na przyszłe okno viewportu; ticki są statyczne */ },
            railJump(ev) {
                const rail = adEl('xr-ad-rail');
                if (!rail || !adRes || !adRes.changes.length) return;
                const b = rail.getBoundingClientRect();
                const f = (ev.clientY - b.top) / Math.max(1, b.height);
                let best = -1, bd = 1e9;
                rail.querySelectorAll('[data-rc]').forEach(t => {
                    const top = parseFloat(t.style.top) / Math.max(1, b.height);
                    const d = Math.abs(top - f);
                    if (d < bd) { bd = d; best = parseInt(t.getAttribute('data-rc'), 10); }
                });
                if (best >= 0) this.goTo(best);
            },
            curLabel() {
                if (!this.nChanges) return '0 / 0';
                return (this.cur >= 0 ? (this.cur + 1) : '–') + ' / ' + this.nChanges;
            },
            goTo(idx) {
                this._zatwierdzEdycje();
                if (!this.nChanges) return;
                const N = this.nChanges;
                this.cur = ((idx % N) + N) % N;
                const host = adEl('xr-ad-host'), sc = adEl('xr-ad-scroller'), rail = adEl('xr-ad-rail');
                if (!host || !sc) return;
                const RING = ['ring-2', 'ring-black', 'dark:ring-white', 'rounded-md'];
                host.querySelectorAll('[data-c].ring-2').forEach(el => el.classList.remove(...RING));
                const el = adChangeEls[this.cur];
                if (el) {
                    (adChangePary[this.cur] || [el]).forEach(k => k.classList.add(...RING));
                    sc.scrollTop = Math.max(0, this._offsetIn(sc, el) - sc.clientHeight * 0.35);
                }
                if (rail) {
                    // Inline style zamiast toggla bg-black (kolejność utilities w buildzie).
                    rail.querySelectorAll('[data-rc]').forEach(t => {
                        t.style.background = t.getAttribute('data-rc') === String(this.cur) ? 'currentColor' : '';
                    });
                }
            },
            jumpToQuote(side, quote) {
                this._zatwierdzEdycje();
                if (this.mode !== 'results' || !adRowIdx.length) return;
                const q = adNorm(quote);
                if (!q) return;
                const key = side === 'a' ? 'aNorm' : 'bNorm';
                let hit = adRowIdx.find(r => r[key] && r[key].includes(q));
                if (!hit) {
                    // Fallback: AI mogło lekko sparafrazować cytat (Dice ≥ 0.6 po multizbiorach słów).
                    const qw = q.split(' ');
                    let bestScore = 0;
                    for (const r of adRowIdx) {
                        if (!r[key]) continue;
                        const rw = r[key].split(' ');
                        const freq = new Map();
                        for (const w of rw) freq.set(w, (freq.get(w) || 0) + 1);
                        let inter = 0;
                        for (const w of qw) {
                            const c = freq.get(w) || 0;
                            if (c > 0) { inter++; freq.set(w, c - 1); }
                        }
                        const score = 2 * inter / (qw.length + Math.min(rw.length, qw.length * 3));
                        if (score > bestScore) { bestScore = score; hit = r; }
                    }
                    if (bestScore < 0.6) hit = null;
                }
                if (!hit) {
                    toast(T(this.opts.onlyChanged
                        ? 'Nie znaleziono tego fragmentu w widoku diffu. Wyłącz „tylko zmiany” i spróbuj ponownie.'
                        : 'Nie znaleziono tego fragmentu w widoku diffu (AI mogło sparafrazować cytat).'), { variant: 'info', durationMs: 5000 });
                    return;
                }
                const sc = adEl('xr-ad-scroller');
                // 13.10.2026 (edycja w panelach): w „Obok siebie” błyska komórka cytowanej strony.
                const cel = (side === 'a' ? hit.elA : hit.elB) || hit.el;
                sc.scrollTop = Math.max(0, this._offsetIn(sc, cel) - sc.clientHeight * 0.35);
                const FLASH = ['ring-2', side === 'a' ? 'ring-amber-500' : 'ring-emerald-500', 'rounded-md'];
                cel.classList.add(...FLASH);
                setTimeout(() => cel.classList.remove(...FLASH), 2000);
            },
            /* EDYCJA-W-PANELACH:START
             * 13.10.2026 (edycja w panelach): A i B poprawiane wprost w diffie, jak w Dokumentach Google.
             * Pisanie w obrębie linii zostaje natywne (lekkie, bez przebudowy na każdy klawisz); po przerwie
             * (EDYCJA_MS, dłużej przy dużych tekstach), przy wyjściu ze strony albo przed każdą akcją, która
             * potrzebuje świeżego wyniku, czytamy stronę z DOM, zapisujemy texts[i].body (ten sam szkic
             * 'xray_aidiff_texts'), liczymy diff od nowa i stawiamy kursor w tym samym miejscu tekstu.
             * Operacje na wielu liniach (zaznaczenie przez linie, łączenie linii Backspace/Delete, wklejanie,
             * wycinanie) robimy na TEKŚCIE, nie w DOM: nie ruszają ukrytych linii „tylko zmian” ani komórek
             * wyrównania. Werdykt AI po edycji tylko oznaczamy jako nieaktualny; ten blok NIGDY nie woła sieci.
             */
            _podepnijEdycje() {
                if (typeof document === 'undefined' || this._edSluch) return;
                const host = adEl('xr-ad-host');
                if (!host || !host.addEventListener) return;
                const strona = (e) => this._stronaZ(e && e.target);
                const h = {
                    beforeinput: (e) => this._naPrzedWpisaniem(e),
                    input: (e) => {
                        const s = strona(e);
                        if (s < 0) return;
                        this._brudne[s] = true;
                        if (!e.isComposing && !this._sklada) this._zaplanujZatwierdzenie();
                    },
                    // Znak składany (IME, martwy klawisz): przebudowa w trakcie zgubiłaby go, czekamy na koniec.
                    compositionstart: (e) => { if (strona(e) >= 0) this._sklada = true; },
                    compositionend: (e) => {
                        this._sklada = false;
                        const s = strona(e);
                        if (s < 0) return;
                        this._brudne[s] = true;
                        this._zaplanujZatwierdzenie();
                    },
                    keydown: (e) => this._naKlawisz(e),
                    paste: (e) => this._naWklej(e),
                    copy: (e) => this._naKopiuj(e, false),
                    cut: (e) => this._naKopiuj(e, true),
                    // Przeciąganie zaznaczonego tekstu wyłączone (wytnij i wklej robi to samo przewidywalnie).
                    dragstart: (e) => { if (strona(e) >= 0) e.preventDefault(); },
                    drop: (e) => { if (strona(e) >= 0) e.preventDefault(); },
                    mousedown: () => { this._mysz = true; },
                    focusout: (e) => {
                        const s = strona(e);
                        if (s < 0 || !this._brudne[s]) return;
                        if (e.relatedTarget && adStrony[s] && adStrony[s].contains(e.relatedTarget)) return;
                        setTimeout(() => this._zatwierdzEdycje({ odlozDlaMyszy: true }), 0);
                    },
                };
                Object.keys(h).forEach(k => host.addEventListener(k, h[k]));
                const puszczono = () => {
                    this._mysz = false;
                    if (!this._poMyszy) return;
                    this._poMyszy = false;
                    setTimeout(() => this._zatwierdzEdycje(), 0);
                };
                window.addEventListener('mouseup', puszczono);
                window.addEventListener('blur', puszczono);
                this._edSluch = { host, h, puszczono };
            },
            _stronaZ(node) {
                if (!node) return -1;
                for (const s of [0, 1]) if (adStrony[s] && adStrony[s].contains(node)) return s;
                return -1;
            },
            _stronaAktywna() {
                const a = typeof document !== 'undefined' ? document.activeElement : null;
                if (a && a === adStrony[0]) return 0;
                if (a && a === adStrony[1]) return 1;
                return -1;
            },
            // Zaznaczenie w stronie, w której stoi fokus: pozycje znaków (kotwica, fokus) + odczyt strony.
            _zlapZaznaczenie() {
                const s = this._stronaAktywna();
                if (s < 0 || !adRejestr[s] || !window.getSelection) return null;
                const sel = window.getSelection();
                if (!sel || !sel.rangeCount) return null;
                const el = adStrony[s];
                if (!el.contains(sel.anchorNode) || !el.contains(sel.focusNode)) return null;
                const odczyt = adCzytajStrone(el, adRejestr[s], [
                    { node: sel.anchorNode, offset: sel.anchorOffset },
                    { node: sel.focusNode, offset: sel.focusOffset },
                ]);
                return { strona: s, a: odczyt.poz[0], f: odczyt.poz[1], odczyt };
            },
            _ustawKursor(k) {
                const el = adStrony[k.strona], rej = adRejestr[k.strona];
                if (!el || !rej) return;
                if (k.fokus && document.activeElement !== el) { try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
                if (document.activeElement !== el || !window.getSelection) return;
                const tekst = adStronaTekst(k.strona);
                const pa = adPunktDlaPozycji(el, rej, tekst, k.a);
                const pf = k.f === k.a ? pa : adPunktDlaPozycji(el, rej, tekst, k.f);
                try { window.getSelection().setBaseAndExtent(pa.node, pa.offset, pf.node, pf.offset); } catch (e) { /* ignore */ }
                if (k.pokaz) {
                    // Kursor po wklejeniu / Cofnij poza widokiem: przewiń do jego linii.
                    const sc = adEl('xr-ad-scroller');
                    const cel = pf.node && (pf.node.nodeType === 1 ? pf.node : pf.node.parentNode);
                    if (sc && cel && cel.getBoundingClientRect) {
                        const y = this._offsetIn(sc, cel);
                        if (y < sc.scrollTop || y > sc.scrollTop + sc.clientHeight - 24) sc.scrollTop = Math.max(0, y - sc.clientHeight * 0.35);
                    }
                }
            },
            _zaplanujZatwierdzenie() {
                clearTimeout(this._edT);
                if (this.edStan !== 'pisze') this.edStan = 'pisze';
                const zwloka = Math.min(3000, Math.max(EDYCJA_MS, (this._edCzas || 0) * 3));
                this._edT = setTimeout(() => this._zatwierdzEdycje({ odlozDlaMyszy: true }), zwloka);
            },
            // Historia pasuje do bieżących tekstów; zmiana z zewnątrz (Zamień, pola tekstowe)
            // zaczyna nową historię, bo cofanie jej krokami z diffu pomieszałoby teksty z nazwami.
            _histDla() {
                const teraz = { a: this.texts[0].body || '', b: this.texts[1].body || '' };
                if (!this._hist || !samaPara(this._hist.stan, teraz)) this._hist = nowaHistoria(teraz);
                return this._hist;
            },
            _liczHist() {
                this.edCofnij = this._hist ? this._hist.undo.length : 0;
                this.edPonow = this._hist ? this._hist.redo.length : 0;
            },
            // Zapis edycji ze stron do tekstów + przeliczenie diffu. Zwraca true, gdy tekst się zmienił.
            // opcje: nadpisz {strona, tekst} (operacja na tekście), kursor {strona, a, f, fokus, pokaz},
            // wymus (także w trakcie składania znaku), odlozDlaMyszy (przerwa/wyjście: nie w trakcie przeciągania).
            _zatwierdzEdycje(opcje) {
                const o = opcje || {};
                clearTimeout(this._edT);
                this._edT = null;
                if (this.mode !== 'results' || !adStrony[0] || !adRejestr[0] || !adRejestr[1]) {
                    this._brudne = [false, false];
                    return false;
                }
                if (this._sklada && !o.wymus) return false;
                if (this._mysz && o.odlozDlaMyszy) { this._poMyszy = true; return false; }
                const nad = o.nadpisz || null;
                if (!nad && !this._brudne[0] && !this._brudne[1]) {
                    if (this.edStan === 'pisze') this.edStan = '';
                    return false;
                }
                const zazn = o.kursor ? null : this._zlapZaznaczenie();
                const nowe = [null, null];
                for (const s of [0, 1]) {
                    if (nad && nad.strona === s) { nowe[s] = nad.tekst; continue; }
                    if (!this._brudne[s]) continue;
                    const r = (zazn && zazn.strona === s) ? zazn.odczyt : adCzytajStrone(adStrony[s], adRejestr[s]);
                    if (r.brakLuk) {
                        // Z DOM zniknęła luka „ukryto N linii”: zapis zgubiłby ukryte linie, więc go nie robimy.
                        this._brudne = [false, false];
                        this.edStan = '';
                        toast(T('Ta zmiana usunęłaby linie ukryte przez „tylko zmiany”, więc jej nie zapisano. Wyłącz „tylko zmiany”, żeby edytować w tym miejscu.'), { variant: 'info', durationMs: 7000 });
                        this._przelicz(null);
                        return false;
                    }
                    if (r.tekst !== adStronaTekst(s)) nowe[s] = r.tekst;
                }
                this._brudne = [false, false];
                if (nowe[0] === null && nowe[1] === null) { this.edStan = ''; return false; }
                const przed = [this.texts[0].body || '', this.texts[1].body || ''];
                const po = [nowe[0] !== null ? nowe[0] : przed[0], nowe[1] !== null ? nowe[1] : przed[1]];
                if (po.some(t => t.length > LIMIT_ZNAKOW)) {
                    this.edStan = '';
                    toast(T('Tekst przekroczyłby limit 500 tys. znaków, więc tej zmiany nie zapisano.'), { variant: 'error', durationMs: 6000 });
                    this._przelicz(null);
                    return false;
                }
                this._hist = historiaZapisz(this._histDla(), { a: po[0], b: po[1] });
                if (nowe[0] !== null) this.texts[0].body = po[0];
                if (nowe[1] !== null) this.texts[1].body = po[1];
                this._liczHist();
                this._save();
                this._synchronizujWerdykt();   // zmiana tekstu = werdykt oznaczony jako nieaktualny, zero wywołań AI
                this._przelicz(o.kursor || (zazn ? { strona: zazn.strona, a: zazn.a, f: zazn.f } : null));
                this.edStan = 'zapisano';
                clearTimeout(this._edStanT);
                this._edStanT = setTimeout(() => { if (this.edStan === 'zapisano') this.edStan = ''; }, 2000);
                return true;
            },
            // Przeliczenie i przebudowa od razu (nie w $nextTick: kursor wraca w tym samym zadaniu).
            _przelicz(kursor) {
                const t0 = Date.now();
                if (!this._silnik()) return false;
                const sc = adEl('xr-ad-scroller');
                const top = sc ? sc.scrollTop : 0;
                this.renderNow();
                if (sc) sc.scrollTop = top;
                if (kursor) this._ustawKursor(kursor);
                this._edCzas = Date.now() - t0;
                return true;
            },
            cofnij() { this._krokHistorii(historiaCofnij); },
            ponow() { this._krokHistorii(historiaPonow); },
            _krokHistorii(krok) {
                if (this.mode !== 'results') return;
                this._zatwierdzEdycje({ wymus: true });   // wpisane, a nieprzeliczone, to też krok do cofnięcia
                const h0 = this._histDla();
                const h = krok(h0);
                if (!h) return;
                const przed = h0.stan, cel = h.stan;
                const aktywna = this._stronaAktywna();
                let strona = przed.a !== cel.a ? 0 : 1;
                if (przed.a !== cel.a && przed.b !== cel.b && aktywna >= 0) strona = aktywna;
                const k = miejsceZmiany(strona === 0 ? przed.a : przed.b, strona === 0 ? cel.a : cel.b);
                this._hist = h;
                this.texts[0].body = cel.a;
                this.texts[1].body = cel.b;
                this._liczHist();
                this._save();
                this._synchronizujWerdykt();
                this._przelicz({ strona, a: k, f: k, fokus: true, pokaz: true });
            },
            // Zamiana zaznaczenia na `wstaw` w TEKŚCIE strony (rozszerz: 'wstecz' | 'naprzod' = jeden znak
            // przy pustym zaznaczeniu, czyli łączenie linii) + natychmiastowe przeliczenie.
            _podmienZaznaczenie(strona, wstaw, rozszerz, gotowe) {
                const z = gotowe || this._zlapZaznaczenie();
                if (!z || z.strona !== strona) return false;
                if (z.odczyt.brakLuk) {
                    this._brudne[strona] = true;
                    return this._zatwierdzEdycje({ wymus: true });
                }
                const t = z.odczyt.tekst;
                let lo = Math.min(z.a, z.f), hi = Math.max(z.a, z.f);
                if (rozszerz === 'wstecz' && lo === hi) lo = Math.max(0, lo - 1);
                if (rozszerz === 'naprzod' && lo === hi) hi = Math.min(t.length, hi + 1);
                const nowy = t.slice(0, lo) + wstaw + t.slice(hi);
                const k = lo + wstaw.length;
                return this._zatwierdzEdycje({ nadpisz: { strona, tekst: nowy }, kursor: { strona, a: k, f: k, fokus: true, pokaz: true }, wymus: true });
            },
            _naPrzedWpisaniem(e) {
                const s = this._stronaZ(e.target);
                if (s < 0) return;
                const t = String(e.inputType || '');
                if (t === 'historyUndo' || t === 'historyRedo') {
                    e.preventDefault();
                    if (t === 'historyUndo') this.cofnij(); else this.ponow();
                    return;
                }
                if (t.indexOf('format') === 0 || t === 'insertFromDrop' || t === 'deleteByDrag' || t === 'insertLink') {
                    e.preventDefault();
                    return;
                }
                if (e.isComposing || this._sklada || t === 'insertCompositionText') return;
                const z = this._zlapZaznaczenie();
                if (!z || z.strona !== s) return;
                const tekst = z.odczyt.tekst;
                const lo = Math.min(z.a, z.f), hi = Math.max(z.a, z.f);
                const wieleLinii = tekst.slice(lo, hi).indexOf('\n') >= 0;
                let wstaw = '', rozszerz = '';
                if (t.indexOf('delete') === 0) {
                    if (lo !== hi) {
                        if (!wieleLinii) return;            // w obrębie linii: natywnie
                    } else if (/Backward$/.test(t)) {
                        if (lo === 0 || tekst[lo - 1] !== '\n') return;
                        rozszerz = 'wstecz';                 // Backspace na początku linii = złącz z poprzednią
                    } else if (/Forward$/.test(t)) {
                        if (tekst[lo] !== '\n') return;
                        rozszerz = 'naprzod';                // Delete na końcu linii = złącz z następną
                    } else return;
                } else if (t === 'insertParagraph' || t === 'insertLineBreak') {
                    if (!wieleLinii) return;
                    wstaw = '\n';
                } else if (t === 'insertText' || t === 'insertReplacementText' || t === 'insertFromPaste' || t === 'insertFromYank') {
                    if (!wieleLinii && t !== 'insertFromPaste') return;
                    const d = e.data !== null && e.data !== undefined ? e.data
                        : (e.dataTransfer && e.dataTransfer.getData ? e.dataTransfer.getData('text/plain') : '');
                    wstaw = adTekstZeSchowka(d);
                } else return;
                e.preventDefault();
                this._podmienZaznaczenie(s, wstaw, rozszerz, z);
            },
            _naKlawisz(e) {
                const s = this._stronaZ(e.target);
                if (s < 0 || e.isComposing) return;
                const mod = e.metaKey || e.ctrlKey;
                const k = String(e.key || '').toLowerCase();
                if (mod && !e.altKey && k === 'z') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.shiftKey) this.ponow(); else this.cofnij();
                    return;
                }
                if (e.ctrlKey && !e.metaKey && !e.altKey && k === 'y') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.ponow();
                    return;
                }
                // Zwykły tekst: bez pogrubień i kursywy (przeglądarka bez plaintext-only).
                if (mod && !e.altKey && !e.shiftKey && (k === 'b' || k === 'i' || k === 'u')) e.preventDefault();
            },
            _naWklej(e) {
                const s = this._stronaZ(e.target);
                if (s < 0) return;
                e.preventDefault();   // zawsze zwykły tekst, przez tekst strony (bez HTML i stylów)
                const dane = e.clipboardData && e.clipboardData.getData ? e.clipboardData.getData('text/plain') : '';
                this._podmienZaznaczenie(s, adTekstZeSchowka(dane), '');
            },
            _naKopiuj(e, wytnij) {
                const s = this._stronaZ(e.target);
                if (s < 0) return;
                const z = this._zlapZaznaczenie();
                if (!z || z.strona !== s || z.a === z.f || !e.clipboardData) return;
                const lo = Math.min(z.a, z.f), hi = Math.max(z.a, z.f);
                // Dokładny kawałek tekstu strony (bez ¶, znaczków przeniesień i napisów „ukryto N linii”;
                // zaznaczenie przez lukę kopiuje także ukryte linie).
                e.clipboardData.setData('text/plain', z.odczyt.tekst.slice(lo, hi));
                e.preventDefault();
                if (wytnij) this._podmienZaznaczenie(s, '', '', z);
            },
            /* EDYCJA-W-PANELACH:END */
            verdictLabel(v) {
                return ({ duplikat: 'Duplikat', bliska_parafraza: 'Bliska parafraza', ta_sama_struktura: 'Ta sama struktura',
                          luzne_podobienstwo: 'Luźne podobieństwo', rozne_teksty: 'Różne teksty' })[v] || v;
            },
            relationLabel(r) {
                return ({ doslowne: 'dosłowne', parafraza: 'parafraza', ten_sam_pomysl: 'ten sam pomysł' })[r] || r;
            },
            matchLabel(m) {
                return ({ identyczna: 'identyczna', parafraza: 'parafraza', inny_pomysl: 'inny pomysł', brak: 'brak' })[m] || m;
            },
            sectionLabel(s) {
                return ({ hook: 'Hook', lead: 'Lead', problem: 'Problem', mechanizm: 'Mechanizm', dowod: 'Dowód', oferta: 'Oferta', cta: 'CTA' })[s] || s;
            },
            verdictChipClass() {
                const v = this.ai.verdict && this.ai.verdict.verdict;
                if (v === 'duplikat' || v === 'bliska_parafraza') return 'ring-2 ring-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200';
                if (v === 'ta_sama_struktura') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
                return 'bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70';
            },
            // PŁATNE: woływane WYŁĄCZNIE z @click przycisków z data-cost-op="ai_diff_verdict".
            // Nic w init/compare/watcherach tego nie woła (pilnuje tego test statyczny).
            async analyzeAI() {
                if (this.ai.busy) return;
                // 13.10.2026 (edycja w panelach): AI dostaje to, co widać (wpisane w diffie najpierw do tekstu).
                this._zatwierdzEdycje();
                this.ai.busy = true;
                // Odcisk pary łapany PRZED fetchem + licznik generacji (edycja w trakcie analizy
                // nie może dać werdyktu starej pary oznaczonego jako świeży; clearAll go porzuca).
                const key = this._pairKey();
                const gen = (this._aiGen = (this._aiGen || 0) + 1);
                const op = window.appOpStart ? appOpStart('aidiff-analyze', '🤖 Analiza podobieństwa AI…', { expectedSec: 45 }) : null;
                try {
                    const slug = this.texts[0].slug || this.texts[1].slug || '';
                    const r = await fetch('/api/xray/ai-diff', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text_a: this.texts[0].body, text_b: this.texts[1].body,
                            label_a: this.texts[0].name || 'A', label_b: this.texts[1].name || 'B',
                            product_slug: slug,
                        }),
                        timeoutMs: 180000,   // URL nie łapie się na AI-regex wrappera (180s): jawnie
                    });
                    const j = await r.json().catch(() => ({}));
                    if (!r.ok || !j.ok) {
                        // missing_key (400) i limit_exceeded (429) mają globalne toasty fetch-wrappera.
                        if (!j.missing_key && !j.limit_exceeded) {
                            toast(T('Analiza AI nie powiodła się: ') + (j.error || j.detail || ('HTTP ' + r.status)), { variant: 'error', durationMs: 8000 });
                        }
                        if (op) appOpEnd(op, { error: true });
                        return;
                    }
                    if (gen !== this._aiGen) {
                        if (op) appOpEnd(op, { error: true });
                        return;   // clearAll w międzyczasie: porzuć odpowiedź (i nie zapisuj jej)
                    }
                    this.ai.verdict = j.verdict;
                    this.ai.model = j.model || '';
                    this.ai.truncatedA = !!j.truncated_a;
                    this.ai.truncatedB = !!j.truncated_b;
                    this.ai.key = key;
                    this.ai.restored = false;
                    this.ai.stale = key !== this._pairKey();
                    // 13.10.2026 (Ads X-Ray): zapłacony wynik zostaje w przeglądarce pod kluczem pary.
                    zapiszWerdykt(pamiec(), key, {
                        verdict: j.verdict, model: this.ai.model,
                        truncatedA: this.ai.truncatedA, truncatedB: this.ai.truncatedB,
                    }, Date.now());
                    if (op) appOpEnd(op, true, 'Werdykt AI gotowy');
                } catch (e) {
                    if (op) appOpEnd(op, { error: true });
                    toast('Analiza AI: ' + blad(e), { variant: 'error', durationMs: 8000 });
                } finally {
                    this.ai.busy = false;
                }
            },
            copyText(i) {
                this._zatwierdzEdycje();
                this._clip(this.texts[i].body || '', 'Skopiowano tekst ' + this.letter(i));
            },
            copyReport() {
                this._zatwierdzEdycje();
                if (!adRes) return;
                const s = this.stats || {};
                const lines = [];
                lines.push('# AI Diff: raport porównania');
                lines.push('');
                lines.push('A: ' + (this.texts[0].name || 'Tekst A') + ' (' + s.wordsA + ' słów) vs B: ' + (this.texts[1].name || 'Tekst B') + ' (' + s.wordsB + ' słów)');
                lines.push('Mechanicznie: ' + s.similarity + '% bez zmian · ' + s.changes + ' ' + adPlural(s.changes, 'zmiana', 'zmiany', 'zmian') + ' (' + s.added + ' dodane, ' + s.removed + ' wycięte, ' + s.rewritten + ' przepisane, ' + s.moved + ' przeniesione)');
                if (this.ai.verdict) {
                    lines.push('AI: ' + this.ai.verdict.overall_score + '% · ' + this.verdictLabel(this.ai.verdict.verdict) + (this.ai.stale ? ' (werdykt sprzed ostatniej edycji tekstów)' : ''));
                    lines.push('AI summary: ' + this.ai.verdict.summary);
                }
                lines.push('');
                lines.push('---');
                lines.push('');
                for (const row of adRes.rows) {
                    let line = '';
                    for (const seg of row.uni) {
                        if (seg.type === 'eq') line += seg.text;
                        else if (seg.type === 'del') line += '~~' + seg.text + '~~';
                        else line += '**' + seg.text + '**';
                    }
                    lines.push(line);
                }
                this._clip(lines.join('\n'), 'Skopiowano raport Markdown');
            },
            _clip(text, msg) {
                const done = () => { toast('✓ ' + msg, { variant: 'success' }); };
                const fail = () => { toast('Kopiowanie nie powiodło się', { variant: 'error' }); };
                if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
                else fail();
            },
            // Skróty klawiszowe: tylko gdy ten tryb jest w DOM i okno historii jest zamknięte.
            onKey(e) {
                if (!this.$root || !this.$root.isConnected) return;
                if (window.xrayHistoriaOtwarte && window.xrayHistoriaOtwarte()) return;   // 14.10.2026 (historia Ads X-Ray)
                const ae = document.activeElement;
                const tag = (ae && ae.tagName) || '';
                // 13.10.2026 (edycja w panelach): pisanie w stronie A/B (contenteditable) też jest pisaniem.
                const typing = /^(TEXTAREA|INPUT|SELECT)$/.test(tag) || !!(ae && ae.isContentEditable);
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && this.mode === 'edit') {
                    e.preventDefault();
                    this.compare();
                    return;
                }
                if (typing || e.metaKey || e.ctrlKey || e.altKey || this.mode !== 'results') return;
                if (e.key === 'n') { e.preventDefault(); this.goTo(this.cur + 1); }
                else if (e.key === 'p') { e.preventDefault(); this.goTo(this.cur - 1); }
            },
        };
    }

    root.xrayAiDiff = xrayAiDiff;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            xrayAiDiff, adPlural, adNorm, adTextOfSegs, adBuildPlan,
            adCzytajStrone, adPunktDlaPozycji, adPunktWKomorce, adZbudujStrony, adLiczLinie, adEtykietaLuki,
            nowaHistoria, historiaZapisz, historiaCofnij, historiaPonow, miejsceZmiany, adTekstZeSchowka, HISTORIA_MAX,
            odciskTekstu, kluczPary, poprawnyWerdykt, czytajWerdykty, werdyktZPamieci,
            zapiszWerdykt, usunWerdykt, KLUCZ_WERDYKTOW, MAX_WERDYKTOW,
        };
    }
})(typeof window !== 'undefined' ? window : globalThis);
