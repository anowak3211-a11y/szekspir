const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {copyReferenceForProduct,sheetProductLabel,copyReferenceLabel}=require('../lib/product-reference.ts');
const refs=[{name:'Mellow'},{name:'Mellow saffron'},{name:'Orthomax'}];
assert.equal(copyReferenceForProduct('Kids Gummies',refs,'Mellow'),'Mellow saffron');assert.equal(copyReferenceForProduct('Magnesium Bisglycine Gummies',refs,'Mellow saffron'),'Mellow');
assert.equal(copyReferenceForProduct('Kids Gummies',[{name:'MELLOW SAFFRON GUMMIES'}]),'MELLOW SAFFRON GUMMIES');
assert.equal(copyReferenceForProduct('Kids Gummies',[{name:'Mellow'}]),'','Missing saffron reference must never select magnesium');
assert.equal(copyReferenceForProduct('Kids Gummies',[{name:'Updated brief',files:[{filename:'_product_profile.json',markdown:'{"product_name":"MELLOW SAFFRON GUMMIES"}'}]}]),'Updated brief');
assert.equal(copyReferenceForProduct('Kids Gummies',[{name:'Mellow saffron A'},{name:'Mellow saffron B'}],'Mellow saffron B'),'Mellow saffron B');
assert.equal(sheetProductLabel('Kids Gummies'),'Mellow Mood Munchies');assert.equal(copyReferenceLabel('Mellow saffron'),'Mellow Mood Munchies');
assert.equal(copyReferenceForProduct('Kids Gummies',[{name:'Bloomwise Kids'},{name:'Mellow saffron'}]),'Mellow saffron','Competitor reference must never become the automatic target profile');
assert.equal(copyReferenceForProduct('Kids Gummies',[{name:'Mellow Mood Munchies'}]),'Mellow Mood Munchies');
const bennettRefs=[
 {name:'Bennett & Seed — Hair'},
 {name:'Bennett & Seed — Bladder'},
 {name:'Bennett & Seed — Prostate'},
 {name:'Bennett & Seed — Kidney'},
 {name:'Bennett & Seed — Urology'},
 ...refs,
];
for(const angle of ['Bennett & Seed — Hair','Bennett & Seed — Bladder','Bennett & Seed — Prostate','Bennett & Seed — Kidney','Bennett & Seed — Urology']){
 assert.equal(copyReferenceForProduct(angle,bennettRefs,'Mellow'),angle);
 assert.equal(sheetProductLabel(angle),angle);
}
assert.equal(copyReferenceForProduct('pumpkin',bennettRefs),'Bennett & Seed — Hair');
assert.equal(sheetProductLabel('pumpkin'),'Bennett & Seed — Hair');
const ui=fs.readFileSync('app/szekspir/workspace.tsx','utf8');assert(ui.includes('setProductName(copyReferenceForProduct(product,products))'));assert(ui.includes('value={p.name}'));assert(ui.includes('signal:AbortSignal.timeout(240000)'));assert(ui.includes('Retry cancellation cleanup'));
console.log('PASS product → correct copy reference, 5 Bennett & Seed angles, legacy IDs/canonical labels, profile fallback, retained matching reference and missing-match safety');

