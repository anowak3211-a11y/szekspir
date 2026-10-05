export const SHEET_PRODUCTS = ['Magnesium Bisglycine Gummies', 'Kids Gummies'] as const;
export type SheetProduct = typeof SHEET_PRODUCTS[number];
export function parseSheetProduct(value:unknown):SheetProduct|undefined {
 if(value===undefined||value==='')return undefined;
 if(typeof value!=='string'||!SHEET_PRODUCTS.includes(value as SheetProduct))throw Error('Choose a valid product for the editor sheet');
 return value as SheetProduct;
}
