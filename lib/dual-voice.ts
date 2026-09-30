export type DualVoice={voiceId:string;splitAt:number;boundary:string;startSeconds?:number};
export function scriptSentences(script:string){
 const segmenter=new Intl.Segmenter(undefined,{granularity:'sentence'});
 return Array.from(segmenter.segment(script)).map(s=>({start:s.index,text:s.segment.trim()})).filter(s=>s.text);
}
export function dualVoice(input:unknown,script:string,firstVoice:string):DualVoice|undefined{
 if(input===undefined||input===null||input===false)return undefined;
 if(typeof input!=='object')throw Error('Invalid second voice settings.');
 const v=input as Partial<DualVoice>;
 if(typeof v.voiceId!=='string'||!v.voiceId.trim()||v.voiceId===firstVoice)throw Error('Choose a different voice for speaker 2.');
 if(!Number.isSafeInteger(v.splitAt)||!scriptSentences(script).slice(1).some(s=>s.start===v.splitAt)||!script.slice(0,v.splitAt).trim()||!script.slice(v.splitAt).trim())throw Error('Choose the sentence where speaker 2 starts.');
 if(v.boundary!==script.slice(v.splitAt,v.splitAt!+120))throw Error('The script changed at the speaker switch. Select the starting sentence again.');
 if(v.startSeconds!==undefined&&(!Number.isFinite(v.startSeconds)||v.startSeconds<=0||v.startSeconds>3600))throw Error('Speaker start time must be greater than 0 and at most 3600 seconds.');
 return {voiceId:v.voiceId.trim(),splitAt:v.splitAt!,boundary:v.boundary,startSeconds:v.startSeconds};
}
