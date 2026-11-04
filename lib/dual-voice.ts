export type ThirdSpeaker={voiceId:string;splitAt:number;boundary:string;endAt?:number;endBoundary?:string;startSeconds?:number;endSeconds?:number};
export type DualVoice={voiceId:string;splitAt:number;boundary:string;endAt?:number;endBoundary?:string;startSeconds?:number;endSeconds?:number;speaker3?:ThirdSpeaker};
export type SpeakerSegment={speakerNumber:1|2|3;voiceId:string;text:string;startOffset:number;endOffset:number;startSeconds?:number;endSeconds?:number;targetDurationSeconds?:number};

export function scriptSentences(script:string){
 const segmenter=new Intl.Segmenter(undefined,{granularity:'sentence'});
 return Array.from(segmenter.segment(script)).map(s=>({start:s.index,text:s.segment.trim()})).filter(s=>s.text);
}

export function parseTimecode(raw:string|number|undefined|null):number|undefined{
 if(raw===undefined||raw===null)return undefined;
 if(typeof raw==='number')return Number.isFinite(raw)?raw:undefined;
 const trimmed=raw.trim();
 if(!trimmed)return undefined;
 const mmss=trimmed.match(/^(\d+):(\d{1,2}(?:[.,]\d+)?)$/);
 if(mmss){
  const mins=Number(mmss[1]),secs=Number(mmss[2].replace(',','.'));
  if(!Number.isFinite(mins)||!Number.isFinite(secs)||secs>=60)return undefined;
  return Math.round((mins*60+secs)*100)/100;
 }
 const num=Number(trimmed.replace(',','.').replace(/s$/i,''));
 return Number.isFinite(num)?Math.round(num*100)/100:undefined;
}

export function formatTimecode(seconds?:number):string{
 if(seconds===undefined||!Number.isFinite(seconds)||seconds<0)return '';
 const mins=Math.floor(seconds/60);
 const rem=Math.round((seconds-mins*60)*10)/10;
 const whole=Math.floor(rem);
 const frac=Math.round((rem-whole)*10);
 return `${mins}:${String(whole).padStart(2,'0')}${frac?`.${frac}`:''}`;
}

export function estimateSentenceTimings(script:string,totalDurationSeconds?:number){
 const list=scriptSentences(script);
 const wordCounts=list.map(s=>s.text.split(/\s+/).filter(Boolean).length||1);
 const totalWords=wordCounts.reduce((a,b)=>a+b,0)||1;
 const totalSec=totalDurationSeconds&&Number.isFinite(totalDurationSeconds)&&totalDurationSeconds>0?totalDurationSeconds:Math.max(5,totalWords/2.6);
 let elapsed=0;
 return list.map((s,idx)=>{
  const dur=(wordCounts[idx]/totalWords)*totalSec;
  const estStartSec=Math.round(elapsed*10)/10;
  elapsed+=dur;
  const estEndSec=Math.round(elapsed*10)/10;
  const nextStart=list[idx+1]?.start??script.length;
  return {...s,index:idx,nextStart,estStartSec,estEndSec};
 });
}

export function findSentencesForTimeRange(script:string,fromSec?:number,toSec?:number,totalDurationSeconds?:number){
 const timed=estimateSentenceTimings(script,totalDurationSeconds);
 if(timed.length<2)return undefined;
 const candidates=timed.slice(1);
 let startSentence=candidates[0];
 if(fromSec!==undefined&&Number.isFinite(fromSec)&&fromSec>0){
  startSentence=candidates.reduce((best,cur)=>Math.abs(cur.estStartSec-fromSec)<Math.abs(best.estStartSec-fromSec)?cur:best,candidates[0]);
 }
 let endSentence:typeof timed[number]|undefined;
 if(toSec!==undefined&&Number.isFinite(toSec)&&toSec>(fromSec??0)){
  const afterStart=timed.filter(s=>s.start>startSentence.start);
  if(afterStart.length){
   const totalEst=timed[timed.length-1].estEndSec;
   if(toSec<totalEst-1){
    endSentence=afterStart.reduce((best,cur)=>Math.abs(cur.estStartSec-toSec)<Math.abs(best.estStartSec-toSec)?cur:best,afterStart[0]);
   }
  }
 }
 return {
  splitAt:startSentence.start,
  boundary:script.slice(startSentence.start,startSentence.start+120),
  endAt:endSentence?.start,
  endBoundary:endSentence?script.slice(endSentence.start,endSentence.start+120):undefined,
 };
}

export function dualVoice(input:unknown,script:string,firstVoice:string):DualVoice|undefined{
 if(input===undefined||input===null||input===false)return undefined;
 if(typeof input!=='object')throw Error('Invalid second voice settings.');
 const v=input as Partial<DualVoice>;
 const allSentences=scriptSentences(script);
 const sentences=allSentences.slice(1);
 if(typeof v.voiceId!=='string'||!v.voiceId.trim()||v.voiceId===firstVoice)throw Error('Choose a different voice for speaker 2.');
 if(!Number.isSafeInteger(v.splitAt)||!sentences.some(s=>s.start===v.splitAt)||!script.slice(0,v.splitAt).trim()||!script.slice(v.splitAt).trim())throw Error('Choose the sentence where speaker 2 starts.');
 if(v.boundary!==script.slice(v.splitAt,v.splitAt!+120))throw Error('The script changed at the speaker switch. Select the starting sentence again.');
 if(v.startSeconds!==undefined&&(!Number.isFinite(v.startSeconds)||v.startSeconds<=0||v.startSeconds>3600))throw Error('Speaker start time must be greater than 0 and at most 3600 seconds.');
 if(v.endSeconds!==undefined&&(!Number.isFinite(v.endSeconds)||v.endSeconds<=0||v.endSeconds>3600||(v.startSeconds!==undefined&&v.endSeconds<=v.startSeconds)))throw Error('Speaker 2 end time must be greater than its start time and at most 3600 seconds.');

 let endAt:number|undefined;
 let endBoundary:string|undefined;
 if(v.endAt!==undefined&&v.endAt!==null){
  if(!Number.isSafeInteger(v.endAt)||v.endAt<=v.splitAt!||!sentences.some(s=>s.start===v.endAt)||!script.slice(v.splitAt!,v.endAt).trim()||!script.slice(v.endAt).trim())throw Error('Choose a valid sentence where speaker 2 ends.');
  const expectedEndBoundary=script.slice(v.endAt,v.endAt+120);
  if(v.endBoundary!==undefined&&v.endBoundary!==expectedEndBoundary)throw Error('The script changed at the speaker 2 ending sentence. Select it again.');
  endAt=v.endAt;
  endBoundary=expectedEndBoundary;
 }

 let speaker3:ThirdSpeaker|undefined;
 if(v.speaker3!==undefined&&v.speaker3!==null){
  if(typeof v.speaker3!=='object')throw Error('Invalid speaker 3 settings.');
  const s3=v.speaker3 as Partial<ThirdSpeaker>;
  if(typeof s3.voiceId!=='string'||!s3.voiceId.trim()||s3.voiceId===firstVoice)throw Error('Choose a different voice for speaker 3.');
  const minStart=endAt??v.splitAt!;
  if(!Number.isSafeInteger(s3.splitAt)||s3.splitAt!<=v.splitAt!||s3.splitAt!<minStart||!sentences.some(s=>s.start===s3.splitAt)||!script.slice(s3.splitAt!).trim())throw Error('Choose a valid sentence where speaker 3 starts.');
  const expectedS3Boundary=script.slice(s3.splitAt!,s3.splitAt!+120);
  if(s3.boundary!==expectedS3Boundary)throw Error('The script changed at speaker 3 switch. Select the starting sentence again.');
  if(s3.startSeconds!==undefined&&(!Number.isFinite(s3.startSeconds)||s3.startSeconds<=0||s3.startSeconds>3600||(v.endSeconds!==undefined&&s3.startSeconds<v.endSeconds)||(v.startSeconds!==undefined&&s3.startSeconds<=v.startSeconds)))throw Error('Speaker 3 start time must be after speaker 2 and at most 3600 seconds.');
  if(s3.endSeconds!==undefined&&(!Number.isFinite(s3.endSeconds)||s3.endSeconds<=0||s3.endSeconds>3600||(s3.startSeconds!==undefined&&s3.endSeconds<=s3.startSeconds)))throw Error('Speaker 3 end time must be greater than its start time and at most 3600 seconds.');
  let s3EndAt:number|undefined;
  let s3EndBoundary:string|undefined;
  if(s3.endAt!==undefined&&s3.endAt!==null){
   if(!Number.isSafeInteger(s3.endAt)||s3.endAt<=s3.splitAt!||!sentences.some(s=>s.start===s3.endAt)||!script.slice(s3.splitAt!,s3.endAt).trim()||!script.slice(s3.endAt).trim())throw Error('Choose a valid sentence where speaker 3 ends.');
   const expEnd=script.slice(s3.endAt,s3.endAt+120);
   if(s3.endBoundary!==undefined&&s3.endBoundary!==expEnd)throw Error('The script changed at speaker 3 ending sentence. Select it again.');
   s3EndAt=s3.endAt;
   s3EndBoundary=expEnd;
  }
  speaker3={
   voiceId:s3.voiceId.trim(),
   splitAt:s3.splitAt!,
   boundary:expectedS3Boundary,
   ...(s3EndAt!==undefined?{endAt:s3EndAt,endBoundary:s3EndBoundary}:{}),
   ...(s3.startSeconds!==undefined?{startSeconds:s3.startSeconds}:{}),
   ...(s3.endSeconds!==undefined?{endSeconds:s3.endSeconds}:{}),
  };
 }

 const out:DualVoice={
  voiceId:v.voiceId.trim(),
  splitAt:v.splitAt!,
  boundary:v.boundary,
  startSeconds:v.startSeconds,
 };
 if(endAt!==undefined){out.endAt=endAt;out.endBoundary=endBoundary;}
 if(v.endSeconds!==undefined)out.endSeconds=v.endSeconds;
 if(speaker3!==undefined)out.speaker3=speaker3;
 return out;
}

export function resolveSpeakerSegments(script:string,firstVoice:string,settings:DualVoice):SpeakerSegment[]{
 const s2Start=settings.splitAt;
 const s2End=settings.endAt??settings.speaker3?.splitAt??script.length;
 const s2EndSec=settings.endSeconds??(s2End===settings.speaker3?.splitAt?settings.speaker3?.startSeconds:undefined);
 const segments:SpeakerSegment[]=[];

 // Segment 0: Speaker 1 intro
 segments.push({
  speakerNumber:1,
  voiceId:firstVoice,
  text:script.slice(0,s2Start).trim(),
  startOffset:0,
  endOffset:s2Start,
  startSeconds:0,
  endSeconds:settings.startSeconds,
  targetDurationSeconds:settings.startSeconds,
 });

 // Segment 1: Speaker 2
 segments.push({
  speakerNumber:2,
  voiceId:settings.voiceId,
  text:script.slice(s2Start,s2End).trim(),
  startOffset:s2Start,
  endOffset:s2End,
  startSeconds:settings.startSeconds,
  endSeconds:s2EndSec,
  targetDurationSeconds:settings.startSeconds!==undefined&&s2EndSec!==undefined&&s2EndSec>settings.startSeconds?s2EndSec-settings.startSeconds:undefined,
 });

 if(settings.speaker3){
  const s3=settings.speaker3;
  const s3Start=s3.splitAt;
  const s3End=s3.endAt??script.length;
  // Optional bridge where Speaker 1 returns between Speaker 2 and Speaker 3
  if(s2End<s3Start&&script.slice(s2End,s3Start).trim()){
   segments.push({
    speakerNumber:1,
    voiceId:firstVoice,
    text:script.slice(s2End,s3Start).trim(),
    startOffset:s2End,
    endOffset:s3Start,
    startSeconds:settings.endSeconds,
    endSeconds:s3.startSeconds,
    targetDurationSeconds:settings.endSeconds!==undefined&&s3.startSeconds!==undefined&&s3.startSeconds>settings.endSeconds?s3.startSeconds-settings.endSeconds:undefined,
   });
  }
  // Speaker 3 segment
  segments.push({
   speakerNumber:3,
   voiceId:s3.voiceId,
   text:script.slice(s3Start,s3End).trim(),
   startOffset:s3Start,
   endOffset:s3End,
   startSeconds:s3.startSeconds,
   endSeconds:s3.endSeconds,
   targetDurationSeconds:s3.startSeconds!==undefined&&s3.endSeconds!==undefined&&s3.endSeconds>s3.startSeconds?s3.endSeconds-s3.startSeconds:undefined,
  });
  // Optional return to Speaker 1 after Speaker 3
  if(s3End<script.length&&script.slice(s3End).trim()){
   segments.push({
    speakerNumber:1,
    voiceId:firstVoice,
    text:script.slice(s3End).trim(),
    startOffset:s3End,
    endOffset:script.length,
    startSeconds:s3.endSeconds,
   });
  }
 }else if(s2End<script.length&&script.slice(s2End).trim()){
  // Speaker 1 returns after Speaker 2 finishes (e.g. after 1:20)
  segments.push({
   speakerNumber:1,
   voiceId:firstVoice,
   text:script.slice(s2End).trim(),
   startOffset:s2End,
   endOffset:script.length,
   startSeconds:settings.endSeconds,
  });
 }

 return segments.filter(seg=>seg.text.length>0);
}

