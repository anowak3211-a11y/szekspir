/* xray-shim.js: globalne pomocniki, których kod Ads X-Ray oczekuje od strony nadrzędnej.
 *
 * Pliki trybów (static/xray/*.js, cdiff.js, zdania-mapa.js) są kopią narzędzia z większej aplikacji
 * i wołają kilka jej globali. Ten plik daje ich minimalne odpowiedniki, żeby tryby działały bez zmian
 * (mniejszy diff przy kolejnych kopiach). Ładowany BEZ defer w <head>, przed Alpine.
 *
 * Globale:
 *   oppenT, oppenTf            tłumaczenie: interfejs zostaje po polsku (klucz = napis), oppenTf wstawia {0} {1}
 *   odmien                     polska odmiana liczebnika (1 słowo, 2 słowa, 5 słów)
 *   appToast, appConfirm, appAlert, appConfirmWithModel   toasty i okna (magazyn Alpine 'dialog')
 *   appOpStart, appOpEnd       operacje w toku (toast sukcesu, gdy operacja go podała)
 *   appBlad, appTlumaczBlad    tekst błędu dla człowieka
 *   appPilnujWyjscia           pytanie przeglądarki przy wyjściu, gdy coś trwa
 *   OppenModel, appNowszyModel, appKosztTokenow, appKosztOperacji, appFormatKoszt, appOpisKosztu,
 *   appCost, appModeleDlaTokenow, _appCostEnhance   modele Claude i szacunek ceny akcji AI
 *   APP_MODEL_CATALOG, APP_MODEL_RATES, APP_AI_OPERATIONS, APP_SREDNIE_AI   dane do cen
 *   xrayPrzelaczMotyw          jasny / ciemny motyw (klasa .dark na <html>)
 * Do tego: nakładka na fetch (limit czasu, toast przy braku klucza API albo limicie wydatków)
 * i strażnik okien (Tab nie wychodzi z otwartego okna role="dialog" aria-modal="true").
 *
 * Zero wywołań sieciowych poza tym, o co prosi strona. Żadnych kluczy.
 */
(function (root) {
    'use strict';

    // ───────────────────────── Tłumaczenie (interfejs po polsku) ─────────────────────────
    root.oppenT = function (s) { return s == null ? '' : String(s); };
    root.oppenTf = function (szkielet, wartosci) {
        const w = Array.isArray(wartosci) ? wartosci : [];
        return String(szkielet == null ? '' : szkielet).replace(/\{(\d+)\}/g, function (cale, i) {
            return w[i] != null ? String(w[i]) : cale;
        });
    };

    // Polska odmiana liczebnika; formy angielskie (5. i 6. argument) ignorowane: interfejs jest po polsku.
    root.odmien = function (n, jeden, dwa, piec) {
        const r100 = n % 100, r10 = n % 10;
        if (n === 1) return jeden;
        if (r10 >= 2 && r10 <= 4 && !(r100 >= 12 && r100 <= 14)) return dwa;
        return piec;
    };

    // ───────────────────────── Błędy ─────────────────────────
    root.appBlad = function (e) {
        const t = (e && e.message) ? String(e.message) : String(e == null ? '' : e);
        if (/Failed to fetch|NetworkError|Load failed|network error/i.test(t)) return 'brak połączenia z serwerem, spróbuj ponownie';
        return t;
    };
    root.appTlumaczBlad = function (tekst) { return String(tekst == null ? '' : tekst).trim(); };

    root.appPilnujWyjscia = function (czyBrudne) {
        if (typeof czyBrudne !== 'function') return;
        root.addEventListener('beforeunload', function (e) {
            let brudne = false;
            try { brudne = !!czyBrudne(); } catch (err) { brudne = false; }
            if (!brudne) return;
            e.preventDefault();
            e.returnValue = '';
        });
    };

    // ───────────────────────── Modele Claude i ceny ─────────────────────────
    // Cennik USD za milion tokenów (wejście / wyjście). tokenizer: tokeny modeli 5.x względem profilu
    // operacji; myslenie: mnożnik wyjścia Opusa; prog/in_hi/out_hi: wyższa stawka Haiku powyżej progu.
    root.APP_MODEL_RATES = {
        'claude-sonnet-5-5': { in: 2.00, out: 10.00, in_hi: null, out_hi: null, prog: null, tokenizer: 1.3, myslenie: 1.0, label: 'Sonnet 5.5' },
    };
    root.APP_MODEL_CATALOG = {
        anthropic: [
            { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5', tier: 'balanced', input_per_mtok: 2.00, output_per_mtok: 10.00 },
        ],
    };
    // Typowa wielkość operacji AI (tysiące tokenów): szacunek ceny przy przycisku.
    root.APP_AI_OPERATIONS = {
        ai_diff_verdict: { in_k: 8.0, out_k: 2.5 },        // AI Diff: dwa teksty plus instrukcja
        script_compare_align: { in_k: 3.0, out_k: 0.5 },   // Skrypty PL: jedno dopasowanie kolumny
    };
    // Średnie z prawdziwych wywołań (pusto: wersja samodzielna nie prowadzi dziennika, cena = szacunek).
    root.APP_SREDNIE_AI = {};
    const MODEL_DOMYSLNY = 'claude-sonnet-5-5';
    const KLUCZ_MODELU = 'xray_model';

    root.appNowszyModel = function (id) { return id; };
    root.appProfilOperacji = function (op) {
        const o = (root.APP_AI_OPERATIONS || {})[op];
        const s = (root.APP_SREDNIE_AI || {})[op];
        if (s && s.n >= 3) return { in: s.in, out: s.out, n: s.n, zrodlo: 'srednia' };
        if (o) return { in: o.in_k * 1000, out: o.out_k * 1000, n: 0, zrodlo: 'szacunek' };
        return null;
    };
    root.appKosztTokenow = function (modelId, tokIn, tokOut) {
        const r = (root.APP_MODEL_RATES || {})[root.appNowszyModel(modelId)];
        if (!r) return null;
        const f = r.tokenizer || 1, tin = tokIn * f, tout = tokOut * f * (r.myslenie || 1);
        let cin = r.in, cout = r.out;
        if (r.prog && tin > r.prog) { cin = r.in_hi || cin; cout = r.out_hi || cout; }
        return (tin * cin + tout * cout) / 1e6;
    };
    root.appKosztOperacji = function (op, modelId, razy) {
        const p = root.appProfilOperacji(op);
        if (!p) return null;
        const k = razy == null ? 1 : razy;
        const usd = root.appKosztTokenow(modelId, p.in * k, p.out * k);
        return usd == null ? null : { usd: usd, zrodlo: p.zrodlo, n: p.n };
    };
    root.appFormatKoszt = function (usd) {
        if (usd == null) return null;
        if (usd > 0 && usd < 0.0001) return '≈ $0.0001';
        let t;
        if (usd < 0.01) t = String(Number(usd.toPrecision(2)));
        else if (usd < 0.10) t = usd.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
        else t = usd.toFixed(2);
        return '≈ $' + t;
    };
    root.appOpisKosztu = function (k) {
        if (!k) return '';
        return k.zrodlo === 'srednia'
            ? root.oppenTf('Średni koszt z {0} ostatnich wywołań (zmienia się z modelem)', [k.n])
            : 'Szacunkowy koszt operacji (zmienia się z modelem)';
    };
    root.appCost = function (operation, modelId, razy) {
        try {
            const k = root.appKosztOperacji(operation, modelId || root.OppenModel.getAnthropic(), razy);
            return k ? root.appFormatKoszt(k.usd) : null;
        } catch (e) { return null; }
    };
    // Lista modeli do okna wyboru dla znanego profilu tokenów (z długości wklejonych tekstów).
    root.appModeleDlaTokenow = function (tokIn, tokOut, czasy) {
        const NOTY = { cheap: 'najtańszy', balanced: 'polecany', premium: 'najlepsza jakość' };
        const cz = czasy || ['~5-10s', '~10-20s', '~20-40s'];
        return root.APP_MODEL_CATALOG.anthropic.map(function (m, i) {
            return {
                id: m.id, label: m.label,
                cost: root.appKosztTokenow(m.id, tokIn, tokOut) || 0,
                time: cz[Math.min(i, cz.length - 1)],
                note: NOTY[m.tier] || '',
                zrodlo: 'dlugosc', n: 0,
            };
        });
    };

    // Domyślny model Claude (bez wybieraka w wersji samodzielnej): zapis w pamięci przeglądarki albo Sonnet.
    root.OppenModel = (function () {
        function ids() { return root.APP_MODEL_CATALOG.anthropic.map(function (m) { return m.id; }); }
        function czytaj() { try { return localStorage.getItem(KLUCZ_MODELU) || ''; } catch (e) { return ''; } }
        const api = {
            getAnthropic: function () { const id = czytaj(); return ids().indexOf(id) !== -1 ? id : MODEL_DOMYSLNY; },
            getPreferred: function () { return api.getAnthropic(); },
            getProvider: function () { return 'anthropic'; },
            effective: function () { return api.getAnthropic(); },
            setDefault: function (id) {
                if (ids().indexOf(id) === -1) return;
                try { localStorage.setItem(KLUCZ_MODELU, id); } catch (e) { /* tryb prywatny */ }
                try { root.dispatchEvent(new CustomEvent('oppen-model-changed', { detail: { model: id } })); } catch (e) { /* ignore */ }
            },
        };
        return api;
    })();

    // Przyciski z data-cost-op="<operacja>" dostają plakietkę z szacunkiem ceny dla domyślnego modelu.
    root._appCostEnhance = function (zakres) {
        try {
            const scope = zakres || document;
            scope.querySelectorAll('[data-cost-op]:not([data-cost-installed])').forEach(function (btn) {
                const op = btn.getAttribute('data-cost-op');
                if (!root.APP_AI_OPERATIONS[op]) return;
                btn.setAttribute('data-cost-installed', '1');
                const span = document.createElement('span');
                span.className = 'inline-flex items-center leading-none ml-1.5 px-1 py-0.5 rounded-md text-xs font-mono transition';
                span.setAttribute('data-cost-span', op);
                span.setAttribute('data-i18n-skip', '');
                btn.appendChild(span);
            });
            scope.querySelectorAll('[data-cost-span]').forEach(function (span) {
                const op = span.getAttribute('data-cost-span');
                const btn = span.closest('[data-cost-op]');
                const razy = btn && btn.hasAttribute('data-cost-razy') ? Number(btn.getAttribute('data-cost-razy')) : 1;
                const k = root.appKosztOperacji(op, root.OppenModel.getAnthropic(), razy);
                const cena = k ? root.appFormatKoszt(k.usd) : null;
                span.textContent = cena || '';
                span.style.display = cena ? '' : 'none';
                if (k) span.title = root.appOpisKosztu(k);
            });
        } catch (e) { console.warn('[xray-shim] cena akcji AI', e); }
    };
    root.addEventListener('oppen-model-changed', function () { root._appCostEnhance(); });
    document.addEventListener('DOMContentLoaded', function () {
        root._appCostEnhance();
        try {
            new MutationObserver(function (zmiany) {
                const trzeba = zmiany.some(function (m) {
                    return Array.prototype.some.call(m.addedNodes || [], function (n) {
                        return n.nodeType === 1 && ((n.matches && n.matches('[data-cost-op]:not([data-cost-installed])'))
                            || (n.querySelector && n.querySelector('[data-cost-op]:not([data-cost-installed])')));
                    });
                });
                if (trzeba) root._appCostEnhance();
            }).observe(document.body, { childList: true, subtree: true });
        } catch (e) { /* bez obserwatora: plakietki dostaną tylko przyciski z pierwszego rysowania */ }
    });

    // ───────────────────────── Okna i toasty (magazyn Alpine 'dialog') ─────────────────────────
    // Znaczniki okna i stosu toastów są w ads_xray.html; tu stan i zachowanie, z tym samym API co oryginał:
    // confirm(title, message, opts) -> Promise<bool>, confirmWithModel -> Promise<{confirmed, model}>,
    // toast(message, opts) -> id, dismissToast(id).
    const TOAST_MS = 3500;
    const dialog = {
        open: false,
        kind: 'alert',            // 'alert' | 'confirm' | 'confirm_model'
        title: '',
        message: '',
        confirmLabel: 'OK',
        cancelLabel: 'Anuluj',
        variant: 'default',       // 'default' | 'danger'
        fokusAnuluj: false,
        models: [],
        selectedModel: '',
        fieldLabel: '',
        toasts: [],
        _toastId: 0,
        _resolve: null,
        _lastFocus: null,

        _focusIn() {
            this._lastFocus = (document.activeElement instanceof HTMLElement) ? document.activeElement : null;
            const koniec = Date.now() + 500;
            const probuj = () => {
                if (!this.open) return;
                const cancelBtn = document.getElementById('appDialogCancelBtn');
                const okBtn = document.getElementById('appDialogConfirmBtn');
                const naAnuluj = (this.variant === 'danger' || (this.kind === 'confirm' && this.fokusAnuluj)) && this.kind !== 'alert';
                let cel = (naAnuluj && cancelBtn) ? cancelBtn : okBtn;
                // Okno z wyborem modelu (płatna akcja) zaczyna od zaznaczonej karty, nie od przycisku, który płaci.
                if (this.kind === 'confirm_model') {
                    const karta = document.querySelector('[data-karty-modeli] [role="radio"][aria-checked="true"]');
                    if (karta && karta.getClientRects().length) cel = karta;
                }
                if (cel && cel.getClientRects().length) {
                    try { cel.focus(); } catch (e) { /* ignore */ }
                    if (document.activeElement === cel) return;
                }
                if (Date.now() < koniec) setTimeout(probuj, 20);
            };
            setTimeout(probuj, 0);
        },
        _focusBack() {
            const el = this._lastFocus;
            this._lastFocus = null;
            if (el && document.contains(el)) { try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
        },
        alert(title, message, opts) {
            const o = opts || {};
            Object.assign(this, { open: true, kind: 'alert', title: title || '', message: message || '',
                                  confirmLabel: o.confirmLabel || 'OK', variant: o.variant || 'default' });
            this._focusIn();
            return new Promise(resolve => { this._resolve = resolve; });
        },
        confirm(title, message, opts) {
            const o = opts || {};
            Object.assign(this, { open: true, kind: 'confirm', title: title || '', message: message || '',
                                  confirmLabel: o.confirmLabel || 'Potwierdź', cancelLabel: o.cancelLabel || 'Anuluj',
                                  variant: o.variant || 'default', fokusAnuluj: !!o.fokusAnuluj });
            this._focusIn();
            return new Promise(resolve => { this._resolve = resolve; });
        },
        confirmWithModel(title, message, opts) {
            const o = opts || {};
            const modele = Array.isArray(o.models) ? o.models : [];
            let domyslny = o.defaultModel || root.OppenModel.getAnthropic();
            if (!modele.some(m => m.id === domyslny)) domyslny = modele.length ? modele[0].id : '';
            Object.assign(this, { open: true, kind: 'confirm_model', title: title || '', message: message || '',
                                  confirmLabel: o.confirmLabel || 'Potwierdź', cancelLabel: o.cancelLabel || 'Anuluj',
                                  variant: o.variant || 'default', models: modele, fieldLabel: o.fieldLabel || '',
                                  selectedModel: domyslny });
            this._focusIn();
            return new Promise(resolve => { this._resolve = resolve; });
        },
        cenaModelu(m) { return m ? (root.appFormatKoszt(m.cost) || '') : ''; },
        etykietaPotwierdzenia() {
            const m = (this.models || []).find(x => x.id === this.selectedModel);
            return m ? '(' + m.label + ' · ' + this.cenaModelu(m) + ')' : '';
        },
        confirmOk() {
            const kind = this.kind, model = this.selectedModel;
            this.open = false;
            if (this._resolve) {
                this._resolve(kind === 'confirm_model' ? { confirmed: true, model: model } : true);
                this._resolve = null;
            }
            this._focusBack();
        },
        cancel() {
            const kind = this.kind;
            this.open = false;
            if (this._resolve) {
                if (kind === 'alert') this._resolve(true);
                else if (kind === 'confirm_model') this._resolve({ confirmed: false, model: '' });
                else this._resolve(false);
                this._resolve = null;
            }
            this._focusBack();
        },
        toast(message, opts) {
            const o = opts || {};
            const wariant = o.variant || 'info';     // 'info' | 'success' | 'error' | 'warning'
            // Ten sam komunikat kliknięty kilka razy: stary znika, nowy liczy czas od nowa.
            this.toasts = this.toasts.filter(t => !(t.message === (message || '') && t.variant === wariant && !t.action));
            const id = ++this._toastId;
            this.toasts.push({ id: id, message: message || '', variant: wariant,
                               actionLabel: o.actionLabel || null, action: o.action || null });
            setTimeout(() => this.dismissToast(id), o.durationMs || o.duration || TOAST_MS);
            return id;
        },
        dismissToast(id) { this.toasts = this.toasts.filter(t => t.id !== id); },
    };
    // Przed startem Alpine wołamy surowy obiekt; po alpine:init jego reaktywną kopię z Alpine.store.
    function magazyn() {
        try { if (root.Alpine && root.Alpine.store && root.Alpine.store('dialog')) return root.Alpine.store('dialog'); } catch (e) { /* ignore */ }
        return dialog;
    }
    document.addEventListener('alpine:init', function () { root.Alpine.store('dialog', dialog); });

    root.appToast = function (message, opts) { return magazyn().toast(message, opts); };
    root.appAlert = function (message, title) { return magazyn().alert(title || '', message); };
    root.appConfirm = function (message, title, opts) { return magazyn().confirm(title || '', message, opts || {}); };
    root.appConfirmDanger = function (message, title) {
        return magazyn().confirm(title || '', message, { variant: 'danger', confirmLabel: 'Usuń' });
    };
    root.appConfirmWithModel = function (message, title, opts) { return magazyn().confirmWithModel(title || '', message, opts || {}); };

    // Operacje w toku: bez karty postępu; sukces z successMessage kończy się toastem, jak w oryginale.
    const operacje = {};
    root.appOpStart = function (id, label, opts) {
        operacje[id] = { label: label, successMessage: (opts && opts.successMessage) || null };
        return id;
    };
    root.appOpEnd = function (id, arg) {
        const op = operacje[id];
        delete operacje[id];
        const blad = typeof arg === 'boolean' ? arg === false : !!(arg && arg.error === true);
        const czesciowo = !!(arg && typeof arg === 'object' && arg.czesciowo);
        if (op && op.successMessage && !blad && !czesciowo) root.appToast(op.successMessage, { variant: 'success' });
    };

    // ───────────────────────── Nakładka na fetch ─────────────────────────
    // Jak w oryginale: limit czasu (AI 180 s, reszta 60 s, init.timeoutMs nadpisuje) z czytelnym błędem,
    // toast przy odpowiedzi 400 z `missing_key` (brak klucza API) i 429 z `limit_exceeded` (limit wydatków).
    // Pozostałe błędy pokazuje kod, który pytał (komunikat z `detail` albo `error`), więc nie dublujemy.
    const AI_ADRES = /\/api\/xray\/(ai-diff|align)(?:\?|$)/;
    const TOAST_THROTTLE_MS = 8000;
    let ostatniToastSieci = 0;
    function toastRaz(tekst) {
        const teraz = Date.now();
        if (teraz - ostatniToastSieci < TOAST_THROTTLE_MS) return;
        ostatniToastSieci = teraz;
        root.appToast(tekst, { variant: 'error', durationMs: 15000 });
    }
    if (root.fetch && !root.__xrayFetch) {
        root.__xrayFetch = true;
        const oryginalny = root.fetch.bind(root);
        root.fetch = function (input, init) {
            const opcje = Object.assign({}, init || {});
            const url = typeof input === 'string' ? input : ((input && input.url) || '');
            let zegar = null, ms = 0;
            if (!opcje.signal && typeof AbortController !== 'undefined') {
                ms = opcje.timeoutMs || (AI_ADRES.test(url) ? 180000 : 60000);
                const ctrl = new AbortController();
                zegar = setTimeout(function () { try { ctrl.abort(new Error('timeout-' + ms + 'ms')); } catch (e) { ctrl.abort(); } }, ms);
                opcje.signal = ctrl.signal;
            }
            delete opcje.timeoutMs;
            return oryginalny(input, opcje).then(function (res) {
                if (zegar) clearTimeout(zegar);
                if (res && (res.status === 400 || res.status === 429)) {
                    const ct = (res.headers.get('content-type') || '').toLowerCase();
                    if (ct.indexOf('application/json') >= 0) {
                        res.clone().json().then(function (j) {
                            if (!j) return;
                            if (res.status === 400 && j.missing_key) {
                                toastRaz(j.detail || j.error || root.oppenTf('Brak klucza API: {0}. Bez klucza AI nic nie wygeneruje.', [j.provider_label || j.missing_key]));
                            } else if (res.status === 429 && j.limit_exceeded) {
                                toastRaz(j.error_short || j.detail || 'Dzienny limit wydatków przekroczony');
                            }
                        }).catch(function () { /* odpowiedź bez JSON */ });
                    }
                }
                return res;
            }, function (err) {
                if (zegar) clearTimeout(zegar);
                if (err && (err.name === 'AbortError' || String(err.message || '').indexOf('timeout-') === 0) && ms) {
                    const ladny = new Error('Przekroczono czas oczekiwania (' + Math.round(ms / 1000) + ' s). Sprawdź połączenie i spróbuj ponownie.');
                    ladny.name = 'TimeoutError';
                    throw ladny;
                }
                throw err;
            });
        };
    }

    // ───────────────────────── Strażnik okien: Tab zostaje w otwartym oknie ─────────────────────────
    function otwarteOkno() {
        const okna = Array.prototype.filter.call(document.querySelectorAll('[role="dialog"][aria-modal="true"]'),
            function (d) { return d.getClientRects().length > 0; });
        return okna.length ? okna[okna.length - 1] : null;
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dialog.open) {
            const m = magazyn();
            if (m.open) { e.preventDefault(); e.stopImmediatePropagation(); m.cancel(); }
            return;
        }
        if (e.key !== 'Tab') return;
        const okno = magazyn().open ? document.querySelector('[x-ref="appDialogPanel"]') : otwarteOkno();
        if (!okno) return;
        const fokusowalne = Array.prototype.filter.call(
            okno.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
            function (el) { return el.getClientRects().length > 0; });
        if (!fokusowalne.length) return;
        const pierwszy = fokusowalne[0], ostatni = fokusowalne[fokusowalne.length - 1];
        const a = document.activeElement;
        if (!okno.contains(a)) { e.preventDefault(); pierwszy.focus(); return; }
        if (e.shiftKey && a === pierwszy) { e.preventDefault(); ostatni.focus(); }
        else if (!e.shiftKey && a === ostatni) { e.preventDefault(); pierwszy.focus(); }
    }, true);

    // ───────────────────────── Motyw jasny / ciemny ─────────────────────────
    // Wybór zapamiętany w przeglądarce; bez wyboru motyw systemu (ustawia go skrypt w <head> przed rysowaniem).
    root.xrayPrzelaczMotyw = function () {
        const ciemny = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', ciemny);
        try { localStorage.setItem('xray_motyw', ciemny ? 'ciemny' : 'jasny'); } catch (e) { /* tryb prywatny */ }
        return ciemny;
    };
})(window);
