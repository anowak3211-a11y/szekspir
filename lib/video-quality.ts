export type VideoSize={width:number;height:number};
export type VideoMeasurement=VideoSize&{name:string;url:string;id?:string};
export const PIXEL_LOSS_THRESHOLD=0.30;
export function compareVideoSize(reference:VideoSize,work:VideoSize){
 const valid=(s:VideoSize)=>Number.isFinite(s.width)&&Number.isFinite(s.height)&&s.width>0&&s.height>0;
 if(!valid(reference)||!valid(work))throw Error('Video resolution is not available.');
 const sourcePixels=reference.width*reference.height,workPixels=work.width*work.height;
 const loss=Math.max(0,1-workPixels/sourcePixels);
 return {low:workPixels*100<=sourcePixels*70,loss,percent:Math.round(loss*100)};
}
// MP4 container metadata only. No decoding, transcoding, or full-video download.
export function mp4Dimensions(moov:Buffer):VideoSize{
 const boxes=(buffer:Buffer)=>{const out:{type:string;data:Buffer}[]=[];for(let i=0;i+8<=buffer.length;){let size=buffer.readUInt32BE(i),header=8;if(size===1){if(i+16>buffer.length)break;size=Number(buffer.readBigUInt64BE(i+8));header=16;}if(size===0)size=buffer.length-i;if(size<header||i+size>buffer.length)break;out.push({type:buffer.toString('ascii',i+4,i+8),data:buffer.subarray(i+header,i+size)});i+=size;}return out;};
 const sizes:VideoSize[]=[];
 for(const track of boxes(moov).filter(b=>b.type==='trak')){
  const children=boxes(track.data),mdia=children.find(b=>b.type==='mdia');
  const handler=mdia&&boxes(mdia.data).find(b=>b.type==='hdlr');
  if(!handler||handler.data.toString('ascii',8,12)!=='vide')continue;
  const tkhd=children.find(b=>b.type==='tkhd')?.data;
  if(!tkhd||tkhd.length<84)continue;
  const offset=tkhd[0]===1?88:76;if(tkhd.length<offset+8)continue;
  const width=tkhd.readUInt32BE(offset)/65536,height=tkhd.readUInt32BE(offset+4)/65536;
  if(width>0&&height>0)sizes.push({width:Math.round(width),height:Math.round(height)});
 }
 const size=sizes.sort((a,b)=>b.width*b.height-a.width*a.height)[0];
 if(!size)throw Error('MP4 video dimensions are not available.');return size;
}
export type ByteReader=(start:number,length:number)=>Promise<Buffer>;
export async function readMp4Size(read:ByteReader):Promise<VideoSize>{
 let offset=0;
 for(let i=0;i<64;i++){
  const header=await read(offset,16);if(header.length<8)break;
  let size=header.readUInt32BE(0),headerSize=8;const type=header.toString('ascii',4,8);
  if(size===1){if(header.length<16)break;size=Number(header.readBigUInt64BE(8));headerSize=16;}
  if(!Number.isSafeInteger(size)||size<headerSize)break;
  if(type==='moov'){if(size>8*1024*1024)throw Error('Video metadata is too large to inspect.');return mp4Dimensions(await read(offset+headerSize,size-headerSize));}
  offset+=size;if(!Number.isSafeInteger(offset))break;
 }
 throw Error('Could not read video metadata.');
}
