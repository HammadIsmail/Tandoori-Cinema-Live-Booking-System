import { createClient } from "@/lib/supabase/server";
import AdminBookingsContent from "./AdminBookingsContent";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, profiles(name, phone), showtimes(start_time, format, movies(title), halls(name)), booking_seats(price, seats(row_label, seat_number))")
    .order("created_at", { ascending: false });

  return <AdminBookingsContent bookings={bookings || []} />;
}
