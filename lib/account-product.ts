import {currentWorkspace} from './account-context';
import {getProducts} from './products';
export type AccountProduct={name:string;url:string;context:string};
const cache=new WeakMap<object,Promise<AccountProduct>>();
export async function accountProduct(){const workspace=currentWorkspace();if(!workspace)return undefined;const previous=cache.get(workspace);if(previous)return previous;const request=(async()=>{const name=workspace.values.TARGET_PRODUCT,url=workspace.values.TARGET_PRODUCT_URL;if(!name||!url)throw Error('W Profil → Twój zestaw wybierz własny produkt i link docelowy.');const product=(await getProducts()).find(p=>p.name===name);if(!product)throw Error('Dodaj ten produkt i jego dokumenty w Product briefs.');return {name,url,context:product.markdown};})();cache.set(workspace,request);return request;}
