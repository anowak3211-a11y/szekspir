import {mutate,readState} from './store';
import {accountNumber,parsePreferences,defaultPreferences,type UploaderPreferences} from './meta-uploader-preferences-model';
export * from './meta-uploader-preferences-model';
export async function readPreferences(account:unknown){const p=(await readState<UploaderPreferences>('meta-upload-preferences-'+accountNumber(account),defaultPreferences())).value;return {...p,enhancements:{...defaultPreferences().enhancements,...p.enhancements}};}
export async function savePreferences(account:unknown,raw:unknown){const settings=parsePreferences(raw);return mutate<UploaderPreferences,UploaderPreferences>('meta-upload-preferences-'+accountNumber(account),defaultPreferences(),current=>{if(current.revision!==settings.revision)throw Error('Settings changed in another tab. Reload before saving.');Object.assign(current,settings,{revision:current.revision+1});return current;});}
