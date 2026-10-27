import {SHEET_PRODUCTS,type SheetProduct} from './sheet-product';
type Reference={name:string;files?:{filename:string;markdown:string}[]};
function kind(reference:Reference):'saffron'|'magnesium'|undefined{
 if(!/bloom|saphire|bryte/i.test(reference.name)&&/saff[ro]*n|kids|mood\s+munchies/i.test(reference.name))return 'saffron';
 if(/magnesium|bisglycin/i.test(reference.name))return 'magnesium';
 for(const file of reference.files||[])if(/product_profile\.json$/i.test(file.filename))try{
  const profile=JSON.parse(file.markdown),name=String(profile.product_name||'');
  if(!/bloom|saphire|bryte/i.test(name)&&/saff[ro]*n|kids|mood\s+munchies/i.test(name))return 'saffron';
  if(/magnesium|bisglycin/i.test(name))return 'magnesium';
 }catch{/* A malformed profile cannot supply a product mapping. */}
 return /^mellow$/i.test(reference.name)?'magnesium':undefined;
}
export function sheetProductOptions(references:Reference[]):SheetProduct[]{
 const custom=references.filter(r=>!kind(r)).map(r=>r.name);
 return [...SHEET_PRODUCTS,...custom.filter(name=>!SHEET_PRODUCTS.includes(name as never))];
}
export function copyReferenceForProduct(product:SheetProduct,references:Reference[],current=''){
 if(product==='Kids Gummies'||product==='Magnesium Bisglycine Gummies'){
  const target=product==='Kids Gummies'?'saffron':'magnesium';
  const candidates=references.filter(reference=>kind(reference)===target);
  return candidates.find(reference=>reference.name===current)?.name||candidates[0]?.name||'';
 }
 return references.find(r=>r.name===product)?.name||current||'';
}
export function sheetProductLabel(product:SheetProduct){
 if(product==='Kids Gummies')return 'Mellow Mood Munchies';
 if(product==='Magnesium Bisglycine Gummies')return 'Mellow Magnesium Bisglycinate Gummies';
 return product;
}
export function copyReferenceLabel(name:string){return /mellow.*(?:saff[ro]*n|kids|mood\s+munchies)/i.test(name)?'Mellow Mood Munchies':name;}

export function sheetProductForReference(reference:Reference):SheetProduct|undefined{
 const type=kind(reference);
 if(type==='saffron')return 'Kids Gummies';
 if(type==='magnesium')return 'Magnesium Bisglycine Gummies';
 return reference.name||undefined;
}

