import {send as platformSend,handleCallback as platformCallback,type SendOptions,type MessageHandler} from '@vercel/queue';
import {currentWorkspace,inWorkspace} from './account-context';
import {workspaceById} from './account-repository';
export async function send<T extends object>(topic:string,message:T,options?:SendOptions&{region?:string}){const id=currentWorkspace()?.id;return platformSend(topic,{...message,...(id?{workspaceId:id}:{})},options as Parameters<typeof platformSend>[2]);}
export function handleCallback<T extends object>(handler:MessageHandler<T>,options?:Parameters<typeof platformCallback>[1]){return platformCallback<T&{workspaceId?:string}>(async(message,metadata)=>{const user=message.workspaceId?await workspaceById(message.workspaceId):undefined;if(message.workspaceId&&(!user||user.state!=='ready'))throw Error('Workspace is unavailable.');return inWorkspace(user,()=>handler(message,metadata));},options);}
