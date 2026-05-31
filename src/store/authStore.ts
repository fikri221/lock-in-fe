import { authAPI } from "@/lib/api";

import { ApiError } from "@/types/error";
import { create } from "zustand";

interface User {
  id: string;
  name?: string;
  email: string;
  timezone: string;
  isAnonymous?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  upgrade: (name: string, email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const guestUserId = get().user?.isAnonymous ? get().user?.id : undefined;
      const response = await authAPI.login({ email, password, guestUserId });
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

  loginWithGoogle: async (credential: string) => {
    try {
      const guestUserId = get().user?.isAnonymous ? get().user?.id : undefined;
      const response = await authAPI.googleLogin(credential, guestUserId);
      const { user } = response.data.data;
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.response?.data?.error ?? err?.message ?? "Google Login failed";
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const guestUserId = get().user?.isAnonymous ? get().user?.id : undefined;
      const response = await authAPI.register({ name, email, password, guestUserId });
      const user = response.data.data?.user || response.data.user;

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

  loginAnonymously: async () => {
    try {
      set({ isLoading: true });
      const response = await authAPI.loginAnonymous();
      const { user } = response.data.data;
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.response?.data?.error ?? err?.message ?? "Guest login failed";
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  upgrade: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.upgrade({ name, email, password });
      const { user } = response.data.data;
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.response?.data?.error ?? err?.message ?? "Upgrade failed";
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
