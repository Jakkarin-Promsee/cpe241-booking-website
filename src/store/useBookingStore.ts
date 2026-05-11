import { create } from "zustand";
import { api } from "../lib/api";

export interface Booking {
  booking_id: number;
  date: string;
  time: string;
  status: "Booking" | "Checkout" | "Successful" | "Cancel";
  payment_proof_url: string | null;
  customer: string;
  display_name: string;
  movie: string;
  showtime_date: string;
  start_time: string;
  seats: number;
  amount: number;
}

export interface BookingFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

type BookingState = {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: (filters?: BookingFilters) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
};

export const useBookingStore = create<BookingState>()((set) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBookings: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      const qs = params.toString();
      const bookings = await api.get<Booking[]>(
        `/api/bookings${qs ? `?${qs}` : ""}`,
      );
      set({ bookings, loading: false });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch bookings",
        loading: false,
      });
    }
  },

  cancelBooking: async (id) => {
    await api.put(`/api/bookings/${id}/cancel`, {});
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.booking_id === id ? { ...b, status: "Cancel" as const } : b,
      ),
    }));
  },
}));
