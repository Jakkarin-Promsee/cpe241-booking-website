import { create } from "zustand";
import { api } from "../lib/api";

export interface Movie {
  show_id: number;
  showtime_title: string;
  showtime_descript: string | null;
  duration: number;
  genre: string | null;
  release_date: string | null;
  end_date: string | null;
  poster_url: string | null;
  status: "Upcoming" | "Open" | "Ended" | "Hidden";
  hiden: boolean;
}

export interface MovieFormData {
  title: string;
  genre?: string;
  duration: number;
  description?: string;
  releaseDate?: string;
  endDate?: string;
  posterUrl?: string;
  status?: "Upcoming" | "Open" | "Ended" | "Hidden";
  hiden?: boolean;
}

function normalizeMovie(raw: Omit<Movie, "hiden"> & { hiden?: boolean }): Movie {
  return {
    ...raw,
    hiden: typeof raw.hiden === "boolean" ? raw.hiden : raw.status === "Hidden",
  };
}

type MovieState = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  fetchMovies: (search?: string, status?: string) => Promise<void>;
  createMovie: (data: MovieFormData) => Promise<void>;
  updateMovie: (id: number, data: MovieFormData) => Promise<void>;
  deleteMovie: (id: number) => Promise<void>;
};

export const useMovieStore = create<MovieState>()((set) => ({
  movies: [],
  loading: false,
  error: null,

  fetchMovies: async (search?, status?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const qs = params.toString();
      const movies = await api.get<Array<Omit<Movie, "hiden"> & { hiden?: boolean }>>(
        `/api/movies${qs ? `?${qs}` : ""}`,
      );
      set({ movies: movies.map(normalizeMovie), loading: false });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch movies",
        loading: false,
      });
    }
  },

  createMovie: async (data) => {
    const movie = await api.post<Omit<Movie, "hiden"> & { hiden?: boolean }>(
      "/api/movies",
      data,
    );
    set((s) => ({ movies: [normalizeMovie(movie), ...s.movies] }));
  },

  updateMovie: async (id, data) => {
    const movie = await api.put<Omit<Movie, "hiden"> & { hiden?: boolean }>(
      `/api/movies/${id}`,
      data,
    );
    set((s) => ({
      movies: s.movies.map((m) =>
        m.show_id === id ? normalizeMovie(movie) : m,
      ),
    }));
  },

  deleteMovie: async (id) => {
    await api.delete(`/api/movies/${id}`);
    set((s) => ({ movies: s.movies.filter((m) => m.show_id !== id) }));
  },
}));
