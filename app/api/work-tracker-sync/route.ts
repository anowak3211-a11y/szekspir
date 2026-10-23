import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { sheetAuth } from '@/lib/sheets';
import { driveConnection, oauthClient } from '@/lib/drive-oauth';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MASTER_SHEET_ID = '1DN13AcFWyVtjWUx4k0sSOGNqsDH8g7GShi6j-INrLyY';

const MONTHS_META = [
  { m: 1, tab: 'STYCZEŃ', label: 'Styczeń' },
  { m: 2, tab: 'LUTY', label: 'Luty' },
  { m: 3, tab: 'MARZEC', label: 'Marzec' },
  { m: 4, tab: 'KWIECIEŃ', label: 'Kwiecień' },
  { m: 5, tab: 'MAJ', label: 'Maj' },
  { m: 6, tab: 'CZERWIEC', label: 'Czerwiec' },
  { m: 7, tab: 'LIP', label: 'Lipiec' },
  { m: 8, tab: 'SRP', label: 'Sierpień' },
  { m: 9, tab: 'WRZESIEŃ', label: 'Wrzesień' },
  { m: 10, tab: 'PAZDZIERNIK', label: 'Październik' },
  { m: 11, tab: 'LISTOPAD', label: 'Listopad' },
  { m: 12, tab: 'GRUDZIEŃ', label: 'Grudzień' },
];

interface EmpConfig {
  header: string;
  fullName: string;
  rate: number;
  sheetId: string;
  gids: string[];
  dateCol: number;
  hoursCol: number;
}

const EMPLOYEES: EmpConfig[] = [
  {
    header: 'MARTYNA S',
    fullName: 'Martyna Skonecka',
    rate: 35,
    sheetId: '1_XPrBo770vcuVEdjyWyQq2cAq9ehoHxm7ZeL9FV9JUA',
    gids: ['798335730', '1988158635'],
    dateCol: 0,
    hoursCol: 1,
  },
  {
    header: 'JAROSLAW M',
    fullName: 'Jarosław Musiał',
    rate: 35,
    sheetId: '1h6rTXpnZfXuV15bDcoVBO6xPv-0gXRihbJqjY3YB4FU',
    gids: ['729999287'],
    dateCol: 1,
    hoursCol: 2,
  },
  {
    header: 'PATRCJA M',
    fullName: 'Patrycja Morawiec',
    rate: 35,
    sheetId: '11fiY7ShUTKgbYSupscWPa1p4K7V2ccFlqPzYsXlkEI8',
    gids: ['398720745'],
    dateCol: 0,
    hoursCol: 1,
  },
  {
    header: 'JAKUB C',
    fullName: 'Jakub Cabanowski',
    rate: 35,
    sheetId: '114AE2rAiVNS5ZLn4AOwYIRchuGyLozeFcKlwwzerKqM',
    gids: ['1962380411'],
    dateCol: 0,
    hoursCol: 1,
  },
  {
    header: 'ALEKSANDRA S',
    fullName: 'Ola Stanek',
    rate: 35,
    sheetId: '',
    gids: [],
    dateCol: 0,
    hoursCol: 1,
  },
];

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parsePlDate(raw: string, fallbackYear = 2026): { day: number; month: number; year: number } | null {
  const s = (raw || '').trim();
  if (!s) return null;
  const mFull = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (mFull) {
    const d = Number(mFull[1]);
    const m = Number(mFull[2]);
    const y = Number(mFull[3]);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) return { day: d, month: m, year: y };
  }
  const mIso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (mIso) {
    const y = Number(mIso[1]);
    const m = Number(mIso[2]);
    const d = Number(mIso[3]);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) return { day: d, month: m, year: y };
  }
  const mShort = s.match(/^(\d{1,2})[./-](\d{1,2})$/);
  if (mShort) {
    const d = Number(mShort[1]);
    const m = Number(mShort[2]);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      return { day: d, month: m, year: m === 12 ? 2025 : fallbackYear };
    }
  }
  return null;
}

function parseHours(raw: string): number {
  if (!raw) return 0;
  const cleaned = String(raw).replace(',', '.').replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return Number.isFinite(val) && val > 0 && val <= 24 ? val : 0;
}

function parseChronologicalRows(
  rows: string[][],
  dateCol: number,
  hoursCol: number,
  targetYear: number,
  byMonthDay: Record<number, Record<number, number>>,
) {
  let curYear = 2025;
  let curMonth = 12;
  let curDay = 1;

  const nextMonths = (startIdx: number): Array<[number, number]> => {
    const ms: Array<[number, number]> = [];
    for (let j = startIdx + 1; j < Math.min(rows.length, startIdx + 30); j++) {
      const s = String(rows[j]?.[dateCol] || '').trim();
      const m = s.match(/^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{4}))?$/);
      if (m) {
        ms.push([Number(m[1]), Number(m[2])]);
        if (ms.length >= 12) break;
      }
    }
    return ms;
  };

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const rawD = String(r[dateCol] || '').trim();
    const rawH = String(r[hoursCol] || '').trim();
    let hrs = parseHours(rawH);

    const m = rawD.match(/^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{4}))?$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      const yStr = m[3];
      let day = a;
      let month = b;

      if (b > 12 && a >= 1 && a <= 12) {
        day = b;
        month = a;
      } else if (a === 7 && (curMonth === 6 || curMonth === 7) && (curDay >= 28 || curMonth === 7)) {
        const ahead = nextMonths(i);
        if (
          ahead.some(x => x[1] > 12 || (x[0] === 7 && x[1] === b + 1)) ||
          (curMonth === 7 && b >= curDay && a === 7 && b <= 29 && i < 280)
        ) {
          day = b;
          month = a;
        }
      }

      if (month === curMonth + 1) {
        const ahead = nextMonths(i);
        const countStillPrev = ahead.filter(x => x[1] === curMonth).length;
        if (countStillPrev >= 3) {
          month = curMonth;
        }
      }

      if (yStr) {
        curYear = Number(yStr);
      } else if (curMonth === 12 && month === 1) {
        curYear = 2026;
      } else if (month === 12 && curMonth === 12 && i < 40) {
        curYear = 2025;
      } else {
        curYear = targetYear;
      }

      curMonth = month;
      curDay = day;
    } else {
      const hasOtherText = r
        .slice(0, 6)
        .some((c, ci) => ci !== dateCol && ci !== hoursCol && String(c || '').trim().length > 0);
      if (!hasOtherText) {
        hrs = 0;
      }
    }

    if (hrs > 0 && curYear === targetYear && curMonth >= 1 && curMonth <= 12 && curDay >= 1 && curDay <= 31) {
      if (!byMonthDay[curMonth]) byMonthDay[curMonth] = {};
      byMonthDay[curMonth][curDay] = (byMonthDay[curMonth][curDay] || 0) + hrs;
    }
  }
}

function colLetter(colIdx1Based: number): string {
  let n = colIdx1Based;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

async function getBestGoogleClients() {
  const clients: Array<{
    label: string;
    sheets: ReturnType<typeof google.sheets>;
    drive: ReturnType<typeof google.drive>;
    email?: string;
  }> = [];

  try {
    const saEmail = process.env.GOOGLE_CREDENTIALS_JSON
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON).client_email
      : undefined;
    const auth = sheetAuth();
    clients.push({
      label: 'service_account',
      sheets: google.sheets({ version: 'v4', auth }),
      drive: google.drive({ version: 'v3', auth }),
      email: saEmail,
    });
  } catch {
    // ignore
  }

  try {
    const { active } = await driveConnection();
    if (active) {
      const auth = oauthClient(active);
      auth.setCredentials({ refresh_token: active.refreshToken });
      clients.unshift({
        label: 'drive_oauth_store',
        sheets: google.sheets({ version: 'v4', auth }),
        drive: google.drive({ version: 'v3', auth }),
      });
    }
  } catch {
    // ignore
  }

  const {
    GOOGLE_DRIVE_CLIENT_ID: clientId,
    GOOGLE_DRIVE_CLIENT_SECRET: clientSecret,
    GOOGLE_DRIVE_REFRESH_TOKEN: refreshToken,
  } = process.env;
  if (clientId && clientSecret && refreshToken) {
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    clients.unshift({
      label: 'env_oauth',
      sheets: google.sheets({ version: 'v4', auth }),
      drive: google.drive({ version: 'v3', auth }),
    });
  }

  return clients;
}

async function fetchEmployeeAllMonths(
  emp: EmpConfig,
  year: number,
  clients: Awaited<ReturnType<typeof getBestGoogleClients>>,
): Promise<Record<number, Record<number, number>>> {
  const byMonthDay: Record<number, Record<number, number>> = {};
  if (!emp.sheetId) return byMonthDay;

  let fetchedViaCsv = false;
  for (const gid of emp.gids) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${emp.sheetId}/export?format=csv&gid=${gid}`;
      const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) continue;
      fetchedViaCsv = true;
      const rows = text.split(/\r?\n/).map(parseCsvLine);
      parseChronologicalRows(rows, emp.dateCol, emp.hoursCol, year, byMonthDay);
    } catch {
      // ignore
    }
  }

  // Fallback to authenticated Sheets API if CSV was blocked (e.g. private sheet)
  if (!fetchedViaCsv) {
    for (const c of clients) {
      try {
        const meta = await c.sheets.spreadsheets.get({
          spreadsheetId: emp.sheetId,
          fields: 'sheets.properties(title,sheetId)',
        });
        const titles = (meta.data.sheets || [])
          .map(s => s.properties?.title)
          .filter((t): t is string => Boolean(t));
        if (titles.length > 0) {
          const batchRes = await c.sheets.spreadsheets.values.batchGet({
            spreadsheetId: emp.sheetId,
            ranges: titles.map(t => `'${t}'!A1:F5000`),
          });
          for (const vr of batchRes.data.valueRanges || []) {
            const rows = (vr.values || []).map(r => r.map(x => String(x ?? '')));
            parseChronologicalRows(rows, emp.dateCol, emp.hoursCol, year, byMonthDay);
          }
          break;
        }
      } catch {
        // try next client
      }
    }
  }

  return byMonthDay;
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const url = req.nextUrl;
  const now = new Date();
  const year = Number(url.searchParams.get('year')) || now.getFullYear();
  const monthsParam = url.searchParams.get('months');
  const monthsToSync = monthsParam
    ? monthsParam.split(',').map(Number).filter(m => m >= 1 && m <= 12)
    : [8, 9, 10, 11]; // Default: SRP, WRZESIEŃ, PAZDZIERNIK, LISTOPAD

  const clients = await getBestGoogleClients();
  const serviceAccountEmail = clients.find(c => c.label === 'service_account')?.email || '';

  // Fetch all employee hours across the year
  const empAllMonths: Record<string, Record<number, Record<number, number>>> = {};
  for (const emp of EMPLOYEES) {
    empAllMonths[emp.header] = await fetchEmployeeAllMonths(emp, year, clients);
  }

  const collected: Record<
    number,
    Record<string, { totalHours: number; totalPln: number; days: Record<number, number> }>
  > = {};

  for (const m of monthsToSync) {
    collected[m] = {};
    for (const emp of EMPLOYEES) {
      const days = empAllMonths[emp.header]?.[m] || {};
      const totalHours = Object.values(days).reduce((a, b) => a + b, 0);
      collected[m][emp.header] = {
        totalHours,
        totalPln: totalHours * emp.rate,
        days,
      };
    }
  }

  let writeSuccess = false;
  let usedClient = '';
  const errors: string[] = [];

  for (const client of clients) {
    try {
      const sheets = client.sheets;
      const meta = await sheets.spreadsheets.get({
        spreadsheetId: MASTER_SHEET_ID,
        fields: 'sheets.properties(title,sheetId,index)',
      });
      const existingTabs = new Map<string, number>();
      for (const s of meta.data.sheets || []) {
        if (s.properties?.title && s.properties.sheetId !== undefined && s.properties.sheetId !== null) {
          existingTabs.set(s.properties.title, s.properties.sheetId);
        }
      }

      for (const m of monthsToSync) {
        const mMeta = MONTHS_META.find(x => x.m === m);
        if (!mMeta) continue;

        let tabSheetId = existingTabs.get(mMeta.tab);
        if (tabSheetId === undefined) {
          const addRes = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: MASTER_SHEET_ID,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: mMeta.tab,
                      index: m === 9 ? 1 : 0,
                      gridProperties: { rowCount: 60, columnCount: 30 },
                    },
                  },
                },
              ],
            },
          });
          const newId = addRes.data.replies?.[0]?.addSheet?.properties?.sheetId;
          if (newId !== undefined && newId !== null) {
            tabSheetId = newId;
            existingTabs.set(mMeta.tab, newId);
          }
        }

        // Clear old stray cells on the tab so headers and rows are 100% clean
        await sheets.spreadsheets.values.clear({
          spreadsheetId: MASTER_SHEET_ID,
          range: `'${mMeta.tab}'!A1:AA120`,
        });

        const daysInMonth = new Date(year, m, 0).getDate();
        const valueRanges: Array<{ range: string; values: (string | number)[][] }> = [
          { range: `'${mMeta.tab}'!A1`, values: [['PRACOWNIK:']] },
          { range: `'${mMeta.tab}'!A14`, values: [['CZAS PRACY:']] },
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const styleRequests: any[] = [];

        if (tabSheetId !== undefined) {
          // Reset background of entire area A1:AA60 to white first
          styleRequests.push({
            repeatCell: {
              range: {
                sheetId: tabSheetId,
                startRowIndex: 0,
                endRowIndex: 55,
                startColumnIndex: 0,
                endColumnIndex: 27,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 1, blue: 1 },
                  textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 }, bold: false },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          });
        }

        for (let i = 0; i < EMPLOYEES.length; i++) {
          const emp = EMPLOYEES[i];
          const startCol1 = 3 + i * 5; // C=3, H=8, M=13, R=18, W=23
          const startCol0 = startCol1 - 1;
          const c1 = colLetter(startCol1);
          const c2 = colLetter(startCol1 + 1);
          const c3 = colLetter(startCol1 + 2);
          const empDays = collected[m][emp.header]?.days || {};

          const rows: (string | number)[][] = [];
          for (let d = 1; d <= daysInMonth; d++) {
            const h = empDays[d] || 0;
            rows.push([`${d}.${m}.${year}`, h > 0 ? h : '', '']);
          }
          const sumRow = 15 + daysInMonth + 1;

          valueRanges.push(
            { range: `'${mMeta.tab}'!${c1}1`, values: [[emp.header]] },
            {
              range: `'${mMeta.tab}'!${c1}2:${c3}3`,
              values: [
                ['Godziny:', `=SUM(${c2}16:${c2}${sumRow - 1})`, ''],
                ['', '', ''],
              ],
            },
            { range: `'${mMeta.tab}'!${c1}14`, values: [[`${mMeta.label} ${year} — ${emp.fullName}`]] },
            { range: `'${mMeta.tab}'!${c1}15:${c3}15`, values: [['Data', 'Czas Pracy (godziny)', '']] },
            { range: `'${mMeta.tab}'!${c1}16:${c3}${sumRow - 1}`, values: rows },
            {
              range: `'${mMeta.tab}'!${c1}${sumRow}:${c3}${sumRow}`,
              values: [['SUMA:', `=SUM(${c2}16:${c2}${sumRow - 1})`, '']],
            },
          );

          if (tabSheetId !== undefined) {
            // Employee header row 1 bold (2 columns wide: c1..c2)
            styleRequests.push({
              repeatCell: {
                range: {
                  sheetId: tabSheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: startCol0,
                  endColumnIndex: startCol0 + 2,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                    textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 }, bold: true },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            });

            // Summary box row 2 light green tint (only row 2, 2 columns wide: Godziny | SUM)
            styleRequests.push({
              repeatCell: {
                range: {
                  sheetId: tabSheetId,
                  startRowIndex: 1,
                  endRowIndex: 2,
                  startColumnIndex: startCol0,
                  endColumnIndex: startCol0 + 2,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.851, green: 0.918, blue: 0.827 },
                    textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 }, bold: true },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            });

            // Month title bar (row 14 -> index 13) gray #8e8e8e
            styleRequests.push({
              repeatCell: {
                range: {
                  sheetId: tabSheetId,
                  startRowIndex: 13,
                  endRowIndex: 14,
                  startColumnIndex: startCol0,
                  endColumnIndex: startCol0 + 2,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.557, green: 0.557, blue: 0.557 },
                    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            });

            // Table column headers (row 15 -> index 14) black #000000
            styleRequests.push({
              repeatCell: {
                range: {
                  sheetId: tabSheetId,
                  startRowIndex: 14,
                  endRowIndex: 15,
                  startColumnIndex: startCol0,
                  endColumnIndex: startCol0 + 2,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0, green: 0, blue: 0 },
                    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            });

            // Worked day rows green #d9ead3
            for (let d = 1; d <= daysInMonth; d++) {
              const h = empDays[d] || 0;
              const bg =
                h > 0
                  ? { red: 0.851, green: 0.918, blue: 0.827 }
                  : { red: 1, green: 1, blue: 1 };
              styleRequests.push({
                repeatCell: {
                  range: {
                    sheetId: tabSheetId,
                    startRowIndex: 14 + d,
                    endRowIndex: 15 + d,
                    startColumnIndex: startCol0,
                    endColumnIndex: startCol0 + 2,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: bg,
                      horizontalAlignment: 'CENTER',
                    },
                  },
                  fields: 'userEnteredFormat(backgroundColor,horizontalAlignment)',
                },
              });
            }

            // SUMA row green #1e8e3e
            styleRequests.push({
              repeatCell: {
                range: {
                  sheetId: tabSheetId,
                  startRowIndex: sumRow - 1,
                  endRowIndex: sumRow,
                  startColumnIndex: startCol0,
                  endColumnIndex: startCol0 + 2,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.118, green: 0.557, blue: 0.243 },
                    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            });
          }
        }

        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: MASTER_SHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: valueRanges,
          },
        });

        if (styleRequests.length > 0) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: MASTER_SHEET_ID,
            requestBody: { requests: styleRequests },
          });
        }
      }

      writeSuccess = true;
      usedClient = client.label;
      break;
    } catch (err) {
      errors.push(`${client.label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    ok: writeSuccess,
    usedClient,
    serviceAccountEmail,
    masterSheetUrl: `https://docs.google.com/spreadsheets/d/${MASTER_SHEET_ID}/edit`,
    errors: writeSuccess ? [] : errors,
    collected,
  });
}
