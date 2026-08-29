# Phase Prompts — paste one at a time into Claude Code (Opus 5)

Put `CLAUDE.md` in your project root first — Claude Code reads it automatically every session, so you don't need to repeat the design system or tech stack in each phase prompt below.

Do these in order. Don't start a phase until the previous one runs cleanly with `pnpm dev` and you've clicked through it yourself.

---

## Phase 1 — Database schema & auth roles

```
Set up the Supabase schema and auth for this project, following the data model in CLAUDE.md.

1. Create SQL migration files under supabase/migrations/ for these tables:
   profiles, movies, halls, seats, showtimes, bookings, booking_seats
   (use the exact columns listed in CLAUDE.md's Data model section)

2. Add a trigger so a `profiles` row is auto-created (role defaults to 'customer')
   whenever a new user signs up via Supabase Auth.

3. Write RLS policies for every table:
   - Customers can read public data (movies, halls, showtimes, seats) freely
   - Customers can only read/write their OWN rows in bookings and booking_seats
   - Only role = 'admin' can insert/update/delete movies, halls, showtimes,
     and can update booking status (approve/reject)
   - No table should be writable by anonymous/unauthenticated users

4. Add a Supabase Storage bucket for payment screenshots, private by default,
   with a policy so a customer can upload to their own booking's folder and
   only admins can read all of them.

5. Set up the Supabase client in the Next.js app (browser client + server
   client using the existing env vars — see CLAUDE.md, no service-role key
   exists, don't assume one) and a simple auth flow: sign up / sign in with
   email, session handling with the App Router.

After this, show me how to apply the migrations and confirm the app builds
and runs with `pnpm dev` before we move on.
```

---

## Phase 2 — Movie & showtime browsing (public pages)

```
Build the public browsing pages, following the design system in CLAUDE.md.

1. Home page: hero section (headline + "Book Now" CTA), circular genre/format
   carousel with arrow nav, "Now Showing" card grid (poster, price-from badge,
   title, select button), an About section, footer with contact info.
   Use placeholder/seed data for now — add a small SQL seed file under
   supabase/seed.sql with a handful of sample movies, halls, and showtimes so
   the pages have something real to render.

2. Movies listing page: dropdown filter (genre/format) + search bar, grid of
   movie cards.

3. Movie detail page: synopsis, cast, trailer embed, showtimes grouped by
   date, each showing hall name, format, start time.

Wire all of this to real Supabase queries against the schema from Phase 1,
not hardcoded arrays. Confirm `pnpm dev` runs with no console errors and the
pages actually load data from Supabase before we move on.
```

---

## Phase 3 — Seat selection (seat map + hold logic)

```
Build the seat selection flow, following CLAUDE.md.

1. Build the seat grid as a CSS 3D-transform layout (perspective, angled rows,
   "screen" indicator at the front) driven entirely by each hall's
   layout_config — don't hardcode any hall's layout in the component.

2. Seat color states:
   - available → neutral/grey
   - selected by current user → orange
   - booked/approved → red
   - pending admin approval → amber, not selectable by anyone else

3. Use Supabase Realtime so seat state updates live for every connected
   client viewing that showtime.

4. When a customer selects a seat, place a temporary hold (10 minutes) on it.
   Auto-release the hold if checkout isn't completed in time — implement this
   as a Postgres function + a mechanism to expire holds (a scheduled Edge
   Function, or a check-on-read approach if that's simpler and reliable).

5. Order summary showing selected seats, tier, and running total price,
   with a "Proceed to Checkout" button (checkout itself is Phase 4).

Test this by opening the same showtime in two browser windows and confirming
a seat selected in one shows as unavailable in the other in real time, before
we move on.
```

---

## Phase 4 — Checkout, payment upload & admin approval queue

```
Build the checkout flow and the admin approval queue, following CLAUDE.md.

1. Checkout page: choose JazzCash or Easypaisa, show a placeholder
   account number/QR code (I'll swap in the real one), let the customer
   upload a payment screenshot to the private Storage bucket from Phase 1,
   collect name/phone/email, and create a `pending` booking with its
   booking_seats rows.

2. "My Bookings" page: customer sees status (Pending / Approved / Rejected)
   for each booking, and a simple e-ticket / QR code view once approved.

3. Admin route at /admin, protected so only role = 'admin' can access it
   (redirect everyone else). Build the Pending Payments queue: list of
   pending bookings, each showing the uploaded screenshot at full size,
   amount, seats, customer details, and Approve/Reject buttons.
   - Approve → booking status becomes approved, seats become booked (red)
   - Reject → booking status becomes rejected, seats are released back to
     available

Confirm the full flow end to end yourself — select seats, pay, upload a
screenshot, approve it as admin, see the seat turn red for other viewers —
before we move on.
```

---

## Phase 5 — Admin: movies/halls/showtimes management + bookings history

```
Build out the rest of the admin dashboard, following CLAUDE.md.

1. Movies management: CRUD UI for title, poster, synopsis, genre, format,
   duration, cast, trailer link, status.

2. Halls management: CRUD UI for halls, including a layout builder for
   rows/columns/aisles/tier assignment that writes to layout_config — this
   is what Phase 3's seat map reads from, so changes here should be
   reflected there.

3. Showtimes management: assign a movie to a hall, set date/time, format,
   and base pricing per tier.

4. Bookings history: a searchable/filterable table of all bookings
   (status, customer, showtime, amount, date) with a CSV export option.

Confirm all four sections work against real data and that changes made here
(e.g. adding a new hall layout) actually show up correctly in the public
seat map, before we move on.
```

---

## Phase 6 — Admin analytics dashboard

```
Build the analytics dashboard, following CLAUDE.md. Use recharts
(pnpm add recharts) for the charts.

Show:
- Total revenue and tickets sold (today / this week / this month)
- Occupancy rate per showtime
- Revenue by movie
- Revenue by format/hall
- Best-selling movies (simple ranked list)
- A revenue-over-time chart (daily, last 30 days)

Base all figures on real `bookings`/`booking_seats` data with status =
'approved' only (pending/rejected bookings shouldn't count toward revenue).
Confirm the numbers look sane against the seed/test data before we're done.
```

---

## Optional Phase 7 — Real 3D seat map upgrade

Only do this once everything above is solid.

```
Replace the CSS 3D-transform seat grid from Phase 3 with a real 3D scene
using react-three-fiber (pnpm add three @react-three/fiber @react-three/drei).
Keep the exact same data source, hold logic, realtime updates, and color
states — this is a visual upgrade only, not a behavior change. Confirm seat
selection, holds, and realtime updates still all work correctly afterward.
```
