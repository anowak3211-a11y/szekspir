import {accountEnv} from './account-context';
import { google } from "googleapis";
import path from "path";
import {productContext} from "./product-context";

function auth() {
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
      scopes,
    });
  }
  return new google.auth.GoogleAuth({
    keyFile:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(process.cwd(), "google-service-account.json"),
    scopes,
  });
}

function api() {
  return google.sheets({ version: "v4", auth: auth() });
}
const FALLBACK_ADMIN_SHEET = '17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY';

async function ensureProductsTab(spreadsheetId: string): Promise<number> {
  const sheets = api();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties(title,sheetId)',
  });
  const existing = meta.data.sheets?.find(s => s.properties?.title === 'Products');
  if (existing?.properties?.sheetId != null) {
    return existing.properties.sheetId;
  }
  const added = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: 'Products',
              gridProperties: { rowCount: 1000, columnCount: 10, frozenRowCount: 1 },
            },
          },
        },
      ],
    },
  });
  const newSheetId = added.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Products!A1:D1',
    valueInputOption: 'RAW',
    requestBody: { values: [['Product', 'Filename', 'Markdown', 'Updated']] },
  });
  return newSheetId;
}

async function resolveSheet(): Promise<string> {
  const primary = accountEnv('SPREADSHEET_ID');
  const fallback = accountEnv('ADMIN_SHEET_ID') || FALLBACK_ADMIN_SHEET;
  const candidates = [...new Set([primary, fallback].filter((x): x is string => Boolean(x && x.trim())))];
  let lastErr: unknown;
  for (const id of candidates) {
    try {
      await ensureProductsTab(id);
      return id;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Cannot access Products spreadsheet');
}

export interface ProductFile {
  filename: string;
  markdown: string;
}
export interface Product {
  name: string;
  files: ProductFile[];
  markdown: string; // all files combined — what SZEKSPIR injects into the prompt
}

// Sheet "Products": one row per file — A=Product, B=Filename, C=Markdown, D=Updated.
// A row with an empty Filename is a folder placeholder (empty product).

async function readRows(): Promise<{ spreadsheetId: string; rows: string[][] }> {
  const spreadsheetId = await resolveSheet();
  const r = await api().spreadsheets.values.get({
    spreadsheetId,
    range: "Products!A2:D",
  });
  return { spreadsheetId, rows: r.data.values || [] };
}

export async function getProducts(): Promise<Product[]> {
  const { rows } = await readRows();
  const map = new Map<string, ProductFile[]>();
  for (const row of rows) {
    const name = row[0];
    if (!name) continue;
    if (!map.has(name)) map.set(name, []);
    if (row[1]) map.get(name)!.push({ filename: row[1], markdown: row[2] || "" });
  }
  return [...map.entries()].map(([name, files]) => ({
    name,
    files,
    ...productContext(files),
  }));
}

const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");

export async function createProduct(name: string) {
  const { spreadsheetId, rows } = await readRows();
  if (rows.some((r) => r[0] === name)) return;
  await api().spreadsheets.values.append({
    spreadsheetId,
    range: "Products!A:D",
    valueInputOption: "RAW",
    requestBody: { values: [[name, "", "", now()]] },
  });
}

export async function renameProduct(oldName:string,newName:string){
  const old=oldName.trim(),next=newName.trim();
  if(!old||!next||next.length>120)throw new Error('Enter a product name up to 120 characters');
  const { spreadsheetId, rows } = await readRows();
  const matches=rows.flatMap((r,i)=>r[0]===old?[i+2]:[]);
  if(!matches.length)throw new Error('Product not found. Refresh and try again.');
  if(old===next)return;
  if(rows.some(r=>r[0]!==old&&r[0]?.toLowerCase()===next.toLowerCase()))throw new Error('A product with that name already exists');
  await api().spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody:{valueInputOption:'RAW',data:matches.map(row=>({range:`Products!A${row}`,values:[[next]]}))},
  });
}

export async function updateFile(product:string,filename:string,markdown:string,expectedMarkdown:string){
  if(!product?.trim()||!filename?.trim()||typeof markdown!=='string'||typeof expectedMarkdown!=='string')throw new Error('Product, file and previous contents are required');
  if(markdown.length>49000)throw new Error('Document exceeds spreadsheet cell limit');
  if(/\.json$/i.test(filename))JSON.parse(markdown);
  const { spreadsheetId, rows } = await readRows();
  const matches=rows.flatMap((r,i)=>r[0]===product&&r[1]===filename?[i]:[]);
  if(matches.length!==1)throw new Error('File not found or duplicated. Refresh before editing.');
  const index=matches[0];
  if((rows[index][2]||'')!==expectedMarkdown)throw new Error('This file changed since you opened it. Refresh to see the latest version.');
  if(markdown===expectedMarkdown)return;
  await api().spreadsheets.values.update({
    spreadsheetId,range:`Products!C${index+2}:D${index+2}`,valueInputOption:'RAW',
    requestBody:{values:[[markdown,now()]]},
  });
}

export async function addFile(
  product: string,
  filename: string,
  markdown: string
) {
  if (markdown.length > 49000) throw new Error("Document exceeds spreadsheet cell limit");
  if (filename.endsWith(".json")) JSON.parse(markdown);
  const { spreadsheetId, rows } = await readRows();
  const idx = rows.findIndex((r) => r[0] === product && r[1] === filename);
  if (idx >= 0) {
    await api().spreadsheets.values.update({
      spreadsheetId,
      range: `Products!A${idx + 2}:D${idx + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [[product, filename, markdown, now()]] },
    });
  } else {
    await api().spreadsheets.values.append({
      spreadsheetId,
      range: "Products!A:D",
      valueInputOption: "RAW",
      requestBody: { values: [[product, filename, markdown, now()]] },
    });
  }
}

export async function deleteFile(product: string, filename: string) {
  const { spreadsheetId, rows } = await readRows();
  const idx = rows.findIndex((r) => r[0] === product && r[1] === filename);
  if (idx < 0) return;
  const sheetId = await ensureProductsTab(spreadsheetId);
  await api().spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: idx + 1, // +1 for header, 0-based
              endIndex: idx + 2,
            },
          },
        },
      ],
    },
  });
}
