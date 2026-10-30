import {createHash} from 'node:crypto';
import {inOwnerWorkspace} from './account-context';
import {graph,MetaError,rememberCreatedAdSet,metaToken,metaProof,META_VERSION} from './meta-client';
import {MetaBudgetWait} from './meta-rate-limit';
import {numericId} from './meta-uploader-model';
import {mutate,readState} from './store';
async function resolveMetaAuth():Promise<{token:string;proof?:string}>{
 try{const token=await metaToken();return {token,proof:await metaProof(token)};}
 catch{
  try{const token=await inOwnerWorkspace(()=>metaToken());return {token,proof:await inOwnerWorkspace(()=>metaProof(token))};}
  catch{
   try{
    const {accountRegistry}=await import('./account-repository');
    const {inWorkspace}=await import('./account-context');
    const reg=await accountRegistry();
    for(const u of Object.values(reg.users||{})){
     try{const token=await inWorkspace(u,()=>metaToken()),proof=await inWorkspace(u,()=>metaProof(token));return {token,proof};}catch{}
    }
   }catch{}
   throw Error('Connect Meta in the uploader settings.');
  }
 }
}
async function directGraph<T=Record<string,unknown>>(path:string,params:Record<string,unknown>={},method:'GET'|'POST'='GET'):Promise<T>{
 const {token,proof}=await resolveMetaAuth();
 const url=new URL(`https://graph.facebook.com/${META_VERSION}/${path}`),body=new URLSearchParams();
 for(const [k,v] of Object.entries(params))if(v!==undefined)body.set(k,typeof v==='string'?v:JSON.stringify(v));
 if(proof)body.set('appsecret_proof',proof);
 if(method==='GET')url.search=body.toString();
 const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,...(method==='POST'?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body:method==='POST'?body:undefined,cache:'no-store',signal:AbortSignal.timeout(45000)});
 const data=await r.json() as Record<string,unknown>;
 if(!r.ok||data.error){
  const e=data.error as {code?:number;error_subcode?:number;message?:string;error_user_msg?:string}|undefined;
  const buc=r.headers.get('x-business-use-case-usage')||r.headers.get('x-ad-account-usage')||'';
  throw Error(`Meta (${e?.code||r.status}/${e?.error_subcode||0}): ${e?.error_user_msg||e?.message||'Request failed'}${buc?` | usage=${buc}`:''}`);
 }
 return data as T;
}
function canonical(value:unknown):string{if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';return JSON.stringify(value);}
type Input={accountId:string;campaignId:string;templateId:string;name:string;minimumDaily?:number;costCap?:number};
type Intent={fingerprint?:string;state?:'pending'|'failed'|'uncertain'|'created';id?:string;expected?:Record<string,unknown>};
export async function createUploaderAdSet(raw:unknown){
 const a=raw as Record<string,unknown>;if(!a||typeof a!=='object')throw Error('Invalid ad set.');
 const input:Input={accountId:numericId(String(a.accountId||'').replace(/^act_/,''),'account'),campaignId:numericId(a.campaignId,'campaign'),templateId:numericId(a.templateId,'base ad set'),name:typeof a.name==='string'?a.name.trim():''};
 if(!input.name||input.name.length>240)throw Error('Enter an ad set name (up to 240 characters).');
 if(a.minimumDaily!==undefined&&a.minimumDaily!==''){const n=Number(a.minimumDaily);if(!Number.isFinite(n)||n<=0||n>1000000||Math.abs(n*100-Math.round(n*100))>0.00001)throw Error('Enter a valid daily minimum with up to two decimal places.');input.minimumDaily=n;}
 if(a.costCap!==undefined&&a.costCap!==''){const n=Number(a.costCap);if(!Number.isFinite(n)||n<=0||n>100000||Math.abs(n*100-Math.round(n*100))>0.00001)throw Error('Enter a valid Cost Per Result goal (Cost Cap) with up to two decimal places.');input.costCap=n;}
 const key='meta-create-adset-'+createHash('sha256').update(JSON.stringify([input.accountId,input.campaignId,input.name])).digest('hex'),fingerprint=JSON.stringify(input),prior=(await readState<Intent>(key,{})).value;
 let expected=prior.expected;
 const verify=async(id:string)=>{const set=await graph<Record<string,unknown>>(id,{fields:'id,name,status,account_id,campaign_id,optimization_goal,billing_event,targeting,promoted_object,daily_min_spend_target,bid_strategy,bid_amount'});if(set.account_id!==input.accountId||set.campaign_id!==input.campaignId||set.name!==input.name||set.status!=='PAUSED')throw Error('Created ad set settings did not match. Check it in Meta; no replacement was created.');if(expected){if(canonical(set.targeting)!==canonical(expected.targeting))throw Error('Created ad set audience or placements differ. Check Meta before retrying.');for(const field of ['optimization_goal','billing_event'])if(set[field]!==expected[field])throw Error('Created ad set delivery settings differ. Check Meta before retrying.');const actual=set.promoted_object as Record<string,unknown>|undefined,wanted=expected.promoted_object as Record<string,unknown>|undefined;for(const field of ['pixel_id','custom_event_type'])if(wanted?.[field]!==undefined&&actual?.[field]!==wanted[field])throw Error('Created ad set conversion settings differ.');if(expected.daily_min_spend_target!==undefined&&Number(set.daily_min_spend_target)!==expected.daily_min_spend_target)throw Error('Created ad set minimum spending was not confirmed.');}
 await rememberCreatedAdSet(input.accountId,input.campaignId,set);return set;};
 if(prior.fingerprint&&prior.fingerprint!==fingerprint)throw Error('This ad set name already has a different saved creation request. Check Meta first.');
 if(prior.id)return verify(prior.id);
 if(prior.state==='pending'||prior.state==='uncertain')throw Error('Previous creation is not confirmed. Check Meta before creating another ad set with this name.');
 const source=await graph<Record<string,unknown>>(input.templateId,{fields:'id,account_id,campaign_id,targeting,optimization_goal,billing_event,promoted_object,attribution_spec,bid_strategy,bid_amount,destination_type,regional_regulated_categories,regional_regulation_identities,daily_budget,lifetime_budget'});
 if(source.account_id!==input.accountId||source.campaign_id!==input.campaignId)throw Error('Base ad set must belong to the selected account and campaign.');
 const campaign=await graph<Record<string,unknown>>(input.campaignId,{fields:'id,account_id,daily_budget,lifetime_budget,objective'});
 if(campaign.account_id!==input.accountId)throw Error('Campaign belongs to another account.');
 const cbo=Number(campaign.daily_budget)>0||Number(campaign.lifetime_budget)>0,payload:Record<string,unknown>={name:input.name,campaign_id:input.campaignId,status:'PAUSED',start_time:new Date().toISOString()};
 for(const field of ['targeting','optimization_goal','billing_event','promoted_object','attribution_spec','bid_strategy','bid_amount','regional_regulated_categories','regional_regulation_identities'])if(source[field]!==undefined&&source[field]!==null)payload[field]=source[field];
 if(input.costCap!==undefined){payload.bid_strategy='COST_CAP';payload.bid_amount=Math.round(input.costCap*100);}
 if(source.destination_type&&source.destination_type!=='UNDEFINED')payload.destination_type=source.destination_type;
 if(!source.targeting||!source.optimization_goal||!source.billing_event)throw Error('Base ad set is missing targeting or delivery settings.');
 if(campaign.objective==='OUTCOME_SALES'&&!(source.promoted_object as {pixel_id?:string})?.pixel_id)throw Error('Choose a base Sales ad set with a confirmed conversion pixel.');
 if(!cbo){if(Number(source.daily_budget)>0)payload.daily_budget=source.daily_budget;else if(Number(source.lifetime_budget)>0)throw Error('Choose a base ad set with a daily budget; lifetime schedules require Meta setup.');else throw Error('Base ad set has no confirmed daily budget.');}
 if(input.minimumDaily!==undefined){if(!Number(campaign.daily_budget))throw Error('Daily minimum requires a campaign daily budget. Leave it blank for ad-set budgets.');if(input.minimumDaily*100>Number(campaign.daily_budget))throw Error('Daily minimum cannot exceed the campaign daily budget.');payload.daily_min_spend_target=Math.round(input.minimumDaily*100);}
 expected=payload;
 await mutate<Intent,void>(key,{},s=>{if(s.id||s.state==='pending'||s.state==='uncertain'||s.fingerprint&&s.fingerprint!==fingerprint)throw Error('This creation request already exists. Check its result; no duplicate was sent.');Object.assign(s,{fingerprint,state:'pending',expected:payload});});
 let id:string|undefined;
 try{const result=await graph<{id:string}>(`act_${input.accountId}/adsets`,payload,'POST');id=numericId(result.id,'created ad set');await mutate<Intent,void>(key,{},s=>{s.id=id;s.state='created';});return await verify(id);}
 catch(e){if(!id)await mutate<Intent,void>(key,{},s=>{s.state=e instanceof MetaBudgetWait||e instanceof MetaError&&!e.uncertain?'failed':'uncertain';});throw e;}
}

export interface AntkiAdSetGroup {
 code: string;
 label: string;
 shortRange: string;
 description: string;
 angleIds: string[];
 adSetId?: string;
 adSetName?: string;
 bidAmountMinor?: number;
 status?: string;
}

export interface AntkiCampaignStructure {
 accountId: string;
 accountName: string;
 campaignId: string;
 campaignName: string;
 costCapPln: number;
 bidAmountMinor: number;
 dailyBudgetPln: number;
 budgetMode: 'CBO' | 'ABO';
 sourceCampaignId: string;
 sourceCampaignName: string;
 sourceAdSetId: string;
 sourceAdSetName: string;
 pixelId?: string;
 createdAt: number;
 groups: AntkiAdSetGroup[];
}

export const ANTKI_PL_ADSET_BLUEPRINTS: Omit<AntkiAdSetGroup, 'adSetId' | 'adSetName' | 'bidAmountMinor' | 'status'>[] = [
 {
  code: 'DOM',
  label: 'DOM',
  shortRange: '1-5',
  description: '1 buty · 2 noc · 3 kafelki · 4 zdjecie · 5 spodnie',
  angleIds: [
   'pl-01-zdarte-zimowe-buty',
   'pl-02-mit-bolow-wzrostowych',
   'pl-03-test-mokrej-stopy',
   'pl-04-zdjecie-z-wycieczki',
   'pl-05-potykanie-sie-o-wlasne-nogi',
  ],
 },
 {
  code: 'RUCH',
  label: 'RUCH',
  shortRange: '6-10',
  description: '6 plecak · 7 szyja · 8 boisko · 9 schody · 10 spodniczka',
  angleIds: [
   'pl-06-plecy-i-ciezki-plecak',
   'pl-07-bol-glowy-i-karku',
   'pl-08-biodro-po-pilce',
   'pl-09-kolano-na-schodach',
   'pl-10-krzywa-spodniczka-apel',
  ],
 },
 {
  code: 'GRUPA',
  label: 'GRUPA',
  shortRange: '11-15',
  description: '11 telefon · 12 druzyna · 13 gory · 14 kurtki · 15 kartka',
  angleIds: [
   'pl-11-telefon-od-wuefistki',
   'pl-12-wybierany-ostatni-do-druzyny',
   'pl-13-odmowa-obozu-zimowego',
   'pl-14-wstyd-w-szatni-buty',
   'pl-15-zwolnienie-z-wf-u-jesien',
  ],
 },
 {
  code: 'MIT',
  label: 'MIT',
  shortRange: '16-20',
  description: '16 dywan · 17 podloga · 18 szuflada · 19 sala · 20 czas',
  angleIds: [
   'pl-16-wojna-o-dywan-19-30',
   'pl-17-worek-ze-szkolnymi-kapciami',
   'pl-18-mit-gipsu-sztywne-wkladki',
   'pl-19-gimnastyka-korekcyjna-fikcja',
   'pl-20-okno-czasowe-12-lat',
  ],
 },
 {
  code: 'RYCIAK',
  label: 'RYCIAK',
  shortRange: '21-25',
  description: '21 ramie · 22 wieczor · 23 postawa · 24 wizyta · 25 kamera',
  angleIds: [
   'pl-21-ryciak-rip3-ramie-v2',
   'pl-22-ryciak-rip3-sor-kolano',
   'pl-23-ryciak-rip3-biodro-i-plecy',
   'pl-24-ryciak-rip3-bilans-10-latka',
   'pl-25-ryciak-rip3-ojciec-wideo',
  ],
 },
 {
  code: 'ZAL',
  label: 'ŻAL',
  shortRange: '26-30',
  description: '26 lewa · 27 siostra · 28 starsza · 29 prysznic · 30 pieta',
  angleIds: [
   'pl-26-zal-po-operacji-za-pozno',
   'pl-27-zal-haluks-wrocil-po-2-latach',
   'pl-28-zal-operacja-kolan-nastolatki',
   'pl-29-zal-wozek-inwalidzki-beata',
   'pl-30-zal-zastrzyki-sterydowe-pieta',
  ],
 },
 {
  code: 'ZIMA',
  label: 'ZIMA',
  shortRange: '31-35',
  description: '31 botki · 32 budzik · 33 kuchnia · 34 park · 35 galeria',
  angleIds: [
   'pl-31-dorosli-zimowe-botki',
   'pl-32-dorosli-pierwszy-krok-rano',
   'pl-33-dorosli-praca-stojaca-8h',
   'pl-34-dorosli-moja-62-letnia-mama',
   'pl-35-dorosli-buty-o-rozmiar-wieksze',
  ],
 },
];

export const ANTKI_DOROSLI_ADSET_BLUEPRINTS: Omit<AntkiAdSetGroup, 'adSetId' | 'adSetName' | 'bidAmountMinor' | 'status'>[] = [
 {
  code: 'D1_SOR',
  label: 'D1 SOR',
  shortRange: '36-40 (D01-D05)',
  description: 'D01 kolano · D02 lędźwie · D03 biodro · D04 wesele · D05 kostka',
  angleIds: [
   'dorosli-01-sor-zablokowane-kolano',
   'dorosli-02-sor-rwa-kulszowa-kregoslup',
   'dorosli-03-sor-biodro-blokada-schody',
   'dorosli-04-sor-piekacy-nerwiak-przodostopie',
   'dorosli-05-sor-skrecona-kostka-niestabilnosc',
  ],
 },
 {
  code: 'D2_MAMA',
  label: 'D2 MAMA',
  shortRange: '41-45 (D06-D10)',
  description: 'D06 miska · D07 szafka · D08 ławka · D09 działka · D10 urodziny',
  angleIds: [
   'dorosli-06-m-jakuba-miska-z-woda',
   'dorosli-07-m-jakuba-szuflada-lekow',
   'dorosli-08-m-jakuba-spacer-lawka',
   'dorosli-09-m-jakuba-ojciec-dzialka',
   'dorosli-10-m-jakuba-wesele-buty-w-reku',
  ],
 },
 {
  code: 'D3_RYCIAK',
  label: 'D3 RYCIAK',
  shortRange: '46-50 (D11-D15)',
  description: 'D11 bark · D12 dyskopatia · D13 kwas · D14 asymetria · D15 bieżnia',
  angleIds: [
   'dorosli-11-ryciak-dorosli-bark-i-kark',
   'dorosli-12-ryciak-dorosli-ledzwie-dyskopatia',
   'dorosli-13-ryciak-dorosli-kolano-zwyrodnienie',
   'dorosli-14-ryciak-dorosli-biodro-asymetria',
   'dorosli-15-ryciak-dorosli-slow-mo-bieznia',
  ],
 },
 {
  code: 'D4_OSTROGA',
  label: 'D4 OSTROGA',
  shortRange: '51-55 (D16-D20)',
  description: 'D16 6:00 rano · D17 fala · D18 butelka · D19 podpiętki · D20 biurko',
  angleIds: [
   'dorosli-16-ostroga-pierwszy-krok-6-rano',
   'dorosli-17-ostroga-fala-uderzeniowa-1500zl',
   'dorosli-18-ostroga-zamrozona-butelka',
   'dorosli-19-ostroga-zelowe-podpietki-mit',
   'dorosli-20-ostroga-strach-po-postoju',
  ],
 },
 {
  code: 'D5_HALUKS',
  label: 'D5 HALUKS',
  shortRange: '56-60 (D21-D25)',
  description: 'D21 botki · D22 rozmiar 40 · D23 kliny · D24 obcasy · D25 prysznic',
  angleIds: [
   'dorosli-21-haluks-zimowe-botki-zamek',
   'dorosli-22-haluks-wstyd-rozmiar-40',
   'dorosli-23-haluks-separatory-i-szyny-mit',
   'dorosli-24-haluks-zdarte-buty-od-srodka',
   'dorosli-25-haluks-mokry-slad-w-lazience',
  ],
 },
 {
  code: 'D6_ZAL',
  label: 'D6 ŻAL',
  shortRange: '61-65 (D26-D30)',
  description: 'D26 śruby · D27 siostra · D28 uchwyt · D29 za 5 lat · D30 artroskopia',
  angleIds: [
   'dorosli-26-zal-lewa-stopa-sruby-8200zl',
   'dorosli-27-zal-haluks-siostry-wrocil',
   'dorosli-28-zal-uchwyt-pod-prysznicem-52-lata',
   'dorosli-29-zal-za-5-lat-endoproteza',
   'dorosli-30-zal-artroskopia-kolana-powrot-bolu',
  ],
 },
 {
  code: 'D7_PRACA',
  label: 'D7 PRACA',
  shortRange: '66-70 (D31-D35)',
  description: 'D31 kuchnia 8h · D32 420 zł · D33 dyżur 12h · D34 4 kroki · D35 powrót 14h',
  angleIds: [
   'dorosli-31-praca-8h-na-nogach-kuchnia',
   'dorosli-32-praca-mit-twardych-wkladek-400zl',
   'dorosli-33-praca-12h-dyzur-szpitalny-beton',
   'dorosli-34-praca-mechanizm-4-kroki',
   'dorosli-35-powrot-dorosli-14h-w-domu-i-pracy',
  ],
 },
];

const ANTKI_CAMPAIGN_STATE_KEY = 'antki-pl-campaign-structure-v3';
const ANTKI_DOROSLI_CAMPAIGN_STATE_KEY = 'antki-dorosli-campaign-structure-v1';

export async function readAntkiCostCapCampaign(batch: 'dzieci' | 'dorosli' = 'dzieci'): Promise<AntkiCampaignStructure | null> {
 const stateKey = batch === 'dorosli' ? ANTKI_DOROSLI_CAMPAIGN_STATE_KEY : ANTKI_CAMPAIGN_STATE_KEY;
 try {
  const { value } = await inOwnerWorkspace(() => readState<{ structure?: AntkiCampaignStructure }>(stateKey, {}));
  if (!value?.structure) return null;
  return value.structure;
 } catch {
  return null;
 }
}

export async function updateAntkiCampaignCostCap(raw: unknown = {}) {
 const a = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
 const costCapPln = Number(a.costCapPln ?? 40);
 if (!Number.isFinite(costCapPln) || costCapPln < 5 || costCapPln > 500) {
  throw Error('Podaj prawidłowy Cost Per Result Goal (np. 40 PLN).');
 }
 const includeAllAccountCampaigns = Boolean(a.includeAllAccountCampaigns ?? true);
 const bidAmountMinor = Math.round(costCapPln * 100);
 const updatedAdSets: {
  campaignId?: string;
  campaignName?: string;
  batch: string;
  group: string;
  adSetId: string;
  status?: string;
  previousBidMinor?: number;
  bidAmountMinor: number;
  alreadyAtTarget?: boolean;
  ok: boolean;
  error?: string;
 }[] = [];

 const [dzieciRaw, dorosliRaw] = await Promise.all([
  inOwnerWorkspace(() => readState<{ structure?: AntkiCampaignStructure }>(ANTKI_CAMPAIGN_STATE_KEY, {})).catch(() => ({ value: {} as { structure?: AntkiCampaignStructure } })),
  inOwnerWorkspace(() => readState<{ structure?: AntkiCampaignStructure }>(ANTKI_DOROSLI_CAMPAIGN_STATE_KEY, {})).catch(() => ({ value: {} as { structure?: AntkiCampaignStructure } })),
 ]);
 const dzieciStruct = dzieciRaw.value?.structure || null;
 const dorosliStruct = dorosliRaw.value?.structure || null;

 const targetCampaignIds = [
  '120249912191200300', // ANTKI CC35
  '120249967753030300', // ANTKI DOROSLI CC30
  ...(includeAllAccountCampaigns
   ? [
      '120232748591040300', // 25.08.2025 | 1
      '120248537099510300', // 26.07 | 2
      '120237830616080300', // HB_24.11
     ]
   : []),
 ];

 const seenAdSetIds = new Set<string>();
 const adSetsToProcess: Array<{
  adSetId: string;
  name: string;
  campaignId: string;
  campaignName: string;
  status: string;
  currentBid: number;
  bidStrategy: string;
 }> = [];

 const campResults = await Promise.all(
  targetCampaignIds.map(async cid => {
   try {
    const res = await directGraph<{ data?: Array<Record<string, unknown>> }>(
     `${cid}/adsets`,
     {
      fields: 'id,name,status,effective_status,bid_amount,bid_strategy,campaign_id,campaign{name,status}',
      limit: 300,
     },
     'GET',
    );
    return { cid, list: res.data || [] };
   } catch {
    return { cid, list: [] as Array<Record<string, unknown>> };
   }
  }),
 );

 for (const { cid, list } of campResults) {
  for (const item of list) {
   const id = String(item.id || '');
   if (!id || seenAdSetIds.has(id)) continue;
   const status = String(item.status || '');
   if (status === 'DELETED' || status === 'ARCHIVED') continue;
   seenAdSetIds.add(id);
   const campObj = (item.campaign || {}) as { name?: string };
   adSetsToProcess.push({
    adSetId: id,
    name: String(item.name || id),
    campaignId: String(item.campaign_id || cid),
    campaignName: String(campObj.name || cid),
    status,
    currentBid: Number(item.bid_amount || 0),
    bidStrategy: String(item.bid_strategy || ''),
   });
  }
 }

 if (includeAllAccountCampaigns) {
  try {
   const accSetsRes = await directGraph<{ data?: Array<Record<string, unknown>> }>(
    'act_1109284831182252/adsets',
    {
     fields: 'id,name,status,effective_status,bid_amount,bid_strategy,campaign_id,campaign{name,status}',
     limit: 500,
    },
    'GET',
   );
   for (const item of accSetsRes.data || []) {
    const id = String(item.id || '');
    if (!id || seenAdSetIds.has(id)) continue;
    const status = String(item.status || '');
    if (status === 'DELETED' || status === 'ARCHIVED') continue;
    const currentBid = Number(item.bid_amount || 0);
    const bidStrategy = String(item.bid_strategy || '');
    if (bidStrategy !== 'COST_CAP' && currentBid <= 0) continue;
    seenAdSetIds.add(id);
    const campObj = (item.campaign || {}) as { name?: string };
    adSetsToProcess.push({
     adSetId: id,
     name: String(item.name || id),
     campaignId: String(item.campaign_id || ''),
     campaignName: String(campObj.name || ''),
     status,
     currentBid,
     bidStrategy,
    });
   }
  } catch {}
 }

 // Sort ACTIVE ad sets first so active delivery is updated first
 adSetsToProcess.sort((x, y) => {
  const xAct = x.status === 'ACTIVE' ? 0 : 1;
  const yAct = y.status === 'ACTIVE' ? 0 : 1;
  return xAct - yAct;
 });

 const toMutate: typeof adSetsToProcess = [];
 for (const item of adSetsToProcess) {
  if (item.currentBid === bidAmountMinor) {
   updatedAdSets.push({
    campaignId: item.campaignId,
    campaignName: item.campaignName,
    batch: item.campaignName,
    group: item.name,
    adSetId: item.adSetId,
    status: item.status,
    previousBidMinor: item.currentBid,
    bidAmountMinor,
    alreadyAtTarget: true,
    ok: true,
   });
  } else {
   toMutate.push(item);
  }
 }

 const BATCH_SIZE = 20;
 for (let i = 0; i < toMutate.length; i += BATCH_SIZE) {
  const chunk = toMutate.slice(i, i + BATCH_SIZE);
  await Promise.all(
   chunk.map(async item => {
    try {
     await directGraph(item.adSetId, { bid_amount: bidAmountMinor }, 'POST');
     updatedAdSets.push({
      campaignId: item.campaignId,
      campaignName: item.campaignName,
      batch: item.campaignName,
      group: item.name,
      adSetId: item.adSetId,
      status: item.status,
      previousBidMinor: item.currentBid,
      bidAmountMinor,
      alreadyAtTarget: false,
      ok: true,
     });
    } catch (e) {
     updatedAdSets.push({
      campaignId: item.campaignId,
      campaignName: item.campaignName,
      batch: item.campaignName,
      group: item.name,
      adSetId: item.adSetId,
      status: item.status,
      previousBidMinor: item.currentBid,
      bidAmountMinor,
      alreadyAtTarget: false,
      ok: false,
      error: e instanceof Error ? e.message : 'Failed',
     });
    }
   }),
  );
 }

 await Promise.all([
  inOwnerWorkspace(() =>
   mutate<{ structure?: AntkiCampaignStructure }, void>(ANTKI_CAMPAIGN_STATE_KEY, {}, s => {
    if (s.structure) {
     s.structure.costCapPln = costCapPln;
     s.structure.bidAmountMinor = bidAmountMinor;
     s.structure.groups = (s.structure.groups || []).map(g => ({ ...g, bidAmountMinor }));
    }
   }),
  ).catch(() => {}),
  inOwnerWorkspace(() =>
   mutate<{ structure?: AntkiCampaignStructure }, void>(ANTKI_DOROSLI_CAMPAIGN_STATE_KEY, {}, s => {
    if (s.structure) {
     s.structure.costCapPln = costCapPln;
     s.structure.bidAmountMinor = bidAmountMinor;
     s.structure.groups = (s.structure.groups || []).map(g => ({ ...g, bidAmountMinor }));
    }
   }),
  ).catch(() => {}),
 ]);

 const byCampaign: Record<string, { campaignName: string; total: number; updated: number; alreadyAt40: number; failed: number }> = {};
 for (const u of updatedAdSets) {
  const key = u.campaignId || u.batch;
  if (!byCampaign[key]) {
   byCampaign[key] = { campaignName: u.campaignName || u.batch, total: 0, updated: 0, alreadyAt40: 0, failed: 0 };
  }
  byCampaign[key].total++;
  if (u.ok) {
   if (u.alreadyAtTarget) byCampaign[key].alreadyAt40++;
   else byCampaign[key].updated++;
  } else {
   byCampaign[key].failed++;
  }
 }

 return {
  ok: true,
  costCapPln,
  bidAmountMinor,
  totalProcessed: updatedAdSets.length,
  updatedCount: updatedAdSets.filter(x => x.ok && !x.alreadyAtTarget).length,
  alreadyAtTargetCount: updatedAdSets.filter(x => x.ok && x.alreadyAtTarget).length,
  failedCount: updatedAdSets.filter(x => !x.ok).length,
  byCampaign,
  updatedAdSets,
 };
}

export async function createAntkiCostCapCampaign(raw: unknown = {}): Promise<AntkiCampaignStructure> {
 const a = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
 const batch: 'dzieci' | 'dorosli' = a.batch === 'dorosli' ? 'dorosli' : 'dzieci';
 const blueprints = batch === 'dorosli' ? ANTKI_DOROSLI_ADSET_BLUEPRINTS : ANTKI_PL_ADSET_BLUEPRINTS;
 const stateKey = batch === 'dorosli' ? ANTKI_DOROSLI_CAMPAIGN_STATE_KEY : ANTKI_CAMPAIGN_STATE_KEY;
 const accountId = numericId(String(a.accountId || '1109284831182252').replace(/^act_/, ''), 'account');
 const costCapPln = Number(a.costCapPln ?? 30);
 if (!Number.isFinite(costCapPln) || costCapPln < 5 || costCapPln > 500) {
  throw Error('Podaj prawidłowy Cost Per Result Goal (np. 30 PLN).');
 }
 const dailyBudgetPln = Number(a.dailyBudgetPln ?? 1500);
 if (!Number.isFinite(dailyBudgetPln) || dailyBudgetPln < 50 || dailyBudgetPln > 100000) {
  throw Error('Podaj prawidłowy budżet dzienny kampanii (np. 1500 PLN).');
 }
 const bidAmountMinor = Math.round(costCapPln * 100);
 const dailyBudgetMinor = Math.round(dailyBudgetPln * 100);
 const campaignName =
  typeof a.campaignName === 'string' && a.campaignName.trim()
   ? a.campaignName.trim()
   : batch === 'dorosli'
   ? `ANTKI DOROSLI CC${costCapPln}`
   : `ANTKI CC${costCapPln}`;

 const forceNew = !!a.forceNew;
 if (!forceNew) {
  const existing = await readAntkiCostCapCampaign(batch);
  if (existing && existing.accountId === accountId && existing.groups.every(g => g.adSetId)) {
   return existing;
  }
 }

 // 1. Find best source campaign & Website Purchase ad set on UMOWA ALLCAN PROJECTS SP ZOO ORTHOMAX (1109284831182252)
 const campaignsRes = await directGraph<{ data?: Record<string, unknown>[] }>(
  `act_${accountId}/campaigns`,
  { fields: 'id,name,status,objective,daily_budget,lifetime_budget,special_ad_categories', limit: 100 },
  'GET',
 );
 const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : [];
 if (!campaigns.length) throw Error(`Brak kampanii na koncie act_${accountId}.`);

 const priorityNames = ['25.08.2025 | 1', '26.07 | 2', 'HB_24.11'];
 const sortedCampaigns = [...campaigns].sort((x, y) => {
  const xName = String(x.name || '');
  const yName = String(y.name || '');
  const xPrio = priorityNames.findIndex(p => xName.includes(p));
  const yPrio = priorityNames.findIndex(p => yName.includes(p));
  if (xPrio !== -1 || yPrio !== -1) return (xPrio === -1 ? 99 : xPrio) - (yPrio === -1 ? 99 : yPrio);
  const xActive = x.status === 'ACTIVE' ? 0 : 1;
  const yActive = y.status === 'ACTIVE' ? 0 : 1;
  return xActive - yActive;
 });

 let sourceCampaign: Record<string, unknown> | null = null;
 let sourceAdSet: Record<string, unknown> | null = null;

 for (const camp of sortedCampaigns.slice(0, 12)) {
  const cid = String(camp.id || '');
  if (!cid) continue;
  try {
   const setsRes = await directGraph<{ data?: Record<string, unknown>[] }>(
    `${cid}/adsets`,
    {
     fields:
      'id,name,status,account_id,campaign_id,targeting,optimization_goal,billing_event,promoted_object,attribution_spec,bid_strategy,bid_amount,destination_type,regional_regulated_categories,regional_regulation_identities,daily_budget,lifetime_budget',
     limit: 50,
    },
    'GET',
   );
   const list = Array.isArray(setsRes.data) ? setsRes.data : [];
   const match = list.find(s => {
    const po = s.promoted_object as { pixel_id?: string } | undefined;
    return !!po?.pixel_id && !!s.targeting && !!s.optimization_goal && !!s.billing_event;
   });
   if (match) {
    sourceCampaign = camp;
    sourceAdSet = match;
    break;
   }
  } catch {
   // try next campaign
  }
 }

 if (!sourceCampaign || !sourceAdSet) {
  throw Error(`Nie znaleziono bazowego zestawu reklam z pikselem konwersji na koncie act_${accountId}.`);
 }

 // Also check if dsa_beneficiary / dsa_payor exist on sourceAdSet
 try {
  const dsa = await directGraph<Record<string, unknown>>(
   String(sourceAdSet.id),
   { fields: 'dsa_beneficiary,dsa_payor' },
   'GET',
  );
  if (dsa.dsa_beneficiary) sourceAdSet.dsa_beneficiary = dsa.dsa_beneficiary;
  if (dsa.dsa_payor) sourceAdSet.dsa_payor = dsa.dsa_payor;
 } catch {
  // optional fields
 }

 // 2. Create the new Campaign (CBO with COST_CAP, fallback to CBO + adset bid_strategy or ABO if needed)
 let createdCampaignId = '';
 let budgetMode: 'CBO' | 'ABO' = 'CBO';
 const specialAdCategories = Array.isArray(sourceCampaign.special_ad_categories)
  ? sourceCampaign.special_ad_categories
  : [];

 try {
  const campRes = await directGraph<{ id: string }>(
   `act_${accountId}/campaigns`,
   {
    name: campaignName,
    objective: String(sourceCampaign.objective || 'OUTCOME_SALES'),
    status: 'PAUSED',
    special_ad_categories: specialAdCategories,
    daily_budget: dailyBudgetMinor,
    bid_strategy: 'COST_CAP',
   },
   'POST',
  );
  createdCampaignId = numericId(campRes.id, 'created campaign');
 } catch {
  const campRes = await directGraph<{ id: string }>(
   `act_${accountId}/campaigns`,
   {
    name: campaignName,
    objective: String(sourceCampaign.objective || 'OUTCOME_SALES'),
    status: 'PAUSED',
    special_ad_categories: specialAdCategories,
    is_adset_budget_sharing_enabled: false,
   },
   'POST',
  );
  createdCampaignId = numericId(campRes.id, 'created campaign');
  budgetMode = 'ABO';
 }

 // 3. Create the 7 Thematic Cost Cap Ad Sets
 const createdGroups: AntkiAdSetGroup[] = [];
 const perAdSetBudgetMinor = Math.max(5000, Math.round(dailyBudgetMinor / blueprints.length));

 for (const bp of blueprints) {
  const adSetName = bp.label;
  const basePayload: Record<string, unknown> = {
   name: adSetName,
   campaign_id: createdCampaignId,
   status: 'PAUSED',
   start_time: new Date().toISOString(),
   bid_amount: bidAmountMinor,
  };
  for (const field of [
   'targeting',
   'optimization_goal',
   'billing_event',
   'promoted_object',
   'attribution_spec',
   'regional_regulated_categories',
   'regional_regulation_identities',
   'dsa_beneficiary',
   'dsa_payor',
  ]) {
   if (sourceAdSet[field] !== undefined && sourceAdSet[field] !== null) {
    basePayload[field] = sourceAdSet[field];
   }
  }
  if (sourceAdSet.destination_type && sourceAdSet.destination_type !== 'UNDEFINED') {
   basePayload.destination_type = sourceAdSet.destination_type;
  }
  if (budgetMode === 'ABO') {
   basePayload.daily_budget = perAdSetBudgetMinor;
   basePayload.bid_strategy = 'COST_CAP';
  }

  let createdAdSetId = '';
  try {
   const setRes = await directGraph<{ id: string }>(
    `act_${accountId}/adsets`,
    { ...basePayload, bid_strategy: 'COST_CAP' },
    'POST',
   );
   createdAdSetId = numericId(setRes.id, 'created ad set');
  } catch {
   const setRes = await directGraph<{ id: string }>(`act_${accountId}/adsets`, basePayload, 'POST');
   createdAdSetId = numericId(setRes.id, 'created ad set');
  }

  createdGroups.push({
   ...bp,
   adSetId: createdAdSetId,
   adSetName,
   bidAmountMinor,
   status: 'PAUSED',
  });
 }

 const structure: AntkiCampaignStructure = {
  accountId,
  accountName: 'UMOWA ALLCAN PROJECTS SP ZOO ORTHOMAX',
  campaignId: createdCampaignId,
  campaignName,
  costCapPln,
  bidAmountMinor,
  dailyBudgetPln,
  budgetMode,
  sourceCampaignId: String(sourceCampaign.id),
  sourceCampaignName: String(sourceCampaign.name || ''),
  sourceAdSetId: String(sourceAdSet.id),
  sourceAdSetName: String(sourceAdSet.name || ''),
  pixelId: (sourceAdSet.promoted_object as { pixel_id?: string } | undefined)?.pixel_id,
  createdAt: Date.now(),
  groups: createdGroups,
 };

 await inOwnerWorkspace(() =>
  mutate<{ structure?: AntkiCampaignStructure }, void>(stateKey, {}, s => {
   s.structure = structure;
  }),
 );

 return structure;
}

export async function cleanupDuplicateAntkiCampaigns(keepCampaignId = '120249912191200300', accountId = '1109284831182252') {
 const campaignsRes = await directGraph<{ data?: Record<string, unknown>[] }>(
  `act_${accountId}/campaigns`,
  { fields: 'id,name,status', limit: 100 },
  'GET',
 );
 const list = Array.isArray(campaignsRes.data) ? campaignsRes.data : [];
 const toDelete = list.filter(c => {
  const id = String(c.id || '');
  const name = String(c.name || '');
  if (id === keepCampaignId) return false;
  return (
   name === 'ANTKI CC35' ||
   name.startsWith('ANTKI_PL_CC35') ||
   name.startsWith('ANTKI PL | Dział Literacki')
  );
 });
 const deleted: { id: string; name: string; ok: boolean; error?: string }[] = [];
 for (const c of toDelete) {
  const cid = String(c.id);
  try {
   await directGraph(cid, { status: 'DELETED' }, 'POST');
   deleted.push({ id: cid, name: String(c.name), ok: true });
  } catch (e) {
   deleted.push({ id: cid, name: String(c.name), ok: false, error: e instanceof Error ? e.message : 'Failed' });
  }
 }

 const deletedStoreAds: { id: string; name: string; pageId: string; ok: boolean; error?: string }[] = [];
 try {
  const dorosliAdsRes = await directGraph<{
   data?: Array<{
    id?: string;
    name?: string;
    status?: string;
    creative?: { object_story_spec?: { page_id?: string } };
   }>;
  }>(
   '120249967753030300/ads',
   { fields: 'id,name,status,creative{object_story_spec}', limit: 200 },
   'GET',
  );
  const storeAds = (dorosliAdsRes.data || []).filter(
   a => a.id && a.status !== 'DELETED' && a.creative?.object_story_spec?.page_id === '752135021308884',
  );
  for (let i = 0; i < storeAds.length; i += 5) {
   const chunk = storeAds.slice(i, i + 5);
   await Promise.all(
    chunk.map(async sa => {
     const aid = String(sa.id);
     try {
      await directGraph(aid, { status: 'DELETED' }, 'POST');
      deletedStoreAds.push({ id: aid, name: String(sa.name || ''), pageId: '752135021308884', ok: true });
     } catch (e) {
      deletedStoreAds.push({
       id: aid,
       name: String(sa.name || ''),
       pageId: '752135021308884',
       ok: false,
       error: e instanceof Error ? e.message : 'Failed',
      });
     }
    }),
   );
  }
 } catch {}

 return {
  keptCampaignId: keepCampaignId,
  deletedCount: deleted.filter(d => d.ok).length,
  deleted,
  deletedStoreAdsCount: deletedStoreAds.filter(d => d.ok).length,
  deletedStoreAds,
 };
}

export const ANTKI_CC35_DEFAULT_ADSETS: Record<string, string> = {
 DOM: '120249912191690300',
 RUCH: '120249912192250300',
 GRUPA: '120249912192790300',
 MIT: '120249912193360300',
 RYCIAK: '120249912193940300',
 ZAL: '120249912194700300',
 ZIMA: '120249912194980300',
};

type SavedAntkiAdEntry = {
 id?: string;
 angleId?: string;
 code?: string;
 title?: string;
 imageUrl?: string;
 imageHash?: string;
 secondImageUrl?: string;
 secondImageHash?: string;
 twoImageLayout?: 'side_by_side' | 'top_bottom';
 combinedSplitImageUrl?: string;
 combinedSplitImageHash?: string;
 primaryText?: string;
 headline?: string;
 updatedAt?: number;
 createdAt?: number;
};

type SavedAntkiState = {
 ads?: SavedAntkiAdEntry[];
 customImages?: { id: string; url: string; label: string; imageHash?: string }[];
 deletedImageIds?: string[];
};

const ANTKI_STATE_KEYS = [
 'antki-pl-library-v12-suma-pln',
 'antki-pl-library-v11-kie-hooks',
 'antki-pl-library-v10-kie-clean',
 'antki-pl-library-v9-argon',
] as const;

async function readAntkiSavedLibraryState(): Promise<SavedAntkiState> {
 const candidates: { keyIdx: number; state: SavedAntkiState }[] = [];
 const pushCandidate = (keyIdx: number, val?: SavedAntkiState) => {
  if (val && (val.ads?.length || val.customImages?.length)) {
   candidates.push({ keyIdx, state: val });
  }
 };
 for (let i = 0; i < ANTKI_STATE_KEYS.length; i++) {
  const k = ANTKI_STATE_KEYS[i];
  try {
   const { value } = await readState<SavedAntkiState>(k, {});
   pushCandidate(i, value);
  } catch {}
  try {
   const { value } = await inOwnerWorkspace(() => readState<SavedAntkiState>(k, {}));
   pushCandidate(i, value);
  } catch {}
 }
 try {
  const { accountRegistry } = await import('./account-repository');
  const { inWorkspace } = await import('./account-context');
  const reg = await accountRegistry();
  for (const u of Object.values(reg.users || {})) {
   for (let i = 0; i < ANTKI_STATE_KEYS.length; i++) {
    const k = ANTKI_STATE_KEYS[i];
    try {
     const { value } = await inWorkspace(u, () => readState<SavedAntkiState>(k, {}));
     pushCandidate(i, value);
    } catch {}
   }
  }
 } catch {}
 if (!candidates.length) return { ads: [], customImages: [], deletedImageIds: [] };
 candidates.sort((a, b) => {
  if (a.keyIdx !== b.keyIdx) return a.keyIdx - b.keyIdx;
  const aMax = Math.max(0, ...(a.state.ads || []).map(x => x.updatedAt || 0));
  const bMax = Math.max(0, ...(b.state.ads || []).map(x => x.updatedAt || 0));
  return bMax - aMax;
 });
 const best = candidates[0].state;
 // Merge customImages across all candidates so no Kie.ai image is ever missing
 const seenUrls = new Set<string>();
 const mergedCustomImages: NonNullable<SavedAntkiState['customImages']> = [];
 for (const c of candidates) {
  for (const img of c.state.customImages || []) {
   if (img?.url && !seenUrls.has(img.url)) {
    seenUrls.add(img.url);
    mergedCustomImages.push(img);
   } else if (img?.url && img.imageHash) {
    const existing = mergedCustomImages.find(x => x.url === img.url);
    if (existing && !existing.imageHash) existing.imageHash = img.imageHash;
   }
  }
 }

 const { buildAllArgonPrewrittenAds } = await import('./antki-pl-argon-library');
 const defaultAds = buildAllArgonPrewrittenAds();
 const defaultByAngle = new Map(defaultAds.map(a => [a.angleId, a]));
 const storedByAngle = new Map((best.ads || []).filter(a => a?.angleId).map(a => [a.angleId as string, a]));
 const DEFAULT_CREATED_AT = 1792616400000;

 const mergedAds = defaultAds.map(baseAd => {
  const storedAd = storedByAngle.get(baseAd.angleId);
  const merged = storedAd ? { ...baseAd, ...storedAd } : { ...baseAd };
  const angleImgs = mergedCustomImages.filter(
   img => (img as { angleId?: string }).angleId === baseAd.angleId && typeof img.url === 'string' && img.url.startsWith('http'),
  );
  if (angleImgs.length > 0) {
   const sorted = [...angleImgs].sort((a, b) => {
    const mA = (a.label || '').match(/(?:^|·\s*)(\d+)\./);
    const mB = (b.label || '').match(/(?:^|·\s*)(\d+)\./);
    return (mA ? Number(mA[1]) : 99) - (mB ? Number(mB[1]) : 99);
   });
   const scene1 = sorted.find(img => /(?:^|·\s*)1\./.test(img.label || '')) || sorted[0];
   const scene2 =
    sorted.find(img => /(?:^|·\s*)2\./.test(img.label || '')) ||
    sorted.find(img => img.url !== scene1?.url);
   const userModified = Boolean(storedAd?.updatedAt && storedAd.updatedAt > DEFAULT_CREATED_AT);
   const needsScene1 = !merged.imageUrl || (!userModified && merged.imageUrl === baseAd.imageUrl);
   const needsScene2 = !merged.secondImageUrl || (!userModified && !storedAd?.secondImageUrl && merged.secondImageUrl === baseAd.secondImageUrl);
   if (needsScene1 && scene1) {
    merged.imageUrl = scene1.url;
    merged.imageHash = scene1.imageHash;
   }
   if (needsScene2 && scene2) {
    merged.secondImageUrl = scene2.url;
    merged.secondImageHash = scene2.imageHash;
   }
  }
  return merged;
 });

 return {
  ads: mergedAds,
  customImages: mergedCustomImages,
  deletedImageIds: best.deletedImageIds || [],
 };
}

export async function inspectAntkiTargetAssets(accountId = '1109284831182252', campaignId = '120249912191200300') {
 if (campaignId === 'SET_ALL_CC_40') {
  return await updateAntkiCampaignCostCap({ costCapPln: 40, includeAllAccountCampaigns: true });
 }
 const { ANTKI_PL_IMAGE_LIBRARY, ANTKI_PL_PRESET_ANGLES, getDefaultImageForAngle } = await import('./antki-pl');
 const savedState = await readAntkiSavedLibraryState();
 const savedByAngle = new Map((savedState.ads || []).filter(a => a?.angleId).map(a => [a.angleId as string, a]));
 const customImages = savedState.customImages || [];
 const allLibrary = [...customImages, ...ANTKI_PL_IMAGE_LIBRARY];

 const angleImageAssignments = ANTKI_PL_PRESET_ANGLES.map(preset => {
  const saved = savedByAngle.get(preset.id);
  const defaultImg = getDefaultImageForAngle(preset.number);
  const imageUrl = saved?.imageUrl || preset.defaultImageUrl || defaultImg.url;
  const libItem = allLibrary.find(i => i.url === imageUrl);
  const imageHash =
   saved?.imageHash ||
   libItem?.imageHash ||
   preset.defaultImageHash ||
   defaultImg.imageHash;
  return {
   adNumber: preset.number,
   adName: preset.code.startsWith('D') ? preset.code : `ad ${preset.number}`,
   angleId: preset.id,
   title: preset.title,
   imageUrl: imageUrl?.startsWith('data:') ? 'custom-data-url' : imageUrl,
   secondImageUrl: saved?.secondImageUrl,
   imageLabel: libItem?.label || (imageUrl?.startsWith('data:') ? 'Custom uploaded image' : imageUrl),
   imageHash,
   wasCustomized: Boolean(saved?.imageUrl && saved.imageUrl !== defaultImg.url),
   updatedAt: saved?.updatedAt || saved?.createdAt || 0,
  };
 });

 const [campAdsRes, acc1AdsPages, acc2AdsPages, dorosliAdSetsRes, campInsights14d, adsetInsights14d, adInsights14d] = await Promise.all([
  directGraph<{ data?: Record<string, unknown>[] }>(
   `${campaignId}/ads`,
   {
    fields: 'id,name,status,adset_id,creative{id,name,object_story_spec,image_hash,thumbnail_url}',
    limit: 200,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   'act_1109284831182252/adcreatives',
   {
    fields: 'id,name,object_story_spec',
    limit: 100,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   'act_991993289421136/adcreatives',
   {
    fields: 'id,name,object_story_spec',
    limit: 100,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   '120249967753030300/adsets',
   {
    fields: 'id,name,status,bid_amount,daily_budget,bid_strategy',
    limit: 50,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   `act_${accountId}/insights`,
   {
    level: 'campaign',
    date_preset: 'last_14d',
    fields: 'campaign_id,campaign_name,spend,impressions,inline_link_clicks,inline_link_click_ctr,cpc,cpm,actions,action_values',
    limit: 100,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   `act_${accountId}/insights`,
   {
    level: 'adset',
    date_preset: 'last_14d',
    fields: 'campaign_id,campaign_name,adset_id,adset_name,spend,impressions,inline_link_clicks,inline_link_click_ctr,cpc,cpm,actions,action_values',
    limit: 200,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   `act_${accountId}/insights`,
   {
    level: 'ad',
    date_preset: 'last_14d',
    fields: 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,inline_link_clicks,inline_link_click_ctr,cpc,cpm,actions,action_values',
    limit: 500,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
 ]);

 const dorosliCostCapUpdates: Record<string, unknown>[] = [];
 const dorosliSets = ((dorosliAdSetsRes as { data?: Record<string, unknown>[] })?.data || []);
 for (const ds of dorosliSets) {
  const sid = String(ds.id || '');
  if (!sid) continue;
  dorosliCostCapUpdates.push({ id: sid, name: ds.name, currentBid: Number(ds.bid_amount || 0) });
 }

 const summarizeAccountPages = (list: Record<string, unknown>[]) => {
  const map = new Map<string, { count: number; igIds: Set<string>; sampleCreative: string }>();
  for (const c of list) {
   const spec = c?.object_story_spec as { page_id?: string; instagram_user_id?: string; instagram_actor_id?: string } | undefined;
   const pid = spec?.page_id ? String(spec.page_id) : '';
   if (!pid) continue;
   if (!map.has(pid)) map.set(pid, { count: 0, igIds: new Set(), sampleCreative: String(c.name || '') });
   const entry = map.get(pid)!;
   entry.count++;
   const ig = spec?.instagram_user_id || spec?.instagram_actor_id;
   if (ig) entry.igIds.add(String(ig));
  }
  return Array.from(map.entries()).map(([pageId, v]) => ({
   pageId,
   creativesCount: v.count,
   instagramUserIds: [...v.igIds],
   sampleCreative: v.sampleCreative,
  }));
 };

 return {
  accountId,
  campaignId,
  dorosliCostCapUpdates,
  campaigns14d: (campInsights14d as { data?: unknown })?.data || campInsights14d,
  adsets14d: (adsetInsights14d as { data?: unknown })?.data || adsetInsights14d,
  ads14d: (adInsights14d as { data?: unknown })?.data || adInsights14d,
  acc1Pages: summarizeAccountPages((acc1AdsPages as { data?: Record<string, unknown>[] })?.data || []),
  acc2Pages: summarizeAccountPages((acc2AdsPages as { data?: Record<string, unknown>[] })?.data || []),
  customImagesCount: customImages.length,
  customImages: customImages.map(c => ({ id: c.id, label: c.label, imageHash: c.imageHash })),
  deletedImageIds: savedState.deletedImageIds || [],
  angleImageAssignments,
  campaignAds: (campAdsRes as { data?: unknown })?.data || campAdsRes,
 };
}

export async function populateAntkiAdsInCampaign(raw: unknown = {}) {
 const opts = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
 const batch: 'dzieci' | 'dorosli' = opts.batch === 'dorosli' ? 'dorosli' : 'dzieci';
 const accountId = numericId(String(opts.accountId || '1109284831182252').replace(/^act_/, ''), 'account');

 let dorosliStructure: AntkiCampaignStructure | null = null;
 if (batch === 'dorosli') {
  dorosliStructure = await readAntkiCostCapCampaign('dorosli');
  if ((!dorosliStructure || dorosliStructure.accountId !== accountId) && opts.autoCreateCampaign !== false) {
   dorosliStructure = await createAntkiCostCapCampaign({
    batch: 'dorosli',
    accountId,
    campaignName: typeof opts.campaignName === 'string' && opts.campaignName.trim() ? opts.campaignName.trim() : 'ANTKI DOROSLI CC30',
    costCapPln: Number(opts.costCapPln ?? 35),
    dailyBudgetPln: Number(opts.dailyBudgetPln ?? 1500),
    forceNew: false,
   });
  }
 }

 const targetCostCapPln = Number(opts.costCapPln ?? 35);
 const targetBidMinor = Math.round((Number.isFinite(targetCostCapPln) && targetCostCapPln > 0 ? targetCostCapPln : 35) * 100);

 const campaignId = numericId(
  String(
   opts.campaignId ||
    (batch === 'dorosli' && dorosliStructure?.campaignId ? dorosliStructure.campaignId : '120249912191200300'),
  ),
  'campaign',
 );
 const filterGroup = typeof opts.group === 'string' && opts.group.trim() ? opts.group.trim().toUpperCase() : null;
 const filterAngleIds = Array.isArray(opts.angleIds)
  ? new Set(opts.angleIds.map(id => String(id).trim()).filter(Boolean))
  : null;
 const publishStatus = opts.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED';
 const updateExisting = Boolean(opts.updateExisting);

 const ANTKI_DOROSLI_NATIVE_PAGE_BY_ANGLE: Record<string, string> = {
  // D1_SOR (D01-D05) -> Dziennik Zdrowego Ciała
  'dorosli-01-sor-zablokowane-kolano': '945290751994002',
  'dorosli-02-sor-rwa-kulszowa-kregoslup': '945290751994002',
  'dorosli-03-sor-biodro-blokada-schody': '945290751994002',
  'dorosli-04-sor-piekacy-nerwiak-przodostopie': '945290751994002',
  'dorosli-05-sor-skrecona-kostka-niestabilnosc': '945290751994002',
  // D2_MAMA (D06, D08, D10 = córka o mamie -> Porady Mamy Gosi; D07, D09 = syn o mamie/tacie -> Dziennik Zdrowego Ciała)
  'dorosli-06-m-jakuba-miska-z-woda': '798916893308685',
  'dorosli-07-m-jakuba-szuflada-lekow': '945290751994002',
  'dorosli-08-m-jakuba-spacer-lawka': '798916893308685',
  'dorosli-09-m-jakuba-ojciec-dzialka': '945290751994002',
  'dorosli-10-m-jakuba-wesele-buty-w-reku': '798916893308685',
  // D3_RYCIAK (D11-D15) -> Centrum Dobrego Kroku
  'dorosli-11-ryciak-dorosli-bark-i-kark': '866702399857726',
  'dorosli-12-ryciak-dorosli-ledzwie-dyskopatia': '866702399857726',
  'dorosli-13-ryciak-dorosli-kolano-zwyrodnienie': '866702399857726',
  'dorosli-14-ryciak-dorosli-biodro-asymetria': '866702399857726',
  'dorosli-15-ryciak-dorosli-slow-mo-bieznia': '866702399857726',
  // D4_OSTROGA (D16-D20) -> Centrum Dobrego Kroku
  'dorosli-16-ostroga-pierwszy-krok-6-rano': '866702399857726',
  'dorosli-17-ostroga-fala-uderzeniowa-1500zl': '866702399857726',
  'dorosli-18-ostroga-zamrozona-butelka': '866702399857726',
  'dorosli-19-ostroga-zelowe-podpietki-mit': '866702399857726',
  'dorosli-20-ostroga-strach-po-postoju': '866702399857726',
  // D5_HALUKS (D21-D25) -> Iwona Kożuchowska
  'dorosli-21-haluks-zimowe-botki-zamek': '1194345203770949',
  'dorosli-22-haluks-wstyd-rozmiar-40': '1194345203770949',
  'dorosli-23-haluks-separatory-i-szyny-mit': '1194345203770949',
  'dorosli-24-haluks-zdarte-buty-od-srodka': '1194345203770949',
  'dorosli-25-haluks-mokry-slad-w-lazience': '1194345203770949',
  // D6_ZAL (D26-D30) -> Iwona Kożuchowska
  'dorosli-26-zal-lewa-stopa-sruby-8200zl': '1194345203770949',
  'dorosli-27-zal-haluks-siostry-wrocil': '1194345203770949',
  'dorosli-28-zal-uchwyt-pod-prysznicem-52-lata': '1194345203770949',
  'dorosli-29-zal-za-5-lat-endoproteza': '1194345203770949',
  'dorosli-30-zal-artroskopia-kolana-powrot-bolu': '1194345203770949',
  // D7_PRACA (D31, D33 -> Dziennik Zdrowego Ciała; D32, D34, D35 -> Centrum Dobrego Kroku)
  'dorosli-31-praca-8h-na-nogach-kuchnia': '945290751994002',
  'dorosli-32-praca-mit-twardych-wkladek-400zl': '866702399857726',
  'dorosli-33-praca-12h-dyzur-szpitalny-beton': '945290751994002',
  'dorosli-34-praca-mechanizm-4-kroki': '866702399857726',
  'dorosli-35-powrot-dorosli-14h-w-domu-i-pracy': '866702399857726',
 };

 const BRAND_STORE_PAGE_IDS = new Set(['752135021308884', '875160819014767', '832791273240857', '869142929609188']);
 const defaultPageId = batch === 'dorosli' ? '866702399857726' : '798916893308685';
 const rawRequestedPageId = typeof opts.pageId === 'string' && /^\d+$/.test(opts.pageId.trim()) ? opts.pageId.trim() : '';
 const pageId = rawRequestedPageId && !BRAND_STORE_PAGE_IDS.has(rawRequestedPageId) ? rawRequestedPageId : defaultPageId;
 const forceSinglePage = Boolean(opts.forceSinglePage) && Boolean(rawRequestedPageId) && !BRAND_STORE_PAGE_IDS.has(rawRequestedPageId);
 const KNOWN_PAGE_IG_MAP: Record<string, string> = {
  '866702399857726': '17841477743222560', // Centrum Dobrego Kroku
  '945290751994002': '17841446201609005', // Dziennik Zdrowego Ciała
  '798916893308685': '17841473314157729', // Porady Mamy Gosi
  '1204366092764321': '17841439381913725', // Dr. Magdalena Rokicińska
  '1339041252618036': '17841437463666297', // Dr n. med. Janusz Skrzypiński
  '1194345203770949': '17841412233487287', // Iwona Kożuchowska
 };
 const instagramUserId =
  typeof opts.instagramUserId === 'string' && /^\d+$/.test(opts.instagramUserId.trim())
   ? opts.instagramUserId.trim()
   : KNOWN_PAGE_IG_MAP[pageId] || '';
 const imageHash = typeof opts.imageHash === 'string' && opts.imageHash.trim() ? opts.imageHash.trim() : '';
 const url = typeof opts.url === 'string' && opts.url.startsWith('https://') ? opts.url.trim() : 'https://orthomax.pl/products/orthomax-stepmax';
 const urlTags = typeof opts.urlTags === 'string' ? opts.urlTags.trim() : '';
 const cta: 'LEARN_MORE' | 'SHOP_NOW' = opts.cta === 'SHOP_NOW' ? 'SHOP_NOW' : 'LEARN_MORE';

 const { buildAllArgonPrewrittenAds } = await import('./antki-pl-argon-library');
 const { ANTKI_PL_IMAGE_LIBRARY, getDefaultImageForAngle } = await import('./antki-pl');
 const savedState = await readAntkiSavedLibraryState();
 const savedAds = Array.isArray(savedState?.ads) ? savedState.ads : [];
 const customImages = Array.isArray(savedState?.customImages) ? savedState.customImages : [];
 const allLibrary = [...customImages, ...ANTKI_PL_IMAGE_LIBRARY];
 const savedByAngleId = new Map(
  savedAds
   .filter(a => a && typeof a.angleId === 'string')
   .map(a => [a.angleId as string, a]),
 );

 const allAds = buildAllArgonPrewrittenAds(url);
 const adByAngleId = new Map(allAds.map((ad, idx) => [ad.angleId, { ad, globalIndex: idx + 1 }]));

 // Pre-populate with known ANTKI CC35 ad IDs so updates work even when GET campaign/ads is rate-limited
 const ANTKI_CC35_KNOWN_ADS: Record<string, string> = {
  '120249912191690300:ad 1': '120249912257300300',
  '120249912191690300:ad 2': '120249912257410300',
  '120249912191690300:ad 3': '120249912257660300',
  '120249912191690300:ad 4': '120249912258250300',
  '120249912191690300:ad 5': '120249912258470300',
  '120249912192250300:ad 6': '120249912260070300',
  '120249912192250300:ad 7': '120249912260150300',
  '120249912192250300:ad 8': '120249912260550300',
  '120249912192250300:ad 9': '120249912260640300',
  '120249912192250300:ad 10': '120249912260750300',
  '120249912192790300:ad 11': '120249912270960300',
  '120249912192790300:ad 12': '120249912271160300',
  '120249912192790300:ad 13': '120249912271350300',
  '120249912192790300:ad 14': '120249912272110300',
  '120249912192790300:ad 15': '120249912272490300',
  '120249912193360300:ad 16': '120249912272610300',
  '120249912193360300:ad 17': '120249912272900300',
  '120249912193360300:ad 18': '120249912273250300',
  '120249912193360300:ad 19': '120249912273760300',
  '120249912193360300:ad 20': '120249912274450300',
  '120249912193940300:ad 21': '120249912275060300',
  '120249912193940300:ad 22': '120249912275730300',
  '120249912193940300:ad 23': '120249912276570300',
  '120249912193940300:ad 24': '120249912276700300',
  '120249912193940300:ad 25': '120249912276880300',
  '120249912194700300:ad 26': '120249912278840300',
  '120249912194700300:ad 27': '120249912279230300',
  '120249912194700300:ad 28': '120249912279470300',
  '120249912194700300:ad 29': '120249912279810300',
  '120249912194700300:ad 30': '120249912280140300',
  '120249912194980300:ad 31': '120249912281980300',
  '120249912194980300:ad 32': '120249912282920300',
  '120249912194980300:ad 33': '120249912283460300',
  '120249912194980300:ad 34': '120249912283990300',
  '120249912194980300:ad 35': '120249912284630300',
 };
 const existingByAdSetAndName = new Map<string, string>(
  campaignId === '120249912191200300' ? Object.entries(ANTKI_CC35_KNOWN_ADS) : [],
 );
 if (!opts.skipExistingCheck && existingByAdSetAndName.size === 0) {
  try {
   const existingAdsRes = await directGraph<{ data?: { id?: string; name?: string; adset_id?: string; status?: string }[] }>(
    `${campaignId}/ads`,
    { fields: 'id,name,adset_id,status', limit: 200 },
    'GET',
   );
   for (const ea of existingAdsRes.data || []) {
    if (ea.id && ea.name && ea.adset_id && ea.status !== 'DELETED') {
     existingByAdSetAndName.set(`${ea.adset_id}:${ea.name.trim()}`, String(ea.id));
    }
   }
  } catch {
   // Fallback to known ad IDs
  }
 }

 const createdResults: {
  group: string;
  adSetId: string;
  adName: string;
  angleId: string;
  pageId?: string;
  imageUrl?: string;
  imageLabel?: string;
  imageHash?: string;
  ok: boolean;
  skipped?: boolean;
  updated?: boolean;
  adId?: string;
  creativeId?: string;
  error?: string;
 }[] = [];

 const activeBlueprints = batch === 'dorosli' ? ANTKI_DOROSLI_ADSET_BLUEPRINTS : ANTKI_PL_ADSET_BLUEPRINTS;
 const adSetIdMap: Record<string, string> =
  batch === 'dorosli'
   ? Object.fromEntries((dorosliStructure?.groups || []).filter(g => g.adSetId).map(g => [g.code, g.adSetId!]))
   : ANTKI_CC35_DEFAULT_ADSETS;

 const urlHashCache = new Map<string, string>();
 let anyNewHashUploaded = false;

 const resolveOrUploadMetaImageHash = async (
  targetUrl: string,
  candidateHash: string | undefined,
  fallbackHash: string,
  tagPrefix: string,
 ): Promise<string> => {
  if (!targetUrl) return candidateHash || fallbackHash;
  if (urlHashCache.has(targetUrl)) return urlHashCache.get(targetUrl)!;

  const customMatch = customImages.find(i => i.url === targetUrl);
  const staticMatch = ANTKI_PL_IMAGE_LIBRARY.find(i => i.url === targetUrl);

  // Remote URL (e.g. Kie.ai https://tempfile.aiquickdraw.com/...): only trust customMatch.imageHash if already uploaded
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
   if (customMatch?.imageHash && customMatch.imageHash.trim()) {
    const h = customMatch.imageHash.trim();
    urlHashCache.set(targetUrl, h);
    return h;
   }
   try {
    const imgRes = await fetch(targetUrl, { signal: AbortSignal.timeout(20000) });
    if (imgRes.ok) {
     const buf = Buffer.from(await imgRes.arrayBuffer());
     const bytes = buf.toString('base64');
     const upRes = await directGraph<{ images?: Record<string, { hash?: string }> }>(
      `act_${accountId}/adimages`,
      { bytes, name: `${tagPrefix}-${Date.now()}.jpg` },
      'POST',
     );
     const uploadedHash = upRes?.images ? Object.values(upRes.images)[0]?.hash : undefined;
     if (uploadedHash) {
      urlHashCache.set(targetUrl, uploadedHash);
      if (customMatch) customMatch.imageHash = uploadedHash;
      anyNewHashUploaded = true;
      return uploadedHash;
     }
    }
   } catch {}
   return candidateHash || fallbackHash;
  }

  if (targetUrl.startsWith('data:image/')) {
   try {
    const m = targetUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    if (m?.[1]) {
     const upRes = await directGraph<{ images?: Record<string, { hash?: string }> }>(
      `act_${accountId}/adimages`,
      { bytes: m[1], name: `${tagPrefix}-${Date.now()}.jpg` },
      'POST',
     );
     const uploadedHash = upRes?.images ? Object.values(upRes.images)[0]?.hash : undefined;
     if (uploadedHash) {
      urlHashCache.set(targetUrl, uploadedHash);
      if (customMatch) customMatch.imageHash = uploadedHash;
      anyNewHashUploaded = true;
      return uploadedHash;
     }
    }
   } catch {}
   return candidateHash || fallbackHash;
  }

  // Local path (/antki-pl-images/...)
  const knownLocalHash = staticMatch?.imageHash || customMatch?.imageHash || candidateHash;
  if (knownLocalHash && knownLocalHash.trim()) {
   const h = knownLocalHash.trim() === '028fa0e2022ce9974e28e33d1fbfba17' ? '69a46c3803572f10b92b292bb3991967' : knownLocalHash.trim();
   urlHashCache.set(targetUrl, h);
   return h;
  }
  if (targetUrl.startsWith('/')) {
   try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const localPath = path.join(process.cwd(), 'public', targetUrl.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
     const bytes = fs.readFileSync(localPath).toString('base64');
     const upRes = await directGraph<{ images?: Record<string, { hash?: string }> }>(
      `act_${accountId}/adimages`,
      { bytes, name: path.basename(localPath) },
      'POST',
     );
     const uploadedHash = upRes?.images ? Object.values(upRes.images)[0]?.hash : undefined;
     if (uploadedHash) {
      urlHashCache.set(targetUrl, uploadedHash);
      return uploadedHash;
     }
    }
   } catch {}
  }
  return fallbackHash;
 };

 for (const bp of activeBlueprints) {
  if (filterGroup && bp.code !== filterGroup && bp.label !== filterGroup) continue;
  const adSetId = adSetIdMap[bp.code];
  if (!adSetId) continue;

  try {
   await directGraph(adSetId, { bid_amount: targetBidMinor }, 'POST');
  } catch {
   // Continue even if adset bid update is skipped
  }

  for (const angleId of bp.angleIds) {
   if (filterAngleIds && !filterAngleIds.has(angleId)) continue;
   const entry = adByAngleId.get(angleId);
   if (!entry) continue;
   const adName = batch === 'dorosli' ? entry.ad.code : `ad ${entry.globalIndex}`;
   const alreadyId = existingByAdSetAndName.get(`${adSetId}:${adName}`);
   if (alreadyId && !updateExisting) {
    createdResults.push({
     group: bp.label,
     adSetId,
     adName,
     angleId,
     ok: true,
     skipped: true,
     adId: alreadyId,
    });
    continue;
   }

   const saved = savedByAngleId.get(angleId);
   const defaultImg = getDefaultImageForAngle(entry.globalIndex);
   const isLegacyGroupPlaceholder =
    [18, 20, 22, 25, 26, 27, 29, 30, 32, 33, 34, 35].includes(entry.globalIndex) &&
    typeof saved?.imageUrl === 'string' &&
    [
     '/antki-pl-images/ai-mit-16-wojna-o-cwiczenia.jpg',
     '/antki-pl-images/ai-ryciak-21-gabinet-test-luku.jpg',
     '/antki-pl-images/ai-zal-26-po-operacji-kule.jpg',
     '/antki-pl-images/ai-zima-31-dorosli-zimowe-botki.jpg',
    ].includes(saved.imageUrl);
   const rawResolvedImageUrl = (!isLegacyGroupPlaceholder && saved?.imageUrl) || defaultImg?.url || '';
   const resolvedImageUrl =
    rawResolvedImageUrl === '/antki-pl-images/lib-antki-30-drzwi-oddzial-ratunkowy.jpg' ||
    saved?.imageHash === '028fa0e2022ce9974e28e33d1fbfba17'
     ? '/antki-pl-images/lib-antki-drzwi-sor-pl.jpg'
     : rawResolvedImageUrl;
   const libMatch = resolvedImageUrl ? allLibrary.find(i => i.url === resolvedImageUrl) : undefined;
   const fallbackPrimaryHash = defaultImg?.imageHash || '158deebd0e272662e14182e8f8e3753b';
   const candidatePrimaryHash =
    imageHash ||
    libMatch?.imageHash ||
    (!isLegacyGroupPlaceholder && typeof saved?.imageHash === 'string' && saved.imageHash.trim() ? saved.imageHash.trim() : '');

   let resolvedImageHash = fallbackPrimaryHash;
   const isUnmodifiedArgonCopy = !saved?.id || saved.id.startsWith('antek-pl-argon-');
   const resolvedPrimaryText =
    !isUnmodifiedArgonCopy && typeof saved?.primaryText === 'string' && saved.primaryText.trim()
     ? saved.primaryText
     : entry.ad.primaryText;
   const resolvedHeadline =
    !isUnmodifiedArgonCopy && typeof saved?.headline === 'string' && saved.headline.trim()
     ? saved.headline
     : entry.ad.headline;

   const angleNativePageId =
    batch === 'dorosli' && !forceSinglePage
     ? ANTKI_DOROSLI_NATIVE_PAGE_BY_ANGLE[angleId] || '866702399857726'
     : pageId;
   const angleNativeIgId = KNOWN_PAGE_IG_MAP[angleNativePageId] || '';

   try {
    resolvedImageHash = await resolveOrUploadMetaImageHash(
     resolvedImageUrl,
     candidatePrimaryHash,
     fallbackPrimaryHash,
     `antek-${adName}-A`,
    );

    const buildSpec = (hash: string, withIg = true, overridePageId?: string, overrideIgId?: string) => {
     const effPageId = overridePageId || angleNativePageId;
     const effIgId = overrideIgId !== undefined ? overrideIgId : angleNativeIgId;
     return {
      name: `antki-cc35-native-${entry.globalIndex}-${Date.now()}`,
      object_story_spec: {
       page_id: effPageId,
       ...(withIg && effIgId ? { instagram_user_id: effIgId } : {}),
       link_data: {
        link: url,
        image_hash: hash,
        message: resolvedPrimaryText,
        name: resolvedHeadline,
        call_to_action: { type: cta, value: { link: url } },
       },
      },
      ...(urlTags ? { url_tags: urlTags } : {}),
     };
    };

    const createOrUpdateAdWithFallback = async (
     targetAdName: string,
     targetExistingAdId: string | undefined,
     targetImgUrl: string,
     targetImgHash: string,
    ): Promise<{ adId: string; creativeId: string; updated: boolean; finalHash: string; usedPageId: string }> => {
     let activeHash = targetImgHash;
     const createCreative = async (withIg: boolean, overridePageId: string, overrideIgId: string) => {
      try {
       return await directGraph<{ id: string }>(
        `act_${accountId}/adcreatives`,
        buildSpec(activeHash, withIg, overridePageId, overrideIgId),
        'POST',
       );
      } catch (crErr) {
       const errText = crErr instanceof Error ? crErr.message : '';
       if (targetImgUrl.startsWith('/antki-pl-images/')) {
        try {
         const fs = await import('node:fs');
         const path = await import('node:path');
         const localPath = path.join(process.cwd(), 'public', targetImgUrl.replace(/^\//, ''));
         if (fs.existsSync(localPath)) {
          const bytes = fs.readFileSync(localPath).toString('base64');
          const upRes = await directGraph<{ images?: Record<string, { hash?: string }> }>(
           `act_${accountId}/adimages`,
           { bytes, name: path.basename(localPath) },
           'POST',
          );
          const uploadedHash = upRes?.images ? Object.values(upRes.images)[0]?.hash : undefined;
          if (uploadedHash) {
           activeHash = uploadedHash;
           urlHashCache.set(targetImgUrl, uploadedHash);
          }
         }
        } catch {}
       }
       return await directGraph<{ id: string }>(
        `act_${accountId}/adcreatives`,
        buildSpec(activeHash, withIg && !errText.includes('Instagram') && !errText.includes('1815199'), overridePageId, overrideIgId),
        'POST',
       );
      }
     };

     // Ordered native-only attempts: NEVER use Orthomax Sklep (752135021308884)
     const attempts: Array<{ pId: string; igId: string; withIg: boolean }> = [
      ...(angleNativeIgId ? [{ pId: angleNativePageId, igId: angleNativeIgId, withIg: true }] : []),
      { pId: angleNativePageId, igId: '', withIg: false },
      { pId: angleNativePageId, igId: '17841473314157729', withIg: true },
      { pId: angleNativePageId, igId: '17841472034688013', withIg: true },
      ...(angleNativePageId !== '945290751994002'
       ? [
          { pId: '945290751994002', igId: '', withIg: false },
          { pId: '945290751994002', igId: '17841473314157729', withIg: true },
         ]
       : []),
      ...(angleNativePageId !== '866702399857726'
       ? [
          { pId: '866702399857726', igId: '', withIg: false },
          { pId: '866702399857726', igId: '17841472034688013', withIg: true },
         ]
       : []),
      ...(angleNativePageId !== '798916893308685'
       ? [{ pId: '798916893308685', igId: '17841473314157729', withIg: true }]
       : []),
     ];

     let lastErr: unknown = null;
     for (const att of attempts) {
      try {
       const cr = await createCreative(att.withIg, att.pId, att.igId);
       if (targetExistingAdId && updateExisting) {
        await directGraph<{ success?: boolean }>(
         targetExistingAdId,
         { creative: { creative_id: cr.id } },
         'POST',
        );
        return { adId: targetExistingAdId, creativeId: cr.id, updated: true, finalHash: activeHash, usedPageId: att.pId };
       } else {
        const createdAd = await directGraph<{ id: string }>(
         `act_${accountId}/ads`,
         {
          name: targetAdName,
          adset_id: adSetId,
          creative: { creative_id: cr.id },
          status: publishStatus,
         },
         'POST',
        );
        return { adId: createdAd.id, creativeId: cr.id, updated: false, finalHash: activeHash, usedPageId: att.pId };
       }
      } catch (err) {
       lastErr = err;
       const msg = err instanceof Error ? err.message : '';
       if (msg.includes('17/2446079') || msg.includes('too many calls')) {
        throw err;
       }
      }
     }
     throw lastErr instanceof Error ? lastErr : new Error('Failed to create/update native ad');
    };

    const resA = await createOrUpdateAdWithFallback(adName, alreadyId, resolvedImageUrl, resolvedImageHash);
    resolvedImageHash = resA.finalHash;
    createdResults.push({
     group: bp.label,
     adSetId,
     adName,
     angleId,
     pageId: resA.usedPageId,
     imageUrl: resolvedImageUrl.startsWith('data:') ? 'custom-data-url' : resolvedImageUrl,
     imageLabel: libMatch?.label || resolvedImageUrl,
     imageHash: resA.finalHash,
     ok: true,
     ...(resA.updated ? { updated: true } : {}),
     adId: resA.adId,
     creativeId: resA.creativeId,
    });

    // If a 2nd separate A/B test image (secondImageUrl) is configured on this angle, create/update a 2nd separate ad ("ad N B" / "D01 B") in the same AdSet
    if (saved?.secondImageUrl && saved.secondImageUrl.trim()) {
     const secondUrl = saved.secondImageUrl.trim();
     const secondLibMatch = allLibrary.find(i => i.url === secondUrl);
     const candidateSecondHash = secondLibMatch?.imageHash || saved.secondImageHash?.trim();
     const secondHash = await resolveOrUploadMetaImageHash(
      secondUrl,
      candidateSecondHash,
      '',
      `antek-${adName}-B`,
     );
     if (secondHash) {
      const adNameB = `${adName} B`;
      const alreadyIdB = existingByAdSetAndName.get(`${adSetId}:${adNameB}`);
      if (!alreadyIdB || updateExisting) {
       const resB = await createOrUpdateAdWithFallback(adNameB, alreadyIdB, secondUrl, secondHash);
       createdResults.push({
        group: bp.label,
        adSetId,
        adName: adNameB,
        angleId,
        pageId: resB.usedPageId,
        imageUrl: secondUrl.startsWith('data:') ? 'custom-data-url' : secondUrl,
        imageLabel: secondLibMatch?.label || secondUrl,
        imageHash: resB.finalHash,
        ok: true,
        ...(resB.updated ? { updated: true } : {}),
        adId: resB.adId,
        creativeId: resB.creativeId,
       });
      }
     }
    }
    await new Promise(r => setTimeout(r, filterGroup ? 400 : 750));
   } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    createdResults.push({
     group: bp.label,
     adSetId,
     adName,
     angleId,
     imageHash: resolvedImageHash,
     ok: false,
     error: msg,
    });
    if (msg.includes('17/2446079') || msg.includes('too many calls')) {
     break;
    }
   }
  }
 }

 if (anyNewHashUploaded) {
  try {
   await mutate<SavedAntkiState, void>('antki-pl-library-v12-suma-pln', {}, state => {
    if (Array.isArray(state.customImages)) {
     state.customImages = state.customImages.map(img => {
      const h = img?.url ? urlHashCache.get(img.url) : undefined;
      return h && !img.imageHash ? { ...img, imageHash: h } : img;
     });
    }
    if (Array.isArray(state.ads)) {
     state.ads = state.ads.map(ad => {
      const hA = ad?.imageUrl ? urlHashCache.get(ad.imageUrl) : undefined;
      const hB = ad?.secondImageUrl ? urlHashCache.get(ad.secondImageUrl) : undefined;
      return {
       ...ad,
       ...(hA ? { imageHash: hA } : {}),
       ...(hB ? { secondImageHash: hB } : {}),
      };
     });
    }
   });
  } catch {}
 }

 return {
  accountId,
  campaignId,
  pageId,
  imageHash,
  url,
  cta,
  urlTags,
  createdCount: createdResults.filter(r => r.ok && !r.skipped).length,
  skippedCount: createdResults.filter(r => r.skipped).length,
  failedCount: createdResults.filter(r => !r.ok).length,
  results: createdResults,
 };
}
export async function updateUploaderAdsStatus(raw:unknown){
 const a=raw as Record<string,unknown>;if(!a||typeof a!=='object')throw Error('Invalid request.');
 const status=a.status==='ACTIVE'?'ACTIVE':a.status==='PAUSED'?'PAUSED':undefined;
 if(!status)throw Error('Choose ACTIVE or PAUSED status.');
 const ids=Array.isArray(a.adIds)?a.adIds.map(id=>numericId(id,'ad')).slice(0,100):[];
 if(!ids.length)throw Error('Provide at least one ad ID.');
 const results:{id:string;ok:boolean;error?:string}[]=[];
 for(let i=0;i<ids.length;i+=5){
  const chunk=ids.slice(i,i+5);
  const res=await Promise.all(chunk.map(async id=>{
   try{await directGraph(id,{status},'POST');return {id,ok:true};}
   catch(e){return {id,ok:false,error:e instanceof Error?e.message:'Failed'};}
  }));
  results.push(...res);
 }
 return {status,updated:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results};
}
export async function replaceAdsPageInBatch(raw:unknown){
 const a=raw as Record<string,unknown>;if(!a||typeof a!=='object')throw Error('Invalid request.');
 const batchId=typeof a.batchId==='string'?a.batchId:'';
 const pageId=a.pageId?numericId(a.pageId,'Page'):undefined;
 const newUrl=typeof a.url==='string'&&a.url.startsWith('https://')?a.url.trim():undefined;
 if(!pageId&&!newUrl)throw Error('Provide pageId or url.');
 const filterAdIds=Array.isArray(a.adIds)?new Set(a.adIds.map(id=>numericId(id,'ad'))):null;
 const {readBatch}=await import('./meta-uploader');
 const {creativePayload,verifyCreative}=await import('./meta-uploader-model');
 const {fingerprint}=await import('./meta-uploader-identity');
 const {batch,items}=await readBatch(batchId);
 if(!batch)throw Error('Batch not found.');
 const targets=items.filter(i=>i.metaAdId&&(!filterAdIds||filterAdIds.has(i.metaAdId))&&((pageId&&i.ad.pageId!==pageId)||(newUrl&&i.ad.url!==newUrl)));
 const results:{adId:string;name:string;ok:boolean;creativeId?:string;error?:string}[]=[];
 for(let i=0;i<targets.length;i+=4){
  const chunk=targets.slice(i,i+4);
  const res=await Promise.all(chunk.map(async item=>{
   try{
    const nextAd={...item.ad,...(pageId?{pageId}:{}),...(newUrl?{url:newUrl}:{})};
    const updatedItem={...item,ad:nextAd};
    const cr=await directGraph<{id:string}>(`act_${item.ad.accountId}/adcreatives`,creativePayload(updatedItem),'POST');
    if(!/^\d+$/.test(cr.id))throw Error('Creative ID not returned.');
    await directGraph(item.metaAdId!,{creative:{creative_id:cr.id}},'POST');
    const verified=await directGraph<Record<string,unknown>>(cr.id,{fields:'id,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,contextual_multi_ads,url_tags'});
    const issues=verifyCreative(updatedItem,verified);
    if(issues.length)throw Error(issues.join(' '));
    await mutate<{item?:typeof item},void>('meta-upload-item-'+item.id+'-record',{},s=>{if(s.item){s.item.ad=nextAd;s.item.fingerprint=fingerprint(nextAd);s.item.creativeId=cr.id;s.item.verifiedAt=Date.now();s.item.updated=Date.now();}});
    return {adId:item.metaAdId!,name:item.ad.name,ok:true,creativeId:cr.id};
   }catch(e){
    return {adId:item.metaAdId!,name:item.ad.name,ok:false,error:e instanceof Error?e.message:'Failed'};
   }
  }));
  results.push(...res);
 }
 return {batchId,pageId,url:newUrl,updated:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results};
}

export async function uploadCustomAntkiImageToMeta(params: {
 bytes: string;
 fileName?: string;
 accountId?: string;
}): Promise<{ hash?: string; url?: string }> {
 const accountId = numericId(String(params.accountId || '1109284831182252').replace(/^act_/, ''), 'account');
 const cleanName = (params.fileName || `custom-antki-${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
 const upRes = await directGraph<{ images?: Record<string, { hash?: string; url?: string }> }>(
  `act_${accountId}/adimages`,
  { bytes: params.bytes, name: cleanName },
  'POST',
 );
 const first = upRes?.images ? Object.values(upRes.images)[0] : undefined;
 return { hash: first?.hash, url: first?.url };
}

