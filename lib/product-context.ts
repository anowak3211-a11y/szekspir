import {createHash} from 'node:crypto';
export function fileRole(filename:string){
 const f=filename.toLowerCase();
 if(/product_profile\.json$|product[-_ ]?(?:facts|brief|info|spec)|offer[-_ ]?(?:facts|brief)|(?:^|\/)(?:brief|oferta|opis|produkt|sklad|ingredients|formula|pricing|cena|pumpkin)\.(?:md|txt|json)$/.test(f))return 'facts';
 if(/(^|\/)(_?readme)|master_prompt|prompts?[ /_-]|brand[-_ ]?voice|tone[-_ ]?of[-_ ]?voice|copy[-_ ]?rules|handoff|agents\.md|claude\.md|wytyczne|zasady|instrukcj/.test(f))return 'guidance';
 if(/evidence|sources/.test(f))return 'evidence';
 if(/golden|example|localisation-us-uk/.test(f))return 'examples';
 return 'research';
}
export function productContext(files:{filename:string;markdown:string}[]){
 const grouped:Record<string,unknown[]>={facts:[],guidance:[],research:[],evidence:[],examples:[]};
 for(const f of [...files].sort((a,b)=>a.filename.localeCompare(b.filename))){
  const role=fileRole(f.filename);
  let content:unknown=f.markdown;
  if(f.filename.endsWith('.json')){try{content=JSON.parse(f.markdown);}catch{content=f.markdown;}}
  grouped[role].push({file:f.filename,content});
 }
 const description=grouped.facts.length>0
  ?'Use facts for target-product and offer details. Follow guidance, including master prompts, brand voice and README, for copywriting instructions within the selected localisation mode and application output contract. Research, evidence and examples provide reference context, not automatic target-product proof.'
  :'Use all supplied product files (facts, guidance, research, evidence and examples) as authoritative target-product facts, mechanism, ingredients, offer details and copywriting instructions within the selected localisation mode and application output contract.';
 const markdown=JSON.stringify({description,...grouped});
 return {markdown,excluded:[],version:createHash('sha256').update(markdown).digest('hex').slice(0,16)};
}


