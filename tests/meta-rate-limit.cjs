const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('module');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
let state={calls:[],accessTier:'full'},now=1800000000000;const original=Module._load,realNow=Date.now;Date.now=()=>now;
Module._load=function(n,p,i){if(n==='./store'&&p?.filename.endsWith('/lib/meta-rate-limit.ts'))return {mutate:async(k,d,fn)=>fn(state),readState:async()=>({value:state})};return original.call(this,n,p,i);};
(async()=>{let started=0;const limiter=require('../lib/meta-rate-limit.ts'),releases=[],running=[];
for(let i=0;i<5;i++){running.push(limiter.withMetaBudget(async()=>{started++;await new Promise(r=>releases.push(r));return 1;}));await new Promise(r=>setImmediate(r));now+=1000;}
assert.equal((await limiter.metaBudgetStatus()).inFlightRequests,5);
await assert.rejects(()=>limiter.withMetaBudget(async()=>{started++;}),e=>e instanceof limiter.MetaBudgetWait&&e.retryAfterSeconds===2&&e.reason==='busy');assert.equal(started,5);
releases.forEach(r=>r());assert.deepEqual(await Promise.all(running),[1,1,1,1,1]);assert.equal((await limiter.metaBudgetStatus()).inFlightRequests,0);
// Old single-lease requests remain reserved until expiry during rollout.
state={calls:[],accessTier:'full',lease:'legacy-request',leaseUntil:now+210000,leases:Object.fromEntries(Array.from({length:4},(_,i)=>['other-'+i,now+210000]))};await assert.rejects(()=>limiter.withMetaBudget(async()=>started++),e=>e.reason==='busy');state={calls:[],accessTier:'full'};
now+=6000;await assert.rejects(()=>limiter.withMetaBudget(async()=>{throw Error('unknown network result');}),/unknown network/);assert.equal(state.lease,undefined);
state={calls:[],accessTier:'full'};assert.equal(await limiter.recordMetaUsage(new Headers({'x-business-use-case-usage':JSON.stringify({'123':[{call_count:84,estimated_time_to_regain_access:12}]})})),720);await assert.rejects(()=>limiter.withMetaBudget(async()=>started++),e=>e.retryAfterSeconds===720);
state={calls:[],accessTier:'full'};assert.equal(await limiter.recordMetaUsage(new Headers(),true),300);assert.equal(await limiter.recordMetaUsage(new Headers(),true),600);assert.equal(limiter.metaUsage(new Headers({'x-fb-ads-insights-throttle':JSON.stringify({app_id_util_pct:95})})).usage,95);assert.equal(limiter.metaUsage(new Headers({'x-ad-account-usage':JSON.stringify({acc_id_util_pct:95,reset_time_duration:600})})).seconds,600);state={calls:[],accessTier:'full'};assert.equal(await limiter.recordMetaUsage(new Headers({'x-ad-account-usage':JSON.stringify({acc_id_util_pct:1,reset_time_duration:600})})),0,'Low usage reset estimate is not a cooldown');assert(limiter.isMetaRateLimit(80004));assert(limiter.isMetaRateLimit(1675004));assert(!limiter.isMetaRateLimit(100));assert.equal(limiter.metaUsage(new Headers({'x-app-usage':'bad-json'})).usage,0);
state={accessTier:'full',calls:Array.from({length:6000},()=>now-1000)};await assert.rejects(()=>limiter.withMetaBudget(async()=>started++),e=>e.retryAfterSeconds===3599);now+=3600001;await limiter.withMetaBudget(async()=>started++);assert.equal(state.calls.length,1);
state={calls:[],accessTier:'full',points:Array.from({length:400},()=>({at:now-1000,cost:3}))};await assert.rejects(()=>limiter.withMetaBudget(async()=>started++,3),e=>e.reason==='local_budget'&&e.retryAfterSeconds===299);assert.equal(state.calls.length,0,'Weighted write cap rejects before network');// Fifty adverts: conservatively allow six reads and three writes each. No network.
state={calls:[],accessTier:'full'};const batchStart=now;for(let ad=0;ad<50;ad++){for(const cost of [1,1,1,1,1,1,3,3,3]){await limiter.withMetaBudget(async()=>started++,cost);now+=1000;}}
assert.equal(state.calls.length,450);assert.equal(now-batchStart,450000,'Bulk throughput is one request per second without five-minute stalls');
assert.equal((await limiter.metaBudgetStatus()).minSpacingSeconds,1);assert.equal((await limiter.metaBudgetStatus()).localHourlyCap,6000);assert.equal((await limiter.metaBudgetStatus()).localFiveMinutePointCap,1200);
await limiter.recordMetaUsage(new Headers({'retry-after':'120'}));await assert.rejects(()=>limiter.withMetaBudget(async()=>started++),e=>e.reason==='provider_cooldown'&&e.retryAfterSeconds===120,'Bulk mode still obeys provider Retry-After');
state={calls:[],accessTier:'full'};await limiter.recordMetaUsage(new Headers({'x-ad-account-usage':JSON.stringify({acc_id_util_pct:0,ads_api_access_tier:'standard_access'})}));assert.equal((await limiter.metaBudgetStatus()).accessTier,'full');

state={calls:[],accessTier:'limited'};now+=5000;let releaseLimited;const limited=limiter.withMetaBudget(()=>new Promise(r=>{releaseLimited=r;}));await new Promise(r=>setImmediate(r));now+=3000;await assert.rejects(()=>limiter.withMetaBudget(async()=>started++),e=>e.reason==='busy');releaseLimited(1);await limited;
assert.equal((await limiter.metaBudgetStatus()).maxConcurrentRequests,1);assert.equal((await limiter.metaBudgetStatus()).minSpacingSeconds,3);assert.equal((await limiter.metaBudgetStatus()).localFiveMinutePointCap,45);
state={calls:[],accessTier:'limited',points:Array.from({length:15},()=>({at:now-1000,cost:3}))};await assert.rejects(()=>limiter.withMetaBudget(async()=>started++,1),e=>e.reason==='local_budget');
// A write needs three points: waking for only the first expiring read can starve writes.
state={calls:[],accessTier:'limited',points:[{at:now-299000,cost:1},{at:now-290000,cost:1},{at:now-280000,cost:1},...Array.from({length:14},()=>({at:now-1000,cost:3}))]};
await assert.rejects(()=>limiter.withMetaBudget(async()=>started++,3),e=>e.reason==='local_budget'&&e.retryAfterSeconds===20,'Wait until enough weighted points expire for the entire write');
// Only two points free: do not consume them in preflight GETs before a POST.
state={calls:[],accessTier:'limited',points:Array.from({length:43},()=>({at:now-290000,cost:1}))};
await assert.rejects(()=>limiter.assertMetaStageBudget(6),e=>e.reason==='local_budget'&&e.retryAfterSeconds===10);
assert.equal(state.calls.length,0,'Stage preflight does not consume a point or call Meta');
now+=10001;await limiter.assertMetaStageBudget(6);assert.equal(state.calls.length,0);
state={calls:[],accessTier:'limited',cooldown:now+120000};await assert.rejects(()=>limiter.assertMetaStageBudget(6),e=>e.reason==='provider_cooldown'&&e.retryAfterSeconds===120);
state={calls:[]};assert.equal((await limiter.metaBudgetStatus()).maxConcurrentRequests,1,'Unknown access is conservative until full access is confirmed');
console.log('PASS: bounded five-request concurrency, lease cleanup, shared usage-header cooldown, throttle families, malformed headers and rolling-hour cap and 50-ad throughput with provider backoff. No Meta calls.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>Date.now=realNow);
