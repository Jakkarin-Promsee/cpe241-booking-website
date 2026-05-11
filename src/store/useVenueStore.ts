import { create } from "zustand";
import { api } from "../lib/api";

export interface Venue {
  venues_id: number;
  venues_name: string;
  venues_address: string;
  seat_count: number;
}

export interface VenueSeat {
  seat_id: number;
  seat_number: string;
}

type VenueState = {
  venues: Venue[];
  seats: VenueSeat[];
  selectedVenueId: number | null;
  loading: boolean;
  error: string | null;
  fetchVenues: () => Promise<void>;
  createVenue: (data: { name: string; address: string }) => Promise<void>;
  updateVenue: (id: number, data: { name: string; address: string }) => Promise<void>;
  deleteVenue: (id: number) => Promise<void>;
  selectVenue: (id: number | null) => void;
  fetchVenueSeats: (venueId: number) => Promise<void>;
  assignSeatNumbers: (venueId: number, seatNumbers: string[]) => Promise<void>;
  removeSeat: (venueId: number, seatId: number) => Promise<void>;
};

export const useVenueStore = create<VenueState>()((set) => ({
  venues: [],
  seats: [],
  selectedVenueId: null,
  loading: false,
  error: null,

  fetchVenues: async () => {
    set({ loading: true, error: null });
    try {
      const venues = await api.get<Venue[]>("/api/venues");
      set((s) => ({
        venues,
        selectedVenueId:
          s.selectedVenueId && venues.some((v) => v.venues_id === s.selectedVenueId)
            ? s.selectedVenueId
            : venues[0]?.venues_id ?? null,
        loading: false,
      }));
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch venues",
      });
    }
  },

  createVenue: async (data) => {
    await api.post<Venue>("/api/venues", data);
    const venues = await api.get<Venue[]>("/api/venues");
    set({ venues });
  },

  updateVenue: async (id, data) => {
    await api.put<Venue>(`/api/venues/${id}`, data);
    const venues = await api.get<Venue[]>("/api/venues");
    set({ venues });
  },

  deleteVenue: async (id) => {
    await api.delete(`/api/venues/${id}`);
    set((s) => {
      const venues = s.venues.filter((v) => v.venues_id !== id);
      const selectedVenueId =
        s.selectedVenueId === id ? (venues[0]?.venues_id ?? null) : s.selectedVenueId;
      return { venues, selectedVenueId, seats: selectedVenueId ? s.seats : [] };
    });
  },

  selectVenue: (id) => set({ selectedVenueId: id }),

  fetchVenueSeats: async (venueId) => {
    set({ loading: true, error: null });
    try {
      const seats = await api.get<VenueSeat[]>(`/api/venues/${venueId}/seats`);
      set({ seats, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch venue seats",
      });
    }
  },

  assignSeatNumbers: async (venueId, seatNumbers) => {
    const seats = await api.post<VenueSeat[]>(`/api/venues/${venueId}/seats`, {
      seatNumbers,
    });
    const venues = await api.get<Venue[]>("/api/venues");
    set({ seats, venues });
  },

  removeSeat: async (venueId, seatId) => {
    await api.delete(`/api/venues/${venueId}/seats/${seatId}`);
    const venues = await api.get<Venue[]>("/api/venues");
    set((s) => ({
      seats: s.seats.filter((seat) => seat.seat_id !== seatId),
      venues,
    }));
  },
}));

