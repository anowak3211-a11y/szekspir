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

const ANTKI_CAMPAIGN_STATE_KEY = 'antki-pl-campaign-structure-v3';

export async function readAntkiCostCapCampaign(): Promise<AntkiCampaignStructure | null> {
 try {
  const { value } = await inOwnerWorkspace(() => readState<{ structure?: AntkiCampaignStructure }>(ANTKI_CAMPAIGN_STATE_KEY, {}));
  return value?.structure || null;
 } catch {
  return null;
 }
}

export async function createAntkiCostCapCampaign(raw: unknown = {}): Promise<AntkiCampaignStructure> {
 const a = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
 const accountId = numericId(String(a.accountId || '1109284831182252').replace(/^act_/, ''), 'account');
 const costCapPln = Number(a.costCapPln ?? 35);
 if (!Number.isFinite(costCapPln) || costCapPln < 5 || costCapPln > 500) {
  throw Error('Podaj prawidłowy Cost Per Result Goal (np. 30 lub 35 PLN).');
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
   : `ANTKI CC${costCapPln}`;

 const forceNew = !!a.forceNew;
 if (!forceNew) {
  const existing = await readAntkiCostCapCampaign();
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
 const perAdSetBudgetMinor = Math.max(5000, Math.round(dailyBudgetMinor / ANTKI_PL_ADSET_BLUEPRINTS.length));

 for (const bp of ANTKI_PL_ADSET_BLUEPRINTS) {
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
  mutate<{ structure?: AntkiCampaignStructure }, void>(ANTKI_CAMPAIGN_STATE_KEY, {}, s => {
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
 return { keptCampaignId: keepCampaignId, deletedCount: deleted.filter(d => d.ok).length, deleted };
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

export async function inspectAntkiTargetAssets(accountId = '1109284831182252', campaignId = '120249912191200300') {
 const [adsRes, pagesRes, imagesRes, campSetsRes] = await Promise.all([
  directGraph<{ data?: Record<string, unknown>[] }>(
   `act_${accountId}/ads`,
   {
    fields: 'id,name,status,adset_id,campaign_id,creative{id,name,object_story_spec,asset_feed_spec,url_tags,image_hash,thumbnail_url}',
    limit: 30,
   },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   `act_${accountId}/promote_pages`,
   { fields: 'id,name', limit: 25 },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   `act_${accountId}/adimages`,
   { fields: 'hash,name,url,created_time', limit: 25 },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
  directGraph<{ data?: Record<string, unknown>[] }>(
   `${campaignId}/adsets`,
   { fields: 'id,name,status,bid_amount,bid_strategy', limit: 25 },
   'GET',
  ).catch(e => ({ error: e instanceof Error ? e.message : 'Failed' })),
 ]);

 return {
  accountId,
  campaignId,
  campaignAdSets: (campSetsRes as { data?: unknown })?.data || campSetsRes,
  promotePages: (pagesRes as { data?: unknown })?.data || pagesRes,
  recentImages: (imagesRes as { data?: unknown })?.data || imagesRes,
  recentAds: (adsRes as { data?: unknown })?.data || adsRes,
 };
}

export async function populateAntkiAdsInCampaign(raw: unknown = {}) {
 const opts = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
 const accountId = numericId(String(opts.accountId || '1109284831182252').replace(/^act_/, ''), 'account');
 const campaignId = numericId(String(opts.campaignId || '120249912191200300'), 'campaign');
 const filterGroup = typeof opts.group === 'string' && opts.group.trim() ? opts.group.trim().toUpperCase() : null;
 const publishStatus = opts.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED';
 const updateExisting = Boolean(opts.updateExisting);

 let pageId = typeof opts.pageId === 'string' && /^\d+$/.test(opts.pageId.trim()) ? opts.pageId.trim() : '798916893308685';
 let instagramUserId =
  typeof opts.instagramUserId === 'string' && /^\d+$/.test(opts.instagramUserId.trim())
   ? opts.instagramUserId.trim()
   : pageId === '798916893308685'
   ? '17841473314157729'
   : '';
 let imageHash = typeof opts.imageHash === 'string' && opts.imageHash.trim() ? opts.imageHash.trim() : '';
 let url = typeof opts.url === 'string' && opts.url.startsWith('https://') ? opts.url.trim() : 'https://orthomax.pl/products/orthomax-stepmax';
 let urlTags = typeof opts.urlTags === 'string' ? opts.urlTags.trim() : '';
 const cta: 'LEARN_MORE' | 'SHOP_NOW' = opts.cta === 'SHOP_NOW' ? 'SHOP_NOW' : 'LEARN_MORE';

 const { buildAllArgonPrewrittenAds } = await import('./antki-pl-argon-library');
 const { getDefaultImageForAngle } = await import('./antki-pl');
 const { value: savedState } = await readState<{ ads?: { angleId?: string; imageHash?: string; primaryText?: string; headline?: string }[] }>('antki-pl-library-v9-argon', { ads: [] });
 const savedAds = Array.isArray(savedState?.ads) ? savedState.ads : [];
 const savedByAngleId = new Map(
  savedAds
   .filter(a => a && typeof a.angleId === 'string')
   .map(a => [a.angleId as string, a]),
 );

 const allAds = buildAllArgonPrewrittenAds(url);
 const adByAngleId = new Map(allAds.map((ad, idx) => [ad.angleId, { ad, globalIndex: idx + 1 }]));

 // Single GET for all existing ads in the campaign
 const existingByAdSetAndName = new Map<string, string>();
 if (!opts.skipExistingCheck) {
  const existingAdsRes = await directGraph<{ data?: { id?: string; name?: string; adset_id?: string; status?: string }[] }>(
   `${campaignId}/ads`,
   { fields: 'id,name,adset_id,status', limit: 100 },
   'GET',
  );
  for (const ea of existingAdsRes.data || []) {
   if (ea.id && ea.name && ea.adset_id && ea.status !== 'DELETED') {
    existingByAdSetAndName.set(`${ea.adset_id}:${ea.name.trim()}`, String(ea.id));
   }
  }
 }

 const createdResults: {
  group: string;
  adSetId: string;
  adName: string;
  angleId: string;
  imageHash?: string;
  ok: boolean;
  skipped?: boolean;
  updated?: boolean;
  adId?: string;
  creativeId?: string;
  error?: string;
 }[] = [];

 for (const bp of ANTKI_PL_ADSET_BLUEPRINTS) {
  if (filterGroup && bp.code !== filterGroup && bp.label !== filterGroup) continue;
  const adSetId = ANTKI_CC35_DEFAULT_ADSETS[bp.code];
  if (!adSetId) continue;

  for (const angleId of bp.angleIds) {
   const entry = adByAngleId.get(angleId);
   if (!entry) continue;
   const adName = `ad ${entry.globalIndex}`;
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
   const resolvedImageHash =
    imageHash ||
    (typeof saved?.imageHash === 'string' && saved.imageHash.trim() ? saved.imageHash.trim() : '') ||
    defaultImg?.imageHash ||
    '158deebd0e272662e14182e8f8e3753b';
   const resolvedPrimaryText =
    typeof saved?.primaryText === 'string' && saved.primaryText.trim() ? saved.primaryText : entry.ad.primaryText;
   const resolvedHeadline =
    typeof saved?.headline === 'string' && saved.headline.trim() ? saved.headline : entry.ad.headline;

   try {
    const cleanCreative = {
     name: `antki-cc35-gosi-${entry.globalIndex}`,
     object_story_spec: {
      page_id: pageId,
      ...(instagramUserId ? { instagram_user_id: instagramUserId } : {}),
      link_data: {
       link: url,
       image_hash: resolvedImageHash,
       message: resolvedPrimaryText,
       name: resolvedHeadline,
       call_to_action: { type: cta, value: { link: url } },
      },
     },
     ...(urlTags ? { url_tags: urlTags } : {}),
    };

    const cr = await directGraph<{ id: string }>(`act_${accountId}/adcreatives`, cleanCreative, 'POST');
    if (alreadyId && updateExisting) {
     await directGraph<{ success?: boolean }>(
      alreadyId,
      {
       creative: { creative_id: cr.id },
      },
      'POST',
     );
     createdResults.push({
      group: bp.label,
      adSetId,
      adName,
      angleId,
      imageHash: resolvedImageHash,
      ok: true,
      updated: true,
      adId: alreadyId,
      creativeId: cr.id,
     });
    } else {
     const createdAd = await directGraph<{ id: string }>(
      `act_${accountId}/ads`,
      {
       name: adName,
       adset_id: adSetId,
       creative: { creative_id: cr.id },
       status: publishStatus,
      },
      'POST',
     );

     createdResults.push({
      group: bp.label,
      adSetId,
      adName,
      angleId,
      imageHash: resolvedImageHash,
      ok: true,
      adId: createdAd.id,
      creativeId: cr.id,
     });
    }
    await new Promise(r => setTimeout(r, 1200));
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


