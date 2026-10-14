export function antkiStageLabel(status:string,phase:string){
 if(status==='ready')return 'Ready for review';
 if(status==='uncertain')return 'Check previous request';
 if(status==='failed')return 'Needs attention';
 const labels:Record<string,string>={text:'Localising UK text',image:'Starting UK image',poll:'Generating UK image',archive:'Saving UK image',deliver:'Saving to Sheet',done:'Ready for review'};
 return (status==='queued'?'Queued · ':'')+(labels[phase]||'Preparing UK version');
}
