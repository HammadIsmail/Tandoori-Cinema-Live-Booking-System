-- Mall1Tandoori Cinema — Storage Bucket

-- Create storage bucket for payment screenshots
insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

-- Policy: authenticated users can upload to their own folder
create policy "Payment screenshots: users can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Policy: authenticated users can read their own uploads
create policy "Payment screenshots: users can read own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Policy: admins can read all payment screenshots
create policy "Payment screenshots: admin can read all"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- Policy: admins can delete payment screenshots
create policy "Payment screenshots: admin can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );
