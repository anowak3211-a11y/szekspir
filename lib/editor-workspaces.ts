export const EDITOR_WORKSPACES=[
 {id:'mine',name:'Ja (admin)',sheetId:'1zi8uoLMsuRTK5cTpBNOiAkKXjEZs1MhNHqbyK5u5zk4'},
 {id:'editor-4',name:'Kyle Baniqued',sheetId:'1LZoHkbJGrtXqRHjF3rO6t0VT3wm4Qur4RAKgnLtp1c4'},
 {id:'editor-5',name:'Kashieca Nicole Cantila',sheetId:'1ObZ1PER8eqqY4qZBfkI9giMufTt0inHptPEqR-sGMAo'},
 {id:'editor-6',name:'Cedrick Manzanilla',sheetId:'116RyS6EAPj8DY9lXyGadMtX-2JeNk1CyODIkrKxDVnE'},
] as const;

// Persisted jobs/recovery drafts belonging to the retired editor stay under admin.
export function activeEditorId(id?:string){return !id||id==='editor-8'?'mine':id;}
