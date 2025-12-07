import { authAPI } from "@/lib/api";

import { ApiError } from "@/types/error";
import { create } from "zustand";

interface User {
  id: string;
  name?: string;
  email: string;
  timezone: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user } = response.data.data;
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.response?.data?.error ?? err?.message ?? "Login failed";
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { user } = response.data;

      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      console.error("Register error:", error);
      const err = error as ApiError;
      const message =
        err?.response?.data?.error ?? err?.message ?? "Register failed";
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await authAPI.logout();
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const response = await authAPI.getProfile();
      // content of response.data is { success: true, data: { user: ... } }
      const user = response.data?.data?.user;

      if (user) {
        console.log("User found: ", user);
        localStorage.setItem("user", JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
        });
      }
    } catch {
      // Silently fail for checkAuth as it runs on every load
      localStorage.removeItem("user");
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
