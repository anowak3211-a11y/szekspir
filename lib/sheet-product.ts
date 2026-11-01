export const BENNETT_SHEET_PRODUCTS = [
  'Bennett & Seed — Hair',
  'Bennett & Seed — Bladder',
  'Bennett & Seed — Prostate',
  'Bennett & Seed — Kidney',
  'Bennett & Seed — Urology',
] as const;

export const SHEET_PRODUCTS = [
  ...BENNETT_SHEET_PRODUCTS,
  'Magnesium Bisglycine Gummies',
  'Kids Gummies',
] as const;

export type SheetProduct = (typeof SHEET_PRODUCTS)[number] | (string & {});

export function parseSheetProduct(value: unknown): SheetProduct | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120) {
    throw Error('Choose a valid product for the editor sheet');
  }
  const trimmed = value.trim();
  if (/^pumpkin$/i.test(trimmed)) return 'Bennett & Seed — Hair';
  return trimmed;
}
