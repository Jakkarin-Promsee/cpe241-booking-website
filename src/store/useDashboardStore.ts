import { create } from "zustand";
import { api } from "../lib/api";

export interface DashboardStats {
  activeMovies: number;
  onlineScreens: number;
  todayBookings: number;
  todayRevenue: number;
}

export interface TrendPoint {
  day: string;
  count: number;
}

export interface UpcomingShowing {
  movie: string;
  screen: string;
  time: string;
  sold: number;
  capacity: number;
}

type DashboardState = {
  stats: DashboardStats | null;
  trend: TrendPoint[];
  upcoming: UpcomingShowing[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
};

export const useDashboardStore = create<DashboardState>()((set) => ({
  stats: null,
  trend: [],
  upcoming: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [stats, trend, upcoming] = await Promise.all([
        api.get<DashboardStats>("/api/dashboard/stats"),
        api.get<TrendPoint[]>("/api/dashboard/trend"),
        api.get<UpcomingShowing[]>("/api/dashboard/upcoming"),
      ]);
      set({ stats, trend, upcoming, loading: false });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch dashboard data",
        loading: false,
      });
    }
  },
}));
