import {diffArrays,diffWordsWithSpace} from 'diff';
export type ComparedLine={us:string;uk:string;usParts:{text:string;changed:boolean}[];ukParts:{text:string;changed:boolean}[]};
/** Source/target hard lines retain paragraph blanks; inserted lines do not shift the remaining pairing. */
export function comparedLines(us:string,uk:string):ComparedLine[]{
 const left=us.split('\n'),right=uk.split('\n'),aligned:{us:string;uk:string}[]=[];
 const blocks=diffArrays(left,right,{timeout:1000});
 if(blocks){for(let i=0;i<blocks.length;i++){const block=blocks[i];if(block.removed){const added=blocks[i+1]?.added?blocks[++i].value:[];for(let n=0;n<Math.max(block.value.length,added.length);n++)aligned.push({us:block.value[n]??'',uk:added[n]??''});}else if(block.added){block.value.forEach(line=>aligned.push({us:'',uk:line}));}else block.value.forEach(line=>aligned.push({us:line,uk:line}));}}
 else for(let i=0;i<Math.max(left.length,right.length);i++)aligned.push({us:left[i]??'',uk:right[i]??''});
 return aligned.map((pair)=>{
  const a=pair.us,b=pair.uk,parts=diffWordsWithSpace(a,b,{timeout:100});
  return {us:a,uk:b,usParts:parts?parts.filter(p=>!p.added).map(p=>({text:p.value,changed:!!p.removed})):[{text:a,changed:a!==b}],ukParts:parts?parts.filter(p=>!p.removed).map(p=>({text:p.value,changed:!!p.added})):[{text:b,changed:a!==b}]};
 });
}

/** Whole-text comparison preserves target whitespace and paragraph breaks byte for byte. */
export function highlightedTarget(source:string,target:string):{text:string;changed:boolean}[]{
 const parts=diffWordsWithSpace(source,target,{timeout:1000});
 return parts?parts.filter(p=>!p.removed).map(p=>({text:p.value,changed:!!p.added})):[{text:target,changed:source!==target}];
}

export type ComparisonBlock={text:string;parts:{text:string;changed:boolean}[];anchor:number;separator:boolean};
/** Word alignment maps edited paragraphs back to the original, including inserted/merged paragraphs. */
export function comparisonBlocks(source:string,target:string):ComparisonBlock[]{
 const diff=diffWordsWithSpace(source,target,{timeout:1000});
 let sourceAt=0,targetAt=0;
 const spans:{start:number;end:number;source:number;changed:boolean;text:string}[]=[];
 for(const part of diff||[{value:source,removed:true},{value:target,added:true}]){
  if(part.removed){sourceAt+=part.value.length;continue;}
  spans.push({start:targetAt,end:targetAt+part.value.length,source:sourceAt,changed:!!part.added,text:part.value});
  targetAt+=part.value.length;if(!part.added)sourceAt+=part.value.length;
 }
 const sourceStarts=[0];let at=0;for(const part of source.split(/(\n[ \t]*\n+)/)){if(/^\n[ \t]*\n+$/.test(part))sourceStarts.push(at+part.length);at+=part.length;}
 let cursor=0;
 return target.split(/(\n[ \t]*\n+)/).map(text=>{
  const start=cursor,end=start+text.length;cursor=end;
  const overlap=spans.filter(s=>s.end>start&&s.start<end);
  const match=overlap.find(s=>!s.changed&&/\S/.test(s.text.slice(Math.max(0,start-s.start),end-s.start)))||overlap[0];
  const position=match?match.source+(match.changed?0:Math.max(0,start-match.start)):0;
  let anchor=0;for(let i=1;i<sourceStarts.length&&sourceStarts[i]<=position;i++)anchor=i;
  return {text,anchor,separator:/^\n[ \t]*\n+$/.test(text),parts:overlap.map(s=>({text:s.text.slice(Math.max(0,start-s.start),Math.min(s.text.length,end-s.start)),changed:s.changed}))};
 });
}
