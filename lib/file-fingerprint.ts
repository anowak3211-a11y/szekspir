'use client';
import {sha256} from '@noble/hashes/sha2.js';
// Read every byte, but never buffer a multi-GB video in memory at once.
export async function fingerprintFile(file:Blob,progress:(percent:number)=>void=()=>{},signal?:AbortSignal){
 const hash=sha256.create(),chunk=4*1024*1024;
 for(let offset=0;offset<file.size;offset+=chunk){signal?.throwIfAborted();hash.update(new Uint8Array(await file.slice(offset,offset+chunk).arrayBuffer()));progress(Math.min(100,Math.round((offset+chunk)/file.size*100)));await new Promise(resolve=>setTimeout(resolve,0));}
 signal?.throwIfAborted();
 return Array.from(hash.digest(),byte=>byte.toString(16).padStart(2,'0')).join('');
}
