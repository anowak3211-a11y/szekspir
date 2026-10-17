import {mutate,readState} from './store';
type Registry={next:number;ids:Record<string,number>};
const empty=():Registry=>({next:1,ids:{}});
export async function antkiNumbers(ids:string[]){
 if(ids.some(id=>!/^facebook_\d{5,30}$/.test(id)))throw Error('Invalid Antki ID.');
 const known=(await readState<Registry>('antki-number-registry',empty())).value;
 if(ids.every(id=>known.ids[id]))return Object.fromEntries(ids.map(id=>[id,known.ids[id]]));
 return mutate<Registry,Record<string,number>>('antki-number-registry',empty(),s=>{for(const id of ids){if(!s.ids[id])s.ids[id]=s.next++;}return Object.fromEntries(ids.map(id=>[id,s.ids[id]]));});
}
