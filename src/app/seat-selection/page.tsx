import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import SeatSelectionContent from "./SeatSelectionContent";

export default async function SeatSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ showtime?: string }>;
}) {
  const { showtime: showtimeId } = await searchParams;
  if (!showtimeId) redirect("/movies");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: showtime } = await supabase
    .from("showtimes")
    .select("*, movies(title, poster_url, format), halls(id, name, layout_config)")
    .eq("id", showtimeId)
    .single();

  if (!showtime) redirect("/movies");

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <SeatSelectionContent
          showtime={showtime}
          userId={user?.id || null}
        />
      </main>
    </>
  );
}
