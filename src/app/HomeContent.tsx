"use client";

import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/lib/types";
import { useRef, useState } from "react";

const GENRES = [
  "Now Showing",
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Thriller",
  "Romance",
  "Animation",
  "Sci-Fi",
];

export default function HomeContent({ movies }: { movies: Movie[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative text-white py-24 md:py-32 px-4 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/Images/movie-theater.webp")' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 z-0 bg-black/60 bg-gradient-to-b from-black/40 via-transparent to-[#f9fafb]" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A00] mb-4 drop-shadow-md">
            Mall-1 Burewala
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 drop-shadow-xl">
            Your Cinema.
            <br />
            Your Seats.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#FF8A3D] drop-shadow-sm">Your Way.</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10 drop-shadow-md">
            Book your favorite movies online, pick your exact seat, and enjoy the
            magic of cinema at Mall1Tandoori.
          </p>
          <Link
            href="/movies"
            className="inline-block bg-gradient-to-r from-[#FF6A00] to-[#FF8A3D] text-white font-bold rounded-full px-10 py-4 text-lg shadow-[0_4px_14px_0_rgba(255,106,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,106,0,0.6)] hover:-translate-y-1 transition-all duration-300"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* Genre Carousel */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A00] mb-2 text-center">
            Browse
          </p>
          <h2 className="text-2xl font-bold text-[#1A1A1A] text-center mb-8">
            Find Your Genre
          </h2>

          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition -translate-x-1/2"
              >
                <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide px-2 py-2 w-fit mx-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {GENRES.map((genre) => (
                <div
                  key={genre}
                  className="flex-shrink-0 w-24 h-24 rounded-full bg-white shadow-sm flex flex-col items-center justify-center gap-1 hover:shadow-md hover:bg-[#FF6A00] hover:text-white transition-all cursor-pointer group"
                >
                  <svg className="w-6 h-6 text-[#FF6A00] group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span className="text-xs font-medium text-[#1A1A1A] group-hover:text-white transition">
                    {genre}
                  </span>
                </div>
              ))}
            </div>

            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition translate-x-1/2"
              >
                <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Now Showing */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A00] mb-2">
            In Cinemas
          </p>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Now Showing</h2>
            <Link
              href="/movies"
              className="text-sm font-medium text-[#FF6A00] hover:underline"
            >
              View All →
            </Link>
          </div>

          {movies.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No movies showing right now.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {movies.slice(0, 8).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A00] mb-2">
                Who We Are
              </p>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4 leading-tight">
                The Best Cinema
                <br />
                Experience in Town
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Mall1Tandoori brings you the ultimate movie experience with
                state-of-the-art projection, Dolby Atmos sound, and comfortable
                seating. Located in the heart of Mall-1 Burewala, we offer a
                premium cinema experience for the whole family.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                From Hollywood blockbusters to local favorites, our diverse
                movie selection caters to every taste. Enjoy gourmet snacks at
                our in-house restaurant before or after your show.
              </p>
              <button className="btn-pill">Read More</button>
            </div>
            <div className="relative">
              <div className="rounded-3xl aspect-square flex items-center justify-center relative overflow-hidden shadow-2xl">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 duration-700"
                  style={{ backgroundImage: 'url("/Images/movie-theater.webp")' }}
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60" />
                
                {/* Content */}
                <div className="text-center relative z-10">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8A3D] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,106,0,0.6)]">
                    <span className="text-white text-3xl font-extrabold drop-shadow-md">4K</span>
                  </div>
                  <p className="text-white font-bold text-xl drop-shadow-md">Dolby Atmos</p>
                  <p className="text-gray-300 text-sm font-medium drop-shadow-sm">Crystal Clear Sound</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF8A3D] border-[6px] border-white flex items-center justify-center shadow-xl z-20">
                <div className="text-center text-white">
                  <span className="text-3xl font-extrabold block leading-none mb-1">4</span>
                  <span className="text-[10px] font-bold tracking-widest">SCREENS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Block */}
      <section className="py-16 px-4 bg-[#0F1419] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["IMAX", "Gold Class", "Dolby Atmos", "Family Hall"].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-6 py-2 rounded-full border border-[#FF6A00]/40 text-[#FF8A3D] text-sm font-medium"
                >
                  {tag}
                </span>
              )
            )}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Experience Cinema Like Never Before
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            From IMAX to Gold Class, we offer a variety of premium experiences
            to match every mood and budget.
          </p>
          <Link href="/movies" className="btn-pill inline-block">
            Explore Movies
          </Link>
        </div>
      </section>
    </>
  );
}
