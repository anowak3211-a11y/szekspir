export const SHEET_PRODUCTS = ['pumpkin', 'Magnesium Bisglycine Gummies', 'Kids Gummies'] as const;
export type SheetProduct = (typeof SHEET_PRODUCTS)[number] | (string & {});
export function parseSheetProduct(value: unknown): SheetProduct | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120) {
    throw Error('Choose a valid product for the editor sheet');
  }
  return value.trim();
}

