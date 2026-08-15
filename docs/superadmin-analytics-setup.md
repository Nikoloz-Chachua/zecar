# Super-admin analytics setup

1. Create a dedicated ZECAR Supabase project and apply `supabase/migrations/20260815000000_superadmin_analytics.sql`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose or prefix the service-role key with `NEXT_PUBLIC_`.
3. Create the owner through Supabase Auth (never store a password in SQL), set trusted `app_metadata.role`, and add live membership:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"super_admin"}'::jsonb
where email = 'nikoloz.chachua10@gmail.com';

insert into public.analytics_admins(user_id)
select id from auth.users where email = 'nikoloz.chachua10@gmail.com'
on conflict (user_id) do nothing;
```

4. Sign in at `/admin/login`, enroll TOTP on `/admin/mfa`, and verify a code. TOTP/AAL2 is mandatory. If the authenticator is lost, recover/reset factors through the Supabase dashboard after verifying the owner.
5. Configure a Vercel Firewall rate rule for `/api/analytics/events`. The bounded in-process visitor/session limiter is best effort; it does not defeat determined bots or coordinate across instances.

Revoke access immediately by deleting the `analytics_admins` row; also remove the role and revoke sessions. Browser roles have no event mutation grant. The server ingestion route allowlists fields, chooses row IDs/timestamps, and treats repeated `event_id` delivery as success.

Events contain pathname, first landing referrer hostname, coarse device class, locale, and pseudonymous browser/tab identifiers. They never contain IP, raw user-agent, full referrer, query strings, names, email, exact location, or fingerprints. Browser IDs approximate browsers, not people. Events are retained for 90 days and browser IDs rotate after 90 days. DNT and Global Privacy Control disable tracking.
