"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SeatMap from "@/components/SeatMap";
import Link from "next/link";

interface SeatSelectionContentProps {
  showtime: {
    id: string;
    start_time: string;
    format: string;
    base_price_regular: number;
    base_price_gold: number;
    base_price_vip: number;
    movies: { title: string; poster_url: string; format: string } | null;
    halls: {
      id: string;
      name: string;
      layout_config: Record<string, unknown>;
    };
  };
  userId: string | null;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface SelectedSeat {
  id: string;
  row_label: string;
  seat_number: number;
  tier: string;
  price: number;
}

export default function SeatSelectionContent({
  showtime,
  userId,
}: SeatSelectionContentProps) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const handleSelectionChange = (seats: SelectedSeat[], newTotal: number) => {
    setSelectedSeats(seats);
    setTotal(newTotal);
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    // Store selection in sessionStorage for checkout page
    sessionStorage.setItem(
      "bookingSelection",
      JSON.stringify({
        showtimeId: showtime.id,
        seats: selectedSeats,
        total,
      })
    );
    router.push(`/checkout?showtime=${showtime.id}`);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-[#0F1419] text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
              {showtime.movies?.poster_url ? (
                <img
                  src={showtime.movies.poster_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <h1 className="font-bold text-lg">{showtime.movies?.title}</h1>
              <p className="text-gray-400 text-sm">
                {formatDate(showtime.start_time)} • {formatTime(showtime.start_time)} •{" "}
                {showtime.halls.name} • {showtime.format}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Seat Map */}
          <div className="flex-1">
            <SeatMap
              hallId={showtime.halls.id}
              showtimeId={showtime.id}
              layoutConfig={showtime.halls.layout_config as any}
              basePriceRegular={showtime.base_price_regular}
              basePriceGold={showtime.base_price_gold}
              basePriceVip={showtime.base_price_vip}
              userId={userId}
              onSelectionChange={handleSelectionChange}
            />
          </div>

          {/* Order Summary & Preview */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Order Summary</h3>

              {selectedSeats.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">
                  Tap seats on the map to select them
                </p>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {seat.row_label}
                          {seat.seat_number}{" "}
                          <span className="text-xs text-gray-400 uppercase">
                            ({seat.tier})
                          </span>
                        </span>
                        <span className="font-medium">Rs. {seat.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between font-bold text-[#1A1A1A]">
                      <span>Total ({selectedSeats.length} seats)</span>
                      <span className="text-[#E63946]">Rs. {total}</span>
                    </div>
                  </div>

                  {userId ? (
                    <button onClick={handleCheckout} className="btn-pill w-full text-center">
                      Proceed to Checkout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="btn-pill w-full text-center block text-center"
                    >
                      Sign in to Book
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
