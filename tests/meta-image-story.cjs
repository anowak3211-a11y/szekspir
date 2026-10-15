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
console.log('PASS image story includes its required link, original hash, literal approved copy and CTA, with independent remote story checks. No live calls.');
