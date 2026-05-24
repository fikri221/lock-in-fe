import axios from "axios";

import {
  CreateHabitRequest,
  LogCompletion,
  UpdateHabitRequest,
} from "@/types/habits";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (optional: for logging or other headers)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle responses globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // Attempting to refresh the refresh token itself or logging in should not trigger loop
      if (
        originalRequest.url === "/auth/refresh" ||
        originalRequest.url === "/auth/login"
      ) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // If the refresh token is also invalid/expired, throw user to login
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  googleLogin: (credential: string) =>
    api.post("/auth/google", { credential }),

  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/me"),
};

export const habitsAPI = {
  getHabits: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    active?: boolean;
  }) => api.get("/habits", { params }),

  getHabitById: (id: string) => api.get(`/habits/${id}`),

  createHabit: (data: CreateHabitRequest) => api.post("/habits", data),

  updateHabit: (id: string, data: UpdateHabitRequest) =>
    api.put(`/habits/${id}`, data),

  deleteHabit: (id: string) => api.delete(`/habits/${id}`),
  cancelHabit: (id: string, data: LogCompletion) =>
    api.post(`/habits/${id}/cancel`, data),

  logCompletion: (id: string, data: LogCompletion) =>
    api.post(`/habits/${id}/logs`, data),

  getHabitStats: (id: string, days: number) =>
    api.get(`/habits/${id}/stats`, { params: { days } }),
};

export const notificationAPI = {
  subscribe: (subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent: string;
  }) => api.post("/notifications/subscribe", subscription),

  unsubscribe: (endpoint: string) =>
    api.post("/notifications/unsubscribe", { endpoint }),

  getPreferences: () => api.get("/notifications/preferences"),

  updatePreferences: (data: {
    notificationEnabled?: boolean;
    reminderTime?: string;
  }) => api.put("/notifications/preferences", data),

  sendTest: () => api.post("/notifications/test"),
};

export default api;
