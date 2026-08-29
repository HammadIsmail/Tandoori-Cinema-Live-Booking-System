"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();

  return (
    <div className="bg-[#0F1419] text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
        <a
          href="tel:+923001234567"
          className="flex items-center gap-1.5 hover:text-[#FF8A3D] transition"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <span>0300-1234567</span>
        </a>

        <Link href="/" className="font-bold text-base tracking-wide">
          Mall1<span className="text-[#FF6A00]">Tandoori</span>
        </Link>

        <Link
          href="/my-bookings"
          className="flex items-center gap-1.5 hover:text-[#FF8A3D] transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <span>My Bookings</span>
        </Link>
      </div>
    </div>
  );
}
