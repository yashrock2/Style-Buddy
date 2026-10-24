import { apiRequest } from "./client";

export const authApi = {
  login: (payload) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyEmail: (payload) =>
    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () =>
    apiRequest("/auth/me"),

  refresh: (payload) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: (payload) =>
    apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};