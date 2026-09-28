export type CtaMode='original'|'learn-more';
export function parseCtaMode(value:unknown):CtaMode{
 if(value===undefined||value==='original')return 'original';
 if(value==='learn-more')return value;
 throw Error('Choose a valid call to action.');
}
export function ctaInstruction(mode:CtaMode,singingAd=false){
 if(singingAd)return 'SINGING AD: preserve original lyrics and CTA; only the authorised brand replacement is allowed.';
 if(mode==='original')return 'MANUAL CTA CHOICE — ORIGINAL: preserve the source closing CTA and its offer explanation. Adapt explicitly disclosed offer terms only using confirmed target-product facts and the existing offer rules. Do not invent an offer when the source has none.';
 return `MANUAL CTA CHOICE — LEARN MORE, NO OFFER: This explicit user choice overrides CTA/offer fidelity and ending-preservation rules ONLY for the closing CTA. Rewrite the closing sales/offer section as a natural invitation to click the link below to learn more or read the article. Remove the closing price, discount, bundle, free-item, purchase, checkout, money-back guarantee and stock/deadline sales-pressure language. Do not mention Buy 2 Get 1 Free or another offer, even when product context requires it. Preserve the topic and persuasive bridge into the link, but do not invent an article title, URL, list length or what the linked page promises. Keep the rest of the source's argument and opening hooks faithful; do not rewrite the whole script. Apply this ending consistently to uk_script and narration. Record the CTA change in notes. Do not restore the original sales ending to satisfy timing or sentence-count targets.`;
}
