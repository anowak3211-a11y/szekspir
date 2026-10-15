'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fresh, restore, serialise, compare, spans, legacyVerdictKey, fingerprint, canCompare, words, MODES, TITLES, type Doc, type Mode, type Verdict, type Alignment } from '@/lib/xray/ui-model';
import Icon from './icons';
import Scripts from './scripts';
import Manage from './manage';
import Matrix from './matrix';
import { Dialog, Empty, api } from './ui';
import s from './workspace.module.css';
type Entry = {
    id: number;
    tryb: Mode;
    nazwa: string;
    brand_nazwa: string;
    brand_slug: string;
    editor_id: number;
    editor_nazwa: string;
    batch: number;
    revision: number;
    updated_at: string;
    dane?: unknown;
};
type Context = {
    marki: {
        slug: string;
        name: string;
    }[];
    edytorzy: {
        id: number;
        nazwa: string;
        aktywny: boolean;
    }[];
};
const descriptions: Record<Mode, string> = { similarities: 'Sprawdź, co łączy Twoje reklamy i czym różnią się warianty.', 'ai-diff': 'Zobacz każdą zmianę między dwiema wersjami tekstu.', 'skrypty-pl': 'Zestaw oryginał, wersję angielską i polską w jednym miejscu.' };
const headings: Record<Mode, string> = { similarities: 'Porównaj warianty reklam', 'ai-diff': 'Znajdź różnice w tekście', 'skrypty-pl': 'Porównaj lokalizacje' };
export default function Workspace({ initialMode, jobId, historyId }: {
    initialMode: Mode;
    jobId?: string;
    historyId?: string;
}) {
    const [d, setD] = useState<Doc>(fresh(initialMode)), [ready, setReady] = useState(false), [dialog, setDialog] = useState(''), [notice, setNotice] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [dark, setDark] = useState(false), [pair, setPair] = useState(1), [change, setChange] = useState(0), [entries, setEntries] = useState<Entry[]>([]), [archived, setArchived] = useState(false),[historyMode,setHistoryMode]=useState(''),[historyBrand,setHistoryBrand]=useState(''),[historyEditor,setHistoryEditor]=useState(''), [search, setSearch] = useState(''), [context, setContext] = useState<Context>({ marki: [], edytorzy: [] }), [title, setTitle] = useState(''), [brand, setBrand] = useState('mellow'), [editor, setEditor] = useState(0), [batch, setBatch] = useState(1), [link, setLink] = useState(''), [conflict, setConflict] = useState<Entry | null>(null), [job, setJob] = useState<{
        name: string;
        orig: string;
        en: string;
        pl: string;
    } | null>(null), [external, setExternal] = useState(false);
    const undo = useRef<Doc[]>([]), redo = useRef<Doc[]>([]), current = useRef(d), scrolling = useRef(false);
    current.current = d;
    const key = (mode: Mode) => 'szekspir-xray-v2:' + mode;
    function read(mode: Mode) { try {
        const modern = localStorage.getItem(key(mode));
        if (modern)
            return restore(mode, JSON.parse(modern));
        const legacy = localStorage.getItem(mode === 'similarities' ? 'xray_sim_texts' : mode === 'ai-diff' ? 'xray_aidiff_texts' : 'xray_scriptcompare_texts');
        if (legacy) {
            const restored = restore(mode, JSON.parse(legacy));
            if (mode === 'ai-diff' && !restored.ai) {
                const cache = JSON.parse(localStorage.getItem('xray_aidiff_werdykt') || '{}');
                const saved = cache[legacyVerdictKey(restored.texts[0].body, restored.texts[1].body)];
                if (saved?.verdict)
                    restored.ai = { verdict: saved.verdict, key: fingerprint(restored) };
            }
            return restored;
        }
    }
    catch { } return fresh(mode); }
    useEffect(() => { setD(read(initialMode)); setReady(true); setDark(localStorage.getItem('xray-theme') === 'dark'); const listener = (e: StorageEvent) => { if (e.key === key(current.current.mode))
        setExternal(true); }; window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener); }, [initialMode]);
    useEffect(() => { if (ready && !external)
        try {
            localStorage.setItem(key(d.mode), JSON.stringify(serialise(d)));
        }
        catch {
            setError('Brak miejsca na szkic w przeglądarce. Zapisz porównanie w historii.');
        } }, [d, ready, external]);
    useEffect(() => { if (jobId)
        api<{
            name: string;
            orig: string;
            en: string;
            pl: string;
        }>('job?id=' + encodeURIComponent(jobId)).then(x => { setJob(x); setDialog('import'); }).catch(e => setError(e.message)); if (historyId)
        api<{
            wpis: Entry;
        }>('historia/' + encodeURIComponent(historyId)).then(x => { setD(restore(x.wpis.tryb, x.wpis.dane)); setNotice('Otworzono zapis z historii.'); }).catch(e => setError(e.message)); }, [jobId, historyId]);
    function update(p: Partial<Doc>) { undo.current = [...undo.current.slice(-29), current.current]; redo.current = []; setD(x => ({ ...x, ...p })); }
    function changeMode(mode: Mode) { setD(read(mode)); setPair(1); undo.current = []; redo.current = []; setExternal(false); window.history.replaceState(null, '', '/ads-xray?tryb=' + mode); }
    function historyStep(back: boolean) { const from = back ? undo : redo, to = back ? redo : undo; const value = from.current.pop(); if (value) {
        to.current.push(d);
        setD(value);
    } }
    async function run(fn: () => Promise<void>) { setBusy(true); setError(''); try {
        await fn();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Operacja nie powiodła się.');
    }
    finally {
        setBusy(false);
    } }
    async function loadHistory(archive = false) { setArchived(archive); await run(async () => { const x = await api<{
        wpisy: Entry[];
    }>('historia' + (archive ? '/archiwum' : '')); setEntries(x.wpisy); setDialog('history'); }); }
    async function loadContext() { const x = await api<Context>('historia/kontekst'); setContext(x); setBrand(x.marki[0]?.slug || 'mellow'); setEditor(x.edytorzy[0]?.id || 0); return x; }
    async function openSave() { await run(async () => { const x = await loadContext(); const n = await api<{
        batch: number;
    }>('historia/nastepny-batch?tryb=' + d.mode + '&marka=' + encodeURIComponent(x.marki[0]?.slug || 'mellow') + '&edytor=' + (x.edytorzy[0]?.id || 0)); setBatch(n.batch); setConflict(null); setTitle(''); setDialog('save'); }); }
    async function save(overwrite = false) { await run(async () => { try {
        await api('historia', { tryb: d.mode, brand_slug: brand, editor_id: editor, batch, nazwa: title || headings[d.mode], link, dane: serialise(d), ...(overwrite && conflict ? { nadpisz: true, expected_revision: conflict.revision } : {}) });
        setDialog('');
        setNotice('Porównanie zapisane w historii.');
    }
    catch (e) {
        const x = e as Error & {
            conflict?: Entry;
        };
        if (x.conflict)
            setConflict(x.conflict);
        else
            throw e;
    } }); }
    async function copy(text: string) { try {
        await navigator.clipboard.writeText(text);
        setNotice('Tekst skopiowany.');
    }
    catch {
        setError('Przeglądarka nie pozwoliła skopiować tekstu.');
    } }
    const comparison = useMemo(() => compare(d.result ? d.texts[0]?.body || '' : '', d.result ? d.texts[Math.min(pair, d.texts.length - 1)]?.body || '' : '', d.opts), [d.result, d.texts, pair, d.opts]);
    const scriptColumns = [{ key: 'orig' as const, label: 'Oryginał' }, { key: 'en' as const, label: 'Angielski · baza' }, { key: 'pl' as const, label: 'Polski' }];
    const analysisKey = fingerprint({ ...d, texts: [d.texts[0], d.texts[pair] || d.texts[1]] });
    const stale = d.ai && d.ai.key !== analysisKey, alignmentStale = d.alignment && d.alignment.key !== fingerprint(d);
    function syncScroll(e: React.UIEvent<HTMLElement>) { if (!d.autoScroll || scrolling.current)
        return; scrolling.current = true; const target = e.currentTarget, ratio = target.scrollTop / Math.max(1, target.scrollHeight - target.clientHeight); document.querySelectorAll<HTMLElement>('[data-xray-scroll]').forEach(el => { if (el !== target)
        el.scrollTop = ratio * (el.scrollHeight - el.clientHeight); }); requestAnimationFrame(() => { scrolling.current = false; }); }
    async function analyse() { await run(async () => { if (d.mode === 'skrypty-pl') {
        const z = { orig: spans(d.orig, d.splitting).map(x => x.text), en: spans(d.en, d.splitting).map(x => x.text), pl: spans(d.pl, d.splitting).map(x => x.text) };
        const result = await api<Alignment>('align', { model: 'claude-sonnet-5-5', orig: d.orig, en: d.en, pl: d.pl, zdania: z });
        update({ alignment: { ...result, key: fingerprint(d) } });
    }
    else {
        const result = await api<{
            verdict: Verdict;
        }>('ai-diff', { text_a: d.texts[0].body, text_b: d.texts[Math.min(pair, d.texts.length - 1)].body, model: 'claude-sonnet-5-5' });
        update({ ai: { verdict: result.verdict, key: analysisKey } });
    } setDialog(''); }); }
    const button = (label: string, action: () => void, icon?: Parameters<typeof Icon>[0]['name'], primary = false) => <button type="button" disabled={busy} className={primary ? s.primary : s.button} onClick={action}>{icon && <Icon name={icon}/>} {label}</button>;
    return <div onScrollCapture={syncScroll} className={`${s.shell} ${dark ? s.dark : ''}`}><aside className={s.sidebar}><a className={s.brand} href="/"><span>S</span>SZEKSPIR</a><div className={s.sectionLabel}>PRACOWNIA TEKSTÓW</div><nav aria-label="Tryby porównania">{MODES.map((mode, i) => <button key={mode} className={d.mode === mode ? s.active : ''} onClick={() => changeMode(mode)}><Icon name={(['layers', 'diff', 'language'] as const)[i]}/><span>{TITLES[mode]}<small>{['Podobieństwa reklam', 'Zmiany słowo po słowie', 'Oryginał · EN · PL'][i]}</small></span></button>)}</nav><div className={s.sidebarBottom}><a href="/"><Icon name="back"/> Wróć do Szekspira</a><span>Ads X-Ray <i>●</i> Twoje teksty, uporządkowane</span></div></aside><main className={s.main} aria-busy={busy}><header className={s.topbar}><span>Pracownia <span>/</span> Ads X-Ray</span><div>{button('Historia', () => loadHistory(), 'history')}<button className={s.iconButton} aria-label={dark ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'} onClick={() => { setDark(!dark); localStorage.setItem('xray-theme', dark ? 'light' : 'dark'); }}><Icon name={dark ? 'sun' : 'moon'}/></button></div></header><section className={s.content}><div className={s.heading}><div><div className={s.eyebrow}>ADS X-RAY</div><h1>{headings[d.mode]}</h1><p>{descriptions[d.mode]}</p></div><span className={s.local}><span /> {d.mode === 'skrypty-pl' ? '3 wersje, jeden widok' : 'Porównanie lokalne · bez kosztu AI'}</span></div>
 {error && <div role="alert" className={s.error}>{error}<button aria-label="Zamknij komunikat" onClick={() => setError('')}>×</button></div>}{notice && <div role="status" className={s.notice}>{notice}<button aria-label="Zamknij komunikat" onClick={() => setNotice('')}>×</button></div>}{external && <div className={s.notice}>Tekst zmienił się w innej karcie. Zapis lokalny wstrzymany. {button('Wczytaj tamtą wersję', () => { setD(read(d.mode)); setExternal(false); })}{button('Zachowaj tę wersję', () => setExternal(false))}</div>}
 <div className={s.workspace}><div className={s.workbar}><div className={s.stages}><button className={!d.result ? s.selected : ''} onClick={() => update({ result: false })}><span>1</span> Teksty</button><span className={s.stageLine}/><button disabled={!canCompare(d)} className={d.result ? s.selected : ''} onClick={() => update({ result: true })}><span>2</span> Wynik</button></div><div className={s.actions}><button className={s.iconButton} disabled={!undo.current.length} aria-label="Cofnij zmianę" onClick={() => historyStep(true)}><Icon name="undo"/></button><button className={s.iconButton} disabled={!redo.current.length} aria-label="Ponów zmianę" onClick={() => historyStep(false)}><Icon name="redo"/></button>{button('Opcje', () => setDialog('options'), 'settings')}</div></div>
 {!d.result ? <><div className={`${s.editors} ${d.mode === 'skrypty-pl' ? s.three : ''}`}>{d.mode === 'skrypty-pl' ? scriptColumns.map((column, i) => <article className={s.editor} key={column.key}><header><span className={s.letter}>{i + 1}</span><strong>{column.label}</strong><button className={s.iconButton} aria-label={'Kopiuj ' + column.label} onClick={() => copy(d[column.key])}><Icon name="copy" size={16}/></button></header><textarea aria-label={column.label} value={d[column.key]} placeholder={'Wklej ' + column.label.toLowerCase() + '…'} onChange={e => update({ [column.key]: e.target.value })}/><footer>{words(d[column.key])} słów <span>{d[column.key].length} znaków</span></footer></article>) : d.texts.map((text, i) => <article className={s.editor} key={i}><header><span className={s.letter}>{String.fromCharCode(65 + i)}</span><input aria-label={'Nazwa tekstu ' + (i + 1)} value={text.name} placeholder={i === 0 ? 'Oryginał' : 'Wariant'} onChange={e => update({ texts: d.texts.map((x, n) => n === i ? { ...x, name: e.target.value } : x) })}/>{i > 1 && <button className={s.iconButton} aria-label="Usuń wariant" onClick={() => { update({ texts: d.texts.filter((_, n) => n !== i) }); setPair(1); }}><Icon name="close" size={16}/></button>}{i > 0 && <button className={s.iconButton} aria-label={'Ustaw tekst ' + String.fromCharCode(65 + i) + ' jako bazę'} onClick={() => { const texts = [...d.texts]; [texts[0], texts[i]] = [texts[i], texts[0]]; update({ texts }); setPair(1); }}><Icon name="back" size={15}/></button>}</header><textarea aria-label={'Tekst ' + String.fromCharCode(65 + i)} placeholder={i === 0 ? 'Wklej tekst bazowy…' : 'Wklej tekst do porównania…'} value={text.body} onChange={e => update({ texts: d.texts.map((x, n) => n === i ? { ...x, body: e.target.value } : x) })}/><footer>{words(text.body)} słów <span>{text.body.length} znaków</span></footer></article>)}</div><div className={s.bottomBar}><div>{d.mode === 'similarities' && d.texts.length < 6 ? button('Dodaj wariant', () => update({ texts: [...d.texts, { name: 'Wariant ' + d.texts.length, body: '' }] }), 'plus') : <span className={s.muted}>Teksty pozostają w tej przeglądarce.</span>}</div><button className={s.primary} disabled={!canCompare(d)} onClick={() => update({ result: true })}>Porównaj teksty <Icon name="arrow"/></button></div></> : <>
 {d.mode==='similarities'&&d.texts.length>2&&<Matrix doc={d} onPair={(a,b)=>{update({texts:[d.texts[a],d.texts[b],...d.texts.filter((_,n)=>n!==a&&n!==b)]});setPair(1);}}/>}<div className={s.resultToolbar}><div className={s.pills}>{d.mode === 'skrypty-pl' ? <span>Oryginał / Angielski / Polski</span> : d.texts.slice(1).map((t, i) => <button key={i} className={pair === i + 1 ? s.pillActive : ''} onClick={() => setPair(i + 1)}>{d.texts[0].name || 'A'} / {t.name || String.fromCharCode(66 + i)}</button>)}</div>{button('Edytuj teksty', () => update({ result: false }), 'edit')}</div>
 {d.mode !== 'skrypty-pl' ? <><div className={s.metrics}><div><strong>{Math.round(comparison.stats.similarity * 100)}<small>%</small></strong><span>podobieństwa tekstu</span></div><div><strong>{comparison.stats.changes}</strong><span>zmienione fragmenty</span></div><div className={s.legend}><span><i className={s.deleted}/> Usunięte</span><span><i className={s.added}/> Dodane</span></div></div>{comparison.degraded && <p className={s.notice}>Długi tekst: uproszczony widok porównania. {comparison.reason}</p>}<div className={`${s.diffGrid} ${d.layout === 'unified' ? s.unified : ''} ${d.small ? s.small : ''}`}><header><strong>{d.texts[0].name || 'Oryginał'}</strong><button className={s.iconButton} aria-label="Kopiuj bazę" onClick={() => copy(d.texts[0].body)}><Icon name="copy" size={16}/></button></header>{d.layout === 'columns' && <header><strong>{d.texts[pair]?.name || 'Wariant'}</strong><button className={s.iconButton} aria-label="Kopiuj wariant" onClick={() => copy(d.texts[pair].body)}><Icon name="copy" size={16}/></button></header>}{comparison.rows.filter(r => !d.onlyChanged || r.kind !== 'equal').map((row, i) => <div key={i} data-change={row.changeIdx ?? undefined} className={`${s.diffRow} ${row.kind === 'equal' && d.dimSame ? s.dim : ''}`}>{(d.layout === 'unified' ? [row.uni] : [row.left, row.right]).map((segments, n) => <div key={n} data-label={n === 0 ? (d.texts[0].name || 'Oryginał') : (d.texts[pair]?.name || 'Wariant')}><span className={s.lineNumber}>{i + 1}</span><p>{segments.map((part, j) => part.type === 'eq' ? <span key={j}>{part.text}</span> : <mark key={j} className={part.type === 'del' ? s.del : s.ins}>{part.text}</mark>)}</p></div>)}</div>)}</div></> : <Scripts doc={d} update={update} copy={copy}/>}
 {d.mode !== 'skrypty-pl' && comparison.changes.length > 0 && <div className={s.changeNav}><span>{comparison.changes.length} miejsc do sprawdzenia</span><button className={s.button} onClick={() => { const next = (change - 1 + comparison.changes.length) % comparison.changes.length; setChange(next); document.querySelector('[data-change="' + next + '"] > div')?.scrollIntoView({ block: 'center' }); }}><Icon name="back" size={15}/> Poprzednia</button><button className={s.button} onClick={() => { const next = (change + 1) % comparison.changes.length; setChange(next); document.querySelector('[data-change="' + next + '"] > div')?.scrollIntoView({ block: 'center' }); }}>Następna <Icon name="arrow" size={15}/></button></div>}
 <div className={s.bottomBar}><span className={s.muted}>Zapisz porównanie, aby wrócić do niego później.</span>{button('Zapisz porównanie', openSave, 'archive', true)}</div></>}
 </div>
 {!canCompare(d) && !d.result && <div className={s.hint}><Icon name="help" size={17}/><span>{d.mode === 'skrypty-pl' ? 'Dodaj angielską bazę i przynajmniej jedną inną wersję.' : 'Wklej co najmniej dwa teksty. Zmiany podświetlą się po porównaniu.'}</span><button onClick={() => { if (d.mode === 'skrypty-pl')
        update({ en: 'A calmer morning. More room for family life.', pl: 'Spokojniejszy poranek. Więcej miejsca na życie rodzinne.' });
    else
        update({ texts: [{ name: 'Oryginał', body: 'A fresh start. Find your own daily rhythm.' }, { name: 'Wariant', body: 'A fresh start. Find your own evening rhythm.' }] }); }}>Wypróbuj przykład <Icon name="arrow" size={14}/></button></div>}
 {d.result && <section className={s.aiSection}><div><span className={s.aiIcon}><Icon name="spark"/></span><div><h2>{d.mode === 'skrypty-pl' ? 'Dopasowanie zdań z AI' : 'Spójrz głębiej z AI'}</h2><p>{d.mode === 'skrypty-pl' ? 'Powiąż zdania między językami.' : 'Porównaj strukturę, sens i podejście obu reklam.'} Opcjonalna, płatna analiza.</p></div></div>{button('Przeanalizuj z AI', () => setDialog('ai'), 'spark')}</section>}
 {d.ai && d.mode !== 'skrypty-pl' && <section className={s.aiReport}><div className={s.eyebrow}>ANALIZA AI {stale ? '· NIEAKTUALNA PO EDYCJI' : ''}</div><h2>{({duplikat:'Duplikat',bliska_parafraza:'Bliska parafraza',ta_sama_struktura:'Ta sama struktura',luzne_podobienstwo:'Luźne podobieństwo',rozne_teksty:'Różne teksty'} as Record<string,string>)[d.ai.verdict.verdict]||d.ai.verdict.verdict} <span className={s.muted}>{d.ai.verdict.overall_score}% podobieństwa znaczenia</span></h2><p>{d.ai.verdict.summary}</p><details><summary>Pełna analiza i rekomendacje</summary><p>{d.ai.verdict.beyond_diff}</p>{d.ai.verdict.structure?.map((x, i) => <p key={i}><strong>{x.section}</strong> · {x.note}</p>)}{d.ai.verdict.pairs?.map((x, i) => <blockquote key={i}>{x.a_quote}<br />{x.b_quote}<p>{x.note}</p></blockquote>)}<ul>{d.ai.verdict.recommendations?.map((x, i) => <li key={i}>{x}</li>)}</ul></details></section>}
 {d.alignment && d.mode === 'skrypty-pl' && <section className={s.aiReport}><h2>Dopasowanie zdań {alignmentStale ? '· nieaktualne po edycji' : ''}</h2>{d.alignment.ostrzezenie && <p>{d.alignment.ostrzezenie}</p>}<ol>{d.alignment.pl_to_en.map((en, i) => <li key={i}>PL {i + 1}: {en === null ? 'dodatkowe zdanie' : 'EN ' + (en + 1)}</li>)}</ol></section>}
 <footer className={s.pageFooter}><span>Ads X-Ray · Pracownia Szekspira</span><button onClick={() => { setDialog('manage'); }}>Marki i edytorzy <Icon name="settings" size={14}/></button></footer>
 </section></main>
 {dialog === 'options' && <Dialog title="Opcje porównania" subtitle="Dostosuj szczegóły, zachowując oryginalny tekst." onClose={() => setDialog('')}><div className={s.form}>{d.mode !== 'skrypty-pl' ? <><label>Dokładność<select value={d.opts.gran} onChange={e => update({ opts: { ...d.opts, gran: e.target.value as Doc['opts']['gran'] } })}><option value="word">Słowa</option><option value="sentence">Zdania</option><option value="char">Znaki</option></select></label><label>Układ<select value={d.layout} onChange={e => update({ layout: e.target.value as Doc['layout'] })}><option value="columns">Dwie kolumny</option><option value="unified">Wspólny tekst</option></select></label>{(['ws', 'typo', 'icase', 'punct'] as const).map((key, i) => <label className={s.check} key={key}><input type="checkbox" checked={d.opts[key]} onChange={e => update({ opts: { ...d.opts, [key]: e.target.checked } })}/>{['Pomijaj różnice w odstępach', 'Pomijaj różnice typograficzne', 'Pomijaj wielkość liter', 'Pomijaj interpunkcję'][i]}</label>)}</> : <label>Podział tekstu<select value={d.splitting} onChange={e => update({ splitting: e.target.value as Doc['splitting'] })}><option value="auto">Automatycznie na zdania</option><option value="lines">Według wierszy</option></select></label>}{(['onlyChanged', 'dimSame', 'small', 'autoScroll'] as const).map((key, i) => <label key={key} className={s.check}><input type="checkbox" checked={d[key]} onChange={e => update({ [key]: e.target.checked })}/>{['Pokazuj tylko zmiany', 'Przygaś identyczne fragmenty', 'Mniejszy tekst', 'Synchronizuj przewijanie'][i]}</label>)}{button('Gotowe', () => setDialog(''), undefined, true)}</div></Dialog>}
 {dialog === 'history' && <Dialog title={archived ? 'Archiwum porównań' : 'Twoje porównania'} subtitle="Wróć do zapisanych tekstów i analiz." onClose={() => setDialog('')} wide><div className={s.historyTools}><label className={s.search}><Icon name="search"/><input aria-label="Szukaj zapisów" placeholder="Szukaj po nazwie, marce lub trybie…" value={search} onChange={e => setSearch(e.target.value)}/></label>{button(archived ? 'Aktywne zapisy' : 'Archiwum', () => loadHistory(!archived), 'archive')}</div><div className={s.historyFilters}><label>Tryb<select value={historyMode} onChange={e=>setHistoryMode(e.target.value)}><option value="">Wszystkie tryby</option>{MODES.map(m=><option key={m} value={m}>{TITLES[m]}</option>)}</select></label><label>Marka<select value={historyBrand} onChange={e=>setHistoryBrand(e.target.value)}><option value="">Wszystkie marki</option>{Array.from(new Set(entries.map(x=>x.brand_slug))).map(slug=><option key={slug} value={slug}>{entries.find(x=>x.brand_slug===slug)?.brand_nazwa||slug}</option>)}</select></label><label>Edytor<select value={historyEditor} onChange={e=>setHistoryEditor(e.target.value)}><option value="">Wszyscy edytorzy</option>{Array.from(new Set(entries.map(x=>x.editor_id))).map(id=><option key={id} value={id}>{entries.find(x=>x.editor_id===id)?.editor_nazwa||id}</option>)}</select></label></div><div className={s.historyList}>{entries.filter(x => (!historyMode||x.tryb===historyMode)&&(!historyBrand||x.brand_slug===historyBrand)&&(!historyEditor||String(x.editor_id)===historyEditor)).filter(x => (x.nazwa + ' ' + (x.brand_nazwa || x.brand_slug) + ' ' + TITLES[x.tryb]).toLowerCase().includes(search.toLowerCase())).map(x => <article key={x.id}><div><small>{x.brand_nazwa || x.brand_slug} · {TITLES[x.tryb]} · #{x.batch}</small><h3>{x.nazwa}</h3><p>{x.editor_nazwa} · {new Date(x.updated_at).toLocaleDateString('pl-PL')}</p></div><div>{archived ? button('Przywróć', () => run(async () => { await api('historia/' + x.id + '/restore', {}); await loadHistory(true); }), 'undo') : <>{button('Otwórz', () => run(async () => { const data = await api<{
        wpis: Entry;
    }>('historia/' + x.id); setD(restore(x.tryb, data.wpis.dane)); setPair(1); setDialog(''); }), 'arrow')}<button className={s.iconButton} aria-label={'Archiwizuj ' + x.nazwa} onClick={() => run(async () => { await api('historia/' + x.id, undefined, 'DELETE'); await loadHistory(); })}><Icon name="archive"/></button></>}</div></article>)}{entries.length === 0 && <Empty title="Tu pojawią się Twoje zapisy" description="Zapisz pierwsze porównanie z widoku wyników."/>}</div></Dialog>}
 {dialog === 'save' && <Dialog title="Zapisz porównanie" subtitle="Teksty, ustawienia i gotowa analiza pozostaną razem." onClose={() => setDialog('')}><form className={s.form} onSubmit={e => { e.preventDefault(); if (!conflict)
        save(); }}>{error && <p role="alert" className={s.error}>{error}</p>}<label>Nazwa porównania<input value={title} placeholder="Np. Nowe otwarcia · październik" onChange={e => setTitle(e.target.value)}/></label><div className={s.formRow}><label>Marka<select value={brand} onChange={e => { setBrand(e.target.value); setConflict(null); }}>{context.marki.map(x => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label><label>Edytor<select value={editor} onChange={e => { setEditor(+e.target.value); setConflict(null); }}>{context.edytorzy.filter(x => x.aktywny).map(x => <option key={x.id} value={x.id}>{x.nazwa}</option>)}</select></label></div><details><summary>Dodatkowe informacje</summary><label>Numer partii<input type="number" min={1} value={batch} onChange={e => { setBatch(+e.target.value); setConflict(null); }}/></label><label>Link do reklamy<input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://…"/></label></details>{conflict ? <div className={s.notice}>W tej partii istnieje „{conflict.nazwa}”. Zastąpić tę wersję?{button('Zastąp zapis', () => save(true), undefined, true)}</div> : <button className={s.primary} disabled={busy} type="submit">{busy ? 'Zapisywanie…' : 'Zapisz porównanie'}</button>}</form></Dialog>}
 {dialog === 'ai' && <Dialog title="Uruchomić płatną analizę?" subtitle="Claude Sonnet 5.5 · Anthropic" onClose={() => setDialog('')}><div className={s.form}>{error && <p role="alert" className={s.error}>{error}</p>}<p>Teksty zostaną przesłane do dostawcy AI. Koszt zależy od długości tekstów i odpowiedzi. Nie jest to analiza bezpłatna ani operacja z ustalonym limitem kosztu.</p><p>Zwykłe porównanie działa lokalnie. Zamknięcie tego okna niczego nie uruchamia.</p>{button(busy ? 'Analizowanie…' : 'Potwierdzam płatną analizę', analyse, 'spark', true)}</div></Dialog>}
 {dialog === 'import' && job && <Dialog title="Otworzyć teksty ze Szekspira?" subtitle={job.name} onClose={() => setDialog('')}><div className={s.form}><p>Import zastąpi bieżący szkic lokalizacji. Oryginalny zapis w Szekspirze pozostanie bez zmian.</p>{button('Otwórz w lokalizacjach', () => { undo.current.push(d); setD({ ...fresh('skrypty-pl'), orig: job.orig, en: job.en, pl: job.pl }); setDialog(''); }, 'arrow', true)}</div></Dialog>}
 {dialog === 'manage' && <Manage onClose={() => setDialog('')}/>}
 </div>;
}
