// Only user-approved equivalents in incidental purchase examples.
export function permittedRetailFix(source:string,original:string,replacement:string){
 const pairs:Record<string,string>={cvs:'boots',walgreens:'boots','rite aid':'boots',costco:'tesco',walmart:'tesco',target:'tesco','that nature made bottle':'a cheap bottle','a nature made bottle':'a cheap bottle','that nature-made bottle':'a cheap bottle','a nature-made bottle':'a cheap bottle','big jug':'massive tub'};
 if(pairs[original.toLowerCase()]!==replacement.toLowerCase())return false;
 return source.split(/(?<=[.!?])\s+/).some(sentence=>sentence.toLowerCase().includes(original.toLowerCase())&&/\b(grabbed|picked up|bought|buying)\b/i.test(sentence)&&! /\b(stocked|sold|available|endorsed|certified|study|studies)\b/i.test(sentence));
}
