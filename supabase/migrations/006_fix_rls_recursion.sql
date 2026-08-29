-- Mall1Tandoori Cinema — Fix infinite recursion in profiles RLS
-- The profiles admin policy was querying profiles itself, causing recursion.
-- Fix: use a SECURITY DEFINER function to check role from auth.users metadata.

-- Step 1: Create a function that reads role from app_metadata (no profiles query)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
    'customer'
  );
$$;

-- Step 2: Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() = 'admin';
$$;

-- Step 3: Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Profiles: users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: admin can read all profiles" ON public.profiles;

-- Step 4: Recreate profiles policies without self-reference
CREATE POLICY "Profiles: users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Profiles: users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Profiles: admin can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Step 5: Drop and recreate all other policies that reference profiles
-- BOOKINGS
DROP POLICY IF EXISTS "Bookings: admin can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Bookings: admin can update booking status" ON public.bookings;

CREATE POLICY "Bookings: admin can read all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Bookings: admin can update booking status"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- BOOKING SEATS
DROP POLICY IF EXISTS "Booking seats: admin can read all" ON public.booking_seats;
DROP POLICY IF EXISTS "Booking seats: admin can delete" ON public.booking_seats;

CREATE POLICY "Booking seats: admin can read all"
  ON public.booking_seats FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Booking seats: admin can delete"
  ON public.booking_seats FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- SEAT HOLDS
DROP POLICY IF EXISTS "Seat holds: admin can delete all holds" ON public.seat_holds;

CREATE POLICY "Seat holds: admin can delete all holds"
  ON public.seat_holds FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- MOVIES (admin policies)
DROP POLICY IF EXISTS "Movies: admin can insert" ON public.movies;
DROP POLICY IF EXISTS "Movies: admin can update" ON public.movies;
DROP POLICY IF EXISTS "Movies: admin can delete" ON public.movies;

CREATE POLICY "Movies: admin can insert"
  ON public.movies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Movies: admin can update"
  ON public.movies FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Movies: admin can delete"
  ON public.movies FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- HALLS (admin policies)
DROP POLICY IF EXISTS "Halls: admin can insert" ON public.halls;
DROP POLICY IF EXISTS "Halls: admin can update" ON public.halls;
DROP POLICY IF EXISTS "Halls: admin can delete" ON public.halls;

CREATE POLICY "Halls: admin can insert"
  ON public.halls FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Halls: admin can update"
  ON public.halls FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Halls: admin can delete"
  ON public.halls FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- SEATS (admin policies)
DROP POLICY IF EXISTS "Seats: admin can insert" ON public.seats;
DROP POLICY IF EXISTS "Seats: admin can update" ON public.seats;
DROP POLICY IF EXISTS "Seats: admin can delete" ON public.seats;

CREATE POLICY "Seats: admin can insert"
  ON public.seats FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Seats: admin can update"
  ON public.seats FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Seats: admin can delete"
  ON public.seats FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- SHOWTIMES (admin policies)
DROP POLICY IF EXISTS "Showtimes: admin can insert" ON public.showtimes;
DROP POLICY IF EXISTS "Showtimes: admin can update" ON public.showtimes;
DROP POLICY IF EXISTS "Showtimes: admin can delete" ON public.showtimes;

CREATE POLICY "Showtimes: admin can insert"
  ON public.showtimes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Showtimes: admin can update"
  ON public.showtimes FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Showtimes: admin can delete"
  ON public.showtimes FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- STORAGE admin policies
DROP POLICY IF EXISTS "Payment screenshots: admin can read all" ON storage.objects;
DROP POLICY IF EXISTS "Payment screenshots: admin can delete" ON storage.objects;

CREATE POLICY "Payment screenshots: admin can read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND public.is_admin()
  );

CREATE POLICY "Payment screenshots: admin can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND public.is_admin()
  );

-- Step 6: Update the signup trigger to store role in app_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  );
  -- Store role in app_metadata for JWT (so RLS can read it without querying profiles)
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "customer"}'::jsonb
  WHERE id = new.id;
  RETURN new;
END;
$$;
