/* 13.10.2026 (Ads X-Ray): JEDEN splitter zdań dla trzech trybów (Similarities, AI Diff, Skrypty PL).
 *
 * Kod przeniesiony 1:1 z backend/templates/script_compare.html (splitSentencesByLines,
 * _splitSentencesRegex, _mergeBarePunct, splitSentences, _stripEmDashes, pacing 150 wpm) oraz
 * z detail.html (chunkBlob, paragraphsOf). Wynik musi być BAJT W BAJT taki sam jak w tych
 * stronach i jak serwerowe lustro _split_sentences_for_alignment / _align_regex_split w
 * backend/app.py, bo płatna mapa AI (/api/xray/align) indeksuje te same zdania.
 * Każda zmiana reguł = zmiana we WSZYSTKICH lustrach naraz; pilnują tego testy
 * tests/engine/test_xray_zdania.js i tests/test_xray_zdania.py (parity z Pythonem i ze starymi stronami).
 *
 * API: window.XZdania (w node: module.exports)
 *   podziel(tekst)              cała kolumna: akapity po pustych liniach, w akapicie z \n linia = zdanie,
 *                               akapit jednoliniowy dzielony regexem (== splitSentences ze script_compare)
 *   podzielAkapit(akapit)       linia = zdanie (== splitSentencesByLines)
 *   podzielRegex(tekst)         regex z maskami (== _splitSentencesRegex)
 *   scalGolaInterpunkcje(lista) segment bez liter/cyfr dokleja się do sąsiada (== _mergeBarePunct)
 *   zakresy(tekst)              BEZSTRATNE zakresy [{start, end, akapit, linie}] zdań z podziel() w ORYGINALNYM
 *                               napisie (poza zakresami same białe znaki); akapit = numer akapitu ze zdaniami,
 *                               linie = akapit pisany linia pod linią
 *   chunkBlob(tekst | lista)    detail.html splitSentences(t, {chunkBlob: true}): zdania > 25 słów cięte na ~14
 *   akapity(tekst)              detail.html paragraphsOf: [[{text, idx}]]
 *   bezDlugichMyslnikow(tekst)  najnowsze _stripEmDashes ze script_compare (Kopiuj PL)
 *   liczSlowa / sekundyZSlow / etykietaCzasu   tempo 150 słów na minutę
 *   liniiWieluZdan(tekst), rozbijLinie(tekst)  _liniiWieluZdan i _podzielTekst ze script_compare
 */
(function (root) {
    'use strict';

    // ── Splitter zdań: SKOPIOWANY 1:1 ze script_compare.html (== detail.html == app.py) ──
    function podzielAkapit(paragraph) {
        return String(paragraph).split(/\n/).map(s => s.trim()).filter(Boolean);
    }

    function podzielRegex(paragraph) {
        if (!paragraph) return [];
        var DOT = String.fromCharCode(57344), ELL = String.fromCharCode(57345);
        var t = String(paragraph);
        var ELLM = String.fromCharCode(57346), WIELO = [], kW = 0;
        // 13.10.2026 (krytyk PL scripts r18 #3): wielokropek przed małą literą nie kończy zdania
        // („I wtedy… zrozumiałam”), a „...” zostaje „...” (zapamiętane oryginały, oddawane po kolei).
        t = t.replace(/\.{3,}|\u2026/g, function (m, o, s) { WIELO.push(m); return /^\s+[a-zß-ÿąćęłńóśźż]/.test(s.slice(o + m.length)) ? ELLM : ELL; });
        t = t.replace(/(\d)\.(?=\d)/g, '$1' + DOT);
        t = t.replace(/(\d)\.(?=\s+[a-z\u00df-\u00ff\u0105\u0107\u0119\u0142\u0144\u00f3\u015b\u017a\u017c])/g, '$1' + DOT);   // 13.10.2026: „Do 31.12. trwa”
        // 11.10.2026: kropki w linkach nie tną zdania (Kopiuj PL (FB) rozbijało adresy).
        var QM = String.fromCharCode(57347), EX = String.fromCharCode(57348);
        // 13.10.2026 (krytyk r19 #3): w adresie także ? i ! nie kończą zdania; e-mail jak adres.
        t = t.replace(/(?:https?:\/\/|www\.)[^\s]*[^\s.,!?;:)\]\u201D\u00BB]/gi, function (m) { return m.split('.').join(DOT).split('?').join(QM).split('!').join(EX); });
        t = t.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[A-Za-z]{2,}/g, function (m) { return m.split('.').join(DOT); });
        // 13.10.2026 (krytyk r20 #1): gola domena (np. sklep.pl, marka.co) tez nie tnie zdania.
        t = t.replace(/(?<![\p{L}\p{N}_@.\uE000])[\p{L}\p{N}_-]+(?:\.[\p{L}\p{N}_-]+)*\.(?:pl|com|co|de|eu|net|org|shop|store|io|uk|info|app)(?![\p{L}\p{N}_])(?:\/[^\s]*[^\s.,!?;:)\]\u201D\u00BB])?/giu, function (m) { return m.split('.').join(DOT); });
        var ABBR = ['np','itd','itp','tj','tzn','tzw','m\\.in','ds',
            'dr','prof','mgr','inż','hab','płk','gen','ks',
            'ul','al','os','pl','nr','str','rys','tab','poz','ust','par',
            'św','bł','por','zob','wg','pkt','cdn','jw','approx','odc','ub','ww','ew','wyd','inkl','ggf','evtl','bzw',
            'P\\.P\\.S','P\\.S','Mr','Mrs','Ms','Dr','Prof','St','Mt','vs','etc','e\\.g','i\\.e',
            'Inc','Ltd','Jr','Sr',
            'M','Mme','Mlle','env','cf','réf','bd','av','sté',
            'a\\.m','p\\.m','U\\.S','U\\.K'];
        // Parity-fix 1.1.209: unicodowy lookbehind (?<!\p{L}\p{N}_) = semantyka pythonowego \b;
        // callback maskuje WSZYSTKIE kropki skrótu (m.in./e.g.).
        t = t.replace(new RegExp('(?<![\\p{L}\\p{N}_\\uE000@])(' + ABBR.join('|') + ')\\.', 'giu'),
                      function (m) { return m.split('.').join(DOT); });
        // 13.10.2026 (krytyk r18 #3, #5): skróty, po których zdanie zwykle trwa: kropka nie tnie,
        // gdy dalej jest mała litera albo cyfra.
        var ABBR_MIEKKIE = ['r','tel','Tel','tyg','mies','w','ang','ca','Ca','usw','tys','szt','godz','mln','mld','sek','proc','no','No','ok','Ok','red','art','Art','min','co','Co','vol','pp'];
        t = t.replace(/(?<![\p{L}\p{N}_])(z\. ?B|u\. ?a|d\. ?h|z\. ?T)\./gu, function (m) { return m.split('.').join(DOT); });   // de: zawsze
        t = t.replace(new RegExp('(?<![\\p{L}\\p{N}_\\uE000@])(' + ABBR_MIEKKIE.join('|') + ')\\.(?=\\s+[a-z0-9ß-ÿąćęłńóśźż])', 'gu'),
                      function (m) { return m.split('.').join(DOT); });
        t = t.replace(/(?<![\p{L}])([A-ZÀ-ÖŻŹŚĆĄĘŁÓŃ])\.(?=\s)/gu,
                      '$1' + DOT);
        // 1.1.209: domkniecia po terminatorze takze TYPOGRAFICZNE (” » “ ’).
        var termRe = new RegExp('[^.!?' + ELL + ']+[.!?' + ELL + ']+["\')\\]\u201D\u00BB\u201C\u2019]*|[^.!?' + ELL + ']+$' + '|[.!?' + ELL + '"\')\\]\u201D\u00BB\u201C\u2019]+', 'g');
        var matches = t.match(termRe) || [];
        return scalGolaInterpunkcje(matches
            .map(function (s) { return s.split(DOT).join('.').split(QM).join('?').split(EX).join('!').replace(new RegExp('[' + ELL + ELLM + ']', 'g'), function () { return WIELO[kW++] || '\u2026'; }).trim(); })
            .filter(Boolean));
    }

    function scalGolaInterpunkcje(list) {
        // Lustro _merge_bare_punct z app.py: segment bez liter/cyfr dokleja sie
        // do poprzedniego (prowadzacy do nastepnego). Chroni os porownania.
        const out = [];
        let pending = '';
        for (const s of list) {
            if (!/[\p{L}\p{N}]/u.test(s)) {
                if (out.length) out[out.length - 1] += (/^[.,;:!?\u2026\u201D\u00BB)\]\u2019]/.test(s) ? '' : ' ') + s; else pending += (pending ? ' ' : '') + s;
            } else { out.push(pending ? pending + ' ' + s : s); pending = ''; }
        }
        if (pending) out.push(pending);
        return out;
    }

    // Normalizacja jak w splitSentences (1.1.209: strip() vs trim() parity).
    function _normalizuj(text) {
        return String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
            .replace(/[\u001c-\u001f\u0085\u2028\u2029]/g, '\n').replace(/\ufeff/g, '');
    }

    // Zdania z numerem akapitu: ta sama pętla co splitSentences, plus informacja, skąd zdanie.
    function _zdaniaZAkapitami(text) {
        if (!text) return [];
        const out = [];
        let nr = 0;
        for (const p of _normalizuj(text).split(/\n\n+/)) {
            let zdania;
            const linie = p.includes('\n');
            if (linie) zdania = podzielAkapit(p);
            else if (p.trim()) zdania = podzielRegex(p);
            else continue;
            if (!zdania.length) continue;
            for (const z of zdania) out.push({ tekst: z, akapit: nr, linie: linie });
            nr++;
        }
        return out;
    }

    function podziel(text) {
        return _zdaniaZAkapitami(text).map(z => z.tekst);
    }

    // ── chunkBlob i paragraphsOf: 1:1 z detail.html (== chunk_blob=True w app.py) ──
    const CHUNK_MAXW = 25, CHUNK_TARGET = 14;
    function _pokroj(lista) {
        const rechunked = [];
        for (const s of lista) {
            const words = s.split(/\s+/).filter(Boolean);
            if (words.length > CHUNK_MAXW) {
                const n = Math.max(2, Math.ceil(words.length / CHUNK_TARGET));
                const size = Math.ceil(words.length / n);
                for (let i = 0; i < words.length; i += size) {
                    rechunked.push(words.slice(i, i + size).join(' '));
                }
            } else {
                rechunked.push(s);
            }
        }
        return rechunked;
    }
    // Tekst: splitSentences(tekst, {chunkBlob: true}); lista zdań: samo cięcie długich zdań.
    function chunkBlob(wejscie) {
        if (Array.isArray(wejscie)) return _pokroj(wejscie);
        return _pokroj(podziel(wejscie));
    }

    function akapity(text) {
        if (!text) return [];
        // Jak paragraphsOf w detail.html: tylko CRLF (bez NEL/BOM), żeby wynik był identyczny.
        text = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        let globalIdx = 0;
        const result = [];
        for (const p of text.split(/\n\n+/)) {
            let sents;
            if (p.includes('\n')) {
                sents = podzielAkapit(p);
            } else if (p.trim()) {
                sents = podzielRegex(p);
            } else {
                continue;
            }
            if (sents.length > 0) {
                result.push(sents.map(s => ({ text: s, idx: globalIdx++ })));
            }
        }
        return result;
    }

    // ── Zakresy zdań w ORYGINALNYM tekście (bez normalizacji) ──
    // Zdanie z podziel() to znaki oryginału w tej samej kolejności; różnią się tylko białe znaki
    // (trim, spacja dodana przy scalaniu interpunkcji, \r, BOM, NEL). Idziemy więc po obu napisach
    // naraz i pomijamy białe znaki. Gdyby tekst zawierał znaki z prywatnego obszaru Unicode, których
    // splitter używa jako masek, dopasowanie może się rozjechać: wtedy końcowa naprawa i tak
    // gwarantuje, że poza zakresami zostają WYŁĄCZNIE białe znaki, a zakresów jest tyle, co zdań.
    const BIALY = /[\s\u001c-\u001f\u0085]/;
    function zakresy(text) {
        const o = String(text || '');
        const zdania = _zdaniaZAkapitami(o);
        const n = o.length;
        const wynik = [];
        let p = 0;
        for (const z of zdania) {
            const s = z.tekst;
            let start = -1, end = p;
            for (let q = 0; q < s.length; q++) {
                const c = s[q];
                if (BIALY.test(c)) {
                    if (o[p] === c) p++;
                    continue;
                }
                while (p < n && BIALY.test(o[p])) p++;
                if (p >= n) break;
                if (start < 0) start = p;
                p++;           // ten sam znak albo (w razie rozjazdu) podstawienie 1:1
                end = p;
            }
            if (start < 0) start = end = p;
            wynik.push({ start: start, end: end, akapit: z.akapit, linie: z.linie });
        }
        _domknijLuki(o, wynik);
        return wynik;
    }
    // Naprawa: każdy nie-biały znak poza zakresami trafia do sąsiedniego zakresu.
    function _domknijLuki(o, wynik) {
        if (!wynik.length) return;
        const nieBialy = (od, doo) => { for (let i = od; i < doo; i++) if (!BIALY.test(o[i])) return i; return -1; };
        const ostatniNieBialy = (od, doo) => { for (let i = doo - 1; i >= od; i--) if (!BIALY.test(o[i])) return i; return -1; };
        const pierwszy = nieBialy(0, wynik[0].start);
        if (pierwszy >= 0) wynik[0].start = pierwszy;
        for (let k = 0; k < wynik.length; k++) {
            const od = wynik[k].end;
            const doo = k + 1 < wynik.length ? wynik[k + 1].start : o.length;
            const ost = ostatniNieBialy(od, doo);
            if (ost >= 0) wynik[k].end = ost + 1;
            if (wynik[k].start > wynik[k].end) wynik[k].start = wynik[k].end;
        }
    }

    // ── Pomocnicze operacje na liniach (1:1 _liniiWieluZdan / _podzielTekst ze script_compare) ──
    function liniiWieluZdan(tekst) {
        let n = 0;
        for (const p of String(tekst || '').replace(/\r\n?/g, '\n').split(/\n\n+/)) {
            if (p.indexOf('\n') === -1) continue;
            for (const l of p.split('\n')) if (l.trim() && podzielRegex(l).length > 1) n++;
        }
        return n;
    }
    function rozbijLinie(tekst) {
        return String(tekst || '').replace(/\r\n?/g, '\n').split(/(\n\n+)/).map(p => {
            if (/^\n\n+$/.test(p) || p.indexOf('\n') === -1) return p;
            return p.split('\n').map(l => l.trim() ? podzielRegex(l).join('\n') : l).join('\n');
        }).join('');
    }

    // ── Kopiowanie PL: bez długich myślników (najnowsze _stripEmDashes ze script_compare) ──
    function bezDlugichMyslnikow(t) {
        // Krytyk r16 #3: zakres liczb (4-6) = półpauza; myślnik dialogu (na początku linii albo po ?!.
        // przed małą literą) = półpauza zamiast przecinka; para myślników (- wtrącenie -) = dwa przecinki.
        return String(t || '')
            .replace(/(\d)\s*\u2014\s*(\d)/g, '$1–$2')
            .replace(/(^|\n)[ \t]*\u2014[ \t]*/g, '$1– ')
            .replace(/:[ \t]*\u2014[ \t]*/g, ': ')                                     // krytyk r17 #2: „Pytasz: Czy…”
            .replace(/([?!.…])[ \t]*\u2014[ \t]*(?=\p{Ll})/gu, '$1 – ')
            .replace(/([?!.…])[ \t]*\u2014[ \t]*(?=\p{Lu})/gu, '$1 ')                 // krytyk r18 #2: „Jak? (myślnik) Bardzo prosto.”
            // para myślników tylko w obrębie jednego zdania (nie przez kropkę)
            .replace(/[ \t]*\u2014[ \t]*([^\u2014\n.!?]{1,80}?)[ \t]*\u2014[ \t]*/g, ', $1, ')
            // Krytyk r15 #2, r17 #2: bez przecinka przed i/oraz/albo/lub/ani/bądź/czy i przed „to” (łącznik);
            // przed a/ale/lecz/więc/bo/czyli przecinek jest konieczny.
            .replace(/\s*\u2014\s*(i|oraz|albo|lub|ani|bądź|czy|to)(?=\s)/gi, ' $1')
            .replace(/\s*\u2014\s*(a|ale|lecz|więc|bo|czyli)(?=\s)/gi, ', $1')
            .replace(/\s*\u2014\s*/g, ', ')
            .replace(/,\s*,/g, ',').replace(/\s+,/g, ',');
    }

    // ── Tempo (150 słów na minutę, wzorzec detail.html i script_compare) ──
    const SLOWA_NA_MINUTE = 150;
    function liczSlowa(t) { t = (t || '').trim(); return t ? t.split(/\s+/).length : 0; }
    function sekundyZSlow(n) { return Math.round(n * 60 / SLOWA_NA_MINUTE); }
    function etykietaCzasu(sec) {
        if (sec < 60) return sec + 's';
        return Math.floor(sec / 60) + 'm' + String(sec % 60).padStart(2, '0') + 's';
    }

    const XZdania = {
        podziel: podziel,
        podzielAkapit: podzielAkapit,
        podzielRegex: podzielRegex,
        scalGolaInterpunkcje: scalGolaInterpunkcje,
        zakresy: zakresy,
        chunkBlob: chunkBlob,
        akapity: akapity,
        bezDlugichMyslnikow: bezDlugichMyslnikow,
        liczSlowa: liczSlowa,
        sekundyZSlow: sekundyZSlow,
        etykietaCzasu: etykietaCzasu,
        liniiWieluZdan: liniiWieluZdan,
        rozbijLinie: rozbijLinie,
    };
    root.XZdania = XZdania;
    if (typeof module !== 'undefined' && module.exports) module.exports = XZdania;
})(typeof window !== 'undefined' ? window : globalThis);
