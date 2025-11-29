import { authAPI } from "@/lib/api";
import { tokenStore } from "@/lib/tokenStore";
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
  token: string | null;
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
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;

      tokenStore.set(token);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      console.error("Login error:", error);
      const err = error as ApiError;
      const message =
        err?.response?.data?.error ?? err?.message ?? "Login failed";
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register({ name, email, password });
      const { user, token } = response.data;

      tokenStore.set(token);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
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

  logout: () => {
    tokenStore.clear();
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = tokenStore.get();
    const user = localStorage.getItem("user");

    if (!token || !user) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const response = await authAPI.getProfile();

      set({
        user: response.data?.user,
        token,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      console.error("Check auth error:", error);
      tokenStore.clear();
      localStorage.removeItem("user");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
