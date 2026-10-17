import FrontendHome from './components/frontend-home';
import HomeTiles from './components/home-tiles';
import {headers} from 'next/headers';
import {ACCOUNT_HEADER,verifyAccount,type AccountIdentity} from '@/lib/account-identity';
import {memberWorkspace,workspaceById} from '@/lib/account-repository';
import {EDITOR_WORKSPACES} from '@/lib/editor-workspaces';

export default async function Home() {
 if(process.env.APP_SHARED_API_ORIGIN)return <FrontendHome/>;
 const identity=verifyAccount<AccountIdentity>((await headers()).get(ACCOUNT_HEADER));const user=identity?(identity.owner?(identity.workspace?await workspaceById(identity.workspace):undefined):await memberWorkspace(identity.email)):undefined;const editors=user?.editors||[...EDITOR_WORKSPACES];

 return <HomeTiles adminSheetId={user?.values.ADMIN_SHEET_ID||'17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY'} editorSheetId={editors.find(editor=>editor.id==='mine')?.sheetId}/>;
}
