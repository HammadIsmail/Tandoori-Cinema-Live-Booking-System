"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Seat, SeatHold, BookingSeat } from "@/lib/types";
import type { LayoutConfig } from "@/lib/types";

type SeatStatus = "available" | "selected" | "booked" | "held" | "pending";

interface SeatWithStatus extends Seat {
  status: SeatStatus;
  price: number;
}

interface SeatMapProps {
  hallId: string;
  showtimeId: string;
  layoutConfig: LayoutConfig;
  basePriceRegular: number;
  basePriceGold: number;
  basePriceVip: number;
  userId: string | null;
  onSelectionChange: (seats: SeatWithStatus[], total: number) => void;
}

function getSeatPrice(
  tier: string,
  baseRegular: number,
  baseGold: number,
  baseVip: number
): number {
  switch (tier) {
    case "vip":
      return baseVip;
    case "gold":
      return baseGold;
    default:
      return baseRegular;
  }
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "vip":
      return "bg-purple-100 border-purple-300 text-purple-700";
    case "gold":
      return "bg-amber-50 border-amber-300 text-amber-700";
    default:
      return "bg-gray-100 border-gray-300 text-gray-600";
  }
}

function getStatusColor(status: SeatStatus): string {
  switch (status) {
    case "selected":
      return "bg-[#FF6A00] border-[#FF6A00] text-white scale-110 shadow-lg";
    case "booked":
      return "bg-[#E63946] border-[#E63946] text-white cursor-not-allowed";
    case "held":
      return "bg-amber-400 border-amber-400 text-white cursor-not-allowed";
    case "pending":
      return "bg-amber-400 border-amber-400 text-white cursor-not-allowed";
    default:
      return "";
  }
}

export default function SeatMap({
  hallId,
  showtimeId,
  layoutConfig,
  basePriceRegular,
  basePriceGold,
  basePriceVip,
  userId,
  onSelectionChange,
}: SeatMapProps) {
  const [seats, setSeats] = useState<SeatWithStatus[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSeats = useCallback(async () => {
    const { data: dbSeats } = await supabase
      .from("seats")
      .select("*")
      .eq("hall_id", hallId)
      .order("row_label")
      .order("seat_number");

    if (!dbSeats) return;

    // Fetch booked seats (approved bookings)
    const { data: bookedSeats } = await supabase
      .from("booking_seats")
      .select("seat_id, showtime_id")
      .eq("showtime_id", showtimeId);

    const { data: pendingSeats } = await supabase
      .from("seat_holds")
      .select("seat_id, user_id, expires_at")
      .eq("showtime_id", showtimeId);

    const bookedSet = new Set(
      (bookedSeats || []).map((bs) => bs.seat_id)
    );

    const heldMap = new Map<string, { user_id: string; expires_at: string }>();
    for (const h of pendingSeats || []) {
      if (new Date(h.expires_at) > new Date()) {
        heldMap.set(h.seat_id, { user_id: h.user_id, expires_at: h.expires_at });
      }
    }

    const enriched: SeatWithStatus[] = dbSeats.map((seat) => {
      let status: SeatStatus = "available";
      if (bookedSet.has(seat.id)) {
        status = "booked";
      } else {
        const hold = heldMap.get(seat.id);
        if (hold) {
          if (userId && hold.user_id === userId) {
            status = "selected";
          } else {
            status = "held";
          }
        }
      }
      return {
        ...seat,
        status,
        price: getSeatPrice(seat.tier, basePriceRegular, basePriceGold, basePriceVip),
      };
    });

    setSeats(enriched);
    setLoading(false);
  }, [hallId, showtimeId, userId, basePriceRegular, basePriceGold, basePriceVip, supabase]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel(`seats-${showtimeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_seats", filter: `showtime_id=eq.${showtimeId}` },
        () => fetchSeats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seat_holds", filter: `showtime_id=eq.${showtimeId}` },
        () => fetchSeats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showtimeId, fetchSeats, supabase]);

  // Handle seat click
  const handleSeatClick = async (seat: SeatWithStatus) => {
    if (seat.status === "booked" || seat.status === "held" || seat.status === "pending") return;
    if (!userId) return;

    if (seat.status === "selected") {
      // Deselect — remove hold
      await supabase
        .from("seat_holds")
        .delete()
        .eq("seat_id", seat.id)
        .eq("showtime_id", showtimeId)
        .eq("user_id", userId);

      const newSelected = new Set(selectedIds);
      newSelected.delete(seat.id);
      setSelectedIds(newSelected);

      const updatedSeats = seats.map((s) =>
        s.id === seat.id ? { ...s, status: "available" as SeatStatus } : s
      );
      setSeats(updatedSeats);
      const selectedSeats = updatedSeats.filter((s) => s.status === "selected");
      const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
      onSelectionChange(selectedSeats, total);
    } else {
      // Select — place hold
      const { error } = await supabase.from("seat_holds").upsert(
        {
          seat_id: seat.id,
          showtime_id: showtimeId,
          user_id: userId,
        },
        { onConflict: "seat_id,showtime_id" }
      );

      if (error) return;

      const newSelected = new Set(selectedIds);
      newSelected.add(seat.id);
      setSelectedIds(newSelected);

      const updatedSeats = seats.map((s) =>
        s.id === seat.id ? { ...s, status: "selected" as SeatStatus } : s
      );
      setSeats(updatedSeats);
      const selectedSeats = updatedSeats.filter((s) => s.status === "selected");
      const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
      onSelectionChange(selectedSeats, total);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Group seats by row
  const rows = new Map<string, SeatWithStatus[]>();
  for (const seat of seats) {
    if (!rows.has(seat.row_label)) rows.set(seat.row_label, []);
    rows.get(seat.row_label)!.push(seat);
  }

  const sortedRows = Array.from(rows.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="overflow-x-auto">
      {/* Screen indicator */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto max-w-md">
          <div className="h-2 bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent rounded-full" />
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">
            Screen
          </p>
        </div>
      </div>

      {/* Seat Grid — 3D perspective */}
      <div
        className="flex flex-col items-center gap-1.5 pb-8"
        style={{ perspective: "800px" }}
      >
        {sortedRows.map(([rowLabel, rowSeats]) => (
          <div
            key={rowLabel}
            className="flex items-center gap-1.5"
            style={{
              transform: "rotateX(15deg)",
              transformOrigin: "center bottom",
            }}
          >
            <span className="w-6 text-xs font-bold text-gray-400 text-right mr-1">
              {rowLabel}
            </span>
            {rowSeats
              .sort((a, b) => a.seat_number - b.seat_number)
              .map((seat, idx) => {
                // Insert aisle gap
                const aisleAfter = layoutConfig.aisles.includes(idx);
                return (
                  <span key={seat.id} className="flex items-center">
                    <button
                      onClick={() => handleSeatClick(seat)}
                      disabled={
                        seat.status === "booked" ||
                        seat.status === "held" ||
                        seat.status === "pending"
                      }
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-t-lg border-2 text-[10px] font-bold transition-all duration-200 flex items-center justify-center ${
                        seat.status === "selected" || seat.status === "available"
                          ? getStatusColor(seat.status) || getTierColor(seat.tier)
                          : getStatusColor(seat.status)
                      }`}
                      title={`${seat.row_label}${seat.seat_number} — ${seat.tier.toUpperCase()} — Rs. ${seat.price}`}
                    >
                      {seat.seat_number}
                    </button>
                    {aisleAfter && <div className="w-3" />}
                  </span>
                );
              })}
            <span className="w-6 text-xs font-bold text-gray-400 ml-1">
              {rowLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#FF6A00]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#E63946]" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-400" />
          <span>Held</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300" />
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-50 border border-amber-300" />
          <span>Gold</span>
        </div>
      </div>
    </div>
  );
}
