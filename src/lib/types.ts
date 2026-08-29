export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string;
          role: "customer" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          phone?: string;
          role?: "customer" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          role?: "customer" | "admin";
          created_at?: string;
        };
      };
      movies: {
        Row: {
          id: string;
          title: string;
          synopsis: string;
          genre: string;
          format: string;
          duration_minutes: number;
          poster_url: string;
          trailer_url: string;
          cast_members: string;
          status: "now_showing" | "coming_soon";
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          synopsis?: string;
          genre?: string;
          format?: string;
          duration_minutes?: number;
          poster_url?: string;
          trailer_url?: string;
          cast?: string;
          status?: "now_showing" | "coming_soon";
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          synopsis?: string;
          genre?: string;
          format?: string;
          duration_minutes?: number;
          poster_url?: string;
          trailer_url?: string;
          cast?: string;
          status?: "now_showing" | "coming_soon";
          created_at?: string;
        };
      };
      halls: {
        Row: {
          id: string;
          name: string;
          description: string;
          layout_config: LayoutConfig;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          layout_config?: LayoutConfig;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          layout_config?: LayoutConfig;
          created_at?: string;
        };
      };
      seats: {
        Row: {
          id: string;
          hall_id: string;
          row_label: string;
          seat_number: number;
          tier: "regular" | "gold" | "vip";
        };
        Insert: {
          id?: string;
          hall_id: string;
          row_label: string;
          seat_number: number;
          tier?: "regular" | "gold" | "vip";
        };
        Update: {
          id?: string;
          hall_id?: string;
          row_label?: string;
          seat_number?: number;
          tier?: "regular" | "gold" | "vip";
        };
      };
      showtimes: {
        Row: {
          id: string;
          movie_id: string;
          hall_id: string;
          start_time: string;
          format: string;
          base_price_regular: number;
          base_price_gold: number;
          base_price_vip: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          movie_id: string;
          hall_id: string;
          start_time: string;
          format?: string;
          base_price_regular?: number;
          base_price_gold?: number;
          base_price_vip?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          movie_id?: string;
          hall_id?: string;
          start_time?: string;
          format?: string;
          base_price_regular?: number;
          base_price_gold?: number;
          base_price_vip?: number;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          showtime_id: string;
          status: "pending" | "approved" | "rejected" | "expired";
          payment_method: "jazzcash" | "easypaisa";
          payment_screenshot_url: string;
          total_amount: number;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          showtime_id: string;
          status?: "pending" | "approved" | "rejected" | "expired";
          payment_method?: "jazzcash" | "easypaisa";
          payment_screenshot_url?: string;
          total_amount?: number;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          showtime_id?: string;
          status?: "pending" | "approved" | "rejected" | "expired";
          payment_method?: "jazzcash" | "easypaisa";
          payment_screenshot_url?: string;
          total_amount?: number;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_seats: {
        Row: {
          id: string;
          booking_id: string;
          seat_id: string;
          showtime_id: string;
          price: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          seat_id: string;
          showtime_id: string;
          price?: number;
        };
        Update: {
          id?: string;
          booking_id?: string;
          seat_id?: string;
          showtime_id?: string;
          price?: number;
        };
      };
      seat_holds: {
        Row: {
          id: string;
          seat_id: string;
          showtime_id: string;
          user_id: string;
          held_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          seat_id: string;
          showtime_id: string;
          user_id: string;
          held_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          seat_id?: string;
          showtime_id?: string;
          user_id?: string;
          held_at?: string;
          expires_at?: string;
        };
      };
    };
  };
};

export type LayoutConfig = {
  total_rows: number;
  seats_per_row: number;
  aisles: number[];
  tiers: {
    [key: string]: {
      rows: string[];
      price_label: string;
    };
  };
};

export type Movie = Database["public"]["Tables"]["movies"]["Row"];
export type Hall = Database["public"]["Tables"]["halls"]["Row"];
export type Seat = Database["public"]["Tables"]["seats"]["Row"];
export type Showtime = Database["public"]["Tables"]["showtimes"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingSeat = Database["public"]["Tables"]["booking_seats"]["Row"];
export type SeatHold = Database["public"]["Tables"]["seat_holds"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
