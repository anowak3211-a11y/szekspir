import type {VoiceTiming} from '@/lib/vo-cleanup';
export default function StoryStems({timing}:{timing?:VoiceTiming}){
 if(!timing?.dryUrl&&!timing?.ambienceUrl&&!timing?.ambienceWarning)return null;
 return <div>{timing.ambienceWarning&&<p role="alert">{timing.ambienceWarning}</p>}{timing.dryUrl&&<p><a href={timing.dryUrl} target="_blank" rel="noreferrer">Download clean voice · no background</a></p>}{timing.ambienceUrl&&<p><a href={timing.ambienceUrl} target="_blank" rel="noreferrer">Download background loop · separate track</a></p>}</div>;
}
