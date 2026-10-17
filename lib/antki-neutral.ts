export type AntkiNeutralVersion={headline:string;text:string;revision:number;updated:number};

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
