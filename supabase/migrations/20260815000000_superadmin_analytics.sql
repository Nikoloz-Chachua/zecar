-- Pseudonymous browser analytics. Never store IP, raw user-agent, full referrer, query strings, or fingerprints.
create extension if not exists pgcrypto;

create table if not exists public.analytics_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.analytics_admins enable row level security;
revoke all on public.analytics_admins from anon, authenticated;
grant select on public.analytics_admins to authenticated;
drop policy if exists analytics_admin_read_self on public.analytics_admins;
create policy analytics_admin_read_self on public.analytics_admins for select to authenticated using (user_id = auth.uid());
comment on table public.analytics_admins is 'Live allowlist for the private analytics console; mutate only through trusted SQL/dashboard administration.';

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique,
  created_at timestamptz not null default now(),
  event_name text not null check (event_name in ('page_view','vehicle_view','contact_click','outbound_click')),
  path text not null check (length(path) between 1 and 300 and path like '/%' and path not like '/admin%' and position('?' in path)=0 and position('#' in path)=0),
  vehicle_slug text check (vehicle_slug is null or (length(vehicle_slug) <= 100 and vehicle_slug ~ '^[a-z0-9-]+$')),
  visitor_id text not null check (length(visitor_id) between 8 and 100),
  session_id text not null check (length(session_id) between 8 and 100),
  referrer_host text check (referrer_host is null or (length(referrer_host) <= 253 and referrer_host ~ '^[A-Za-z0-9.-]+$')),
  locale text not null check (locale in ('ka','en','ru','unknown')),
  device_class text not null check (device_class in ('mobile','tablet','desktop','unknown')),
  metadata jsonb not null default '{}'::jsonb check (
    pg_column_size(metadata) <= 1024 and jsonb_typeof(metadata) = 'object'
    and metadata - array['return_visitor','link_kind']::text[] = '{}'::jsonb
    and (not metadata ? 'return_visitor' or jsonb_typeof(metadata -> 'return_visitor') = 'boolean')
    and (not metadata ? 'link_kind' or metadata ->> 'link_kind' in ('phone','email','whatsapp','inquiry','external','credit'))
  )
);
alter table public.analytics_events add column if not exists event_id uuid;
update public.analytics_events set event_id = gen_random_uuid() where event_id is null;
alter table public.analytics_events alter column event_id set not null;
create unique index if not exists analytics_events_event_id_idx on public.analytics_events(event_id);
alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;
grant select on public.analytics_events to authenticated;
drop policy if exists analytics_insert_valid on public.analytics_events;
drop policy if exists super_admin_read_analytics on public.analytics_events;
create policy super_admin_read_analytics on public.analytics_events for select to authenticated using (
  auth.uid() is not null
  and auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin'
  and auth.jwt() ->> 'aal' = 'aal2'
  and exists (select 1 from public.analytics_admins a where a.user_id = auth.uid())
);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_vehicle_slug_idx on public.analytics_events (vehicle_slug) where vehicle_slug is not null;
create index if not exists analytics_events_visitor_id_idx on public.analytics_events (visitor_id);
comment on table public.analytics_events is 'Pseudonymous browser-level activity retained for 90 days; identifiers approximate browsers, not people.';
comment on column public.analytics_events.event_id is 'Client delivery UUID used only for idempotency; server chooses row id and created_at.';

create or replace function public.cleanup_analytics_events() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.analytics_events where created_at < now() - interval '90 days';
  return new;
end $$;
revoke all on function public.cleanup_analytics_events() from public, anon, authenticated;
drop trigger if exists analytics_events_retention on public.analytics_events;
create trigger analytics_events_retention after insert on public.analytics_events
for each statement execute function public.cleanup_analytics_events();

create or replace function public.get_analytics_dashboard(p_days integer) returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare result jsonb; start_utc timestamptz; end_utc timestamptz;
begin
  if p_days not in (7,30,90) then raise exception 'invalid range'; end if;
  if auth.uid() is null
    or auth.jwt() -> 'app_metadata' ->> 'role' <> 'super_admin'
    or auth.jwt() ->> 'aal' <> 'aal2'
    or not exists (select 1 from public.analytics_admins a where a.user_id=auth.uid())
  then raise exception 'not authorized'; end if;
  start_utc := ((current_timestamp at time zone 'Asia/Tbilisi')::date - (p_days - 1))::timestamp at time zone 'Asia/Tbilisi';
  end_utc := (((current_timestamp at time zone 'Asia/Tbilisi')::date + 1)::timestamp at time zone 'Asia/Tbilisi');
  with events as (
    select * from public.analytics_events where created_at >= start_utc and created_at < end_utc
  ), page_views as (select * from events where event_name='page_view'),
  days as (select d::date date from generate_series((start_utc at time zone 'Asia/Tbilisi')::date,(end_utc at time zone 'Asia/Tbilisi')::date-1,interval '1 day') d),
  recent as (select created_at,event_name,path,vehicle_slug,locale,device_class,metadata from events order by created_at desc, id desc limit 20)
  select jsonb_build_object(
    'timezone','Asia/Tbilisi','days',p_days,
    'kpis',jsonb_build_object('pageViews',(select count(*) from page_views),'uniqueVisitors',(select count(distinct case when nullif(btrim(visitor_id),'') is not null then 'v:'||btrim(visitor_id) when nullif(btrim(session_id),'') is not null then 's:'||btrim(session_id) end) from page_views),'tabSessions',(select count(distinct nullif(btrim(session_id),'')) from page_views),'vehicleViews',(select count(*) from events where event_name='vehicle_view'),'contactClicks',(select count(*) from events where event_name='contact_click')),
    'daily',(select coalesce(jsonb_agg(jsonb_build_object('date',days.date,'count',coalesce(x.count,0)) order by days.date),'[]') from days left join (select (created_at at time zone 'Asia/Tbilisi')::date date,count(*) count from page_views group by 1)x using(date)),
    'topVehicles',(select coalesce(jsonb_agg(v),'[]') from (select vehicle_slug label,count(*) count from events where event_name='vehicle_view' and vehicle_slug is not null group by 1 order by 2 desc,1 limit 8)v),
    'topPages',(select coalesce(jsonb_agg(v),'[]') from (select path label,count(*) count from page_views group by 1 order by 2 desc,1 limit 8)v),
    'contacts',(select coalesce(jsonb_agg(v),'[]') from (select coalesce(metadata->>'link_kind','unknown') label,count(*) count from events where event_name='contact_click' group by 1 order by 2 desc,1)v),
    'referrers',(select coalesce(jsonb_agg(v),'[]') from (select coalesce(referrer_host,'Direct') label,count(*) count from page_views where metadata ? 'return_visitor' group by 1 order by 2 desc,1 limit 8)v),
    'devices',(select coalesce(jsonb_agg(v),'[]') from (select device_class label,count(*) count from page_views group by 1 order by 2 desc,1)v),
    'locales',(select coalesce(jsonb_agg(v),'[]') from (select locale label,count(*) count from page_views group by 1 order by 2 desc,1)v),
    'recent',(select coalesce(jsonb_agg(to_jsonb(recent)),'[]') from recent)
  ) into result;
  return result;
end $$;
revoke all on function public.get_analytics_dashboard(integer) from public, anon;
grant execute on function public.get_analytics_dashboard(integer) to authenticated;
comment on function public.get_analytics_dashboard(integer) is 'Full calendar-day aggregates in Asia/Tbilisi with safe recent activity and internal role, membership, and AAL2 authorization.';
