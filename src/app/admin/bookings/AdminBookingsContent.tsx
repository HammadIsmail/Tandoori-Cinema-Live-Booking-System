"use client";

import { useState } from "react";
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

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-[#E63946]",
  expired: "bg-gray-50 text-gray-500",
};

export default function AdminBookingsContent({
  bookings,
}: {
  bookings: BookingWithDetails[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.showtimes?.movies?.title?.toLowerCase().includes(search.toLowerCase()) ||
      false;
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    const headers = [
      "ID",
      "Customer",
      "Movie",
      "Hall",
      "Date",
      "Seats",
      "Amount",
      "Status",
      "Payment",
      "Created",
    ];
    const rows = filtered.map((b) => [
      b.id,
      b.profiles?.name || b.customer_name,
      b.showtimes?.movies?.title || "",
      b.showtimes?.halls?.name || "",
      b.showtimes
        ? new Date(b.showtimes.start_time).toLocaleString("en-PK")
        : "",
      b.booking_seats
        .map((bs) => `${bs.seats?.row_label}${bs.seats?.seat_number}`)
        .join("; "),
      b.total_amount,
      b.status,
      b.payment_method,
      new Date(b.created_at).toLocaleString("en-PK"),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Bookings History</h1>
        <button
          onClick={exportCSV}
          className="px-5 py-2 rounded-full border border-[#FF6A00] text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00] hover:text-white transition"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by customer or movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-500">Movie</th>
                <th className="px-4 py-3 font-medium text-gray-500">Showtime</th>
                <th className="px-4 py-3 font-medium text-gray-500">Seats</th>
                <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{b.profiles?.name || b.customer_name}</td>
                  <td className="px-4 py-3 font-medium">
                    {b.showtimes?.movies?.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {b.showtimes?.halls?.name} •{" "}
                    {b.showtimes &&
                      new Date(b.showtimes.start_time).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                      })}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {b.booking_seats
                      .map((bs) => `${bs.seats?.row_label}${bs.seats?.seat_number}`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 font-medium">Rs. {b.total_amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[b.status] || ""
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(b.created_at).toLocaleDateString("en-PK")}
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
