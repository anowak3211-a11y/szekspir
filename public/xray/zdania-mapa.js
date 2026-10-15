/* ============================================================================
   zdania-mapa.js: dopasowanie zdań dwóch wersji jednego skryptu dla /script-compare
   (oś English ↔ Polski, oś English ↔ Oryginał). Czysty silnik: zero DOM i sieci.

   Dlaczego tak (11.10.2026, zgłoszenie właściciela „na końcu się rozjeżdża”):
   stara mapa po pierwszej ręcznej kotwicy liczyła KAŻDE dalsze zdanie jako
   „kotwica + przesunięcie” i ignorowała mapę AI. Wystarczyło, że polska wersja
   rozbiła jedno angielskie zdanie na dwa, a wszystko za tym miejscem świeciło
   o jedno zdanie obok.

   Teraz:
   - ręczne powiązania są TWARDE: zdania połączone powiązaniami (także pośrednio,
     np. jedno angielskie z dwoma polskimi) zawsze lądują w jednej grupie. Blok to
     MINIMUM grupy: może wchłonąć sąsiednie zdania bez powiązania (jedno kliknięcie
     przy zdaniu rozbitym na dwa nie psuje sąsiada), płacąc za kształt tyle co
     zwykła grupa;
   - reszta: programowanie dynamiczne Gale'a i Churcha (długość zdań w znakach,
     grupy do 1-12 i 12-1, zdania bez odpowiednika), plus mapa AI jako ciężka,
     ale MIĘKKA wskazówka. Powiązanie, które przeczy mapie AI, unieważnia dalsze
     wiersze AI aż do następnego powiązania (typowy błąd „o jedno zdanie”), więc
     jedno powiązanie naprawia cały ogon, a nie tylko swój wiersz;
   - zdanie bez odpowiednika (AI: „dodatek” po jednej stronie, pominięte po
     drugiej) zostaje osobno, zamiast doklejać się do sąsiada;
   - odcinek o równej liczbie zdań bez mapy AI zostaje 1:1, chyba że długości
     bardzo wyraźnie mówią co innego (kara za grupę inną niż 1-1).
   Guard module.exports: sprawdzenia w node.
   ==========================================================================*/
var ZdaniaMapa = (function () {
  'use strict';

  // [ile EN, ile drugiej strony, prawdopodobieństwo a priori]
  var GRUPY = [[1, 1, 0.89], [1, 2, 0.089], [2, 1, 0.089], [2, 2, 0.011],
               [1, 3, 0.006], [3, 1, 0.006], [2, 3, 0.002], [3, 2, 0.002],
               [1, 4, 0.002], [4, 1, 0.002], [1, 5, 0.0007], [5, 1, 0.0007],
               [1, 6, 0.0003], [6, 1, 0.0003], [1, 0, 0.0099], [0, 1, 0.0099]];
  // Długie zdania oryginału (transkrypt z mało kropkami): 1-7 … 1-12 z malejącym priorytetem.
  for (var gk = 7; gk <= 12; gk++) {
    var gp = 0.0003 * Math.pow(0.5, gk - 6);
    GRUPY.push([gk, 1, gp], [1, gk, gp]);
  }
  var LOG_PRIOR = GRUPY.map(function (g) { return -Math.log(g[2]); });
  // Priorytet kształtu dowolnej grupy (także bloku z dokładką): ten sam co zwykłej grupy
  // o tym kształcie, więc blok wchłania sąsiada tylko wtedy, gdy zwykła grupa też by go wzięła.
  function logPriorKsztaltu(a, b) {
    for (var g = 0; g < GRUPY.length; g++) if (GRUPY[g][0] === a && GRUPY[g][1] === b) return LOG_PRIOR[g];
    var mn = Math.min(a, b), mx = Math.max(a, b);
    if (mn <= 1) return -Math.log(0.0003 * Math.pow(0.5, mx - 6));
    return -Math.log(0.002 * Math.pow(0.3, a + b - 5));
  }
  var WARIANCJA = 6.8;          // Gale-Church, wariancja długości na znak
  var KARA_AI = 7;              // zdanie oddzielone od odpowiednika z mapy AI
  var KARA_AI_SIEROTA = 8;      // AI: „dodatek”, a grupa daje mu parę
  var KOSZT_SIEROTY_AI = 1;     // samotna grupa 0-1 dla zdania, które AI uznało za dodatek
  var KARA_ROWNE = 3.5;         // grupa inna niż 1-1 w odcinku o równej liczbie zdań bez AI
  var KARA_OGONA = 2;           // krytyk r7 #1: dalsze zdanie EN grupy, którego AI nikomu nie wskazało
                                // (pominięte czy ogon sklejenia: wygrywa sklejenie tylko przy wyraźnej długości)
  var MAKS_DL_PUSTEJ = 1.5;     // limit kary długości dla zdania EN bez pary, gdy AI go nie wskazało
  var DOKLEJ_PRZED = 6;         // ile zdań bez powiązania blok może wchłonąć przed sobą (każda kolumna)
  var DOKLEJ_ZA = 11;           // … i za sobą (powiązanie zwykle stoi przy pierwszym zdaniu grupy)
  var WAGA_POZYCJI = 2;         // odejście od przekątnej (ułamki długości obu tekstów)
  var PREMIA_LICZBA = 0.8;      // ta sama liczba (100, 4) po obu stronach grupy
  var LIMIT_KOMOREK = 120000;   // ~345 x 345 zdań (ok. 1 s); powyżej proporcja między powiązaniami
  var NIEZNANE = -1;            // w mapie AI: brak informacji (nie „dodatek”)

  function erfc(x) {            // Numerical Recipes erfcc, błąd < 1.2e-7
    var z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
      t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 +
      t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  function logOgon(x) {         // log P(Z > x) dla x >= 0, bez log(0) w ogonie
    if (x < 6) return Math.log(Math.max(1e-300, 0.5 * erfc(x / Math.SQRT2)));
    return -x * x / 2 - Math.log(x) - 0.9189385332046727;
  }
  function dlugosc(s) { return String(s || '').replace(/\s+/g, ' ').trim().length; }
  function liczby(s) { return String(s || '').match(/\d+/g) || []; }
  function znany(v) { return typeof v === 'number' && v >= 0; }

  /* Grupy proporcjonalne (zapas na gigantyczne odcinki i na odcinek z jedną pustą
     stroną). K = krótsza lista: każda grupa ma co najmniej jedno zdanie z każdej
     strony, bo floor(y + r) - floor(y) >= floor(r) >= 1 dla r = n / K >= 1. */
  function proporcja(nE, nX, e0, x0) {
    var grupy = [], a, b;
    if (!nE || !nX) {
      for (a = 0; a < nE; a++) grupy.push({ e0: e0 + a, e1: e0 + a + 1, x0: x0, x1: x0 });
      for (b = 0; b < nX; b++) grupy.push({ e0: e0, e1: e0, x0: x0 + b, x1: x0 + b + 1 });
      return grupy;
    }
    var K = Math.min(nE, nX), pe = 0, px = 0;
    for (var k = 1; k <= K; k++) {
      var ne = Math.round(k * nE / K), nx = Math.round(k * nX / K);
      grupy.push({ e0: e0 + pe, e1: e0 + ne, x0: x0 + px, x1: x0 + nx });
      pe = ne; px = nx;
    }
    return grupy;
  }

  /* Krytyk r9 #4 (12.10.2026): skrypt ponad LIMIT_KOMOREK nie przechodzi przez programowanie
     dynamiczne, ale opłacona mapa AI to bezpośrednie wskazania, więc grupy budujemy z niej:
     kolejne wiersze z tym samym EN = jedna grupa (rozbicie), EN bez wskazania dokleja się do
     poprzedniej grupy (AI przy sklejeniu podaje PIERWSZE zdanie), chyba że jest na liście
     brakujących albo stoi przed pierwszym wskazaniem (wtedy samo, 1-0). Wiersz „dodatek”
     (null) stoi sam (0-1), wiersz bez informacji i wskazanie cofające się idą do sąsiedniej
     grupy. Odcinek bez żadnego wskazania AI -> null (proporcja jak dotąd). */
  function grupyZAi(ai, brak, e0, e1, x0, x1) {
    var x, t = [], znane = 0, ostatnie = e0 - 1;
    for (x = x0; x < x1; x++) {
      var v = ai[x];
      if (znany(v) && v >= e0 && v < e1 && v >= ostatnie) { t.push(v); ostatnie = v; znane++; }
      else t.push(v === null ? 'D' : 'U');
    }
    if (!znane) return null;
    // Grupy po stronie X (kolejne, rozłączne): {v, xa, xb}; v = 'D' to wiersze bez pary.
    var gx = [], czeka = -1;   // czeka: początek wierszy bez informacji, które nie mają jeszcze grupy
    for (x = x0; x < x1; x++) {
      var w = t[x - x0], ost = gx.length ? gx[gx.length - 1] : null;
      if (w === 'U') {
        if (czeka < 0 && ost && ost.v !== 'D' && ost.xb === x) ost.xb = x + 1;
        else if (czeka < 0) czeka = x;
        continue;
      }
      if (w === 'D') {
        if (czeka >= 0) { gx.push({ v: 'D', xa: czeka, xb: x }); czeka = -1; }
        gx.push({ v: 'D', xa: x, xb: x + 1 });
        continue;
      }
      if (czeka < 0 && ost && ost.v === w && ost.xb === x) { ost.xb = x + 1; continue; }
      gx.push({ v: w, xa: czeka >= 0 ? czeka : x, xb: x + 1 }); czeka = -1;
    }
    if (czeka >= 0) gx.push({ v: 'D', xa: czeka, xb: x1 });
    var wynik = [], e = e0, i, j;
    for (i = 0; i < gx.length; i++) {
      var g = gx[i];
      if (g.v === 'D') { wynik.push({ e0: e, e1: e, x0: g.xa, x1: g.xb }); continue; }
      while (e < g.v) { wynik.push({ e0: e, e1: e + 1, x0: g.xa, x1: g.xa }); e++; }   // przed wskazaniem: brak w tej wersji
      if (e >= e1) { wynik.push({ e0: e, e1: e, x0: g.xa, x1: g.xb }); continue; }
      var nast = e1;
      for (j = i + 1; j < gx.length; j++) if (gx[j].v !== 'D') { nast = gx[j].v; break; }
      nast = Math.min(e1, Math.max(nast, e + 1));
      // EN bez wskazania dokleja się do grupy (ogon sklejenia), aż do pierwszego brakującego wg AI
      var koniec = e + 1;
      while (koniec < nast && !brak[koniec]) koniec++;
      wynik.push({ e0: e, e1: koniec, x0: g.xa, x1: g.xb });
      e = koniec;
      while (e < nast) { wynik.push({ e0: e, e1: e + 1, x0: g.xb, x1: g.xb }); e++; }
    }
    while (e < e1) { wynik.push({ e0: e, e1: e + 1, x0: x1, x1: x1 }); e++; }
    return wynik;
  }

  /* Bloki z powiązań: składowe spójne grafu (zdanie EN i zdanie drugiej strony),
     każda jako prostokąt [e0, e1) x [x0, x1). Bloki muszą iść w kolejności po obu
     stronach; krzyżujący się (np. ze starego szkicu) odpada i trafia do `pominiete`. */
  function blokiZKotwic(kotwice, nE, nX) {
    var rodzic = {};
    function znajdz(a) { while (rodzic[a] !== a) { rodzic[a] = rodzic[rodzic[a]]; a = rodzic[a]; } return a; }
    function dodaj(a) { if (rodzic[a] === undefined) rodzic[a] = a; }
    var dobre = (kotwice || []).filter(function (k) {
      return k && k.en >= 0 && k.en < nE && k.x >= 0 && k.x < nX;
    });
    dobre.forEach(function (k) {
      var a = 'e' + k.en, b = 'x' + k.x;
      dodaj(a); dodaj(b); rodzic[znajdz(a)] = znajdz(b);
    });
    var skladowe = {};
    dobre.forEach(function (k) {
      var r = znajdz('e' + k.en);
      var s = skladowe[r] || (skladowe[r] = { e0: k.en, e1: k.en + 1, x0: k.x, x1: k.x + 1, kotwice: [] });
      s.e0 = Math.min(s.e0, k.en); s.e1 = Math.max(s.e1, k.en + 1);
      s.x0 = Math.min(s.x0, k.x); s.x1 = Math.max(s.x1, k.x + 1);
      s.kotwice.push(k);
    });
    var lista = Object.keys(skladowe).map(function (r) { return skladowe[r]; })
      .sort(function (a, b) { return (a.e0 - b.e0) || (a.x0 - b.x0); });
    var bloki = [], pominiete = [], kE = 0, kX = 0;
    lista.forEach(function (b) {
      if (b.e0 >= kE && b.x0 >= kX) { bloki.push(b); kE = b.e1; kX = b.x1; }
      else pominiete = pominiete.concat(b.kotwice);
    });
    return { bloki: bloki, pominiete: pominiete };
  }

  /* Powiązanie przeczy mapie AI, gdy ŻADEN wiersz bloku nie trafia w zakres EN bloku
     (AI podaje pierwsze zdanie EN przy sklejeniu, więc trafienie w zakres to zgoda).
     Taki blok zwykle znaczy, że AI przesunęło się o zdanie albo kilka; błąd ciągnie
     się dalej i zmienia przesunięcie na każdym rozbiciu, więc wszystkie znane wiersze
     AI aż do następnego bloku traktujemy jako nieznane. Decyduje wtedy długość zdań. */
  function poprawAi(ai, bloki) {
    if (!ai) return null;
    var out = ai.slice();
    bloki.forEach(function (b, i) {
      var znane = 0, zgodne = 0, x;
      for (x = b.x0; x < b.x1; x++) {
        if (!znany(ai[x])) continue;
        znane++;
        if (ai[x] >= b.e0 && ai[x] < b.e1) zgodne++;
      }
      // Sprzeczność: żaden wiersz bloku nie trafia w jego EN, ALBO któryś trafia poza
      // (powiązania Shift przy zdaniu rozbitym na dwa), ALBO wiersz spoza bloku AI kładzie
      // w zakres EN bloku. Tylko pełna zgoda zostawia mapę AI za blokiem w spokoju.
      var obce = 0;
      for (x = 0; x < ai.length; x++) if ((x < b.x0 || x >= b.x1) && znany(ai[x]) && ai[x] >= b.e0 && ai[x] < b.e1) obce++;
      if (!znane || (zgodne === znane && !obce)) return;
      var koniec = i + 1 < bloki.length ? bloki[i + 1].x0 : out.length;
      for (x = b.x1; x < koniec; x++) if (znany(out[x])) out[x] = NIEZNANE;
    });
    return out;
  }

  /* Główna funkcja.
     en, x: listy zdań; opcje.kotwice: [{en, x}] (ręczne, twarde); opcje.ai: tablica
     długości x.length z indeksem EN, null = „AI: brak odpowiednika”,
     -1/undefined = brak informacji; opcje.brakEn: indeksy zdań EN, których para
     (wg AI) zniknęła po edycji, więc stoją same, jak pominięte w tłumaczeniu. */
  function dopasuj(en, x, opcje) {
    opcje = opcje || {};
    var nE = en.length, nX = x.length, i, j;
    var ai = opcje.ai && opcje.ai.length === nX ? opcje.ai : null;
    var bk = blokiZKotwic(opcje.kotwice, nE, nX);
    ai = poprawAi(ai, bk.bloki);

    var pE = [0], pX = [0];
    for (i = 0; i < nE; i++) pE.push(pE[i] + dlugosc(en[i]));
    for (j = 0; j < nX; j++) pX.push(pX[j] + dlugosc(x[j]));
    var K = {
      pE: pE, pX: pX, ai: ai,
      c: pE[nE] > 0 && pX[nX] > 0 ? pX[nX] / pE[nE] : 1,   // niemiecki bywa ~20% dłuższy
      lE: en.map(liczby), lX: x.map(liczby), uproszczone: false,
      brak: new Uint8Array(nE),
    };
    (opcje.brakEn || []).forEach(function (e) { if (e >= 0 && e < nE) K.brak[e] = 1; });

    var grupy;
    if ((nE + 1) * (nX + 1) <= LIMIT_KOMOREK && nE && nX) {
      grupy = program(K, nE, nX, bk.bloki);
    } else {
      // Zapas na gigantyczne skrypty: bloki sztywne, między nimi mapa AI (gdy jest), inaczej proporcja.
      grupy = []; var e = 0, xx = 0;
      bk.bloki.concat([{ e0: nE, e1: nE, x0: nX, x1: nX, koniec: true }]).forEach(function (b) {
        if (b.e0 - e || b.x0 - xx) {
          var zAi = ai ? grupyZAi(ai, K.brak, e, b.e0, xx, b.x0) : null;
          if (!zAi && nE && nX) K.uproszczone = true;
          grupy = grupy.concat(zAi || proporcja(b.e0 - e, b.x0 - xx, e, xx));
        }
        if (!b.koniec) grupy.push({ e0: b.e0, e1: b.e1, x0: b.x0, x1: b.x1 });
        e = b.e1; xx = b.x1;
      });
    }

    var grupaEn = new Array(nE), grupaX = new Array(nX), sierotyAi = new Array(nX);
    grupy.forEach(function (g, gi) {
      for (var a = g.e0; a < g.e1; a++) grupaEn[a] = gi;
      for (var b = g.x0; b < g.x1; b++) grupaX[b] = gi;
    });
    var wBloku = {};
    bk.bloki.forEach(function (b) { for (var t = b.x0; t < b.x1; t++) wBloku[t] = 1; });
    // Zdanie wchłonięte przez blok też nie jest „sierotą”: stoi przy powiązaniu.
    grupy.forEach(function (g) {
      var maBlok = bk.bloki.some(function (b) { return b.x0 >= g.x0 && b.x1 <= g.x1 && b.e0 >= g.e0 && b.e1 <= g.e1; });
      if (maBlok) for (var t = g.x0; t < g.x1; t++) wBloku[t] = 1;
    });
    for (j = 0; j < nX; j++) sierotyAi[j] = !!ai && ai[j] === null && !wBloku[j];
    // Zdania EN bez pary (pominięte w tłumaczeniu): tylko przy mapie AI, bo sama długość
    // zdań to za słaby dowód, żeby oznaczać brak na czerwono.
    var pominieteEn = new Array(nE);
    for (i = 0; i < nE; i++) pominieteEn[i] = false;
    if (ai || (opcje.brakEn && opcje.brakEn.length)) grupy.forEach(function (g) {
      if (g.x1 === g.x0) for (var e2 = g.e0; e2 < g.e1; e2++) pominieteEn[e2] = true;
    });
    return { grupy: grupy, grupaEn: grupaEn, grupaX: grupaX, sierotyAi: sierotyAi, pominieteEn: pominieteEn,
             pominieteKotwice: bk.pominiete, uproszczone: K.uproszczone };
  }

  /* Programowanie dynamiczne po całej macierzy. Zwykła grupa nie może zawierać
     zdania z bloku powiązań; blok wchodzi jako jedna „duża grupa”, która może
     wchłonąć do MAKS_DOKLEJ sąsiednich zdań bez powiązania z każdej strony. */
  function program(K, nE, nX, bloki) {
    var pE = K.pE, pX = K.pX, ai = K.ai, lE = K.lE, lX = K.lX, c = K.c, brak = K.brak, i, j, t;
    var totE = pE[nE] || 1, totX = pX[nX] || 1;
    var blokE = new Int32Array(nE).fill(-1), blokX = new Int32Array(nX).fill(-1);
    bloki.forEach(function (b, bi) {
      for (t = b.e0; t < b.e1; t++) blokE[t] = bi;
      for (t = b.x0; t < b.x1; t++) blokX[t] = bi;
    });
    var cBE = [0], cBX = [0], cE = [0], cX = [0];
    for (i = 0; i < nE; i++) { cBE.push(cBE[i] + (blokE[i] >= 0 ? 1 : 0)); cE.push(cE[i] + (lE[i].length ? 1 : 0)); }
    for (j = 0; j < nX; j++) { cBX.push(cBX[j] + (blokX[j] >= 0 ? 1 : 0)); cX.push(cX[j] + (lX[j].length ? 1 : 0)); }
    // Odcinki między blokami: numer odcinka dla zdań EN i X, równe liczby, informacja AI.
    var odcE = new Int32Array(nE + 1), odcX = new Int32Array(nX + 1);
    for (i = 0, t = 0; i <= nE; i++) { while (t < bloki.length && bloki[t].e1 <= i) t++; odcE[i] = t; }
    for (j = 0, t = 0; j <= nX; j++) { while (t < bloki.length && bloki[t].x1 <= j) t++; odcX[j] = t; }
    var B = bloki.length, rowneOdc = [], aiOdc = [];
    for (t = 0; t <= B; t++) {
      var oe0 = t ? bloki[t - 1].e1 : 0, oe1 = t < B ? bloki[t].e0 : nE;
      var ox0 = t ? bloki[t - 1].x1 : 0, ox1 = t < B ? bloki[t].x0 : nX;
      var maAi = false;
      if (ai) for (j = ox0; j < ox1; j++) if (ai[j] === null || znany(ai[j])) { maAi = true; break; }
      aiOdc.push(maAi);
      rowneOdc.push(oe1 - oe0 === ox1 - ox0 && !maAi);
    }
    var celAi = new Uint8Array(nE);
    if (ai) for (j = 0; j < nX; j++) if (znany(ai[j]) && ai[j] < nE) celAi[ai[j]] = 1;

    // Przejścia „blok z dokładką”: koniec -> lista {start, koszt}.
    var W = nX + 1, superP = {}, superLista = [];
    bloki.forEach(function (b) {
      var eb, xb, ea, xa, bA = b.e1 - b.e0, bB = b.x1 - b.x0;
      for (eb = 0; eb <= DOKLEJ_PRZED && b.e0 - eb >= 0 && (eb === 0 || blokE[b.e0 - eb] < 0); eb++) {
        for (xb = 0; xb <= DOKLEJ_PRZED && b.x0 - xb >= 0 && (xb === 0 || blokX[b.x0 - xb] < 0); xb++) {
          for (ea = 0; ea <= DOKLEJ_ZA && b.e1 + ea <= nE && (ea === 0 || blokE[b.e1 + ea - 1] < 0); ea++) {
            for (xa = 0; xa <= DOKLEJ_ZA && b.x1 + xa <= nX && (xa === 0 || blokX[b.x1 + xa - 1] < 0); xa++) {
              var a = bA + eb + ea, bb = bB + xb + xa;
              // Kształty jak w zwykłych grupach: szeroka po obu stronach tylko, jeśli taki jest sam blok.
              if (Math.min(a, bb) > Math.max(3, Math.min(bA, bB)) || Math.max(a, bb) > Math.max(12, bA, bB)) continue;
              var e0 = b.e0 - eb, e1 = b.e1 + ea, x0 = b.x0 - xb, x1 = b.x1 + xa;
              var k = kosztGrupy(e0, e1, x0, x1, logPriorKsztaltu(a, bb), b);
              var kon = e1 * W + x1;
              superLista.push({ e0: e0, x0: x0, e1: e1, x1: x1, k: k });
              (superP[kon] = superP[kon] || []).push(superLista.length - 1);
            }
          }
        }
      }
    });

    var koszt = new Float64Array((nE + 1) * W), skad = new Int32Array((nE + 1) * W);
    koszt.fill(Infinity);
    koszt[0] = 0;
    for (i = 0; i <= nE; i++) {
      for (j = 0; j <= nX; j++) {
        if (!i && !j) continue;
        var best = Infinity, bestG = -1;
        for (var g = 0; g < GRUPY.length; g++) {
          var a = GRUPY[g][0], b2 = GRUPY[g][1];
          if (i < a || j < b2) continue;
          if (cBE[i] - cBE[i - a] || cBX[j] - cBX[j - b2]) continue;   // zwykła grupa nie rusza bloków
          var prev = koszt[(i - a) * W + (j - b2)];
          if (prev === Infinity) continue;
          var kk = prev + kosztGrupy(i - a, i, j - b2, j, LOG_PRIOR[g], null);
          if (kk < best) { best = kk; bestG = g; }
        }
        var sp = superP[i * W + j];
        if (sp) {
          for (var q = 0; q < sp.length; q++) {
            var st = superLista[sp[q]], pv = koszt[st.e0 * W + st.x0];
            if (pv !== Infinity && pv + st.k < best) { best = pv + st.k; bestG = -2 - sp[q]; }
          }
        }
        koszt[i * W + j] = best;
        skad[i * W + j] = bestG;
      }
    }
    var wynik = [];
    i = nE; j = nX;
    while (i > 0 || j > 0) {
      var gg = skad[i * W + j];
      if (gg === -1) return proporcja(nE, nX, 0, 0);   // nie powinno się zdarzyć
      if (gg <= -2) {
        var su = superLista[-2 - gg];
        wynik.push({ e0: su.e0, e1: su.e1, x0: su.x0, x1: su.x1 });
        i = su.e0; j = su.x0;
      } else {
        var aa = GRUPY[gg][0], bb = GRUPY[gg][1];
        wynik.push({ e0: i - aa, e1: i, x0: j - bb, x1: j });
        i -= aa; j -= bb;
      }
    }
    return wynik.reverse();

    function kosztGrupy(e0, e1, x0, x1, prior, blok) {
      var a = e1 - e0, b = x1 - x0, q, r;
      var poz = WAGA_POZYCJI * Math.abs(pE[e1] / totE - pX[x1] / totX);
      var odc = a ? odcE[e0] : odcX[x0];
      if (!blok && !a && b === 1 && ai && ai[x0] === null) return KOSZT_SIEROTY_AI + poz;
      // Zdanie EN, którego polską parę usunięto: samo (jak dodatek AI po drugiej stronie);
      // w grupie z cudzym zdaniem płaci jak sprzeczność z AI. Powiązanie ręczne wygrywa.
      if (!blok && a === 1 && !b && brak[e0]) return KOSZT_SIEROTY_AI + poz;
      var karaBraku = 0;
      if (b) for (q = e0; q < e1; q++) if (brak[q] && !(blok && q >= blok.e0 && q < blok.e1)) karaBraku += KARA_AI_SIEROTA;
      // Zdanie EN, którego żaden wiersz AI nie wskazał, samo: tyle co sklejenie 2-1,
      // więc o „pominięte” albo „ogon sklejenia” rozstrzyga długość, a nie priorytet.
      if (!blok && a === 1 && !b && ai && !celAi[e0]) prior = Math.min(prior, -Math.log(0.089));
      var k = prior + poz + karaBraku;
      var ls = pE[e1] - pE[e0], lt = (pX[x1] - pX[x0]) / c, sr = (ls + lt) / 2;
      if (sr > 0) {
        var dl = -(Math.LN2 + logOgon(Math.abs(ls - lt) / Math.sqrt(sr * WARIANCJA)));
        // Zdanie EN, którego AI nie wskazało nikomu: pominięte w tłumaczeniu albo
        // ogon sklejenia. Ograniczona kara długości: sklejenie wygrywa tylko wtedy,
        // gdy długość drugiej strony naprawdę pokrywa oba zdania.
        if (!blok && a === 1 && !b && ai && !celAi[e0]) dl = Math.min(dl, MAKS_DL_PUSTEJ);
        k += dl;
      }
      if (!blok && rowneOdc[odc] && !(a === 1 && b === 1)) k += KARA_ROWNE;
      if (ai) {
        var rozne = {}, ileRoznych = 0;
        for (q = x0; q < x1; q++) {
          var v = ai[q];
          if (v === null) { if (a) k += KARA_AI_SIEROTA; }
          else if (znany(v)) {
            if (v < e0 || v >= e1) k += KARA_AI;
            // Blok wchłonął zdanie, które AI paruje z INNYM zdaniem EN niż powiązane:
            // to osobna para, nie część powiązania.
            else if (blok && (v < blok.e0 || v >= blok.e1)) k += KARA_AI;
            else if (!rozne[v]) { rozne[v] = 1; ileRoznych++; }
          }
        }
        // AI potwierdza osobne pary 1:1, a grupa 2-2 by je skleiła: kara za każdą parę ponad jedną.
        if (!blok && a >= 2 && b >= 2 && ileRoznych >= 2) k += KARA_AI * (ileRoznych - 1);
        // Przy sklejeniu AI podaje PIERWSZE zdanie EN. Grupa, której początkowego zdania EN
        // nie wskazuje żaden jej wiersz (a późniejsze tak), dokleiła obce zdanie z przodu,
        // np. zdanie pominięte w tłumaczeniu.
        if (!blok && a >= 2 && b >= 1) for (q = e0 + 1; q < e1; q++) if (!celAi[q]) k += KARA_OGONA;
        if (a >= 2 && b >= 1) {
          var minV = Infinity;
          for (q = x0; q < x1; q++) if (znany(ai[q]) && ai[q] >= e0 && ai[q] < e1) minV = Math.min(minV, ai[q]);
          if (minV !== Infinity && minV > e0) k += KARA_AI;
        }
      }
      if (a && b && cE[e1] > cE[e0] && cX[x1] > cX[x0]) {
        var zE = {}, trafione = 0;
        for (q = e0; q < e1; q++) for (r = 0; r < lE[q].length; r++) zE[lE[q][r]] = 1;
        for (q = x0; q < x1; q++) for (r = 0; r < lX[q].length; r++) if (zE[lX[q][r]]) { trafione++; zE[lX[q][r]] = 0; }
        k -= Math.min(2, trafione * PREMIA_LICZBA);
      }
      return k;
    }
  }

  /* Podobieństwo zdań (bigramy znaków, Dice): do rozpoznania „to samo zdanie
     z poprawką” w bloku zmian o różnej długości. */
  function dice(a, b) {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;
    var mapa = {}, i, wsp = 0, k;
    for (i = 0; i < a.length - 1; i++) { k = a.substr(i, 2); mapa[k] = (mapa[k] || 0) + 1; }
    for (i = 0; i < b.length - 1; i++) { k = b.substr(i, 2); if (mapa[k] > 0) { mapa[k]--; wsp++; } }
    return 2 * wsp / (a.length + b.length - 2);
  }

  /* Przeniesienie indeksów po edycji tekstu: dla każdego STAREGO zdania indeks
     w NOWEJ liście albo null (zdanie zniknęło). Najdłuższy wspólny podciąg zdań;
     blok zmian o tej samej długości po obu stronach to poprawione zdania (zostają
     na miejscu, jeśli są choć trochę podobne: Dice >= 0,3), w bloku o różnej długości
     parujemy po podobieństwie (Dice >= 0,5),
     po kolei, a resztę uznajemy za usuniętą. */
  function przemapuj(stare, nowe) {
    var n = stare.length, m = nowe.length, i, j;
    var norm = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
    var A = stare.map(norm), B = nowe.map(norm);
    var wynik = new Array(n);
    for (i = 0; i < n; i++) wynik[i] = null;
    var pary = [];
    if ((n + 1) * (m + 1) > LIMIT_KOMOREK) {
      // Bardzo długie teksty: wspólny początek i koniec, środek jako jeden blok zmian.
      var p = 0, s = 0;
      while (p < n && p < m && A[p] === B[p]) { pary.push([p, p]); p++; }
      while (s < n - p && s < m - p && A[n - 1 - s] === B[m - 1 - s]) s++;
      for (var t = s; t >= 1; t--) pary.push([n - t, m - t]);
    } else {
      var L = new Int32Array((n + 1) * (m + 1)), W = m + 1;
      for (i = n - 1; i >= 0; i--) {
        for (j = m - 1; j >= 0; j--) {
          L[i * W + j] = A[i] === B[j] ? L[(i + 1) * W + j + 1] + 1 : Math.max(L[(i + 1) * W + j], L[i * W + j + 1]);
        }
      }
      i = 0; j = 0;
      while (i < n && j < m) {
        if (A[i] === B[j]) { pary.push([i, j]); i++; j++; }
        else if (L[(i + 1) * W + j] >= L[i * W + j + 1]) i++;
        else j++;
      }
    }
    pary.push([n, m]);
    var pi = 0, pj = 0;
    pary.forEach(function (p2) {
      var di = p2[0] - pi, dj = p2[1] - pj, t2, u;
      if (di > 0 && dj > 0) {
        if (di === dj) {
          // Poprawione zdanie zostaje na miejscu, ale zupełnie inne (wklejony nowy
          // skrypt o tej samej liczbie zdań) już nie dziedziczy powiązań ani mapy AI.
          for (t2 = 0; t2 < di; t2++) if (dice(A[pi + t2], B[pj + t2]) >= 0.3) wynik[pi + t2] = pj + t2;
        }
        else {
          var od = pj;
          for (t2 = pi; t2 < p2[0]; t2++) {
            for (u = od; u < p2[1]; u++) {
              if (dice(A[t2], B[u]) >= 0.5) { wynik[t2] = u; od = u + 1; break; }
            }
          }
        }
      }
      if (p2[0] < n) wynik[p2[0]] = p2[1];
      pi = p2[0] + 1; pj = p2[1] + 1;
    });
    return wynik;
  }

  return { dopasuj: dopasuj, przemapuj: przemapuj, NIEZNANE: NIEZNANE };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ZdaniaMapa;
