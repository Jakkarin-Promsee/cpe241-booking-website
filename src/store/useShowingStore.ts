import { create } from "zustand";
import { api } from "../lib/api";

export interface Venue {
  venues_id: number;
  venues_name: string;
  venues_address: string;
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
  language?: string;
  seatPrice?: string | number;
  bookingDate?: string;
}

type ShowingState = {
  showings: Showing[];
  venues: Venue[];
  loading: boolean;
  error: string | null;
  fetchVenues: () => Promise<void>;
  fetchShowings: (venueId?: number, date?: string) => Promise<void>;
  createShowing: (data: ShowingFormData) => Promise<void>;
  updateShowing: (id: number, data: Partial<ShowingFormData>) => Promise<void>;
  deleteShowing: (id: number) => Promise<void>;
};

export const useShowingStore = create<ShowingState>()((set) => ({
  showings: [],
  venues: [],
  loading: false,
  error: null,

  fetchVenues: async () => {
    try {
      const venues = await api.get<Venue[]>("/api/venues");
      set({ venues });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch venues",
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
        error:
          err instanceof Error ? err.message : "Failed to fetch showings",
        loading: false,
      });
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
