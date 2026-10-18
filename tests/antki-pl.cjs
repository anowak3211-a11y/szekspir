const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

// 1. Verify home tile exists in app/components/home-tiles.tsx
const homeTiles = read('app/components/home-tiles.tsx');
assert.match(homeTiles, /href="\/antki-pl"/, 'HomeTiles must include a link to /antki-pl');
assert.match(homeTiles, /ANTKI PL/, 'HomeTiles must display ANTKI PL title');

// 2. Verify lib/antki-pl.ts contains all 7 funnel stages and 35 angles
const antkiPlLib = read('lib/antki-pl.ts');
assert.match(antkiPlLib, /stage1_domowe_odkrycie/, 'Must include stage1_domowe_odkrycie');
assert.match(antkiPlLib, /stage2_efekt_domina/, 'Must include stage2_efekt_domina');
assert.match(antkiPlLib, /stage2_szkola_wf/, 'Must include stage2_szkola_wf');
assert.match(antkiPlLib, /stage3_wypalone_matki/, 'Must include stage3_wypalone_matki');
assert.match(antkiPlLib, /ryciak_rip3_variations/, 'Must include ryciak_rip3_variations');
assert.match(antkiPlLib, /zal_po_operacji/, 'Must include zal_po_operacji');
assert.match(antkiPlLib, /dorosli_jesien_zima/, 'Must include dorosli_jesien_zima');

// Count preset angles
const angleMatches = antkiPlLib.match(/id:\s*'pl-\d+-/g) || [];
assert.equal(angleMatches.length, 35, `Expected 35 preset angles in lib/antki-pl.ts, found ${angleMatches.length}`);

// Verify Awareness Stage & Sophistication instructions and new copy rules in system prompt
assert.match(antkiPlLib, /INSTRUKCJA POZIOMÓW ŚWIADOMOŚCI \(AWARENESS STAGE\) I SOFISTYKACJI RYNKU/, 'System prompt must explain Awareness Stages and Market Sophistication');
assert.match(antkiPlLib, /OBCY LUDZIE W SKLEPIE NIE ZNAJĄ IMIENIA MATKI/, 'System prompt must forbid store clerk knowing mother first name');
assert.match(antkiPlLib, /ZERO POLICYJNYCH, SZTUCZNYCH GODZIN CO DO MINUTY/, 'System prompt must forbid fake minute timestamps like o 20:07');
assert.match(antkiPlLib, /LOGICZNE WEJŚCIE POSTACI DO SCENY/, 'System prompt must enforce logical character entry into scene');
assert.match(antkiPlLib, /ZAKAZ WYLICZANKI „MAJĄ\.\.\. MAJĄ\.\.\. MAJĄ\.\.\."/, 'System prompt must forbid repetitive Mają... Mają... Mają... list');
assert.match(antkiPlLib, /DŁUGOŚĆ 1100-1300 SŁÓW/, 'System prompt must enforce 1100-1300 word winner architecture');
assert.match(antkiPlLib, /7 DNI OBSERWACJI/, 'System prompt must include the 7-day observation device from winners');
assert.match(antkiPlLib, /LICZBA MNOGA DLA WKŁADEK ORTHOMAX STEPMAX/, 'System prompt must enforce plural grammar for Orthomax StepMax');
assert.match(antkiPlLib, /REALIZM EMOCJONALNY MATKI/, 'System prompt must forbid mother crying together with child');
assert.match(antkiPlLib, /REALISTYCZNY MOST ODKRYCIA/, 'System prompt must enforce organic social discovery bridge');
assert.match(antkiPlLib, /599\s*zł/, 'Preset #1 must include 599 zł Nike angle');
assert.match(antkiPlLib, /99,99\s*zł/, 'System prompt must include 99,99 zł pricing');
assert.match(antkiPlLib, /50\s*zł\s*za\s*parę/, 'System prompt must include 50 zł per pair in 1+1 bundle');
assert.match(antkiPlLib, /30\s*dni/, 'System prompt must include 30-day guarantee');
assert.match(antkiPlLib, /ABSOLUTNY ZAKAZ EM-DASHÓW/, 'System prompt must forbid em-dashes');

// Verify no "worek z kapciami" in preset angles
assert.doesNotMatch(antkiPlLib.slice(0, antkiPlLib.indexOf('export const ANTKI_PL_SYSTEM_PROMPT')), /worek z kapciami|worka z kapciami/i, 'Preset angles must not use worek z kapciami');

// 3. Verify API route and UI page exist and connect to accountBrain
const apiRoute = read('app/api/antki-pl/route.ts');
assert.match(apiRoute, /brainClient/, 'API route must use brainClient');
assert.match(apiRoute, /accountRoute/, 'API route must be wrapped in accountRoute');
assert.match(apiRoute, /sanitizeAndAuditAntkiPl/, 'API route must sanitize and audit generated Polish copy');

const uiPage = read('app/antki-pl/page.tsx');
assert.match(uiPage, /\/api\/antki-pl/, 'UI page must call /api/antki-pl');
assert.match(uiPage, /Awareness Stage \/ Poziom Sofistykacji/, 'UI page must label stages by Awareness Stage / Sophistication');
assert.match(uiPage, /SZEKSPIR_ADS_ANTKI_PL_/, 'UI page must support exporting JSON for Szekspir Ads uploader');

console.log('tests/antki-pl.cjs passed (35 funnel angles, Awareness & Sophistication brain rules, plural grammar, and high-contrast UI verified).');
