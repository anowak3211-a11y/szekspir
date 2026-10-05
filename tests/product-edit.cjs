const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const rows=[['Mellow','','',''],['Mellow','facts.json','{"brand":"Mellow"}','old'],['Mellow','notes.md','Old notes','old'],['Another','','','']];
const values={
 get:async()=>({data:{values:rows.map(r=>[...r])}}),
 batchUpdate:async({requestBody})=>{for(const d of requestBody.data){const index=Number(d.range.match(/A(\d+)/)[1])-2;rows[index][0]=d.values[0][0];}return {data:{}};},
 update:async({range,requestBody})=>{const index=Number(range.match(/C(\d+)/)[1])-2;rows[index][2]=requestBody.values[0][0];rows[index][3]=requestBody.values[0][1];return {data:{}};},
};
const original=Module._load;
Module._load=function(id,parent,isMain){if(id==='googleapis')return {google:{auth:{GoogleAuth:class {}},sheets:()=>({spreadsheets:{values}})}};return original.call(this,id,parent,isMain);};
process.env.SPREADSHEET_ID='offline-test';
const {renameProduct,updateFile,getProducts}=require('../lib/products.ts');
(async()=>{
 await assert.rejects(()=>renameProduct('Mellow','Another'),/already exists/);
 await renameProduct('Mellow','Mellow UK');assert.deepEqual(rows.slice(0,3).map(r=>r[0]),['Mellow UK','Mellow UK','Mellow UK']);
 await updateFile('Mellow UK','facts.json','{"brand":"Mellow UK"}','{"brand":"Mellow"}');assert.equal(rows[1][2],'{"brand":"Mellow UK"}');
 await assert.rejects(()=>updateFile('Mellow UK','facts.json','{}','{"brand":"Mellow"}'),/changed since/);
 await assert.rejects(()=>updateFile('Mellow UK','facts.json','{broken','{"brand":"Mellow UK"}'),SyntaxError);
 await assert.rejects(()=>updateFile('Mellow UK','missing.md','new',''),/not found/);
 const products=await getProducts();assert.equal(products[0].name,'Mellow UK');assert.equal(products[0].files.length,2);
 console.log('PASS product rename updates every row; file edits validate and reject stale saves');
})().catch(e=>{console.error(e);process.exitCode=1;});
