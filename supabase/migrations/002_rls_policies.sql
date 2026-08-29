-- Mall1Tandoori Cinema — RLS Policies

-- ============================================================
-- PROFILES policies
-- ============================================================
create policy "Profiles: users can read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Profiles: users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Profiles: admin can read all profiles"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================
-- MOVIES policies (public read, admin write)
-- ============================================================
create policy "Movies: anyone can read"
  on public.movies for select
  to anon, authenticated
  using (true);

create policy "Movies: admin can insert"
  on public.movies for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Movies: admin can update"
  on public.movies for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Movies: admin can delete"
  on public.movies for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================
-- HALLS policies (public read, admin write)
-- ============================================================
create policy "Halls: anyone can read"
  on public.halls for select
  to anon, authenticated
  using (true);

create policy "Halls: admin can insert"
  on public.halls for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Halls: admin can update"
  on public.halls for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Halls: admin can delete"
  on public.halls for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================
-- SEATS policies (public read, admin write)
-- ============================================================
create policy "Seats: anyone can read"
  on public.seats for select
  to anon, authenticated
  using (true);

create policy "Seats: admin can insert"
  on public.seats for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Seats: admin can update"
  on public.seats for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Seats: admin can delete"
  on public.seats for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================
-- SHOWTIMES policies (public read, admin write)
-- ============================================================
create policy "Showtimes: anyone can read"
  on public.showtimes for select
  to anon, authenticated
  using (true);

create policy "Showtimes: admin can insert"
  on public.showtimes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Showtimes: admin can update"
  on public.showtimes for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Showtimes: admin can delete"
  on public.showtimes for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================
-- BOOKINGS policies
-- ============================================================
create policy "Bookings: users can read own bookings"
  on public.bookings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Bookings: users can insert own bookings"
  on public.bookings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Bookings: admin can read all bookings"
  on public.bookings for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Bookings: admin can update booking status"
  on public.bookings for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================
-- BOOKING SEATS policies
-- ============================================================
create policy "Booking seats: users can read own booking seats"
  on public.booking_seats for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings
      where id = booking_id and user_id = (select auth.uid())
    )
  );

create policy "Booking seats: users can insert own booking seats"
  on public.booking_seats for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bookings
      where id = booking_id and user_id = (select auth.uid())
    )
  );

create policy "Booking seats: admin can read all"
  on public.booking_seats for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Booking seats: admin can delete"
  on public.booking_seats for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- ============================================================
-- SEAT HOLDS policies
-- ============================================================
create policy "Seat holds: authenticated can read holds for showtime"
  on public.seat_holds for select
  to authenticated
  using (true);

create policy "Seat holds: authenticated can insert holds"
  on public.seat_holds for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Seat holds: users can delete own holds"
  on public.seat_holds for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Seat holds: admin can delete all holds"
  on public.seat_holds for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );
