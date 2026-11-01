import {BENNETT_SHEET_PRODUCTS,SHEET_PRODUCTS,type SheetProduct} from './sheet-product';
type Reference={name:string;files?:{filename:string;markdown:string}[]};
type BennettAngle=(typeof BENNETT_SHEET_PRODUCTS)[number];
type ReferenceKind=BennettAngle|'saffron'|'magnesium';

function detectBennettAngle(raw:string):BennettAngle|undefined{
 const text=(raw||'').trim();
 if(!text)return undefined;
 if(/^pumpkin$/i.test(text))return 'Bennett & Seed — Hair';
 if(!/bennett\s*(?:&|and)\s*seed|pumpkin\s+seed\s+oil/i.test(text))return undefined;
 if(/\bbladder\b/i.test(text))return 'Bennett & Seed — Bladder';
 if(/\bprostate\b/i.test(text))return 'Bennett & Seed — Prostate';
 if(/\bkidney\b/i.test(text))return 'Bennett & Seed — Kidney';
 if(/\burolog/i.test(text))return 'Bennett & Seed — Urology';
 return 'Bennett & Seed — Hair';
}

function kind(reference:Reference):ReferenceKind|undefined{
 const directBennett=detectBennettAngle(reference.name);
 if(directBennett)return directBennett;
 if(!/bloom|saphire|bryte/i.test(reference.name)&&/saff[ro]*n|kids|mood\s+munchies/i.test(reference.name))return 'saffron';
 if(/magnesium|bisglycin/i.test(reference.name))return 'magnesium';
 for(const file of reference.files||[])if(/product_profile\.json$/i.test(file.filename))try{
  const profile=JSON.parse(file.markdown),label=String(profile.angle_name||profile.sheet_product||profile.product_name||'');
  const profileBennett=detectBennettAngle(label);
  if(profileBennett)return profileBennett;
  if(!/bloom|saphire|bryte/i.test(label)&&/saff[ro]*n|kids|mood\s+munchies/i.test(label))return 'saffron';
  if(/magnesium|bisglycin/i.test(label))return 'magnesium';
 }catch{/* A malformed profile cannot supply a product mapping. */}
 return /^mellow$/i.test(reference.name)?'magnesium':undefined;
}

export function sheetProductOptions(references:Reference[]):SheetProduct[]{
 const custom=references.filter(r=>!kind(r)).map(r=>r.name);
 return [...SHEET_PRODUCTS,...custom.filter(name=>!SHEET_PRODUCTS.includes(name as never))];
}

export function copyReferenceForProduct(product:SheetProduct,references:Reference[],current=''){
 const normalized=/^pumpkin$/i.test(product)?'Bennett & Seed — Hair':product;
 const bennettTarget=BENNETT_SHEET_PRODUCTS.find(p=>p===normalized);
 if(bennettTarget){
  const candidates=references.filter(reference=>kind(reference)===bennettTarget);
  return candidates.find(reference=>reference.name===current)?.name||candidates[0]?.name||bennettTarget;
 }
 if(normalized==='Kids Gummies'||normalized==='Magnesium Bisglycine Gummies'){
  const target=normalized==='Kids Gummies'?'saffron':'magnesium';
  const candidates=references.filter(reference=>kind(reference)===target);
  return candidates.find(reference=>reference.name===current)?.name||candidates[0]?.name||'';
 }
 return references.find(r=>r.name===normalized)?.name||current||'';
}

export function sheetProductLabel(product:SheetProduct){
 if(/^pumpkin$/i.test(product))return 'Bennett & Seed — Hair';
 if(product==='Kids Gummies')return 'Mellow Mood Munchies';
 if(product==='Magnesium Bisglycine Gummies')return 'Mellow Magnesium Bisglycinate Gummies';
 return product;
}

export function copyReferenceLabel(name:string){
 if(/^pumpkin$/i.test(name))return 'Bennett & Seed — Hair';
 return /mellow.*(?:saff[ro]*n|kids|mood\s+munchies)/i.test(name)?'Mellow Mood Munchies':name;
}

export function sheetProductForReference(reference:Reference):SheetProduct|undefined{
 const type=kind(reference);
 if(type&&BENNETT_SHEET_PRODUCTS.includes(type as BennettAngle))return type as BennettAngle;
 if(type==='saffron')return 'Kids Gummies';
 if(type==='magnesium')return 'Magnesium Bisglycine Gummies';
 return reference.name||undefined;
}
