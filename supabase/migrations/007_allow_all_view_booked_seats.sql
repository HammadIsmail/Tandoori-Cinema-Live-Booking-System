-- Allow anyone (even logged out users) to see which seats are booked
CREATE POLICY "Allow public read access to booking_seats" 
ON public.booking_seats FOR SELECT USING (true);

-- Allow anyone to see which seats are currently being held
CREATE POLICY "Allow public read access to seat_holds" 
ON public.seat_holds FOR SELECT USING (true);
