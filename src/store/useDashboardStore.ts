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

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeStats(raw: unknown): DashboardStats {
  const safe = (raw ?? {}) as Record<string, unknown>;
  return {
    activeMovies: toNumber(safe.activeMovies ?? safe.active_movies),
    onlineScreens: toNumber(safe.onlineScreens ?? safe.online_screens),
    todayBookings: toNumber(safe.todayBookings ?? safe.today_bookings),
    todayRevenue: toNumber(
      safe.todayRevenue ?? safe.today_revenue ?? safe.totalRevenue ?? safe.total_revenue,
    ),
  };
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  stats: null,
  trend: [],
  upcoming: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [statsRaw, trend, upcoming] = await Promise.all([
        api.get<unknown>("/api/dashboard/stats"),
        api.get<TrendPoint[]>("/api/dashboard/trend"),
        api.get<UpcomingShowing[]>("/api/dashboard/upcoming"),
      ]);
      set({ stats: normalizeStats(statsRaw), trend, upcoming, loading: false });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch dashboard data",
        loading: false,
      });
    }
  },
}));
