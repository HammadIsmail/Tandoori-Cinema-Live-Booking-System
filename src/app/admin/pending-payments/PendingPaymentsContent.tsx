"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";
import type { Booking } from "@/lib/types";

type BookingWithDetails = Booking & {
  profiles: { name: string; phone: string } | null;
  showtimes: {
    start_time: string;
    format: string;
    movies: { title: string } | null;
    halls: { name: string } | null;
  } | null;
  booking_seats: Array<{
    price: number;
    seats: { row_label: string; seat_number: number } | null;
  }>;
};

export default function PendingPaymentsContent({
  bookings,
}: {
  bookings: BookingWithDetails[];
}) {
  const [items, setItems] = useState(bookings);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleApprove = async (booking: BookingWithDetails) => {
    setLoading(booking.id);

    // Update booking status
    await supabase
      .from("bookings")
      .update({ status: "approved" })
      .eq("id", booking.id);

    // Delete seat holds
    for (const bs of booking.booking_seats) {
      if (bs.seats) {
        await supabase
          .from("seat_holds")
          .delete()
          .eq("seat_id", bs.seats.row_label)
          .eq("showtime_id", booking.showtime_id);
      }
    }

    setItems((prev) => prev.filter((b) => b.id !== booking.id));
    setLoading(null);
    showToast("Payment approved! Customer can now view their ticket.", "success");
  };

  const handleReject = async (booking: BookingWithDetails) => {
    setLoading(booking.id);

    await supabase
      .from("bookings")
      .update({ status: "rejected" })
      .eq("id", booking.id);

    // Release seats — delete holds
    for (const bs of booking.booking_seats) {
      if (bs.seats) {
        await supabase
          .from("seat_holds")
          .delete()
          .eq("seat_id", bs.seats.row_label)
          .eq("showtime_id", booking.showtime_id);
      }
    }

    // Also delete booking_seats so seats become available
    await supabase.from("booking_seats").delete().eq("booking_id", booking.id);

    setItems((prev) => prev.filter((b) => b.id !== booking.id));
    setLoading(null);
    showToast("Payment rejected. Seats released back to available.", "info");
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
        Pending Payments
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">
          <p className="text-lg">No pending payments.</p>
          <p className="text-sm mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Screenshot */}
                {booking.payment_screenshot_url && (
                  <div className="w-full md:w-48 flex-shrink-0">
                    <a
                      href={booking.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={booking.payment_screenshot_url}
                        alt="Payment screenshot"
                        className="w-full h-48 object-cover rounded-xl border"
                      />
                    </a>
                    <p className="text-[10px] text-gray-400 text-center mt-1">
                      Click to view full size
                    </p>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#1A1A1A]">
                        {booking.showtimes?.movies?.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {booking.showtimes?.halls?.name} •{" "}
                        {booking.showtimes?.format}
                      </p>
                    </div>
                    <span className="text-[#E63946] font-bold text-lg">
                      Rs. {booking.total_amount}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <p>
                      <span className="font-medium">Customer:</span>{" "}
                      {booking.profiles?.name || booking.customer_name}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {booking.profiles?.phone || booking.customer_phone}
                    </p>
                    {booking.customer_email && (
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {booking.customer_email}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Payment:</span>{" "}
                      {booking.payment_method.toUpperCase()}
                    </p>
                    <p>
                      <span className="font-medium">Seats:</span>{" "}
                      {booking.booking_seats
                        .map(
                          (bs) =>
                            `${bs.seats?.row_label}${bs.seats?.seat_number}`
                        )
                        .join(", ")}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(booking)}
                      disabled={loading === booking.id}
                      className="px-6 py-2 rounded-full bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {loading === booking.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(booking)}
                      disabled={loading === booking.id}
                      className="px-6 py-2 rounded-full bg-[#E63946] text-white font-medium text-sm hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {loading === booking.id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
