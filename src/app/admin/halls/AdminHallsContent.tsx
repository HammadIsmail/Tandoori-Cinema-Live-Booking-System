"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Hall, LayoutConfig } from "@/lib/types";

const DEFAULT_LAYOUT: LayoutConfig = {
  total_rows: 8,
  seats_per_row: 12,
  aisles: [],
  tiers: {
    regular: { rows: ["E", "F", "G", "H"], price_label: "Regular" },
    gold: { rows: ["C", "D"], price_label: "Gold" },
    vip: { rows: ["A", "B"], price_label: "VIP" },
  },
};

export default function AdminHallsContent({ halls }: { halls: Hall[] }) {
  const [items, setItems] = useState(halls);
  const [editing, setEditing] = useState<Partial<Hall> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!editing?.name) return;
    setLoading(true);

    if (editing.id) {
      const { data } = await supabase
        .from("halls")
        .update({
          name: editing.name,
          description: editing.description,
          layout_config: editing.layout_config,
        })
        .eq("id", editing.id)
        .select()
        .single();
      if (data) setItems((prev) => prev.map((h) => (h.id === data.id ? data : h)));
    } else {
      const { data } = await supabase
        .from("halls")
        .insert({
          name: editing.name,
          description: editing.description,
          layout_config: editing.layout_config || DEFAULT_LAYOUT,
        })
        .select()
        .single();
      if (data) setItems((prev) => [data, ...prev]);
    }

    setEditing(null);
    setIsAdding(false);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hall? This will also delete all seats.")) return;
    await supabase.from("halls").delete().eq("id", id);
    setItems((prev) => prev.filter((h) => h.id !== id));
  };

  const updateLayout = (key: string, value: unknown) => {
    if (!editing) return;
    const layout = (editing.layout_config || DEFAULT_LAYOUT) as Record<string, unknown>;
    setEditing({
      ...editing,
      layout_config: { ...layout, [key]: value } as LayoutConfig,
    });
  };

  const layout = (editing?.layout_config || DEFAULT_LAYOUT) as LayoutConfig;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Halls</h1>
        <button
          onClick={() => {
            setEditing({ layout_config: DEFAULT_LAYOUT });
            setIsAdding(true);
          }}
          className="btn-pill text-sm px-5 py-2"
        >
          + Add Hall
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">
              {isAdding ? "Add Hall" : "Edit Hall"}
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Hall Name"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              />
              <input
                placeholder="Description"
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm"
              />

              {/* Layout Builder */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-sm mb-3">Seat Layout</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Total Rows</label>
                    <input
                      type="number"
                      value={layout.total_rows}
                      onChange={(e) =>
                        updateLayout("total_rows", Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Seats Per Row
                    </label>
                    <input
                      type="number"
                      value={layout.seats_per_row}
                      onChange={(e) =>
                        updateLayout("seats_per_row", Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-500">
                    Aisle Positions (comma-separated)
                  </label>
                  <input
                    placeholder="e.g. 4, 8"
                    value={(layout.aisles || []).join(", ")}
                    onChange={(e) =>
                      updateLayout(
                        "aisles",
                        e.target.value
                          .split(",")
                          .map((s) => parseInt(s.trim()))
                          .filter((n) => !isNaN(n))
                      )
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((hall) => {
          const lc = hall.layout_config as LayoutConfig;
          return (
            <div
              key={hall.id}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              <h3 className="font-bold text-[#1A1A1A]">{hall.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{hall.description}</p>
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p>
                  Rows: {lc.total_rows} • Seats/row: {lc.seats_per_row}
                </p>
                <p>
                  Tiers:{" "}
                  {Object.keys(lc.tiers || {})
                    .join(", ")}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditing(hall)}
                  className="text-[#FF6A00] text-xs font-medium hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hall.id)}
                  className="text-[#E63946] text-xs font-medium hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
