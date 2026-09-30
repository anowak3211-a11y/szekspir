import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'SZEKSPIR',description:'US → UK ad copy localiser'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-GB"><body>{children}</body></html>;}
