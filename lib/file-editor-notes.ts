export type EditorNoteDraft={raw:string;instruction:string;translatedFrom:string};
export function editorNoteReady(note?:EditorNoteDraft){return !note?.raw.trim()||note.translatedFrom===note.raw&&!!note.instruction.trim();}
export function notesForFile(shared:string,note?:EditorNoteDraft){
 if(!editorNoteReady(note))throw Error('Convert or review this file’s editor instruction before starting.');
 const result=[shared.trim(),note?.instruction.trim()].filter(Boolean).join('\n\n');
 if(result.length>4500)throw Error('Combined editor notes are too long. Keep them under 4,500 characters.');
 return result;
}
