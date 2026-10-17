import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import {currentWorkspace,requiredAccountEnv} from './account-context';
import {publicAiFetch,validateAiEndpoint} from './public-ai-fetch';
export const BRAIN_PROVIDERS=['openai','anthropic','gemini','custom'] as const;
export type BrainProvider=typeof BRAIN_PROVIDERS[number];
export function brainSettings(){const v=currentWorkspace()?.values;if(!v?.AI_PROVIDER)return;return {provider:v.AI_PROVIDER as BrainProvider,model:v.AI_MODEL,baseURL:v.CUSTOM_BASE_URL};}
export function assertBrain(){const config=brainSettings();requiredAccountEnv(config?({openai:'OPENAI_API_KEY',anthropic:'ANTHROPIC_API_KEY',gemini:'GEMINI_API_KEY',custom:'CUSTOM_API_KEY'}[config.provider]):'OPENAI_API_KEY');if(config&&!config.model)throw Error('Wybierz model w Profil → Mózg AI.');}
/** One selected provider, no automatic retries or fallback to another user's key. */
export function brainClient(options:{apiKey:string;timeout:number;maxRetries:0}){
 const config=brainSettings();if(!config)return new OpenAI(options);
 assertBrain();
 const create=async(params:OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming):Promise<OpenAI.Chat.Completions.ChatCompletion>=>{
  const system=params.messages.filter(m=>m.role==='system'||m.role==='developer').map(m=>m.content).join('\n');
  if(config.provider==='anthropic'){
   const messages:Anthropic.MessageParam[]=params.messages.filter(m=>m.role==='user'||m.role==='assistant').map(m=>({role:m.role as 'user'|'assistant',content:typeof m.content==='string'?m.content:(m.content||[]).map(part=>{if(part.type==='text')return {type:'text' as const,text:part.text};if(part.type==='image_url'){const match=/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(part.image_url.url);if(!match)throw Error('Obraz musi być bezpiecznym podglądem.');return {type:'image' as const,source:{type:'base64' as const,media_type:match[1] as 'image/jpeg',data:match[2]}};}throw Error('Ten typ wiadomości nie jest obsługiwany.');})}));
   const r=await new Anthropic({apiKey:requiredAccountEnv('ANTHROPIC_API_KEY'),timeout:options.timeout,maxRetries:0}).messages.create({model:config.model,max_tokens:params.max_completion_tokens||params.max_tokens||8000,system:system+(params.response_format?'\nReturn only valid JSON, without markdown fences.':''),messages});
   const content=r.content.filter(b=>b.type==='text').map(b=>b.text).join('');
   return {id:r.id,object:'chat.completion',created:Math.floor(Date.now()/1000),model:r.model,choices:[{index:0,finish_reason:r.stop_reason==='end_turn'?'stop':'length',logprobs:null,message:{role:'assistant',content,refusal:null}}]};
  }
  const client=new OpenAI({apiKey:requiredAccountEnv(config.provider==='gemini'?'GEMINI_API_KEY':config.provider==='custom'?'CUSTOM_API_KEY':'OPENAI_API_KEY'),baseURL:config.provider==='gemini'?'https://generativelanguage.googleapis.com/v1beta/openai/':config.provider==='custom'?validateAiEndpoint(config.baseURL).href:undefined,...(config.provider==='custom'?{fetch:publicAiFetch}:{}),timeout:options.timeout,maxRetries:0});
  const {reasoning_effort,max_completion_tokens,max_tokens,...rest}=params;
  return client.chat.completions.create({...rest,model:config.model,...(config.provider==='openai'?{max_completion_tokens:max_completion_tokens||max_tokens,...(reasoning_effort&&/^gpt-[56](?:[.-]|$)/.test(config.model)?{reasoning_effort}:{})}:{max_tokens:max_completion_tokens||max_tokens})});
 };
 return {chat:{completions:{create}}};
}
/** Lazy key lookup: choosing Gemini/Claude never requires an OpenAI key. */
export function brainOptions(timeout:number){const c=brainSettings();assertBrain();return {apiKey:c?'selected-provider':requiredAccountEnv('OPENAI_API_KEY'),timeout,maxRetries:0 as const};}
