-- Mall1Tandoori Cinema — Seed Data
-- Run this after migrations to populate test data

-- Sample halls
INSERT INTO public.halls (id, name, description, layout_config) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Screen 1 — IMAX', 'Premium IMAX experience with Dolby Atmos', '{
  "total_rows": 10,
  "seats_per_row": 16,
  "aisles": [5, 11],
  "tiers": {
    "regular": {"rows": ["F","G","H","I","J"], "price_label": "Regular"},
    "gold": {"rows": ["D","E"], "price_label": "Gold"},
    "vip": {"rows": ["A","B","C"], "price_label": "VIP"}
  }
}'::jsonb),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Screen 2 — Gold Class', 'Luxury recliner seating', '{
  "total_rows": 8,
  "seats_per_row": 12,
  "aisles": [4, 8],
  "tiers": {
    "regular": {"rows": ["E","F","G","H"], "price_label": "Regular"},
    "gold": {"rows": ["C","D"], "price_label": "Gold"},
    "vip": {"rows": ["A","B"], "price_label": "VIP"}
  }
}'::jsonb),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Screen 3 — Standard', 'Standard cinema experience', '{
  "total_rows": 8,
  "seats_per_row": 10,
  "aisles": [],
  "tiers": {
    "regular": {"rows": ["A","B","C","D","E","F","G","H"], "price_label": "Regular"}
  }
}'::jsonb);

-- Generate seats for each hall
DO $$
DECLARE
  hall RECORD;
  row_label TEXT;
  seat_num INT;
  tier TEXT;
  tier_key TEXT;
  row_val TEXT;
BEGIN
  FOR hall IN SELECT id, layout_config FROM public.halls LOOP
    FOR row_offset IN 0..((hall.layout_config->>'total_rows')::INT - 1) LOOP
      row_label := chr(65 + row_offset);
      
      -- Determine tier by checking each tier's rows array
      tier := 'regular';
      FOR tier_key IN SELECT * FROM jsonb_object_keys(hall.layout_config->'tiers') LOOP
        IF hall.layout_config->'tiers'->tier_key->'rows' ? row_label THEN
          tier := tier_key;
        END IF;
      END LOOP;
      
      FOR seat_num IN 1..(hall.layout_config->>'seats_per_row')::INT LOOP
        INSERT INTO public.seats (hall_id, row_label, seat_number, tier)
        VALUES (hall.id, row_label, seat_num, tier);
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Sample movies
INSERT INTO public.movies (id, title, synopsis, genre, format, duration_minutes, poster_url, trailer_url, cast_members, status) VALUES
('d4e5f6a7-b8c9-0123-defa-234567890123', 'The Dark Knight Rises', 'Eight years after the Joker''s reign of anarchy, Batman is forced from exile to save Gotham City from the brutal terrorist threat of Bane.', 'Action', 'IMAX', 164, 'https://image.tmdb.org/t/p/w500/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg', 'https://www.youtube.com/embed/gEeyIARTOyc', 'Christian Bale, Tom Hardy, Anne Hathaway', 'now_showing'),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 'Sci-Fi', 'IMAX', 169, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://www.youtube.com/embed/zSWdZVtXT7E', 'Matthew McConaughey, Anne Hathaway, Jessica Chastain', 'now_showing'),
('f6a7b8c9-d0e1-2345-fabc-456789012345', 'Avatar: The Way of Water', 'Jake Sully and Neytiri have formed a family and are doing everything to stay together.', 'Sci-Fi', '3D', 192, 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', 'https://www.youtube.com/embed/d9MyW72ELq0', 'Sam Worthington, Zoe Saldana, Sigourney Weaver', 'now_showing'),
('a7b8c9d0-e1f2-3456-abcd-567890123456', 'The Conjuring: Last Rites', 'Paranormal investigators Ed and Lorraine Warren take on one last terrifying case.', 'Horror', '2D', 122, '', '', 'Vera Farmiga, Patrick Wilson', 'coming_soon'),
('b8c9d0e1-f2a3-4567-bcde-678901234567', 'Jawan', 'A man driven by a personal vendetta against a ruthless businessman undertakes a thrilling chase.', 'Action', '2D', 169, '', '', 'Shah Rukh Khan, Nayanthara', 'now_showing'),
('c9d0e1f2-a3b4-5678-cdef-789012345678', 'Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', 'Drama', 'IMAX', 180, '', '', 'Cillian Murphy, Emily Blunt, Matt Damon', 'now_showing');

-- Sample showtimes
INSERT INTO public.showtimes (movie_id, hall_id, start_time, format, base_price_regular, base_price_gold, base_price_vip) VALUES
-- Dark Knight Rises in IMAX
('d4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() + INTERVAL '1 day' + INTERVAL '14 hours', 'IMAX', 1200, 1800, 2500),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() + INTERVAL '1 day' + INTERVAL '18 hours', 'IMAX', 1200, 1800, 2500),
-- Interstellar in IMAX
('e5f6a7b8-c9d0-1234-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', 'IMAX', 1200, 1800, 2500),
-- Avatar in 3D
('f6a7b8c9-d0e1-2345-fabc-456789012345', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', NOW() + INTERVAL '1 day' + INTERVAL '16 hours', '3D', 800, 1200, 1800),
('f6a7b8c9-d0e1-2345-fabc-456789012345', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', NOW() + INTERVAL '2 days' + INTERVAL '16 hours', '3D', 800, 1200, 1800),
-- Jawan in Standard
('b8c9d0e1-f2a3-4567-bcde-678901234567', 'c3d4e5f6-a7b8-9012-cdef-123456789012', NOW() + INTERVAL '1 day' + INTERVAL '19 hours', '2D', 500, 800, 1200),
-- Oppenheimer in IMAX
('c9d0e1f2-a3b4-5678-cdef-789012345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() + INTERVAL '3 days' + INTERVAL '15 hours', 'IMAX', 1200, 1800, 2500);
