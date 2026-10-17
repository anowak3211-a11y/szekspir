import {currentWorkspace,type EmployeeWorkspace} from './account-context';
import {EDITOR_WORKSPACES} from './editor-workspaces';
export const accountEditors=():EmployeeWorkspace[]=>currentWorkspace()?.editors||[...EDITOR_WORKSPACES];
