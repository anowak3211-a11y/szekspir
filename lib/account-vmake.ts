import {createHmac} from 'node:crypto';
import {currentWorkspace,requiredAccountEnv} from './account-context';
/** Only server-to-server requests receive this short-lived credential envelope. */
export function accountVmakeHeaders():Record<string,string>{if(!currentWorkspace())return {};const value=Buffer.from(JSON.stringify({ak:requiredAccountEnv('MT_AK'),sk:requiredAccountEnv('MT_SK'),expires:Date.now()+120000})).toString('base64url');const secret=process.env.CRON_SECRET;if(!secret)throw Error('Machine access unavailable.');return {'x-szekspir-vmake':value+'.'+createHmac('sha256',secret).update('vmake-account-v1:'+value).digest('hex')};}
