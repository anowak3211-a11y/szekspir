import {POLISH_SYSTEM_PROMPT,POLISH_PROMPT_VERSION} from './polish-localization';
import {parseMarket,type Market} from './market';
import {isNonSpeechTranscript,noSpeechResult} from './no-speech';
import {ctaInstruction,parseCtaMode,type CtaMode} from './cta-mode';
import {mayIntroduceMellow,hasUnwantedBrandReveal} from './brand-disclosure';
import {narration} from './speech';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {SYSTEM_PROMPT,CRITIC_PROMPT,PROMPT_VERSION} from './localization-rules';
import {objectJson,validateResult,applyCritic,timing,opening,LocalizeResult} from './validation';
export type {LocalizeResult} from './validation';
export type Provider='anthropic'|'openai'|'custom';
export async function localize(usScript:string,provider:Provider,model:string,productMd?:string,_voMode?:boolean,singingAd=false,targetBrand="MELLOW",ctaMode:CtaMode="original",generateHooks=true,market:Market='uk'):Promise<LocalizeResult>{
 market=parseMarket(market);
 if(market==='pl'&&singingAd)throw Error('Polish localisation does not support singing ads yet.');
 if(isNonSpeechTranscript(usScript))return noSpeechResult();
 const selectedCta=parseCtaMode(ctaMode);
 const system=(market==='pl'?POLISH_SYSTEM_PROMPT:SYSTEM_PROMPT)+'\n'+ctaInstruction(selectedCta,singingAd)+(generateHooks?'':'\nMANUAL HOOK CHOICE: Do not generate alternative hooks. Return hooks: [] (empty array), overriding the two-hook requirement. Preserve the original opening in uk_script.');
 const lyrics=singingAd?(productMd?.trim()?usScript.replace(/\bp\s*[-–‑]\s*nutrition\b|spenatrician\b|\bS\.?\s*P\.?(?:\s*[-–]?\s*Nutrition)?\b/gi,()=>targetBrand):usScript):undefined;
 const disclosureInstruction=market==='pl'?'Preserve source disclosure timing. Only use explicitly confirmed Polish target facts; no default brand or offer.':mayIntroduceMellow(usScript)?'Only replace explicitly named source brands at the same point in the script. P-nutrition and Spenatrician are confirmed transcriptions of SP Nutrition, including againSpenatrician; substitute the target brand there and preserve the preceding word.':'HARD RULE: the US source contains no SP/SP Nutrition brand. Do not introduce MELLOW or its full branded product name in script or hooks. Generic magnesium bisglycinate must stay generic. S tier is a ranking, not SP. Preserve ingredient wording and product disclosure.';
 const user=JSON.stringify({disclosureInstruction,mode:productMd?.trim()?'BRAND_ADAPTATION':'FAITHFUL_SOURCE',productContext:productMd||'',sourceTranscript:usScript});
 let raw=await complete(provider,model,system,user,120000); let result:LocalizeResult;
 try{result=validateResult(objectJson(raw),generateHooks?2:0);}catch{
  raw=await complete(provider,model,system,user+'\nPrevious output had an invalid schema. Return exactly the requested JSON contract; do not omit fields.',60000);
  result=validateResult(objectJson(raw),generateHooks?2:0);
 }
 if(market==='uk'&&hasUnwantedBrandReveal(usScript,[result.uk_script,...result.hooks])){
  const corrected=await complete(provider,model,system,user+'\nThe previous attempt introduced a brand absent from the source. Regenerate faithfully with NO MELLOW or added product reveal. Return the full JSON contract.',120000);
  result=validateResult(objectJson(corrected),generateHooks?2:0);
  if(market==='uk'&&hasUnwantedBrandReveal(usScript,[result.uk_script,...result.hooks]))throw Error('Adaptation added a brand absent from the US source. No new script was saved. Please regenerate.');
 }
 if(lyrics!==undefined){result.uk_script=lyrics;result.notes=lyrics===usScript?[]:[{original:"Source brand",replacement:targetBrand,reason:"Singing ad: original lyrics preserved; brand replacement only."}];}
 // Check the context-sensitive adaptation without appending a stock CTA.
 const checks=market==='pl'?[]:await Promise.all([result.uk_script,...result.hooks].map(async (text,index)=>{
  if(singingAd&&index===0)return {uk_script:text,fixes:[]};
  for(let attempt=0;attempt<2;attempt++){
   try{return await critic(text,provider,model,usScript);}catch(error){if(attempt===1)throw new Error(languageCheckError(error,index));}
  }
  throw new Error('British English check failed.');
 }));
 checks.forEach((checked,i)=>{
  if(i===0){result.uk_script=checked.uk_script;result.notes.push(...checked.fixes);}
  else result.hooks[i-1]=checked.uk_script;
 });
 if(market==='uk'&&hasUnwantedBrandReveal(usScript,[result.uk_script,...result.hooks]))throw Error('Adaptation added a brand absent from the US source. No new script was saved. Please regenerate.');
 if(!singingAd&&market==='uk')result.language_check={model:criticModel(provider),checkedAt:new Date().toISOString()};

 result.narration=singingAd?result.uk_script:narration(result.uk_script,market);result.hook_og=opening(result.uk_script);result.timing=timing(usScript,result.uk_script);result.prompt_version=(market==='pl'?POLISH_PROMPT_VERSION:PROMPT_VERSION)+(singingAd?"-singing":selectedCta==='learn-more'?"-cta-learn-more":"");
 return result;
}
async function complete(
  provider: Provider,
  model: string,
  system: string,
  user: string,
  timeout = 30000,
  structuredCheck = false
): Promise<string> {
  if (provider === "anthropic") {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout, maxRetries: 0 });
    const resp = await client.messages.create({
      model: model || "claude-sonnet-5",
      max_tokens: 8000,
      system,
      messages: [{ role: "user", content: user }],
    });
    return resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
  }

  // openai or any OpenAI-compatible endpoint (custom baseURL)
  const client = new OpenAI({
    timeout, maxRetries: 0,
    apiKey:
      provider === "custom"
        ? process.env.CUSTOM_API_KEY
        : process.env.OPENAI_API_KEY,
    baseURL: provider === "custom" ? process.env.CUSTOM_BASE_URL : undefined,
  });
  const resp = await client.chat.completions.create({
    ...(structuredCheck ? {response_format:{type:'json_schema' as const,json_schema:{name:'british_english_check',strict:true,schema:{type:'object',additionalProperties:false,required:['fixes'],properties:{fixes:{type:'array',items:{type:'object',additionalProperties:false,required:['original','replacement','reason'],properties:{original:{type:'string'},replacement:{type:'string'},reason:{type:'string'}}}}}}}}} : {}),
    model: model || (provider === "openai" ? "gpt-5.6-sol" : "gpt-4o"),
    ...(provider === "openai" && /^(gpt-5\.6(?:-(?:sol|terra|luna))?)(?:$|-)/.test(model || "gpt-5.6-sol") ? { reasoning_effort: "none" as const } : {}),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const message=resp.choices[0]?.message;
  if(message?.refusal)throw Object.assign(new Error('Provider declined the language check'),{code:'content_refusal'});
  return message?.content || "";
}


function criticModel(provider:Provider){return provider==='anthropic'?'claude-haiku-4-5-20251001':'gpt-4o-mini';}
export async function critic(script:string,provider:Provider,_model:string,sourceTranscript?:string){
 const raw=objectJson(await complete(provider==='custom'?'openai':provider,criticModel(provider),CRITIC_PROMPT,JSON.stringify({script,sourceTranscript}),30000,true));
 if(!Array.isArray(raw.fixes))throw new Error('Invalid British English check response');
 const fixed=applyCritic(script,raw.fixes,sourceTranscript);return {uk_script:fixed.script,fixes:fixed.fixes};
}
export async function prepareNarration(script:string,_provider:Provider,_model:string,market:Market='uk'){return narration(script,market);}
export async function transcribeWithDuration(file:File):Promise<{text:string;duration?:number}>{
 const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:60000,maxRetries:0});
 const response=await client.audio.transcriptions.create({file,model:'whisper-1',response_format:'verbose_json'});
 return {text:response.text,duration:response.duration};
}
export async function transcribe(file:File){return (await transcribeWithDuration(file)).text;}

export function languageCheckError(error:unknown,index=0){
 const e=error as {status?:number;code?:string;name?:string};
 const part=index===0?'Main script':`Hook ${index}`;
 const reason=e?.status===401||e?.status===403?'Language provider authentication failed.':e?.status===429?'Language provider quota or rate limit reached.':e?.status===404?'Language-check model is unavailable.':e?.status&&e.status>=500?'Language provider is temporarily unavailable.':e?.name==='APIConnectionTimeoutError'?'Language provider timed out.':e?.name==='APIConnectionError'?'Could not connect to the language provider.':e?.code==='content_refusal'?'Language provider declined the check.':'Language provider returned an invalid response.';
 return `${part}: British English check failed. ${reason} Retry localisation; completed video stages are retained.`;
}
