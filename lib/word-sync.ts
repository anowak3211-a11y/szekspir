import type {WordTime,SyncReport} from './voice-swap-model';
export type WordSpan={voiceStart:number;voiceEnd:number;sourceStart:number;sourceEnd:number};
const normal=(s:string)=>s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function valid(words:WordTime[]){if(!words.length||words.length>1200)throw Error('Word tracking is missing or too long.');let last=-1;for(const w of words){if(!normal(w.word)||!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<last||w.end<w.start||w.end>600)throw Error('Word tracking has invalid timing.');last=w.start;}}
/** Monotonic word correspondence. Never infer timing from text length. */
export function wordSyncPlan(source:WordTime[],voice:WordTime[],seconds:number){
 valid(source);valid(voice);if(!Number.isFinite(seconds)||seconds<=0||seconds>300)throw Error('Invalid source duration.');
 const n=source.length,m=voice.length,table=Array.from({length:n+1},()=>new Uint16Array(m+1)),a=source.map(w=>normal(w.word)),b=voice.map(w=>normal(w.word));
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)table[i][j]=a[i]===b[j]?1+table[i+1][j+1]:Math.max(table[i+1][j],table[i][j+1]);
 const matches:{s:number;v:number}[]=[];let i=0,j=0;while(i<n&&j<m){if(a[i]===b[j]){matches.push({s:i,v:j});i++;j++;}else if(table[i+1][j]>=table[i][j+1])i++;else j++;}
 if(matches.length/Math.max(n,m)<.9||matches[0]?.s!==0||matches[0]?.v!==0||matches.at(-1)?.s!==n-1||matches.at(-1)?.v!==m-1)throw Error('Recordings differ too much for reliable word synchronisation. Review both scripts.');
 const spans:WordSpan[]=[];let pauses=0;
 for(let k=0;k<matches.length;){
  const start=matches[k],sw=source[start.s],vw=voice[start.v];let end=k+1;
  // Very short recogniser intervals are joined to the next word instead of cutting phonemes into tiny fragments.
  while(end<matches.length&&(source[matches[end].s].start-sw.start<.07||voice[matches[end].v].start-vw.start<.07))end++;
  const next=matches[end],tail=matches[end-1],se=source[tail.s],ve=voice[tail.v];
  let sourceEnd=next?source[next.s].start:se.end,voiceEnd=next?voice[next.v].start:ve.end;
  if(next&&next.s===tail.s+1&&next.v===tail.v+1&&sourceEnd-se.end>=.18&&se.end-sw.start>=.07&&ve.end-vw.start>=.07){sourceEnd=se.end;voiceEnd=Math.min(voiceEnd,ve.end);pauses++;}
  const target=sourceEnd-sw.start,original=voiceEnd-vw.start;if(target<.01||original<.01)throw Error('Word timing is too uncertain to render safely.');
  const tempo=original/target;if(tempo<.2||tempo>5)throw Error('Local speech speed differs too much. Review the saved take instead of regenerating automatically.');
  if(sourceEnd>seconds+.1)throw Error('Tracked speech extends past the original film.');
  spans.push({voiceStart:vw.start,voiceEnd,sourceStart:sw.start,sourceEnd:Math.min(seconds,sourceEnd)});k=end;
 }
 const tempos=spans.map(p=>(p.voiceEnd-p.voiceStart)/(p.sourceEnd-p.sourceStart));
 const report:SyncReport={matched:matches.length,sourceWords:n,voiceWords:m,pauses,minTempo:Math.min(...tempos),maxTempo:Math.max(...tempos)};
 return {spans,report};
}
