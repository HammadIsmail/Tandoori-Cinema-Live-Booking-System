"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

export default function VerifyTicketContent() {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  
  const supabase = createClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) return;

    setLoading(true);
    setSearched(true);
    setTicketData(null);

    const searchId = bookingId.trim().toLowerCase();

    // The user enters an 8-character prefix of the UUID (e.g. 8524be7d)
    // UUIDs format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    // We can do an efficient range query to find it without casting to text!
    const paddedSearchId = searchId.padEnd(8, '0').substring(0, 8);
    const minUuid = `${paddedSearchId}-0000-0000-0000-000000000000`;
    const maxUuid = `${paddedSearchId}-ffff-ffff-ffff-ffffffffffff`;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles ( name, phone ),
        showtimes (
          start_time,
          format,
          movies ( title ),
          halls ( name )
        ),
        booking_seats (
          seats ( row_label, seat_number )
        )
      `)
      .gte("id", minUuid)
      .lte("id", maxUuid);

    if (error) {
      console.error(error);
      showToast("Error searching for ticket.", "error");
    } else if (data && data.length > 0) {
      // In case of multiple matches (unlikely for 8 chars UUID), take the first one
      setTicketData(data[0]);
    } else {
      // No matches found
      setTicketData(null);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Verify Ticket</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="Enter 8-digit Booking ID (e.g. 4E9B2175)"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-mono"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !bookingId}
            className="px-8 py-3 bg-[#FF6A00] text-white font-bold rounded-xl hover:bg-[#FF8A3D] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Searching..."
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Verify
              </>
            )}
          </button>
        </form>
      </div>

      {searched && !loading && !ticketData && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-bold text-lg">Invalid Ticket</p>
          <p className="text-sm mt-1">No booking found matching this ID. This ticket might be fake.</p>
        </div>
      )}

      {ticketData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-in">
          <div className={`px-6 py-4 border-b flex justify-between items-center ${
            ticketData.status === 'approved' 
              ? 'bg-green-50 border-green-100' 
              : ticketData.status === 'pending'
                ? 'bg-yellow-50 border-yellow-100'
                : 'bg-red-50 border-red-100'
          }`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Ticket Status</p>
              <div className="flex items-center gap-2">
                {ticketData.status === 'approved' && (
                  <span className="text-green-600 font-bold text-lg flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    VALID TICKET
                  </span>
                )}
                {ticketData.status === 'pending' && (
                  <span className="text-yellow-600 font-bold text-lg flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    PAYMENT PENDING
                  </span>
                )}
                {ticketData.status === 'rejected' && (
                  <span className="text-red-600 font-bold text-lg flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    REJECTED / CANCELLED
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Booking ID</p>
              <p className="font-mono font-bold text-lg">{ticketData.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Movie & Showtime</p>
              <p className="font-bold text-[#1A1A1A] text-lg">{ticketData.showtimes?.movies?.title}</p>
              <p className="text-gray-500">{ticketData.showtimes?.halls?.name} • {ticketData.showtimes?.format}</p>
              {ticketData.showtimes?.start_time && (
                <p className="text-gray-500">
                  {new Date(ticketData.showtimes.start_time).toLocaleString('en-PK', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Customer Info</p>
              <p className="font-bold text-[#1A1A1A] text-lg">{ticketData.profiles?.name || ticketData.customer_name}</p>
              <p className="text-gray-500">{ticketData.profiles?.phone || ticketData.customer_phone}</p>
              {ticketData.customer_email && <p className="text-gray-500">{ticketData.customer_email}</p>}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Seats Booked</p>
              <div className="flex flex-wrap gap-2">
                {ticketData.booking_seats?.map((bs: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-[#1A1A1A] font-bold rounded-lg text-sm border border-gray-200">
                    {bs.seats?.row_label}{bs.seats?.seat_number}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Payment</p>
              <p className="font-bold text-lg text-[#E63946]">Rs. {ticketData.total_amount}</p>
              <p className="text-gray-500 text-sm font-medium uppercase">{ticketData.payment_method}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
