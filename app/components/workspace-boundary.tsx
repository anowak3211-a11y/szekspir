'use client';
import {setBrowserWorkspace} from '@/lib/browser-workspace';
export default function WorkspaceBoundary({namespace,children}:{namespace:string;children:React.ReactNode}){setBrowserWorkspace(namespace);return <>{children}</>;}
