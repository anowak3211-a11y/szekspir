export type AntkiNeutralVariant={headline:string;text:string;description:string};
export type AntkiNeutralVersion={headline:string;text:string;variants?:AntkiNeutralVariant[];revision:number;updated:number};

// Owner-requested neutral alternative, separate from all localised advertising copy.
// Stable defaults need no provider request, background job or write on page load.
export function neutralAntkiDraft(id:string){
 const headlines=['cat','dog','tree','book','cloud','bird','sun','home'];
 const sentences=['Сегодня хороший день.','На улице светит солнце.','За окном растёт дерево.','На столе лежит книга.','По небу плывут облака.','В парке поют птицы.','Вечером приятно гулять.','Дома тепло и уютно.'];
 const seed=Array.from(id).reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,0);
 return {headline:headlines[seed%headlines.length],text:sentences[Math.floor(seed/headlines.length)%sentences.length]};
}

export function validateAntkiNeutral(text:unknown,headline:unknown){
 if(typeof headline!=='string'||!/^\p{L}{1,40}$/u.test(headline.trim()))throw Error('Headline musi zawierać jedno słowo, do 40 liter.');
 if(typeof text!=='string'||text.trim().length>300||!/[\u0400-\u04ff]/u.test(text)||!/^[^.!?\r\n]+[.!?]$/u.test(text.trim()))throw Error('Primary text musi zawierać jedno zdanie po rosyjsku, do 300 znaków.');
 return {text:text.trim(),headline:headline.trim()};
}

/** Four extra text options alongside the real advertising copy; no paid generation. */
export function neutralAntkiVariants(id:string):AntkiNeutralVariant[]{
 const pairs=[['silver cat','Лумба френи шорика. Таври нола фимба.','quiet paper moon'],['velvet dog','Морли вена шупика. Фалми дори нумба.','little velvet cloud'],['paper bird','Тумри фела нарика. Ворли шума ланти.','gentle silver leaf'],['cloud book','Налми шора феника. Дурли вама торфи.','soft amber feather']];
 const offset=Array.from(id).reduce((n,c)=>(n+c.charCodeAt(0))%4,0);
 return Array.from({length:4},(_,i)=>{const [headline,text,description]=pairs[(i+offset)%4];return {headline,text,description};});
}

export function validateAntkiNeutralVariants(input:unknown):AntkiNeutralVariant[]{
 if(!Array.isArray(input)||input.length!==4)throw Error('Podaj dokładnie cztery warianty.');
 const words=(value:unknown,count:number,max:number)=>typeof value==='string'&&value.trim().length<=max&&new RegExp('^\\p{L}+(?: +\\p{L}+){'+(count-1)+'}$','u').test(value.trim());
 return input.map((v:unknown)=>{
  if(!v||typeof v!=='object')throw Error('Nieprawidłowy wariant.');const {headline,text,description}=v as Record<string,unknown>;
  if(!words(headline,2,80))throw Error('Każdy headline musi zawierać dwa słowa.');
  if(!words(description,3,120))throw Error('Każdy description musi zawierać trzy słowa.');
  if(typeof text!=='string'||text.trim().length>600||!/[\u0400-\u04ff]/u.test(text)||!/^[^.!?\r\n]+[.!?]\s+[^.!?\r\n]+[.!?]$/u.test(text.trim()))throw Error('Każdy primary text musi zawierać dwa zdania gibberish zapisane cyrylicą, do 600 znaków.');
  return {headline:(headline as string).trim(),text:text.trim(),description:(description as string).trim()};
 });
}
