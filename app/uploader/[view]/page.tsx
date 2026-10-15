import {notFound} from 'next/navigation';
import Uploader from '../uploader';
export default async function Page({params}:{params:Promise<{view:string}>}){const {view}=await params;if(!['dashboard','history','settings','teams','help'].includes(view))notFound();return <Uploader initialView={view}/>;}
