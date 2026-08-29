# Mall1Tandoori Cinema — Project Instructions

This file is read automatically by Claude Code at the start of every session in this repo. It holds the context that should stay true across the whole build. Phase-specific work is given separately, one phase at a time — see `PHASE-PROMPTS.md` for that.

## What we're building

**Mall1Tandoori** — an online movie ticket booking platform for the Mall1Tandoori multiplex cinema (Mall-1 Burewala complex). Customers browse movies/showtimes, pick their exact seat on a live seat map, pay manually via JazzCash/Easypaisa by uploading a payment screenshot, and get their booking confirmed once an admin approves the payment. There's a full admin dashboard for managing movies, halls, showtimes, approving/rejecting payments, and viewing sales analytics.

## Tech stack & environment — do not deviate

- Next.js (App Router) + TypeScript. Project is already scaffolded.
- **Package manager: pnpm only.** Any new dependency → `pnpm add <package>` (`pnpm add -D` for dev deps). Never use `npm` or `yarn`, never edit `package-lock.json`/`yarn.lock`.
- Supabase: Auth, Postgres, Realtime, Storage.
- Credentials already exist in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Read from these exact names. Never hardcode keys, never print their values, never overwrite `.env.local`.
- **No service-role/secret key exists yet.** Do not write code that assumes one. Enforce admin-only actions through Supabase RLS policies keyed off a `profiles.role` column instead. If you hit a wall where a privileged server-side key is genuinely unavoidable, stop and tell me what you need and why — don't invent a workaround or fake key.
- Tailwind CSS for styling.
- Charting: `recharts` (add when needed for the admin dashboard phase).
- 3D seat map: build the seat grid with plain CSS 3D transforms first (perspective, angled rows, no extra dependency). `react-three-fiber`/`three.js` is an optional later upgrade, not part of the early phases — don't add it unless a phase explicitly asks for it.
- All schema changes go in versioned SQL files under `supabase/migrations/`, never applied ad hoc. Never run destructive migrations without stating what will be lost first.

## Design system — match this across every page, including admin

**Colors**
- Primary orange gradient: `#FF6A00` → `#FF8A3D` — dominant on hero sections, primary buttons
- White `#FFFFFF` for cards/content sections
- Near-black `#1A1A1A` for body text on white
- Accent red `#E63946` — reserved specifically for price badges and for **booked/unavailable seats**, so it stays a consistent "taken" signal everywhere
- Dark navy/black for the persistent top utility bar

**Typography**
- Bold, rounded sans-serif for headlines — large, punchy, 2-line hero statements
- Clean sans-serif body copy, generous line height
- Small uppercase orange kicker labels above section headings

**Components**
- Fully rounded ("pill") buttons everywhere — primary CTAs are orange pills, white text
- Circular icon carousel with left/right arrow nav — used for genre/format browsing (Now Showing, 2D, 3D, IMAX, Gold Class)
- Card pattern: white background, rounded corners, image on top, colored badge top-left (price / "NOW SHOWING" / "COMING SOON"), title below, circular orange action button bottom-right
- Dropdown filter + search bar pattern at the top of listing pages
- Story-style "About" section: kicker label, big heading, two paragraphs, "Read more" pill button, image with a circular stat badge overlay
- Persistent top bar: phone/contact icon + number left, centered logo, cart/basket icon with count badge right (repurposed as "My Bookings")

Mobile-first responsive throughout — most customers book from their phones.

## Data model (reference — full migrations are Phase 1's job)

- `profiles` — id (uuid, refs auth.users), name, phone, role (`customer` | `admin`)
- `movies` — id, title, synopsis, genre, format, duration_minutes, poster_url, trailer_url, status (`now_showing` | `coming_soon`)
- `halls` — id, name, description, layout_config (jsonb: rows, seats per row, aisles, tier map)
- `seats` — id, hall_id, row_label, seat_number, tier (`regular` | `gold` | `vip`)
- `showtimes` — id, movie_id, hall_id, start_time, format, base_price_regular, base_price_gold, base_price_vip
- `bookings` — id, user_id, showtime_id, status (`pending` | `approved` | `rejected` | `expired`), payment_method (`jazzcash` | `easypaisa`), payment_screenshot_url, total_amount, created_at
- `booking_seats` — id, booking_id, seat_id, showtime_id, price

## Working conventions

- Work in the phase that's given to you — don't jump ahead to later phases or add features not asked for yet.
- After making changes, run the app (`pnpm dev`) and actually check for errors before declaring a phase done — don't just write code and assume it works.
- If a requirement conflicts with something already built, flag the conflict instead of silently overriding earlier work.
- Ask before assuming missing information (e.g. exact JazzCash/Easypaisa account details for the payment screen) rather than inventing placeholder business data that might ship by accident.
