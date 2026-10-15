export const dynamic = 'force-dynamic';
import Workspace from './workspace';
import { MODES, type Mode } from '@/lib/xray/ui-model';
export default async function Page({ searchParams }: {
    searchParams: Promise<{
        tryb?: string;
        job?: string;
        historia?: string;
    }>;
}) { const params = await searchParams; return <Workspace initialMode={MODES.includes(params.tryb as Mode) ? params.tryb as Mode : 'similarities'} jobId={params.job} historyId={params.historia}/>; }
