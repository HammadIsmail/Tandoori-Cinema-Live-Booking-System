"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectUrl = searchParams.get("redirect");
  const signupHref = redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : "/signup";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        router.refresh();
        return;
      }
    }

    router.push(redirectUrl || "/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">
          Mall1<span className="text-[#FF6A00]">Tandoori</span>
        </h1>
        <p className="text-gray-500 mt-2">Sign in to your account</p>
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-lg p-8 space-y-5"
      >
        {error && (
          <div className="bg-red-50 text-[#E63946] text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            Email
          </label>
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
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] transition"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-pill w-full text-center disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href={signupHref} className="text-[#FF6A00] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-gray-200 rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
