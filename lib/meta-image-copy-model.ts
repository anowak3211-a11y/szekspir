import type {UploadDraft} from './meta-uploader-model';

export type ImageCopyInput={accountId:string;imageUrl:string;language:'en-GB'|'image'};
export type ImageCopyResult={primaryText:string;headline:string;description:string;imageText:string;reviewNotes:string[]};
export type ImageCopyState={input:ImageCopyInput;before?:Pick<UploadDraft,'primaryTexts'|'headline'|'headlines'|'description'|'descriptions'>;status:'queued'|'working'|'ready'|'attention';error?:string;reviewNotes?:string[]};
export function validateImageCopy(value:unknown):ImageCopyResult{
 const v=value as Record<string,unknown>;
 if(!v||typeof v!=='object')throw Error('AI did not return complete ad copy.');
 for(const [key,max] of [['primaryText',5000],['headline',80],['description',160],['imageText',8000]] as const){if(typeof v[key]!=='string'||(v[key] as string).length>max||key!=='imageText'&&!(v[key] as string).trim()||/\u0000/.test(v[key] as string))throw Error(`AI returned an invalid ${key}.`);}
 if(!Array.isArray(v.reviewNotes)||v.reviewNotes.length>8||!v.reviewNotes.every(n=>typeof n==='string'&&n.length<=400))throw Error('AI returned invalid review notes.');
 return v as ImageCopyResult;
}
/** Preserve edits made while the image was being read, independently for each field. */
export function applyImageCopy<T extends UploadDraft>(current:T,before:UploadDraft,result:ImageCopyResult):T{
 const next={...current};
 if(JSON.stringify(current.primaryTexts)===JSON.stringify(before.primaryTexts))next.primaryTexts=[result.primaryText];
 if(JSON.stringify([current.headline,current.headlines])===JSON.stringify([before.headline,before.headlines])){next.headline=result.headline;next.headlines=[result.headline];}
 if(JSON.stringify([current.description,current.descriptions])===JSON.stringify([before.description,before.descriptions])){next.description=result.description;next.descriptions=[result.description];}
 return next;
}
