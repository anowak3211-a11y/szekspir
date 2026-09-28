import {jobs} from '@/lib/jobs';
import {transcribe} from '@/lib/localize';
import {scriptSimilarity,normaliseScript} from '@/lib/script-match';
export const maxDuration=180;
export async function POST(req:Request){try{
 const data=await req.formData();let script=String(data.get('script')||'').trim();const file=data.get('audio');
 if(file instanceof File){if(!file.size||file.size>3800000)throw Error('Audio is too long. Paste the script instead.');script=await transcribe(file);}
 if(normaliseScript(script).split(' ').length<10)throw Error('Please provide at least 10 words to compare.');
 if(script.length>100000)throw Error('Script is too long.');
 const saved=(await jobs()).filter(j=>!j.cancelledAt&&(j.transcript||j.result?.us_script||j.result?.uk_script));
 const matches=saved.map(j=>{const source=j.transcript||j.result?.us_script||'',localised=j.result?.uk_script||'';const originalScore=scriptSimilarity(script,source),localScore=scriptSimilarity(script,localised);return {id:j.id,adId:j.adId||'',name:j.name,score:Math.round(Math.max(originalScore,localScore)*100),script:originalScore>=localScore?source:localised,comparedWith:originalScore>=localScore?'Original transcript':'Localised script'};}).filter(m=>m.score>=20).sort((a,b)=>b.score-a.score).slice(0,5);
 return Response.json({script,matches,checked:saved.length},{headers:{'Cache-Control':'no-store'}});
}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
