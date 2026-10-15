const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const u=require('../lib/xray/ui-model.ts');
const a='  Hello — £24.99.\n\nSecond paragraph.  ',b='A different opening.';
const legacy=u.restore('similarities',[{name:'A',body:a},{name:'B',body:b}]);assert.equal(legacy.texts[0].body,a);assert.deepEqual(u.restore('similarities',u.serialise(legacy)),legacy);
const ai={overall_score:80,summary:'Stored paid result'};assert.deepEqual(u.restore('ai-diff',{texts:legacy.texts,ai:{verdict:ai}}).ai.verdict,ai);
const split=u.spans(a);assert(split.length>=2);assert.equal(split[0].text,a.slice(split[0].start,split[0].end));const changed=u.replaceSpan(a,split[0],'Updated.');assert(changed.endsWith(a.slice(split[0].end)),'Sentence edit preserves all outside text');
assert.equal(u.compare('same','same',legacy.opts).stats.similarity,1);const diff=u.compare('a long day','a busy day',legacy.opts);assert(diff.rows.some(r=>r.left.some(s=>s.type==='del')));assert(diff.rows.some(r=>r.right.some(s=>s.type==='ins')));
assert(u.canCompare(legacy));assert(!u.canCompare(u.fresh('skrypty-pl')));assert.equal(u.mapped(u.spans('One.\nTwo.'),u.spans('Jeden.\nDwa.'),[0,1],[]).grupy.length,2);
console.log('PASS native X-Ray: exact legacy/v2 recovery, cached verdict migration, lossless sentence edits, mechanical changes, sentence mapping and empty-state guards. No network.');

const oldAi=require('../public/xray/xray/ai_diff.js');assert.equal(u.legacyVerdictKey(a,b),oldAi.kluczPary(a,b),'Paid verdict cache keys remain compatible');
const oldScripts=require('../public/xray/xray/skrypty_pl.js'),sentences=require('../public/xray/xray/zdania.js');assert.equal(u.facebookParagraphs(a),oldScripts.skryptyPlTekstFb(a,sentences),'Explicit Facebook copy keeps legacy paragraph rules');
