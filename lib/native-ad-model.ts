export const NATIVE_TAB='Native Ads';
export const NATIVE_HEADERS=['Trendtrack ID','Image preview','Advertiser','Word count','Primary text','Primary text · continued 2','Primary text · continued 3','Original image URL','Saved image · Drive','Drive file ID','Meta Ad Library','Landing page','Source status','Days running','Reach','Reach growth · 7d','Estimated spend · EUR','Collation ID','Imported at','Source note'];
export type NativeAd={id:string;advertiser:string;primaryText:string;wordCount:number;imageUrl:string;landingPage:string;status:string;days:number;reach:number;growth7d:number;spend:number;collationId:string};
export type SavedNativeAd=NativeAd&{driveUrl:string;driveFileId:string;sheetUrl:string;row:number};
export function wordCount(text:string){return text.trim()?text.trim().split(/\s+/u).length:0;}
export function nativeImageUrl(value:unknown){
 if(typeof value!=='string')throw Error('Missing original image URL.');
 const u=new URL(value);
 if(u.protocol!=='https:'||u.hostname!=='medias.trendtrack.io'||u.username||u.password||u.port||!/^\/facebook\/image\/[a-f0-9]+\.(jpg|jpeg|png|webp)$/i.test(u.pathname)||u.search||u.hash)throw Error('Use an original Trendtrack Meta image URL.');
 return u.href;
}
function object(value:unknown):Record<string,unknown>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};}
function number(value:unknown){return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:0;}
export function parseNativeExport(input:unknown):NativeAd[]{
 const root=object(input),structured=object(root.structuredContent);
 const rows=Array.isArray(input)?input:Array.isArray(root.data)?root.data:Array.isArray(root.ads)?root.ads:structured.data;
 if(!Array.isArray(rows)||!rows.length||rows.length>50)throw Error('Import 1–50 Trendtrack image ads at a time.');
 const ids=new Set<string>();
 return rows.map(raw=>{
  const a=object(raw),content=object(a.content),media=object(a.media),advertiser=object(a.advertiser),metrics=object(a.metrics);
  const id=String(a.id||'');if(!/^facebook_\d{5,30}$/.test(id)||ids.has(id))throw Error('Invalid or duplicate Trendtrack ad ID.');ids.add(id);
  if(media.type!==undefined&&media.type!=='image')throw Error('Native imports accept image ads only.');
  const primaryText=content.body??a.primaryText;
  if(typeof primaryText!=='string'||!primaryText.trim()||primaryText.length>135000||wordCount(primaryText)>15000)throw Error('Primary text must contain 1–15,000 words and at most 135,000 characters.');
  const landing=String(content.landingPageUrl??a.landingPage??'');if(landing){const u=new URL(landing);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('Invalid landing page URL.');}
  return {id,primaryText,wordCount:wordCount(primaryText),advertiser:String(advertiser.name??a.advertiser??'Unknown').slice(0,300),imageUrl:nativeImageUrl(media.mediaUrl??media.thumbnailUrl??a.imageUrl),landingPage:landing,status:String(a.status||'unknown').slice(0,30),days:number(a.daysRunning??a.days),reach:number(metrics.reach??a.reach),growth7d:number(metrics.reachDelta7d??a.growth7d),spend:number(metrics.estimatedSpend??a.spend),collationId:String(a.collationId||'').slice(0,100)};
 });
}
export function textParts(text:string){let rest=text;const parts:string[]=[];for(let n=0;n<3;n++){let end=Math.min(45000,rest.length);if(end&&/[\uD800-\uDBFF]/.test(rest[end-1]))end--;parts.push(rest.slice(0,end));rest=rest.slice(end);}if(rest)throw Error('Primary text exceeds the Sheet storage limit.');return parts;}
export function nativeRow(ad:NativeAd,fileId:string){return [ad.id,'',ad.advertiser,ad.wordCount,...textParts(ad.primaryText),ad.imageUrl,`https://drive.google.com/file/d/${fileId}/view`,fileId,`https://www.facebook.com/ads/library/?id=${ad.id.slice(9)}`,ad.landingPage,ad.status,ad.days,ad.reach,ad.growth7d,ad.spend,ad.collationId,new Date().toISOString(),'Original research. Reach is not ROAS. Source claims and identities are not verified.'];}
export function nativeFromRow(row:unknown[],index:number,sheetUrl:string):SavedNativeAd{
 const primaryText=[row[4],row[5],row[6]].map(v=>String(v??'')).join('');
 return {id:String(row[0]),advertiser:String(row[2]),primaryText,wordCount:wordCount(primaryText),imageUrl:String(row[7]),driveUrl:String(row[8]),driveFileId:String(row[9]),landingPage:String(row[11]||''),status:String(row[12]),days:Number(row[13]||0),reach:Number(row[14]||0),growth7d:Number(row[15]||0),spend:Number(row[16]||0),collationId:String(row[17]||''),row:index,sheetUrl};
}
