const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {MetaError}=require('../lib/meta-client.ts'),{uploaderError}=require('../lib/meta-upload-http.ts');
const message=uploaderError(new MetaError(100,1885183,false,false,'Meta rejected the request (100/1885183).'));
assert.match(message,/Development mode/);assert.match(message,/Live/);assert.match(message,/saved media/);assert.match(message,/1885183/);
assert.equal(uploaderError(Error('access bearer private token')),'Connection failed. Check the uploader settings.');
console.log('PASS development-mode rejection gives actionable setup guidance without losing native code or exposing credentials.');
