export type Market = 'uk' | 'pl';
export function parseMarket(value:unknown):Market {
 if(value===undefined||value==='uk')return 'uk';
 if(value==='pl')return 'pl';
 throw Error('Choose a valid market: uk or pl.');
}
export function matchesMarket(job:{market?:Market},market:Market){return (job.market||'uk')===market;}
export function marketPath(market:Market){return market==='pl'?'/szekspir-pl':'/szekspir';}
