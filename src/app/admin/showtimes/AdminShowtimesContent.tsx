"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Showtime } from "@/lib/types";

type ShowtimeWithRelations = Showtime & {
  movies: { title: string } | null;
  halls: { name: string } | null;
};

interface AdminShowtimesContentProps {
  showtimes: ShowtimeWithRelations[];
  movies: { id: string; title: string }[];
  halls: { id: string; name: string }[];
}

export default function AdminShowtimesContent({
  showtimes,
  movies,
  halls,
}: AdminShowtimesContentProps) {
  const [items, setItems] = useState(showtimes);
  const [editing, setEditing] = useState<Partial<Showtime> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!editing?.movie_id || !editing?.hall_id || !editing?.start_time) return;
    setLoading(true);

    if (editing.id) {
      const { data } = await supabase
        .from("showtimes")
        .update(editing)
        .eq("id", editing.id)
        .select("*, movies(title), halls(name)")
        .single();
      if (data) setItems((prev) => prev.map((s) => (s.id === data.id ? data : s)));
    } else {
      const { data } = await supabase
        .from("showtimes")
        .insert(editing)
        .select("*, movies(title), halls(name)")
        .single();
      if (data) setItems((prev) => [...prev, data]);
    }

    setEditing(null);
    setIsAdding(false);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this showtime?")) return;
    await supabase.from("showtimes").delete().eq("id", id);
    setItems((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Showtimes</h1>
        <button
          onClick={() => {
            setEditing({ format: "2D", base_price_regular: 500, base_price_gold: 800, base_price_vip: 1200 });
            setIsAdding(true);
          }}
          className="btn-pill text-sm px-5 py-2"
        >
          + Add Showtime
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="font-bold text-lg mb-4">
              {isAdding ? "Add Showtime" : "Edit Showtime"}
            </h2>
            <div className="space-y-3">
              <select
                value={editing.movie_id || ""}
                onChange={(e) =>
                  setEditing({ ...editing, movie_id: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              >
                <option value="">Select Movie</option>
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              <select
                value={editing.hall_id || ""}
                onChange={(e) =>
                  setEditing({ ...editing, hall_id: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              >
                <option value="">Select Hall</option>
                {halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={
                  editing.start_time
                    ? new Date(editing.start_time).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    start_time: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              />
              <select
                value={editing.format || "2D"}
                onChange={(e) =>
                  setEditing({ ...editing, format: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
                <option value="4DX">4DX</option>
              </select>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Regular (Rs.)</label>
                  <input
                    type="number"
                    value={editing.base_price_regular || 500}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        base_price_regular: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Gold (Rs.)</label>
                  <input
                    type="number"
                    value={editing.base_price_gold || 800}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        base_price_gold: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">VIP (Rs.)</label>
                  <input
                    type="number"
                    value={editing.base_price_vip || 1200}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        base_price_vip: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-pill text-sm px-5 py-2"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setIsAdding(false);
                }}
                className="px-5 py-2 rounded-full border text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Movie</th>
                <th className="px-4 py-3 font-medium text-gray-500">Hall</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date & Time</th>
                <th className="px-4 py-3 font-medium text-gray-500">Format</th>
                <th className="px-4 py-3 font-medium text-gray-500">Prices (R/G/V)</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((st) => (
                <tr key={st.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {st.movies?.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {st.halls?.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(st.start_time).toLocaleString("en-PK", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-xs font-medium px-2 py-0.5 rounded-full">
                      {st.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {st.base_price_regular}/{st.base_price_gold}/{st.base_price_vip}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(st)}
                        className="text-[#FF6A00] text-xs font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(st.id)}
                        className="text-[#E63946] text-xs font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
