import { apiRequest } from "./client";

export const profileApi = {
  getProfile: () => apiRequest("/profile"),
  updateProfile: (payload) => apiRequest("/profile", { method: "PUT", body: JSON.stringify(payload) })
};