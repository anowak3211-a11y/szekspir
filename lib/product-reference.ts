import type {SheetProduct} from './sheet-product';
type Reference={name:string;files?:{filename:string;markdown:string}[]};
function kind(reference:Reference):'saffron'|'magnesium'|undefined{
 if(/^mellow\b/i.test(reference.name)&&/saff[ro]*n|kids|mood\s+munchies/i.test(reference.name))return 'saffron';
 if(/^mellow\b/i.test(reference.name)&&/magnesium|bisglycin/i.test(reference.name))return 'magnesium';
 for(const file of reference.files||[])if(/product_profile\.json$/i.test(file.filename))try{
  const profile=JSON.parse(file.markdown),name=String(profile.product_name||'');
  if(/^mellow\b/i.test(name)&&/saff[ro]*n|kids|mood\s+munchies/i.test(name))return 'saffron';if(/^mellow\b/i.test(name)&&/magnesium|bisglycin/i.test(name))return 'magnesium';
 }catch{/* A malformed profile cannot supply a product mapping. */}
 return /^mellow$/i.test(reference.name)?'magnesium':undefined;
}
export function copyReferenceForProduct(product:SheetProduct,references:Reference[],current=''){
 const target=product==='Kids Gummies'?'saffron':'magnesium';
 const candidates=references.filter(reference=>kind(reference)===target);
 return candidates.find(reference=>reference.name===current)?.name||candidates[0]?.name||'';
}
export function sheetProductLabel(product:SheetProduct){return product==='Kids Gummies'?'Mellow Mood Munchies':'Mellow Magnesium Bisglycinate Gummies';}
export function copyReferenceLabel(name:string){return /mellow.*(?:saff[ro]*n|kids|mood\s+munchies)/i.test(name)?'Mellow Mood Munchies':name;}

export function sheetProductForReference(reference:Reference):SheetProduct|undefined{const type=kind(reference);return type==='saffron'?'Kids Gummies':type==='magnesium'?'Magnesium Bisglycine Gummies':undefined;}
