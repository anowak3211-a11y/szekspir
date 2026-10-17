'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import WorkspaceBoundary from './workspace-boundary';
type Profile={email:string;owner:boolean;workspace:null|{id:string;name:string;adminSheetId?:string;editors:{id:string;sheetId:string}[]}};
const ProfileContext=createContext<Profile|null>(null);
export function useFrontendProfile(){return useContext(ProfileContext);}
export default function FrontendBoundary({children}:{children:React.ReactNode}){
 const path=usePathname(),publicPage=['/login','/join','/privacy'].includes(path);
 const [profile,setProfile]=useState<Profile|null>(null),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false;if(publicPage){setProfile(null);return;}
 fetch('/api/profile',{cache:'no-store'}).then(async response=>{if(response.status===401){window.location.replace('/login');return null;}if(!response.ok)throw Error('Nie udało się połączyć z kontem.');return response.json();}).then(data=>{if(!cancelled&&data){setProfile(data);setError('');}}).catch(e=>{if(!cancelled)setError(e.message);});
 return()=>{cancelled=true;};},[path,publicPage]);
 if(publicPage)return <WorkspaceBoundary namespace="frontend-sign-in">{children}</WorkspaceBoundary>;
 if(!profile)return <main className="wrap"><p role={error?'alert':'status'}>{error||'Łączenie z Twoim kontem…'}</p>{error&&<a href="/login">Przejdź do logowania</a>}</main>;
 const namespace=profile.workspace?.id||(profile.owner?'owner':profile.email);
 return <ProfileContext.Provider value={profile}><WorkspaceBoundary namespace={namespace}><p className="wrap sub">{profile.workspace?.name||profile.email} · Twój obszar pracy</p>{children}</WorkspaceBoundary></ProfileContext.Provider>;
}
