import type {Job} from './jobs';
// The two combo assets are saved independently; provider URLs are never exported.
export function videoLinks(job:Pick<Job,'vmakeMode'|'enhancedSavedUrl'|'cleanUrl'|'driveUrl'|'videoDestination'>):string{
 if(job.videoDestination==='drive')return job.driveUrl||'';
 if(job.vmakeMode==='combo')return [job.enhancedSavedUrl&&`Enhanced · original subtitles: ${job.enhancedSavedUrl}`,job.cleanUrl&&`Enhanced · no subtitles: ${job.cleanUrl}`].filter(Boolean).join('\n');
 return job.driveUrl||job.cleanUrl||'';
}
