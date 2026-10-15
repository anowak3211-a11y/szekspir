'use client';
import { useEffect, useRef, useId, type ReactNode } from 'react';
import Icon from './icons';
import s from './workspace.module.css';
export function Dialog({ title, subtitle, onClose, children, wide = false }: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: ReactNode;
    wide?: boolean;
}) { const ref = useRef<HTMLDialogElement>(null), id = useId(); useEffect(() => { const el = ref.current; el?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { el?.close(); document.body.style.overflow = previous; }; }, []); return <dialog ref={ref} className={`${s.dialog} ${wide ? s.wide : ''}`} aria-labelledby={id} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        onClose();
} }}><header className={s.dialogHeader}><div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className={s.iconButton} aria-label="Zamknij okno" onClick={onClose}><Icon name="close"/></button></header>{children}</dialog>; }
export function Empty({ title, description, children }: {
    title: string;
    description: string;
    children?: ReactNode;
}) { return <div className={s.empty}><span className={s.emptyIcon}><Icon name="layers" size={28}/></span><h3>{title}</h3><p>{description}</p>{children}</div>; }
export async function api<T>(path: string, body?: unknown, method?: string): Promise<T> { const response = await fetch('/api/xray/' + path, { method: method || (body === undefined ? 'GET' : 'POST'), headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' }); let data; try {
    data = await response.json();
}
catch {
    throw Error('Nie udało się odczytać odpowiedzi. Spróbuj ponownie.');
} if (!response.ok || !data.ok)
    throw Object.assign(Error(data.error || 'Nie udało się wykonać operacji.'), { status: response.status, conflict: data.istnieje }); return data as T; }
