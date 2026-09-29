import {voiceProcessing, type VoiceProcessing} from './voice-processing';
import {hasTokens} from './validation';
export type AdditionalFile={timing?:import('./vo-cleanup').VoiceTiming;market?:'uk'|'pl';hookIndex?:0|1;provider?:'elevenlabs'|'vmake'|'none';mediaType?:'audio'|'video';sourcePath?:string;vmakeMode?:'enhance'|'remove'|'both';videoStep?:'enhance'|'remove'|'save';taskId?:string;outputUrl?:string;pendingSubmit?:boolean;leaseUntil?:number;id:string;adId:string;editorId:string;label:string;text:string;voiceId:string;voiceName:string;processing:VoiceProcessing;createdAt:number;startedAt?:number;approvedAt?:number;status:'generating'|'draft'|'approved'|'error';url?:string;originalUrl?:string;error?:string};
export type AdditionalState={files:AdditionalFile[]};
export function additionalInput(input:Record<string,unknown>){
 const {adId,editorId,requestId,voiceId}=input;
 if(input.hookIndex!==undefined&&input.hookIndex!==0&&input.hookIndex!==1)throw Error('Choose Hook 1 or Hook 2.');
 const hookIndex=input.hookIndex as 0|1|undefined;
 if(typeof adId!=='string'||!/^MEL-\d+$/.test(adId))throw Error('Choose a valid Ad ID.');
 if(typeof editorId!=='string'||!editorId)throw Error('Choose an editor.');
 if(typeof requestId!=='string'||!/^[-a-f0-9]{36}$/i.test(requestId))throw Error('Invalid recording request.');
 if(typeof voiceId!=='string'||!/^\w{10,100}$/.test(voiceId))throw Error('Choose a voice.');
 if(typeof input.text!=='string'||!input.text.trim()||input.text.length>15000)throw Error('Enter a script of up to 15,000 characters.');
 if(hasTokens(input.text))throw Error('Fill in missing details before recording.');
 const label=typeof input.label==='string'?input.label.trim():'';
 if(!label||label.length>100||/[\r\n]/.test(label))throw Error('Enter a file name of up to 100 characters.');
 return {adId,editorId,requestId,voiceId,hookIndex,text:input.text.trim(),label,processing:voiceProcessing(input.processing)};
}
export function appendAdditionalLink(previous:string,file:Pick<AdditionalFile,'url'|'label'|'createdAt'>){
 if(!file.url||!/^https:\/\/\S+$/.test(file.url))throw Error('Recording is not ready.');
 const urls: string[]=previous.match(/https:\/\/[^\s]+/g)||[];
 if(urls.includes(file.url))return previous;
 const line=`${file.label} · ${new Date(file.createdAt).toISOString().slice(0,10)}: ${file.url}`;
 const next=[previous.trim(),line].filter(Boolean).join('\n');
 if(next.length>45000)throw Error('Additional files column is full.');
 return next;
}
export function additionalLinkRuns(text:string){
 const runs:{startIndex:number;format:{link?:{uri:string}}}[]=[];
 for(const m of text.matchAll(/https:\/\/[^\s]+/g)){runs.push({startIndex:m.index!,format:{link:{uri:m[0]}}});if(m.index!+m[0].length<text.length)runs.push({startIndex:m.index!+m[0].length,format:{}});}
 return runs;
}

export function mergeAdditionalLinks(a:string,b:string){return [...new Set([...a.split('\n'),...b.split('\n')].map(s=>s.trim()).filter(Boolean))].join('\n');}

export function additionalUploadInput(input:Record<string,unknown>){
 const {adId,editorId,requestId,provider,sourcePath,vmakeMode}=input;
 if(typeof adId!=='string'||!/^MEL-\d+$/.test(adId)||typeof editorId!=='string'||!editorId)throw Error('Choose a valid task.');
 if(typeof requestId!=='string'||!/^[-a-f0-9]{36}$/i.test(requestId))throw Error('Invalid request.');
 if(provider!=='vmake'&&provider!=='none')throw Error('Choose a processing option.');
 if(typeof sourcePath!=='string'||!/^sources\/[a-f0-9-]{36}\/source\.(mp4|mov|webm|mp3|m4a|wav)$/i.test(sourcePath))throw Error('Upload a supported video or audio file.');
 const mediaType=/\.(mp4|mov|webm)$/i.test(sourcePath)?'video' as const:'audio' as const;
 if(provider==='vmake'&&(mediaType!=='video'||!['enhance','remove','both'].includes(String(vmakeMode))))throw Error('Choose a video and VMake mode.');
 const label=typeof input.label==='string'?input.label.trim():'';
 if(!label||label.length>100||/[\r\n]/.test(label))throw Error('Enter a file name of up to 100 characters.');
 return {adId,editorId,requestId,provider:provider as 'vmake'|'none',sourcePath,mediaType,label,vmakeMode:provider==='vmake'?vmakeMode as 'enhance'|'remove'|'both':undefined};
}
