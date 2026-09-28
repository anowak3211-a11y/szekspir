import {jobs} from '@/lib/jobs';
import ScriptHistory from './script-history';
export const dynamic='force-dynamic';
export default async function HistoryPage(){
 try{
 const entries=(await jobs()).filter(j=>!j.cancelledAt&&j.result?.uk_script).sort((a,b)=>b.created-a.created).map(j=>({id:j.id,adId:j.adId||'',name:j.name,created:j.created,product:j.productName,source:j.transcript||j.result!.us_script,script:j.result!.uk_script,hooks:j.result!.hooks,history:j.history||[]}));
 return <ScriptHistory entries={entries}/>;
 }catch{return <main className="wrap"><a href="/">← Home</a><h1>Script history</h1><p>Could not load scripts. Please refresh to try again.</p></main>;}
}
