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
