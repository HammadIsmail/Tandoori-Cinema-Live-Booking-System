-- Mall1Tandoori Cinema — Triggers

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- Auto-update updated_at on bookings
-- ============================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_bookings_updated_at
  before update on public.bookings
  for each row
  execute function public.update_updated_at();

-- ============================================================
-- Auto-expire stale seat holds (10 min window)
-- Run this as a scheduled pg_cron job or call periodically
-- ============================================================
create or replace function public.expire_stale_holds()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.seat_holds
  where expires_at < now();
end;
$$;
