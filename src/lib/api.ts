import axios from "axios";
import { tokenStore } from "./tokenStore";
import { Habit, LogCompletion } from "@/types/habits";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      tokenStore.clear();
      // Optionally, redirect to login page or show a message
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/me"),
};

export const habitsAPI = {
  getHabits: (params?: { active?: boolean }) => api.get("/habits", { params }),

  getHabitById: (id: string) => api.get(`/habits/${id}`),

  createHabit: (data: Habit) => api.post("/habits", data),

  updateHabit: (id: string, data: Partial<Habit>) =>
    api.put(`/habits/${id}`, data),

  deleteHabit: (id: string) => api.delete(`/habits/${id}`),

  logCompletion: (id: string, data: LogCompletion) =>
    api.post(`/habits/${id}/log`, data),

  getHabitStats: (id: string, days: number) =>
    api.get(`/habits/${id}/stats`, { params: { days } }),
};

export default api;
