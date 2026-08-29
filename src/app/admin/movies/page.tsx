import { createClient } from "@/lib/supabase/server";
import AdminMoviesContent from "./AdminMoviesContent";

export default async function AdminMoviesPage() {
  const supabase = await createClient();

  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminMoviesContent movies={movies || []} />;
}
