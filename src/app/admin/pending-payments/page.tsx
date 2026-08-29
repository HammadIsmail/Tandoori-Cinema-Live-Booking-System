import { createClient } from "@/lib/supabase/server";
import PendingPaymentsContent from "./PendingPaymentsContent";

export default async function PendingPaymentsPage() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, profiles(name, phone), showtimes(start_time, format, movies(title), halls(name)), booking_seats(price, seats(row_label, seat_number))")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return <PendingPaymentsContent bookings={bookings || []} />;
}
