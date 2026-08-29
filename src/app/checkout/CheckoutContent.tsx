"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";
import type { Profile } from "@/lib/types";

interface CheckoutContentProps {
  showtime: {
    id: string;
    start_time: string;
    format: string;
    movies: { title: string; poster_url: string } | null;
    halls: { name: string };
  };
  profile: Profile | null;
  userId: string;
}

export default function CheckoutContent({
  showtime,
  profile,
  userId,
}: CheckoutContentProps) {
  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa">(
    "jazzcash"
  );
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [selection, setSelection] = useState<{
    seats: Array<{
      id: string;
      row_label: string;
      seat_number: number;
      tier: string;
      price: number;
    }>;
    total: number;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("bookingSelection");
    if (stored) {
      setSelection(JSON.parse(stored));
    } else {
      router.push(`/seat-selection?showtime=${showtime.id}`);
    }
  }, [showtime.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection || !screenshot) return;

    setLoading(true);
    setError("");

    // Upload screenshot
    const fileExt = screenshot.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-screenshots")
      .upload(filePath, screenshot);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      showToast(`Upload failed: ${uploadError.message}`, "error");
      setError(`Failed to upload: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    // Get URL for uploaded file
    const { data: urlData } = supabase.storage
      .from("payment-screenshots")
      .getPublicUrl(filePath);

    const screenshotUrl = urlData.publicUrl;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        showtime_id: showtime.id,
        status: "pending",
        payment_method: paymentMethod,
        payment_screenshot_url: screenshotUrl,
        total_amount: selection.total,
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking error:", bookingError);
      showToast(`Booking failed: ${bookingError.message}`, "error");
      setError(`Booking failed: ${bookingError.message}`);
      setLoading(false);
      return;
    }

    // Create booking_seats
    const seatInserts = selection.seats.map((seat) => ({
      booking_id: booking.id,
      seat_id: seat.id,
      showtime_id: showtime.id,
      price: seat.price,
    }));

    const { error: seatsError } = await supabase
      .from("booking_seats")
      .insert(seatInserts);

    if (seatsError) {
      showToast("Failed to reserve seats.", "error");
      setError("Failed to reserve seats. Please try again.");
      setLoading(false);
      return;
    }

    // Remove seat holds
    for (const seat of selection.seats) {
      await supabase
        .from("seat_holds")
        .delete()
        .eq("seat_id", seat.id)
        .eq("showtime_id", showtime.id)
        .eq("user_id", userId);
    }

    sessionStorage.removeItem("bookingSelection");
    showToast("Booking submitted! Awaiting payment approval.", "success");
    router.push("/my-bookings");
  };

  if (!selection) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-primary text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
            Checkout
          </p>
          <h1 className="text-2xl font-extrabold">Complete Your Booking</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-[#E63946] text-sm rounded-xl p-4">
              {error}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-3">Booking Summary</h3>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-[#1A1A1A]">
                  {showtime.movies?.title}
                </span>
              </p>
              <p>
                {showtime.halls.name} • {showtime.format}
              </p>
              <p>
                {new Date(showtime.start_time).toLocaleDateString("en-PK", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at{" "}
                {new Date(showtime.start_time).toLocaleTimeString("en-PK", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
            <div className="border-t mt-3 pt-3">
              <p className="text-xs text-gray-400 mb-2">Seats:</p>
              <div className="flex flex-wrap gap-2">
                {selection.seats.map((s) => (
                  <span
                    key={s.id}
                    className="bg-gray-100 text-[#1A1A1A] text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {s.row_label}
                    {s.seat_number} ({s.tier})
                  </span>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-3">
                <span>Total</span>
                <span className="text-[#E63946]">Rs. {selection.total}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("jazzcash")}
                className={`p-4 rounded-xl border-2 text-center font-medium transition ${
                  paymentMethod === "jazzcash"
                    ? "border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00]"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                JazzCash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("easypaisa")}
                className={`p-4 rounded-xl border-2 text-center font-medium transition ${
                  paymentMethod === "easypaisa"
                    ? "border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00]"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Easypaisa
              </button>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-[#1A1A1A] mb-1">
                Send Rs. {selection.total} to:
              </p>
              <p className="text-[#FF6A00] font-bold text-lg">
                {paymentMethod === "jazzcash"
                  ? "0300-1234567"
                  : "0300-7654321"}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Account Title: Mall1Tandoori Cinema
              </p>
            </div>
          </div>

          {/* Upload Screenshot */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-4">
              Upload Payment Screenshot
            </h3>
            <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#FF6A00] transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              />
              {screenshot ? (
                <div>
                  <p className="text-[#FF6A00] font-medium">{screenshot.name}</p>
                  <p className="text-gray-400 text-xs mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <svg
                    className="w-10 h-10 mx-auto text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-400 text-sm">
                    Tap to upload payment screenshot
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-4">Your Details</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !screenshot}
            className="btn-pill w-full text-center disabled:opacity-50 text-lg"
          >
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>
      </div>
    </>
  );
}
