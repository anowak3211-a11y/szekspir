const assert=require('node:assert/strict');
const ts=require('typescript');const fs=require('fs');
const code=ts.transpile(fs.readFileSync('lib/parallel-upload.ts','utf8'),{module:ts.ModuleKind.CommonJS});const mod={exports:{}};new Function('exports',code)(mod.exports);
(async()=>{let active=0,peak=0,completed=[];const errors=await mod.exports.runUploads([0,1,2,3].map(i=>async()=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,10));active--;if(i===1)throw Error('failed file');completed.push(i);}));assert.equal(peak,2);assert.deepEqual(completed,[0,2,3]);assert.deepEqual(errors,['failed file']);console.log('Parallel uploads: overlap, limit and failure isolation passed');})();
