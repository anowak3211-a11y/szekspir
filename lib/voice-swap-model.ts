export const SWAP_MAX_BYTES=2*1024*1024*1024;
export const SWAP_MAX_SECONDS=300;
export type SwapStatus='queued'|'preparing'|'separating'|'review'|'mixing'|'enhancing'|'delivering'|'done'|'error'|'uncertain';
export type SwapMix={voicePath:string;voiceGain:number;backgroundGain:number;offset:number;approved:true};
export type VoiceSwap={id:string;name:string;sourcePath:string;sourceUrl:string;created:number;updated:number;status:SwapStatus;stage:'prepare'|'separate'|'mix'|'enhance'|'drive'|'sheet';delivery?:{mixKey:string;submitted?:boolean;nextCheckAt?:number;taskId?:string;providerUrl?:string;enhancedUrl?:string;driveFileId?:string;driveUrl?:string;adId?:string;sheetUrl?:string;started:number};leaseUntil?:number;paidIntent?:boolean;separationReceived?:boolean;separationError?:string;archiveUrl?:string;backgroundUrl?:string;vocalsUrl?:string;duration?:number;voiceUrl?:string;mix?:SwapMix;mixKey?:string;outputUrl?:string;error?:string};
export function swapId(value:unknown):string{if(typeof value!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value))throw Error('Invalid Voice Swapper ID.');return value;}
export function swapSourcePath(id:string,path:unknown){if(typeof path!=='string'||!new RegExp(`^sources/${swapId(id)}/source\\.(mp4|mov)$`).test(path))throw Error('Choose an MP4 or MOV video.');return path;}
export function swapMix(input:Record<string,unknown>):SwapMix{
 if(input.approved!==true)throw Error('Listen to and approve the separated background before exporting.');
 if(typeof input.voicePath!=='string'||!/^sources\/[a-f0-9-]{36}\/audio\.(mp3|wav|m4a)$/i.test(input.voicePath))throw Error('Upload the replacement voiceover first.');
 for(const [key,max] of [['voiceGain',2],['backgroundGain',2],['offset',SWAP_MAX_SECONDS]] as const){if(typeof input[key]!=='number'||!Number.isFinite(input[key])||input[key]<0||input[key]>max)throw Error(`Invalid ${key}.`);}
 return {voicePath:input.voicePath,voiceGain:input.voiceGain as number,backgroundGain:input.backgroundGain as number,offset:input.offset as number,approved:true};
}
/** Only background + replacement voice enter the output. Source audio is never mapped. */
export function swapMixFilter(mix:SwapMix,seconds:number){
 if(!Number.isFinite(seconds)||seconds<=0||seconds>SWAP_MAX_SECONDS)throw Error('Invalid video duration.');
 return `[1:a]aresample=48000,volume=${mix.backgroundGain},apad,atrim=duration=${seconds},asetpts=PTS-STARTPTS[bed];[2:a]aresample=48000,volume=${mix.voiceGain},adelay=${Math.round(mix.offset*1000)}:all=1,apad,atrim=duration=${seconds},asetpts=PTS-STARTPTS[voice];[bed][voice]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95:level=false:latency=true,atrim=duration=${seconds}[mix]`;
}
