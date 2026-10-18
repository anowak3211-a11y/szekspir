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

// Verify new pricing (99,99 zł / 50 zł) and 30-day guarantee rules are present in system prompt
assert.match(antkiPlLib, /99,99\s*zł/, 'System prompt must include 99,99 zł pricing');
assert.match(antkiPlLib, /50\s*zł\s*za\s*parę/, 'System prompt must include 50 zł per pair in 1+1 bundle');
assert.match(antkiPlLib, /30\s*dni/, 'System prompt must include 30-day guarantee');
assert.match(antkiPlLib, /ABSOLUTNY ZAKAZ EM-DASHÓW/, 'System prompt must forbid em-dashes');

// 3. Verify API route and UI page exist and connect to accountBrain
const apiRoute = read('app/api/antki-pl/route.ts');
assert.match(apiRoute, /brainClient/, 'API route must use brainClient');
assert.match(apiRoute, /accountRoute/, 'API route must be wrapped in accountRoute');
assert.match(apiRoute, /sanitizeAndAuditAntkiPl/, 'API route must sanitize and audit generated Polish copy');

const uiPage = read('app/antki-pl/page.tsx');
assert.match(uiPage, /\/api\/antki-pl/, 'UI page must call /api/antki-pl');
assert.match(uiPage, /SZEKSPIR_ADS_ANTKI_PL_/, 'UI page must support exporting JSON for Szekspir Ads uploader');

console.log('tests/antki-pl.cjs passed (35 funnel angles, Home tile, Brain API wiring, and Polish copy auditor verified).');
