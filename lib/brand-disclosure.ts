// Ingredient names and ranking labels (e.g. S tier) are not competitor names.
export function mayIntroduceMellow(source:string){
 return /\bp\s*[-–‑]\s*nutrition\b/i.test(source)||/spenatrician\b/i.test(source)||/\bS\.?\s*P\.?(?:\s*[-–]?\s*Nutrition)?\b/i.test(source)||/\bmellow\b/i.test(source);
}
export function hasUnwantedBrandReveal(source:string,texts:string[]){
 if(mayIntroduceMellow(source))return false;
 return texts.some(text=>/\bmellow\b/i.test(text)||(!/\bgumm(?:y|ies)\b/i.test(source)&&/\bmagnesium\s+bisglycinate\s+gummies\b/i.test(text)));
}
