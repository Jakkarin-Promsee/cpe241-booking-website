import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";

export type CustomerLoginResult = { ok: true } | { ok: false; error: string };

type CustomerAuthState = {
  authed: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<CustomerLoginResult>;
  logout: () => void;
};

const STORAGE_KEY = "cinema-customer-auth";

export const useCustomerAuthStore = create<CustomerAuthState>()(
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
            "/api/auth/customer/login",
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
