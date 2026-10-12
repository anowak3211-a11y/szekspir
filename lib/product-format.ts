export const GUMMY_FORMAT_INSTRUCTION='The selected target is a gummy product. Replace source rants against gummies with a positive, fact-grounded gummy-format argument, or a convenience critique of pills that children cannot swallow and powders/meltables they refuse. Use sugar-free wording only when supported by the selected target facts. Do not call the target gummy a sweet pretending to be medicine, blame its format for sugar spikes, or carry over claims that gummies fail to reach the brain. Do not move unsupported absorption/sugar claims onto pills or powders. Rewrite only the existing format-criticism passage; keep its position, similar length, all surrounding sentences and the original brand-reveal timing. This is an explicit owner-authorised format edit within Close mode, not permission to rewrite the advert.';

export function hasGummyFormatAttack(text:string):boolean{
 text=text.replace(/\bgumm(?:y|ies)\s+(?:is not|are not|isn't|aren't)\s+(?:a\s+)?(?:sweet|candy)\b[^.!?\n]*\bpretending\s+to\s+be\s+medicine\b/gi,'');
 return /\b(?:a\s+)?gummy\s+is\s+(?:a\s+)?(?:sweet|candy)\b|\bgumm(?:y|ies)\b[^.!?\n]{0,70}\bpretending\s+to\s+be\s+medicine\b|\bgumm(?:y|ies)\s+(?:have|has|need|needs)\s+to\s+survive\s+(?:the\s+)?stomach\b|\bgumm(?:y|ies)\s+(?:don't|do not|never)\s+(?:work|absorb|reach)\b|\bgumm(?:y|ies)\b[^.!?\n]{0,50}\b(?:just|nothing but)\s+(?:sugar|sweets?|candy)\b/i.test(text);
}

/** Exempt only an identifiable source format rant from word-retention checks. */
export function withoutGummyFormatCritique(source:string):string{
 const sentences=[...source.matchAll(/[^.!?]+[.!?]+|[^.!?]+$/g)],ranges:Array<[number,number]>=[];
 const formatTopic=/\bgumm(?:y|ies)|\bsugar|\bsweet|\bstomach|\bpills?\b|\btablets?\b|\bpowders?\b|\bmeltables?\b|\bswallow|\bbottles?\b|\bcupboard\b|\bhalf[- ]used\b|\bwhat you paid\b/i;
 const reveal=/\b(?:this is|meet|introducing|Bloom[ -]?wise|Mellow|SP Nutrition)\b/i;
 for(let i=0;i<sentences.length;i++){
  if(!hasGummyFormatAttack(sentences[i][0]))continue;
  let start=i,end=i;
  if(i&&/\b(?:most|many)\b[^.!?]*\bgumm(?:y|ies)\b|\bcomes?\s+(?:as|in)\s+(?:a\s+)?gummy\b/i.test(sentences[i-1][0])&&!reveal.test(sentences[i-1][0]))start--;
  let count=sentences.slice(start,end+1).join(' ').split(/\s+/).length;
  while(end+1<sentences.length&&formatTopic.test(sentences[end+1][0])&&!reveal.test(sentences[end+1][0])){
   const next=sentences[end+1][0].trim().split(/\s+/).length;if(count+next>120)break;count+=next;end++;
  }
  ranges.push([sentences[start].index!,sentences[end].index!+sentences[end][0].length]);i=end;
 }
 for(const [start,end] of ranges.reverse())source=source.slice(0,start)+' '+source.slice(end);
 return source;
}
