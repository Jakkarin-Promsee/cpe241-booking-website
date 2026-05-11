import { create } from "zustand";
import { api } from "../lib/api";

export interface Venue {
  venues_id: number;
  venues_name: string;
  venues_address: string;
}

export interface VenueSeat {
  seat_id: number;
  seat_number: string;
}

export interface Showing {
  showing_id: number;
  show_id: number;
  venues_id: number;
  status: "Ontime" | "Overdue" | "Full";
  showtime_date: string;
  start_time: string;
  end_time: string;
  booking_date: string | null;
  language: string | null;
  movie_title: string;
  duration: number;
  venues_name: string;
  sold: number;
  capacity: number;
}

export interface ShowingFormData {
  showId: number;
  venueId: number;
  status?: string;
  showtimeDate: string;
  startTime?: string;
  endTime?: string;
  startHour?: number;
  endHour?: number;
  adMinutes?: number;
  bufferMinutes?: number;
  language?: string;
  seatPrice?: string | number;
  seatPricing?: Array<{ seatId: number; seatPrice: number }>;
  bookingDate?: string;
}

type ShowingState = {
  showings: Showing[];
  venues: Venue[];
  venueSeatsByVenueId: Record<number, VenueSeat[]>;
  loading: boolean;
  error: string | null;
  fetchVenues: () => Promise<void>;
  fetchShowings: (venueId?: number, date?: string) => Promise<void>;
  fetchVenueSeats: (venueId: number) => Promise<VenueSeat[]>;
  createShowing: (data: ShowingFormData) => Promise<void>;
  updateShowing: (id: number, data: Partial<ShowingFormData>) => Promise<void>;
  deleteShowing: (id: number) => Promise<void>;
};

export const useShowingStore = create<ShowingState>()((set) => ({
  showings: [],
  venues: [],
  venueSeatsByVenueId: {},
  loading: false,
  error: null,

  fetchVenues: async () => {
    try {
      const venues = await api.get<Venue[]>("/api/venues");
      set({ venues });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch venues",
      });
    }
  },

  fetchShowings: async (venueId?, date?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (venueId) params.set("venueId", String(venueId));
      if (date) params.set("date", date);
      const qs = params.toString();
      const showings = await api.get<Showing[]>(
        `/api/showings${qs ? `?${qs}` : ""}`,
      );
      set({ showings, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch showings",
        loading: false,
      });
    }
  },

  fetchVenueSeats: async (venueId) => {
    try {
      const seats = await api.get<VenueSeat[]>(`/api/venues/${venueId}/seats`);
      set((s) => ({
        venueSeatsByVenueId: { ...s.venueSeatsByVenueId, [venueId]: seats },
      }));
      return seats;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch venue seats",
      });
      return [];
    }
  },

  createShowing: async (data) => {
    await api.post<unknown>("/api/showings", data);
  },

  updateShowing: async (id, data) => {
    await api.put<unknown>(`/api/showings/${id}`, data);
  },

  deleteShowing: async (id) => {
    await api.delete(`/api/showings/${id}`);
    set((s) => ({
      showings: s.showings.filter((sg) => sg.showing_id !== id),
    }));
  },
}));
