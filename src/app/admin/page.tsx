import { createClient } from "@/lib/supabase/server";
import AdminAnalyticsContent from "./AdminAnalyticsContent";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Get all approved bookings with details
  const { data: approvedBookings } = await supabase
    .from("bookings")
    .select("*, showtimes(start_time, format, movies(title, id), halls(name, id)), booking_seats(price)")
    .eq("status", "approved");

  const bookings = approvedBookings || [];

  // Total revenue
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_amount, 0);

  // Total tickets
  const totalTickets = bookings.reduce(
    (sum, b) => sum + b.booking_seats.length,
    0
  );

  // Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayBookings = bookings.filter(
    (b) => new Date(b.created_at) >= today
  );
  const todayRevenue = todayBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const todayTickets = todayBookings.reduce(
    (sum, b) => sum + b.booking_seats.length,
    0
  );

  // This week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekBookings = bookings.filter(
    (b) => new Date(b.created_at) >= weekStart
  );
  const weekRevenue = weekBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const weekTickets = weekBookings.reduce(
    (sum, b) => sum + b.booking_seats.length,
    0
  );

  // This month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthBookings = bookings.filter(
    (b) => new Date(b.created_at) >= monthStart
  );
  const monthRevenue = monthBookings.reduce(
    (sum, b) => sum + b.total_amount,
    0
  );
  const monthTickets = monthBookings.reduce(
    (sum, b) => sum + b.booking_seats.length,
    0
  );

  // Revenue by movie
  const movieRevenueMap = new Map<string, { title: string; revenue: number; tickets: number }>();
  for (const b of bookings) {
    const movieTitle = b.showtimes?.movies?.title || "Unknown";
    const movieId = b.showtimes?.movies?.id || "unknown";
    const existing = movieRevenueMap.get(movieId) || {
      title: movieTitle,
      revenue: 0,
      tickets: 0,
    };
    existing.revenue += b.total_amount;
    existing.tickets += b.booking_seats.length;
    movieRevenueMap.set(movieId, existing);
  }
  const revenueByMovie = Array.from(movieRevenueMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  // Revenue by format
  const formatRevenueMap = new Map<string, number>();
  for (const b of bookings) {
    const format = b.showtimes?.format || "Unknown";
    formatRevenueMap.set(
      format,
      (formatRevenueMap.get(format) || 0) + b.total_amount
    );
  }
  const revenueByFormat = Array.from(formatRevenueMap.entries()).map(
    ([format, revenue]) => ({ format, revenue })
  );

  // Revenue by hall
  const hallRevenueMap = new Map<string, number>();
  for (const b of bookings) {
    const hall = b.showtimes?.halls?.name || "Unknown";
    hallRevenueMap.set(hall, (hallRevenueMap.get(hall) || 0) + b.total_amount);
  }
  const revenueByHall = Array.from(hallRevenueMap.entries()).map(
    ([hall, revenue]) => ({ hall, revenue })
  );

  // Daily revenue (last 30 days)
  const dailyRevenue: { date: string; revenue: number; tickets: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayBookings = bookings.filter((b) => {
      const created = new Date(b.created_at);
      return created >= d && created < nextDay;
    });
    dailyRevenue.push({
      date: d.toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
      revenue: dayBookings.reduce((sum, b) => sum + b.total_amount, 0),
      tickets: dayBookings.reduce((sum, b) => sum + b.booking_seats.length, 0),
    });
  }

  return (
    <AdminAnalyticsContent
      stats={{
        totalRevenue,
        totalTickets,
        todayRevenue,
        todayTickets,
        weekRevenue,
        weekTickets,
        monthRevenue,
        monthTickets,
      }}
      revenueByMovie={revenueByMovie}
      revenueByFormat={revenueByFormat}
      revenueByHall={revenueByHall}
      dailyRevenue={dailyRevenue}
    />
  );
}
