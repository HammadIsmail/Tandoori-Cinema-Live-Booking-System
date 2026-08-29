import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import CheckoutContent from "./CheckoutContent";

export default async function CheckoutPage({
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

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: showtime } = await supabase
    .from("showtimes")
    .select("*, movies(title, poster_url), halls(name)")
    .eq("id", showtimeId)
    .single();

  if (!showtime) redirect("/movies");

  return (
    <>
      <TopBar />
      <main className="flex-1">
        <CheckoutContent
          showtime={showtime}
          profile={profile}
          userId={user.id}
        />
      </main>
    </>
  );
}
