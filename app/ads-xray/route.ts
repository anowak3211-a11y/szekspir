import templates from '@/lib/xray/templates.json';
export const dynamic='force-dynamic';
export function GET(request:Request){const mode=new URL(request.url).searchParams.get('tryb')||'similarities';return new Response(templates[mode as keyof typeof templates]||templates.similarities,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, private','Referrer-Policy':'same-origin','X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN'}});}
