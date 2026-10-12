import type {Job} from './jobs';
/** Preparation completion does not authorise a paid, unreviewed recording. */
export function voiceApprovalPending(job?:Job){return !!(job?.result&&!job.result.no_speech&&!job.cancelledAt&&!job.abortedAt&&!job.forceFinishedAt&&job.voiceoverEnabled!==false&&!job.generateVo&&(!job.voUrl||job.voNeedsRegeneration));}
