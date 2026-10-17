// Live Meta 100/2061015 rejected the image creative because link_data.link was absent.
const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {parseUploadAd,creativePayload,verifyCreative}=require('../lib/meta-uploader-model.ts');
const ad=parseUploadAd({key:'offline-image-story',name:'Offline image story',accountId:'100000000001',campaignId:'100000000002',adSetId:'100000000003',pageId:'100000000004',url:'https://example.test/product?keep=literal&second=2',cta:'SHOP_NOW',primaryTexts:['  Approved text.\n\nSecond paragraph.  ','Another approved option.'],headline:'Approved headline',description:'Approved description',media:{kind:'image',url:'https://example.test/original.png',filename:'original.png'}});
const item={id:'offline-image',ad,imageHash:'original-hash'},payload=creativePayload(item),link=payload.object_story_spec.link_data;
assert.equal(link?.link,ad.url,'Image story must carry the approved destination URL, not just asset_feed_spec.link_urls');
assert.equal(link.image_hash,item.imageHash,'Story and asset feed use the same original image');assert.equal(link.message,ad.primaryTexts[0]);assert.equal(link.name,ad.headline);assert.equal(link.description,ad.description);assert.deepEqual(link.call_to_action,{type:ad.cta,value:{link:ad.url}});
assert.deepEqual(payload.asset_feed_spec.bodies.map(x=>x.text),ad.primaryTexts);assert.deepEqual(verifyCreative(item,payload),[]);
assert(verifyCreative(item,{...payload,object_story_spec:{...payload.object_story_spec,link_data:{...link,link:'https://example.test/wrong'}}}).includes('Story destination URL differs.'));
assert(verifyCreative(item,{...payload,object_story_spec:{...payload.object_story_spec,link_data:{...link,image_hash:'wrong-hash'}}}).includes('Story original image differs.'));
// Meta may return delivery CTA/destination only in the canonical story.
const storyOnlyFeed=structuredClone(payload);delete storyOnlyFeed.asset_feed_spec.call_to_action_types;delete storyOnlyFeed.asset_feed_spec.link_urls;
assert.deepEqual(verifyCreative(item,storyOnlyFeed),[],'Canonical approved story can prove omitted feed CTA and URL');
const wrongCta=structuredClone(storyOnlyFeed);wrongCta.object_story_spec.link_data.call_to_action.type='LEARN_MORE';assert(verifyCreative(item,wrongCta).includes('CTA differs.'));
const wrongLink=structuredClone(storyOnlyFeed);wrongLink.object_story_spec.link_data.link='https://example.test/wrong';assert(verifyCreative(item,wrongLink).length);
const explicitWrong=structuredClone(payload);explicitWrong.asset_feed_spec.call_to_action_types=['LEARN_MORE'];assert(verifyCreative(item,explicitWrong).includes('CTA differs.'));
const extraLink=structuredClone(payload);extraLink.asset_feed_spec.link_urls.push({website_url:'https://example.test/wrong'});assert(verifyCreative(item,extraLink).includes('Destination URL differs.'));
const missingAll=structuredClone(storyOnlyFeed);delete missingAll.object_story_spec.link_data.call_to_action;assert(verifyCreative(item,missingAll).includes('CTA differs.'));
// Meta 100/2446218 rejects Degrees of Freedom when every text/media asset is singular.
const single={...ad,primaryTexts:[ad.primaryTexts[0]]},singleItem={...item,ad:single},standard=creativePayload(singleItem);
assert.equal(standard.asset_feed_spec,undefined,'One-copy image uses an ordinary story, not a singular DoF feed');
assert.deepEqual(verifyCreative(singleItem,standard),[]);
assert(verifyCreative(singleItem,{...standard,object_story_spec:{...standard.object_story_spec,link_data:{...standard.object_story_spec.link_data,message:'Changed remote text'}}}).includes('Primary text differs.'));
const videoItem={...item,imageHash:undefined,videoId:'100000000005',thumbnailUrl:'https://example.test/original-thumb.jpg',ad:{...single,media:{kind:'library',videoId:'100000000005'}}},video=creativePayload(videoItem);
assert.equal(video.asset_feed_spec,undefined);assert.equal(video.object_story_spec.video_data.video_id,videoItem.videoId);assert.equal(video.object_story_spec.video_data.call_to_action.value.link,single.url);assert.deepEqual(verifyCreative(videoItem,video),[]);
assert(verifyCreative(videoItem,{...video,object_story_spec:{...video.object_story_spec,video_data:{...video.object_story_spec.video_data,video_id:'100000000099'}}}).includes('Original media differs.'));
// Real KALO COMP readback keeps text variants and the canonical video ID,
// but omits the duplicate feed video list. It must not reject the saved video.
const variantVideoItem={...videoItem,ad:{...videoItem.ad,primaryTexts:ad.primaryTexts}},variantVideo=creativePayload(variantVideoItem);
const omittedVideo=structuredClone(variantVideo);delete omittedVideo.asset_feed_spec.videos;
assert.deepEqual(verifyCreative(variantVideoItem,omittedVideo),[],'Canonical video proves omitted duplicate feed videos');
const emptyVideo=structuredClone(omittedVideo);emptyVideo.asset_feed_spec.videos=[];assert.deepEqual(verifyCreative(variantVideoItem,emptyVideo),[]);
const conflictingVideo=structuredClone(variantVideo);conflictingVideo.asset_feed_spec.videos[0].video_id='100000000099';assert(verifyCreative(variantVideoItem,conflictingVideo).includes('Original media differs.'));
const extraVideo=structuredClone(variantVideo);extraVideo.asset_feed_spec.videos.push({video_id:'100000000099'});assert(verifyCreative(variantVideoItem,extraVideo).includes('Original media differs.'));
const noVideoProof=structuredClone(omittedVideo);delete noVideoProof.object_story_spec.video_data.video_id;assert(verifyCreative(variantVideoItem,noVideoProof).includes('Original media differs.'));
// Meta 100/3858504 rejects the retired bundle even when explicitly opted out.
assert.equal(standard.degrees_of_freedom_spec.creative_features_spec.standard_enhancements,undefined);
const legacy=creativePayload({...singleItem,ad:{...single,enhancements:{standard_enhancements:false}}});
assert.equal(legacy.degrees_of_freedom_spec.creative_features_spec.standard_enhancements,undefined,'Legacy saved opt-out must not reintroduce the retired bundle');
assert.equal(legacy.degrees_of_freedom_spec.creative_features_spec.image_enhancement.enroll_status,'OPT_OUT');
assert.equal(legacy.degrees_of_freedom_spec.creative_features_spec.enhance_cta.enroll_status,'OPT_IN');
const liveReadback=structuredClone(storyOnlyFeed);liveReadback.degrees_of_freedom_spec.creative_features_spec.standard_enhancements={enroll_status:'OPT_IN'};
assert.deepEqual(verifyCreative(item,liveReadback),[],'Retired bundle echo does not override exact per-feature proof');
const wrongFeature=structuredClone(liveReadback);wrongFeature.degrees_of_freedom_spec.creative_features_spec.image_touchups={enroll_status:'OPT_IN'};assert(verifyCreative(item,wrongFeature).some(e=>e.includes('enhancements differ')),'Individual unapproved changes still fail');
const unknownFeature=structuredClone(liveReadback);unknownFeature.degrees_of_freedom_spec.creative_features_spec.unapproved_new_feature={enroll_status:'OPT_IN'};assert(verifyCreative(item,unknownFeature).some(e=>e.includes('unapproved_new_feature')),'Unknown concrete enhancements still fail');
const missingFeature=structuredClone(liveReadback);delete missingFeature.degrees_of_freedom_spec.creative_features_spec.text_optimizations;assert(verifyCreative(item,missingFeature).length,'Bundle echo cannot prove a missing concrete opt-out');
console.log('PASS image/video stories: required destination, original media, literal approved copy and CTA; single-copy avoids singular DoF, variants retained, remote mismatches rejected. No live calls.');
