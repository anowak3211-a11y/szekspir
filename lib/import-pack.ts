import {inflateRawSync} from 'node:zlib';
import {fileRole} from './product-context';
export function readZip(buf:Buffer){
 let end=-1;for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--)if(buf.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0)throw new Error('Invalid ZIP');const count=buf.readUInt16LE(end+10);let at=buf.readUInt32LE(end+16),total=0;
 if(count>200)throw new Error('Too many files');const files:{filename:string;markdown:string}[]=[];const skipped:string[]=[];
 for(let n=0;n<count;n++){
  if(at+46>buf.length||buf.readUInt32LE(at)!==0x02014b50)throw new Error('Invalid ZIP directory');
  const flags=buf.readUInt16LE(at+8),method=buf.readUInt16LE(at+10),packed=buf.readUInt32LE(at+20),size=buf.readUInt32LE(at+24),nl=buf.readUInt16LE(at+28),el=buf.readUInt16LE(at+30),cl=buf.readUInt16LE(at+32),offset=buf.readUInt32LE(at+42);
  const filename=buf.subarray(at+46,at+46+nl).toString('utf8');at+=46+nl+el+cl;
  if(filename.includes('..')||filename.startsWith('/')||filename.includes('\\'))throw new Error('Unsafe ZIP path');
  if(filename.endsWith('/')||! /\.(md|txt|json)$/i.test(filename)||filename.includes('__MACOSX')){skipped.push(filename);continue;}
  if(flags&1||![0,8].includes(method)||size>200000||total+size>2000000)throw new Error('Unsupported or oversized research pack');
  if(offset+30>buf.length||buf.readUInt32LE(offset)!==0x04034b50)throw new Error('Invalid ZIP entry');
  const start=offset+30+buf.readUInt16LE(offset+26)+buf.readUInt16LE(offset+28);if(start+packed>buf.length)throw new Error('Truncated ZIP');
  const data=method===0?buf.subarray(start,start+packed):inflateRawSync(buf.subarray(start,start+packed),{maxOutputLength:200000});
  if(data.length!==size)throw new Error('Invalid ZIP size');total+=size;
  if(fileRole(filename)==='excluded'){skipped.push(filename);continue;}
  const markdown=data.toString('utf8');if(filename.endsWith('.json'))JSON.parse(markdown);files.push({filename,markdown});
 }
 return {files,skipped};
}
