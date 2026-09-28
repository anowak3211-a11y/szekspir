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
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteFile", product: selected, filename }),
    });
    setPreview(null);
    await refresh();
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
            onClick={() => {
              setSelected(selected === p.name ? "" : p.name);
              setPreview(null);
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
            <input
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
      {msg && <p className="exportmsg">{msg}</p>}

      {current && current.files.length > 0 && (
        <div className="prodeditor">
          <div className="prodhead">
            <strong>{current.name} — files</strong>
          </div>
          {current.files.map((f) => (
            <div key={f.filename} className="batchrow">
              <button
                className="filelink"
                onClick={() =>
                  setPreview(preview?.filename === f.filename ? null : f)
                }
              >
                📄 {f.filename}
              </button>
              <span className="tile-sub">
                {f.markdown.split("\n").length} lines
              </span>
              <button className="dellink" onClick={() => removeFile(f.filename)}>
                ✕
              </button>
            </div>
          ))}
          {preview && <pre className="script mdview">{preview.markdown}</pre>}
        </div>
      )}
    </main>
  );
}
