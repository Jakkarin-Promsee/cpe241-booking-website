import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";

export type LoginResult = { ok: true } | { ok: false; error: string };

type AuthState = {
  authed: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const STORAGE_KEY = "cinema-admin-auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authed: false,
      token: null,
      logout: () => set({ authed: false, token: null }),
      login: async (email, password) => {
        if (!email || !password) {
          return { ok: false, error: "Please fill in all fields." };
        }
        try {
          const data = await api.post<{ token: string; user: unknown }>(
            "/api/auth/login",
            { email, password },
          );
          set({ authed: true, token: data.token });
          return { ok: true };
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Login failed. Please try again.";
          return { ok: false, error: msg };
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ authed: state.authed, token: state.token }),
    },
  ),
);
