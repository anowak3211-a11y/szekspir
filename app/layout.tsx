import type {Metadata} from 'next';
import './globals.css';
import VideoQualityAlerts from './components/video-quality-alerts';
export const metadata:Metadata={title:'SZEKSPIR',description:'US → UK ad copy localiser'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-GB"><body><VideoQualityAlerts/>{children}</body></html>;}
