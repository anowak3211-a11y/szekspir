'use client';
import type {LocalizationMode} from '@/lib/localization-mode';

export default function LocalizationModeChoice({value,onChange,polish=false,disabled=false}:{value:LocalizationMode;onChange:(mode:LocalizationMode)=>void;polish?:boolean;disabled?:boolean}){
 const options: {value:LocalizationMode;title:string;description:string}[]=polish?[
  {value:'close',title:'Bliska lokalizacja — rip z VMake',description:'Zachowaj sceny, kolejność i konstrukcję zdań. Dostosuj język, markę, ofertę i lokalne realia.'},
  {value:'full',title:'Nowy scenariusz — twórcze przepisanie',description:'Przepisz składnię, hook i scenariusz pod rynek. Nowe sceny i montaż przygotowuje edytor.'},
  {value:'gemini',title:'Gemini rip — skrypt z Gemini lub mocny DR (2+1)',description:'Wklej gotowy skrypt z czatu Gemini (pomija AI, od razu lektor + VMake + arkusz) lub zlokalizuj z pazurem DR i ofertą 2+1 gratis.'},
 ]:[
  {value:'close',title:'Close localisation — VMake rip',description:'Keep scenes, order and sentence structure. Adapt language, brand, offer and local references.'},
  {value:'full',title:'Creative rewrite — new script',description:'Rewrite phrasing, hook and script for the market. The editor creates new visuals and montage.'},
  {value:'gemini',title:'Gemini rip — paste Gemini script or DR + 2+1 Free',description:'Paste a ready script from Gemini to skip AI rewrite (straight to VO + VMake + sheet), or auto-adapt with DR punch and Buy 2, Get 1 Free.'},
 ];
 return <fieldset className="localization-mode-choices" disabled={disabled}>
  <legend>{polish?'Tryb lokalizacji':'Localisation mode'}</legend>
  <div className="localization-mode-grid">
   {options.map(option=><label className="localization-mode-option" key={option.value}>
    <input type="radio" name="localization-mode" value={option.value} checked={value===option.value} onChange={()=>onChange(option.value)}/>
    <span><strong>{option.title}</strong><small>{option.description}</small></span>
   </label>)}
  </div>
 </fieldset>;
}
