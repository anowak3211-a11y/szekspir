'use client';
let namespace='owner';
export function setBrowserWorkspace(value:string){namespace=value;}
export function browserWorkspaceKey(value:string){return namespace==='owner'?value:'workspace:'+namespace+':'+value;}
export const workspaceLocalStorage={getItem:(key:string)=>localStorage.getItem(browserWorkspaceKey(key)),setItem:(key:string,value:string)=>localStorage.setItem(browserWorkspaceKey(key),value),removeItem:(key:string)=>localStorage.removeItem(browserWorkspaceKey(key))};
export const workspaceSessionStorage={getItem:(key:string)=>sessionStorage.getItem(browserWorkspaceKey(key)),setItem:(key:string,value:string)=>sessionStorage.setItem(browserWorkspaceKey(key),value),removeItem:(key:string)=>sessionStorage.removeItem(browserWorkspaceKey(key))};
