import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import MoviesContent from "./MoviesContent";

export default async function MoviesPage() {
  const supabase = await createClient();

  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <MoviesContent movies={movies || []} />
      </main>
      <Footer />
    </>
  );
}
