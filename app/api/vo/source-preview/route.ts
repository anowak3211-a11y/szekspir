import {accountRoute} from '@/lib/account-route';
import {createHash} from 'node:crypto';
import {getJob} from '@/lib/jobs';
import {generateVO} from '@/lib/elevenlabs';
import {sourcePace,paceSample,spokenWords} from '@/lib/source-pace';
import {voiceProcessing,v4RecordingSettings,voiceoverCreation,pauseShorteningMs,voiceTempoFactor} from '@/lib/voice-processing';
import {mutate,readState} from '@/lib/store';
import {putMedia} from '@/lib/media';
import type {VoiceTiming} from '@/lib/vo-cleanup';
export const maxDuration=300;
type Sample={url:string;original:string;text:string;seconds:number;targetSeconds?:number;speed:number;variant:'source'|'storytelling';paceAdjustment?:VoiceTiming['paceAdjustment']};
type State={started?:boolean;sample?:Sample};
async function accountPOST(req:Request){try{
 const b=await req.json();if(typeof b.id!=='string'||typeof b.voiceId!=='string'||typeof b.script!=='string'||b.script.length>20000)throw Error('Choose a saved script and voice.');
 const job=await getJob(b.id);if(!job?.result||job.abortedAt||job.cancelledAt)throw Error('Saved job unavailable.');
 if(b.variant==='faster')throw Error('Eleven v4 does not support the faster-delivery preview. Use the natural v4 preview.');
 if(b.variant==='breaths30')throw Error('Breathing previews have been removed. Use the script preview.');
 const processing={...v4RecordingSettings(voiceProcessing(b.processing??job.voiceProcessing)),ambience:'none' as const};
 const variant=voiceoverCreation(processing);
 const pace=sourcePace(job,b.script,b.voiceId,processing);if(variant==='source'&&!pace)throw Error('Source speech duration is unavailable for this recording.');
 const text=paceSample(b.script,45);if(spokenWords(text)<5)throw Error('Add a longer script.');
 const cacheProcessing=[processing.mode,processing.normalize,processing.matchSourcePace,processing.breaths,processing.emotion,processing.openingReaction,processing.ambience,pauseShorteningMs(processing),voiceTempoFactor(processing)];
 const key=createHash('sha256').update(JSON.stringify(['v4-voice-creation-preview-v6-adjustable',b.voiceId,text,cacheProcessing,pace])).digest('hex');
 const stateKey='pace-preview-'+key;
 const cached=(await readState<State>(stateKey,{})).value;if(cached.sample)return Response.json(cached.sample);
 const claim=await mutate<State,Sample|undefined>(stateKey,{},s=>{if(s.sample)return s.sample;if(s.started)throw Error('This sample is already being prepared or was interrupted. No paid request has been repeated.');s.started=true;return undefined;});
 if(claim)return Response.json(claim);
 let timing:VoiceTiming|undefined,original='';
 const samplePace=pace?{...pace,speed:1,calibrated:false,targetSeconds:pace.targetSeconds*spokenWords(text)/pace.scriptWords,scriptWords:spokenWords(text)}:undefined;
 const audio=await generateVO(text,b.voiceId,async(raw,t)=>{timing=t;original=await putMedia(`vo/pace-${key}-original.mp3`,Buffer.from(raw),'audio/mpeg');},processing,'voiceover',job.market,samplePace);
 if(!timing)throw Error('Sample timing unavailable.');
 const url=await putMedia(`vo/pace-${key}.wav`,Buffer.from(audio),'audio/wav');
 const sample:Sample={url,original,text,seconds:timing.trimmedSeconds,...(samplePace?{targetSeconds:samplePace.targetSeconds}:{}),speed:1,variant,...(timing.paceAdjustment?{paceAdjustment:timing.paceAdjustment}:{})};
 await mutate<State,void>(stateKey,{},s=>{s.sample=sample;});return Response.json(sample);
}catch(e){return Response.json({error:(e as Error).message},{status:400});}}

export const POST=accountRoute(accountPOST);
