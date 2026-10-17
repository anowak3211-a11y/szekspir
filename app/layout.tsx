import FrontendBoundary from './components/frontend-boundary';
import {headers} from 'next/headers';
import {verifyAccount,ACCOUNT_HEADER,type AccountIdentity} from '@/lib/account-identity';
import WorkspaceBoundary from './components/workspace-boundary';
import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'SZEKSPIR',description:'US → UK ad copy localiser'};
export default async function RootLayout({children}:{children:React.ReactNode}){if(process.env.APP_SHARED_API_ORIGIN)return <html lang="en-GB"><body><FrontendBoundary><nav className="account-nav" aria-label="Konto"><a href="/profile">Profil i moje klucze</a></nav>{children}</FrontendBoundary></body></html>;const identity=verifyAccount<AccountIdentity>((await headers()).get(ACCOUNT_HEADER));const namespace=identity?.workspace||(!identity?.owner&&identity?.id)||'owner';return <html lang="en-GB"><body><WorkspaceBoundary namespace={namespace}><nav className="account-nav" aria-label="Konto"><a href="/profile">Profil i moje klucze</a></nav>{children}</WorkspaceBoundary></body></html>;}
