import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import MovieDetailContent from "./MovieDetailContent";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: movie } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .single();

  if (!movie) notFound();

  const { data: showtimes } = await supabase
    .from("showtimes")
    .select("*, halls(name)")
    .eq("movie_id", id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <MovieDetailContent movie={movie} showtimes={showtimes || []} />
      </main>
      <Footer />
    </>
  );
}
