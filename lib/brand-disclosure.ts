// Ingredient names and ranking labels (e.g. S tier) are not competitor names.
const COMPETITOR_BRAND_RE = /(?:\b(?:(?:sapp?hire\s+)?happy\s+chews|mood\s+munchies|bloom[\s-]*wise|hello\s*bloom(?:\s*kids)?|p\s*[-–‑]\s*nutrition|S\.?\s*P\.?(?:\s*[-–]?\s*Nutrition)?|mellow|try[-\s]*bryte|bryte(?:\s+saffron)?|try[-\s]*saphire|saphire\s+saffron|joy\s*spring|first\s+day|novomins|saffrosun|mary\s*ruth(?:'?s)?|rosabella|nutrafol|spoiled\s*child|goli|lemme|cymbiotika|gr[uü]ns)|spenatrician)\b/i;
const STOREFRONT_RE = /\b(?:[a-z0-9-]{3,}\.(?:com|co\.uk|co|io|shop|store)|[a-z0-9-]{3,}\s+dot\s+(?:com|co))\b/i;
const EXPLICIT_CALLED_RE = /\b(?:it['’]?s\s+called|they['’]?re\s+called|brand\s+called|company\s+called|supplement\s+called|gummies?\s+called|capsules?\s+called|oil\s+called)\s+(?!(?:saffron|magnesium|bisglycinate|glycinate|pumpkin|vitamin|melatonin|l-theanine|gaba)\b)[a-z0-9-]+/i;

export function mayIntroduceMellow(source:string){
 return COMPETITOR_BRAND_RE.test(source)||STOREFRONT_RE.test(source)||EXPLICIT_CALLED_RE.test(source);
}
export function hasUnwantedBrandReveal(source:string,texts:string[],targetBrand?:string){
 if(mayIntroduceMellow(source))return false;
 if(targetBrand&&!/^(?:mellow\b|kids\s+gummies$|mellow\s+mood\s+munchies$)/i.test(targetBrand.trim()))return false;
 return texts.some(text=>/\bmellow\b/i.test(text)||(!/\bgumm(?:y|ies)\b/i.test(source)&&/\bmagnesium\s+bisglycinate\s+gummies\b/i.test(text)));
}

