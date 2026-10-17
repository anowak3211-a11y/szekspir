import sharp from 'sharp';
/** Upload-only size safeguard. Archived source and pixel dimensions remain unchanged. */
export async function metaImageUploadCopy(buffer:Buffer,contentType:string,filename:string,maxBytes=8*1024*1024){
 if(buffer.length<=maxBytes)return {buffer,contentType,filename};
 for(const quality of [95,90,85]){
  const copy=await sharp(buffer,{limitInputPixels:40000000}).toColourspace('srgb').jpeg({quality,chromaSubsampling:'4:4:4'}).toBuffer();
  if(copy.length<=maxBytes)return {buffer:copy,contentType:'image/jpeg',filename:filename.replace(/\.[^.]+$/,'')+'.jpg'};
 }
 throw Error('Image upload copy still exceeds 8 MB. Prepare a smaller file; the archived original is unchanged.');
}
