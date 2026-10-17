/** The separate frontend holds no backend credentials. Ordinary user authentication remains enforced upstream. */
export function sharedApiForward(request:Request,origin:string){
 if(origin!=='https://szekspir.vercel.app')throw Error('Unsupported shared API origin.');
 const current=new URL(request.url);if(!current.pathname.startsWith('/api/'))return null;
 if(!['GET','HEAD','OPTIONS'].includes(request.method)&&request.headers.get('origin')!==current.origin)throw Error('Invalid origin.');
 const headers=new Headers();
 for(const name of ['accept','content-type','cookie','range','if-range','if-none-match','user-agent']){const value=request.headers.get(name);if(value)headers.set(name,value);}
 headers.set('origin',origin);
 return {url:new URL(current.pathname+current.search,origin),headers};
}
