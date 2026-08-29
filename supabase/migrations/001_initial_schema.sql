-- Mall1Tandoori Cinema — Initial Schema
-- Run this migration to create all tables

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- MOVIES
-- ============================================================
create table public.movies (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  synopsis text not null default '',
  genre text not null default '',
  format text not null default '2D' check (format in ('2D', '3D', 'IMAX', '4DX')),
  duration_minutes integer not null default 120,
  poster_url text not null default '',
  trailer_url text not null default '',
  cast_members text not null default '',
  status text not null default 'now_showing' check (status in ('now_showing', 'coming_soon')),
  created_at timestamptz not null default now()
);

alter table public.movies enable row level security;

-- ============================================================
-- HALLS
-- ============================================================
create table public.halls (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null default '',
  layout_config jsonb not null default '{
    "total_rows": 8,
    "seats_per_row": 12,
    "aisles": [],
    "tiers": {
      "regular": {"rows": ["E","F","G","H"], "price_label": "Regular"},
      "gold": {"rows": ["C","D"], "price_label": "Gold"},
      "vip": {"rows": ["A","B"], "price_label": "VIP"}
    }
  }'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.halls enable row level security;

-- ============================================================
-- SEATS (generated from hall layout_config)
-- ============================================================
create table public.seats (
  id uuid primary key default uuid_generate_v4(),
  hall_id uuid not null references public.halls(id) on delete cascade,
  row_label text not null,
  seat_number integer not null,
  tier text not null default 'regular' check (tier in ('regular', 'gold', 'vip')),
  unique(hall_id, row_label, seat_number)
);

alter table public.seats enable row level security;

create index idx_seats_hall_id on public.seats(hall_id);

-- ============================================================
-- SHOWTIMES
-- ============================================================
create table public.showtimes (
  id uuid primary key default uuid_generate_v4(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  hall_id uuid not null references public.halls(id) on delete cascade,
  start_time timestamptz not null,
  format text not null default '2D' check (format in ('2D', '3D', 'IMAX', '4DX')),
  base_price_regular integer not null default 500,
  base_price_gold integer not null default 800,
  base_price_vip integer not null default 1200,
  created_at timestamptz not null default now()
);

alter table public.showtimes enable row level security;

create index idx_showtimes_movie_id on public.showtimes(movie_id);
create index idx_showtimes_hall_id on public.showtimes(hall_id);
create index idx_showtimes_start_time on public.showtimes(start_time);

-- ============================================================
-- BOOKINGS
-- ============================================================
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  showtime_id uuid not null references public.showtimes(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  payment_method text not null default 'jazzcash' check (payment_method in ('jazzcash', 'easypaisa')),
  payment_screenshot_url text not null default '',
  total_amount integer not null default 0,
  customer_name text not null default '',
  customer_phone text not null default '',
  customer_email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create index idx_bookings_user_id on public.bookings(user_id);
create index idx_bookings_showtime_id on public.bookings(showtime_id);
create index idx_bookings_status on public.bookings(status);

-- ============================================================
-- BOOKING SEATS
-- ============================================================
create table public.booking_seats (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  seat_id uuid not null references public.seats(id) on delete cascade,
  showtime_id uuid not null references public.showtimes(id) on delete cascade,
  price integer not null default 0,
  unique(seat_id, showtime_id)
);

alter table public.booking_seats enable row level security;

create index idx_booking_seats_booking_id on public.booking_seats(booking_id);
create index idx_booking_seats_showtime_id on public.booking_seats(showtime_id);
create index idx_booking_seats_seat_id on public.booking_seats(seat_id);

-- ============================================================
-- SEAT HOLDS (temporary holds during checkout)
-- ============================================================
create table public.seat_holds (
  id uuid primary key default uuid_generate_v4(),
  seat_id uuid not null references public.seats(id) on delete cascade,
  showtime_id uuid not null references public.showtimes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  held_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  unique(seat_id, showtime_id)
);

alter table public.seat_holds enable row level security;

create index idx_seat_holds_expires on public.seat_holds(expires_at);
create index idx_seat_holds_showtime on public.seat_holds(showtime_id);
