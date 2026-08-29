import { createClient } from "@/lib/supabase/server";
import AdminHallsContent from "./AdminHallsContent";

export default async function AdminHallsPage() {
  const supabase = await createClient();

  const { data: halls } = await supabase
    .from("halls")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminHallsContent halls={halls || []} />;
}
