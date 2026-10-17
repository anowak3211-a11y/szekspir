import {createHash} from 'node:crypto';
import {mutate,readState} from './store';
import {parseNativeExport,type NativeAd} from './native-ad-model';
const BASE='https://api.trendtrack.io',HOUR=60*60*1000;
type Scope={kind:'shop'|'brandtracker';id:string};
type Snapshot={ads:NativeAd[];name:string;skipped:number;fetched:number};
type Cache={started?:number;result?:Snapshot;error?:string};
const uuid=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
/** Parse identifiers only. Never fetch the pasted URL or forward its query string. */
export function trendtrackScope(value:unknown):Scope{
 if(typeof value!=='string'||value.length>2048)throw Error('Wklej link do sklepu w Trendtracku.');
 let u:URL;try{u=new URL(value.trim());}catch{throw Error('Wklej pełny link HTTPS z Trendtracka.');}
 if(u.protocol!=='https:'||u.hostname!=='app.trendtrack.io'||u.username||u.password||u.port)throw Error('Użyj linku z app.trendtrack.io.');
 const path=u.pathname.split('/').filter(Boolean),last=path.at(-1),parent=path.at(-2);
 if(last==='brandtracker'&&uuid.test(u.searchParams.get('shop')||'')&&u.searchParams.getAll('shop').length===1)return {kind:'shop',id:u.searchParams.get('shop')!.toLowerCase()};
 if(parent==='shops'&&last&&uuid.test(last))return {kind:'shop',id:last.toLowerCase()};
 if(parent==='brandtrackers'&&last&&uuid.test(last))return {kind:'brandtracker',id:last.toLowerCase()};
 throw Error('Otwórz konkretny sklep i skopiuj jego link, np. brandtracker?shop=…');
}
async function key(){return process.env.TRENDTRACK_API_KEY||(await readState<{apiKey?:string}>('trendtrack-connection',{})).value.apiKey;}
export async function trendtrackConnected(){return !!await key();}
async function request(apiKey:string,path:string,body?:unknown){
 let response:Response;try{response=await fetch(BASE+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${apiKey}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(60000)});}catch{throw Error('Trendtrack nie potwierdził odpowiedzi. Nie ponawiamy automatycznie płatnego pobrania.');}
 if(response.status===400){
  const rejected=await response.json().catch(()=>({}));const fields=rejected?.error?.details?.validationErrors;
  const reasons=Array.isArray(fields)?fields.slice(0,5).map((f:{field?:string;expected?:string[]})=>String(f.field||'filter')+': '+(Array.isArray(f.expected)?f.expected.join(', '):'invalid')).join('; '):JSON.stringify(rejected?.error||{code:'invalid_request'}).replaceAll(apiKey,'[redacted]');
  throw Error(`Trendtrack odrzucił ${body?'filtry reklam':'identyfikator sklepu'}: ${reasons.slice(0,1000)}`);
 }
 if(!response.ok)throw Error(response.status===401||response.status===403?'Trendtrack odrzucił klucz API. Sprawdź dostęp do workspace.':response.status===402?'Brak kredytów API Trendtracka.':response.status===429?'Trendtrack ograniczył liczbę zapytań. Spróbuj później.':`Trendtrack zwrócił błąd HTTP ${response.status}.`);
 const text=await response.text();if(text.length>12000000)throw Error('Odpowiedź Trendtracka jest zbyt duża.');
 try{return JSON.parse(text);}catch{throw Error('Trendtrack zwrócił nieprawidłową odpowiedź.');}
}
export async function connectTrendtrack(value:unknown){
 if(typeof value!=='string'||!/^[-A-Za-z0-9_]{20,300}$/.test(value.trim()))throw Error('Wklej poprawny klucz API Trendtracka.');
 const apiKey=value.trim();await request(apiKey,'/v1/me');
 await mutate<{apiKey?:string},void>('trendtrack-connection',{},s=>{s.apiKey=apiKey;});return {connected:true};
}
export function selectTrendtrackAds(rows:unknown[]):Pick<Snapshot,'ads'|'skipped'> {
 const ids=new Set<string>(),collations=new Set<string>(),selected:unknown[]=[];let skipped=0;
 for(const raw of rows){const r=raw as {id?:string;collationId?:string;content?:{body?:string};media?:{type?:string}};
  if(!r||r.media?.type!=='image'||!r.content?.body?.trim()||ids.has(r.id||'')||(r.collationId&&collations.has(r.collationId))){skipped++;continue;}
  ids.add(r.id||'');if(r.collationId)collations.add(r.collationId);selected.push(raw);
 }
 return {ads:selected.length?parseNativeExport(selected).slice(0,60):[],skipped};
}
export async function fetchTrendtrackTop(value:unknown){
 const scope=trendtrackScope(value),apiKey=await key();if(!apiKey)throw Error('Najpierw połącz klucz API Trendtracka.');
 const name='trendtrack-top-v4-'+createHash('sha256').update(apiKey+'\0'+scope.kind+'\0'+scope.id).digest('hex');
 const previous=(await readState<Cache>(name,{})).value;
 if(previous.result&&Date.now()-(previous.started||0)<HOUR)return {...previous.result,cached:true};
 await mutate<Cache,void>(name,{},s=>{if(s.started&&Date.now()-s.started<HOUR)throw Error(s.error||'Pobranie już trwa. Nie uruchamiamy drugiego zapytania.');s.started=Date.now();delete s.result;delete s.error;});
 try{
  const detail=await request(apiKey,`/v1/${scope.kind==='shop'?'shops':'brandtrackers'}/${scope.id}`),source=detail.data;
  let pages:string[];
  if(scope.kind==='shop'){
   const linked=source?.advertising?.linkedAdvertisers;
   if(!Array.isArray(linked)||source.advertising.linkedAdvertisersCount>linked.length)throw Error('Trendtrack nie zwrócił pełnej listy reklamodawców tego sklepu.');
   const candidates=linked.filter((p:{platform?:string})=>!p.platform||p.platform==='facebook'),primary=candidates.filter((p:{isPrimary?:boolean})=>p.isPrimary===true);
   const selected=primary.length===1?primary:candidates;if(selected.length!==1)throw Error('Sklep ma kilka profili reklamowych bez wskazanego głównego. Wybierz główny profil w Trendtracku.');
   pages=selected.map((p:{facebookPageId?:string;id?:string})=>String(p.facebookPageId||p.id||''));
  }else pages=[String(source?.facebookPageId||'')];
  pages=[...new Set(pages)];if(!pages.length||pages.length>100||pages.some(p=>!/^\d{5,30}$/.test(p)))throw Error('Nie znaleziono stron Facebooka powiązanych ze sklepem.');
  // The maintained global ads-search rejects trackedPages. The advertiser route keeps exact page scope.
  const result=await request(apiKey,`/v1/advertisers/${pages[0]}/ads?limit=60&offset=0&status=all&mediaType=image&sortBy=reach`);
  if(!Array.isArray(result.data)||result.data.length>60)throw Error('Trendtrack zwrócił nieprawidłową liczbę reklam.');
  const chosen=selectTrendtrackAds(result.data),snapshot={...chosen,name:String(source.name||source.domain||'Trendtrack').slice(0,300),fetched:result.data.length};
  await mutate<Cache,void>(name,{},s=>{s.result=snapshot;});return {...snapshot,cached:false};
 }catch(e){const message=(e as Error).message;await mutate<Cache,void>(name,{},s=>{s.error=message+' Wynik sprawdzamy ponownie najwcześniej za godzinę.';});throw e;}
}
