import {readZip} from '@/lib/import-pack';
import {fileRole} from '@/lib/product-context';
import {addFile} from '@/lib/products';
export const maxDuration=300;
export async function POST(req:Request){try{
 const f=await req.formData(),product=String(f.get('product')||''),file=f.get('file');
 if(!product||!(file instanceof File)||file.size>3*1024*1024)throw new Error('Product and research file up to 3MB required');
 let files:{filename:string;markdown:string}[]=[],skipped:string[]=[];
 if(file.name.endsWith('.zip'))({files,skipped}=readZip(Buffer.from(await file.arrayBuffer())));
 else if(/\.(md|txt|json)$/i.test(file.name)&&fileRole(file.name)!=='excluded'){const markdown=await file.text();if(markdown.length>49000)throw new Error('File exceeds the spreadsheet cell limit; split it into smaller documents');if(file.name.endsWith('.json'))JSON.parse(markdown);files=[{filename:file.name,markdown}];}
 else skipped=[file.name];
 // Sheets stores one document per cell. Reject the pack before making partial writes.
 if(files.some(f=>f.markdown.length>49000))throw new Error('A document exceeds the spreadsheet cell limit; split it before import');
 if(f.get('preview')==='1')return Response.json({accepted:files.map(f=>({name:f.filename,role:fileRole(f.filename)})),skipped});
 for(const item of files)await addFile(product,item.filename,item.markdown);
 return Response.json({accepted:files.map(f=>({name:f.filename,role:fileRole(f.filename)})),skipped});
}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
