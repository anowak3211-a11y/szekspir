import {currentWorkspace,type EmployeeWorkspace} from './account-context';
import {EDITOR_WORKSPACES} from './editor-workspaces';
export const accountEditors=(fallback:readonly EmployeeWorkspace[]=EDITOR_WORKSPACES):EmployeeWorkspace[]=>currentWorkspace()?.editors||[...fallback];

