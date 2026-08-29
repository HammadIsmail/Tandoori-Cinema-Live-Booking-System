import { createClient } from "@/lib/supabase/server";
import AdminShowtimesContent from "./AdminShowtimesContent";

export default async function AdminShowtimesPage() {
  const supabase = await createClient();

  const [{ data: showtimes }, { data: movies }, { data: halls }] =
    await Promise.all([
      supabase
        .from("showtimes")
        .select("*, movies(title), halls(name)")
        .order("start_time", { ascending: true }),
      supabase.from("movies").select("id, title"),
      supabase.from("halls").select("id, name"),
    ]);

  return (
    <AdminShowtimesContent
      showtimes={showtimes || []}
      movies={movies || []}
      halls={halls || []}
    />
  );
}
