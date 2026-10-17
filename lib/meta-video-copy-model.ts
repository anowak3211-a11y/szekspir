import {numericId,publicHttps} from './meta-uploader-model';
import type {ImageCopyState} from './meta-image-copy-model';
export type VideoCopyInput={kind:'video';accountId:string;videoUrl:string;language:'en-GB'|'source';variants:3;generationId?:string};
export type VideoCopyState=Omit<ImageCopyState,'input'>&{input:VideoCopyInput};
export function videoCopyInput(raw:unknown):VideoCopyInput{
 const v=raw as VideoCopyInput;
 if(!v||v.kind!=='video'||!['en-GB','source'].includes(v.language)||v.variants!==3)throw Error('Choose three video copy variants.');
 if(v.generationId!==undefined&&!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v.generationId))throw Error('Invalid copy generation request.');
 return {kind:'video',accountId:numericId(String(v.accountId).replace(/^act_/,''),'account'),videoUrl:publicHttps(v.videoUrl,'video URL'),language:v.language,variants:3,...(v.generationId?{generationId:v.generationId}:{})};
}
/** Match actual saved media, never a guessed MEL number or a filename. */
export function savedVideoScript(videoUrl:string,rows:{sourceUrl:string;resolvedVideoUrl?:string;videoOutputUrl?:string;cleanUrl?:string;enhancedSavedUrl?:string;enhancedUrl?:string;driveUrl?:string;transcript?:string;result?:{us_script?:string;video_url?:string}}[]){
 for(const job of rows){
  if(![job.sourceUrl,job.resolvedVideoUrl,job.videoOutputUrl,job.cleanUrl,job.enhancedSavedUrl,job.enhancedUrl,job.driveUrl,job.result?.video_url].includes(videoUrl))continue;
  const text=(job.transcript||job.result?.us_script||'').trim();if(text)return text;
 }
 return '';
}
