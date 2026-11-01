import {readFileSync} from 'node:fs';
import path from 'node:path';

export const UK_LOCALISATION_VERSION='uk-owner-2026-10-16';
let document:string|undefined;
/** Owner-supplied linguistic guidance, shared by native ads and UK video localisation. */
export function ukLocalisationGuide(mode:'native'|'video'|'full-video'){
 if(document===undefined){
  let source:string;
  try{source=readFileSync(path.join(process.cwd(),'docs/antki/zasady-lokalizacji-us-uk.md'),'utf8');}
  catch{throw Error('UK localisation rules are unavailable. No provider request was submitted.');}
  if(!source.trim()||source.length>100000)throw Error('Invalid UK localisation rules.');
  document=source;
 }
 const format=mode==='native'
  ? 'VARIANT B: full native UK transcreation for Antki / native Meta text. Rewrite idiom, rhythm and cultural framing naturally; retain the complete story and all substantive content.'
  : mode==='video'
   ? 'VARIANT A: conservative localisation for existing video / voiceover / captions. Preserve sentence order, scene beats, repetitions and approximate spoken length. Only necessary linguistic and authorised product edits.'
   : 'VARIANT B: native UK language for the explicitly selected full-video rewrite. The existing full-localisation depth contract still controls structure and new montage.';
 return `OWNER LOCALISATION UPDATE ${UK_LOCALISATION_VERSION}. The following document supersedes older handbook language/style guidance where they conflict. ${format}
Preserve emotional intensity, pain, promises, urgency and CTA force; do not dilute or soften the advert merely because it is British. Apply the document's four-stage language review: typography, contextual grammar/spelling, semantic/cultural references, then final direct-response transcreation. Return only the output format already requested, not two versions or the document's examples.
The document is linguistic guidance, not source evidence or new facts about the advertised product. Existing confirmed product/brand/offer instructions, factual fidelity and the selected CTA remain binding. Always convert US currency symbols and words ($ -> £, dollars -> pounds), US country references (across the US / in the US / America -> across the UK / in the UK / Britain), US everyday weight comparisons (e.g. two pounds of seeds -> nearly a kilo), US medical/household terms (shower drain -> shower plughole, estrogen -> oestrogen, pediatrician -> paediatrician, mustache -> moustache, 4th grade -> Year 4), and fix obvious Whisper ASR transcription glitches (such as salt palmetto -> saw palmetto, hairline in part -> hairline and parting, dropped past-tense -ed like 'just change the maths' -> 'just changed the maths', or duplicated words like 'fuller hair that keeps building'). Do not copy unrelated case-study details (such as seamless socks, bamboo socks, toe seams, school uniform socks, or Clarks shoes) into an advert for another product. Preserve singing-ad lyrics under their separate exact-lyrics rule. Review notes belong outside copy.
Use spaced en dashes ( – ) instead of em dashes in ordinary UK prose, British times such as 7.15am, contextual spellings such as pyjamas/mum/paediatrician/organise/colour/flavour/behaviour, and trousers for US outerwear pants. Never use Markdown asterisks (** or *) or trademark symbols (™) in ad copy. Preserve literal URLs and code.
<owner-localisation-document>
${document}
</owner-localisation-document>`;
}

