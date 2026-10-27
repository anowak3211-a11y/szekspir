import {permittedRetailFix} from './retail-context';
export type Note = { original: string; replacement: string; reason: string };
export type Gap = { original: string; needed: string };
export interface LocalizeResult {
 no_speech?:boolean;
 uk_script: string; narration: string; hooks: string[]; hook_og: string;
 ad_desire: string; ad_angle: string; unique_mechanism: string;
 funnel: 'TOF'|'MOF'|'BOF'; notes: Note[]; data_gaps: Gap[];
 timing?: { sourceWords:number; targetWords:number; ratio:number; sentenceDelta:number; withinTarget:boolean };
 prompt_version?: string;
 language_check?: {model:string;checkedAt:string};
}
export function objectJson(text:string): Record<string,unknown> {
 const clean=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
 const parsed=JSON.parse(clean);
 if (!parsed || typeof parsed!=='object' || Array.isArray(parsed)) throw new Error('Expected a JSON object');
 return parsed;
}
function str(o:Record<string,unknown>,key:string,allowEmpty=false) {
 if(typeof o[key]!=='string'||(!allowEmpty&&!o[key].trim())) throw new Error(`Invalid ${key}`);
 return o[key] as string;
}
export function opening(script:string) {
 return (script.replace(/\[[^\]]*\]/g,'').trim().match(/[\s\S]*?[.!?](?=\s|$)/)?.[0] || script.split('\n')[0]).trim();
}
export function validateResult(o:Record<string,unknown>,expectedHooks?:number):LocalizeResult {
 const uk_script=str(o,'uk_script'); const narration=str(o,'narration');
 if(!Array.isArray(o.hooks)||(expectedHooks!==undefined?o.hooks.length!==expectedHooks:![0,2,3].includes(o.hooks.length))||o.hooks.some(x=>typeof x!=='string'||!x.trim())) throw new Error('Expected zero or two non-empty alternative hooks (legacy three-hook ads are supported)');
 if(!['TOF','MOF','BOF'].includes(String(o.funnel))) throw new Error('Invalid funnel');
 if(!Array.isArray(o.notes)||!Array.isArray(o.data_gaps))throw new Error('notes and data_gaps must be arrays');
 const notes=o.notes.map(n=>{if(!n||typeof n!=='object')throw new Error('Invalid note');return {original:str(n,'original',true),replacement:str(n,'replacement',true),reason:str(n,'reason')};});
 const data_gaps=o.data_gaps.map(g=>{if(!g||typeof g!=='object')throw new Error('Invalid gap');return {original:str(g,'original'),needed:str(g,'needed')};});
 return {uk_script,narration,hooks:o.hooks as string[],hook_og:opening(uk_script),ad_desire:str(o,'ad_desire'),ad_angle:str(o,'ad_angle'),unique_mechanism:str(o,'unique_mechanism',true),funnel:o.funnel as LocalizeResult['funnel'],notes,data_gaps};
}
export function words(s:string){return (s.replace(/\[[^\]]*\]/g,'').match(/\S+/g)||[]).length;}
export function sentences(s:string){return s.replace(/\[[^\]]*\]/g,'').split(/[.!?]+(?=\s|$)/).filter(x=>x.trim()).length;}
export function timing(source:string,target:string){
 const sourceWords=words(source),targetWords=words(target),ratio=sourceWords?targetWords/sourceWords:0;
 const sentenceDelta=sentences(target)-sentences(source);
 return {sourceWords,targetWords,ratio,sentenceDelta,withinTarget:ratio>=.9&&ratio<=1.1&&Math.abs(sentenceDelta)<=1};
}
export function hasTokens(s:string){return /\[\[(?:CONFIRM|REVIEW)[\s\S]*?\]\]|\[REVIEW REQUIRED:/i.test(s);}
// An allowlist makes the critic a bounded spelling/idiom pass, not an unchecked rewrite.
const PAIRS:Record<string,string>={
 color:'colour',colors:'colours',colored:'coloured',coloring:'colouring',
 flavor:'flavour',flavors:'flavours',flavored:'flavoured',flavoring:'flavouring',
 behavior:'behaviour',behaviors:'behaviours',behavioral:'behavioural',
 favorite:'favourite',favorites:'favourites',
 neighbor:'neighbour',neighbors:'neighbours',neighborhood:'neighbourhood',
 humor:'humour',odor:'odour',odors:'odours',honor:'honour',honored:'honoured',labor:'labour',rumor:'rumour',vapor:'vapour',
 center:'centre',centers:'centres',centered:'centred',fiber:'fibre',fibers:'fibres',liter:'litre',liters:'litres',meter:'metre',meters:'metres',theater:'theatre',
 organize:'organise',organized:'organised',organizing:'organising',organization:'organisation',
 realize:'realise',realized:'realised',realizing:'realising',
 recognize:'recognise',recognized:'recognised',recognizing:'recognising',
 apologize:'apologise',apologized:'apologised',
 prioritize:'prioritise',prioritized:'prioritised',
 normalize:'normalise',normalized:'normalised',normalizing:'normalising',
 optimize:'optimise',optimized:'optimised',
 stabilize:'stabilise',stabilized:'stabilised',stabilizing:'stabilising',
 energize:'energise',energized:'energised',energizing:'energising',
 memorize:'memorise',memorized:'memorised',
 metabolize:'metabolise',metabolized:'metabolised',
 neutralize:'neutralise',neutralized:'neutralised',
 criticize:'criticise',criticized:'criticised',
 summarize:'summarise',specialize:'specialise',specialized:'specialised',
 analyze:'analyse',analyzed:'analysed',analyzing:'analysing',paralyzed:'paralysed',
 defense:'defence',offense:'offence',license:'licence',
 canceled:'cancelled',canceling:'cancelling',traveled:'travelled',traveling:'travelling',traveler:'traveller',
 labeled:'labelled',labeling:'labelling',modeled:'modelled',modeling:'modelling',
 fueled:'fuelled',fueling:'fuelling',refueled:'refuelled',refueling:'refuelling',
 signaled:'signalled',signaling:'signalling',leveled:'levelled',leveling:'levelling',
 skeptical:'sceptical',skeptic:'sceptic',skepticism:'scepticism',
 gray:'grey',cozy:'cosy',cozier:'cosier',mold:'mould',program:'programme',catalog:'catalogue',dialog:'dialogue',
 fulfill:'fulfil',enrollment:'enrolment',installment:'instalment',skillful:'skilful',willful:'wilful',
 jewelry:'jewellery',pajamas:'pyjamas',yogurt:'yoghurt',tire:'tyre',tires:'tyres',curb:'kerb',aluminum:'aluminium',
 mom:'mum',moms:'mums',mommy:'mummy',mommies:'mummies',
 pediatric:'paediatric',pediatrician:'paediatrician',pediatricians:'paediatricians',
 orthopedic:'orthopaedic',orthopedics:'orthopaedics',estrogen:'oestrogen',anemia:'anaemia',diarrhea:'diarrhoea',feces:'faeces',aging:'ageing',
 diaper:'nappy',diapers:'nappies',pacifier:'dummy',pacifiers:'dummies',stroller:'pushchair',strollers:'pushchairs',crib:'cot',daycare:'nursery',
 math:'maths',recess:'breaktime',kindergarten:'reception',
 sneakers:'trainers',sneaker:'trainer',sidewalk:'pavement',sidewalks:'pavements',
 vacation:'holiday',vacations:'holidays',trash:'rubbish',garbage:'rubbish',
 drugstore:'pharmacy',drugstores:'pharmacies',
 closet:'wardrobe',closets:'wardrobes',sweater:'jumper',sweaters:'jumpers',pants:'trousers',undershirt:'vest',bathrobe:'dressing gown',
 faucet:'tap',faucets:'taps',countertop:'worktop',backyard:'back garden',elevator:'lift',apartment:'flat',apartments:'flats',
 flashlight:'torch',candy:'sweets',cookie:'biscuit',cookies:'biscuits',oatmeal:'porridge',popsicle:'ice lolly',popsicles:'ice lollies',
 zucchini:'courgette',eggplant:'aubergine',cilantro:'coriander',arugula:'rocket',
 takeout:'takeaway',mailbox:'letterbox',mailman:'postman',groceries:'shopping',cellphone:'mobile',
 couch:'sofa',nightstand:'bedside table',dresser:'chest of drawers',washcloth:'flannel',comforter:'duvet',
 bangs:'fringe',raincoat:'mac',overalls:'dungarees',suspenders:'braces',pantyhose:'tights',soccer:'football',
 check:'cheque',checks:'cheques',gotten:'got',oftentimes:'often',fall:'autumn',
};
export function applyCritic(script:string,fixes:unknown,sourceTranscript?:string):{script:string;fixes:Note[]}{
 if(!Array.isArray(fixes))return {script,fixes:[]}; const accepted:Note[]=[];
 for(const f of fixes){
  if(!f||typeof f.original!=='string'||typeof f.replacement!=='string')continue;
  const a=f.original,b=f.replacement;
  if((PAIRS[a.toLowerCase()]!==b.toLowerCase() && !permittedRetailFix(sourceTranscript||"",a,b)) || a.length>30)continue;
  const escaped=a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const matches=[...script.matchAll(new RegExp(`\\b${escaped}\\b`,'g'))];
  if(matches.length!==1)continue;
  const at=matches[0].index!;
  const before=script.slice(0,at);
  // Never change a phrase inside an audio tag or product placeholder.
  if(before.lastIndexOf('[')>before.lastIndexOf(']'))continue;
  script=script.slice(0,at)+b+script.slice(at+a.length);
  accepted.push({original:a,replacement:b,reason:String(f.reason||'British spelling')});
 }
 return {script,fixes:accepted};
}

