import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import MyBookingsContent from "./MyBookingsContent";

export default async function MyBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, showtimes(start_time, format, movies(title, poster_url), halls(name)), booking_seats(price, seats(row_label, seat_number, tier))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <MyBookingsContent bookings={bookings || []} />
      </main>
      <Footer />
    </>
  );
}
