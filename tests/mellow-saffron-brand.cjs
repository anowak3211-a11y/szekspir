const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {canonicalMellowSaffronName:normalise,isMellowSaffronTarget:target}=require('../lib/mellow-saffron-brand.ts');
for(const name of ['Sapphire Happy Chews','Saphire Happy Chews','Mellow Happy Chews','MELLOW SAFFRON GUMMIES','Mellow Kids Gummies','Mellow Mood Munchies'])assert.equal(normalise(name+'. Buy two, get one free, but they keep selling the s**t out. So go grab it now. You\'re welcome.'),'Mellow Mood Munchies. Buy two, get one free, but they keep selling the s**t out. So go grab it now. You\'re welcome.');
assert.equal(normalise('I feel mellow. Mellow Magnesium Bisglycinate Gummies. https://sapphire.example/happy-chews help@sapphire.example'),'I feel mellow. Mellow Magnesium Bisglycinate Gummies. https://sapphire.example/happy-chews help@sapphire.example');
assert(target('Mellow Mood Munchies'));assert(target('Mellow',JSON.stringify({facts:[{content:{product_name:'Mellow Mood Munchies'}}]})));assert(target('Mellow','','Kids Gummies'));assert(!target('Mellow Magnesium Gummies'));assert(!target('Mellow',JSON.stringify({product_name:'Mellow Magnesium Gummies'})));
const disclosure=require('../lib/brand-disclosure.ts');assert(disclosure.mayIntroduceMellow('Sapphire Happy Chews.'));assert(!disclosure.hasUnwantedBrandReveal('Saphire Happy Chews.',['Mellow Mood Munchies.']));assert(disclosure.hasUnwantedBrandReveal('Saffron helps.',['Mellow Mood Munchies.']));
console.log('PASS complete Sapphire/Saphire/Mellow Happy Chews naming, exact surrounding CTA, idempotence, adjective/URL/email/magnesium preservation, new/legacy target profile and source disclosure gate.');

assert.equal(normalise('And for many families, Happy Chews has become one simple tool.'),'And for many families, Mood Munchies has become one simple tool.');
assert.equal(normalise('Happy Chews, HAPPY CHEWS. Mellow Happy Chews.'),'Mood Munchies, Mood Munchies. Mellow Mood Munchies.');
assert(disclosure.mayIntroduceMellow('Happy Chews has become one tool.'));
assert.equal(normalise(normalise('Happy Chews. Sapphire Happy Chews.')),'Mood Munchies. Mellow Mood Munchies.');
