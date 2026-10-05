"use client";

import { useEffect, useState, useCallback } from "react";

type ProductFile = { filename: string; markdown: string };
type Product = { name: string; files: ProductFile[]; markdown: string };

export default function ProductFolder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState("");
  const [preview, setPreview] = useState<ProductFile | null>(null);
  const [msg, setMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming,setRenaming]=useState(false);
  const [nameDraft,setNameDraft]=useState("");
  const [editingFile,setEditingFile]=useState<ProductFile|null>(null);
  const [fileDraft,setFileDraft]=useState("");
  const [saving,setSaving]=useState(false);

  async function refresh() {
    const j = await fetch("/api/products").then((r) => r.json());
    setProducts(j.products || []);
  }
  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const current = products.find((p) => p.name === selected);

  async function createProduct() {
    const name = newName.trim();
    if (!name) return;
    setMsg("Creating…");
    const r = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name }),
    });
    if (r.ok) {
      await refresh();
      setSelected(name);
      setNewName("");
      setAdding(false);
      setMsg(`✅ Folder "${name}" created — drop files into it`);
    } else {
      const j = await r.json();
      setMsg("❌ " + (j.error || "Create failed"));
    }
  }

  async function importFiles(list: File[]) {
    if (!selected) {
      setMsg("❌ Select a product tile first");
      return;
    }
    setMsg(`Importing ${list.length} file(s)…`);
    try {
      const accepted:string[]=[];const skipped:string[]=[];
      for(const f of list){
        const data=new FormData();data.set('product',selected);data.set('file',f);
        const r=await fetch('/api/products/import',{method:'POST',body:data});const j=await r.json();
        if(!r.ok)throw new Error(j.error||'Import failed');
        accepted.push(...j.accepted.map((x:{name:string;role:string})=>`${x.name} (${x.role})`));skipped.push(...j.skipped);
      }
      await refresh();
      setMsg(`Added: ${accepted.join(", ") || "none"}. Excluded instructions/unsupported files: ${skipped.join(", ") || "none"}.`);
    } catch (err) {
      setMsg("❌ " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function removeFile(filename: string) {
    if (!confirm(`Delete ${filename} from ${selected}?`)) return;
    setSaving(true);
    try{const r=await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteFile", product: selected, filename }),
    });
    const j=await r.json();if(!r.ok)throw Error(j.error||'Delete failed');
    setPreview(null);setEditingFile(null);
    await refresh();setMsg(`Deleted ${filename}.`);
    }catch(e){setMsg('❌ '+(e instanceof Error?e.message:String(e)));}finally{setSaving(false);}
  }

  async function saveName(){
    const next=nameDraft.trim();
    if(!next){setMsg('❌ Enter a product name.');return;}
    if(next===selected){setRenaming(false);return;}
    setSaving(true);setMsg('Renaming product…');
    try{const r=await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rename',product:selected,name:next})});
      const j=await r.json();if(!r.ok)throw Error(j.error||'Rename failed');
      await refresh();setSelected(next);setRenaming(false);setPreview(null);setEditingFile(null);setMsg(`Product renamed to ${next}. Existing jobs keep their saved product snapshot.`);
    }catch(e){setMsg('❌ '+(e instanceof Error?e.message:String(e)));}finally{setSaving(false);}
  }

  async function saveFile(){
    if(!editingFile)return;
    setSaving(true);setMsg(`Saving ${editingFile.filename}…`);
    try{const r=await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'updateFile',product:selected,filename:editingFile.filename,markdown:fileDraft,expectedMarkdown:editingFile.markdown})});
      const j=await r.json();if(!r.ok)throw Error(j.error||'Save failed');
      await refresh();setPreview({filename:editingFile.filename,markdown:fileDraft});setEditingFile(null);setMsg(`Saved ${editingFile.filename}. Future jobs will use the updated reference.`);
    }catch(e){setMsg('❌ '+(e instanceof Error?e.message:String(e)));}finally{setSaving(false);}
  }

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      await importFiles(Array.from(e.dataTransfer.files));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected]
  );

  return (
    <main className="wrap">
      <p className="crumb">
        <a href="/">← Home</a>
      </p>
      <h1>📦 PRODUCT <span className="tag">folders</span></h1>
      <p className="sub">
        1. Select a product tile. 2. Drop .md, .json or ZIP files into it. Facts, research and examples stay separate. Operational prompts and README files are excluded.
      </p>

      <div className="tiles small">
        {products.map((p) => (
          <button
            key={p.name}
            className={"tile" + (selected === p.name ? " active" : "")}
            disabled={saving}
            onClick={() => {
              setSelected(selected === p.name ? "" : p.name);
              setPreview(null);
              setEditingFile(null);
              setRenaming(false);
            }}
          >
            <span className="tile-icon">📦</span>
            <span className="tile-title">{p.name}</span>
            <span className="tile-sub">
              {p.files.length} {p.files.length === 1 ? "file" : "files"}
            </span>
          </button>
        ))}
        {adding ? (
          <div className="tile add-tile">
            <label htmlFor="new-product-name">Product name</label>
            <input
              id="new-product-name"
              autoFocus
              placeholder="Product name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProduct()}
            />
            <button onClick={createProduct}>Create</button>
          </div>
        ) : (
          <button className="tile add-tile" onClick={() => setAdding(true)}>
            <span className="tile-icon">➕</span>
            <span className="tile-title">New product</span>
          </button>
        )}
      </div>

      <label
        className={
          "filebox dropzone" +
          (dragOver ? " over" : "") +
          (!selected ? " disabled" : "")
        }
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {selected
          ? `📥 Drop .md, .json or ZIP files into “${selected}” (or click to choose)`
          : "👆 Select a product tile first"}
        <input
          type="file"
          accept=".md,.txt,.json,.zip"
          multiple
          hidden
          disabled={!selected}
          onChange={(e) => importFiles(Array.from(e.target.files || []))}
        />
      </label>
      {msg && <p className="exportmsg" role="status">{msg}</p>}

      {current && (
        <div className="prodeditor">
          <div className="prodhead">
            {renaming?<><label htmlFor="product-rename">Product name</label><input id="product-rename" autoFocus value={nameDraft} maxLength={120} disabled={saving} onChange={e=>setNameDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void saveName();if(e.key==='Escape')setRenaming(false);}}/><button type="button" disabled={saving||!nameDraft.trim()} onClick={saveName}>{saving?'Saving…':'Save name'}</button><button type="button" disabled={saving} onClick={()=>setRenaming(false)}>Cancel</button></>
            :<><strong>{current.name} — files</strong><button type="button" disabled={saving} onClick={()=>{setNameDraft(current.name);setRenaming(true);setMsg('');}}>Rename product</button></>}
          </div>
          {current.files.length===0&&<p className="hint">No files yet. Drop a research file above to add one.</p>}
          {current.files.map((f) => (
            <div key={f.filename} className="batchrow">
              <button
                className="filelink"
                disabled={saving}
                onClick={() => {setPreview(preview?.filename === f.filename ? null : f);setEditingFile(null);}}
              >
                📄 {f.filename}
              </button>
              <span className="tile-sub">
                {f.markdown.split("\n").length} lines
              </span>
              <button type="button" disabled={saving} onClick={()=>{setEditingFile(f);setFileDraft(f.markdown);setPreview(null);setMsg('');}}>Edit</button>
              <button type="button" className="dellink" aria-label={`Delete ${f.filename}`} disabled={saving} onClick={() => removeFile(f.filename)}>Delete</button>
            </div>
          ))}
          {editingFile?<div className="product-file-editor"><label htmlFor="product-file-content">Edit {editingFile.filename}</label><textarea id="product-file-content" className="mdedit" rows={18} value={fileDraft} disabled={saving} onChange={e=>setFileDraft(e.target.value)}/><p className="hint">Only future jobs use changes to this reference. Existing jobs keep their saved copy.</p><div className="product-edit-actions"><button type="button" className="go" disabled={saving||fileDraft===editingFile.markdown||fileDraft.length>49000} onClick={saveFile}>{saving?'Saving…':'Save changes'}</button><button type="button" disabled={saving} onClick={()=>setEditingFile(null)}>Cancel</button></div>{fileDraft.length>49000&&<p className="err" role="alert">This document exceeds the spreadsheet cell limit of 49,000 characters.</p>}</div>:preview&&<pre className="script mdview">{preview.markdown}</pre>}
        </div>
      )}
    </main>
  );
}
