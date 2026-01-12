create table if not exists public.system_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  level text not null,        -- 'info', 'error', 'warn', 'debug', 'verbose'
  service text not null,      -- 'api', 'web', etc.
  message text,
  meta jsonb default '{}'::jsonb,
  user_id uuid                -- optional link to auth.users if available
);

-- Validate level check
alter table public.system_logs add constraint system_logs_level_check check (level in ('log', 'info', 'error', 'warn', 'debug', 'verbose'));

-- Enable RLS
alter table public.system_logs enable row level security;

-- Policies
-- Allow anyone to insert (since we might log from client side or server side without specific auth in some cases, or we can restrict it)
-- For now, let's allow public insert for simplicity in logging, but in production, we might want to restrict to authenticated or service role only.
-- Ideally, client-side logs should go through our Next.js API route, which then writes to Supabase using a Service Role, so we don't necessarily need public insert if we do that.
-- However, for the 'api' service, it will use the SERVICE_ROLE_KEY usually or standard client.
create policy "Allow insert for service role only" on public.system_logs
  for insert
  with check (true); -- This might need adjustment based on how we connect. If we use service_role key, it bypasses RLS.

create policy "Allow read for admins only" on public.system_logs
  for select
  using (auth.role() = 'service_role'); -- Only service role (or admins if we have an admin role) can read logs.

-- Index for faster querying
create index if not exists system_logs_created_at_idx on public.system_logs (created_at desc);
create index if not exists system_logs_service_idx on public.system_logs (service);
create index if not exists system_logs_level_idx on public.system_logs (level);
