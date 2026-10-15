import CD from '../../public/xray/cdiff.js';
import Sentences from '../../public/xray/xray/zdania.js';
import SentenceMap from '../../public/xray/zdania-mapa.js';
export type Mode = 'similarities' | 'ai-diff' | 'skrypty-pl';
export type Text = {
    name: string;
    body: string;
};
export type Verdict = {
    overall_score: number;
    verdict: string;
    summary: string;
    structure: {
        section: string;
        in_a: boolean;
        in_b: boolean;
        match: string;
        note: string;
    }[];
    pairs: {
        a_quote: string;
        b_quote: string;
        relation: string;
        note: string;
    }[];
    beyond_diff: string;
    recommendations: string[];
};
export type Alignment = {
    pl_to_en: (number | null)[];
    orig_to_en: (number | null)[] | null;
    pominiete_en_pl: number[];
    pominiete_en_orig: number[];
    ostrzezenie?: string | null;
};
export type Doc = {
    mode: Mode;
    texts: Text[];
    orig: string;
    en: string;
    pl: string;
    result: boolean;
    opts: {
        ws: boolean;
        typo: boolean;
        icase: boolean;
        punct: boolean;
        gran: 'word' | 'sentence' | 'char';
    };
    onlyChanged: boolean;
    dimSame: boolean;
    small: boolean;
    autoScroll: boolean;
    layout: 'columns' | 'unified';
    splitting: 'auto' | 'lines';
    anchorsOrig: {
        en: number;
        x: number;
    }[];
    anchorsPl: {
        en: number;
        x: number;
    }[];
    ai?: {
        verdict: Verdict;
        key: string;
    };
    alignment?: Alignment & {
        key: string;
    };
};
export const MODES: Mode[] = ['similarities', 'ai-diff', 'skrypty-pl'];
export const TITLES: Record<Mode, string> = { 'similarities': 'Warianty', 'ai-diff': 'Różnice', 'skrypty-pl': 'Lokalizacje' };
export function fresh(mode: Mode): Doc { return { mode, texts: [{ name: 'Oryginał', body: '' }, { name: 'Wariant', body: '' }], orig: '', en: '', pl: '', result: false, opts: { ws: true, typo: true, icase: false, punct: false, gran: 'word' }, onlyChanged: false, dimSame: false, small: false, autoScroll: true, layout: 'columns', splitting: 'auto', anchorsOrig: [], anchorsPl: [] }; }
export const fingerprint = (d: Doc) => JSON.stringify(d.mode === 'skrypty-pl' ? [d.orig, d.en, d.pl] : d.texts.map(t => t.body));
export function restore(mode: Mode, raw: unknown): Doc {
    const d = fresh(mode);
    if (!raw || typeof raw !== 'object')
        return d;
    const v = raw as Record<string, any>;
    if (v.v2) {
        const s = v.v2;
        for (const k of ['orig', 'en', 'pl'] as const)
            if (typeof s[k] === 'string')
                d[k] = s[k];
        if (Array.isArray(s.texts))
            d.texts = s.texts.filter((t: Text) => t && typeof t.body === 'string').slice(0, mode === 'ai-diff' ? 2 : 6).map((t: Text) => ({ body: t.body, name: typeof t.name === 'string' ? t.name : '' }));
        for (const k of ['result', 'onlyChanged', 'dimSame', 'small', 'autoScroll'] as const)
            if (typeof s[k] === 'boolean')
                d[k] = s[k];
        if (s.opts)
            d.opts = { ...d.opts, ...s.opts };
        if (s.layout === 'unified')
            d.layout = 'unified';
        if (s.splitting === 'lines')
            d.splitting = 'lines';
        d.anchorsOrig = Array.isArray(s.anchorsOrig) ? s.anchorsOrig : [];
        d.anchorsPl = Array.isArray(s.anchorsPl) ? s.anchorsPl : [];
        if (s.ai)
            d.ai = s.ai;
        if (s.alignment)
            d.alignment = s.alignment;
    }
    else {
        const texts = Array.isArray(v) ? v : v.texts;
        if (Array.isArray(texts))
            d.texts = texts.filter(t => t && typeof t.body === 'string').slice(0, mode === 'ai-diff' ? 2 : 6).map(t => ({ name: String(t.name || ''), body: t.body }));
        for (const k of ['orig', 'en', 'pl'] as const)
            if (typeof v[k] === 'string')
                d[k] = v[k];
        d.result = v.tryb === 'diff' || v.tryb === 'compare';
        if (v.opts)
            d.opts = { ...d.opts, ...v.opts };
        if (v.ai?.verdict)
            d.ai = { verdict: v.ai.verdict, key: v.ai.stale ? 'stale-legacy' : fingerprint(d) };
        if (v.mapa) {
            d.anchorsOrig = v.mapa.kotwiceOrig || [];
            d.anchorsPl = v.mapa.kotwicePl || [];
            if (v.mapa.aiPl || v.mapa.aiOrig) {
                const base = v.mapa.baza;
                const same = base && JSON.stringify(base.en) === JSON.stringify(spans(d.en).map(s => s.text)) && JSON.stringify(base.pl || []) === JSON.stringify(spans(d.pl).map(s => s.text)) && JSON.stringify(base.orig || []) === JSON.stringify(spans(d.orig).map(s => s.text));
                d.alignment = { key: same ? fingerprint(d) : 'stale-legacy', pl_to_en: v.mapa.aiPl || [], orig_to_en: v.mapa.aiOrig || null, pominiete_en_pl: v.mapa.brakPl || [], pominiete_en_orig: v.mapa.brakOrig || [] };
            }
        }
    }
    while (d.texts.length < 2)
        d.texts.push({ name: 'Wariant', body: '' });
    return d;
}
export function serialise(d: Doc) { return { ...(d.mode === 'skrypty-pl' ? { orig: d.orig, en: d.en, pl: d.pl } : { texts: d.texts }), v2: d }; }
export type Span = {
    start: number;
    end: number;
    text: string;
};
export function spans(text: string, mode: 'auto' | 'lines' = 'auto'): Span[] {
    if (mode === 'lines')
        return Array.from(text.matchAll(/[^\r\n]+/g)).filter(m => m[0].trim()).map(m => ({ start: m.index!, end: m.index! + m[0].length, text: m[0] }));
    return (Sentences.zakresy(text) as {
        start: number;
        end: number;
    }[]).map(s => ({ ...s, text: text.slice(s.start, s.end) }));
}
export function replaceSpan(text: string, span: Span, value: string) { return text.slice(0, span.start) + value + text.slice(span.end); }
export type Segment = {
    type: string;
    text: string;
};
export type Row = {
    kind: string;
    left: Segment[];
    right: Segment[];
    uni: Segment[];
    changeIdx?: number | null;
    moveId?: number;
};
export type Comparison = {
    rows: Row[];
    changes: number[];
    stats: {
        similarity: number;
        changes: number;
        added: number;
        removed: number;
        rewritten: number;
        moved: number;
        wordsA: number;
        wordsB: number;
    };
    degraded: boolean;
    reason?: string;
};
export function compare(a: string, b: string, opts: Doc['opts']): Comparison { return CD.compare(a, b, opts) as unknown as Comparison; }
export function mapped(en: Span[], target: Span[], ai: (number | null)[] | null | undefined, anchors: {
    en: number;
    x: number;
}[], missing: number[] = []) { return SentenceMap.dopasuj(en.map(s => s.text), target.map(s => s.text), { ai, kotwice: anchors, brakEn: missing }) as {
    grupy: {
        e0: number;
        e1: number;
        x0: number;
        x1: number;
    }[];
    grupaEn: number[];
    grupaX: number[];
    sierotyAi: boolean[];
    pominieteEn: boolean[];
    uproszczone: boolean;
}; }
export const words = (s: string) => s.trim() ? s.trim().split(/\s+/u).length : 0;
export function canCompare(d: Doc) { return d.mode === 'skrypty-pl' ? !!d.en.trim() && !!(d.orig.trim() || d.pl.trim()) : !!d.texts[0]?.body.trim() && d.texts.slice(1).some(t => t.body.trim()); }
// Legacy verdict keys include every UTF-16 code unit; preserve paid results on migration.
export function legacyVerdictKey(a: string, b: string) { const hash = (text: string) => { let h1 = 5381, h2 = 0x811c9dc5; for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = ((h1 * 33) ^ c) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x01000193) >>> 0;
} return h1.toString(36) + h2.toString(36) + ':' + text.length; }; return hash(a) + '|' + hash(b); }

export function facebookParagraphs(text:string):string{return Sentences.podziel(text).flatMap((sentence:string)=>Sentences.podzielRegex(sentence)).reduce((out:string[],sentence:string)=>{if(out.length&&/^–\s*\p{Ll}/u.test(sentence))out[out.length-1]+=' '+sentence;else out.push(sentence);return out;},[]).join('\n\n');}
