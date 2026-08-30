"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SignupForm() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectUrl = searchParams.get("redirect") || "/";

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "otp", email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");

      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Verify OTP with our API
      const verifyRes = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Invalid verification code");

      // 2. OTP is valid, create account in Supabase
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      // Success
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">
          Mall1<span className="text-[#FF6A00]">Tandoori</span>
        </h1>
        <p className="text-gray-500 mt-2">
          {step === "details" ? "Create your account" : "Verify your email"}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {error && (
          <div className="bg-red-50 text-[#E63946] text-sm rounded-lg p-3 mb-5 text-center">
            {error}
          </div>
        )}

        {step === "details" ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
                placeholder="03XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
                placeholder="Min 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill w-full text-center disabled:opacity-50"
            >
              {loading ? "Sending Code..." : "Continue"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-[#FF6A00] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndSignup} className="space-y-5 text-center">
            <p className="text-sm text-gray-600 mb-6">
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-pill w-full text-center disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("details"); setOtp(""); }}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-gray-200 rounded-2xl" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
