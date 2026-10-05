const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const records=new Map();let requests=0,folderOK=true,refresh=true,authOptions;
class OAuth2{generateAuthUrl(o){authOptions=o;return 'https://accounts.google.com/oauth';}async getToken(o){requests++;assert.ok(o.codeVerifier);return {tokens:refresh?{refresh_token:'test-refresh'}:{}};}setCredentials(){}}
const store={async readState(k,f){return {value:structuredClone(records.get(k)||f)};},async mutate(k,f,fn){const value=structuredClone(records.get(k)||f),result=fn(value);records.set(k,value);return result;}};
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/drive-oauth.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:mod.exports,require:n=>n==='./store'?store:n==='googleapis'?{google:{auth:{OAuth2},drive:()=>({files:{get:async()=>({data:{mimeType:'application/vnd.google-apps.folder',capabilities:{canAddChildren:folderOK}}})}})}}:require(n),Buffer,process:{env:{GOOGLE_DRIVE_VIDEO_FOLDER_ID:'test-folder'}},Date});
const api=mod.exports;
(async()=>{
 const raw=JSON.stringify({web:{client_id:'123-test.apps.googleusercontent.com',client_secret:'test-secret-long',redirect_uris:[api.DRIVE_CALLBACK]}});
 assert.throws(()=>api.parseDriveClient('{}'));
 assert.throws(()=>api.parseDriveClient(raw.replace(api.DRIVE_CALLBACK,'https://evil.example/callback')));
 await api.configureDriveClient(raw);
 const first=await api.startDriveConnection();
 assert.equal(authOptions.scope.length,1);assert.equal(authOptions.scope[0],api.DRIVE_SCOPE);assert.equal(authOptions.code_challenge_method,'S256');
 await assert.rejects(()=>api.finishDriveConnection(first.state,'wrong','code'));assert.equal(requests,0);
 await api.finishDriveConnection(first.state,first.state,'code');assert.equal((await api.driveConnection()).active.refreshToken,'test-refresh');
 await assert.rejects(()=>api.finishDriveConnection(first.state,first.state,'code'));assert.equal(requests,1);
 const expired=await api.startDriveConnection();records.get('drive-oauth-'+expired.state).expires=0;
 await assert.rejects(()=>api.finishDriveConnection(expired.state,expired.state,'code'));assert.equal(requests,1);
 folderOK=false;const denied=await api.startDriveConnection();await assert.rejects(()=>api.finishDriveConnection(denied.state,denied.state,'code'));assert.equal((await api.driveConnection()).active.refreshToken,'test-refresh');
 folderOK=true;refresh=false;const noToken=await api.startDriveConnection();await assert.rejects(()=>api.finishDriveConnection(noToken.state,noToken.state,'code'));
 const route=fs.readFileSync('app/api/drive/connect/route.ts','utf8');assert.ok(route.includes("request.headers.get('origin')!==DRIVE_ORIGIN"));assert.ok(route.includes('HttpOnly; Secure; SameSite=Lax'));
 console.log('PASS Drive OAuth: scoped access, PKCE, state binding, expiry, replay rejection, folder verification and old credentials preserved');
})().catch(e=>{console.error(e);process.exitCode=1;});
