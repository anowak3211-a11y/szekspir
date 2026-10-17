import {createHash} from 'node:crypto';
import {graph,MetaError,rememberCreatedAdSet} from './meta-client';
import {MetaBudgetWait} from './meta-rate-limit';
import {numericId} from './meta-uploader-model';
import {mutate,readState} from './store';
function canonical(value:unknown):string{if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';return JSON.stringify(value);}
type Input={accountId:string;campaignId:string;templateId:string;name:string;minimumDaily?:number};
type Intent={fingerprint?:string;state?:'pending'|'failed'|'uncertain'|'created';id?:string;expected?:Record<string,unknown>};
export async function createUploaderAdSet(raw:unknown){
 const a=raw as Record<string,unknown>;if(!a||typeof a!=='object')throw Error('Invalid ad set.');
 const input:Input={accountId:numericId(String(a.accountId||'').replace(/^act_/,''),'account'),campaignId:numericId(a.campaignId,'campaign'),templateId:numericId(a.templateId,'base ad set'),name:typeof a.name==='string'?a.name.trim():''};
 if(!input.name||input.name.length>240)throw Error('Enter an ad set name (up to 240 characters).');
 if(a.minimumDaily!==undefined&&a.minimumDaily!==''){const n=Number(a.minimumDaily);if(!Number.isFinite(n)||n<=0||n>1000000||Math.abs(n*100-Math.round(n*100))>0.00001)throw Error('Enter a valid daily minimum with up to two decimal places.');input.minimumDaily=n;}
 const key='meta-create-adset-'+createHash('sha256').update(JSON.stringify([input.accountId,input.campaignId,input.name])).digest('hex'),fingerprint=JSON.stringify(input),prior=(await readState<Intent>(key,{})).value;
 let expected=prior.expected;
 const verify=async(id:string)=>{const set=await graph<Record<string,unknown>>(id,{fields:'id,name,status,account_id,campaign_id,optimization_goal,billing_event,targeting,promoted_object,daily_min_spend_target'});if(set.account_id!==input.accountId||set.campaign_id!==input.campaignId||set.name!==input.name||set.status!=='PAUSED')throw Error('Created ad set settings did not match. Check it in Meta; no replacement was created.');if(expected){if(canonical(set.targeting)!==canonical(expected.targeting))throw Error('Created ad set audience or placements differ. Check Meta before retrying.');for(const field of ['optimization_goal','billing_event'])if(set[field]!==expected[field])throw Error('Created ad set delivery settings differ. Check Meta before retrying.');const actual=set.promoted_object as Record<string,unknown>|undefined,wanted=expected.promoted_object as Record<string,unknown>|undefined;for(const field of ['pixel_id','custom_event_type'])if(wanted?.[field]!==undefined&&actual?.[field]!==wanted[field])throw Error('Created ad set conversion settings differ.');if(expected.daily_min_spend_target!==undefined&&Number(set.daily_min_spend_target)!==expected.daily_min_spend_target)throw Error('Created ad set minimum spending was not confirmed.');}
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
