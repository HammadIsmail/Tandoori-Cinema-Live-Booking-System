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

function ChairIcon({ status, tier, label }: { status: string, tier: string, label: string | number }) {
  let fillColor = "#f3f4f6"; // default available
  let strokeColor = "#d1d5db";
  let textColor = "#4b5563";

  if (status === "selected") {
    fillColor = "#FF6A00";
    strokeColor = "#ea580c";
    textColor = "#ffffff";
  } else if (status === "booked") {
    fillColor = "#E63946";
    strokeColor = "#be123c";
    textColor = "#ffffff";
  } else if (status === "held" || status === "pending") {
    fillColor = "#fbbf24";
    strokeColor = "#d97706";
    textColor = "#ffffff";
  } else if (tier === "vip") {
    fillColor = "#f3e8ff"; 
    strokeColor = "#d8b4fe"; 
    textColor = "#7e22ce"; 
  } else if (tier === "gold") {
    fillColor = "#fffbeb"; 
    strokeColor = "#fcd34d"; 
    textColor = "#b45309"; 
  }

  return (
    <div className={`relative w-8 h-10 md:w-10 md:h-12 transition-transform duration-200 flex items-center justify-center ${status === "selected" ? "scale-110 drop-shadow-md z-10" : "hover:scale-110 hover:z-10"}`}>
      <svg viewBox="0 0 40 48" className="w-full h-full drop-shadow-sm">
        {/* Chair Back */}
        <path d="M10 4 C10 2 12 0 15 0 L25 0 C28 0 30 2 30 4 L30 22 C30 23 29 24 28 24 L12 24 C11 24 10 23 10 22 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Headrest dark patch */}
        <rect x="14" y="2" width="12" height="6" rx="1.5" fill="rgba(0,0,0,0.15)" />
        {/* Seat Bottom */}
        <path d="M8 22 C8 20 10 20 12 20 L28 20 C30 20 32 20 32 22 L32 30 C32 34 30 36 26 36 L14 36 C10 36 8 34 8 30 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Armrests */}
        <rect x="4" y="12" width="5" height="14" rx="2.5" fill="#374151" />
        <rect x="31" y="12" width="5" height="14" rx="2.5" fill="#374151" />
        {/* Label */}
        <text x="20" y="28" fontSize="11" fontWeight="900" fill={textColor} textAnchor="middle" dy=".35em">
          {label}
        </text>
      </svg>
    </div>
  );
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
        className="flex flex-col items-center gap-2 pb-8"
        style={{ perspective: "1000px" }}
      >
        {sortedRows.map(([rowLabel, rowSeats]) => (
          <div
            key={rowLabel}
            className="flex items-center gap-2"
            style={{
              transform: "rotateX(20deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <span className="w-8 text-sm font-extrabold text-gray-400 text-right mr-2">
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
                      className={`focus:outline-none focus:ring-2 focus:ring-[#FF6A00] rounded-xl transition-all duration-200 ${seat.status !== "available" && seat.status !== "selected" ? "cursor-not-allowed opacity-80" : ""}`}
                      title={`${seat.row_label}${seat.seat_number} — ${seat.tier.toUpperCase()} — Rs. ${seat.price}`}
                    >
                      <ChairIcon status={seat.status} tier={seat.tier} label={seat.seat_number} />
                    </button>
                    {aisleAfter && <div className="w-6" />}
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
