"use client";

import Link from "next/link";
import type { Movie, Showtime } from "@/lib/types";

type ShowtimeWithHall = Showtime & { halls: { name: string } | null };

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function groupByDate(showtimes: ShowtimeWithHall[]) {
  const groups: Record<string, ShowtimeWithHall[]> = {};
  for (const st of showtimes) {
    const d = new Date(st.start_time);
    const key = d.toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(st);
  }
  return groups;
}

export default function MovieDetailContent({
  movie,
  showtimes,
}: {
  movie: Movie;
  showtimes: ShowtimeWithHall[];
}) {
  const grouped = groupByDate(showtimes);

  return (
    <>
      {/* Hero */}
      <div className="bg-[#0F1419] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-72 flex-shrink-0">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-800">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#FF6A00] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {movie.format}
                </span>
                <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {movie.genre}
                </span>
                <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {movie.duration_minutes} min
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
                {movie.title}
              </h1>

              <p className="text-gray-400 leading-relaxed mb-4">
                {movie.synopsis}
              </p>

              {movie.cast_members && (
                <p className="text-sm text-gray-500">
                  <span className="text-[#FF8A3D] font-medium">Cast:</span>{" "}
                  {movie.cast_members}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer */}
      {movie.trailer_url && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A00] mb-2">
            Trailer
          </p>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
            Watch the Trailer
          </h2>
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <iframe
              src={movie.trailer_url}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {/* Showtimes */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A00] mb-2">
          Showtimes
        </p>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">
          Available Showtimes
        </h2>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No upcoming showtimes for this movie.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, showtimes]) => (
              <div key={date}>
                <h3 className="font-semibold text-[#1A1A1A] mb-3">{date}</h3>
                <div className="flex flex-wrap gap-3">
                  {showtimes.map((st) => (
                    <Link
                      key={st.id}
                      href={`/seat-selection?showtime=${st.id}`}
                      className="flex items-center gap-3 bg-white border-2 border-gray-100 rounded-xl px-5 py-3 hover:border-[#FF6A00] transition group"
                    >
                      <span className="font-bold text-[#1A1A1A] group-hover:text-[#FF6A00] transition">
                        {formatTime(st.start_time)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {st.halls?.name || "Hall"}
                      </span>
                      <span className="text-xs bg-[#FF6A00]/10 text-[#FF6A00] font-medium px-2 py-0.5 rounded-full">
                        {st.format}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
