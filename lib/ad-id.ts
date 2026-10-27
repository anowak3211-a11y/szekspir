export function displayAdId(adId?:string,isImage=false){
 if(!adId)return '';
 return adId.replace(/^MEL-(\d+)$/i,`${isImage?'IMG':'VID'}-$1`);
}

export function cleanVideoTitle(rawName?:string):string{
 if(!rawName)return '';
 const trimmed=rawName.trim();
 if(!trimmed||/^https?:\/\//i.test(trimmed))return '';
 const base=trimmed.split(/[\\/]/).pop()||trimmed;
 const withoutExt=base
  .replace(/\.(?:mp4|mov|webm|m4v|avi|mp3|wav|m4a|jpg|jpeg|png|webp)$/i,'')
  .replace(/\s*\(\d+\)\s*$/,'')
  .replace(/_video_\d+$/i,'')
  .replace(/_+\d+(?:\.\d+)?[km]?_?reach$/i,'')
  .replace(/_+\d+rx$/i,'')
  .trim();
 if(!withoutExt)return '';
 if(/^[0-9a-f]{20,}$/i.test(withoutExt))return '';
 if(/^\d{5,}$/.test(withoutExt))return '';
 if(/^hf_\d{8}_\d{6}_[0-9a-f-]+$/i.test(withoutExt))return '';
 if(/^(?:MEL|VID|IMG)-\d+$/i.test(withoutExt))return '';
 if(/^(?:Ad\s+\d+|Pasted\s+script|New\s+localisation|Native\s+ad)$/i.test(withoutExt))return '';
 return withoutExt.replace(/_+/g,' ').replace(/\s{2,}/g,' ').trim();
}

function cleanHookSnippet(text?:string,maxWords=7):string{
 if(!text)return '';
 const firstLine=text
  .replace(/\[\[(?:CONFIRM|REVIEW)\s*:?\s*([\s\S]*?)\]\]/gi,'$1')
  .replace(/\[[^\]]*\]/g,' ')
  .replace(/["“”'‘’]+/g,'')
  .split(/(?<=[.!?])\s+|\n+/)[0]||'';
 const words=firstLine.trim().split(/\s+/).filter(Boolean);
 if(!words.length)return '';
 const slice=words.slice(0,maxWords).join(' ').replace(/[,:;—–-]+$/,'');
 return words.length>maxWords?`${slice}…`:slice;
}

function isGenericAngle(angle?:string):boolean{
 if(!angle||!angle.trim())return true;
 return /^(?:gemini\s*rip|visual\s*only|general|n\/a|none|target\s+market\s+adaptation|target\s+mechanism)$/i.test(angle.trim());
}

export function shortBriefDescription(input:{sourceName?:string;angle?:string;hookOg?:string;uk?:string}):string{
 const fileTitle=cleanVideoTitle(input.sourceName);
 const rawAngle=(input.angle||'').trim();
 const angle=isGenericAngle(rawAngle)?'':rawAngle;
 const hook=cleanHookSnippet(input.hookOg||input.uk,7);
 if(fileTitle&&angle){
  if(fileTitle.toLowerCase().includes(angle.toLowerCase()))return fileTitle.slice(0,90);
  if(angle.toLowerCase().includes(fileTitle.toLowerCase()))return angle.slice(0,90);
  return `${fileTitle} — ${angle}`.slice(0,90);
 }
 if(fileTitle){
  return (hook&&fileTitle.length<28?`${fileTitle} — ${hook}`:fileTitle).slice(0,90);
 }
 if(angle){
  return (hook&&angle.length<32&&!angle.toLowerCase().includes(hook.toLowerCase().slice(0,12))?`${angle} — ${hook}`:angle).slice(0,90);
 }
 return hook.slice(0,90);
}

export function shortAdDescription(job?:{name?:string;result?:{ad_angle?:string;hook_og?:string;uk_script?:string}|null}|null):string{
 if(!job)return '';
 return shortBriefDescription({
  sourceName:job.name,
  angle:job.result?.ad_angle,
  hookOg:job.result?.hook_og,
  uk:job.result?.uk_script
 });
}

export function formatAdHeading(job?:{adId?:string;nativeAdId?:string;name?:string;result?:{ad_angle?:string;hook_og?:string;uk_script?:string}|null}|null):string{
 if(!job)return 'Localisation';
 const id=displayAdId(job.adId,!!job.nativeAdId);
 const desc=shortAdDescription(job);
 if(id&&desc)return `${id} · ${desc}`;
 if(id)return job.name?`${id} · ${job.name.slice(0,55)}`:id;
 if(desc)return desc;
 return job.name||'Localisation';
}

