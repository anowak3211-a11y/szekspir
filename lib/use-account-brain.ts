'use client';
import {useEffect,useState} from 'react';
export type AccountBrain={provider:string;model:string;baseURL?:string};
export function useAccountBrain(){const [brain,setBrain]=useState<AccountBrain|null|undefined>(undefined);useEffect(()=>{const controller=new AbortController();fetch('/api/profile?view=brain',{cache:'no-store',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Profile unavailable');return r.json();}).then(d=>setBrain(d?.brain?.provider?d.brain:null)).catch(()=>{});return ()=>controller.abort();},[]);return brain;}
export function brainLabel(brain:AccountBrain){return ({openai:'OpenAI',anthropic:'Claude',gemini:'Gemini',custom:'Własne API'}[brain.provider]||brain.provider)+' · '+brain.model;}
