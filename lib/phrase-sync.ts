import type {WordTime,SyncReport} from './voice-swap-model';
import type {WordSpan} from './word-sync';
export type QuietGap={start:number;end:number};
const normal=(s:string)=>s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
/** Words locate corresponding utterances; cuts are permitted only inside measured silence. */
export function phraseSyncPlan(source:WordTime[],voice:WordTime[],seconds:number,voiceSeconds:number,gaps:QuietGap[]){
 if(!source.length||!voice.length||Math.max(source.length,voice.length)>1200||!Number.isFinite(seconds)||seconds<=0||seconds>300||!Number.isFinite(voiceSeconds)||voiceSeconds<=0||voiceSeconds>600)throw Error('Missing or invalid speech timing.');
 for(const words of [source,voice]){let last=-1;for(const w of words){if(!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<last||w.start<0||w.end<w.start)throw Error('Invalid word timing.');last=w.start;}}
 const a=source.map(w=>normal(w.word)),b=voice.map(w=>normal(w.word)),n=a.length,m=b.length,dp=Array.from({length:n+1},()=>new Uint16Array(m+1));
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=a[i]===b[j]?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
 const matches:{s:number;v:number}[]=[];let i=0,j=0;while(i<n&&j<m){if(a[i]===b[j]){matches.push({s:i++,v:j++});}else if(dp[i+1][j]>=dp[i][j+1])i++;else j++;}
 if(matches.length/Math.max(n,m)<.9)throw Error('Scripts differ too much to match utterances safely.');
 const spans:WordSpan[]=[];let sourceStart=0,voiceStart=0;
 const comfortable=(x:number,y:number)=>x>=1&&y>=1&&y/x>=.6&&y/x<=2.25;
 for(let k=0;k<matches.length-1;k++){
  const cur=matches[k],next=matches[k+1],sw=source[cur.s],sn=source[next.s],vw=voice[cur.v],vn=voice[next.v];
  if(next.s!==cur.s+1||next.v!==cur.v+1||sn.start-sw.end<.25)continue;
  const midpoint=(vw.end+vn.start)/2;
  const quiet=gaps.filter(g=>g.end-g.start>=.12&&g.start>voiceStart+.5&&g.start>=vw.start&&g.end<=vn.end&&Math.abs((g.start+g.end)/2-midpoint)<.4).sort((a,b)=>Math.abs((a.start+a.end)/2-midpoint)-Math.abs((b.start+b.end)/2-midpoint))[0];
  if(!quiet)continue;
  // Keep quiet tails/breaths at each edge. Never cut at a recogniser's word boundary.
  const voiceEnd=quiet.start+.04,nextVoiceStart=quiet.end-.04;
  if(!comfortable(sw.end-sourceStart,voiceEnd-voiceStart)||seconds-sn.start<1||voiceSeconds-nextVoiceStart<1)continue;
  spans.push({sourceStart,sourceEnd:sw.end,voiceStart,voiceEnd});sourceStart=sn.start;voiceStart=nextVoiceStart;
 }
 // Merge a short/extreme ending back into the previous complete utterance.
 while(spans.length&&!comfortable(seconds-sourceStart,voiceSeconds-voiceStart)){const p=spans.pop()!;sourceStart=p.sourceStart;voiceStart=p.voiceStart;}
 if(!comfortable(seconds-sourceStart,voiceSeconds-voiceStart))throw Error('The saved recording cannot fit naturally within this film. No new recording was generated.');
 spans.push({sourceStart,sourceEnd:seconds,voiceStart,voiceEnd:voiceSeconds});
 const tempos=spans.map(p=>(p.voiceEnd-p.voiceStart)/(p.sourceEnd-p.sourceStart));
 const report:SyncReport={matched:matches.length,sourceWords:n,voiceWords:m,pauses:spans.length-1,minTempo:Math.min(...tempos),maxTempo:Math.max(...tempos),method:'phrases-v1',phrases:spans.length};
 return {spans,report};
}
