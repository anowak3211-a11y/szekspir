// Local input safeguard, not a promise of provider acceptance; Meta validation/readback still apply.
export const UPLOAD_PRIMARY_TEXT_LIMIT=50000;
export type ImageCard={kind:'image';url:string;filename:string};
export type UploadMedia={kind:'library';videoId:string}|{kind:'video'|'image';url:string;filename:string}|{kind:'carousel';cards:ImageCard[];endCard?:boolean};
export type UploadAd={publishStatus?:'ACTIVE'|'PAUSED';key:string;name:string;accountId:string;campaignId:string;adSetId:string;pageId:string;url:string;cta:'SHOP_NOW'|'LEARN_MORE';primaryTexts:string[];headline:string;description:string;headlines?:string[];descriptions?:string[];urlTags?:string;enhancements?:Record<string,boolean>;media:UploadMedia};
export type UploadDraft=Partial<Omit<UploadAd,'media'>>&{media?:UploadMedia};
export type UploadPhase='media'|'transfer'|'finish'|'processing'|'creative'|'ad'|'verify'|'done';
export type UploadItem={id:string;ad:UploadAd;fingerprint:string;phase:UploadPhase;status:'queued'|'working'|'waiting'|'attention'|'complete'|'cancelled';created:number;updated:number;videoId?:string;imageHash?:string;thumbnailUrl?:string;imageHashes?:string[];creativeId?:string;metaAdId?:string;pending?:string;error?:string;attempts:number;lease?:string;leaseUntil?:number;nextAttempt?:number;verifiedAt?:number;reused?:boolean;transfer?:{sessionId:string;fileId:string;size:number;start:number;end:number;checksum:string}};
export type UploadBatch={id:string;name:string;created:number;items:string[];status:'draft'|'running'|'paused'|'finished';dispatch?:{id:string;token:string;until:number};dispatches?:Record<string,{id:string;token:string;until:number}>;queue?:Record<string,{status:UploadItem['status'];at:number;updated?:number}>};
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
 const primaryTexts=primary.map((v,i)=>text(v,`primary text ${i+1}`,UPLOAD_PRIMARY_TEXT_LIMIT));
 if(new Set(primaryTexts).size!==primaryTexts.length)throw Error('Primary text variants must be distinct.');
 const m=a.media as Record<string,unknown>;let media:UploadMedia;
 if(m?.kind==='carousel'){if(!Array.isArray(m.cards)||m.cards.length<2||m.cards.length>10)throw Error('A carousel needs 2–10 original image cards.');media={kind:'carousel',cards:m.cards.map((c:Record<string,unknown>)=>({kind:'image',url:publicHttps(c.url,'image URL'),filename:text(c.filename,'filename',240)})),endCard:m.endCard===true};if(media.cards.some(c=>/[\r\n/\\]/.test(c.filename)))throw Error('Invalid carousel filename.');}
 else if(m?.kind==='library')media={kind:'library',videoId:numericId(m.videoId,'Video ID')};
 else if(m?.kind==='video'||m?.kind==='image')media={kind:m.kind,url:publicHttps(m.url,'media URL'),filename:text(m.filename,'filename',240)};
 else throw Error('Choose an original video, image or account-library Video ID.');
 if(media.kind!=='library'&&media.kind!=='carousel'&&/[\r\n/\\]/.test(media.filename))throw Error('Use a filename without path separators.');
 if(a.cta!=='SHOP_NOW'&&a.cta!=='LEARN_MORE')throw Error('Choose Shop now or Learn more.');
 const extra:Partial<UploadAd>={};
 if(a.publishStatus!==undefined){if(a.publishStatus!=='ACTIVE'&&a.publishStatus!=='PAUSED')throw Error('Choose ACTIVE or PAUSED publication.');extra.publishStatus=a.publishStatus;}
 const variant=(v:unknown,label:string)=>{if(!Array.isArray(v)||v.length<1||v.length>5)throw Error(`Supply 1–5 ${label} variants.`);const list=v.map((t,i)=>text(t,`${label} ${i+1}`,255));if(new Set(list).size!==list.length)throw Error(`${label} variants must be distinct.`);return list;};
 if(a.headlines!==undefined)extra.headlines=variant(a.headlines,'headline');
 if(a.descriptions!==undefined)extra.descriptions=variant(a.descriptions,'description');
 if(a.urlTags!==undefined)extra.urlTags=text(a.urlTags,'UTM parameters',2000,false);
 if(a.enhancements!==undefined){if(!a.enhancements||typeof a.enhancements!=='object'||Array.isArray(a.enhancements))throw Error('Invalid enhancements.');extra.enhancements={};for(const [k,v] of Object.entries(a.enhancements)){if(![...FEATURE_OFF,'enhance_cta','inline_comment'].includes(k)||typeof v!=='boolean')throw Error('Unknown enhancement.');if(v&&LOCKED_FEATURES.includes(k))throw Error('Catalogue and automatic format changes must remain off.');extra.enhancements[k]=v;}}
 return {key:text(a.key,'source key',160),name:text(a.name,'ad name',240),accountId:numericId(String(a.accountId||'').replace(/^act_/,''),'account'),campaignId:numericId(a.campaignId,'campaign'),adSetId:numericId(a.adSetId,'ad set'),pageId:numericId(a.pageId,'Page'),url:publicHttps(a.url,'destination URL'),cta:a.cta,primaryTexts,headline:text(a.headline,'headline',255),description:text(a.description??'','description',255,false),media,...extra};
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
  const headlines=[get(r,'headline'),...['2','3','4','5'].map(i=>get(r,`headline ${i}`))].filter(v=>v.trim()),descriptions=[get(r,'description'),...['2','3','4','5'].map(i=>get(r,`description ${i}`))].filter(v=>v.trim());
  return {key:get(r,'key','source key','ad id')||name,name,url:url||undefined,primaryTexts,headline:get(r,'headline'),description:get(r,'description'),...(headlines.length>1?{headlines}:{}),...(descriptions.length>1?{descriptions}:{}),...(get(r,'utm parameters','url tags')?{urlTags:get(r,'utm parameters','url tags')}:{}),accountId:get(r,'account id')||undefined,campaignId:get(r,'campaign id')||undefined,adSetId:get(r,'ad set id')||undefined,pageId:get(r,'page id')||undefined,cta:cta==='SHOP_NOW'||cta==='LEARN_MORE'?cta:undefined,media:videoId?{kind:'library',videoId}:mediaUrl?{kind:/image/i.test(get(r,'media type'))?'image':'video',url:mediaUrl,filename}:undefined};
 });
}

// Supported fields verified against Meta's v26 Business SDK. Explicit opt-outs
// keep unrelated automatic transformations and catalogue sources disabled.
export const FEATURE_OFF=['standard_enhancements','advantage_plus_creative','add_text_overlay','app_highlights','audio','auto_promotion_tag','catalog_feed_tag','description_automation','dynamic_cta_text','generate_cta','image_animation','image_auto_crop','image_background_gen','image_enhancement','image_templates','image_text_translation','image_touchups','image_uncrop','media_type_automation','multi_creative_post_carousel','music_generation','product_browsing','product_extensions','product_metadata_automation','product_tags','reveal_details_over_time','show_destination_blurbs','show_summary','site_extensions','text_extraction_for_headline','text_generation','text_optimizations','text_overlay_translation','text_translation','translate_voiceover','video_auto_crop','video_filtering','video_highlights','video_to_image','video_uncrop','video_voiceover'];
export const LOCKED_FEATURES=['catalog_feed_tag','product_browsing','product_extensions','product_metadata_automation','product_tags','multi_creative_post_carousel','media_type_automation'];
export function creativePayload(item:UploadItem){
 const a=item.ad,features=Object.fromEntries(FEATURE_OFF.filter(k=>k!=='standard_enhancements').map(k=>[k,{enroll_status:'OPT_OUT'}]));features.enhance_cta={enroll_status:'OPT_IN'};features.inline_comment={enroll_status:'OPT_IN'};for(const [k,v] of Object.entries(a.enhancements||{}))if(k!=='standard_enhancements')features[k]={enroll_status:v?'OPT_IN':'OPT_OUT'};
 const carousel=a.media.kind==='carousel',multiple=a.primaryTexts.length>1||(a.headlines||[a.headline]).length>1||(a.descriptions||[a.description]).length>1;
 const asset={bodies:a.primaryTexts.map(t=>({text:t})),titles:(a.headlines||[a.headline]).map(text=>({text})),descriptions:(a.descriptions||(a.description?[a.description]:[])).map(text=>({text})),link_urls:[{website_url:a.url}],call_to_action_types:[a.cta],optimization_type:'DEGREES_OF_FREEDOM',ad_formats:[carousel?'CAROUSEL':item.imageHash?'SINGLE_IMAGE':'SINGLE_VIDEO'],...(carousel?{images:(item.imageHashes||[]).map((hash,i)=>({hash,adlabels:[{name:`card_${i}`}]})),carousels:[{child_attachments:(item.imageHashes||[]).map((_,i)=>({image_label:{name:`card_${i}`},link_url_label:{name:'destination'},title_label:{name:'headline'},...(a.descriptions?.length||a.description?{description_label:{name:'description'}}:{})})),multi_share_end_card:a.media.kind==='carousel'&&a.media.endCard===true,multi_share_optimized:false}]}:item.imageHash?{images:[{hash:item.imageHash}]}:{videos:[{video_id:item.videoId,thumbnail_url:item.thumbnailUrl}]})};
 if(carousel){Object.assign(asset.link_urls[0],{adlabels:[{name:'destination'}]});for(const title of asset.titles)Object.assign(title,{adlabels:[{name:'headline'}]});for(const description of asset.descriptions)Object.assign(description,{adlabels:[{name:'description'}]});}
 const cta={type:a.cta,value:{link:a.url}},headline=(a.headlines||[a.headline])[0],description=(a.descriptions||[a.description])[0];
 const story={page_id:a.pageId,...(!carousel?(item.imageHash?{link_data:{link:a.url,image_hash:item.imageHash,message:a.primaryTexts[0],name:headline,description,call_to_action:cta}}:{video_data:{video_id:item.videoId,image_url:item.thumbnailUrl,message:a.primaryTexts[0],title:headline,link_description:description,call_to_action:cta}}):{})};
 // Meta rejects a singular Degrees of Freedom feed (100/2446218). An ordinary
 // story carries one approved copy; only actual variants use the asset feed.
 return {name:`szekspir-upload-${item.id}`,object_story_spec:story,...(multiple||carousel?{asset_feed_spec:asset}:{}),degrees_of_freedom_spec:{creative_features_spec:features},contextual_multi_ads:{enroll_status:'OPT_OUT'},...(a.urlTags?{url_tags:a.urlTags}:{})};
}
export function verifyCreative(item:UploadItem,raw:Record<string,unknown>):string[]{
 const errors:string[]=[],a=item.ad,s=raw.asset_feed_spec as Record<string,unknown>|undefined,story=raw.object_story_spec as Record<string,unknown>|undefined;
 const storyData=story?.[item.imageHash?'link_data':'video_data'] as Record<string,unknown>|undefined,storyCta=storyData?.call_to_action as {type?:string;value?:{link?:string}}|undefined;
 const storyUrl=item.imageHash?storyData?.link:storyCta?.value?.link;
 const list=(name:string)=>(Array.isArray(s?.[name])?s?.[name]:[]) as Record<string,unknown>[];
 const same=(actual:unknown,expected:unknown)=>JSON.stringify(actual)===JSON.stringify(expected);
 const expectedPayload=creativePayload(item),expectedFeed=expectedPayload.asset_feed_spec;
 if(!s&&expectedFeed)errors.push('Meta did not return the text variants.');
 if(s){
  if(!same(list('bodies').map(t=>t.text),a.primaryTexts))errors.push('Primary text variants differ.');
  if(!same(list('titles').map(t=>t.text),a.headlines||[a.headline]))errors.push('Headline differs.');
  if(!same(list('descriptions').map(t=>t.text),a.descriptions||(a.description?[a.description]:[])))errors.push('Description differs.');
  // Some Meta reads omit delivery fields from the variant feed. Only the
  // canonical story may prove omitted fields; explicit conflicts still fail.
  const hasFeedCta=s.call_to_action_types!=null&&!(Array.isArray(s.call_to_action_types)&&!s.call_to_action_types.length);
  const hasFeedUrls=s.link_urls!=null&&!(Array.isArray(s.link_urls)&&!s.link_urls.length);
  if(hasFeedCta?!same(s.call_to_action_types,[a.cta]):storyCta?.type!==a.cta)errors.push('CTA differs.');
  if(hasFeedUrls?!Array.isArray(s.link_urls)||!list('link_urls').every(u=>u.website_url===a.url):storyUrl!==a.url)errors.push('Destination URL differs.');
  if(a.media.kind==='carousel'){
   if(!same(list('images').map(t=>t.hash),item.imageHashes))errors.push('Original carousel images differ.');
   if(!same(s.carousels,(expectedFeed as Record<string,unknown>)?.carousels))errors.push('Carousel order or card settings differ.');
   if(!same(s.ad_formats,['CAROUSEL']))errors.push('Carousel format differs.');
  }else if(item.imageHash){
   if(list('images')[0]?.hash!==item.imageHash)errors.push('Original media differs.');
  }else{
   // Meta can omit the duplicate video asset while retaining the canonical
   // story video. Omission needs exact story proof; explicit conflicts fail.
   const hasFeedVideos=s.videos!=null&&!(Array.isArray(s.videos)&&!s.videos.length);
   if(hasFeedVideos?(list('videos').length!==1||list('videos')[0]?.video_id!==item.videoId):storyData?.video_id!==item.videoId)errors.push('Original media differs.');
  }
 }
 if(story?.page_id!==a.pageId)errors.push('Facebook Page differs.');
 if(a.media.kind!=='carousel'){
  const image=!!item.imageHash,data=story?.[image?'link_data':'video_data'] as Record<string,unknown>|undefined;
  const cta=data?.call_to_action as {type?:string;value?:{link?:string}}|undefined;
  if((image?data?.link:cta?.value?.link)!==a.url)errors.push('Story destination URL differs.');
  if(image&&data?.image_hash!==item.imageHash)errors.push('Story original image differs.');
  if(!image&&data?.video_id!==item.videoId)errors.push('Original media differs.');
  if(cta&&(cta.type!==a.cta||cta.value?.link!==undefined&&cta.value.link!==a.url))errors.push('CTA differs.');
  if(!s){
   if(data?.message!==a.primaryTexts[0])errors.push('Primary text differs.');
   if(data?.[image?'name':'title']!==(a.headlines||[a.headline])[0])errors.push('Headline differs.');
   if((data?.[image?'description':'link_description']||'')!==(a.descriptions||[a.description])[0])errors.push('Description differs.');
   if(cta?.type!==a.cta||cta?.value?.link!==a.url)errors.push('CTA differs.');
  }
 }
 const f=(raw.degrees_of_freedom_spec as {creative_features_spec?:Record<string,{enroll_status?:string}>})?.creative_features_spec,expected=expectedPayload.degrees_of_freedom_spec.creative_features_spec;
 if(!f||Object.entries(expected).some(([k,v])=>f[k]?.enroll_status!==v.enroll_status))errors.push('Creative enhancements differ from the approved settings.');
 // Meta echoes the retired bundle even though it rejects that key on write.
 // Individual feature states above remain mandatory and authoritative.
 const extraFeatures=f?Object.entries(f).filter(([k,v])=>k!=='standard_enhancements'&&v?.enroll_status==='OPT_IN'&&expected[k]?.enroll_status!=='OPT_IN').map(([k])=>k):[];
 if(extraFeatures.length)errors.push(`An additional enhancement is enabled: ${extraFeatures.join(', ')}.`);
 if(a.urlTags&&(raw.url_tags||'')!==a.urlTags)errors.push('UTM parameters differ.');
 if((raw.contextual_multi_ads as {enroll_status?:string})?.enroll_status!=='OPT_OUT')errors.push('Multi-advertiser opt-out was not confirmed.');
 return errors;
}
