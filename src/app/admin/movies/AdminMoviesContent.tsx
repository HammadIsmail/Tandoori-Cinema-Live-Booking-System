"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Movie } from "@/lib/types";

const EMPTY_MOVIE = {
  title: "",
  synopsis: "",
  genre: "",
  format: "2D",
  duration_minutes: 120,
  poster_url: "",
  trailer_url: "",
  cast_members: "",
  status: "now_showing" as const,
};

export default function AdminMoviesContent({ movies }: { movies: Movie[] }) {
  const [items, setItems] = useState(movies);
  const [editing, setEditing] = useState<Partial<Movie> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!editing?.title) return;
    setLoading(true);

    if (editing.id) {
      const { data } = await supabase
        .from("movies")
        .update(editing)
        .eq("id", editing.id)
        .select()
        .single();
      if (data) setItems((prev) => prev.map((m) => (m.id === data.id ? data : m)));
    } else {
      const { data } = await supabase
        .from("movies")
        .insert(editing)
        .select()
        .single();
      if (data) setItems((prev) => [data, ...prev]);
    }

    setEditing(null);
    setIsAdding(false);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    await supabase.from("movies").delete().eq("id", id);
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Movies</h1>
        <button
          onClick={() => {
            setEditing({ ...EMPTY_MOVIE });
            setIsAdding(true);
          }}
          className="btn-pill text-sm px-5 py-2"
        >
          + Add Movie
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">
              {isAdding ? "Add Movie" : "Edit Movie"}
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              />
              <textarea
                placeholder="Synopsis"
                value={editing.synopsis || ""}
                onChange={(e) =>
                  setEditing({ ...editing, synopsis: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm h-24"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Genre"
                  value={editing.genre || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, genre: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-xl border text-sm"
                />
                <select
                  value={editing.format || "2D"}
                  onChange={(e) =>
                    setEditing({ ...editing, format: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-xl border text-sm"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={editing.duration_minutes || 120}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      duration_minutes: Number(e.target.value),
                    })
                  }
                  className="px-4 py-2.5 rounded-xl border text-sm"
                />
                <select
                  value={editing.status || "now_showing"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as "now_showing" | "coming_soon",
                    })
                  }
                  className="px-4 py-2.5 rounded-xl border text-sm"
                >
                  <option value="now_showing">Now Showing</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>
              <input
                placeholder="Poster URL"
                value={editing.poster_url || ""}
                onChange={(e) =>
                  setEditing({ ...editing, poster_url: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              />
              <input
                placeholder="Trailer embed URL"
                value={editing.trailer_url || ""}
                onChange={(e) =>
                  setEditing({ ...editing, trailer_url: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              />
              <input
                placeholder="Cast (comma-separated)"
                value={editing.cast_members || ""}
                onChange={(e) =>
                  setEditing({ ...editing, cast_members: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={loading} className="btn-pill text-sm px-5 py-2">
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500">Format</th>
                <th className="px-4 py-3 font-medium text-gray-500">Genre</th>
                <th className="px-4 py-3 font-medium text-gray-500">Duration</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{movie.title}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-xs font-medium px-2 py-0.5 rounded-full">
                      {movie.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{movie.genre}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {movie.duration_minutes} min
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        movie.status === "now_showing"
                          ? "bg-green-50 text-green-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {movie.status === "now_showing"
                        ? "Now Showing"
                        : "Coming Soon"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(movie)}
                        className="text-[#FF6A00] text-xs font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
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
