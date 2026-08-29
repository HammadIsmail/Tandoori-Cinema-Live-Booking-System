-- Mall1Tandoori Cinema — pg_cron: Auto-expire stale seat holds
-- Run this after enabling the pg_cron extension

-- Enable pg_cron extension (if not already enabled)
create extension if not exists pg_cron;

-- Schedule expire_stale_holds to run every minute
SELECT cron.schedule(
  'expire-stale-seat-holds',
  '* * * * *',
  $$DELETE FROM public.seat_holds WHERE expires_at < now()$$
);
