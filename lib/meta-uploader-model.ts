export type UploadMedia={kind:'library';videoId:string}|{kind:'video'|'image';url:string;filename:string};
export type UploadAd={key:string;name:string;accountId:string;campaignId:string;adSetId:string;pageId:string;url:string;cta:'SHOP_NOW'|'LEARN_MORE';primaryTexts:string[];headline:string;description:string;media:UploadMedia};
export type UploadDraft=Partial<Omit<UploadAd,'media'>>&{media?:UploadMedia};
export type UploadPhase='media'|'transfer'|'finish'|'processing'|'creative'|'ad'|'verify'|'done';
export type UploadItem={id:string;ad:UploadAd;fingerprint:string;phase:UploadPhase;status:'queued'|'working'|'waiting'|'attention'|'complete'|'cancelled';created:number;updated:number;videoId?:string;imageHash?:string;thumbnailUrl?:string;creativeId?:string;metaAdId?:string;pending?:string;error?:string;attempts:number;lease?:string;leaseUntil?:number;nextAttempt?:number;verifiedAt?:number;reused?:boolean;transfer?:{sessionId:string;fileId:string;size:number;start:number;end:number;checksum:string}};
export type UploadBatch={id:string;name:string;created:number;items:string[];status:'draft'|'running'|'paused'|'finished'};
export function numericId(value:unknown,label='ID'){const s=String(value??'');if(!/^\d{5,30}$/.test(s))throw Error(`Invalid ${label}.`);return s;}
export function publicHttps(value:unknown,label='URL'){
 if(typeof value!=='string'||value.length>4096)throw Error(`Invalid ${label}.`);
 let u:URL;try{u=new URL(value);}catch{throw Error(`Invalid ${label}.`);}
 if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname.includes('.')||/^(localhost|.*\.localhost|.*\.local|127\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname))throw Error(`Use a public HTTPS ${label}.`);
 return value; // Preserve the approved URL literally, including its parameters.
}
function text(value:unknown,label:string,max:number,required=true){if(typeof value!=='string'||value.length>max||required&&!value.trim()||/\u0000/.test(value))throw Error(`Invalid ${label}.`);return value;}
export function parseUploadAd(raw:unknown):UploadAd{
 const a=raw as Record<string,unknown>;if(!a||typeof a!=='object'||Array.isArray(a))throw Error('Invalid advert.');
 const primary=a.primaryTexts;if(!Array.isArray(primary)||primary.length<1||primary.length>5)throw Error('Supply 1–5 primary texts.');
 const primaryTexts=primary.map((v,i)=>text(v,`primary text ${i+1}`,5000));
 if(new Set(primaryTexts).size!==primaryTexts.length)throw Error('Primary text variants must be distinct.');
 const m=a.media as Record<string,unknown>;let media:UploadMedia;
 if(m?.kind==='library')media={kind:'library',videoId:numericId(m.videoId,'Video ID')};
 else if(m?.kind==='video'||m?.kind==='image')media={kind:m.kind,url:publicHttps(m.url,'media URL'),filename:text(m.filename,'filename',240)};
 else throw Error('Choose an original video, image or account-library Video ID.');
 if(media.kind!=='library'&&/[\r\n/\\]/.test(media.filename))throw Error('Use a filename without path separators.');
 if(a.cta!=='SHOP_NOW'&&a.cta!=='LEARN_MORE')throw Error('Choose Shop now or Learn more.');
 return {key:text(a.key,'source key',160),name:text(a.name,'ad name',240),accountId:numericId(String(a.accountId||'').replace(/^act_/,''),'account'),campaignId:numericId(a.campaignId,'campaign'),adSetId:numericId(a.adSetId,'ad set'),pageId:numericId(a.pageId,'Page'),url:publicHttps(a.url,'destination URL'),cta:a.cta,primaryTexts,headline:text(a.headline,'headline',255),description:text(a.description??'','description',255,false),media};
}

// RFC-style quoted cells retain tabs, CRLF and hard paragraphs inside text.
export function parseDelimited(raw:string,separator='\t'):string[][]{
 if(raw.length>3_000_000)throw Error('Import is too large.');const rows:string[][]=[],row:string[]=[];let cell='',quoted=false;
 for(let i=0;i<raw.length;i++){const c=raw[i];if(c==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++;}else if(!cell||quoted)quoted=!quoted;else cell+=c;}
 else if(c===separator&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&raw[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))rows.push([...row]);row.length=0;cell='';}else cell+=c;}
 if(quoted)throw Error('Unclosed quoted cell.');row.push(cell);if(row.some(v=>v!==''))rows.push(row);if(rows.length>301)throw Error('Import at most 300 adverts.');return rows;
}
export function draftsFromTable(rows:unknown[][]):UploadDraft[]{
 const headers=(rows[0]||[]).map(v=>String(v).trim().toLowerCase());if(new Set(headers.filter(Boolean)).size!==headers.filter(Boolean).length)throw Error('Duplicate column headers.');
 const get=(row:unknown[],...names:string[])=>{for(const n of names){const i=headers.indexOf(n);if(i>=0)return String(row[i]??'');}return '';};
 if(!headers.includes('ad id')&&!headers.includes('name'))throw Error('Import needs an Ad ID or Name column.');
 return rows.slice(1).filter(r=>r.some(v=>String(v??'').trim())).map(r=>{
  const name=get(r,'name','ad name','ad id'),url=get(r,'url','landing page'),mediaUrl=get(r,'media url','your work','video'),videoId=get(r,'video id');
  if(/[\r\n]/.test(mediaUrl)&&mediaUrl.split(/\r?\n/).filter(Boolean).length>1)throw Error(`${name}: separate every hook/VO into its own row.`);
  const first=get(r,'primary text')+get(r,'primary text · continued 2')+get(r,'primary text · continued 3');
  const primaryTexts=[first,get(r,'primary text 2'),get(r,'primary text 3'),get(r,'primary text 4'),get(r,'primary text 5')].filter(v=>v.trim());
  const cta=get(r,'cta','call to action').toUpperCase().replace(/ /g,'_');
  const filename=get(r,'filename','file name')||name+(/image/i.test(get(r,'media type'))?'.jpg':'.mp4');
  return {key:get(r,'key','source key','ad id')||name,name,url:url||undefined,primaryTexts,headline:get(r,'headline'),description:get(r,'description'),accountId:get(r,'account id')||undefined,campaignId:get(r,'campaign id')||undefined,adSetId:get(r,'ad set id')||undefined,pageId:get(r,'page id')||undefined,cta:cta==='SHOP_NOW'||cta==='LEARN_MORE'?cta:undefined,media:videoId?{kind:'library',videoId}:mediaUrl?{kind:/image/i.test(get(r,'media type'))?'image':'video',url:mediaUrl,filename}:undefined};
 });
}

// Supported fields verified against Meta's v26 Business SDK. Explicit opt-outs
// keep unrelated automatic transformations and catalogue sources disabled.
export const FEATURE_OFF=['standard_enhancements','advantage_plus_creative','add_text_overlay','app_highlights','audio','auto_promotion_tag','catalog_feed_tag','description_automation','dynamic_cta_text','generate_cta','image_animation','image_auto_crop','image_background_gen','image_enhancement','image_templates','image_text_translation','image_touchups','image_uncrop','media_type_automation','multi_creative_post_carousel','music_generation','product_browsing','product_extensions','product_metadata_automation','product_tags','reveal_details_over_time','show_destination_blurbs','show_summary','site_extensions','text_extraction_for_headline','text_generation','text_optimizations','text_overlay_translation','text_translation','translate_voiceover','video_auto_crop','video_filtering','video_highlights','video_to_image','video_uncrop','video_voiceover'];
export function creativePayload(item:UploadItem){
 const a=item.ad,features=Object.fromEntries(FEATURE_OFF.map(k=>[k,{enroll_status:'OPT_OUT'}]));features.enhance_cta={enroll_status:'OPT_IN'};features.inline_comment={enroll_status:'OPT_IN'};
 const asset={bodies:a.primaryTexts.map(t=>({text:t})),titles:[{text:a.headline}],descriptions:a.description?[{text:a.description}]:[],link_urls:[{website_url:a.url}],call_to_action_types:[a.cta],optimization_type:'DEGREES_OF_FREEDOM',ad_formats:[item.imageHash?'SINGLE_IMAGE':'SINGLE_VIDEO'],...(item.imageHash?{images:[{hash:item.imageHash}]}:{videos:[{video_id:item.videoId,thumbnail_url:item.thumbnailUrl}]})};
 return {name:`szekspir-upload-${item.id}`,object_story_spec:{page_id:a.pageId},asset_feed_spec:asset,degrees_of_freedom_spec:{creative_features_spec:features},contextual_multi_ads:{enroll_status:'OPT_OUT'}};
}
export function verifyCreative(item:UploadItem,raw:Record<string,unknown>):string[]{
 const errors:string[]=[];const a=item.ad,s=raw.asset_feed_spec as Record<string,unknown>|undefined,story=raw.object_story_spec as Record<string,unknown>|undefined;
 if(!s){errors.push('Meta did not return the text variants.');return errors;}
 const list=(name:string)=>(Array.isArray(s[name])?s[name]:[]) as Record<string,unknown>[];
 const same=(actual:unknown,expected:unknown)=>JSON.stringify(actual)===JSON.stringify(expected);
 if(!same(list('bodies').map(t=>t.text),a.primaryTexts))errors.push('Primary text variants differ.');
 if(!same(list('titles').map(t=>t.text),[a.headline]))errors.push('Headline differs.');
 if(!same(list('descriptions').map(t=>t.text),a.description?[a.description]:[]))errors.push('Description differs.');
 if(!same(s.call_to_action_types,[a.cta]))errors.push('CTA differs.');
 if(list('link_urls')[0]?.website_url!==a.url)errors.push('Destination URL differs.');
 if(story?.page_id!==a.pageId)errors.push('Facebook Page differs.');
 if(item.imageHash?list('images')[0]?.hash!==item.imageHash:list('videos')[0]?.video_id!==item.videoId)errors.push('Original media differs.');
 const f=(raw.degrees_of_freedom_spec as {creative_features_spec?:Record<string,{enroll_status?:string}>})?.creative_features_spec;
 if(!f||f.enhance_cta?.enroll_status!=='OPT_IN'||f.inline_comment?.enroll_status!=='OPT_IN')errors.push('CTA/comment enhancements were not confirmed.');
 if(!f||FEATURE_OFF.some(k=>f[k]?.enroll_status!=='OPT_OUT'))errors.push('Automatic transformations were not confirmed off.');
 if(f&&Object.entries(f).some(([k,v])=>!['enhance_cta','inline_comment'].includes(k)&&v?.enroll_status==='OPT_IN'))errors.push('An additional enhancement is enabled.');
 if((raw.contextual_multi_ads as {enroll_status?:string})?.enroll_status!=='OPT_OUT')errors.push('Multi-advertiser opt-out was not confirmed.');
 return errors;
}
