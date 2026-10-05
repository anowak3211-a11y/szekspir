import { google } from "googleapis";
import path from "path";
import {fileRole,productContext} from "./product-context";

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
const SHEET = () => process.env.SPREADSHEET_ID!;

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

async function readRows(): Promise<string[][]> {
  const r = await api().spreadsheets.values.get({
    spreadsheetId: SHEET(),
    range: "Products!A2:D",
  });
  return (r.data.values || []);
}

export async function getProducts(): Promise<Product[]> {
  const rows = await readRows();
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
  const rows = await readRows();
  if (rows.some((r) => r[0] === name)) return;
  await api().spreadsheets.values.append({
    spreadsheetId: SHEET(),
    range: "Products!A:D",
    valueInputOption: "RAW",
    requestBody: { values: [[name, "", "", now()]] },
  });
}

export async function renameProduct(oldName:string,newName:string){
  const old=oldName.trim(),next=newName.trim();
  if(!old||!next||next.length>120)throw new Error('Enter a product name up to 120 characters');
  const rows=await readRows();
  const matches=rows.flatMap((r,i)=>r[0]===old?[i+2]:[]);
  if(!matches.length)throw new Error('Product not found. Refresh and try again.');
  if(old===next)return;
  if(rows.some(r=>r[0]!==old&&r[0]?.toLowerCase()===next.toLowerCase()))throw new Error('A product with that name already exists');
  await api().spreadsheets.values.batchUpdate({
    spreadsheetId:SHEET(),
    requestBody:{valueInputOption:'RAW',data:matches.map(row=>({range:`Products!A${row}`,values:[[next]]}))},
  });
}

export async function updateFile(product:string,filename:string,markdown:string,expectedMarkdown:string){
  if(!product?.trim()||!filename?.trim()||typeof markdown!=='string'||typeof expectedMarkdown!=='string')throw new Error('Product, file and previous contents are required');
  if(fileRole(filename)==='excluded')throw new Error('Operational files cannot be edited as product research');
  if(markdown.length>49000)throw new Error('Document exceeds spreadsheet cell limit');
  if(/\.json$/i.test(filename))JSON.parse(markdown);
  const rows=await readRows();
  const matches=rows.flatMap((r,i)=>r[0]===product&&r[1]===filename?[i]:[]);
  if(matches.length!==1)throw new Error('File not found or duplicated. Refresh before editing.');
  const index=matches[0];
  if((rows[index][2]||'')!==expectedMarkdown)throw new Error('This file changed since you opened it. Refresh to see the latest version.');
  if(markdown===expectedMarkdown)return;
  await api().spreadsheets.values.update({
    spreadsheetId:SHEET(),range:`Products!C${index+2}:D${index+2}`,valueInputOption:'RAW',
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
  const rows = await readRows();
  const idx = rows.findIndex((r) => r[0] === product && r[1] === filename);
  if (idx >= 0) {
    await api().spreadsheets.values.update({
      spreadsheetId: SHEET(),
      range: `Products!A${idx + 2}:D${idx + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [[product, filename, markdown, now()]] },
    });
  } else {
    await api().spreadsheets.values.append({
      spreadsheetId: SHEET(),
      range: "Products!A:D",
      valueInputOption: "RAW",
      requestBody: { values: [[product, filename, markdown, now()]] },
    });
  }
}

async function productsSheetId(): Promise<number> {
  const meta = await api().spreadsheets.get({ spreadsheetId: SHEET() });
  const s = meta.data.sheets?.find(
    (s) => s.properties?.title === "Products"
  );
  if (s?.properties?.sheetId == null) throw new Error("Products tab not found");
  return s.properties.sheetId;
}

export async function deleteFile(product: string, filename: string) {
  const rows = await readRows();
  const idx = rows.findIndex((r) => r[0] === product && r[1] === filename);
  if (idx < 0) return;
  const sheetId = await productsSheetId();
  await api().spreadsheets.batchUpdate({
    spreadsheetId: SHEET(),
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
