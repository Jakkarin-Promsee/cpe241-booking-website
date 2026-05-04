import { create } from "zustand";
import { persist } from "zustand/middleware";

const ADMIN_CREDENTIALS = [
  { email: "test", password: "test" },
  { email: "admin@cinema.com", password: "admin123" },
] as const;

export type LoginResult = { ok: true } | { ok: false; error: string };

type AuthState = {
  authed: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const STORAGE_KEY = "cinema-admin-auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authed: false,
      logout: () => set({ authed: false }),
      login: async (email, password) => {
        if (!email || !password) {
          return { ok: false, error: "Please fill in all fields." };
        }

        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));
        const valid = ADMIN_CREDENTIALS.some(
          (c) => c.email === email && c.password === password,
        );
        if (valid) {
          set({ authed: true });
          return { ok: true };
        }
        return { ok: false, error: "Invalid email or password." };
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ authed: state.authed }),
    },
  ),
);
