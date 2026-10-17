const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

require.extensions['.ts'] = (mod, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  mod._compile(transpiled.outputText, filename);
};

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.startsWith('@/')) {
    request = path.join(root, request.slice(2));
  }
  return origLoad.call(this, request, parent, isMain);
};

const {
  DEFAULT_MELLOW_REFERENCES,
  MELLOW_RIPPER_BRAND_BOOK,
  detectAspectRatio,
  isMellowProductSelection,
  buildImageRipperPrompt,
  buildKieCreateTaskPayload,
  parseDataUrlToBuffer,
} = require('../lib/image-ripper.ts');

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('PASS', name);
}

// 1. Aspect ratio detection tests
test('detectAspectRatio identifies 1:1, 4:5, 3:4, 9:16, 16:9 and auto fallback', () => {
  assert.equal(detectAspectRatio(1080, 1080), '1:1');
  assert.equal(detectAspectRatio(2048, 2048), '1:1');
  assert.equal(detectAspectRatio(1080, 1350), '4:5');
  assert.equal(detectAspectRatio(1536, 2048), '3:4');
  assert.equal(detectAspectRatio(1080, 1920), '9:16');
  assert.equal(detectAspectRatio(1920, 1080), '16:9');
  assert.equal(detectAspectRatio(0, 0), 'auto');
  assert.equal(detectAspectRatio(undefined, undefined), 'auto');
});

// 2. Mellow Mood Munchies brand detection and prompt rules
test('buildImageRipperPrompt enforces Mellow Mood Munchies UK PDP brand rules', () => {
  assert.equal(isMellowProductSelection('Mellow Mood Munchies'), true);
  assert.equal(isMellowProductSelection('Kids Gummies'), true);

  const prompt = buildImageRipperPrompt({
    productName: 'Mellow Mood Munchies',
    aspectRatio: '4:5',
  });

  // Palette & Competitor Purple Ban
  assert(prompt.includes('#DCECF5'), 'Must include pale ice-blue #DCECF5 palette');
  assert(prompt.includes('#102D46'), 'Must include deep navy #102D46 palette');
  assert(prompt.includes('#DBD3FF'), 'Must explicitly ban competitor purple #DBD3FF');
  assert(/purple/i.test(prompt), 'Must mention purple ban and saffron crocus props');

  // Pouch & Logo identity
  assert(prompt.includes('mellow'), 'Must include lowercase mellow wordmark');
  assert(/smile.*ll/i.test(prompt), 'Must describe smile curve beneath double ll');
  assert(prompt.includes('Mood munchies'), 'Must include Mood munchies title');
  assert(prompt.includes('30 SERVINGS | 60 GUMMIES'), 'Must include 30 SERVINGS | 60 GUMMIES pill text');
  assert(prompt.includes('NATURAL BERRIES FLAVOUR'), 'Must include NATURAL BERRIES FLAVOUR UK badge');
  assert(
    prompt.includes('SAFFRON GUMMIES FOR MOOD & FOCUS*'),
    'Must include SAFFRON GUMMIES FOR MOOD & FOCUS* bottom band'
  );
  assert(prompt.includes('Food Supplement'), 'Must require UK Food Supplement');
  assert(prompt.includes('Dietary Supplement'), 'Must explicitly forbid US Dietary Supplement');

  // Gummies & studio props
  assert(
    /5-petal flower-shaped gummies/i.test(prompt),
    'Must require glossy red 5-petal flower-shaped gummies'
  );

  // Offers & Timeline
  assert(prompt.includes('BUY 2 GET 1 FREE'), 'Must include BUY 2 GET 1 FREE offer rule');
  assert(prompt.includes('BUY 3 GET 2 FREE'), 'Must include BUY 3 GET 2 FREE offer rule');
  assert(prompt.includes('Day 7'), 'Must include Day 7 timeline rule');
  assert(prompt.includes('Day 30'), 'Must include Day 30 timeline rule');
  assert(prompt.includes('Day 100'), 'Must include Day 100 timeline rule');
});

test('buildImageRipperPrompt merges vision analysis and custom instructions', () => {
  const prompt = buildImageRipperPrompt({
    productName: 'Mellow Mood Munchies',
    aspectRatio: '1:1',
    customInstructions: 'Replace top badge with 30-Day Money-Back Guarantee in UK English.',
    visionAnalysis: {
      headline: 'Why UK Mums Are Switching To Saffron Gummies',
      subheadline: 'Calm mornings without the crash',
      layoutType: 'Split Us vs Them Comparison',
      visualHook: 'Left side shows Mellow pouch with flower gummies; right side shows generic bottle',
      backgroundMode: 'light-ice-blue',
      textReplacements: ['Dietary Supplement -> Food Supplement', 'Magic Stix -> Mood Munchies'],
      tailoredPrompt: 'Render crisp navy comparison table with pink checkmarks.',
    },
  });

  assert(prompt.includes('Why UK Mums Are Switching To Saffron Gummies'));
  assert(prompt.includes('Calm mornings without the crash'));
  assert(prompt.includes('Split Us vs Them Comparison'));
  assert(prompt.includes('Dietary Supplement -> Food Supplement'));
  assert(prompt.includes('Render crisp navy comparison table with pink checkmarks.'));
  assert(prompt.includes('Replace top badge with 30-Day Money-Back Guarantee in UK English.'));
});

// 3. Kie.ai payload builder tests
test('buildKieCreateTaskPayload formats nano-banana-pro, gpt-image-2-image-to-image, and recraft/crisp-upscale', () => {
  const urls = [
    'https://kie.test/comp.jpg',
    'https://kie.test/ref1.jpg',
    'https://kie.test/ref2.jpg',
    'https://kie.test/ref3.jpg',
    'https://kie.test/extra5.jpg',
  ];

  const nanoPayload = buildKieCreateTaskPayload({
    model: 'nano-banana-pro',
    prompt: 'Rebrand to Mellow',
    imageUrls: urls,
    aspectRatio: '4:5',
  });
  assert.equal(nanoPayload.model, 'nano-banana-pro');
  assert.equal(nanoPayload.input.resolution, '2K');
  assert.equal(nanoPayload.input.aspect_ratio, '3:4', '4:5 must map to 3:4 for Kie nano-banana-pro');
  assert.equal(nanoPayload.input.output_format, 'jpg');
  assert.equal(nanoPayload.input.image_input.length, 4, 'image_input must cap at 4 URLs');
  assert.deepEqual(nanoPayload.input.image_input, urls.slice(0, 4));

  const gptPayload = buildKieCreateTaskPayload({
    model: 'gpt-image-2-image-to-image',
    prompt: 'Rebrand via GPT image',
    imageUrls: urls,
    aspectRatio: '1:1',
  });
  assert.equal(gptPayload.model, 'gpt-image-2-image-to-image');
  assert.equal(gptPayload.input.resolution, '4K');
  assert.equal(gptPayload.input.input_urls.length, 4);
  assert.deepEqual(gptPayload.input.input_urls, urls.slice(0, 4));

  const upscalePayload = buildKieCreateTaskPayload({
    model: 'recraft/crisp-upscale',
    imageUrls: ['https://kie.test/generated.jpg'],
  });
  assert.equal(upscalePayload.model, 'recraft/crisp-upscale');
  assert.deepEqual(upscalePayload.input, { image: 'https://kie.test/generated.jpg' });
});

test('parseDataUrlToBuffer decodes valid data URLs and rejects invalid strings', () => {
  const parsed = parseDataUrlToBuffer('data:image/png;base64,aGVsbG8=');
  assert.equal(parsed.mimeType, 'image/png');
  assert.equal(parsed.ext, 'png');
  assert.equal(parsed.buffer.toString('utf8'), 'hello');
  assert.throws(() => parseDataUrlToBuffer('https://example.com/not-a-data-url.jpg'));
});

// 4. Static verification of UI, API route, Home Tiles, and Brand Reference files
test('Static verification of reference images, API route, UI page, and home tile', () => {
  assert.equal(DEFAULT_MELLOW_REFERENCES.length, 3);
  for (const ref of DEFAULT_MELLOW_REFERENCES) {
    const absRef = path.join(root, 'public', ref.path.replace(/^\/+/, ''));
    assert(fs.existsSync(absRef), `Missing reference image: ${absRef}`);
    const stat = fs.statSync(absRef);
    assert(stat.size > 10000, `Reference image ${ref.path} should be non-empty (>10KB)`);
  }

  const routeSource = fs.readFileSync(path.join(root, 'app/api/image-ripper/route.ts'), 'utf8');
  assert(routeSource.includes('pollKieRipperTask'));
  assert(routeSource.includes('submitKieRipperTask'));
  assert(routeSource.includes('analyzeCompetitorAdWithVision'));

  const pagePath = path.join(root, 'app/image-ripper/page.tsx');
  assert(fs.existsSync(pagePath), 'app/image-ripper/page.tsx must exist');
  const pageSource = fs.readFileSync(pagePath, 'utf8');
  assert(pageSource.includes('/api/image-ripper'), 'Page must call /api/image-ripper');
  assert(pageSource.includes('nano-banana-pro'), 'Page must include nano-banana-pro model option');

  const homeTilesSource = fs.readFileSync(path.join(root, 'app/components/home-tiles.tsx'), 'utf8');
  assert(homeTilesSource.includes('/image-ripper'), 'HomeTiles must link to /image-ripper');
  assert(homeTilesSource.includes('IMAGE RIPPER'), 'HomeTiles must render IMAGE RIPPER tile title');
});

console.log(`\n${passed} Image Ripper offline tests passed. No live provider or Sheet calls.`);
