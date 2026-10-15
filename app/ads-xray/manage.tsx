'use client';
import { useEffect, useState } from 'react';
import { Dialog, api } from './ui';
import Icon from './icons';
import s from './workspace.module.css';
type Item = {
    id: number;
    nazwa: string;
    aktywny: boolean;
    kolejnosc: number;
};
export default function Manage({ onClose }: {
    onClose: () => void;
}) {
    const [kind, setKind] = useState('marki'), [list, setList] = useState<Item[]>([]), [name, setName] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    async function load() { try {
        const x = await api<Record<string, Item[]>>(kind);
        setList(x[kind]);
    }
    catch (e) {
        setError((e as Error).message);
    } }
    useEffect(() => { load(); }, [kind]);
    async function mutate(body: unknown) { setBusy(true); setError(''); try {
        const x = await api<Record<string, Item[]>>(kind, body);
        setList(x[kind]);
        setName('');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <Dialog title="Marki i edytorzy" subtitle="Nazwy porządkują historię. Nie zmieniają dostępu do konta." onClose={onClose}><div className={s.form}>{error && <p role="alert" className={s.error}>{error}</p>}<label>Lista<select value={kind} onChange={e => setKind(e.target.value)}><option value="marki">Marki</option><option value="edytorzy">Edytorzy</option></select></label>{list.map((item, i) => <div className={s.manageRow} key={kind + item.id}><input aria-label={'Nazwa ' + item.nazwa} defaultValue={item.nazwa} key={item.nazwa} onBlur={e => { if (e.target.value.trim() !== item.nazwa)
        mutate({ akcja: 'zmien', id: item.id, nazwa: e.target.value }); }}/><div><button disabled={busy || i === 0} className={s.iconButton} aria-label={'Przesuń w górę ' + item.nazwa} onClick={() => { const ids = list.map(x => x.id); [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]]; mutate({ akcja: 'kolejnosc', ids }); }}><Icon name="back" size={15}/></button><button disabled={busy || i === list.length - 1} className={s.iconButton} aria-label={'Przesuń w dół ' + item.nazwa} onClick={() => { const ids = list.map(x => x.id); [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]]; mutate({ akcja: 'kolejnosc', ids }); }}><Icon name="arrow" size={15}/></button><button disabled={busy} className={s.button} onClick={() => mutate({ akcja: 'zmien', id: item.id, aktywny: !item.aktywny })}>{item.aktywny ? 'Wyłącz' : 'Włącz'}</button></div></div>)}<label>Nowa nazwa<input value={name} onChange={e => setName(e.target.value)}/></label><button disabled={busy || !name.trim()} className={s.primary} onClick={() => mutate({ akcja: 'dodaj', nazwa: name })}><Icon name="plus"/> Dodaj</button></div></Dialog>;
}
