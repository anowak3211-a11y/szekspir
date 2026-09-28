-- Dedicated app state; encrypted payloads retain the existing application key.
create table if not exists public.szekspir_state (
 name text primary key,
 payload text not null,
 version bigint not null default 1 check(version > 0),
 updated_at timestamptz not null default now()
);
alter table public.szekspir_state enable row level security;
revoke all on public.szekspir_state from public, anon, authenticated;
grant select, insert, update on public.szekspir_state to service_role;

create or replace function public.szekspir_state_read(p_name text)
returns table(payload text, version text)
language sql security invoker set search_path = '' as $$
 select s.payload, s.version::text from public.szekspir_state s where s.name=p_name;
$$;
create or replace function public.szekspir_state_write(p_name text,p_payload text,p_expected text default null)
returns text language plpgsql security invoker set search_path = '' as $$
declare next_version bigint;
begin
 if p_expected is null then
  insert into public.szekspir_state(name,payload) values(p_name,p_payload)
  on conflict(name) do nothing returning version into next_version;
 else
  update public.szekspir_state set payload=p_payload,version=version+1,updated_at=now()
  where name=p_name and version=p_expected::bigint returning version into next_version;
 end if;
 return next_version::text;
end;
$$;
revoke all on function public.szekspir_state_read(text) from public, anon, authenticated;
revoke all on function public.szekspir_state_write(text,text,text) from public, anon, authenticated;
grant execute on function public.szekspir_state_read(text) to service_role;
grant execute on function public.szekspir_state_write(text,text,text) to service_role;
notify pgrst, 'reload schema';
