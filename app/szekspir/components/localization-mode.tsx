'use client';
import type {LocalizationMode} from '@/lib/localization-mode';

export default function LocalizationModeChoice({value,onChange,polish=false,disabled=false}:{value:LocalizationMode;onChange:(mode:LocalizationMode)=>void;polish?:boolean;disabled?:boolean}){
 const options: {value:LocalizationMode;title:string;description:string}[]=polish?[
  {value:'close',title:'Bliska lokalizacja — rip z VMake',description:'Zachowaj sceny, kolejność i konstrukcję zdań. Dostosuj język, markę, ofertę i lokalne realia.'},
  {value:'full',title:'Pełniejsza lokalizacja — wideo od zera',description:'Przepisz składnię, hook i scenariusz pod rynek. Nowe sceny i montaż przygotowuje edytor.'},
 ]:[
  {value:'close',title:'Close localisation — VMake rip',description:'Keep scenes, order and sentence structure. Adapt language, brand, offer and local references.'},
  {value:'full',title:'Full localisation — video from scratch',description:'Rewrite phrasing, hook and script for the market. The editor creates new visuals and montage.'},
 ];
 return <fieldset className="cta-choices" disabled={disabled}><legend className="cta-legend">{polish?'Tryb lokalizacji':'Localisation mode'}</legend>{options.map(option=><label className={`workflow-option ${value===option.value?'selected':''}`} key={option.value}><input type="radio" name="localization-mode" value={option.value} checked={value===option.value} onChange={()=>onChange(option.value)}/><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</fieldset>;
}
