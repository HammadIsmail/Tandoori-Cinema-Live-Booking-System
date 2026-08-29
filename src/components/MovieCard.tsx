"use client";

import Link from "next/link";
import type { Movie } from "@/lib/types";

function getMinPrice(movie: Movie): number {
  if (movie.format === "IMAX") return 1200;
  if (movie.format === "3D") return 800;
  return 500;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  const minPrice = getMinPrice(movie);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="relative aspect-[2/3] bg-gray-100">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-[#E63946] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Rs. {minPrice}
          </span>
        </div>

        {/* Format badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-[#0F1419]/80 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {movie.format}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#1A1A1A] text-sm leading-tight line-clamp-1">
          {movie.title}
        </h3>
        <p className="text-gray-400 text-xs mt-1">
          {movie.genre} • {movie.duration_minutes} min
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              movie.status === "now_showing"
                ? "bg-green-50 text-green-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {movie.status === "now_showing" ? "NOW SHOWING" : "COMING SOON"}
          </span>
          <Link
            href={`/movies/${movie.id}`}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF8A3D] text-white flex items-center justify-center text-lg font-bold hover:scale-110 transition-transform"
          >
            +
          </Link>
        </div>
      </div>
    </div>
  );
}
