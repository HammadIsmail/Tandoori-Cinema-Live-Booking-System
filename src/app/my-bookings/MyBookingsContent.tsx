"use client";

import { useState } from "react";
import ETicket from "@/components/ETicket";
import type { Booking } from "@/lib/types";

type BookingWithDetails = Booking & {
  showtimes: {
    start_time: string;
    format: string;
    movies: { title: string; poster_url: string } | null;
    halls: { name: string } | null;
  } | null;
  booking_seats: Array<{
    price: number;
    seats: { row_label: string; seat_number: number; tier: string } | null;
  }>;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-green-50 text-green-600 border-green-200",
  rejected: "bg-red-50 text-[#E63946] border-red-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function MyBookingsContent({
  bookings,
}: {
  bookings: BookingWithDetails[];
}) {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  return (
    <>
      <div className="bg-gradient-primary text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
            My Bookings
          </p>
          <h1 className="text-3xl font-extrabold">Your Tickets</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No bookings yet.</p>
            <a href="/movies" className="text-[#FF6A00] font-medium hover:underline">
              Browse Movies →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isExpanded = expandedTicket === booking.id;
              const seats = booking.booking_seats
                .map((bs) => `${bs.seats?.row_label}${bs.seats?.seat_number}`)
                .filter(Boolean);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {booking.showtimes?.movies?.poster_url ? (
                        <img
                          src={booking.showtimes.movies.poster_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1A1A1A] text-sm">
                        {booking.showtimes?.movies?.title || "Movie"}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {booking.showtimes?.halls?.name} •{" "}
                        {booking.showtimes?.format}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {booking.showtimes &&
                          new Date(booking.showtimes.start_time).toLocaleDateString(
                            "en-PK",
                            { month: "short", day: "numeric" }
                          )}{" "}
                        at{" "}
                        {booking.showtimes &&
                          new Date(booking.showtimes.start_time).toLocaleTimeString(
                            "en-PK",
                            { hour: "2-digit", minute: "2-digit", hour12: true }
                          )}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {booking.booking_seats.map((bs, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-[#1A1A1A] text-[10px] font-medium px-2 py-0.5 rounded-full"
                          >
                            {bs.seats?.row_label}
                            {bs.seats?.seat_number}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${
                          STATUS_STYLES[booking.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                      <p className="text-[#E63946] font-bold text-sm mt-2">
                        Rs. {booking.total_amount}
                      </p>
                      <p className="text-gray-400 text-[10px] mt-1 uppercase">
                        {booking.payment_method}
                      </p>
                    </div>
                  </div>

                  {/* Approved — show ticket */}
                  {booking.status === "approved" && (
                    <div className="border-t bg-green-50/50">
                      <button
                        onClick={() =>
                          setExpandedTicket(isExpanded ? null : booking.id)
                        }
                        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-green-700 hover:bg-green-50 transition"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          {isExpanded ? "Hide Ticket" : "View Ticket"}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <ETicket
                            ticket={{
                              bookingId: booking.id,
                              movieTitle: booking.showtimes?.movies?.title || "Movie",
                              hallName: booking.showtimes?.halls?.name || "Hall",
                              format: booking.showtimes?.format || "2D",
                              date: booking.showtimes
                                ? new Date(booking.showtimes.start_time).toLocaleDateString("en-PK", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "",
                              time: booking.showtimes
                                ? new Date(booking.showtimes.start_time).toLocaleTimeString("en-PK", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                : "",
                              seats,
                              totalAmount: booking.total_amount,
                              customerName: booking.customer_name,
                              paymentMethod: booking.payment_method,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending */}
                  {booking.status === "pending" && (
                    <div className="border-t px-4 py-3 bg-amber-50/50">
                      <p className="text-xs text-amber-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Payment under review — you&apos;ll see your ticket once approved
                      </p>
                    </div>
                  )}

                  {/* Rejected */}
                  {booking.status === "rejected" && (
                    <div className="border-t px-4 py-3 bg-red-50/50">
                      <p className="text-xs text-[#E63946] flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Payment rejected — seats have been released
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
