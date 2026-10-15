/* 14.10.2026 (historia Ads X-Ray): zapisane porównania trzech trybów (Skrypty PL, AI Diff, Similarities).
 *
 * Cel: edytor pisze skrypty i porównuje (np. oryginał po włosku, angielski, polski), a porównanie zostaje
 * zapisane, żeby później sprawdzić jego pracę. Wpis = marka · edytor · batch (1, 2, 3 … po kolei) i
 * opcjonalna nazwa; dane wpisu to dokładnie to, co tryb trzyma w wersji roboczej (teksty, opłacone
 * mapy AI, powiązania, przełączniki), więc wczytanie odtwarza porównanie BEZ żadnego płatnego wywołania.
 *
 * Kontrakt z trybami:
 *   XHistoria.zarejestruj(tryb, { stan(), wczytaj(dane), zajety?() })   w init() trybu
 *     stan()      -> dane do zapisu (migawka bieżącego porównania, edycje w toku zatwierdzone)
 *     wczytaj(d)  -> odtwarza porównanie z danych wpisu (może zwrócić Promise)
 *     zajety()    -> napis powodu, gdy teraz nie wolno podmienić porównania (np. trwa dopasowanie AI)
 *   XHistoria.zapisz(tryb)   = zdarzenie 'xray-historia-zapisz' {tryb}: okno zapisu
 *   XHistoria.otworz(tryb)   = zdarzenie 'xray-historia-otworz' {tryb}: lista zapisanych
 *   XHistoria.zapomnij(tryb) = bieżący wpis trybu przestaje być „tym porównaniem” (np. Wyczyść wszystko)
 *   zdarzenie 'xray-historia-biezacy' {tryb, wpis, stan: 'zapisano'|'wczytano'|null}: etykieta w trybie
 *   window.xrayHistoriaOtwarte() -> true, gdy okno historii jest otwarte (tryby pomijają wtedy skróty).
 * Wpis z innego trybu otwiera <ta sama ścieżka>?tryb=<tryb>&historia=<id>; strona trybu wczytuje go sama.
 * Pułapkę fokusu i powrót fokusu daje strażnik okien z /static/xray-shim.js (role="dialog").
 *
 * Wersja samodzielna: marki to edytowalna lista jak edytorzy (GET/POST /api/xray/marki, te same ciała
 * co /api/xray/edytorzy). Baza startuje pusta, więc okno zapisu prowadzi do „Dodaj markę” i „Dodaj edytora”.
 *
 * 14.10.2026 (link Ad Library): właściciel: „daj jeszcze miejsce do wklejenia linku do Ad Library do reklamy”.
 * Opcjonalne pole w oknie zapisu (link wpisu, wypełnione przy aktualizacji) i „Ad Library ↗” w wierszu listy
 * (nowa karta, bez otwierania wpisu). Link to tylko napis: nigdy go nie pobieramy. Serwer sprawdza go tak samo
 * (database.xray_czysty_link) i jest tu rozstrzygający; sprawdzLink() daje tylko komunikat od razu w oknie.
 */
(function (root) {
    'use strict';

    const TRYBY = ['skrypty-pl', 'ai-diff', 'similarities'];
    const KLUCZ_BIEZACY = 'xray_historia_biezacy';   // {tryb: wpis + odcisk}: „to porównanie” per tryb
    const KLUCZ_WYBOR = 'xray_historia_wybor';       // ostatnio wybrana marka i edytor
    const CZEKAJ_NA_TRYB_MS = 8000;

    // ── Czyste funkcje (testy: tests/engine/test_xray_historia.js) ──
    function napis(v) { return typeof v === 'string' ? v : ''; }
    // Teksty porównania w kolejności kolumn albo paneli.
    function teksty(tryb, dane) {
        const d = (dane && typeof dane === 'object') ? dane : {};
        if (tryb === 'skrypty-pl') return [napis(d.orig), napis(d.en), napis(d.pl)];
        return (Array.isArray(d.texts) ? d.texts : []).map(t => napis(t && t.body));
    }
    function maTresc(tryb, dane) { return teksty(tryb, dane).some(t => t.trim().length > 0); }
    // Odcisk tekstów (FNV-1a po KAŻDYM znaku + długość): „czy to te same teksty”, bez trzymania ich kopii.
    function odcisk(lista) {
        const s = JSON.stringify((Array.isArray(lista) ? lista : []).map(t => String(t || '').replace(/\r\n?/g, '\n').trim()));
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
        return h.toString(36) + ':' + s.length;
    }
    // Pytamy przed podmianą, gdy bieżące porównanie ma teksty, różni się od wczytywanego wpisu
    // i nie jest dokładnie tym, co ostatnio zapisano albo wczytano w tym trybie (niezapisane zmiany).
    function trzebaPytac(tryb, aktualne, wpisDane, odciskZapamietany) {
        if (!maTresc(tryb, aktualne)) return false;
        const teraz = odcisk(teksty(tryb, aktualne));
        if (teraz === odcisk(teksty(tryb, wpisDane))) return false;
        return teraz !== odciskZapamietany;
    }
    function opisWpisu(w) {
        if (!w) return '';
        const czesci = [w.brand_nazwa || w.brand_slug || '', w.editor_nazwa || '', 'Batch ' + w.batch];
        return czesci.filter(Boolean).join(' · ');
    }
    function kluczWpisu(w) {
        if (!w) return '';
        return [w.tryb, w.brand_slug, String(w.editor_id), String(w.batch)].join('|');
    }
    function poprawnyBatch(v, max) {
        const s = String(v == null ? '' : v).trim();
        if (!/^\d{1,9}$/.test(s)) return null;
        const n = parseInt(s, 10);
        return (n >= 1 && n <= (max || 9999)) ? n : null;
    }
    // Przesunięcie elementu listy o jedno miejsce (kolejność edytorów); poza zakresem = ta sama kolejność.
    function przesun(lista, idx, kier) {
        const out = (Array.isArray(lista) ? lista : []).slice();
        const cel = idx + kier;
        if (idx < 0 || idx >= out.length || cel < 0 || cel >= out.length) return out;
        const [el] = out.splice(idx, 1);
        out.splice(cel, 0, el);
        return out;
    }
    // „2026-10-14T15:07:33Z” -> „14.10.2026 17:07” (serwer zapisuje UTC z „Z”, pokazujemy czas lokalny).
    function dataKrotka(iso) {
        const s = String(iso || '');
        if (/Z$/.test(s)) {
            const d = new Date(s);
            if (!isNaN(d)) {
                const p = n => String(n).padStart(2, '0');
                return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
            }
        }
        const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(s);
        return m ? `${m[3]}.${m[2]}.${m[1]} ${m[4]}:${m[5]}` : String(iso || '');
    }
    function adresWpisu(tryb, id) {
        // Wersja samodzielna: ta sama ścieżka strony, na której stoi narzędzie (adres zależy od wdrożenia).
        const sciezka = (root.location && root.location.pathname) || '/';
        return sciezka + '?tryb=' + encodeURIComponent(tryb) + '&historia=' + encodeURIComponent(String(id));
    }
    // 14.10.2026 (link Ad Library): link do reklamy z okna zapisu. Pusty = brak. Inaczej przycięty,
    // najwyżej LINK_MAX znaków, http(s)://host.z.kropką, bez spacji, znaków sterujących i loginu w adresie.
    // Zwraca { link, blad } (blad = komunikat po polsku, przed T()); treść linku zostaje taka, jak wklejona.
    const LINK_MAX = 2000;
    const LINK_ZLE_ZNAKI = /[\s\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/;
    const HOSTY_AD_LIBRARY = ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'business.facebook.com'];
    function sprawdzLink(v) {
        const s = typeof v === 'string' ? v.trim() : '';
        if (!s) return { link: '', blad: '' };
        if (s.length > LINK_MAX) return { link: '', blad: 'Link jest za długi (limit 2000 znaków).' };
        if (LINK_ZLE_ZNAKI.test(s)) return { link: '', blad: 'Link nie może zawierać spacji ani znaków sterujących.' };
        if (!/^https?:\/\//i.test(s)) return { link: '', blad: 'Link musi zaczynać się od https:// (albo http://).' };
        let u;
        try { u = new URL(s); } catch (e) { return { link: '', blad: 'Nieprawidłowy link.' }; }
        const host = String(u.hostname || '').replace(/^\.+|\.+$/g, '');
        if (!host || host.indexOf('.') === -1) {
            return { link: '', blad: 'Link musi zawierać adres strony, np. https://www.facebook.com/ads/library/?id=…' };
        }
        if (/@/.test((/^https?:\/\/([^/?#]*)/i.exec(s) || ['', ''])[1])) return { link: '', blad: 'Link nie może zawierać loginu ani hasła.' };
        return { link: s, blad: '' };
    }
    // Link wpisu do atrybutu href: tylko http(s) (obrona także przed starym albo uszkodzonym zapisem).
    function bezpiecznyLink(v) {
        const s = typeof v === 'string' ? v.trim() : '';
        return s && sprawdzLink(s).link === s ? s : '';
    }
    function linkAdLibrary(v) {
        const s = bezpiecznyLink(v);
        if (!s) return false;
        try {
            const u = new URL(s);
            return HOSTY_AD_LIBRARY.indexOf(u.hostname.toLowerCase()) !== -1
                && (u.pathname === '/ads/library' || u.pathname.indexOf('/ads/library/') === 0);
        } catch (e) { return false; }
    }
    // Napis linku w liście: „Ad Library” albo sama nazwa hosta (bez „www.”); pusty, gdy linku nie ma.
    // `adLibrary` (opcjonalnie) = rozpoznanie serwera (link_ad_library); bez niego rozpoznajemy sami.
    function etykietaLinku(v, adLibrary) {
        const s = bezpiecznyLink(v);
        if (!s) return '';
        if (typeof adLibrary === 'boolean' ? adLibrary : linkAdLibrary(s)) return 'Ad Library';
        try { return new URL(s).hostname.replace(/^www\./i, ''); } catch (e) { return ''; }
    }
    // Edytorzy do listy wyboru: aktywni, plus wyłączony, jeśli to on jest teraz wybrany (aktualizacja wpisu).
    function edytorzyDoWyboru(edytorzy, wybranyId) {
        return (Array.isArray(edytorzy) ? edytorzy : [])
            .filter(e => e && (e.aktywny || String(e.id) === String(wybranyId)));
    }

    // ── Pomocnicze ──
    function T(s) { return typeof root.oppenT === 'function' ? root.oppenT(s) : s; }
    function Tf(s, w) {
        if (typeof root.oppenTf === 'function') return root.oppenTf(s, w);
        return String(s).replace(/\{(\d+)\}/g, (_, i) => (w && w[i] != null ? w[i] : ''));
    }
    function blad(e) { return typeof root.appBlad === 'function' ? root.appBlad(e) : ((e && e.message) || String(e)); }
    function toast(tekst, wariant, ms) {
        if (typeof root.appToast !== 'function') return;
        const o = { variant: wariant || 'info' };
        if (ms) o.durationMs = ms;
        root.appToast(tekst, o);
    }
    async function potwierdz(tresc, tytul, opcje) {
        return typeof root.appConfirm === 'function' ? !!(await root.appConfirm(tresc, tytul || '', opcje || {})) : false;
    }
    function czytaj(klucz) {
        try {
            const v = JSON.parse(root.localStorage.getItem(klucz) || 'null');
            return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
        } catch (e) { return {}; }
    }
    function pisz(klucz, v) { try { root.localStorage.setItem(klucz, JSON.stringify(v)); } catch (e) { /* tryb prywatny */ } }
    async function zapytanie(url, opcje) {
        const r = await fetch(url, opcje);
        const j = await r.json().catch(() => ({}));
        if (r.status === 409 && j && j.istnieje) return { konflikt: j.istnieje };
        if (!r.ok || j.ok === false) {
            const e = new Error(T(j.detail || j.error || ('HTTP ' + r.status)));
            e.status = r.status;
            throw e;
        }
        return j;
    }
    const JSON_NAGLOWKI = { 'Content-Type': 'application/json' };

    // ── Rejestr trybów i bieżące wpisy ──
    const rejestr = {};
    const czekajacy = {};
    function zarejestruj(tryb, dostawca) {
        if (TRYBY.indexOf(tryb) === -1 || !dostawca || typeof dostawca.stan !== 'function') return;
        rejestr[tryb] = dostawca;
        (czekajacy[tryb] || []).forEach(f => f(dostawca));
        czekajacy[tryb] = [];
    }
    function dostawcaTrybu(tryb, ms) {
        if (rejestr[tryb]) return Promise.resolve(rejestr[tryb]);
        return new Promise((ok) => {
            (czekajacy[tryb] = czekajacy[tryb] || []).push(ok);
            setTimeout(() => ok(rejestr[tryb] || null), ms || CZEKAJ_NA_TRYB_MS);
        });
    }
    function biezacy(tryb) {
        const w = czytaj(KLUCZ_BIEZACY)[tryb];
        return (w && typeof w === 'object' && w.id) ? w : null;
    }
    function ustawBiezacy(tryb, wpis, stan) {
        const wszystkie = czytaj(KLUCZ_BIEZACY);
        if (wpis) wszystkie[tryb] = wpis; else delete wszystkie[tryb];
        pisz(KLUCZ_BIEZACY, wszystkie);
        root.dispatchEvent(new CustomEvent('xray-historia-biezacy', { detail: { tryb: tryb, wpis: wpis || null, stan: stan || null } }));
    }
    function zdarzenie(nazwa, tryb) { root.dispatchEvent(new CustomEvent(nazwa, { detail: { tryb: tryb } })); }

    const XHistoria = {
        zarejestruj: zarejestruj,
        zapisz: (tryb) => zdarzenie('xray-historia-zapisz', tryb),
        otworz: (tryb) => zdarzenie('xray-historia-otworz', tryb),
        zapomnij: (tryb) => { if (biezacy(tryb)) ustawBiezacy(tryb, null, null); },
        biezacy: biezacy,
    };

    // ── Etykieta w trybie: „Zapisano: Marka · Edytor · Batch 12” ──
    function xrayHistoriaEtykieta(tryb) {
        return {
            napis: '',
            // Zadeklarowane z góry: etykieta siedzi w x-data trybu, a Alpine zapisuje NOWĄ właściwość `this.x`
            // w zewnętrznym zakresie (komponent trybu). Bez tego wszystkie etykiety trybu dzieliły jeden
            // `_sluch`, a zniszczenie etykiety z x-if odpinało nasłuch innej (zgubiona etykieta na pasku).
            _sluch: null,
            init() {
                const w = biezacy(tryb);
                this.napis = w ? Tf('W historii: {0}', [opisWpisu(w)]) : '';
                this._sluch = (e) => {
                    const d = (e && e.detail) || {};
                    if (d.tryb !== tryb) return;
                    if (!d.wpis) { this.napis = ''; return; }
                    const opis = opisWpisu(d.wpis);
                    this.napis = d.stan === 'zapisano' ? Tf('Zapisano: {0}', [opis])
                        : d.stan === 'wczytano' ? Tf('Wczytano: {0}', [opis]) : Tf('W historii: {0}', [opis]);
                };
                root.addEventListener('xray-historia-biezacy', this._sluch);
            },
            destroy() { root.removeEventListener('xray-historia-biezacy', this._sluch); },
        };
    }

    // ── Komponent Alpine okien (montuje go _xray_historia.html, raz na stronę) ──
    function xrayHistoria() {
        return {
            tryb: '',                 // tryb tej strony (?tryb=)
            kontekst: null,           // {admin, ja, marki, domyslna_marka, edytorzy, batch_max}
            zapisOtwarty: false,
            listaOtwarta: false,
            zapisuje: false,
            laduje: false,
            wczytuje: false,
            form: { marka: '', edytor: '', batch: '', nazwa: '', link: '' },
            sugestia: null,           // następny wolny batch dla wybranej marki i edytora
            _sugestiaDla: '',
            _batchRecznie: false,
            _dane: null,              // migawka porównania z chwili otwarcia okna zapisu
            zarzadzanie: false,       // admin: lista edytorów w oknie zapisu
            nowyEdytor: '',
            edytorzyZmiana: false,
            zarzadzanieMarek: false,  // wersja samodzielna: lista marek w oknie zapisu (jak edytorzy)
            nowaMarka: '',
            markiZmiana: false,
            wszystkieMarki: [],       // [{id, slug, nazwa, aktywny, kolejnosc}] z GET /api/xray/marki
            wpisy: [],
            autorzy: [],
            filtry: { tryb: '', marka: '', edytor: '', autor: '' },
            _sesjaListy: 0,
            _naZapisz: null, _naOtworz: null, _naKlawisz: null, _czyOtwarte: null,   // własne pola (patrz etykieta)

            init() {
                this.tryb = (this.$el.dataset && this.$el.dataset.xrayHistoriaTryb) || '';
                this._naZapisz = (e) => this.otworzZapis(((e && e.detail) || {}).tryb);
                this._naOtworz = (e) => this.otworzListe(((e && e.detail) || {}).tryb);
                this._naKlawisz = (e) => {
                    if (e.key !== 'Escape' || !(this.zapisOtwarty || this.listaOtwarta)) return;
                    try { if (root.Alpine && root.Alpine.store('dialog') && root.Alpine.store('dialog').open) return; } catch (x) { /* brak magazynu */ }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this.zamknij();
                };
                root.addEventListener('xray-historia-zapisz', this._naZapisz);
                root.addEventListener('xray-historia-otworz', this._naOtworz);
                root.addEventListener('keydown', this._naKlawisz, true);
                this._czyOtwarte = () => this.zapisOtwarty || this.listaOtwarta;
                root.xrayHistoriaOtwarte = this._czyOtwarte;
                this.$watch('form.marka', () => this.odswiezSugestie());
                this.$watch('form.edytor', () => this.odswiezSugestie());
                this._wczytajZAdresu();
            },
            destroy() {
                root.removeEventListener('xray-historia-zapisz', this._naZapisz);
                root.removeEventListener('xray-historia-otworz', this._naOtworz);
                root.removeEventListener('keydown', this._naKlawisz, true);
                if (root.xrayHistoriaOtwarte === this._czyOtwarte) root.xrayHistoriaOtwarte = () => false;
            },
            zamknij() {
                this.zapisOtwarty = false;
                this.listaOtwarta = false;
                this.zarzadzanie = false;
                this.zarzadzanieMarek = false;
                this._sesjaListy++;
            },

            async _kontekst(odswiez) {
                if (this.kontekst && !odswiez) return this.kontekst;
                // Wersja samodzielna: pełna lista marek (z wyłączonymi) do zarządzania, obok kontekstu.
                const [k, m] = await Promise.all([
                    zapytanie('/api/xray/historia/kontekst'),
                    zapytanie('/api/xray/marki').catch(() => null),
                ]);
                this.kontekst = k;
                this.wszystkieMarki = (m && Array.isArray(m.marki)) ? m.marki
                    : (k.marki || []).map((x, i) => ({ id: null, slug: x.slug, nazwa: x.name, aktywny: true, kolejnosc: i }));
                return this.kontekst;
            },
            admin() { return !!(this.kontekst && this.kontekst.admin); },
            marki() { return (this.kontekst && this.kontekst.marki) || []; },
            edytorzyWyboru() { return edytorzyDoWyboru(this.kontekst && this.kontekst.edytorzy, this.form.edytor); },
            wszyscyEdytorzy() { return (this.kontekst && this.kontekst.edytorzy) || []; },
            nazwaTrybu(t) { return ({ 'skrypty-pl': T('Skrypty PL'), 'ai-diff': 'AI Diff', similarities: 'Similarities' })[t] || t; },
            opis(w) { return opisWpisu(w); },
            data(w) { return dataKrotka(w && (w.updated_at || w.created_at)); },
            batchMax() { return (this.kontekst && this.kontekst.batch_max) || 9999; },

            // ── Zapis ──
            async otworzZapis(tryb) {
                const t = TRYBY.indexOf(tryb) !== -1 ? tryb : this.tryb;
                const d = rejestr[t];
                if (!d) { toast(T('Ten tryb nie jest jeszcze gotowy, spróbuj za chwilę.'), 'info'); return; }
                let dane;
                try { dane = d.stan(); } catch (e) { toast(T('Nie udało się odczytać porównania: ') + blad(e), 'error', 6000); return; }
                if (!maTresc(t, dane)) { toast(T('Wklej teksty, zanim zapiszesz porównanie.'), 'info'); return; }
                this._dane = { tryb: t, dane: dane };
                try { await this._kontekst(); } catch (e) { toast(T('Nie udało się pobrać listy edytorów: ') + blad(e), 'error', 6000); return; }
                const ja = this.kontekst.ja || {};
                const w = biezacy(t);
                const wybor = czytaj(KLUCZ_WYBOR);
                const marki = this.marki().map(m => m.slug);
                const aktywni = this.edytorzyWyboru().filter(e => e.aktywny).map(e => String(e.id));
                this._batchRecznie = false;
                this.sugestia = null;
                this._sugestiaDla = '';
                // Wersja samodzielna: pusta baza = od razu lista do uzupełnienia (najpierw marki, potem edytorzy).
                this.zarzadzanieMarek = !marki.length;
                this.zarzadzanie = !!marki.length && !aktywni.length;
                if (w && marki.indexOf(w.brand_slug) !== -1) {
                    // 14.10.2026 (link Ad Library): link wpisu wraca do pola także z cudzego wpisu (to ta sama reklama).
                    this.form = { marka: w.brand_slug, edytor: String(w.editor_id), batch: String(w.batch),
                                  nazwa: w.user_id === ja.id ? (w.nazwa || '') : '', link: typeof w.link === 'string' ? w.link : '' };
                    this._batchRecznie = true;   // to porównanie ma już swój batch: podpowiedź go nie nadpisze
                } else {
                    const marka = marki.indexOf(wybor.marka) !== -1 ? wybor.marka
                        : (marki.indexOf(this.kontekst.domyslna_marka) !== -1 ? this.kontekst.domyslna_marka : (marki[0] || ''));
                    const edytor = aktywni.indexOf(String(wybor.edytor)) !== -1 ? String(wybor.edytor) : (aktywni[0] || '');
                    this.form = { marka: marka, edytor: edytor, batch: '', nazwa: '', link: '' };
                }
                this.zapisOtwarty = true;
                this.odswiezSugestie();
                // Wersja samodzielna: przy pustej liście kursor od razu w polu nowej marki (albo edytora).
                // Pierwsze otwarcie rysuje okno chwilę później niż $nextTick, więc próbujemy do skutku (najwyżej 0,5 s).
                const koniec = Date.now() + 500;
                const ustawFokus = () => {
                    if (!this.zapisOtwarty) return;
                    const cel = this.zarzadzanieMarek ? this.$root.querySelector('[data-xh-nowa-marka]')
                        : (this.zarzadzanie ? this.$root.querySelector('[data-xh-nowy-edytor]') : this.$refs.batch);
                    try { if (cel) cel.focus(); } catch (e) { /* ignore */ }
                    if (cel && document.activeElement !== cel && Date.now() < koniec) setTimeout(ustawFokus, 30);
                };
                this.$nextTick(ustawFokus);
            },
            async odswiezSugestie() {
                if (!this.zapisOtwarty || !this._dane) return;
                const { marka, edytor } = this.form;
                const dla = [this._dane.tryb, marka, edytor].join('|');
                if (!marka || !edytor || dla === this._sugestiaDla) return;
                this._sugestiaDla = dla;
                try {
                    const j = await zapytanie('/api/xray/historia/nastepny-batch?tryb=' + encodeURIComponent(this._dane.tryb)
                        + '&marka=' + encodeURIComponent(marka) + '&edytor=' + encodeURIComponent(edytor));
                    if (dla !== this._sugestiaDla) return;
                    this.sugestia = j.batch;
                    if (!this._batchRecznie || !String(this.form.batch).trim()) this.form.batch = String(j.batch);
                } catch (e) { if (dla === this._sugestiaDla) this.sugestia = null; }
            },
            batchWpisany() { this._batchRecznie = true; },
            uzyjSugestii() { if (this.sugestia) { this.form.batch = String(this.sugestia); this._batchRecznie = false; } },
            // Klucz z formularza to klucz bieżącego wpisu tego porównania (własnego): zapis go zaktualizuje.
            _kluczFormularza() {
                if (!this._dane) return '';
                return kluczWpisu({ tryb: this._dane.tryb, brand_slug: this.form.marka, editor_id: this.form.edytor,
                                    batch: poprawnyBatch(this.form.batch, this.batchMax()) });
            },
            aktualizuje() {
                const w = this._dane && biezacy(this._dane.tryb);
                const ja = (this.kontekst && this.kontekst.ja) || {};
                return !!(w && w.user_id === ja.id && kluczWpisu(w) === this._kluczFormularza());
            },
            cudzyBiezacy() {
                const w = this._dane && biezacy(this._dane.tryb);
                const ja = (this.kontekst && this.kontekst.ja) || {};
                return (w && w.user_id !== ja.id) ? (w.username || '') : '';
            },
            stanKlucza() {
                const w = this._dane && biezacy(this._dane.tryb);
                if (this.aktualizuje()) return Tf('Zaktualizujesz wpis: {0}', [opisWpisu(w)]);
                return '';
            },
            moznaZapisac() {
                return !this.zapisuje && !!this.form.marka && !!this.form.edytor && poprawnyBatch(this.form.batch, this.batchMax()) !== null
                    && !sprawdzLink(this.form.link).blad;
            },
            // 14.10.2026 (link Ad Library): komunikat pod polem linku (pusty = link w porządku albo brak).
            bladLinku() { const b = sprawdzLink(this.form.link).blad; return b ? T(b) : ''; },
            linkWpisu(w) { return bezpiecznyLink(w && w.link); },
            etykietaLinku(w) { return w ? etykietaLinku(w.link, w.link_ad_library) : ''; },
            opisLinku(w) {
                const s = bezpiecznyLink(w && w.link);
                return this.etykietaLinku(w) === 'Ad Library' ? Tf('Otwórz reklamę w Ad Library (nowa karta): {0}', [s])
                                        : Tf('Otwórz link reklamy (nowa karta): {0}', [s]);
            },
            async zapisz() {
                if (!this.moznaZapisac() || !this._dane) return;
                const batch = poprawnyBatch(this.form.batch, this.batchMax());
                const cel = this._dane;
                const cialo = {
                    tryb: cel.tryb, brand_slug: this.form.marka, editor_id: parseInt(this.form.edytor, 10), batch: batch,
                    nazwa: String(this.form.nazwa || '').trim(), dane: cel.dane, nadpisz: this.aktualizuje(), expected_revision: (biezacy(cel.tryb)||{}).revision,
                };
                // 14.10.2026 (link Ad Library): pusty link przy NOWYM kluczu nie jest wysyłany, więc nadpisanie
                // istniejącego wpisu po pytaniu (409) zostawia jego link. Aktualizacja bieżącego wpisu (pole było
                // wypełnione jego linkiem) wysyła pole zawsze: wyczyszczone pole usuwa link.
                const link = sprawdzLink(this.form.link).link;
                if (link || this.aktualizuje()) cialo.link = link;
                this.zapisuje = true;
                try {
                    let j = await zapytanie('/api/xray/historia', { method: 'POST', headers: JSON_NAGLOWKI, body: JSON.stringify(cialo) });
                    if (j.konflikt) {
                        const ok = await potwierdz(
                            Tf('Wpis {0} już istnieje (zapisany {1}). Nadpisać go tym porównaniem? Poprzednia wersja nie zostanie zachowana.',
                               [opisWpisu(j.konflikt), dataKrotka(j.konflikt.updated_at)]),
                            T('Nadpisać wpis?'), { confirmLabel: T('Nadpisz'), variant: 'danger' });
                        if (!ok) return;
                        cialo.nadpisz = true; cialo.expected_revision = j.konflikt.revision;
                        j = await zapytanie('/api/xray/historia', { method: 'POST', headers: JSON_NAGLOWKI, body: JSON.stringify(cialo) });
                        if (j.konflikt) throw new Error(T('Pod tym kluczem jest już zapisane porównanie.'));
                    }
                    const wpis = Object.assign({}, j.wpis, { odcisk: odcisk(teksty(cel.tryb, cel.dane)) });
                    ustawBiezacy(cel.tryb, wpis, 'zapisano');
                    pisz(KLUCZ_WYBOR, { marka: this.form.marka, edytor: this.form.edytor });
                    toast(Tf(j.utworzono ? 'Zapisano w historii: {0}' : 'Zaktualizowano w historii: {0}', [opisWpisu(wpis)]), 'success');
                    this.zamknij();
                } catch (e) {
                    toast(T('Nie udało się zapisać: ') + blad(e), 'error', 8000);
                } finally {
                    this.zapisuje = false;
                }
            },

            // ── Edytorzy (admin) ──
            async _edytorzy(cialo) {
                if (this.edytorzyZmiana) return false;
                this.edytorzyZmiana = true;
                try {
                    const j = await zapytanie('/api/xray/edytorzy', { method: 'POST', headers: JSON_NAGLOWKI, body: JSON.stringify(cialo) });
                    if (this.kontekst) this.kontekst.edytorzy = j.edytorzy || [];
                    this._odswiezWybory();
                    return true;
                } catch (e) {
                    toast(blad(e), 'error', 6000);
                    return false;
                } finally {
                    this.edytorzyZmiana = false;
                }
            },
            async dodajEdytora() {
                const nazwa = String(this.nowyEdytor || '').trim();
                if (!nazwa) return;
                if (await this._edytorzy({ akcja: 'dodaj', nazwa: nazwa })) {
                    this.nowyEdytor = '';
                    // Wersja samodzielna: pierwszy edytor (nic nie było wybrane) od razu trafia do pola wyboru.
                    const nowy = this.wszyscyEdytorzy().filter(e => e.aktywny && e.nazwa === nazwa).pop();
                    if (!this.form.edytor && nowy) this.form.edytor = String(nowy.id);
                    toast(Tf('Dodano edytora: {0}', [nazwa]), 'success');
                }
            },
            async zmienNazweEdytora(e, el) {
                const nazwa = String((el && el.value) || '').trim();
                if (!nazwa || nazwa === e.nazwa) { if (el) el.value = e.nazwa; return; }
                if (!(await this._edytorzy({ akcja: 'zmien', id: e.id, nazwa: nazwa })) && el) el.value = e.nazwa;
            },
            async przelaczEdytora(e) {
                await this._edytorzy({ akcja: 'zmien', id: e.id, aktywny: !e.aktywny });
                if (String(this.form.edytor) === String(e.id) && e.aktywny) this.form.edytor = '';
            },
            async przesunEdytora(idx, kier) {
                const ids = przesun(this.wszyscyEdytorzy().map(e => e.id), idx, kier);
                await this._edytorzy({ akcja: 'kolejnosc', ids: ids });
            },

            // ── Marki (wersja samodzielna): ta sama lista i te same akcje co edytorzy ──
            _ustawMarki(lista) {
                this.wszystkieMarki = Array.isArray(lista) ? lista : [];
                if (this.kontekst) {
                    this.kontekst.marki = this.wszystkieMarki.filter(m => m.aktywny).map(m => ({ slug: m.slug, name: m.nazwa }));
                }
                const aktywne = this.marki().map(m => m.slug);
                if (this.form.marka && aktywne.indexOf(this.form.marka) === -1) this.form.marka = aktywne[0] || '';
                if (!this.form.marka && aktywne.length) this.form.marka = aktywne[0];
                if (this.filtry.marka && aktywne.indexOf(this.filtry.marka) === -1) this.filtry.marka = '';
                this._odswiezWybory();
            },
            // Lista opcji narysowana od nowa (dodanie, zmiana kolejności) potrafi zostawić w <select> pierwszą opcję,
            // choć model wskazuje inną: po przerysowaniu przywracamy wybór z modelu, żeby widok = to, co się zapisze.
            _odswiezWybory() {
                this.$nextTick(() => {
                    const pary = [['[data-xh-marka]', this.form.marka], ['[data-xh-edytor]', this.form.edytor]];
                    pary.forEach(([sel, v]) => { const el = this.$root.querySelector(sel); if (el && el.value !== String(v)) el.value = String(v); });
                });
            },
            async _marki(cialo) {
                if (this.markiZmiana) return false;
                this.markiZmiana = true;
                try {
                    const j = await zapytanie('/api/xray/marki', { method: 'POST', headers: JSON_NAGLOWKI, body: JSON.stringify(cialo) });
                    this._ustawMarki(j.marki || []);
                    return true;
                } catch (e) {
                    toast(blad(e), 'error', 6000);
                    return false;
                } finally {
                    this.markiZmiana = false;
                }
            },
            async dodajMarke() {
                const nazwa = String(this.nowaMarka || '').trim();
                if (!nazwa) return;
                const bylo = this.form.marka;
                if (await this._marki({ akcja: 'dodaj', nazwa: nazwa })) {
                    this.nowaMarka = '';
                    const nowa = this.wszystkieMarki.filter(m => m.aktywny && m.nazwa === nazwa).pop();
                    if (!bylo && nowa) this.form.marka = nowa.slug;
                    toast(Tf('Dodano markę: {0}', [nazwa]), 'success');
                }
            },
            async zmienNazweMarki(m, el) {
                const nazwa = String((el && el.value) || '').trim();
                if (!nazwa || nazwa === m.nazwa) { if (el) el.value = m.nazwa; return; }
                if (!(await this._marki({ akcja: 'zmien', id: m.id, nazwa: nazwa })) && el) el.value = m.nazwa;
            },
            async przelaczMarke(m) {
                await this._marki({ akcja: 'zmien', id: m.id, aktywny: !m.aktywny });
            },
            async przesunMarke(idx, kier) {
                const ids = przesun(this.wszystkieMarki.map(m => m.id), idx, kier);
                await this._marki({ akcja: 'kolejnosc', ids: ids });
            },
            // Podpowiedź pustej listy: otwiera właściwą listę do uzupełnienia i stawia kursor w polu nowej pozycji.
            pokazZarzadzanie(co) {
                if (co === 'marki') this.zarzadzanieMarek = true; else this.zarzadzanie = true;
                this.$nextTick(() => {
                    const pole = this.$root.querySelector(co === 'marki' ? '[data-xh-nowa-marka]' : '[data-xh-nowy-edytor]');
                    try { if (pole) pole.focus(); } catch (e) { /* ignore */ }
                });
            },

            // ── Lista ──
            async otworzListe(tryb) {
                if (TRYBY.indexOf(tryb) !== -1 && !this.tryb) this.tryb = tryb;
                this.listaOtwarta = true;
                try { await this._kontekst(); } catch (e) { toast(T('Nie udało się pobrać historii: ') + blad(e), 'error', 6000); this.listaOtwarta = false; return; }
                await this.odswiezListe();
                this.$nextTick(() => { try { this.$refs.listaPierwszy && this.$refs.listaPierwszy.focus(); } catch (e) { /* ignore */ } });
            },
            async odswiezListe() {
                const sesja = ++this._sesjaListy;
                this.laduje = true;
                const f = this.filtry, q = new URLSearchParams();
                if (f.tryb) q.set('tryb', f.tryb);
                if (f.marka) q.set('marka', f.marka);
                if (f.edytor) q.set('edytor', f.edytor);
                if (f.autor && this.admin()) q.set('autor', f.autor);
                try {
                    const j = await zapytanie('/api/xray/historia' + (q.toString() ? '?' + q.toString() : ''));
                    if (sesja !== this._sesjaListy) return;
                    this.wpisy = j.wpisy || [];
                    this.autorzy = j.autorzy || [];
                } catch (e) {
                    if (sesja === this._sesjaListy) toast(T('Nie udało się pobrać historii: ') + blad(e), 'error', 6000);
                } finally {
                    if (sesja === this._sesjaListy) this.laduje = false;
                }
            },
            czyBiezacy(w) { const b = biezacy(w.tryb); return !!(b && b.id === w.id); },
            async usun(w) {
                const ok = await potwierdz(Tf('Usunąć z historii wpis {0}? Wpis można przywrócić z Archiwum zapisów.', [opisWpisu(w)]),
                                           T('Usunąć wpis?'), { confirmLabel: T('Usuń'), variant: 'danger' });
                if (!ok) return;
                try {
                    await zapytanie('/api/xray/historia/' + w.id, { method: 'DELETE' });
                    this.wpisy = this.wpisy.filter(x => x.id !== w.id);
                    const b = biezacy(w.tryb);
                    if (b && b.id === w.id) ustawBiezacy(w.tryb, null, null);
                    toast(Tf('Usunięto z historii: {0}', [opisWpisu(w)]), 'success');
                } catch (e) {
                    toast(T('Nie udało się usunąć: ') + blad(e), 'error', 6000);
                }
            },
            async otworzWpis(w) {
                if (!w || this.wczytuje) return;
                if (w.tryb !== this.tryb) {
                    // Inny tryb: jego strona wczyta wpis sama (wersja robocza tego trybu zapisuje się przy wyjściu).
                    root.location.href = adresWpisu(w.tryb, w.id);
                    return;
                }
                const ok = await this._wczytaj(w.id, true);
                if (ok) this.zamknij();
            },
            // Pobiera wpis i podaje go trybowi tej strony. Zero płatnych wywołań: dane są w odpowiedzi.
            async _wczytaj(id, zListy) {
                this.wczytuje = true;
                try {
                    const j = await zapytanie('/api/xray/historia/' + encodeURIComponent(String(id)));
                    const w = j.wpis;
                    if (!w || w.tryb !== this.tryb) return false;
                    const d = await dostawcaTrybu(w.tryb);
                    if (!d || typeof d.wczytaj !== 'function') { toast(T('Ten tryb nie jest jeszcze gotowy, spróbuj za chwilę.'), 'info'); return false; }
                    const powod = typeof d.zajety === 'function' ? d.zajety() : '';
                    if (powod) { toast(powod, 'info', 6000); return false; }
                    let aktualne = null;
                    try { aktualne = d.stan(); } catch (e) { aktualne = null; }
                    const b = biezacy(w.tryb);
                    if (trzebaPytac(w.tryb, aktualne, w.dane, b && b.odcisk)) {
                        const ok = await potwierdz(
                            Tf('Bieżące porównanie ma niezapisane zmiany. Zastąpić je wpisem {0}?', [opisWpisu(w)]),
                            T('Wczytać wpis z historii?'), { confirmLabel: T('Wczytaj'), variant: 'danger' });
                        if (!ok) return false;
                    }
                    await d.wczytaj(w.dane);
                    const meta = Object.assign({}, w, { odcisk: odcisk(teksty(w.tryb, w.dane)) });
                    delete meta.dane;
                    ustawBiezacy(w.tryb, meta, 'wczytano');
                    const ja = (this.kontekst && this.kontekst.ja) || null;
                    toast(Tf('Wczytano z historii: {0}', [opisWpisu(w)]) + (ja && w.user_id !== ja.id && w.username ? ' (' + Tf('autor: {0}', [w.username]) + ')' : ''), 'success');
                    return true;
                } catch (e) {
                    toast(e && e.status === 404 ? T('Ten wpis historii nie istnieje albo nie masz do niego dostępu.')
                                                : T('Nie udało się wczytać wpisu: ') + blad(e), 'error', 8000);
                    return false;
                } finally {
                    this.wczytuje = false;
                }
            },
            // ?historia=<id> (wpis otwarty z listy innego trybu): parametr zdejmowany od razu, wpis wczytany.
            async _wczytajZAdresu() {
                let id = null;
                try {
                    const u = new URL(root.location.href);
                    id = u.searchParams.get('historia');
                    if (id === null) return;
                    u.searchParams.delete('historia');
                    root.history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
                } catch (e) { return; }
                if (!/^\d+$/.test(String(id))) return;
                try { await this._kontekst(); } catch (e) { /* toast da sam odczyt wpisu */ }
                await this._wczytaj(parseInt(id, 10), false);
            },
        };
    }

    root.XHistoria = XHistoria;
    root.xrayHistoria = xrayHistoria;
    root.xrayHistoriaEtykieta = xrayHistoriaEtykieta;
    if (typeof root.xrayHistoriaOtwarte !== 'function') root.xrayHistoriaOtwarte = () => false;
    const czyste = { teksty, maTresc, odcisk, trzebaPytac, opisWpisu, kluczWpisu, poprawnyBatch, przesun,
                     dataKrotka, adresWpisu, edytorzyDoWyboru, sprawdzLink, bezpiecznyLink, linkAdLibrary, etykietaLinku,
                     zarejestruj, dostawcaTrybu, XHistoria, xrayHistoria,
                     xrayHistoriaEtykieta, TRYBY, KLUCZ_BIEZACY, KLUCZ_WYBOR };
    if (typeof module !== 'undefined' && module.exports) module.exports = czyste;
})(typeof window !== 'undefined' ? window : globalThis);
