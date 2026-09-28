import {parseCtaMode} from '@/lib/cta-mode';
// Compatibility endpoint for text/file localisation only. Production jobs use /api/jobs.
import {localize,transcribe,Provider} from '@/lib/localize';
import {getProducts} from '@/lib/products';
export const maxDuration=300;
export async function POST(req:Request){try{
 const f=await req.formData(),provider=String(f.get('provider')||'anthropic');
 if(!['anthropic','openai','custom'].includes(provider))throw new Error('Invalid provider');
 const file=f.get('file');let script=String(f.get('text')||'');
 if(file instanceof File){if(file.size>24*1024*1024)throw new Error('Audio exceeds limit');script=await transcribe(file);}
 if(!script.trim())throw new Error('Script or audio required');
 const name=String(f.get('productName')||'');const product=name?(await getProducts()).find(p=>p.name===name):undefined;
 if(name&&!product)throw new Error('Unknown product');
 return Response.json({us_script:script,...await localize(script,provider as Provider,String(f.get('model')||''),product?.markdown,false,false,(name||'MELLOW').toUpperCase(),parseCtaMode(f.get('ctaMode')??undefined))});
}catch(e){return Response.json({error:(e as Error).message},{status:400});}}
