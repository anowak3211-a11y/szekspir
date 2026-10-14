import OpenAI from 'openai';
import {ANTKI_LOCALISATION,faithfulChunk,type AntkiWork} from './antki-model';
export async function localiseAntkiChunk(work:AntkiWork){
 if(!process.env.OPENAI_API_KEY)throw Error('OpenAI is not configured.');
 const i=work.ukChunks.length;
 const response=await new OpenAI({apiKey:process.env.OPENAI_API_KEY,maxRetries:0,timeout:150000}).chat.completions.create({model:process.env.ANTKI_TEXT_MODEL||'gpt-6-sol',reasoning_effort:'low',max_completion_tokens:16000,response_format:{type:'json_object'},messages:[{role:'system',content:ANTKI_LOCALISATION},{role:'user',content:JSON.stringify({headline:i===0?work.sourceHeadline:'',segment:work.chunks[i],previousContext:work.chunks[i-1]?.slice(-1500)||'',nextContext:work.chunks[i+1]?.slice(0,1500)||''})}]});
 const choice=response.choices[0];if(choice?.finish_reason!=='stop'||!choice.message.content||choice.message.refusal)throw Error('Localisation did not return a complete segment.');
 const result=JSON.parse(choice.message.content);if(typeof result.text!=='string'||typeof result.headline!=='string'||result.headline.length>1500||(i===0&&work.sourceHeadline&&!result.headline.trim()))throw Error('Invalid localisation result.');
 return {text:faithfulChunk(work.chunks[i],result.text),headline:work.sourceHeadline?result.headline:''};
}
async function kie(path:string,body?:unknown){
 if(!process.env.KIE_API_KEY)throw Error('Kie image generation is not configured.');
 const response=await fetch('https://api.kie.ai/api/v1/jobs/'+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${process.env.KIE_API_KEY}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(60000),cache:'no-store'});
 const result=await response.json();if(!response.ok||result.code!==200)throw Error(`Kie request failed (${response.status}/${Number(result.code)||'invalid response'}).`);return result.data;
}
export async function submitAntkiImage(work:AntkiWork){const data=await kie('createTask',{model:'gpt-image-2-image-to-image',input:{prompt:work.imagePrompt,input_urls:[work.sourceImage],aspect_ratio:'auto',resolution:'4K'}});if(typeof data?.taskId!=='string'||!data.taskId)throw Error('Kie did not return an image task ID.');return data.taskId as string;}
export async function pollAntkiImage(taskId:string){
 const data=await kie('recordInfo?taskId='+encodeURIComponent(taskId));
 if(data.state==='fail')throw Object.assign(Error('Kie image task failed. Retry submits a new paid image request.'),{code:'antki_image_failed'});
 if(data.state!=='success'){if(!['waiting','queuing','generating'].includes(data.state))throw Error('Unknown Kie task state.');return undefined;}
 const url=JSON.parse(data.resultJson||'{}').resultUrls?.[0];if(typeof url!=='string'||new URL(url).protocol!=='https:')throw Error('Missing generated image.');return url as string;
}
