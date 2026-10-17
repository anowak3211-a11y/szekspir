'use client';
import HomeTiles from './home-tiles';
import {useFrontendProfile} from './frontend-boundary';
export default function FrontendHome(){const profile=useFrontendProfile();if(!profile)return null;return <HomeTiles adminSheetId={profile.workspace?.adminSheetId} editorSheetId={profile.workspace?.editors.find(e=>e.id==='mine')?.sheetId}/>;}
