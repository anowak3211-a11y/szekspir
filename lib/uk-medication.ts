/** Owner-requested literal UK copy edit; URLs/emails remain source references. */
export function canonicalUkMedicationName(text:string):string{
 return text.replace(/(?:https?:\/\/|www\.)[^\s]+|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:[A-Z0-9-]+\.)+[A-Z]{2,}(?:\/[^\s]*)?|\britalin\b/gi,match=>/^ritalin$/i.test(match)?'Concerta XL':match);
}
