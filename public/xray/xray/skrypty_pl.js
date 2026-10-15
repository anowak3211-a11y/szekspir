/* 13.10.2026 (Ads X-Ray): tryb „Skrypty PL” zakładki ?tryb=skrypty-pl.

 Port 1:1 narzędzia z backend/templates/script_compare.html (stara strona /script-compare
 zostaje bez zmian, właściciel porównuje obie wersje). Trzy skrypty zdanie w zdanie:
 Oryginał (dowolny język) | English (oś) | Polski (edytowalny). Silnik grup zdań
 /static/zdania-mapa.js (ZdaniaMapa), dopasowanie AI przez POST /api/xray/align
 (płatne, z wyborem modelu i ceną w oknie), powiązania, Cofnij/Ponów, edycja PL w miejscu,
 kopiowanie FB/akapity, tempo 150 wpm.

 Różnice względem starej strony (tylko techniczne):
 - podział na zdania, długie myślniki i tempo z jednego silnika /static/xray/zdania.js
   (window.XZdania); metody o starych nazwach tylko go wołają;
 - zapytania DOM w korzeniu trybu (data-xray-tryb="skrypty-pl"), nie w całym dokumencie;
 - wersja samodzielna: bez okna „Z reklamy” (brak bazy reklam);
 - wersja robocza pod TYM SAMYM kluczem 'xray_scriptcompare_texts' i w tym samym formacie
   (z opłaconą mapą AI), więc stara i nowa strona pokazują te same teksty.

 Wszystkie treści usera: textContent / x-text (XSS, i18n). */

// Kopia „FB”: każde zdanie osobnym akapitem, bez długich myślników (gotowe do FB i IG).
function skryptyPlTekstFb(plText, Z) {
    // Krytyk r10 #4: w trybie linii dwa zdania w jednym wierszu też idą jako osobne akapity.
    return Z.podziel(plText)
        .flatMap(z => Z.podzielRegex(z))
        // Krytyk r16 #3: dopowiedzenie dialogu („– pytasz.”) zostaje w akapicie swojej kwestii.
        .reduce((acc, z) => { if (acc.length && /^–\s*\p{Ll}/u.test(z)) acc[acc.length - 1] += ' ' + z; else acc.push(z); return acc; }, [])
        .join('\n\n');
}

// Kopia „akapity”: tekst z poprawkami, akapity i linie jak w skrypcie (LF, bez spacji na końcach linii).
function skryptyPlTekstAkapity(plText) {
    return String(plText || '');
}

/* 13.10.2026 (edycja w kolumnach): czyste funkcje edycji wszystkich trzech kolumn (bez DOM-u
 przeglądarki, testowane w node: tests/engine/test_xray_skrypty_edycja.js).

 - skryptyPlZakresy: gdzie w SUROWYM tekście kolumny stoi każde wyświetlane zdanie. Zdanie z silnika
   to znaki oryginału w tej samej kolejności (różnią się tylko białe znaki: trim, spacja ze scalenia
   interpunkcji, \r), więc idziemy od ruchomego kursora znak po znaku, pomijając białe znaki; gdy to
   zawiedzie, indexOf od kursora, ale tylko w obrębie akapitu. Zdanie nie do wskazania = null
   (wtedy edycja przebudowuje wyłącznie jego akapit, patrz _przebudujAkapit).
 - skryptyPlLinearyzuj / skryptyPlPunkt: tekst kontenera „Ciągły tekst” i przeliczanie kursora
   (węzeł, przesunięcie) <-> pozycja znaku, w obie strony tak samo (<br> = nowa linia, końcowy <br>
   to wypełniacz przeglądarki, nie znak).
 - skryptyPlKawalkiCiagle: tekst kolumny pocięty na zdania (z indeksem) i odstępy między nimi;
   złożone razem dają dokładnie ten sam tekst, więc przebudowa kontenera niczego nie zmienia. */
var SKRYPTY_PL_BIALY = /[\s\u001c-\u001f\u0085]/;
var SKRYPTY_PL_BLOK = /^(DIV|P|LI)$/;

function skryptyPlDopasujOd(o, s, od) {
    let p = od, start = -1;
    for (let q = 0; q < s.length; q++) {
        const c = s[q];
        if (SKRYPTY_PL_BIALY.test(c)) continue;
        while (p < o.length && SKRYPTY_PL_BIALY.test(o[p])) p++;
        if (p >= o.length || o[p] !== c) return null;
        if (start < 0) start = p;
        p++;
    }
    return start < 0 ? null : [start, p];
}

function skryptyPlZakresy(tekst, zdania) {
    const o = String(tekst || '');
    const wynik = [];
    let kursor = 0;
    for (const zd of (zdania || [])) {
        const s = String(zd || '');
        let zak = skryptyPlDopasujOd(o, s, kursor);
        if (!zak && s) {
            const i = o.indexOf(s, kursor);
            // Bez przeskoku przez pustą linię: zdanie nie może wylądować w obcym akapicie.
            if (i >= 0 && !/\n[ \t]*\r?\n/.test(o.slice(kursor, i))) zak = [i, i + s.length];
        }
        wynik.push(zak);
        if (zak) kursor = zak[1];
    }
    return wynik;
}

function skryptyPlLinearyzuj(kontener, cel) {
    let tekst = '', poz = null, brKoniec = -1;
    const wezly = [];
    (function dfs(n) {
        if (n.nodeType === 3) {
            const v = n.nodeValue || '';
            if (cel && n === cel.node) poz = tekst.length + Math.min(cel.offset, v.length);
            wezly.push({ node: n, od: tekst.length, dl: v.length });
            if (v) { tekst += v; brKoniec = -1; }
            return;
        }
        if (n.nodeType !== 1) return;
        if (n.nodeName === 'BR') {
            wezly.push({ node: n, od: tekst.length, dl: 0, br: true });
            brKoniec = tekst.length; tekst += '\n';
            return;
        }
        if (n !== kontener && SKRYPTY_PL_BLOK.test(n.nodeName) && tekst && tekst[tekst.length - 1] !== '\n') { tekst += '\n'; brKoniec = -1; }
        const dz = n.childNodes || [];
        for (let i = 0; i < dz.length; i++) {
            if (cel && n === cel.node && i === cel.offset && poz === null) poz = tekst.length;
            dfs(dz[i]);
        }
        if (cel && n === cel.node && poz === null) poz = tekst.length;
    })(kontener);
    if (brKoniec >= 0 && brKoniec === tekst.length - 1) tekst = tekst.slice(0, -1);
    if (poz !== null && poz > tekst.length) poz = tekst.length;
    return { tekst: tekst, poz: poz, wezly: wezly };
}

function skryptyPlPunkt(kontener, poz) {
    const lin = skryptyPlLinearyzuj(kontener);
    const p = Math.max(0, Math.min(Number(poz) || 0, lin.tekst.length));
    for (const w of lin.wezly) {
        if (w.br) {
            if (p === w.od && w.node.parentNode) return { node: w.node.parentNode, offset: Array.prototype.indexOf.call(w.node.parentNode.childNodes, w.node) };
        } else if (p >= w.od && p <= w.od + w.dl) return { node: w.node, offset: p - w.od };
    }
    return { node: kontener, offset: (kontener.childNodes || []).length };
}

function skryptyPlKawalkiCiagle(tekst, zdania) {
    const t = String(tekst || ''), out = [];
    let p = 0;
    skryptyPlZakresy(t, zdania).forEach((z, i) => {
        if (!z || z[0] < p) return;
        if (z[0] > p) out.push({ tekst: t.slice(p, z[0]), idx: null });
        out.push({ tekst: t.slice(z[0], z[1]), idx: i });
        p = z[1];
    });
    if (p < t.length) out.push({ tekst: t.slice(p), idx: null });
    return out;
}

// Podmiana (albo wycięcie, gdy `clean` puste) zakresu [a, b) w tekście z LF. Przy wycięciu sprzątamy
// WYŁĄCZNIE szew po zdaniu (1.1.216/1.1.336, przeniesione z updatePlSentence bez zmian).
function skryptyPlPodmienZakres(zrodlo, a, b, clean) {
    if (clean) return zrodlo.slice(0, a) + clean + zrodlo.slice(b);
    let head = zrodlo.slice(0, a).replace(/[ \t]+$/, '');
    let tail = zrodlo.slice(b).replace(/^[ \t]+/, '');
    if (!tail) head = head.replace(/\s+$/, '');
    if (!head) tail = tail.replace(/^\s+/, '');
    let sep = '';
    if (head && tail) {
        const hNl = (head.match(/\n+$/) || [''])[0].length;
        const tNl = (tail.match(/^\n+/) || [''])[0].length;
        if (hNl || tNl) {
            // styk linii: zostaw najwyżej jedną pustą linię (akapit)
            head = head.replace(/\n+$/, '');
            tail = tail.replace(/^\n+/, '');
            sep = '\n'.repeat(Math.min(2, Math.max(1, hNl, tNl)));
        } else {
            sep = ' ';   // zdanie wycięte ze środka linii
        }
    }
    return head + sep + tail;
}

function xraySkryptyPl() {
    return {
        mode: 'edit',
        _korzen: null,            // 13.10.2026 (Ads X-Ray): korzeń trybu; zapytania DOM tylko w nim
        origText: '', enText: '', plText: '',
        origS: [], enS: [], plS: [],
        aiPlToEn: null,   // array<int|null|-1> dł. plS: mapa AI PL→EN (null = dodatek, -1 = brak informacji)
        _aiPamiec: { pl: {}, orig: {} },
        aiOrigToEn: null, // array<int|null|-1> dł. origS: mapa AI ORYG→EN
        aiBrakPl: [],     // 12.10.2026: indeksy EN, których wg AI brak w polskiej wersji
        aiBrakOrig: [],   // … i w oryginale
        aiBusy: false,
        copied: '',
        linkMode: false,          // tryb ręcznego wiązania (jak compare-view reklam)
        linkWybrane: null,        // {kol, idx}: pierwsze kliknięte zdanie (dowolna kolumna)
        linkDodawaj: false,       // krytyk r4 #10: „jak Shift” na dotyku (drugie powiązanie zamiast zastąpienia)
        anchorsPl: [],            // [{en, pl}]: ręczne powiązania, ważniejsze od mapy AI i długości
        anchorsOrig: [],          // [{en, orig}]
        // 11.10.2026: grupy zdań z silnika ZdaniaMapa (zamrożone, Alpine ich nie śledzi
        // w głąb). mapaPl: EN ↔ PL, mapaOrig: EN ↔ ORYGINAŁ.
        mapaPl: null, mapaOrig: null,
        // Listy zdań, do których odnoszą się indeksy powiązań i map AI. Po edycji tekstu
        // indeksy przenosimy (ZdaniaMapa.przemapuj), zamiast kasować płatną mapę AI
        // i pracę z powiązaniami przy każdej poprawce.
        _baza: null,
        aktywne: { en: null, pl: null, orig: null },   // podświetlone zakresy [od, do]
        autoScroll: true,
        // 13.10.2026 (właściciel): 'auto' = linie z kilkoma zdaniami w ORYGINALE i ANGIELSKIM dzielimy na
        // zdania sami (bez zmiany wklejonego tekstu); 'linie' = jak wklejone, linia = zdanie (dawne zachowanie).
        // Polska kolumna zawsze jak wklejona: edycja zdania składa tekst z tych samych linii.
        dzielenie: (() => { try { return localStorage.getItem('xray_dzielenie') === 'linie' ? 'linie' : 'auto'; } catch (e) { return 'auto'; } })(),
        _kierowca: null,  // kolumna, którą przewija użytkownik (pozostałe idą za nią)
        _programowe: {},  // kolumna -> do kiedy jej scroll to nasze przewijanie, nie użytkownika
        _myszY: null,
        gora: 0,          // wysokość przyklejonego nagłówka strony (pasek wyników przykleja się pod nim)
        tlo: '',          // tło strony dla przyklejonego paska (krytyk r3 #1: był przezroczysty)
        _dotyk: false,    // ostatni dotyk palcem (na dotyku nie gasimy podświetlenia po stuknięciu)
        _klikPo: null,    // zdanie PL kliknięte w chwili, gdy poprzednie zatwierdzało edycję
        _wybranyNaTelefonie: null,  // telefon: pierwsze stuknięcie pokazuje odpowiedniki, drugie edytuje
        _klikXY: null,
        _klik: null,              // 13.10.2026 (gesty jak w Docs): zdanie i miejsce ostatniego mousedown (naMousedown)
        _wejscieKliku: null,      // … i edycja czekająca na klik po przebudowie wierszy PL
        _cichyFokus: false,
        tabIdx: { orig: 0, en: 0, pl: 0 },   // zdanie z przystankiem Tab w każdej kolumnie       // fokus ustawiany przez nas (Cofnij): bez wyrównywania kolumn
        _zaznaczonyPl: null,      // tekst zaznaczenia z „Zaznacz PL” (kopiujemy wtedy skrypt, nie układ kolumny)
        _przewin: false,
        aiSek: 0,
        modelAi: null,            // domyślny model Claude (cena na przycisku AI)                 // sekundy trwającego dopasowania AI (na przycisku)
        _genAi: 0,                // numer opłaconej mapy AI (rośnie przy każdym dopasowaniu)
        szeroki: true,
        dotyk: false,             // główny wskaźnik to palec (tablet, telefon)
        chipAktywny: null,        // {kol, en, idx}: żeton pod kursorem (podświetla swoje zdania w trybie wiązania)
        liniaWiecej: false,       // linia stanu ma dalszą część za prawą krawędzią
        liniaWLewo: false,        // … i za lewą (przewinięta)
        revision: 0,      // bump = re-mount contenteditable po programowej zmianie plS
        editingPlIdx: null,  // 1.1.216: TYLKO to zdanie jest contenteditable; reszta
                             // jest zwyklym tekstem, dzieki czemu zaznaczenie idzie
                             // przez cala kolumne (przegladarka NIE laczy zaznaczenia
                             // przez kilka osobnych pol edycji - zmierzone: zakres
                             // przez 4 zdania zwijal sie do pierwszego, 22 z 88 znakow).
        // 13.10.2026 (edycja w kolumnach): oryginał i angielski też edytujesz w miejscu (zdanie po zdaniu
        // jak polski albo każda kolumna jako jeden dokument). Kroki Cofnij mają pole `kol` (brak = 'pl').
        editingOrigIdx: null, editingEnIdx: null,
        edycja: (() => { try { return localStorage.getItem('xray_edycja') === 'ciagly' ? 'ciagly' : 'zdania'; } catch (e) { return 'zdania'; } })(),
        _zaznaczonyKol: null,     // {kol, tekst}: zaznaczenie całej kolumny ORYG/EN (Cmd+A), kopiujemy wtedy tekst kolumny
        undoStack: [], redoStack: [],
        _gen: 0,          // generation counter: odrzuca spóźnione odpowiedzi AI

        init() {
            // 13.10.2026 (Ads X-Ray): tryb siedzi w zakładce; style globalne (toasty, karta operacji)
            // działają tylko przy tym trybie (klasa na <body>), a strona ma szerokość starej (1680 px).
            this._korzen = this.$el;
            document.body.classList.add('xr-skrypty-pl');
            const glownaEl = document.getElementById('main-content');
            if (glownaEl) glownaEl.classList.add('xr-sc-szeroki');
            // 14.10.2026 (historia Ads X-Ray): zapis i wczytanie porównania z historii (xray/historia.js).
            if (window.XHistoria) XHistoria.zarejestruj('skrypty-pl', {
                stan: () => this._historiaStan(),
                wczytaj: (d) => this._historiaWczytaj(d),
                zajety: () => (this.aiBusy ? oppenT('Trwa dopasowanie AI (płatne). Poczekaj na wynik, potem wczytaj wpis.') : ''),
            });
            // Krytyk r13 #3: klasa widoku na <body> (karta operacji ukryta tylko przy kolumnach).
            this.$watch('mode', (m) => document.body.classList.toggle('sc-wyniki', m === 'results'));
            this.modelAi = (window.OppenModel && OppenModel.getAnthropic()) || null;
            const naModel = () => { this.modelAi = (window.OppenModel && OppenModel.getAnthropic()) || null; };
            window.addEventListener('oppen-model-changed', naModel);
            window.addEventListener('storage', naModel);
            // Szerokość jako stan reaktywny: napisy zależne od układu (instrukcja wiązania)
            // przeliczają się po obróceniu telefonu albo zwężeniu okna.
            const mq = window.matchMedia('(min-width: 1024px)');
            this.szeroki = mq.matches;
            const naZmiane = () => { this.szeroki = mq.matches; };
            // Krytyk r8 #3: tablet w poziomie ma ≥1024 px, ale nie ma Shift: słowa i przełącznik wg dotyku.
            const mqDotyk = window.matchMedia('(pointer: coarse)');
            this.dotyk = mqDotyk.matches;
            if (mqDotyk.addEventListener) mqDotyk.addEventListener('change', () => { this.dotyk = mqDotyk.matches; });
            if (mq.addEventListener) mq.addEventListener('change', naZmiane); else if (mq.addListener) mq.addListener(naZmiane);
            // Draft z localStorage (try/catch: prywatny tryb itp.)
            try {
                const d = JSON.parse(localStorage.getItem('xray_scriptcompare_texts') || 'null');
                if (d) { this.origText = d.orig || ''; this.enText = d.en || ''; this.plText = d.pl || ''; }
                const m = d && d.mapa;
                if (m && m.baza && Array.isArray(m.baza.en)) {
                    this._baza = { en: m.baza.en, pl: m.baza.pl || [], orig: m.baza.orig || [] };
                    this.anchorsPl = Array.isArray(m.kotwicePl) ? m.kotwicePl : [];
                    this.anchorsOrig = Array.isArray(m.kotwiceOrig) ? m.kotwiceOrig : [];
                    this.aiPlToEn = Array.isArray(m.aiPl) ? m.aiPl : null;
                    this.aiOrigToEn = Array.isArray(m.aiOrig) ? m.aiOrig : null;
                    this.aiBrakPl = Array.isArray(m.brakPl) ? m.brakPl : [];
                    this.aiBrakOrig = Array.isArray(m.brakOrig) ? m.brakOrig : [];
                    this._schowki = (m.schowki && typeof m.schowki === 'object') ? m.schowki : {};   // krytyk r17 #1
                    if (m.pamiecAi && m.pamiecAi.pl) this._aiPamiec = { pl: m.pamiecAi.pl || {}, orig: m.pamiecAi.orig || {},
                                                                         en: Array.isArray(m.pamiecAi.en) ? m.pamiecAi.en : undefined };
                } else if (d && d.anchors && d.anchors.fp === this._textsFp()) {
                    // Draft sprzed 11.10.2026: kotwice ważne dla dokładnie tych tekstów.
                    this.anchorsPl = Array.isArray(d.anchors.pl) ? d.anchors.pl : [];
                    this.anchorsOrig = Array.isArray(d.anchors.orig) ? d.anchors.orig : [];
                    this._baza = { en: this._zdaniaKolumny(this.enText), pl: this.splitSentences(this.plText),
                                   orig: this._zdaniaKolumny(this.origText) };
                }
                this.autoScroll = localStorage.getItem('xray_scriptcompare_autoscroll') !== '0';
                // Krytyk r1 #10: po odświeżeniu wracamy do porównania, jeśli tam byłeś.
                if (d && d.tryb === 'results' && this.enText.trim() && (this.plText.trim() || this.origText.trim())) {
                    // Krytyk r7 #6: powrót z innej strony (scrollY 0) układa widok jak po „Porównaj”.
                    this.$nextTick(() => this.enterCompare({ przywrocenie: true }));
                }
            } catch (e) {}
            this.$watch('origText', () => this._saveDraft());
            this.$watch('enText', () => this._saveDraft());
            this.$watch('plText', () => this._saveDraft());
            // 1.1.211 (audyt): debounce 400 ms gubił ostatnią kotwicę/edycję przy wyjściu
            // ze strony (← Hub, zamknięcie karty): flush przy pagehide.
            // Krytyk r6 #5: zdanie w trakcie edycji (bez Enter) zatwierdzamy przed zapisem wersji roboczej.
            const zapiszWszystko = () => {
                const a = document.activeElement;
                // Krytyk r14 #1 (bloker, dane): zatwierdzenie bez wyjścia z edycji zostawiało w wierszu
                // stary podział, a następne zdarzenie (powrót do karty, Enter, odświeżenie) zatwierdzało
                // ten sam dopisek drugi raz. Teraz to zwykłe opuszczenie wiersza: jedno zatwierdzenie
                // (handler @blur) i koniec edycji, więc kolejne wywołanie nie ma już czego zapisać.
                if (this.editingPlIdx !== null && a && a.isContentEditable && a.hasAttribute('data-pl-idx')) {
                    try { a.blur(); } catch (e) {}
                }
                this._zatwierdzWszystko();   // 13.10.2026 (edycja w kolumnach): też oryginał, angielski i „Ciągły tekst”
                if (this._zmiany) { clearTimeout(this._draftT); this._writeDraft(); }   // krytyk r16 #2: tylko własne zmiany
            };
            window.addEventListener('storage', (e) => {
                if (e.key !== 'xray_scriptcompare_texts' || e.newValue === this._mojZapis) return;
                this._nieaktualna = true;
                this._ostrzezNieaktualna();
            });
            window.addEventListener('pagehide', zapiszWszystko);
            // 13.10.2026 (gesty jak w Docs): klik w zdanie PL w chwili zapisu poprzedniego (przebudowa wierszy).
            document.addEventListener('mouseup', () => { if (this._wejscieKliku) this._wejdzPoKliku(); }, true);
            // Krytyk r8 #7: wyjście w trakcie płatnego dopasowania = zapłacone i niewidoczne: pytamy.
            if (window.appPilnujWyjscia) appPilnujWyjscia(() => this.aiBusy);
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') zapiszWszystko(); });
            this._efektyCiagle();
        },
        _saveDraft() {
            this._zmiany = true;
            clearTimeout(this._draftT);
            this._draftT = setTimeout(() => this._writeDraft(), 400);
        },
        _writeDraft() {
            // Krytyk r16 #2: karta, w której skrypt zmieniono gdzie indziej, nie nadpisuje nowszej wersji.
            if (this._nieaktualna) { this._ostrzezNieaktualna(); return; }
            this._zmiany = false;
            try {
                localStorage.setItem('xray_scriptcompare_texts',
                    JSON.stringify({ orig: this.origText, en: this.enText, pl: this.plText, tryb: this.mode,
                                     mapa: { baza: this._baza, kotwicePl: this.anchorsPl, kotwiceOrig: this.anchorsOrig,
                                             aiPl: this.aiPlToEn, aiOrig: this.aiOrigToEn, pamiecAi: this._aiPamiec, schowki: this._schowki || {},
                                             brakPl: this.aiBrakPl, brakOrig: this.aiBrakOrig } }));
                this._mojZapis = localStorage.getItem('xray_scriptcompare_texts');
            } catch (e) {}
        },
        _zapiszAutoScroll() {
            try { localStorage.setItem('xray_scriptcompare_autoscroll', this.autoScroll ? '1' : '0'); } catch (e) {}
        },
        // ── Historia (14.10.2026, historia Ads X-Ray): ta sama struktura co wersja robocza w localStorage
        //    'xray_scriptcompare_texts' (teksty, widok, opłacone mapy AI, powiązania) plus przełączniki
        //    widoku. Wczytanie odtwarza porównanie dokładnie, BEZ wywołania AI (mapy są w danych). ──
        _historiaStan() {
            this._zatwierdzWszystko();
            const kopia = (v) => JSON.parse(JSON.stringify(v === undefined ? null : v));
            return { orig: this.origText, en: this.enText, pl: this.plText, tryb: this.mode,
                     mapa: kopia({ baza: this._baza, kotwicePl: this.anchorsPl, kotwiceOrig: this.anchorsOrig,
                                   aiPl: this.aiPlToEn, aiOrig: this.aiOrigToEn, pamiecAi: this._aiPamiec, schowki: this._schowki || {},
                                   brakPl: this.aiBrakPl, brakOrig: this.aiBrakOrig }),
                     przelaczniki: { dzielenie: this.dzielenie, edycja: this.edycja, autoScroll: !!this.autoScroll } };
        },
        async _historiaWczytaj(d) {
            const dane = (d && typeof d === 'object') ? d : {};
            const tekst = (v) => (typeof v === 'string' ? v : '');
            const lista = (v) => (Array.isArray(v) ? v : []);
            this._zatwierdzWszystko();
            if (this.mode === 'results') {
                // Wyniki budujemy od zera (x-if): stare wiersze i edycje w toku nie przechodzą do wpisu.
                document.documentElement.classList.remove('sc-wiazanie');
                if (this._obserwator) { this._obserwator.disconnect(); this._obserwator = null; this._obserwowany = null; }
                this.mode = 'edit';
                await this.$nextTick();
            }
            this._gen++;   // odpowiedź AI w locie dotyczy poprzedniego porównania
            const p = (dane.przelaczniki && typeof dane.przelaczniki === 'object') ? dane.przelaczniki : {};
            this.dzielenie = p.dzielenie === 'linie' ? 'linie' : 'auto';
            this.edycja = p.edycja === 'ciagly' ? 'ciagly' : 'zdania';
            if (typeof p.autoScroll === 'boolean') this.autoScroll = p.autoScroll;
            try {
                localStorage.setItem('xray_dzielenie', this.dzielenie);
                localStorage.setItem('xray_edycja', this.edycja);
            } catch (e) {}
            this._zapiszAutoScroll();
            this.origText = tekst(dane.orig); this.enText = tekst(dane.en); this.plText = tekst(dane.pl);
            this.anchorsPl = []; this.anchorsOrig = []; this._baza = null;
            this.aiPlToEn = null; this.aiOrigToEn = null; this.aiBrakPl = []; this.aiBrakOrig = [];
            this._aiPamiec = { pl: {}, orig: {} }; this._schowki = {};
            const m = dane.mapa;
            if (m && m.baza && Array.isArray(m.baza.en)) {
                this._baza = { en: m.baza.en, pl: lista(m.baza.pl), orig: lista(m.baza.orig) };
                this.anchorsPl = lista(m.kotwicePl); this.anchorsOrig = lista(m.kotwiceOrig);
                this.aiPlToEn = Array.isArray(m.aiPl) ? m.aiPl : null;
                this.aiOrigToEn = Array.isArray(m.aiOrig) ? m.aiOrig : null;
                this.aiBrakPl = lista(m.brakPl); this.aiBrakOrig = lista(m.brakOrig);
                this._schowki = (m.schowki && typeof m.schowki === 'object') ? m.schowki : {};
                if (m.pamiecAi && m.pamiecAi.pl) this._aiPamiec = { pl: m.pamiecAi.pl || {}, orig: m.pamiecAi.orig || {},
                                                                     en: Array.isArray(m.pamiecAi.en) ? m.pamiecAi.en : undefined };
            }
            this.linkMode = false; this.linkWybrane = null;
            this.undoStack = []; this.redoStack = [];
            this.aktywne = { en: null, pl: null, orig: null };
            this._nieaktualna = false;   // jawne wczytanie: ta karta ma teraz aktualną wersję roboczą
            if (dane.tryb === 'results' && this.enText.trim() && (this.plText.trim() || this.origText.trim())) {
                this.enterCompare({ przywrocenie: true });
            }
            clearTimeout(this._draftT);
            this._writeDraft();
        },
        // ── Splitter zdań: 13.10.2026 (Ads X-Ray) jeden silnik /static/xray/zdania.js (window.XZdania),
        //    wspólny dla wszystkich trybów. Cienkie metody o starych nazwach: reszta kodu bez zmian.
        //    XZdania.podziel == stare splitSentences (== serwerowe _split_sentences_for_alignment). ──
        _Z() {
            const Z = (typeof window !== 'undefined' && window.XZdania) || null;
            if (!Z) throw new Error('Brak silnika zdań /static/xray/zdania.js (window.XZdania)');
            return Z;
        },
        splitSentencesByLines(paragraph) { return this._Z().podzielAkapit(paragraph); },
        _splitSentencesRegex(paragraph) { return this._Z().podzielRegex(paragraph); },
        _mergeBarePunct(list) { return this._Z().scalGolaInterpunkcje(list); },
        splitSentences(text) { return this._Z().podziel(text); },
        // Oryginał i angielski (tylko do czytania): w trybie 'auto' linie z kilkoma zdaniami dzielone jak „Podziel na zdania”.
        _zdaniaKolumny(text) { return this.splitSentences(this.dzielenie === 'auto' ? this._podzielTekst(text) : text); },
        ustawDzielenie(t) {
            const nowy = t === 'linie' ? 'linie' : 'auto';
            if (nowy === this.dzielenie) return;
            this._zatwierdzWszystko();   // 13.10.2026 (edycja w kolumnach): niezapisana edycja w kolumnie najpierw
            this.dzielenie = nowy;
            try { localStorage.setItem('xray_dzielenie', nowy); } catch (e) {}
            if (this.mode === 'results') this.enterCompare({ bezPrzewijania: true });
        },

        // ── Fazy ──
        enterCompare(opcje) {
            const nowe = { orig: this._zdaniaKolumny(this.origText), en: this._zdaniaKolumny(this.enText),
                           pl: this.splitSentences(this.plText) };
            // Krytyk r4 #1: kroki Cofnij odnoszą się do tekstów sprzed edycji w polach; po zmianie
            // tekstów cofnięcie skasowałoby to, co dopisano w polu. Historia zaczyna się od nowa.
            const b = this._baza;
            if (!b || JSON.stringify([b.en, b.pl, b.orig]) !== JSON.stringify([nowe.en, nowe.pl, nowe.orig])) {
                this.undoStack = []; this.redoStack = [];
            }
            this._przeniesNa(nowe);
            this.origS = nowe.orig; this.enS = nowe.en; this.plS = nowe.pl;
            // 13.10.2026: wiersze PL wpisują tekst raz (x-init, bez reaktywnego x-text: pole edycji). Bez przebudowy
            // po „Podziel na zdania” albo nowym tekście w polu stare wiersze pokazywały stary podział, a wyjście
            // z takiego wiersza zapisywało stary tekst w miejsce nowego zdania.
            this.revision++;
            this._baza = { orig: [...nowe.orig], en: [...nowe.en], pl: [...nowe.pl] };
            this.linkWybrane = null;
            this.aktywne = { en: null, pl: null, orig: null };
            this._przelicz();
            if (!(opcje && opcje.przywrocenie)) this._saveDraft();   // przywrócenie po wczytaniu to nie zmiana
            // Krytyk r5 #1: układ ustawia x-init widoku wyników (po jego wyrenderowaniu), bo
            // po odświeżeniu strony $nextTick stąd przychodził, zanim x-if zbudował kolumny.
            this._przewin = (opcje && opcje.przywrocenie) ? 'od-razu' : !(opcje && opcje.bezPrzewijania);
            this._ulozoneOd = null;
            this.mode = 'results';
            this.$nextTick(() => { if (window._appCostEnhance) window._appCostEnhance(); });
        },
        // Krytyk r1 #8: kolumny mają wysokość ekranu pod przyklejonym nagłówkiem strony, a po
        // „Porównaj” strona przewija się do paska nad kolumnami.
        // Krytyk r5 #1: elementy wyników szukamy w DOM, nie przez magiczne referencje Alpine.
        // Po wejściu z dolnego „Porównaj” (przycisk znika razem z x-if) albo po odświeżeniu
        // Alpine trzymał ich pustą kopię i układ (wysokość, przyklejenie, tło paska) nie ruszał.
        _el(nazwa) {
            return this._q({ sekcja: '[data-sc-sekcja]', pasek: '[data-sc-pasek]', panePl: '[data-sc-pane="pl"]' }[nazwa]);
        },
        // 13.10.2026 (Ads X-Ray): szukamy w korzeniu trybu, nie w całym dokumencie.
        _q(sel) { return (this._korzen || document).querySelector(sel); },
        _ustawWysokosc(przewin) {
            const sekcja = this._el('sekcja');
            if (!sekcja) return;
            const pasekEl = this._el('pasek');
            if (window.ResizeObserver && pasekEl && this._obserwowany !== pasekEl) {
                // Krytyk r4 #3: pasek zmienia wysokość (zawija się po AI, okno), kolumny idą za nim.
                if (this._obserwator) this._obserwator.disconnect();
                this._obserwator = new ResizeObserver(() => this._ustawWysokosc(false));
                this._obserwator.observe(pasekEl);
                this._obserwowany = pasekEl;
            }
            const linia = this._linia();
            if (window.MutationObserver && linia && this._obserwowanaLinia !== linia) {
                // Krytyk r11 #3: treść linii zmienia się także po zakończeniu AI (napis przycisku, stan).
                if (this._obsLinii) this._obsLinii.disconnect();
                this._obsLinii = new MutationObserver(() => this.$nextTick(() => this._sprawdzLinie()));
                this._obsLinii.observe(linia, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style', 'class'] });
                this._obserwowanaLinia = linia;
            }
            if (!this._naOkno) {
                this._naOkno = () => { if (this.mode === 'results') this._ustawWysokosc(false); };
                window.addEventListener('resize', this._naOkno);
                // Tło paska liczone w trakcie przejścia kolorów motywu (body: transition-colors)
                // wychodziło pośrednie; po końcu przejścia (też przy zmianie motywu) liczymy znowu.
                // Krytyk r6 #1: tylko przejście samej strony (body/html), nie podświetlenia wierszy.
                document.body.addEventListener('transitionend', (e) => {
                    if (e.target === document.body || e.target === document.documentElement) this._naOkno();
                });
            }
            let gora = 0;
            document.querySelectorAll('header, nav, [data-naglowek-strony]').forEach(e => {
                const st = getComputedStyle(e);
                if ((st.position === 'sticky' || st.position === 'fixed') && e.getBoundingClientRect().top <= 0) {
                    gora = Math.max(gora, e.getBoundingClientRect().bottom);
                }
            });
            // 13.10.2026 (Ads X-Ray): przyklejony pasek zakładek (jeśli jest) stoi nad paskiem wyników.
            // Liczymy miejsce, w którym się przykleja (jego top z CSS), nie bieżącą pozycję: przed
            // przewinięciem strony jeszcze nie wisi u góry.
            document.querySelectorAll('[data-xray-zakladki]').forEach(e => {
                const st = getComputedStyle(e), r = e.getBoundingClientRect();
                if (!r.height) return;
                if (st.position === 'sticky') gora = Math.max(gora, (parseFloat(st.top) || 0) + r.height);
                else if (st.position === 'fixed' && r.top <= gora + 1) gora = Math.max(gora, r.bottom);
            });
            this.gora = Math.round(gora);
            const pasek = pasekEl;
            // Tło paska = tło strony (body albo html); przezroczyste = biel / ciemny jak motyw.
            const przezr = (c) => !c || c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c);
            let tlo = getComputedStyle(document.body).backgroundColor;
            if (przezr(tlo)) tlo = getComputedStyle(document.documentElement).backgroundColor;
            if (przezr(tlo)) tlo = document.documentElement.classList.contains('dark') ? '#09090b' : '#ffffff';
            this.tlo = tlo;
            if (pasek && this._obokSiebie()) gora += pasek.getBoundingClientRect().height;
            sekcja.style.setProperty('--sc-gora', Math.round(gora + 8) + 'px');
            // Kolumny zaczynają za górnym dobiegiem (miejsce na wyrównanie pierwszych zdań).
            // Krytyk r6 #1: TYLKO przy pierwszym ułożeniu kolumny; później przeliczenie (zmiana
            // okna, paska) nie przewija kolumn spod kursora użytkownika.
            ['orig', 'en', 'pl'].forEach(k => {
                const pane = this._pane(k), d = pane && pane.querySelector('.sc-dobieg-gora');
                if (!pane || !d || pane.dataset.scStart) return;
                if (d.offsetHeight) { pane.scrollTop = d.offsetHeight; pane.dataset.scStart = '1'; }
            });
            // Krytyk r6 #2: strona przewija się najdalej do miejsca, w którym pasek siedzi tuż nad
            // kolumnami (dolny zapas dopasowany), więc pasek nie przykrywa nagłówków kolumn.
            const dol = this._q('.sc-dol');
            if (dol) {
                if (pasek && this._obokSiebie()) {
                    const cel = window.scrollY + sekcja.getBoundingClientRect().top - pasek.getBoundingClientRect().height - this.gora;
                    const maks = document.documentElement.scrollHeight - window.innerHeight;
                    dol.style.height = Math.max(0, Math.round(dol.offsetHeight + cel - maks)) + 'px';
                } else dol.style.height = '';
            }
            this._sprawdzLinie();
            // Krytyk r20 #6: toasty przy lewej krawędzi TREŚCI (w układzie z panelem bocznym nie na menu).
            const glowna = document.getElementById('main-content');
            if (glowna) document.documentElement.style.setProperty('--sc-toast-lewo', Math.round(glowna.getBoundingClientRect().left + 20) + 'px');
            if (przewin) this._przewin = false;
            if (!this._ulozoneOd) this._ulozoneOd = performance.now() + (przewin ? 700 : 150);
            if (przewin && pasek) {
                const y = window.scrollY + pasek.getBoundingClientRect().top - this.gora;
                window.scrollTo({ top: Math.max(0, y), behavior: przewin === 'od-razu' ? 'auto' : 'smooth' });
                // Po powrocie na stronę układ dociąga się jeszcze chwilę (baner, czcionki): jedna poprawka.
                if (przewin === 'od-razu') setTimeout(() => {
                    const p = this._el('pasek');
                    if (p && this._obokSiebie() && Math.abs(p.getBoundingClientRect().top - this.gora) > 2) {
                        window.scrollTo({ top: Math.max(0, window.scrollY + p.getBoundingClientRect().top - this.gora), behavior: 'auto' });
                    }
                }, 400);
            }
        },
        // Krytyk r1 #9: Escape wychodzi z wiązania i z edycji zdania.
        _oknoOtwarte() {
            return [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].some(d => d.getClientRects().length);
        },
        naEscape(e) {
            if ((e && e.defaultPrevented) || this._oknoOtwarte()) return;   // krytyk r5 #5: Escape zamyka okno, nie stronę
            if (e && (e.isComposing || e.keyCode === 229)) return;   // Esc przerywa składanie znaku (IME), nie edycję
            if (this.linkMode) { this.toggleLinkMode(); return; }
            const a = document.activeElement;
            // 13.10.2026 (edycja w kolumnach): w „Ciągłym tekście” Esc zatwierdza wpisane i wychodzi z kolumny
            // (nie ma „zdania w edycji” do porzucenia, a cofnięcie to Cmd+Z).
            if (a && a.hasAttribute && a.hasAttribute('data-sc-ciagly')) { a.blur(); return; }
            for (const kol of ['orig', 'en', 'pl']) {
                const idx = this._edytowany(kol);
                if (idx === null || !a || !a.isContentEditable || !a.hasAttribute('data-' + kol + '-idx')) continue;
                a.textContent = this._zdaniaKol(kol)[idx] || '';   // krytyk r2 #13: Esc = rezygnacja
                a.blur();
                this.$nextTick(() => {   // krytyk r5 #9: jak po Enter, fokus zostaje na zdaniu
                    const w = this._wiersz(kol, idx);
                    if (w) w.focus({ preventScroll: true });
                });
                return;
            }
        },
        // Enter w zdaniu: zatwierdza edycję; poza edycją ją zaczyna (kursor na końcu).
        // 13.10.2026 (edycja w kolumnach): w każdej kolumnie (naEnterPl zostaje dla polskiej).
        naEnterPl(idx, ev) { return this.naEnter('pl', idx, ev); },
        naEnter(kol, idx, ev) {
            if (this.linkMode) { this.kliknijWLinku(kol, idx, ev.shiftKey); return; }
            const el = ev.currentTarget;
            if (this._edytowany(kol) === idx) {
                el.blur();
                // Krytyk r4 #14: fokus zostaje na tym zdaniu (Tab idzie dalej, nie od góry strony).
                this.$nextTick(() => {
                    const nowy = this._wiersz(kol, idx);
                    if (nowy) nowy.focus({ preventScroll: true });
                });
                return;
            }
            // 13.10.2026 (gesty jak w Docs): kursor na końcu od razu (nie w $nextTick: litery wpisane tuż po Enter ginęły).
            this._edytujZdanie(kol, idx, 'koniec', true);
        },
        backToEdit() {
            this._zatwierdzWszystko();   // 13.10.2026 (edycja w kolumnach): niezapisana edycja w kolumnie najpierw
            document.documentElement.classList.remove('sc-wiazanie');
            if (this._obserwator) { this._obserwator.disconnect(); this._obserwator = null; this._obserwowany = null; }
            // 1.1.211 (audyt): tryb wiązania NIE przeżywa powrotu do edycji: wybrane
            // zdanie wskazywałoby na tekst, którego po zmianie może już nie być.
            this.mode = 'edit'; this.aktywne = { en: null, pl: null, orig: null };
            this.linkMode = false; this.linkWybrane = null;
            this._saveDraft();   // tryb widoku też jest stanem do zapisania (odświeżenie wraca na ekran tekstów)
        },
        async clearAll() {
            const any = (this.origText + this.enText + this.plText).trim();
            // Krytyk r12 #3: wynik płatnego dopasowania w toku przepadnie razem z tekstami: mówimy to wprost.
            const tekstPytania = this.aiBusy
                ? oppenT('Wyczyścić wszystkie trzy panele? Wersja robocza przepadnie, a wynik dopasowania AI, które właśnie trwa (płatne), zostanie odrzucony.')
                : oppenT('Wyczyścić wszystkie trzy panele? Wersja robocza przepadnie.');
            if (any && !await appConfirm(tekstPytania, oppenT('Wyczyść wszystko'),
                                         { variant: 'danger', confirmLabel: oppenT('Wyczyść') })) return;
            this.origText = this.enText = this.plText = '';
            this.aiPlToEn = this.aiOrigToEn = null;
            this.aiBrakPl = []; this.aiBrakOrig = [];
            this._aiPamiec = { pl: {}, orig: {} };
            this._schowki = {};
            this._gen++;   // odpowiedź AI w locie dotyczy tekstów, których już nie ma
            // 1.1.211 (audyt): powiązania to te same indeksy zdań co mapa AI: czyszczenie
            // paneli zabiera je razem z tekstami (inaczej wisiały w pamięci i drafcie).
            this.anchorsPl = []; this.anchorsOrig = []; this._baza = null;
            this.linkMode = false; this.linkWybrane = null;
            this.undoStack = []; this.redoStack = [];
            if (window.XHistoria) XHistoria.zapomnij('skrypty-pl');   // 14.10.2026 (historia Ads X-Ray): nowe porównanie, nie aktualizacja wpisu
        },
        get countMismatch() {
            return (this.plS.length && this.plS.length !== this.enS.length)
                || (this.origS.length && this.origS.length !== this.enS.length);
        },

        // ── Dopasowanie (silnik /static/zdania-mapa.js) ──
        _textsFp() { return JSON.stringify([this.enText, this.plText, this.origText]); },
        _przeniesAi(ai, mX, mE, n, enZmienione) {
            // Mapa AI po edycji: wiersz idzie za swoim zdaniem, wartość (indeks EN) też.
            // Zdanie nowe albo EN, które zniknęło = -1 (brak informacji, NIE „dodatek”).
            if (!ai) return null;
            // Po zmianie angielskiego „AI: brak odpowiednika” może już nie być prawdą
            // (np. dopisane brakujące zdanie EN), więc schodzi do „nie wiadomo”.
            const out = new Array(n).fill(-1);
            ai.forEach((v, i) => {
                const ni = mX[i];
                if (ni === null || ni === undefined || ni >= n) return;
                if (v === null) out[ni] = enZmienione ? -1 : null;
                // Krytyk r14 #7: para EN zniknęła (zmiana tekstu EN): -2, żeby nie liczyć zdania jako „nowe po AI”.
                else if (v >= 0) { const ne = mE ? mE[v] : v; out[ni] = (ne === null || ne === undefined) ? -2 : ne; }
            });
            return out.some(v => v !== -1 && v !== -2) ? out : null;
        },
        // Krytyk r17 #3: angielski „zmieniony” w sensie werdyktów AI = zdanie dodane albo usunięte.
        // Przeredagowane w miejscu (literówka, kropka na wykrzyknik) to to samo zdanie, które widziało AI.
        _enZmienione(stare, nowe, mE) {
            const obraz = new Set(stare.map((_, i) => mE[i]).filter(v => v !== null && v !== undefined));
            return obraz.size !== stare.length || obraz.size !== nowe.length;
        },
        // Pamięć AI idzie za przeredagowanym angielskim: tekst zdania EN w pamięci = jego nowa wersja.
        _przeniesPamiecEn(stareEn, noweEn, mE) {
            const n = (t) => this._norm(t), zamiana = {};
            stareEn.forEach((t, i) => { const j = mE[i]; if (j !== null && j !== undefined && n(t) !== n(noweEn[j])) zamiana[n(t)] = n(noweEn[j]); });
            if (!Object.keys(zamiana).length) return;
            const pam = this._aiPamiec;
            if (Array.isArray(pam.en)) pam.en = pam.en.map(t => zamiana[t] || t);
            for (const kol of ['pl', 'orig']) {
                const p = pam[kol] || {};
                for (const k of Object.keys(p)) if (p[k] !== null && zamiana[p[k]]) p[k] = zamiana[p[k]];
            }
        },
        // 13.10.2026 (edycja w kolumnach): opcje.wMiejscu = edycja w porównaniu (zdanie przeredagowane w miejscu
        // zostaje tym samym zdaniem, jak w _applyPl), opcje.cicho = Cofnij/Ponów (bez komunikatu o powiązaniach).
        _przeniesNa(nowe, opcje) {
            const b = this._baza;
            if (!b) {
                this.anchorsPl = []; this.anchorsOrig = []; this.aiPlToEn = null; this.aiOrigToEn = null;
                return;
            }
            const Z = window.ZdaniaMapa;
            const ok = (v) => v !== null && v !== undefined;
            const wMiejscu = !!(opcje && opcje.wMiejscu);
            let mE = Z.przemapuj(b.en || [], nowe.en);
            if (wMiejscu) mE = this._wMiejscu(mE, nowe.en.length);
            const enZm = this._enZmienione(b.en || [], nowe.en, mE);
            this._przeniesPamiecEn(b.en || [], nowe.en, mE);
            this._schowki = this._schowki || {};
            let zgubione = 0;
            // Krytyk r15 #4, r16 #1: porównanie bez polskiego albo bez oryginału nie wyrzuca opłaconej
            // mapy AI tej kolumny: chowamy ją i oddajemy, gdy tekst wróci (dopasowanie zdań do zdań
            // sprzed schowania, indeksy EN przez angielski z chwili schowania).
            for (const c of [{ kol: 'pl', ai: 'aiPlToEn', brak: 'aiBrakPl', kot: 'anchorsPl' },
                             { kol: 'orig', ai: 'aiOrigToEn', brak: 'aiBrakOrig', kot: 'anchorsOrig' }]) {
                const stare = b[c.kol] || [], nowa = nowe[c.kol];
                if (!nowa.length && stare.length && this[c.ai]) {
                    this._schowki[c.kol] = { zdania: stare, ai: this[c.ai], brak: this[c.brak], kotwice: this[c.kot], en: b.en };
                    this[c.ai] = null; this[c.brak] = []; this[c.kot] = [];
                    continue;
                }
                let zrodlo = stare, mEk = mE, enZmK = enZm;
                const sch = this._schowki[c.kol];
                if (nowa.length && !stare.length && sch) {
                    this._schowki[c.kol] = null;
                    zrodlo = sch.zdania;
                    mEk = Z.przemapuj(sch.en || [], nowe.en);
                    enZmK = this._enZmienione(sch.en || [], nowe.en, mEk);
                    this[c.ai] = sch.ai; this[c.brak] = sch.brak || []; this[c.kot] = sch.kotwice || [];
                }
                let mX = Z.przemapuj(zrodlo, nowa);
                if (wMiejscu && zrodlo === stare) mX = this._wMiejscu(mX, nowa.length);
                const przedK = this[c.kot].length;
                this[c.kot] = this[c.kot].map(a => ({ en: mEk[a.en], [c.kol]: mX[a[c.kol]] })).filter(a => ok(a.en) && ok(a[c.kol]));
                zgubione += przedK - this[c.kot].length;
                this[c.ai] = this._przeniesAi(this[c.ai], mX, mEk, nowa.length, enZmK);
                this[c.brak] = this[c.ai] ? (this[c.brak] || []).map(e => mEk[e]).filter(e => typeof e === 'number' && e >= 0) : [];
            }
            this.enS = nowe.en; this.plS = nowe.pl; this.origS = nowe.orig;
            this._uzupelnijAi();
            if (zgubione > 0 && !(opcje && opcje.cicho)) (window.appToast && appToast(oppenTf('Usunięto powiązania ({0}): ich zdanie zniknęło po edycji.', [zgubione])));
        },
        _przelicz() {
            const Z = window.ZdaniaMapa;
            if (!Z) return;
            this.mapaPl = this.plS.length ? Object.freeze(Z.dopasuj(this.enS, this.plS,
                { kotwice: this.anchorsPl.map(a => ({ en: a.en, x: a.pl })), ai: this.aiPlToEn, brakEn: this._brakEnPl() })) : null;
            this.$nextTick(() => this._sprawdzLinie());   // krytyk r9 #3: linia mogła urosnąć bez przewinięcia
            const wskO = new Set((this.aiOrigToEn || []).filter(v => typeof v === 'number' && v >= 0));
            this.mapaOrig = this.origS.length ? Object.freeze(Z.dopasuj(this.enS, this.origS,
                { kotwice: this.anchorsOrig.map(a => ({ en: a.en, x: a.orig })), ai: this.aiOrigToEn,
                  brakEn: this.aiOrigToEn ? this.aiBrakOrig.filter(e => !wskO.has(e)) : [] })) : null;
        },
        // Krytyk r5 #3: zdania EN, których polską parę (wg AI) usunięto: AI wskazało to zdanie EN
        // dla polskiego zdania, którego już nie ma, i żaden obecny wiersz go nie wskazuje.
        // Bez tego silnik doklejał osierocone zdanie EN do poprzedniej grupy (2-1).
        _brakEnPl() {
            const ai = this.aiPlToEn, pam = this._aiPamiec.pl || {};
            if (!ai) return [];
            const obecne = new Set(this.plS.map(t => this._norm(t)));
            const wskazane = new Set(ai.filter(v => typeof v === 'number' && v >= 0));
            const usuniete = new Set(), zywe = new Set();
            for (const [pl, en] of Object.entries(pam)) {
                if (en === null) continue;
                (obecne.has(pl) ? zywe : usuniete).add(en);
            }
            // Krytyk r10 #1: nowe polskie zdanie (AI go nie oceniało: -1) stojące w luce między
            // sąsiadami wskazującymi EN p i n może być dopisanym brakującym zdaniem. Zdań EN
            // z tej luki nie oznaczamy już jako brakujących; parę ustala długość zdań.
            const wLuce = new Set();
            let poprz = -1;
            for (let i = 0; i < ai.length; i++) {
                if (ai[i] !== -1 && ai[i] !== -2 && ai[i] !== undefined) { if (typeof ai[i] === 'number') poprz = ai[i]; continue; }
                let nast = this.enS.length;
                for (let k = i + 1; k < ai.length; k++) if (typeof ai[k] === 'number' && ai[k] >= 0) { nast = ai[k]; break; }
                for (let j = poprz + 1; j < nast; j++) wLuce.add(j);
            }
            const out = [];
            this.enS.forEach((t, j) => {
                const k = this._norm(t);
                // 12.10.2026: także zdania, których brak w polskiej wersji podało samo AI.
                if (!wskazane.has(j) && !wLuce.has(j) && ((usuniete.has(k) && !zywe.has(k)) || this.aiBrakPl.includes(j))) out.push(j);
            });
            return out;
        },
        _pacingDeltaKrotko() { const d = this._pacingDelta(); return (d > 0 ? '+' : '') + d + '%'; },
        liczbaKolumn() { return 1 + (this.origS.length ? 1 : 0) + (this.plS.length ? 1 : 0); },
        opisLiczb() {
            // Krytyk r3 #8: „Zdania: oryginał 25 · EN 25 · PL 24” zamiast sześciu żetonów z kropkami.
            const kol = [];
            if (this.origS.length) kol.push(oppenTf('oryginał {0}', [this.origS.length]));
            kol.push('EN ' + this.enS.length);
            if (this.plS.length) kol.push('PL ' + this.plS.length);
            const czesci = [oppenTf('Zdania: {0}', [kol.join(' · ')])];
            const m = this.mapaPl;
            const pominiete = m && m.pominieteEn ? this.enS.filter((_, i) => this._pominieteEn(i)).length : 0;   // krytyk r16 #4
            const dodatki = m && m.sierotyAi ? m.sierotyAi.filter(Boolean).length : 0;
            if (pominiete) czesci.push(oppenTf('brak w PL: {0}', [pominiete]));
            if (dodatki) czesci.push(oppenTf('dodatki w PL: {0}', [dodatki]));
            return czesci.join('  ·  ');
        },
        tempoKolumny(tekst) {
            const n = this._countWords(tekst);
            return n + ' ' + window.odmien(n, 'słowo', 'słowa', 'słów', 'word', 'words') + ' · ≈' + this._durationLabel(this._secondsFromWords(n));
        },
        // Krytyk r2 #7: cena z DŁUGOŚCI tych skryptów (jedno wywołanie na kolumnę: zdania EN +
        // zdania drugiej kolumny + polecenie ~700 tokenów; wyjście ~8 tokenów na zdanie). Tokeny
        // w jednostkach starego tokenizera; kalkulator przelicza je na wybrany model.
        _tokenyAi() {
            const zn = (t) => (t || '').length;
            const wezly = [];
            if (this.plS.length) wezly.push([zn(this.enText) + zn(this.plText), this.plS.length]);
            if (this.origS.length) wezly.push([zn(this.enText) + zn(this.origText), this.origS.length]);
            return wezly.reduce((acc, [z, n]) => ({ in: acc.in + z / 3.5 + 700, out: acc.out + 8 * n + 40 }), { in: 0, out: 0 });
        },
        modeleAi() {
            const t = this._tokenyAi();
            return (window.appModeleDlaTokenow && appModeleDlaTokenow(t.in, t.out, ['~3-8s', '~8-15s', '~15-30s'])) || [];
        },
        kosztAiEtykieta() {
            // Krytyk r18 #6: reaktywny model (zmiana domyślnego modelu w trakcie sesji odświeża cenę).
            const m = this.modelAi || (window.OppenModel && OppenModel.getAnthropic()) || 'claude-sonnet-5-5';
            const t = this._tokenyAi();
            const usd = window.appKosztTokenow ? appKosztTokenow(m, t.in, t.out) : null;
            return usd == null ? '' : appFormatKoszt(usd);
        },
        kosztAiOpis() {
            return oppenT('Szacunkowy koszt z długości tych skryptów, dla domyślnego modelu (wybierzesz inny w oknie)');
        },
        _aiWierszy() { return (this.aiPlToEn ? this.plS.length : 0) + (this.aiOrigToEn ? this.origS.length : 0); },
        opisDopasowania() {
            const ai = !!(this.aiPlToEn || this.aiOrigToEn);
            const n = this.anchorsPl.length + this.anchorsOrig.length;
            // Krytyk r5 #10: pokrycie AI osobno dla kolumn („PL 24/24 · oryginał 25/25”).
            // Krytyk r6 #7: null (AI: dodatek) to zdanie ocenione, nie „pominięte przez AI”.
            const ile = (m) => (m || []).filter(v => v === null || (typeof v === 'number' && v >= 0)).length;
            const pokrycie = [];
            if (this.aiPlToEn) {
                const nowe = this.aiPlToEn.filter(v => v === -1 || v === undefined).length;
                const bezPary = this.aiPlToEn.filter(v => v === -2).length;
                pokrycie.push('PL ' + ile(this.aiPlToEn) + '/' + this.plS.length + (nowe ? ', ' + oppenTf('{0} nowe po AI', [nowe]) : '')
                              + (bezPary ? ', ' + oppenTf('{0} do sprawdzenia po zmianie tekstu', [bezPary]) : ''));
            }
            if (this.aiOrigToEn) {
                // Krytyk r18 #7: oryginał tłumaczy spadek pokrycia tak samo jak polski.
                const noweO = this.aiOrigToEn.filter(v => v === -1 || v === undefined).length;
                const doSpr = this.aiOrigToEn.filter(v => v === -2).length;
                pokrycie.push(oppenT('oryginał') + ' ' + ile(this.aiOrigToEn) + '/' + this.origS.length
                              + (noweO ? ', ' + oppenTf('{0} nowe po AI', [noweO]) : '')
                              + (doSpr ? ', ' + oppenTf('{0} do sprawdzenia po zmianie tekstu', [doSpr]) : ''));
            }
            let t = ai ? oppenTf('Dopasowanie: AI ({0}) i długość zdań', [pokrycie.join(' · ')])
                       : oppenT('Dopasowanie: długość zdań');
            if (n) t += ' · ' + oppenTf('powiązania: {0}', [n]);
            if ((this.mapaPl && this.mapaPl.uproszczone) || (this.mapaOrig && this.mapaOrig.uproszczone)) {
                t += ' · ' + oppenT('bardzo długi skrypt: część dopasowana proporcjonalnie, użyj powiązań');
            }
            return t;
        },
        _mapa(kol) { return kol === 'pl' ? this.mapaPl : (kol === 'orig' ? this.mapaOrig : null); },
        _dlugosc(kol) { return kol === 'pl' ? this.plS.length : (kol === 'orig' ? this.origS.length : this.enS.length); },
        // Zakres drugiej strony (PL albo ORYG) dla zakresu zdań EN [a, b].
        _zakresDlaEn(m, a, b) {
            if (!m) return null;
            let lo = Infinity, hi = -1;
            for (let e = a; e <= b; e++) {
                const g = m.grupy[m.grupaEn[e]];
                if (g && g.x1 > g.x0) { lo = Math.min(lo, g.x0); hi = Math.max(hi, g.x1 - 1); }
            }
            return hi >= 0 ? [lo, hi] : null;
        },
        // Zakres zdań EN pokryty przez grupy wierszy [x0, x1] po drugiej stronie.
        _enDlaZakresu(m, zakres) {
            if (!m || !zakres) return null;
            let lo = Infinity, hi = -1;
            for (let x = zakres[0]; x <= zakres[1]; x++) {
                const g = m.grupy[m.grupaX[x]];
                if (g && g.e1 > g.e0) { lo = Math.min(lo, g.e0); hi = Math.max(hi, g.e1 - 1); }
            }
            return hi >= 0 ? [lo, hi] : null;
        },
        // Pozycja „gdzie w narracji” dla EN e, gdy zdanie nie ma pary (do przewijania).
        _pozycjaDlaEn(m, e, n) {
            if (!m || !n) return null;
            const g = m.grupy[m.grupaEn[e]];
            const x = g ? Math.min(g.x0, n - 1) : Math.min(e, n - 1);
            return [x, x];
        },
        // Cel bez pary leży ZA ostatnim wierszem kolumny: celujemy w dół tego wiersza,
        // nie w górę (inaczej na końcu skryptu kolumna cofała się o cały wiersz).
        _zaKoncem(m, e, n) {
            if (!m || !n) return false;
            const g = m.grupy[m.grupaEn[e]];
            return !!g && g.x0 >= n;
        },
        // Odpowiedniki zdania: zakresy do podświetlenia (en/pl/orig), do przewinięcia
        // (przewin) i zakres ŹRÓDŁOWY w kolumnie pod kursorem (zrodlo): ułamek liczymy
        // na całej grupie, nie na jednym wierszu, inaczej przy zdaniu rozbitym na dwa
        // kolumna-naśladowca cofała się na granicy wierszy.
        _odpowiedniki(kol, idx) {
            const nE = this.enS.length;
            if (!nE) return null;
            let en = null, enPoz = 0, wlasny = [idx, idx];
            if (kol === 'en') {
                // Krytyk r14 #4: zdanie EN w grupie (np. 3 EN = 1 PL) pokazuje całą grupę we wszystkich kolumnach.
                let a2 = idx, b2 = idx;
                for (const k of ['pl', 'orig']) {
                    const m = this._mapa(k), g = m && m.grupy[m.grupaEn[idx]];
                    if (g && g.x1 > g.x0 && g.e1 > g.e0) { a2 = Math.min(a2, g.e0); b2 = Math.max(b2, g.e1 - 1); }
                }
                en = [a2, b2]; enPoz = idx;
            }
            else {
                const m = this._mapa(kol);
                const g = m && m.grupy[m.grupaX[idx]];
                if (!g) return null;
                if (g.e1 > g.e0) en = [g.e0, g.e1 - 1];
                enPoz = Math.min(g.e0, nE - 1);
                wlasny = [g.x0, g.x1 - 1];
                // Krytyk r17 #7: grupa w drugiej kolumnie bywa większa (3 EN = 1 PL); podświetlamy całą,
                // tak samo jak przy najechaniu na EN albo PL.
                const mi = this._mapa(kol === 'pl' ? 'orig' : 'pl');
                if (en && mi) {
                    let a2 = en[0], b2 = en[1];
                    for (let e = en[0]; e <= en[1]; e++) {
                        const g2 = mi.grupy[mi.grupaEn[e]];
                        if (g2 && g2.x1 > g2.x0 && g2.e1 > g2.e0) { a2 = Math.min(a2, g2.e0); b2 = Math.max(b2, g2.e1 - 1); }
                    }
                    if (a2 !== en[0] || b2 !== en[1]) { en = [a2, b2]; wlasny = this._zakresDlaEn(m, a2, b2) || wlasny; }
                }
            }
            const [a, b] = en || [enPoz, enPoz];
            // punkt[k]: cel bez pary, przewijamy do GÓRY wiersza „gdzie w narracji”,
            // a nie do całego wiersza (inaczej kolumna cofała się o wiersz na dodatku).
            let enZaKoncem = false;
            if (kol !== 'en') {
                const g = this._mapa(kol).grupy[this._mapa(kol).grupaX[idx]];
                enZaKoncem = !!g && g.e0 >= nE;
            }
            const wynik = { en: en, pl: null, orig: null, przewin: { en: en || [enPoz, enPoz] }, zrodlo: {},
                            punkt: { en: en ? false : (enZaKoncem ? 'dol' : 'gora') } };
            for (const k of ['pl', 'orig']) {
                if (k === kol) { wynik[k] = wlasny; wynik.przewin[k] = wlasny; continue; }
                const m = this._mapa(k);
                wynik[k] = en ? this._zakresDlaEn(m, a, b) : null;
                wynik.przewin[k] = wynik[k] || this._pozycjaDlaEn(m, enPoz, this._dlugosc(k));
                wynik.punkt[k] = wynik[k] ? false : (this._zaKoncem(m, enPoz, this._dlugosc(k)) ? 'dol' : 'gora');
            }
            for (const k of ['orig', 'en', 'pl']) {
                if (k === kol) continue;
                if (kol !== 'en' && k !== 'en' && wynik[k]) {
                    // PL ↔ ORYG: grupy celu mogą obejmować więcej zdań EN niż grupa źródła;
                    // źródłem są wtedy WSZYSTKIE wiersze źródła z tych zdań EN, inaczej dwie
                    // kolejne grupy źródła dzieliły jeden cel i ten skakał w tył.
                    const zak = this._enDlaZakresu(this._mapa(k), wynik[k]);
                    wynik.zrodlo[k] = (zak && this._zakresDlaEn(this._mapa(kol), zak[0], zak[1])) || wlasny;
                    continue;
                }
                if (kol !== 'en') { wynik.zrodlo[k] = wlasny; continue; }
                // Kursor na EN: źródłem jest cały zakres EN grupy (ten sam, z którego liczymy cel).
                wynik.zrodlo[k] = wynik[k] ? [a, b] : [idx, idx];
            }
            return wynik;
        },
        czyAktywne(kol, idx) { const z = this.aktywne[kol]; return !!z && idx >= z[0] && idx <= z[1]; },
        // Krytyk r15 #1: „brak w PL” wg AI tylko dla zdań EN, które AI widziało (nowo dopisane nie mają werdyktu).
        _pominieteEn(idx) {
            const m = this.mapaPl;
            if (!m || !m.pominieteEn || !m.pominieteEn[idx]) return false;
            const enAi = this._aiPamiec.en;
            return !Array.isArray(enAi) || enAi.includes(this._norm(this.enS[idx]));
        },
        _sierotaAi(kol, idx) { const m = this._mapa(kol); return !!(m && m.sierotyAi[idx]); },
        _wierszClass(kol, idx) {
            const w = this.linkWybrane;
            const klasy = [];
            if (this.linkMode) {
                klasy.push('cursor-pointer');
                if (w && w.kol === kol && w.idx === idx) klasy.push('ring-2 ring-amber-500 bg-amber-100 dark:bg-amber-500/20');
                else klasy.push('sc-link-najechanie');
            }
            // 13.10.2026 (edycja w kolumnach): oryginał i angielski też są do edycji, więc bez kursora „tylko do czytania”.
            const ch = this.chipAktywny;
            if (this.linkMode && ch && ((kol === 'en' && idx === ch.en) || (kol === ch.kol && idx === ch.idx))) {
                klasy.push('ring-2 ring-amber-500 bg-amber-200/70 dark:bg-amber-500/30');   // krytyk r5 #4
            } else if (this.isAnchored(kol, idx)) klasy.push('ring-1 ring-amber-400/60');
            const aktywny = !this.linkMode && this.czyAktywne(kol, idx);
            if (!aktywny && kol === 'en' && this._pominieteEn(idx)) klasy.push('sc-pominiete');
            if (this._sierotaAi(kol, idx)) {
                klasy.push('sc-dodatek', aktywny ? 'sc-dodatek-aktywny' : '');
            } else if (aktywny) {
                klasy.push('bg-accent/25');
            } else if (!this.linkMode) {
                klasy.push('hover:bg-accent/10');
            }
            return klasy.join(' ');
        },
        _wierszTitle(kol, idx) {
            if (this.linkMode) {
                const w = this.linkWybrane;
                if (!w) return oppenT('Kliknij, żeby wybrać to zdanie do powiązania');
                if (w.kol === kol) return w.idx === idx ? oppenT('Wybrane: teraz kliknij odpowiednik w innej kolumnie') : oppenT('Kliknij, żeby wybrać to zdanie zamiast poprzedniego');
                if (w.kol !== 'en' && kol !== 'en') return oppenT('Powiązanie łączy zdanie angielskie z innym: najpierw wybierz zdanie angielskie');
                return oppenT('Kliknij, żeby powiązać z wybranym zdaniem');
            }
            if (this._sierotaAi(kol, idx)) return oppenT('AI: to zdanie nie ma odpowiednika w angielskim (dodatek w tej wersji)');
            if (kol === 'en' && this._pominieteEn(idx)) return oppenT('AI: tego zdania brakuje w polskiej wersji');
            return '';
        },
        _aiMappedCount() {
            const ile = (m) => (m || []).filter(v => v !== null && v !== undefined && v >= 0).length;
            return ile(this.aiPlToEn) + ile(this.aiOrigToEn);
        },
        async clearAiMap() {
            // Krytyk r1 #6: mapa AI jest opłacona; jedno kliknięcie w mały link jej nie kasuje.
            if (!await appConfirm(oppenT('Usunąć mapę AI? Ponowne dopasowanie znów będzie płatne. Cofniesz to przyciskiem Cofnij.'),
                                  oppenT('Usuń mapę AI'), { variant: 'danger', confirmLabel: oppenT('Usuń mapę') })) return;
            const przed = this._stan(true);
            this.aiPlToEn = null; this.aiOrigToEn = null; this.aiBrakPl = []; this.aiBrakOrig = [];
            this._schowki = {};   // usunięta mapa nie wraca ze schowka
            this._krokStanu(przed, true);   // opłaconą mapę da się przywrócić przez Cofnij
            this._przelicz(); this._saveDraft();
        },

        // ── Wiązanie zdań (jak compare-view reklam, ale kolejność kliknięć dowolna) ──
        toggleLinkMode() {
            this._zatwierdzWszystko();   // 13.10.2026 (edycja w kolumnach): niezapisana edycja w kolumnie najpierw
            this.linkMode = !this.linkMode; this.linkWybrane = null;
            if (!this.linkMode) this._toastWiazania(null);
            document.documentElement.classList.toggle('sc-wiazanie', this.linkMode);
            // Krytyk r12 #2: wejście i wyjście z wiązania pokazują początek linii (instrukcja albo stan:
            // liczby, braki, źródło); powiązania dalej osiąga „więcej ›” i kółko myszy.
            this.$nextTick(() => { this._liniaNaPoczatek(); this._sprawdzLinie(); });
            // Krytyk r12 #6: po wyjściu klawiszem fokus nie zostaje na klikniętym zdaniu (obwódka).
            const a = document.activeElement;
            if (!this.linkMode && a && a.closest && a.closest('[data-sc-pane]')) a.blur();
            this.aktywne = { en: null, pl: null, orig: null };
        },
        instrukcjaWiazania() {
            const w = this.linkWybrane;
            if (!w) return (this._obokSiebie() && !this.dotyk)
                ? oppenT('Kliknij zdanie, potem jego odpowiednik w innej kolumnie (jedno musi być po angielsku). Shift: drugie powiązanie.')
                : oppenT('Stuknij zdanie, potem jego odpowiednik w innej kolumnie (jedno musi być po angielsku).');
            const nazwa = { en: 'EN', pl: 'PL', orig: oppenT('ORYG') }[w.kol] + ' #' + (w.idx + 1);
            // Krytyk r9 #5: tylko kolumny, które są na ekranie.
            const dotyk = !this.szeroki || this.dotyk;
            if (w.kol !== 'en') return dotyk ? oppenTf('Wybrane {0}: stuknij odpowiednik po angielsku.', [nazwa])
                                              : oppenTf('Wybrane {0}: kliknij odpowiednik po angielsku.', [nazwa]);
            const pl = this.plS.length > 0, orig = this.origS.length > 0;
            if (pl && !orig) return dotyk ? oppenTf('Wybrane {0}: stuknij odpowiednik po polsku.', [nazwa])
                                          : oppenTf('Wybrane {0}: kliknij odpowiednik po polsku.', [nazwa]);
            if (orig && !pl) return dotyk ? oppenTf('Wybrane {0}: stuknij odpowiednik w oryginale.', [nazwa])
                                          : oppenTf('Wybrane {0}: kliknij odpowiednik w oryginale.', [nazwa]);
            return dotyk ? oppenTf('Wybrane {0}: stuknij odpowiednik po polsku lub w oryginale.', [nazwa])
                         : oppenTf('Wybrane {0}: kliknij odpowiednik po polsku lub w oryginale.', [nazwa]);
        },
        _validAnchor(enIdx, idx, len) {
            return enIdx !== null && enIdx >= 0 && enIdx < this.enS.length && idx >= 0 && idx < len;
        },
        // Krytyk r7 #5: nowy komunikat wiązania zastępuje poprzedni (bez stosu na pół ekranu).
        // Krytyk r8 #2: komunikat serwera (po polsku) w języku interfejsu.
        _bladAi(e) {
            const t = window.appBlad ? appBlad(e) : String((e && e.message) || e || '');
            return window.appTlumaczBlad ? appTlumaczBlad(t) : t;
        },
        _toastWiazania(tekst, zCofnij) {
            const st = window.Alpine && Alpine.store && Alpine.store('dialog');
            if (st && this._toastWiazaniaId) st.dismissToast(this._toastWiazaniaId);
            // Krytyk r8 #9: na telefonie pasek z „Cofnij” jest daleko nad kolumnami: cofnięcie w samym toaście.
            const opcje = zCofnij ? { duration: 5000, actionLabel: oppenT('Cofnij'), action: () => this.undoLast() } : { duration: 3000 };
            this._toastWiazaniaId = tekst && window.appToast ? appToast(tekst, opcje) : null;
        },
        _liniaNaPoczatek() {
            const p = this._el('pasek'), l = p && p.querySelector('.sc-linia');
            if (l) l.scrollLeft = 0;
            this._sprawdzLinie();
        },
        _linia() { const p = this._el('pasek'); return p && p.querySelector('.sc-linia'); },
        _sprawdzLinie() {
            const l = this._linia();
            this.liniaWiecej = !!(l && l.scrollWidth - l.clientWidth - l.scrollLeft > 4);
            this.liniaWLewo = !!(l && l.scrollLeft > 4);
        },
        _kolkoLinii(e) {
            const l = this._linia();
            if (!l || l.scrollWidth <= l.clientWidth || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
            const przed = l.scrollLeft;
            l.scrollLeft += e.deltaY;
            if (l.scrollLeft !== przed) e.preventDefault();   // na krawędzi linii kółko przewija stronę
        },
        _przewinLinie() {
            const l = this._linia();
            if (l) l.scrollBy({ left: Math.round(l.clientWidth * 0.7), behavior: 'smooth' });
            setTimeout(() => this._sprawdzLinie(), 400);
        },
        kliknijWLinku(kol, idx, dodatkowe) {
            const w = this.linkWybrane;
            if (!w) this.$nextTick(() => this._liniaNaPoczatek());   // instrukcja „Wybrane …” na widoku
            if (!w || w.kol === kol) {
                this.linkWybrane = (w && w.kol === kol && w.idx === idx) ? null : { kol: kol, idx: idx };
                // Krytyk r6 #4: na telefonie linia z instrukcją jest daleko nad kolumnami.
                if ((!this.szeroki || this.dotyk) && this.linkWybrane) this._toastWiazania(this.instrukcjaWiazania());
                return;
            }
            if (w.kol !== 'en' && kol !== 'en') {
                this._toastWiazania(oppenT('Jedno z dwóch zdań musi być angielskie: angielski to oś porównania.'));   // krytyk r20 #10
                this.linkWybrane = { kol: kol, idx: idx };
                return;
            }
            const en = w.kol === 'en' ? w.idx : idx;
            const inna = w.kol === 'en' ? kol : w.kol, innaIdx = w.kol === 'en' ? idx : w.idx;
            this._dodajKotwice(inna, en, innaIdx, !!dodatkowe || this.linkDodawaj);
            this.linkWybrane = null;
            if ((!this.szeroki || this.dotyk) && window.appToast) {
                const lista = inna === 'pl' ? this.anchorsPl : this.anchorsOrig, kl = inna === 'pl' ? 'pl' : 'orig';
                const jest = lista.some(a => a.en === en && a[kl] === innaIdx);
                const nazwa = 'EN\u00a0#' + (en + 1) + '\u00a0·\u00a0' + (inna === 'pl' ? 'PL' : oppenT('ORYG')) + '\u00a0#' + (innaIdx + 1);   // krytyk r17 #9
                this._toastWiazania(jest ? oppenTf('Powiązano {0}.', [nazwa]) : oppenTf('Zdjęto powiązanie {0}.', [nazwa]), true);
            }
        },
        _dodajKotwice(kol, en, idx, dodatkowe) {
            const klucz = kol === 'pl' ? 'pl' : 'orig';
            const lista = kol === 'pl' ? this.anchorsPl : this.anchorsOrig;
            if (!this._validAnchor(en, idx, this._dlugosc(kol))) return;
            // Ta sama para drugi raz = zdjęcie powiązania (przełącznik).
            if (lista.some(a => a.en === en && a[klucz] === idx)) {
                this._ustawKotwice(kol, lista.filter(a => !(a.en === en && a[klucz] === idx)));
                return;
            }
            // Domyślnie jak pod reklamą: nowe powiązanie zastępuje stare z tym samym
            // zdaniem (poprawka pomyłki). Z Shiftem dodaje kolejne: jedno zdanie
            // angielskie rozbite na dwa polskie (albo odwrotnie).
            let zostaja = dodatkowe ? lista : lista.filter(a => a.en !== en && a[klucz] !== idx);
            // Narracja idzie w jedną stronę: powiązanie krzyżujące się z nowym odpada.
            const bezKrzyzy = zostaja.filter(a => !((a.en < en && a[klucz] > idx) || (a.en > en && a[klucz] < idx)));
            const usuniete = zostaja.length - bezKrzyzy.length;
            const nowa = bezKrzyzy.concat([{ en: en, [klucz]: idx }]).sort((a, b) => (a[klucz] - b[klucz]) || (a.en - b.en));
            this._ustawKotwice(kol, nowa);
            // Krytyk r3 #3: nowe powiązanie zawsze widać (linia przewija się do niego).
            this.$nextTick(() => {
                const el = this._q('[data-chip="' + kol + '-' + en + '-' + idx + '"]');
                const linia = el && el.closest('.sc-linia');
                // Krytyk r10 #3: prawa krawędź żetonu (z ✕) przed przyciskiem „więcej ›” i wygaszeniem.
                if (el && linia) linia.scrollLeft = Math.max(0, el.offsetLeft + el.offsetWidth - linia.clientWidth + 110);
                this._sprawdzLinie();
            });
            if (usuniete) (window.appToast && appToast(oppenTf('Usunięto powiązania krzyżujące się z nowym: {0}. Cofnij: {1}.', [usuniete, this.skrot('Z')])));
        },
        _ustawKotwice(kol, lista) {
            const przed = this._stan();
            if (kol === 'pl') this.anchorsPl = lista; else this.anchorsOrig = lista;
            this._krokStanu(przed);   // zmiana powiązań też jest do cofnięcia (Cmd+Z)
            this._przelicz(); this._saveDraft();
        },
        removeAnchorPl(i) { this._ustawKotwice('pl', this.anchorsPl.filter((_, j) => j !== i)); },
        removeAnchorOrig(i) { this._ustawKotwice('orig', this.anchorsOrig.filter((_, j) => j !== i)); },
        async clearAnchors() {
            const n = this.anchorsPl.length + this.anchorsOrig.length;
            if (n > 1 && !await appConfirm(oppenTf('Usunąć wszystkie powiązania ({0})? Cofniesz to przyciskiem Cofnij.', [n]),
                                           oppenT('Usuń powiązania'), { variant: 'danger', confirmLabel: oppenT('Usuń powiązania') })) return;
            const przed = this._stan();
            this.anchorsPl = []; this.anchorsOrig = []; this.linkWybrane = null;
            this._krokStanu(przed);
            this._przelicz(); this._saveDraft();
        },
        kotwicaPominieta(kol, a) {
            const m = this._mapa(kol);
            const x = kol === 'pl' ? a.pl : a.orig;
            return !!m && m.pominieteKotwice.some(k => k.en === a.en && k.x === x);
        },
        isAnchored(kol, idx) {
            if (kol === 'en') return this.anchorsPl.some(a => a.en === idx) || this.anchorsOrig.some(a => a.en === idx);
            return kol === 'pl' ? this.anchorsPl.some(a => a.pl === idx) : this.anchorsOrig.some(a => a.orig === idx);
        },

        // ── Podświetlanie i przewijanie odpowiedników ──
        // Najechanie na zdanie W KAŻDEJ kolumnie podświetla grupę i (z Auto-scroll)
        // ustawia pozostałe kolumny tak, żeby odpowiednik stał na tej samej wysokości.
        // Opóźnienie 90 ms: przejeżdżanie myszą przez kolumnę w drodze do innej nie
        // przesuwa tekstu, do którego właśnie celujesz.
        najedz(kol, idx, ev) {
            if (kol !== 'pl' && ev && ev.type === 'click') this._wybranyNaTelefonie = null;   // krytyk r15 #7
            if (this.linkMode) return;
            const o = this._odpowiedniki(kol, idx);
            if (!o) return;
            this.aktywne = { en: o.en, pl: o.pl, orig: o.orig };
            clearTimeout(this._hoverT);
            if (!this._obokSiebie()) {
                // Krytyk r2 #10: na wąskim ekranie kolumny stoją jedna pod drugą; odpowiednik
                // przewijamy na górę JEGO kolumny, żeby było go widać po przewinięciu strony.
                if (ev && ev.type === 'click') {
                    // Krytyk r12 #1: kolumna NAD stukniętym zdaniem pokazuje odpowiednik przy swoim dolnym
                    // brzegu, kolumna POD nim przy górnym, czyli tam, gdzie kolumna styka się z widokiem.
                    const wiersz = ev.currentTarget && ev.currentTarget.getBoundingClientRect ? ev.currentTarget.getBoundingClientRect() : null;
                    const widoczne = [], ukryte = [];
                    for (const k of ['orig', 'en', 'pl']) {
                        if (k === kol || !o.przewin[k]) continue;
                        const pane = this._pane(k), el = pane && pane.querySelector('[data-' + k + '-idx="' + o.przewin[k][0] + '"]');
                        if (!el) continue;
                        const pr = pane.getBoundingClientRect(), er = el.getBoundingClientRect();
                        const nad = wiersz && pr.bottom <= wiersz.top + 1;
                        pane.scrollTop += nad ? (er.bottom - pr.bottom + 8) : (er.top - pr.top - 8);
                        // Widoczny = co najmniej 32 px (albo całe zdanie) między przyklejonym nagłówkiem a dołem okna.
                        const po = el.getBoundingClientRect(), gora = this.gora || 0;
                        // Krytyk r20 #7: dół zasłonięty toastem to nie „widać”.
                        const toasty = [...document.querySelectorAll('#appToastStack > *')].filter(t => t.getClientRects().length);
                        const dol = toasty.length ? Math.min(window.innerHeight, ...toasty.map(t => t.getBoundingClientRect().top)) : window.innerHeight;
                        const widac = Math.min(po.bottom, dol) - Math.max(po.top, gora) >= Math.min(po.height, 32);
                        (widac ? widoczne : ukryte).push([k, o.przewin[k][0]]);
                    }
                    if (!widoczne.length && ukryte.length && window.appToast) {
                        const [k, i] = ukryte.find(u => u[0] === 'en') || ukryte[0];
                        const tekst = String({ en: this.enS, pl: this.plS, orig: this.origS }[k][i] || '');
                        const nazwa = { en: 'EN', pl: 'PL', orig: oppenT('ORYG') }[k] + ' #' + (i + 1);
                        this._toastWiazania(nazwa + ': ' + (tekst.length > 140 ? tekst.slice(0, 137) + '…' : tekst));
                    }
                }
                return;
            }
            if (!this.autoScroll) return;
            // Krytyk r8 #1: mysz stojąca na kolumnach zaraz po „Porównaj” (dolny przycisk) wyrównywała je,
            // zanim układ ustawił górny dobieg; najazd przewija dopiero po ułożeniu.
            if (!this._ulozoneOd || performance.now() < this._ulozoneOd) return;
            if (performance.now() - (this._ostatniSync || 0) < 250) return;   // trwa przewijanie kółkiem
            const el = ev.currentTarget;
            if (ev && typeof ev.clientY === 'number' && ev.type !== 'focus' && ev.type !== 'focusin') this._myszY = ev.clientY;
            this._hoverT = setTimeout(() => {
                if (!el.isConnected) return;
                const y = this._myszY !== null ? this._myszY : el.getBoundingClientRect().top;
                for (const k of ['orig', 'en', 'pl']) {
                    if (k !== kol && o.przewin[k]) this._wyrownaj(k, o.przewin[k], kol, o.zrodlo[k], y, 'smooth', o.punkt[k]);
                }
            }, 90);
        },
        pokazPowiazanie(kol, en, idx) {
            this.chipAktywny = { kol: kol, en: en, idx: idx };
            this.aktywne = { en: [en, en], pl: kol === 'pl' ? [idx, idx] : null, orig: kol === 'orig' ? [idx, idx] : null };
            for (const [k, i] of [['en', en], [kol, idx]]) {
                const pane = this._pane(k), el = pane && pane.querySelector('[data-' + k + '-idx="' + i + '"]');
                // Krytyk r9 #8: nasze przewinięcie, nie gest użytkownika (synchronizacja go nie poprawia).
                this._programowe[k] = performance.now() + 200;
                if (el) pane.scrollTop += el.getBoundingClientRect().top - pane.getBoundingClientRect().top - pane.clientHeight / 3;
            }
        },
        zjedz() {
            this.chipAktywny = null;
            if (this._dotyk) return;   // krytyk r3 #6: po stuknięciu palcem podświetlenie zostaje
            clearTimeout(this._hoverT);
            this.aktywne = { en: null, pl: null, orig: null };
        },
        _obokSiebie() { return this.szeroki; },
        _pane(kol) { return this._q('[data-sc-pane="' + kol + '"]'); },
        // Ustawia kolumnę `kol` tak, żeby punkt zakresu `zakres` odpowiadający miejscu y
        // w zakresie źródłowym (kolumna `zrKol`) stał dokładnie na wysokości y. Ułamek
        // liczony na całych grupach, więc bez skoków na granicy zdań, także gdy jednemu
        // zdaniu odpowiadają dwa albo trzy.
        _wiersze(kol, zakres) {
            const pane = this._pane(kol);
            if (!pane || !zakres) return null;
            const atr = '[data-' + kol + '-idx="';
            const first = pane.querySelector(atr + zakres[0] + '"]');
            const last = pane.querySelector(atr + zakres[1] + '"]') || first;
            if (!first) return null;
            return [first.getBoundingClientRect().top, last.getBoundingClientRect().bottom];
        },
        _wyrownaj(kol, zakres, zrKol, zrZakres, y, behavior, punkt) {
            // Krytyk r13 #2: edytowane zdanie zostaje na miejscu. 13.10.2026 (edycja w kolumnach): w każdej kolumnie,
            // także kolumna „Ciągły tekst”, w której stoi kursor (piszesz w niej, więc nie ucieka spod palców).
            if (this._edytowanaKolumna(kol)) return;
            const pane = this._pane(kol);
            const cel = this._wiersze(kol, zakres), zr = this._wiersze(zrKol, zrZakres);
            if (!pane || !cel || !zr) return;
            if (punkt === 'dol') cel[0] = cel[1];
            else if (punkt) cel[1] = cel[0];
            const h = zr[1] - zr[0];
            const frac = h > 0 ? Math.max(0, Math.min(1, (y - zr[0]) / h)) : 0;
            let top = pane.scrollTop + (cel[0] + frac * (cel[1] - cel[0]) - y);
            top = Math.max(0, Math.min(top, pane.scrollHeight - pane.clientHeight));
            if (Math.abs(top - pane.scrollTop) < 1) return;
            // Nasze własne przewinięcie tej kolumny nie może jej zrobić prowadzącą
            // (płynne przewijanie trwa kilkaset ms i sypie zdarzeniami scroll).
            this._programowe[kol] = performance.now() + (behavior === 'smooth' ? 900 : 120);
            pane.scrollTo({ top: top, behavior: behavior });
        },
        // Przewijanie kółkiem albo palcem: kolumna pod kursorem prowadzi, pozostałe idą
        // za nią. Przewinięcia, które robimy sami, przychodzą z kolumn-naśladowców i są
        // pomijane, więc kolumny się nie przepychają.
        prowadzi(kol) {
            this._kierowca = kol;
            this._programowe[kol] = 0;   // gest użytkownika przerywa nasze płynne przewijanie
        },
        przewinieto(kol) {
            if (this._kierowca !== kol || !this.autoScroll || !this._obokSiebie()) return;
            if (performance.now() < (this._programowe[kol] || 0)) return;
            if (this._syncRaf) return;
            this._syncRaf = requestAnimationFrame(() => { this._syncRaf = null; this._synchronizuj(kol); });
        },
        _synchronizuj(kol) {
            const pane = this._pane(kol);
            if (!pane) return;
            const pr = pane.getBoundingClientRect();
            let y = this._myszY;
            if (y === null || y < pr.top || y > pr.bottom) y = pr.top + pr.height * 0.35;
            const els = pane.querySelectorAll('[data-' + kol + '-idx]');
            if (!els.length) return;
            let el = els[els.length - 1];
            for (const e of els) { if (e.getBoundingClientRect().bottom >= y) { el = e; break; } }
            const o = this._odpowiedniki(kol, Number(el.getAttribute('data-' + kol + '-idx')));
            if (!o) return;
            this._ostatniSync = performance.now();
            clearTimeout(this._hoverT);
            for (const k of ['orig', 'en', 'pl']) {
                if (k !== kol && o.przewin[k]) this._wyrownaj(k, o.przewin[k], kol, o.zrodlo[k], y, 'auto', o.punkt[k]);
            }
        },

        // ── Check alignment with AI ──
        async checkAlignmentAI() {
            if (this.aiBusy) return;
            this._zatwierdzWszystko();   // 13.10.2026 (edycja w kolumnach): niezapisana edycja w kolumnie najpierw
            // 11.10.2026: najnowsze modele (Haiku 5.5, Sonnet 5.5, Opus 5.5) z ceną liczoną
            // ze średniego zużycia tej operacji, razy liczba kolumn (polski i oryginał osobno).
            const kolumny = (this.plS.length ? 1 : 0) + (this.origS.length ? 1 : 0);
            const opis = this.plS.length && this.origS.length
                ? oppenT('AI dopasuje polskie i oryginalne zdania do angielskich. Cena zależy od długości skryptów.')
                : (this.plS.length ? oppenT('AI dopasuje każde polskie zdanie do angielskiego. Cena zależy od długości skryptów.')
                                   : oppenT('AI dopasuje oryginalne zdania do angielskich. Cena zależy od długości skryptów.'));
            const opisPelny = (this.aiPlToEn || this.aiOrigToEn)
                ? opis + ' ' + oppenT('Obecna mapa AI zostanie zastąpiona nową (to nowe, płatne dopasowanie).')
                : opis;
            const r = await appConfirmWithModel(opisPelny, oppenT('Dopasuj zdania z AI'),
                { models: this.modeleAi(),
                  defaultModel: (window.OppenModel && OppenModel.getAnthropic()) || 'claude-sonnet-5-5',
                  fieldLabel: oppenT('Model AI'), confirmLabel: oppenT('Dopasuj') });
            if (!r || !r.confirmed) return;
            const gen = ++this._gen;
            // Mapa przychodzi dla zdań z CHWILI wysłania; jeśli w międzyczasie poprawisz
            // tekst, przenosimy ją na bieżące zdania zamiast wyrzucać (płatne wywołanie).
            const wyslane = { en: [...this.enS], pl: [...this.plS], orig: [...this.origS] };
            this.aiBusy = true;
            this.aiSek = 0;
            clearInterval(this._aiZegar);
            this._aiZegar = setInterval(() => { this.aiSek++; }, 1000);
            const op = (window.appOpStart && appOpStart('sc-align-' + Date.now(), oppenT('AI dopasowuje zdania…'),
                { expectedSec: 25, successMessage: oppenT('Zdania dopasowane') }));
            try {
                const resp = await fetch('/api/xray/align', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orig: this.origText, en: this.enText, pl: this.plText, model: r.model,
                                           zdania: wyslane }),
                    timeoutMs: 180000,  // wrapper: AI-regex nie łapie tego URL-a, default 60s by uciął
                });
                const j = await resp.json().catch(() => null);
                if (!resp.ok || !j || !j.ok) {
                    // missing_key/limit_exceeded → darmowy toast globalnego handlera, nie dublujemy
                    if (j && (j.missing_key || j.limit_exceeded)) throw Object.assign(new Error(''), { silent: true });
                    // Krytyk r5 #7: zamiast „HTTP 500” zdanie dla człowieka.
                    throw new Error((j && (j.error || j.detail))
                        || oppenTf('Błąd serwera ({0}). Spróbuj za chwilę; ewentualny koszt sprawdzisz w panelu dostawcy API.', [resp.status]));
                }
                if (gen !== this._gen) {
                    // Krytyk r12 #3: teksty wyczyszczono w trakcie: wynik idzie do kosza, ale mówimy o tym.
                    (window.appOpEnd && appOpEnd(op, { czesciowo: true }));
                    (window.appToast && appToast(oppenT('Wynik dopasowania AI odrzucony: teksty zostały wyczyszczone.'), { variant: 'warning', duration: 6000 }));
                    return;
                }
                const c = j.counts || {};
                if ((c.en !== undefined && c.en !== wyslane.en.length) || (c.pl !== undefined && c.pl !== wyslane.pl.length)
                    || (c.orig !== undefined && c.orig !== wyslane.orig.length)) {
                    throw new Error(oppenT('Serwer podzielił tekst na inną liczbę zdań niż strona. Odśwież stronę i spróbuj ponownie.'));
                }
                const Z = window.ZdaniaMapa;
                const mE = Z.przemapuj(wyslane.en, this.enS), mP = Z.przemapuj(wyslane.pl, this.plS),
                      mO = Z.przemapuj(wyslane.orig, this.origS);
                const pl = j.pl_to_en && j.pl_to_en.length === wyslane.pl.length ? j.pl_to_en : null;
                const orig = j.orig_to_en && j.orig_to_en.length === wyslane.orig.length ? j.orig_to_en : null;
                const enZm = this._enZmienione(wyslane.en, this.enS, mE);
                this._zapamietajAi(wyslane.en, wyslane.pl, pl, 'pl');
                this._aiPamiec.en = wyslane.en.map(t => this._norm(t));   // angielski, który widziało AI
                if (orig) this._zapamietajAi(wyslane.en, wyslane.orig, orig, 'orig');
                this.aiPlToEn = this._przeniesAi(pl, mP, mE, this.plS.length, enZm);
                this._genAi++;   // nowa opłacona mapa: wcześniejsze kroki „usuń mapę AI” jej nie dotykają
                // Krytyk r11 #5: krok, który zmieniał TYLKO starą mapę AI, po nowym dopasowaniu nic by nie zrobił
                // (Cofnij wyglądałoby na zepsute), więc znika z historii.
                const tylkoStaraMapa = (k) => k.przed && 'ap' in k.przed && k.old === k.neu
                    && JSON.stringify([k.przed.kp, k.przed.ko]) === JSON.stringify([k.po && k.po.kp, k.po && k.po.ko]);
                this.undoStack = this.undoStack.filter(k => !tylkoStaraMapa(k));
                this.redoStack = this.redoStack.filter(k => !tylkoStaraMapa(k));
                const naEn = (lista) => (Array.isArray(lista) ? lista : []).map(e => mE[e]).filter(e => typeof e === 'number' && e >= 0);
                if (pl) this.aiBrakPl = naEn(j.pominiete_en_pl);
                if (orig) this.aiBrakOrig = naEn(j.pominiete_en_orig);
                // Częściowy wynik (ORYG się nie udał): zostaje wcześniejsza mapa ORYG,
                // (już liczona dla bieżących zdań), zamiast znikać.
                if (orig || !j.ostrzezenie) this.aiOrigToEn = this._przeniesAi(orig, mO, mE, this.origS.length, enZm);
                this._przelicz();
                this._saveDraft();
                // Krytyk r4 #8: częściowy wynik nie dostaje ani „gotowe”, ani „nie udało się”: mówi o nim ostrzeżenie niżej.
                (window.appOpEnd && appOpEnd(op, j.ostrzezenie ? { czesciowo: true } : undefined));
                // Oryginał się nie udał, polski tak (i jest opłacony): pokazujemy polski.
                if (j.ostrzezenie) (window.appToast && appToast((this.aiOrigToEn
                    ? oppenTf('AI dopasowało polski. Oryginał się nie udał, zostaje poprzednia mapa oryginału. Powód: {0}', [this._bladAi(j.ostrzezenie)])
                    : oppenTf('AI dopasowało polski, oryginał się nie udał: {0}', [this._bladAi(j.ostrzezenie)])), { variant: 'warning', duration: 7000 }));
            } catch (e) {
                (window.appOpEnd && appOpEnd(op, { error: true }));
                if (!e.silent) (window.appToast && appToast(oppenT('Dopasowanie AI') + ': ' + this._bladAi(e), { variant: 'error', duration: 6000 }));
            } finally {
                this.aiBusy = false;
                clearInterval(this._aiZegar); this.aiSek = 0;
            }
        },
        // ── Edycja PL inline (snapshoty całego pola, wzorzec detail.html) ──
        beginPlEdit(idx, ev) { return this.beginEdit('pl', idx, ev); },
        // 13.10.2026 (edycja w kolumnach): to samo dla oryginału i angielskiego (tryb „Zdanie po zdaniu”).
        beginEdit(kol, idx, ev) {
            // Zdania są zwykłym tekstem, więc zaznaczenie idzie przez CAŁĄ kolumnę
            // (Cmd+A, przeciąganie, Cmd+C, jak w dokumencie). Edytowalne robimy
            // dopiero to jedno, w które user kliknął.
            if (this.linkMode) return;
            const el0 = ev.currentTarget;
            const klik = this._wezKlik(kol);
            // 13.10.2026 (gesty jak w Google Docs, zgłoszenie właściciela: dwuklik nie zaznaczał słowa): kliknięcie
            // w zdanie, które JUŻ edytujesz, należy do przeglądarki (dwuklik = słowo, trzy kliknięcia = zdanie,
            // przeciąganie, Shift+klik). Wcześniej drugie kliknięcie dwukliku trafiało niżej w regułę „klik po
            // Zaznacz PL” (mysz w tym samym miejscu, zaznaczenie niepuste) i kasowało świeżo zaznaczone słowo.
            if (this._edytowany(kol) === idx && el0 && el0.isContentEditable) return;
            // Klik obsłużony już przy zapisie poprzedniego zdania (przebudowa wierszy): edycja tamtego zdania startuje
            // TERAZ (litery wpisane zaraz po kliknięciu trafiają w nie), a nie w zdanie, które jest teraz pod myszą.
            if (klik && klik.uzyty) {
                if (this._wejscieKliku && this._wejscieKliku.kol === kol) this._wejdzPoKliku();
                return;
            }
            // Shift+klik w inne zdanie w trakcie edycji: zaznaczenie rozszerzone w edytowanym zdaniu (naMousedown).
            if (ev.shiftKey && this._edytowany(kol) !== null) return;
            const sel = window.getSelection();
            // Krytyk r4 #6: zwykłe kliknięcie (bez przeciągania) po „Zaznacz PL” albo Cmd+A
            // zdejmuje zaznaczenie i wchodzi w edycję, zamiast wymagać drugiego kliknięcia.
            // Tylko POJEDYNCZE kliknięcie bez Shift (drugie i trzecie kliknięcie zaznacza słowo i zdanie).
            if (sel && !sel.isCollapsed && this._klikXY && (ev.detail || 1) === 1 && !ev.shiftKey
                && Math.abs(ev.clientX - this._klikXY[0]) < 4 && Math.abs(ev.clientY - this._klikXY[1]) < 4) sel.removeAllRanges();
            // Przeciągnięcie przez kilka zdań = zaznaczenie do skopiowania (pola edycji nie łączą zaznaczenia).
            // Przeciągnięcie w obrębie JEDNEGO zdania = edycja z tym zaznaczeniem (pisanie je zastępuje, jak w Docs).
            let zakres = null;
            if (sel && !sel.isCollapsed) {
                if (!(el0 && el0.contains(sel.anchorNode) && el0.contains(sel.focusNode))) return;
                zakres = { start: skryptyPlLinearyzuj(el0, { node: sel.anchorNode, offset: sel.anchorOffset }).poz,
                           end: skryptyPlLinearyzuj(el0, { node: sel.focusNode, offset: sel.focusOffset }).poz };
            }
            // Kursor tam, gdzie wcisnąłeś przycisk myszy: zapis poprzedniego zdania (przy mousedown) mógł przesunąć
            // tekst między wierszami, więc zdanie szukamy po tekście z chwili kliknięcia, nie po numerze wiersza.
            let cel = idx, poz = null;
            if (!zakres && klik) {
                const r = this._celKliku(klik);
                if (r) { cel = r.idx; poz = r.offset; }
            }
            this._edytujZdanie(kol, cel, zakres || (poz !== null ? { start: poz, end: poz } : { x: ev.clientX, y: ev.clientY }), true);
        },
        // 13.10.2026 (gesty jak w Google Docs): mousedown na wierszu zdania. Zapamiętuje, KTÓRE zdanie i w którym
        // miejscu kliknięto (zanim zapis edytowanego zdania przebuduje wiersze) i obsługuje Shift+klik w trakcie edycji.
        naMousedown(kol, idx, ev) {
            this._klikXY = [ev.clientX, ev.clientY];
            if (kol === 'pl') this._klikPo = idx;
            if (this.linkMode || ev.button) return;
            const el = ev.currentTarget, ed = this._edytowany(kol);
            if (ev.shiftKey && ed !== null && ed !== idx) {
                // Pole edycji nie łączy zaznaczenia z innym zdaniem: rozszerzamy je do krawędzi edytowanego zdania.
                ev.preventDefault();
                const w = this._wiersz(kol, ed), s = window.getSelection();
                if (w && s && s.rangeCount && w.contains(s.anchorNode) && s.extend) {
                    const p = skryptyPlPunkt(w, idx > ed ? skryptyPlLinearyzuj(w).tekst.length : 0);
                    try { s.extend(p.node, p.offset); } catch (e) {}
                }
                return;
            }
            if (ed === idx) return;   // w edytowanym zdaniu decyduje przeglądarka (kursor, dwuklik, przeciąganie)
            const r = this._punktKursora(ev.clientX, ev.clientY);
            this._klik = { kol: kol, idx: idx, tekst: el ? el.textContent : '', t: performance.now(), uzyty: false,
                           offset: (r && el && el.contains(r.startContainer)) ? skryptyPlLinearyzuj(el, { node: r.startContainer, offset: r.startOffset }).poz : null };
        },
        _wejdzPoKliku() {
            const w = this._wejscieKliku;
            if (!w) return;
            this._wejscieKliku = null;
            this._edytujZdanie(w.kol, w.idx, w.offset === null ? 'koniec' : { start: w.offset, end: w.offset }, true);
        },
        // 13.10.2026 (gesty jak w Docs): klik w odstęp między zdaniami (albo obok krótkiej linii, poza wierszem) wchodzi
        // w edycję najbliższego zdania, z kursorem na tej wysokości (w dokumencie nie ma „martwych” miejsc).
        naKlikWKolumnie(kol, ev) {
            if (this.linkMode || this.ciagly() || ev.target !== ev.currentTarget || (ev.detail || 1) > 1 || ev.shiftKey) return;
            if (!this._obokSiebie() || this.dotyk) return;
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed) return;
            let naj = null, odl = Infinity;
            ev.currentTarget.querySelectorAll('[data-' + kol + '-idx]').forEach(w => {
                const r = w.getBoundingClientRect();
                const d = ev.clientY < r.top ? r.top - ev.clientY : Math.max(0, ev.clientY - r.bottom);
                if (d < odl) { odl = d; naj = w; }
            });
            if (!naj || odl > this._ODSTEP_KLIKU) return;
            const r = naj.getBoundingClientRect();
            this._edytujZdanie(kol, Number(naj.getAttribute('data-' + kol + '-idx')),
                               { x: ev.clientX, y: Math.max(r.top + 2, Math.min(ev.clientY, r.bottom - 2)) }, true);
        },
        _ODSTEP_KLIKU: 16,   // px: dalej od zdania klik w kolumnę nic nie robi (np. dobieg na końcu kolumny)
        // Ostatnie kliknięcie w tej kolumnie (sprzed chwili), jednorazowo.
        _wezKlik(kol) {
            const k = this._klik;
            if (!k || k.kol !== kol || performance.now() - k.t > 1500) return null;
            if (!k.uzyty) this._klik = Object.assign({}, k, { uzyty: true });
            return k;
        },
        // Zdanie kliknięte przy mousedown po ewentualnym przesunięciu wierszy: najbliższe zdanie o tym samym tekście.
        _celKliku(klik) {
            const S = this._zdaniaKol(klik.kol);
            let naj = -1;
            S.forEach((t, i) => { if (t === klik.tekst && (naj < 0 || Math.abs(i - klik.idx) < Math.abs(naj - klik.idx))) naj = i; });
            if (naj < 0) return klik.idx < S.length && klik.offset !== null ? { idx: klik.idx, offset: Math.min(klik.offset, String(S[klik.idx]).length) } : null;
            return { idx: naj, offset: klik.offset };   // null = punkt kliknięcia (caretRangeFromPoint) przy kliknięciu
        },
        _punktKursora(x, y) {
            // caretRangeFromPoint = Chromium/WebKit, caretPositionFromPoint = Firefox.
            try {
                if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
                if (document.caretPositionFromPoint) {
                    const cp = document.caretPositionFromPoint(x, y);
                    if (!cp) return null;
                    const r = document.createRange();
                    r.setStart(cp.offsetNode, cp.offset); r.collapse(true);
                    return r;
                }
            } catch (e) {}
            return null;
        },
        // Wejście w edycję zdania `idx` z kursorem: {start, end} (pozycje znaków w zdaniu), {x, y} (punkt ekranu),
        // {x, linia: 'pierwsza'|'ostatnia'} (strzałka w dół/górę: ta sama kolumna ekranu), 'koniec' albo 'poczatek'.
        // 13.10.2026 (gesty jak w Google Docs): kursor stawiamy OD RAZU (odrazu: klik, wiersze są już aktualne) albo
        // zaraz po przeliczeniu Alpine (mikrozadanie po zapisie poprzedniego zdania), a nie w $nextTick (setTimeout):
        // tam drugie kliknięcie dwukliku przychodziło wcześniej i kursor kasował zaznaczone słowo, a litery wpisane
        // tuż po kliknięciu albo strzałce trafiały w zdanie bez edycji i ginęły. contenteditable ustawiamy sami
        // (tę samą wartość, co wiązanie Alpine), samo focus() wrzuciłoby kursor na początek.
        _edytujZdanie(kol, idx, gdzie, odrazu) {
            this._ustawEdytowany(kol, idx);
            const zrob = () => {
                if (this._edytowany(kol) !== idx) return true;   // w międzyczasie edycję przejęło inne zdanie
                const el = this._wiersz(kol, idx);
                if (!el || !el.isConnected) return false;
                try {
                    if (!el.isContentEditable) el.setAttribute('contenteditable', 'plaintext-only');
                    el.focus({ preventScroll: true });
                    if (!odrazu) this._pokazWiersz(el);   // przejście klawiszem: sąsiednie zdanie mogło być poza kolumną
                    const dl = skryptyPlLinearyzuj(el).tekst.length;
                    if (gdzie === 'koniec' || gdzie === 'poczatek') { this._ustawZaznaczenieW(el, gdzie === 'koniec' ? dl : 0); return true; }
                    if (gdzie && typeof gdzie.start === 'number') { this._ustawZaznaczenieW(el, Math.min(gdzie.start, dl), Math.min(gdzie.end, dl)); return true; }
                    if (gdzie && gdzie.linia) {
                        const cale = document.createRange(); cale.selectNodeContents(el);
                        const linie = [...cale.getClientRects()].filter(z => z.height > 0);
                        const l = gdzie.linia === 'ostatnia' ? linie[linie.length - 1] : linie[0];
                        const r = l ? this._punktKursora(Math.max(l.left + 1, Math.min(gdzie.x, l.right - 1)), l.top + l.height / 2) : null;
                        if (r && el.contains(r.startContainer)) { const s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(r); }
                        else this._ustawZaznaczenieW(el, gdzie.linia === 'ostatnia' ? dl : 0);
                        return true;
                    }
                    const r = gdzie ? this._punktKursora(gdzie.x, gdzie.y) : null;
                    if (r && el.contains(r.startContainer)) {
                        const s2 = window.getSelection();
                        s2.removeAllRanges(); s2.addRange(r);
                    }
                } catch (e) {}
                return true;
            };
            if (odrazu && zrob()) return;
            queueMicrotask(() => { if (!zrob()) setTimeout(zrob, 0); });
        },
        // 13.10.2026 (gesty jak w Google Docs): klawisze na granicy edytowanego zdania („Zdanie po zdaniu”).
        // Strzałka w lewo/w górę na początku (pierwszej linii) przechodzi do poprzedniego zdania, w prawo/w dół na
        // końcu (ostatniej linii) do następnego; Backspace na początku i Delete na końcu łączą zdania (nowa linia
        // albo pusta linia między nimi staje się spacją) albo, gdy już stoją w jednej linii, przechodzą przez granicę.
        // Nic nie ginie: wpisany tekst zapisuje się razem z przejściem (jeden krok Cofnij).
        naKlawiszWEdycji(kol, idx, e) {
            if (this.linkMode || this._edytowany(kol) !== idx || e.defaultPrevented || e.isComposing || e.keyCode === 229) return;
            const k = e.key;
            if (!/^(Backspace|Delete|ArrowLeft|ArrowRight|ArrowUp|ArrowDown)$/.test(k) || e.shiftKey || e.metaKey || e.ctrlKey) return;
            if (e.altKey && /^Arrow(Up|Down)$/.test(k)) return;
            const el = e.currentTarget, sel = window.getSelection();
            if (!el || !el.isContentEditable || !sel || !sel.rangeCount || !sel.isCollapsed || !el.contains(sel.focusNode)) return;
            const lin = skryptyPlLinearyzuj(el, { node: sel.focusNode, offset: sel.focusOffset });
            const n = this._dlugosc(kol);
            let kier = 0;
            if ((k === 'Backspace' || k === 'ArrowLeft') && lin.poz === 0 && idx > 0) kier = -1;
            else if ((k === 'Delete' || k === 'ArrowRight') && lin.poz >= lin.tekst.length && idx < n - 1) kier = 1;
            else if (k === 'ArrowUp' && idx > 0 && this._naKrawedziLinii(el, sel, 'gora')) kier = -1;
            else if (k === 'ArrowDown' && idx < n - 1 && this._naKrawedziLinii(el, sel, 'dol')) kier = 1;
            if (!kier) return;
            e.preventDefault();
            if (k === 'Backspace' || k === 'Delete') { this._scalZdania(kol, idx, kier, el); return; }
            const x = /^Arrow(Up|Down)$/.test(k) ? this._xKursora(sel) : null;
            this._przejdzDoZdania(kol, idx, kier, el, x);
        },
        // Wiersz w całości na widoku swojej kolumny (przewijamy tylko kolumnę, nie stronę).
        _pokazWiersz(el) {
            const pane = el.closest && el.closest('[data-sc-pane]');
            if (!pane) return;
            const p = pane.getBoundingClientRect(), r = el.getBoundingClientRect();
            if (r.top < p.top) pane.scrollTop -= p.top - r.top + 8;
            else if (r.bottom > p.bottom) pane.scrollTop += Math.min(r.bottom - p.bottom + 8, r.top - p.top - 8);
        },
        _xKursora(sel) {
            try {
                const r = sel.getRangeAt(0).cloneRange(); r.collapse(false);
                const q = r.getClientRects()[0] || r.getBoundingClientRect();
                return q && (q.left || q.right) ? q.left : null;
            } catch (e) { return null; }
        },
        // Czy kursor stoi w pierwszej ('gora') albo ostatniej ('dol') linii zdania (zdanie zawija się na kilka linii).
        _naKrawedziLinii(el, sel, strona) {
            const lin = skryptyPlLinearyzuj(el, { node: sel.focusNode, offset: sel.focusOffset });
            if (strona === 'gora' && lin.poz === 0) return true;
            if (strona === 'dol' && lin.poz >= lin.tekst.length) return true;
            try {
                const r = sel.getRangeAt(0).cloneRange(); r.collapse(true);
                const q = r.getClientRects()[0];
                const cale = document.createRange(); cale.selectNodeContents(el);
                const linie = [...cale.getClientRects()].filter(z => z.height > 0);
                if (!q || !linie.length) return false;
                const wys = linie[0].height || 16;
                return strona === 'gora' ? q.top < linie[0].top + wys / 2 : q.bottom > linie[linie.length - 1].bottom - wys / 2;
            } catch (e) { return false; }
        },
        // Zapis edytowanego zdania i edycja sąsiedniego (kier -1 / +1) z kursorem na styku albo na wysokości x.
        _przejdzDoZdania(kol, idx, kier, el, x) {
            const S = this._zdaniaKol(kol), tekstCelu = S[idx + kier];
            el.blur();   // @blur zapisuje poprawkę (zmiana podziału może przesunąć numery zdań)
            const S2 = this._zdaniaKol(kol);
            let cel = -1;
            S2.forEach((t, i) => {
                if (t !== tekstCelu || (kier > 0 ? i <= idx - 1 : i > idx)) return;
                if (cel < 0 || Math.abs(i - (idx + kier)) < Math.abs(cel - (idx + kier))) cel = i;
            });
            if (cel < 0) cel = Math.max(0, Math.min(S2.length - 1, idx + kier));
            // Góra/dół: ta sama kolumna ekranu, w ostatniej (w górę) albo pierwszej (w dół) linii sąsiada.
            this._edytujZdanie(kol, cel, (x === null || x === undefined) ? (kier < 0 ? 'koniec' : 'poczatek')
                                                                   : { x: x, linia: kier < 0 ? 'ostatnia' : 'pierwsza' });
        },
        // Backspace na początku / Delete na końcu zdania: łączy je z poprzednim / następnym. Gdy dzieli je nowa linia
        // (albo pusta linia akapitu), staje się ona spacją (linie łączą się w jedną, jak akapity w dokumencie); gdy
        // zdania stoją już w jednej linii, nie ma czego łączyć: kursor przechodzi przez granicę. Wpisany tekst zdania
        // i połączenie to jeden krok Cofnij.
        _scalZdania(kol, idx, kier, el) {
            const S = this._zdaniaKol(kol), a = kier < 0 ? idx - 1 : idx;
            const surowy = String(this[this._pole(kol)] || '');
            const zCRLF = surowy.indexOf('\r\n') !== -1;
            const zrodlo = zCRLF ? surowy.replace(/\r\n/g, '\n') : surowy;
            const zak = kol === 'pl' ? this._plOffsets(zrodlo) : skryptyPlZakresy(zrodlo, S);
            const sep = zak && zak[a] && zak[a + 1] ? zrodlo.slice(zak[a][1], zak[a + 1][0]) : '';
            if (!zak || !zak[a] || !zak[a + 1] || !zak[idx] || sep.indexOf('\n') === -1) { this._przejdzDoZdania(kol, idx, kier, el, null); return; }
            const wpis = String(el.innerText || '').replace(/\s+/g, ' ').trim();
            let nowy, styk;
            if (kier < 0) {
                nowy = zrodlo.slice(0, zak[a][1]) + (wpis ? ' ' + wpis : '') + zrodlo.slice(zak[idx][1]);
                styk = zak[a][1];
            } else {
                nowy = zrodlo.slice(0, zak[idx][0]) + wpis + (wpis ? ' ' : '') + zrodlo.slice(zak[a + 1][0]);
                styk = zak[idx][0] + wpis.length;
            }
            // Edytowane zdanie przestaje być w edycji PRZED oddaniem fokusu: @blur nie zapisuje go drugi raz.
            this._ustawEdytowany(kol, null);
            el.blur();
            this._zmienTekstKolumny(kol, zCRLF ? nowy.replace(/\n/g, '\r\n') : nowy);
            // Zdanie, w którym wypadł styk, i miejsce kursora w nim.
            const S2 = this._zdaniaKol(kol), T2 = this._tekstLF(kol);
            const zak2 = kol === 'pl' ? (this._plOffsets(T2) || []) : skryptyPlZakresy(T2, S2);
            let cel = zak2.findIndex(z => z && z[0] <= styk && styk <= z[1]);
            if (cel < 0) cel = Math.max(0, Math.min(S2.length - 1, a));
            const offset = zak2[cel] ? Math.max(0, styk - zak2[cel][0]) : 0;
            this._edytujZdanie(kol, cel, { start: offset, end: offset });
        },
        // Kliknięcie zdania ORYG/EN (13.10.2026, edycja w kolumnach): na szerokim ekranie z myszą od razu edycja,
        // na telefonie i dotyku jak w polskim: pierwsze stuknięcie pokazuje odpowiedniki, drugie edytuje.
        kliknijZdanie(kol, idx, ev) {
            if (this.linkMode) { this.kliknijWLinku(kol, idx, ev.shiftKey); return; }
            const klucz = kol + ':' + idx;
            if ((!this._obokSiebie() || this.dotyk) && this._edytowany(kol) !== idx && this._wybranyNaTelefonie !== klucz) {
                this.najedz(kol, idx, ev);
                this._wybranyNaTelefonie = klucz;
                return;
            }
            this.beginEdit(kol, idx, ev);
        },
        handlePlSelectAll(e) { return this.handleSelectAll('pl', e); },
        handleSelectAll(kol, e) {
            // W dokumencie Cmd+A zaznacza CALY tekst, nie sam akapit z kursorem.
            // Bez tego Cmd+A w trakcie edycji brałoby tylko jedno zdanie.
            if (!(e.metaKey || e.ctrlKey) || String(e.key).toLowerCase() !== 'a') return;
            // 13.10.2026 (edycja w kolumnach): w „Ciągłym tekście” kolumna jest jednym polem edycji, więc
            // Cmd+A przeglądarki zaznacza właśnie ją, a pisanie zastępuje zaznaczenie (jak w dokumencie).
            const cel = e.target && (e.target.nodeType === 1 ? e.target : e.target.parentElement);
            if (cel && cel.closest && cel.closest('[data-sc-ciagly]')) return;
            e.preventDefault();
            if (kol === 'pl') this.selectAllPl(); else this.zaznaczKolumne(kol);
        },
        selectAllPl() {
            // Zaznacza całą kolumnę PL jednym kliknięciem, potem zwykłe Cmd+C.
            const pane = this._el('panePl');
            if (!pane) return;
            // Kolejność jest istotna: wyjście z edycji ZDEJMUJE zaznaczenie, więc
            // najpierw oddajemy fokus (to też zatwierdza poprawkę przez @blur),
            // a zaznaczamy dopiero po tym, jak przeglądarka to przetrawi. Odwrotna
            // kolejność dawała zaznaczenie o długości zero.
            const active = document.activeElement;
            if (active && active.blur && pane.contains(active)) active.blur();
            this.editingPlIdx = null;
            // Krytyk r9 #2: w trybie wiązania wiersze mają user-select: none, więc zaznaczenie wychodziło
            // puste, a Cmd+C kopiował pustą linię. Najpierw wychodzimy z wiązania.
            if (this.linkMode) this.toggleLinkMode();
            this.$nextTick(() => setTimeout(() => {
                const r = document.createRange();
                r.selectNodeContents(pane);
                const s2 = window.getSelection();
                s2.removeAllRanges(); s2.addRange(r);
                const ok = s2.toString().trim().length > 0;
                this._zaznaczonyPl = ok ? s2.toString() : null;
                (window.appToast && appToast(ok ? ((this.dotyk || !this.szeroki) ? oppenT('Zaznaczono polski tekst: skopiuj go z menu systemu albo użyj „Kopiuj PL”.') : oppenTf('Zaznaczono polski tekst: {0} kopiuje', [this.skrot('C')])) : oppenT('Nie udało się zaznaczyć tekstu: użyj „Kopiuj PL”.'),
                                             { variant: ok ? 'info' : 'warning' }));
            }, 0));
        },
        // 13.10.2026 (edycja w kolumnach): Cmd+A w oryginale albo angielskim zaznacza tę kolumnę (bez komunikatu).
        zaznaczKolumne(kol) {
            const pane = this._pane(kol);
            if (!pane) return;
            const active = document.activeElement;
            if (active && active.blur && pane.contains(active)) active.blur();
            this._ustawEdytowany(kol, null);
            if (this.linkMode) this.toggleLinkMode();
            this.$nextTick(() => setTimeout(() => {
                const r = document.createRange();
                r.selectNodeContents(pane);
                const s2 = window.getSelection();
                s2.removeAllRanges(); s2.addRange(r);
                const t = s2.toString();
                this._zaznaczonyKol = t.trim() ? { kol: kol, tekst: t } : null;
            }, 0));
        },
        // Krytyk r11 #2: kopia zaznaczenia z „Zaznacz PL” to tekst skryptu (bez pustej linii na początku
        // i między wierszami, które dokładała przeglądarka z akapitów <p> i odstępów kolumny).
        // 13.10.2026 (edycja w kolumnach): to samo dla oryginału i angielskiego, a w „Ciągłym tekście”
        // kopiujemy dokładnie zaznaczony kawałek tekstu kolumny, zawsze jako zwykły tekst.
        naKopiuj(e) {
            const sel = window.getSelection();
            if (!sel || !e.clipboardData || sel.isCollapsed) return;
            const zrodlo = String(this.plText || '').replace(/\r\n?/g, '\n');
            if (this._zaznaczonyPl && sel.toString() === this._zaznaczonyPl) {
                e.clipboardData.setData('text/plain', zrodlo.trim());
                e.preventDefault();
                return;
            }
            const zk = this._zaznaczonyKol;
            if (zk && sel.toString() === zk.tekst) {
                e.clipboardData.setData('text/plain', this._tekstLF(zk.kol).trim());
                e.preventDefault();
                return;
            }
            const ciag = this._zaznaczenieCiagle(sel);
            if (ciag !== null) {
                e.clipboardData.setData('text/plain', ciag);
                e.preventDefault();
                return;
            }
            // Krytyk r17 #4: kilka zdań zaznaczonych myszą: między zdaniami to, co jest w skrypcie
            // (nowa linia albo spacja), a nie pusta linia, którą przeglądarka robi z akapitów <p>.
            const kol = ['orig', 'en', 'pl'].find(k => {
                const p = this._pane(k);
                return p && p.contains(sel.anchorNode) && p.contains(sel.focusNode);
            });
            if (!kol) return;
            const pane = this._pane(kol), zr = this._tekstLF(kol);
            const wiersze = [...pane.querySelectorAll('[data-' + kol + '-idx]')].filter(w => sel.containsNode(w, true));
            if (wiersze.length < 2) return;
            const czesci = sel.toString().split(/\n\n/);
            const offs = kol === 'pl' ? this._plOffsets(zr) : skryptyPlZakresy(zr, this._zdaniaKol(kol));
            const i0 = Number(wiersze[0].getAttribute('data-' + kol + '-idx'));
            if (!offs || czesci.length !== wiersze.length) return;
            let tekst = czesci[0];
            for (let k = 1; k < czesci.length; k++) {
                const a = offs[i0 + k - 1], b = offs[i0 + k];
                const sep = (a && b) ? zr.slice(a[1], b[0]) : '\n';
                tekst += (sep.indexOf('\n') !== -1 ? sep.replace(/[ \t]+/g, '') : ' ') + czesci[k];
            }
            e.clipboardData.setData('text/plain', tekst);
            e.preventDefault();
        },
        // Wklejanie w edytowane zdanie albo kolumnę „Ciągły tekst”: zawsze jako zwykły tekst.
        naWklej(e) {
            const t = e.target, el = t && (t.nodeType === 1 ? t : t.parentElement);
            if (e.defaultPrevented || !el || !el.isContentEditable || !e.clipboardData) return;
            const tekst = String(e.clipboardData.getData('text/plain') || '').replace(/\r\n?/g, '\n');
            e.preventDefault();
            if (tekst) document.execCommand('insertText', false, tekst);
        },
        // Krytyk r12 #9: skróty po ludzku dla systemu (Mac: Cmd, Windows i Linux: Ctrl).
        skrot(klawisz) {
            const mac = /Mac|iPhone|iPad/i.test((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '');
            return (mac ? 'Cmd+' : 'Ctrl+') + klawisz;
        },
        // Krytyk r13 #1 (bloker, dane): w akapicie dopisek bez kropki przechodzi do NASTĘPNEGO zdania
        // (podział na nowo), a liczba zdań się nie zmienia, więc wiersze nie były budowane od nowa:
        // ekran pokazywał stary podział, a kolejne opuszczenie wiersza zapisywało go drugi raz
        // (podwójny tekst w skrypcie i w kopii). Każdy wiersz, którego nikt teraz nie edytuje,
        // dostaje tekst z zapisanego skryptu.
        // Krytyk r20 #8: strzałki góra/dół między zdaniami kolumny (jeden przystanek Tab na kolumnę).
        _strzalka(kol, idx, krok) {
            const n = this._dlugosc(kol), cel = Math.max(0, Math.min(n - 1, idx + krok));
            const pane = this._pane(kol), w = pane && pane.querySelector('[data-' + kol + '-idx="' + cel + '"]');
            if (w) { this.tabIdx[kol] = cel; w.focus(); w.scrollIntoView({ block: 'nearest' }); }
        },
        _zapamietajWidok(mP) {
            const pane = this._el('panePl');
            if (!pane) return null;
            const pr = pane.getBoundingClientRect();
            let idx = this._kotwicaIdx;
            this._kotwicaIdx = null;
            let row = (idx !== null && idx !== undefined) ? pane.querySelector('[data-pl-idx="' + idx + '"]') : null;
            if (row && (row.getBoundingClientRect().bottom < pr.top || row.getBoundingClientRect().top > pr.bottom)) row = null;
            if (!row) {
                row = [...pane.querySelectorAll('[data-pl-idx]')].find(r => r.getBoundingClientRect().bottom > pr.top + 4) || null;
                idx = row ? Number(row.getAttribute('data-pl-idx')) : null;
            }
            if (!row) return { top: pane.scrollTop };
            let nowy = idx;
            if (mP && mP[idx] !== null && mP[idx] !== undefined) nowy = mP[idx];
            return { idx: nowy, off: row.getBoundingClientRect().top - pr.top, top: pane.scrollTop };
        },
        _przywrocWidok(w) {
            const pane = this._el('panePl');
            if (!w || !pane) return;
            this._programowe.pl = performance.now() + 400;   // nasze przewinięcie: pozostałe kolumny nie jadą
            const i = Math.max(0, Math.min(w.idx === undefined || w.idx === null ? 0 : w.idx, this.plS.length - 1));
            const row = (w.idx !== undefined && w.idx !== null) ? pane.querySelector('[data-pl-idx="' + i + '"]') : null;
            if (row) pane.scrollTop += row.getBoundingClientRect().top - pane.getBoundingClientRect().top - w.off;
            else pane.scrollTop = w.top;
        },
        // 13.10.2026 (edycja w kolumnach): każda kolumna; zdania kontenera „Ciągły tekst” to kawałki
        // surowego tekstu (nie wiersze), ich nie ruszamy.
        _zgrajWiersze(kol) {
            const k = kol || 'pl';
            const pane = this._pane(k);
            if (!pane) return;
            const a = document.activeElement, S = this._zdaniaKol(k);
            pane.querySelectorAll('[data-' + k + '-idx]').forEach(w => {
                if (w === a && w.isContentEditable) return;
                if (w.closest && w.closest('[data-sc-ciagly]')) return;
                const t = S[Number(w.getAttribute('data-' + k + '-idx'))];
                if (t !== undefined && w.textContent !== t) w.textContent = t;
            });
        },
        _ostrzezNieaktualna() {
            if (performance.now() - (this._ostrzezonoO || -1e9) < 10000) return;
            this._ostrzezonoO = performance.now();
            (window.appToast && appToast(oppenT('Skrypty zmieniono w innej karcie. Odśwież tę kartę, żeby nie nadpisać tamtych zmian.'),
                { variant: 'warning', duration: 15000, actionLabel: oppenT('Odśwież'), action: () => location.reload() }));
        },
        // Linie (w akapitach pisanych linia pod linią), w których stoi więcej niż jedno zdanie.
        _liniiWieluZdan(tekst) {
            let n = 0;
            for (const p of String(tekst || '').replace(/\r\n?/g, '\n').split(/\n\n+/)) {
                if (p.indexOf('\n') === -1) continue;
                for (const l of p.split('\n')) if (l.trim() && this._splitSentencesRegex(l).length > 1) n++;
            }
            return n;
        },
        liniiWieluZdan() { return (this.dzielenie === 'auto' ? 0 : this._liniiWieluZdan(this.origText) + this._liniiWieluZdan(this.enText)) + this._liniiWieluZdan(this.plText); },
        liniiWieluZdanZrodel() { return this._liniiWieluZdan(this.origText) + this._liniiWieluZdan(this.enText); },
        _podzielTekst(tekst) {
            return String(tekst || '').replace(/\r\n?/g, '\n').split(/(\n\n+)/).map(p => {
                if (/^\n\n+$/.test(p) || p.indexOf('\n') === -1) return p;
                return p.split('\n').map(l => l.trim() ? this._splitSentencesRegex(l).join('\n') : l).join('\n');
            }).join('');
        },
        podzielLinie() {
            this.origText = this._podzielTekst(this.origText);
            this.enText = this._podzielTekst(this.enText);
            this.plText = this._podzielTekst(this.plText);
            this.enterCompare({ bezPrzewijania: true });
            (window.appToast && appToast(oppenT('Podzielono linie na zdania.'), { variant: 'success' }));
        },
        _wierszWTrybieLinii(idx) {
            const zrodlo = String(this.plText || '').replace(/\r\n?/g, '\n');
            const offs = this._plOffsets(zrodlo);
            if (!offs || idx >= offs.length) return false;
            const a = offs[idx][0];
            const pocz = zrodlo.lastIndexOf('\n\n', a), kon = zrodlo.indexOf('\n\n', a);
            const akapit = zrodlo.slice(pocz < 0 ? 0 : pocz + 2, kon < 0 ? zrodlo.length : kon);
            return akapit.indexOf('\n') !== -1;
        },
                _plJoinParagraphs(sents, idx, removed, zrodlo) {
            // Awaryjne skladanie tekstu, gdy nie da sie podmienic zdania w miejscu
            // (splitter potrafi wstawic spacje, ktorej nie ma w zrodle, np. przy
            // „Dosc!”!, i wtedy indexOf nie trafia). Stare `join('\n')` kasowalo
            // wtedy WSZYSTKIE akapity, czyli dokladnie ten blad, ktory naprawiamy.
            // Tutaj odtwarzamy uklad: ile zdan mial kazdy akapit, tyle mu oddajemy.
            // 1.1.336: `zrodlo` to tekst ZNORMALIZOWANY do LF. Bez niego ten
            // podzial nie dzialal na CRLF w ogole: miedzy dwoma `\n` stoi tam `\r`,
            // ktorego `[ \t]*` nie przepuszcza, wiec caly skrypt szedl jako JEDEN
            // akapit, a skladanie przez `join('\n')` przepisywalo dokument na LF.
            const paras = (zrodlo || this.plText).split(/\n[ \t]*\n/);
            const counts = paras.map(p => this.splitSentences(p).length);
            if (counts.reduce((x, y) => x + y, 0) !== this.plS.length) return null;
            if (removed) {
                let seen = 0;
                for (let i = 0; i < counts.length; i++) {
                    if (idx < seen + counts[i]) { counts[i] -= 1; break; }
                    seen += counts[i];
                }
            }
            const out = [];
            let pos = 0;
            counts.forEach((c, i) => {
                // Krytyk r20 #2: akapit pisany ciągiem zostaje ciągiem, tylko akapit linii dostaje nowe linie.
                if (c > 0) out.push(sents.slice(pos, pos + c).join(paras[i] && paras[i].indexOf('\n') !== -1 ? '\n' : ' '));
                pos += c;
            });
            return out.filter(x => x.length).join('\n\n');
        },
        _plOffsets(zrodlo) {
            // Pozycje kolejnych zdań w plText. Pozwalają podmienić JEDNO zdanie w
            // miejscu, zamiast składać tekst od nowa przez join('\n'), to ostatnie
            // kasowało WSZYSTKIE puste linie, czyli podział na akapity, po pierwszej
            // poprawce (zmierzone: akapity przed edycją tak, po edycji nie).
            const T = zrodlo || this.plText;
            let cur = 0;
            const offs = [];
            for (const sent of this.plS) {
                const i = T.indexOf(sent, cur);
                if (i < 0) return null;          // rozjazd → wracamy do starej ścieżki
                offs.push([i, i + sent.length]);
                cur = i + sent.length;
            }
            return offs;
        },
        updatePlSentence(idx, newText) {
            this._kotwicaIdx = idx;   // krytyk r19 #1: ten wiersz zostaje na swoim miejscu po przebudowie
            let clean = String(newText || '').replace(/\s+/g, ' ').trim();
            if (idx >= this.plS.length) return;
            // Krytyk r10 #4: Shift+Enter w tekście wklejonym zdanie pod zdaniem (tryb linii) dzieli
            // wiersz na dwa. W akapicie (tryb zdań) nowa linia zmieniłaby podział całego akapitu,
            // więc tam zostaje spacją (nowe zdanie i tak wydziela kropka).
            if (this._wierszWTrybieLinii(idx)) {
                // Krytyk r20 #5: w tekście zdanie pod zdaniem dopisane drugie zdanie staje się nowym wierszem
                // (tak jak Shift+Enter), więc para z angielskim i braki liczą się zdaniami.
                clean = String(newText || '').split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
                    .flatMap(l => this._splitSentencesRegex(l)).join('\n');
            }
            // 1.1.211: plS trzyma surowe NBSP/podwójne spacje, porównanie znormalizowanego
            // tekstu z surowym uznawało samo kliknięcie (blur bez zmian) za edycję.
            const cur = String(this.plS[idx] || '').replace(/\s+/g, ' ').trim();
            if (clean === cur) return;
            const oldValue = this.plText;
            // 1.1.336: `splitSentences` normalizuje CRLF, wiec `plS` jest zawsze
            // w LF, a `plText` nie, i cala arytmetyka szwu ponizej liczy ciagi
            // `\n`, ktore w CRLF rozdziela `\r`. Zmierzone: `updatePlSentence(idx,
            // '')` na tym samym zdaniu zostawialo JEDNA pusta linie w skrypcie LF
            // i DWIE w CRLF, bo `head.replace(/\n+$/, '')` scinal tylko koncowy
            // `\n` i zostawial osieroconego `\r`. Skrypty wklejane z Worda i z
            // Google Docs na Windowsie sa wlasnie CRLF.
            const zCRLF = this.plText.indexOf('\r\n') !== -1;
            const zrodlo = zCRLF ? this.plText.replace(/\r\n/g, '\n') : this.plText;
            const offs = this._plOffsets(zrodlo);
            let newValue;
            if (offs && idx < offs.length) {
                // Podmiana W MIEJSCU: wszystko poza tym jednym zdaniem zostaje co do
                // bajtu, więc akapity, puste linie i P.S. przeżywają dowolnie wiele poprawek.
                // Przy wycięciu sprzątamy WYŁĄCZNIE szew po zdaniu. Globalne regexy po całym
                // tekście (tak było najpierw) po cichu zjadały cudze formatowanie: zmierzone,
                // kasowanie zdania w akapicie A sklejało podwójne spacje w akapicie C i ścinało
                // wcięcie akapitu E. 13.10.2026 (edycja w kolumnach): ten sam kod w
                // skryptyPlPodmienZakres, wspólny z edycją oryginału i angielskiego.
                const [a, b] = offs[idx];
                newValue = skryptyPlPodmienZakres(zrodlo, a, b, clean);
            } else {
                const sents = [...this.plS];
                if (clean) sents[idx] = clean; else sents.splice(idx, 1);
                const rebuilt = this._plJoinParagraphs(sents, idx, !clean, zrodlo);
                newValue = (rebuilt === null) ? sents.join('\n') : rebuilt;
            }
            // Konce linii wracaja takie, jakie przyniosl uzytkownik.
            if (zCRLF) newValue = newValue.replace(/\n/g, '\r\n');
            this.undoStack.push({ kol: 'pl', old: oldValue, neu: newValue });   // 13.10.2026: krok wie, której kolumny dotyczy
            if (this.undoStack.length > 100) this.undoStack.shift();
            this.redoStack = [];
            this._applyPl(newValue, true);   // tekst juz jest w DOM, user go wpisal
        },
        // Krytyk r2 #2: krok cofania pamięta też powiązania i mapę AI (przed i po zmianie),
        // więc Cmd+Z przywraca DOKŁADNIE stan sprzed edycji, a nie tylko tekst.
        // Krytyk r3 #2: mapa AI NIE wchodzi do zwykłego kroku cofania (inaczej Cofnij kroku
        // sprzed dopasowania kasowało opłaconą mapę). Wchodzi tylko do kroku „usuń mapę AI”.
        _stan(zAi) {
            const st = { kp: this.anchorsPl, ko: this.anchorsOrig };
            if (zAi) { st.ap = this.aiPlToEn; st.ao = this.aiOrigToEn; st.bp = this.aiBrakPl; st.bo = this.aiBrakOrig; st.gen = this._genAi; }
            return JSON.parse(JSON.stringify(st));
        },
        _przywrocStan(st) {
            this.anchorsPl = st.kp || []; this.anchorsOrig = st.ko || [];
            // Krytyk r9 #1: krok z mapą AI sprzed NOWSZEGO dopasowania nie podmienia ani nie kasuje
            // nowej, opłaconej mapy (zmieniają się tylko powiązania z tego kroku).
            if ('ap' in st && st.gen === this._genAi) { this.aiPlToEn = st.ap || null; this.aiOrigToEn = st.ao || null; this.aiBrakPl = st.bp || []; this.aiBrakOrig = st.bo || []; }
        },
        // Pamięć odpowiedzi AI per zdanie (tekst zdania -> tekst zdania EN albo null = dodatek):
        // zdanie usunięte i przywrócone (Cofnij) albo wpisane jeszcze raz odzyskuje swoją parę.
        _norm(t) { return String(t || '').replace(/\s+/g, ' ').trim(); },
        _zapamietajAi(zdaniaEn, zdania, mapa, kol) {
            if (!mapa) return;
            const pam = this._aiPamiec[kol];
            mapa.forEach((v, i) => {
                if (i >= zdania.length) return;
                if (v === null) pam[this._norm(zdania[i])] = null;
                else if (v >= 0 && v < zdaniaEn.length) pam[this._norm(zdania[i])] = this._norm(zdaniaEn[v]);
            });
        },
        _uzupelnijAi() {
            for (const [kol, klucz, zdania] of [['pl', 'aiPlToEn', this.plS], ['orig', 'aiOrigToEn', this.origS]]) {
                const mapa = this[klucz], pam = this._aiPamiec[kol];
                if (!mapa || !Object.keys(pam).length) continue;
                const enN = this.enS.map(t => this._norm(t));
                // Krytyk r15 #1: „dodatek” (brak pary EN) był prawdą dla angielskiego z chwili dopasowania.
                // Gdy w angielskim są zdania, których AI nie widziało, ten werdykt mógł się zdezaktualizować.
                const enAi = this._aiPamiec.en;
                const enNowe = Array.isArray(enAi) && enN.some(t => !enAi.includes(t));
                let zm = false;
                const nowa = mapa.map((v, i) => {
                    if (v !== -1 && v !== -2 && v !== undefined) return v;
                    const k = this._norm(zdania[i]);
                    if (!(k in pam)) return v;
                    if (pam[k] === null) { if (enNowe) { zm = zm || v !== -2; return -2; } zm = true; return null; }
                    zm = true;
                    // najbliższe zdanie EN o tym tekście (powtórzenia: bliżej spodziewanej pozycji)
                    const oczek = Math.round(i * this.enS.length / Math.max(1, zdania.length));
                    let naj = -1;
                    enN.forEach((t, j) => { if (t === pam[k] && (naj < 0 || Math.abs(j - oczek) < Math.abs(naj - oczek))) naj = j; });
                    return naj >= 0 ? naj : v;   // krytyk r15 #5: bez pary EN zostaje -2 (nie „nowe po AI”)
                });
                if (zm) this[klucz] = nowa;
            }
        },
        _krokStanu(przed, zAi) {
            this.undoStack.push({ old: this.plText, neu: this.plText, przed: przed, po: this._stan(zAi) });
            if (this.undoStack.length > 100) this.undoStack.shift();
            this.redoStack = [];
        },
        // Krytyk r7 #2: zdanie przeredagowane w miejscu (ta sama liczba zdań, sąsiedzi na swoich
        // miejscach) to TO SAMO zdanie, nie usunięte: zachowuje mapę AI i powiązanie.
        _wMiejscu(mP, n) {
            if (!mP || mP.length !== n) return mP;
            const zajete = new Set(mP.filter(v => v !== null && v !== undefined));
            return mP.map((v, i) => {
                if (v !== null && v !== undefined) return v;
                const lewy = i === 0 || mP[i - 1] === i - 1, prawy = i === n - 1 || mP[i + 1] === i + 1;
                return (lewy && prawy && !zajete.has(i)) ? i : v;
            });
        },
        _applyPl(value, fromDom, stan) {
            // 11.10.2026: zamiast kasować mapę AI i powiązania przy każdej zmianie
            // podziału zdań, przenosimy je na nowe zdania (najdłuższy wspólny podciąg).
            // Poprawka słowa w zdaniu nie zmienia nic; rozbicie zdania na dwa przesuwa
            // tylko to, co jest za nim.
            const stare = this.plS;
            const ostatni = this.undoStack[this.undoStack.length - 1];
            const wpis = (fromDom && ostatni && !ostatni.przed && ostatni.neu === value) ? ostatni : null;
            if (wpis) wpis.przed = this._stan(true);   // 13.10.2026 (edycja w kolumnach): krok tekstu pamięta też mapę AI (przywracaną tylko przy tym samym _genAi)
            this.plText = value;
            this.plS = this.splitSentences(value);
            const prevLen = stare.length;
            let mPKlik = null;
            if (this.plS.length !== prevLen || this.plS.some((s, i) => s !== stare[i])) {
                const mP = this._wMiejscu(window.ZdaniaMapa.przemapuj(stare, this.plS), this.plS.length);
                mPKlik = mP;
                const przed = this.anchorsPl.length;
                this.anchorsPl = this.anchorsPl.map(a => ({ en: a.en, pl: mP[a.pl] }))
                    .filter(a => a.pl !== null && a.pl !== undefined);
                this.aiPlToEn = this._przeniesAi(this.aiPlToEn, mP, null, this.plS.length);
                if (!stan && this.anchorsPl.length < przed) {
                    this._toastUsunietychId = window.appToast ? appToast(oppenTf('Usunięto powiązania ({0}): ich zdanie zniknęło po edycji.', [przed - this.anchorsPl.length])) : null;
                }
            }
            if (stan) this._przywrocStan(stan);   // Cofnij/Ponów: powiązania dokładnie jak w migawce
            this._uzupelnijAi();
            if (wpis) wpis.po = this._stan(true);
            if (this._baza) this._baza = { en: this._baza.en, orig: this._baza.orig, pl: [...this.plS] };
            this._przelicz();
            this._saveDraft();
            // Krytyk r2 #13: kliknięcie w inne zdanie w trakcie zatwierdzania (zmiana liczby zdań
            // przebudowuje listę i „połyka” klik): wchodzimy w edycję zdania, w które kliknięto.
            // 13.10.2026 (gesty jak w Google Docs): kursor tam, gdzie kliknięto (zdanie odszukane po tekście z chwili
            // mousedown, to samo miejsce w nim), a nie na końcu zdania; klik, który jednak dotrze do nowego wiersza,
            // jest już obsłużony (beginEdit go pomija), więc nie przeskakuje do innego zdania.
            const klik = this._klik;
            if (this._klikPo !== null && this.plS.length !== prevLen && klik && klik.kol === 'pl' && !klik.uzyty
                && performance.now() - klik.t < 1500) {
                this._klikPo = null;
                this._klik = Object.assign({}, klik, { uzyty: true });
                const m = mPKlik ? mPKlik[klik.idx] : klik.idx;
                const r = this._celKliku(Object.assign({}, klik, { idx: (m === null || m === undefined) ? klik.idx : m }));
                // Edycja startuje przy puszczeniu myszy (mouseup; kliku Chromium nie wysyła, bo wiersz spod mousedown
                // zniknął) albo zaraz po tym zdarzeniu (setTimeout: po domyślnej akcji mousedown i po @blur poprzedniego
                // zdania). NIE $nextTick: Alpine wstrzymuje go na czas animacji (toast), a litery wpisane w tym czasie ginęły.
                const wejscie = r ? { kol: 'pl', idx: r.idx, offset: r.offset } : null;
                this._wejscieKliku = wejscie;
                if (wejscie) setTimeout(() => { if (this._wejscieKliku === wejscie) this._wejdzPoKliku(); }, 0);
            }
            // Triple check 1.1.218: re-mount CALEJ listy przy kazdym zapisie rozbijal
            // przejscie klikniciem z jednego zdania na drugie. Kolejnosc zdarzen jest
            // taka: mousedown na B -> blur na A -> zapis -> revision++ -> Alpine
            // podmienia WSZYSTKIE akapity -> klikniety element B jest juz odpiety,
            // wiec jego @click nie odpala i B nie wchodzi w edycje (trzeba bylo
            // klikac dwa razy). Gdy zmiana przyszla Z DOM-u i podzial zdan sie nie
            // zmienil, przegladarka pokazuje juz nowy tekst, wiec nie ma czego
            // przebudowywac.
            // Krytyk r19 #1: przebudowa tylko wtedy, gdy tekst naprawdę się zmienił (cofnięcie samego
            // powiązania albo mapy AI nie przebudowuje kolumny), a po przebudowie widok zostaje: wiersz
            // edytowany (albo pierwszy widoczny) wraca dokładnie na swoje miejsce w kolumnie.
            const tekstInny = this.plS.length !== prevLen || this.plS.some((s, i) => s !== stare[i]);
            if ((!fromDom && tekstInny) || this.plS.length !== prevLen) {
                const widok = this._zapamietajWidok(mPKlik);
                this.revision++;
                this.$nextTick(() => this._przywrocWidok(widok));
            } else this.$nextTick(() => this._zgrajWiersze());
        },
        handleUndoKeys(e) {
            const k = String(e.key || '').toLowerCase();
            // Krytyk r13 #8: Ctrl+Y (Windows, Linux) też ponawia krok. 13.10.2026 (gesty jak w Google Docs): na Macu
            // Cmd+Y jak w Dokumentach Google, ale tylko przy kolumnach (fokus w kolumnie albo jest co ponowić), żeby
            // poza nimi zostawał skrót przeglądarki (historia).
            const mac = !this.skrot('Z').startsWith('Ctrl');
            const el = document.activeElement;
            const ponowY = k === 'y' && !e.shiftKey && !e.altKey && (mac
                ? (e.metaKey && !e.ctrlKey && this.mode === 'results' && (this.redoStack.length > 0 || !!(el && el.closest && el.closest('[data-sc-pane]'))))
                : (e.ctrlKey && !e.metaKey));
            if (!(e.metaKey || e.ctrlKey) || (k !== 'z' && !ponowY)) return;
            if (e.defaultPrevented || this._oknoOtwarte()) return;   // krytyk r5 #5
            // Pole tekstowe ma własne Cofnij; checkbox Auto-scroll już nie blokuje skrótu.
            const tekstowe = el && el.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes(el.type);
            if (el && (tekstowe || el.tagName === 'TEXTAREA')) return;
            const ponow = e.shiftKey || ponowY;
            // 13.10.2026 (edycja w kolumnach): kolumna „Ciągły tekst” korzysta z kroków aplikacji (przebudowa
            // kolumny kasuje natywne Cofnij przeglądarki): to, co wpisano przed chwilą, staje się krokiem i od razu
            // się cofa, a kolejne Cmd+Z idą przez wszystkie kolumny w kolejności zmian.
            const ciagla = el && el.getAttribute && el.getAttribute('data-sc-ciagly');
            if (ciagla) {
                e.preventDefault();
                this._zatwierdzCiagly(ciagla);
                // Kolumna wyczyszczona do zera (takiej zmiany nie zapisujemy): Cmd+Z oddaje jej tekst.
                if (el._scBrudny && !ponow && !skryptyPlLinearyzuj(el).tekst.trim()) {
                    el._scBrudny = false;
                    this._odswiezCiagle(ciagla, { wymus: true, fokus: true, zaznaczenie: { start: 0, end: 0 } });
                    return;
                }
                if (ponow) this.redoLast(); else this.undoLast();
                return;
            }
            if (el && el.isContentEditable) {
                // Zdanie w edycji: dopóki ma niezatwierdzone zmiany, Cofnij przeglądarki cofa pisanie w nim;
                // bez zmian (albo po ich cofnięciu) Cmd+Z cofa poprzednie kroki, jak w dokumencie.
                const kol = ['orig', 'en', 'pl'].find(x => el.hasAttribute('data-' + x + '-idx'));
                if (!kol) return;
                const idx = Number(el.getAttribute('data-' + kol + '-idx'));
                if (this._norm(el.innerText) !== this._norm(this._zdaniaKol(kol)[idx])) {
                    // Pisanie w zdaniu: Cofnij/Ponów przeglądarki. Cmd+Y na Macu to w Chrome historia, więc ponawiamy sami.
                    if (k === 'y') { e.preventDefault(); document.execCommand('redo'); }
                    return;
                }
                e.preventDefault();
                el.blur();
                if (ponow) this.redoLast(); else this.undoLast();
                return;
            }
            e.preventDefault();
            if (ponow) this.redoLast(); else this.undoLast();
        },
        undoLast() {
            const entry = this.undoStack.pop();
            if (!entry) return;
            this.redoStack.push(entry);
            this._wykonajKrok(entry, entry.old, entry.przed);
        },
        redoLast() {
            const entry = this.redoStack.pop();
            if (!entry) return;
            this.undoStack.push(entry);
            this._wykonajKrok(entry, entry.neu, entry.po);
        },
        // 13.10.2026 (edycja w kolumnach): krok dotyczy kolumny entry.kol (dawne kroki bez pola = polski).
        _wykonajKrok(entry, tekst, stan) {
            const kol = entry.kol || 'pl';
            const przed = this._zdaniaKol(kol), przedTekst = this._tekstLF(kol);
            const a = document.activeElement;
            const zCiaglego = !!(a && a.getAttribute && a.getAttribute('data-sc-ciagly'));
            this._applyKol(kol, tekst, false, stan);
            if (this.mode === 'results' && this.ciagly()) this._kursorPoKroku(kol, przedTekst, zCiaglego);
            else this._fokusPoKroku(przed, kol);
        },
        // Krytyk r8 #8: po Cmd+Z fokus wraca na zmienione zdanie (Tab i Enter działają dalej stamtąd).
        _fokusPoKroku(przed, kol) {
            const k = kol || 'pl', S = this._zdaniaKol(k);
            // Krytyk r11 #7: komunikat o usuniętym powiązaniu jest nieaktualny po Cofnij/Ponów.
            const st = window.Alpine && Alpine.store && Alpine.store('dialog');
            if (st && this._toastUsunietychId) { st.dismissToast(this._toastUsunietychId); this._toastUsunietychId = null; }
            const a = document.activeElement;
            const zKlawiatury = !a || a === document.body || (a.closest && a.closest('[data-sc-pane]'));
            if (!zKlawiatury || !S.length) return;
            let i = 0;
            while (i < przed.length && i < S.length && przed[i] === S[i]) i++;
            // Krytyk r19 #2: tekst bez zmian (cofnięte powiązanie albo mapa AI): fokus zostaje, gdzie był.
            if (i === przed.length && i === S.length) return;
            const cel = Math.min(i, S.length - 1);
            this.$nextTick(() => {
                const w = this._wiersz(k, cel);
                if (w) { this._cichyFokus = true; w.focus({ preventScroll: true }); this._cichyFokus = false; }
            });
        },

        // ── 13.10.2026 (edycja w kolumnach): wspólne pomocnicze ──
        _pole(kol) { return { orig: 'origText', en: 'enText', pl: 'plText' }[kol]; },
        _zdaniaKol(kol) { return kol === 'orig' ? this.origS : (kol === 'en' ? this.enS : this.plS); },
        _tekstLF(kol) { return String(this[this._pole(kol)] || '').replace(/\r\n?/g, '\n'); },
        _edytowany(kol) {
            const v = this[{ orig: 'editingOrigIdx', en: 'editingEnIdx', pl: 'editingPlIdx' }[kol]];
            return v === undefined ? null : v;
        },
        _ustawEdytowany(kol, v) { this[{ orig: 'editingOrigIdx', en: 'editingEnIdx', pl: 'editingPlIdx' }[kol]] = v; },
        _wiersz(kol, idx) { const p = this._pane(kol); return p && p.querySelector('p[data-' + kol + '-idx="' + idx + '"]'); },
        _kontener(kol) { return this._q('[data-sc-ciagly="' + kol + '"]'); },
        ciagly() { return this.edycja === 'ciagly' && !this.linkMode; },
        _edytowanaKolumna(kol) {
            if (this._edytowany(kol) !== null) return true;
            const el = this._kontener(kol);
            return !!el && typeof document !== 'undefined' && document.activeElement === el;
        },
        ustawEdycje(t) {
            const nowy = t === 'ciagly' ? 'ciagly' : 'zdania';
            if (nowy === this.edycja) return;
            this._zatwierdzWszystko();
            this.edycja = nowy;
            try { localStorage.setItem('xray_edycja', nowy); } catch (e) {}
        },
        // Wszystko, co wpisano, a jeszcze nie zapisano (zdanie w edycji, kolumna „Ciągły tekst” w trakcie pisania).
        _zatwierdzWszystko() {
            if (typeof document === 'undefined') return;
            const a = document.activeElement;
            if (a && a.isContentEditable && !(a.hasAttribute && a.hasAttribute('data-sc-ciagly'))
                && ['orig', 'en', 'pl'].some(k => a.hasAttribute && a.hasAttribute('data-' + k + '-idx'))) {
                try { a.blur(); } catch (e) {}   // @blur zdania zapisuje poprawkę
            }
            for (const k of ['orig', 'en', 'pl']) this._zatwierdzCiagly(k, { koniec: true });
        },
        // Zmiana tekstu kolumny przez użytkownika (oba tryby edycji): jeden krok Cofnij i przeniesienie
        // mapy AI i powiązań na nowe zdania.
        _zmienTekstKolumny(kol, nowy) {
            const stary = String(this[this._pole(kol)] || '');
            if (nowy === stary) return false;
            this.undoStack.push({ kol: kol, old: stary, neu: nowy });
            if (this.undoStack.length > 100) this.undoStack.shift();
            this.redoStack = [];
            this._applyKol(kol, nowy, true);
            return true;
        },
        // Nowy tekst kolumny: zdania od nowa, mapa AI i powiązania przeniesione (ZdaniaMapa.przemapuj przez
        // _przeniesNa, dokładnie jak przy edycji tekstu). Zmiana angielskiego przenosi indeksy EN w OBU mapach
        // AI (polskiej i oryginału) i w obu listach powiązań. Polski idzie dawną drogą _applyPl.
        _applyKol(kol, value, fromDom, stan) {
            if (kol === 'pl') return this._applyPl(value, fromDom, stan);
            const pole = this._pole(kol), stare = this._zdaniaKol(kol);
            const ostatni = this.undoStack[this.undoStack.length - 1];
            const wpis = (fromDom && ostatni && (ostatni.kol || 'pl') === kol && !ostatni.przed && ostatni.neu === value) ? ostatni : null;
            if (wpis) wpis.przed = this._stan(true);
            this[pole] = value;
            const nowe = this._zdaniaKolumny(value);
            const inne = nowe.length !== stare.length || nowe.some((z, i) => z !== stare[i]);
            if (inne) {
                if (!this._baza) this._baza = { orig: [...this.origS], en: [...this.enS], pl: [...this.plS] };
                this._przeniesNa({ orig: kol === 'orig' ? nowe : this.origS, en: kol === 'en' ? nowe : this.enS, pl: this.plS },
                                 { wMiejscu: true, cicho: !!stan });
            }
            if (stan) this._przywrocStan(stan);   // Cofnij/Ponów: powiązania (i mapa AI z tego samego dopasowania) jak w migawce
            this._uzupelnijAi();
            if (wpis) wpis.po = this._stan(true);
            this._baza = { orig: [...this.origS], en: [...this.enS], pl: [...this.plS] };
            this._przelicz();
            this._saveDraft();
            if (!fromDom || inne) this.$nextTick(() => this._zgrajWiersze(kol));
        },
        // „Zdanie po zdaniu” w oryginale i angielskim: zatwierdzenie zdania podmienia TYLKO jego fragment
        // surowego tekstu (akapity, puste linie, wcięcia i CRLF reszty zostają co do bajtu). W trybie dzielenia
        // „Automatyczne” zdanie bywa kawałkiem linii: podmieniamy ten kawałek, linia zostaje linią.
        updateZdanie(kol, idx, newText) {
            if (kol === 'pl') return this.updatePlSentence(idx, newText);
            const S = this._zdaniaKol(kol);
            if (idx >= S.length) return;
            const surowy = String(this[this._pole(kol)] || '');
            const zCRLF = surowy.indexOf('\r\n') !== -1;
            const zrodlo = zCRLF ? surowy.replace(/\r\n/g, '\n') : surowy;
            const zak = skryptyPlZakresy(zrodlo, S)[idx];
            let wLinii = false;
            if (zak) {
                const pocz = zrodlo.lastIndexOf('\n\n', zak[0]), kon = zrodlo.indexOf('\n\n', zak[0]);
                wLinii = zrodlo.slice(pocz < 0 ? 0 : pocz + 2, kon < 0 ? zrodlo.length : kon).trim().indexOf('\n') !== -1;
            }
            // Shift+Enter w akapicie pisanym linia pod linią dzieli linię; w akapicie ciągłym nowa linia to spacja.
            const clean = wLinii
                ? String(newText || '').split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n')
                : String(newText || '').replace(/\s+/g, ' ').trim();
            if (clean === this._norm(S[idx]) || (wLinii && clean === String(S[idx]).trim())) return;
            if (!clean && S.length === 1) { this._toastPustaKolumna(); this.$nextTick(() => this._zgrajWiersze(kol)); return; }
            let nowy = zak ? skryptyPlPodmienZakres(zrodlo, zak[0], zak[1], clean) : this._przebudujAkapit(kol, zrodlo, idx, clean);
            if (nowy === null) {
                (window.appToast && appToast(oppenT('Nie udało się zapisać poprawki: tekst kolumny ma nietypowy układ. Popraw to zdanie w „Wróć do tekstów”.'), { variant: 'error', duration: 7000 }));
                this.$nextTick(() => this._zgrajWiersze(kol));
                return;
            }
            if (zCRLF) nowy = nowy.replace(/\n/g, '\r\n');   // końce linii wracają takie, jakie przyniósł użytkownik
            this._zmienTekstKolumny(kol, nowy);
        },
        _toastPustaKolumna() {
            (window.appToast && appToast(oppenT('Kolumna nie może zostać pusta: przywrócono jej tekst. Całą kolumnę usuniesz w „Wróć do tekstów”.'), { variant: 'warning', duration: 6000 }));
        },
        // Awaryjnie, gdy zdania nie da się wskazać w surowym tekście: przebudowa TYLKO jego linii (akapit
        // pisany linia pod linią) albo jego akapitu; reszta tekstu zostaje co do bajtu. null = nie ruszamy nic.
        _przebudujAkapit(kol, zrodlo, idx, clean) {
            const czesci = zrodlo.split(/(\n\n+)/);
            const auto = kol !== 'pl' && this.dzielenie === 'auto';
            const zdaniaAk = (p) => kol === 'pl' ? this.splitSentences(p) : this._zdaniaKolumny(p);
            const liczby = czesci.map((c, i) => (i % 2 ? 0 : zdaniaAk(c).length));
            if (liczby.reduce((x, y) => x + y, 0) !== this._zdaniaKol(kol).length) return null;
            let widziane = 0;
            for (let i = 0; i < czesci.length; i += 2) {
                if (idx >= widziane + liczby[i]) { widziane += liczby[i]; continue; }
                const k = idx - widziane, p = czesci[i];
                const lead = p.match(/^\s*/)[0], trail = p.slice(lead.length).match(/\s*$/)[0];
                const rdzen = p.slice(lead.length, p.length - trail.length);
                let nowyRdzen = null;
                // Akapit linii tak jak w silniku zdań: o trybie decyduje cały kawałek (także końcowa nowa linia).
                const linii = p.indexOf('\n') !== -1;
                if (linii) {
                    const linie = rdzen.split('\n');
                    let w = 0;
                    for (let j = 0; j < linie.length; j++) {
                        const l = linie[j];
                        const zl = !l.trim() ? [] : (auto ? this._splitSentencesRegex(l) : [l.trim()]);
                        if (k >= w + zl.length) { w += zl.length; continue; }
                        const nz = zl.slice();
                        if (clean) nz[k - w] = clean; else nz.splice(k - w, 1);
                        if (nz.length) linie[j] = l.match(/^\s*/)[0] + nz.join(' ');
                        else linie.splice(j, 1);
                        nowyRdzen = linie.join('\n');
                        break;
                    }
                }
                if (nowyRdzen === null) {
                    const nz = zdaniaAk(p);
                    if (clean) nz[k] = clean; else nz.splice(k, 1);
                    nowyRdzen = nz.join(linii ? '\n' : ' ');
                }
                if (nowyRdzen.trim()) { czesci[i] = lead + nowyRdzen + trail; return czesci.join(''); }
                // Akapit zniknął w całości: razem z jednym odstępem akapitów (przed nim, a gdy to pierwszy, za nim).
                if (i > 0) czesci.splice(i - 1, 2); else czesci.splice(i, 2);
                return czesci.join('');
            }
            return null;
        },
        // Cofnij/Ponów w „Ciągłym tekście”: kolumna od nowa, kursor (gdy pisałeś w kolumnie) na końcu zmiany.
        _kursorPoKroku(kol, przedTekst, zCiaglego) {
            const st = window.Alpine && Alpine.store && Alpine.store('dialog');
            if (st && this._toastUsunietychId) { st.dismissToast(this._toastUsunietychId); this._toastUsunietychId = null; }
            const po = this._tekstLF(kol);
            let p = 0;
            while (p < przedTekst.length && p < po.length && przedTekst[p] === po[p]) p++;
            let s = 0;
            while (s < przedTekst.length - p && s < po.length - p && przedTekst[przedTekst.length - 1 - s] === po[po.length - 1 - s]) s++;
            const kursor = po.length - s;
            this._odswiezCiagle(kol, zCiaglego ? { wymus: true, fokus: true, zaznaczenie: { start: kursor, end: kursor } } : { wymus: true });
        },

        // ── 13.10.2026 (edycja w kolumnach): tryb „Ciągły tekst” ──
        // Kontener kolumny (contenteditable="plaintext-only") jest NASZYM DOM-em, poza Alpine (x-for na
        // edytowalnych dzieciach psuł tekst): spany zdań z tymi samymi data-*-idx co wiersze, odstępy jako
        // zwykły tekst. Po przerwie w pisaniu (700 ms) albo wyjściu z kolumny czytamy tekst, liczymy zdania,
        // przenosimy mapy i powiązania (_applyKol) i budujemy spany od nowa z kursorem w tym samym miejscu.
        _PRZERWA_CIAGLY: 700,
        _podepnijCiagly(kol, el) {
            if (!el || el._scPodpiety) return;
            el._scPodpiety = true;
            const zaplanuj = () => {
                el._scBrudny = true;
                clearTimeout(el._scT);
                el._scT = setTimeout(() => this._zatwierdzCiagly(kol), this._PRZERWA_CIAGLY);
            };
            el.addEventListener('input', (e) => { if (!e.isComposing) zaplanuj(); });
            // Znak składany (martwy klawisz, IME): przebudowa w trakcie składania zgubiłaby go, czekamy na koniec.
            el.addEventListener('compositionstart', () => { el._scSklada = true; });
            el.addEventListener('compositionend', () => { el._scSklada = false; zaplanuj(); });
            el.addEventListener('blur', () => { this._zatwierdzCiagly(kol, { koniec: true }); el._scNad = null; this.zjedz(); });
            const zdanieZ = (cel) => {
                const e1 = cel && (cel.nodeType === 1 ? cel : cel.parentElement);
                const s = e1 && e1.closest ? e1.closest('[data-' + kol + '-idx]') : null;
                return s && el.contains(s) ? s : null;
            };
            el.addEventListener('mouseover', (e) => {
                const s = zdanieZ(e.target);
                if (!s || s === el._scNad) return;
                el._scNad = s;
                this.najedz(kol, Number(s.getAttribute('data-' + kol + '-idx')), { type: 'mouseenter', currentTarget: s, clientX: e.clientX, clientY: e.clientY });
            });
            el.addEventListener('mouseleave', () => { el._scNad = null; this.zjedz(); });
            // Kursor przesuwany klawiaturą albo kliknięciem: odpowiedniki zdania, w którym stoi.
            const poKursorze = () => {
                const sel = window.getSelection();
                const s = sel && sel.rangeCount ? zdanieZ(sel.focusNode) : null;
                if (!s || s === el._scNad) return;
                el._scNad = s;
                this.najedz(kol, Number(s.getAttribute('data-' + kol + '-idx')), { type: 'focus', currentTarget: s });
            };
            el.addEventListener('keyup', (e) => { if (/^(Arrow|Home|End|Page)/.test(e.key)) poKursorze(); });
            el.addEventListener('mouseup', () => setTimeout(poKursorze, 0));
            // Wklejanie obsługuje @paste kolumny (naWklej): zawsze zwykły tekst.
            el.addEventListener('cut', (e) => {
                const t = this._zaznaczenieCiagle(window.getSelection());
                if (t === null || !e.clipboardData) return;
                e.clipboardData.setData('text/plain', t);
                e.preventDefault();
                document.execCommand('delete');   // wycięcie = usunięcie zaznaczenia (zdarzenie input zapisze zmianę)
            });
            this.$nextTick(() => this._odswiezCiagle(kol));
        },
        _zatwierdzCiagly(kol, opcje) {
            const el = this._kontener(kol);
            if (!el || !el._scBrudny) return false;
            clearTimeout(el._scT);
            if (el._scSklada && !(opcje && opcje.koniec)) return false;   // compositionend zaplanuje zapis
            const tekst = skryptyPlLinearyzuj(el).tekst;
            if (tekst === this._tekstLF(kol)) { el._scBrudny = false; return false; }
            if (!tekst.trim()) {
                // W trakcie pisania (zaznaczyłeś wszystko i piszesz od nowa) czekamy; przy wyjściu przywracamy tekst.
                if (!(opcje && opcje.koniec)) return false;
                el._scBrudny = false;
                this._toastPustaKolumna();
                this._odswiezCiagle(kol, { wymus: true });
                return false;
            }
            el._scBrudny = false;
            const zazn = document.activeElement === el ? this._zaznaczenieW(el) : null;
            const surowy = String(this[this._pole(kol)] || '');
            this._zmienTekstKolumny(kol, surowy.indexOf('\r\n') !== -1 ? tekst.replace(/\n/g, '\r\n') : tekst);
            this._odswiezCiagle(kol, { wymus: true, zaznaczenie: zazn });
            return true;
        },
        // Buduje spany kolumny, gdy jej tekst albo zdania różnią się od wyświetlonych (albo `wymus`).
        // Kolumny, w której ktoś właśnie pisze, nie ruszamy (wpisany tekst ma pierwszeństwo).
        _odswiezCiagle(kol, opcje) {
            if (typeof document === 'undefined') return;
            const el = this._kontener(kol);
            if (!el) return;
            const o = opcje || {};
            if (!(this.mode === 'results' && this.ciagly())) {
                // Poza tym trybem kontener jest pusty: ukryte spany z data-*-idx myliłyby przewijanie wierszy.
                clearTimeout(el._scT);
                el._scBrudny = false; el._scPodpis = null; el._scNad = null;
                if (el.firstChild) el.textContent = '';
                return;
            }
            if (el._scBrudny && !o.wymus) return;
            const tekst = this._tekstLF(kol), zdania = this._zdaniaKol(kol);
            const podpis = JSON.stringify([tekst, zdania]);
            if (!o.wymus && el._scPodpis === podpis) return;
            const fokus = document.activeElement === el;
            const zazn = o.zaznaczenie || (fokus ? this._zaznaczenieW(el) : null);
            this._renderujCiagly(el, kol, tekst, zdania);
            el._scPodpis = podpis;
            if (o.fokus && !fokus) { try { el.focus({ preventScroll: true }); } catch (e) {} }
            if (zazn && (fokus || o.fokus)) this._ustawZaznaczenieW(el, zazn.start, zazn.end);
        },
        _renderujCiagly(el, kol, tekst, zdania) {
            const frag = document.createDocumentFragment();
            for (const k of skryptyPlKawalkiCiagle(tekst, zdania)) {
                if (k.idx === null) { frag.appendChild(document.createTextNode(k.tekst)); continue; }
                const s = document.createElement('span');
                s.setAttribute('data-' + kol + '-idx', String(k.idx));
                s.className = this._klasaCiagla(kol, k.idx);
                const t = this._wierszTitle(kol, k.idx);
                if (t) s.setAttribute('title', t);
                s.textContent = k.tekst;
                frag.appendChild(s);
            }
            // Pusta ostatnia linia potrzebuje wypełniacza, inaczej kursor nie ma gdzie stanąć (nie jest znakiem tekstu).
            if (tekst.endsWith('\n')) frag.appendChild(document.createElement('br'));
            el.textContent = '';
            el.appendChild(frag);
        },
        _klasaCiagla(kol, idx) { return 'sc-zdanie-ciagle ' + this._wierszClass(kol, idx); },
        // Podświetlenia (najechanie, odpowiedniki, dodatki AI, powiązania) na spanach, jak _wierszClass na wierszach.
        _klasyCiagle(kol) {
            const el = this._kontener(kol);
            if (!el) return;
            el.querySelectorAll('[data-' + kol + '-idx]').forEach(s => {
                const i = Number(s.getAttribute('data-' + kol + '-idx'));
                const c = this._klasaCiagla(kol, i);
                if (s.className !== c) s.className = c;
                const t = this._wierszTitle(kol, i);
                if ((s.getAttribute('title') || '') !== t) { if (t) s.setAttribute('title', t); else s.removeAttribute('title'); }
            });
        },
        _efektyCiagle() {
            const A = typeof window !== 'undefined' && window.Alpine;
            if (!A || typeof A.effect !== 'function') return;
            // Treść kontenerów: zmiana tekstu, zdań, trybu (Cofnij, dzielenie, przełącznik).
            // Budowa poza efektem (mikrozadanie), żeby efekt nie śledził podświetleń.
            A.effect(() => {
                void [this.mode, this.edycja, this.linkMode, this.dzielenie, this.origText, this.enText, this.plText,
                      this.origS, this.enS, this.plS];
                queueMicrotask(() => { for (const k of ['orig', 'en', 'pl']) this._odswiezCiagle(k); });
            });
            // Klasy spanów: te same zależności co _wierszClass (czytane jawnie, także zanim spany powstaną).
            A.effect(() => {
                void [this.mode, this.edycja, this.linkMode, this.aktywne, this.chipAktywny, this.linkWybrane, this.anchorsPl,
                      this.anchorsOrig, this.mapaPl, this.mapaOrig, this.enS, this._aiPamiec && this._aiPamiec.en];
                if (!(this.mode === 'results' && this.ciagly())) return;
                for (const k of ['orig', 'en', 'pl']) this._klasyCiagle(k);
            });
        },
        _zaznaczenieW(el) {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount || !el.contains(sel.anchorNode) || !el.contains(sel.focusNode)) return null;
            return { start: skryptyPlLinearyzuj(el, { node: sel.anchorNode, offset: sel.anchorOffset }).poz,
                     end: skryptyPlLinearyzuj(el, { node: sel.focusNode, offset: sel.focusOffset }).poz };
        },
        _ustawZaznaczenieW(el, start, end) {
            try {
                const a = skryptyPlPunkt(el, start), f = skryptyPlPunkt(el, end === undefined ? start : end);
                window.getSelection().setBaseAndExtent(a.node, a.offset, f.node, f.offset);
            } catch (e) {}
        },
        // Zaznaczenie w całości wewnątrz jednej kolumny „Ciągły tekst”: dokładny kawałek jej tekstu, inaczej null.
        _zaznaczenieCiagle(sel) {
            if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
            const kont = (n) => { const e1 = n && (n.nodeType === 1 ? n : n.parentElement); return e1 && e1.closest ? e1.closest('[data-sc-ciagly]') : null; };
            const el = kont(sel.anchorNode);
            if (!el || kont(sel.focusNode) !== el) return null;
            const a = skryptyPlLinearyzuj(el, { node: sel.anchorNode, offset: sel.anchorOffset }).poz;
            const f = skryptyPlLinearyzuj(el, { node: sel.focusNode, offset: sel.focusOffset }).poz;
            return skryptyPlLinearyzuj(el).tekst.slice(Math.min(a, f), Math.max(a, f));
        },

        // ── Pacing (150 wpm, wzorzec detail.html) ──
        // 13.10.2026 (Ads X-Ray): liczenie słów i czasu ze wspólnego silnika (XZdania).
        _countWords(t) { return this._Z().liczSlowa(t); },
        _secondsFromWords(n) { return this._Z().sekundyZSlow(n); },
        _durationLabel(sec) { return this._Z().etykietaCzasu(sec); },
        _pacingDelta() {
            const ref = this._countWords(this.origText) || this._countWords(this.enText);
            if (!ref) return 0;
            return Math.round(((this._countWords(this.plText) - ref) / ref) * 100);
        },
        _pacingDeltaLabel() {
            const d = this._pacingDelta();
            return (d > 0 ? '+' : '') + d + '% vs ' + (this._countWords(this.origText) ? oppenT('oryginał') : 'EN');
        },
        _pacingClass() {
            const a = Math.abs(this._pacingDelta());
            return a <= 15 ? 'text-emerald-700 dark:text-emerald-400'
                 : a <= 30 ? 'text-amber-700 dark:text-amber-400'
                 : 'text-red-700 dark:text-red-400';
        },

        // ── Kopiowanie PL ──
        // 13.10.2026 (Ads X-Ray): najnowsza wersja z script_compare.html siedzi w XZdania.
        _stripEmDashes(t) { return t; },
        copyPL(kind) {
            this._zatwierdzWszystko();   // 13.10.2026 (edycja w kolumnach): niezapisana edycja w kolumnie najpierw
            const out = kind === 'fb' ? skryptyPlTekstFb(this.plText, this._Z()) : skryptyPlTekstAkapity(this.plText);
            navigator.clipboard.writeText(out).then(() => {
                this.copied = kind;
                setTimeout(() => { this.copied = ''; }, 1500);
            }).catch(() => (window.appToast && appToast(oppenT('Nie udało się skopiować'), { variant: 'error' })));
        },
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { xraySkryptyPl, skryptyPlTekstFb, skryptyPlTekstAkapity, skryptyPlZakresy,
                       skryptyPlLinearyzuj, skryptyPlPunkt, skryptyPlKawalkiCiagle, skryptyPlPodmienZakres };
}
