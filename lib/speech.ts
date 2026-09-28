const small=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
export function numberWords(n:number):string{
 if(!Number.isSafeInteger(n)||n<0||n>=1e12)throw new Error('Number outside supported narration range');
 if(n<20)return small[n];if(n<100)return tens[Math.floor(n/10)]+(n%10?'-'+small[n%10]:'');
 if(n<1000)return small[Math.floor(n/100)]+' hundred'+(n%100?' and '+numberWords(n%100):'');
 for(const [scale,label] of [[1e9,'billion'],[1e6,'million'],[1000,'thousand']] as const){if(n>=scale){const rest=n%scale;return numberWords(Math.floor(n/scale))+' '+label+(rest?(rest<100?' and ':' ')+numberWords(rest):'');}}
 return '';
}
function decimal(s:string){const [a,b]=s.replace(/,/g,'').split('.');return numberWords(Number(a))+(b?' point '+b.split('').map(x=>small[Number(x)]).join(' '):'');}
export function narration(script:string,market:'uk'|'pl'='uk'){
 // Remove only production brackets; unresolved double-bracket tokens are rejected by callers.
 let s=script.replace(/\[[^\]]*\]/g,'').replace(/^\s*(?:scene\s*\d+|visual|b-roll|caption|on-screen text)\s*:.*$/gim,'');
 if(market==='pl')return s.replace(/^\s*(?:scena\s*\d+|ujęcie|napis|tekst na ekranie)\s*:.*$/gim,'').replace(/\n{3,}/g,'\n\n').trim();
 s=s.replace(/£([\d,]+)(?:\.(\d{2}))?/g,(_m,p,c)=>{const pounds=Number(p.replace(/,/g,'')),pence=Number(c||0);return numberWords(pounds)+(pounds===1?' pound':' pounds')+(pence?' and '+numberWords(pence)+(pence===1?' penny':' pence'):'');});
 s=s.replace(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?=\W|$)/gi,(_m,h,m,ap)=>numberWords(Number(h))+(m&&m!=='00'?' '+(Number(m)<10?'oh ':'')+numberWords(Number(m)):'')+' '+(ap.toLowerCase().startsWith('a')?'in the morning':'in the afternoon'));
 s=s.replace(/\b([\d,]+(?:\.\d+)?)\s*(mg|mcg|kg|%)(?=\W|$)/g,(_m,n,u)=>decimal(n)+' '+({mg:'milligrams',mcg:'micrograms',kg:'kilograms','%':'per cent'}[u as string]));
 s=s.replace(/\b\d[\d,]*(?:\.\d+)?\b/g,m=>decimal(m));
 return s.replace(/\n{3,}/g,'\n\n').trim();
}
