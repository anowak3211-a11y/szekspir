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
 type Point={s:number;v:number};
 function run(first:number,last:number,next?:{s:number;v:number}){
  const begin=matches[first],tail=matches[last],sw=source[begin.s],vw=voice[begin.v];
  const finish:Point={s:Math.min(seconds,source[tail.s].end),v:Math.min(voice[tail.v].end,next?voice[next.v].start:Infinity)};
  const points:Point[]=[{s:sw.start,v:vw.start}];
  const reliable=(a:Point,b:Point)=>{const x=b.s-a.s,y=b.v-a.v,r=y/x;return x>=.1&&y>=.1&&r>=.33&&r<=3.5;};
  // Whisper can assign several words the same instant. Retain those words in a
  // larger speech interval instead of inventing individual timestamps or dropping audio.
  for(let k=first+1;k<=last;k++){
   const match=matches[k],point={s:source[match.s].start,v:voice[match.v].start};
   if(reliable(points.at(-1)!,point))points.push(point);
  }
  while(points.length>1&&!reliable(points.at(-1)!,finish))points.pop();
  if(!reliable(points.at(-1)!,finish))throw Error('Speech interval timing is too uncertain. Review the saved tracking; no recording was repeated.');
  points.push(finish);
  for(let k=0;k<points.length-1;k++)spans.push({voiceStart:points[k].v,voiceEnd:points[k+1].v,sourceStart:points[k].s,sourceEnd:points[k+1].s});
 }
 let first=0;
 for(let k=0;k<matches.length-1;k++){
  const current=matches[k],next=matches[k+1];
  if(next.s===current.s+1&&next.v===current.v+1&&source[next.s].start-source[current.s].end>=.18){run(first,k,next);pauses++;first=k+1;}
 }
 run(first,matches.length-1);
 if(spans.some(p=>p.sourceEnd>seconds+.1))throw Error('Tracked speech extends past the original film.');
 const tempos=spans.map(p=>(p.voiceEnd-p.voiceStart)/(p.sourceEnd-p.sourceStart));
 const report:SyncReport={matched:matches.length,sourceWords:n,voiceWords:m,pauses,minTempo:Math.min(...tempos),maxTempo:Math.max(...tempos)};
 return {spans,report};
}
