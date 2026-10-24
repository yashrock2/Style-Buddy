import { apiRequest } from "./client";

export const stylistApi = {
  recommend: (payload) => apiRequest("/stylist/recommend", { method: "POST", body: JSON.stringify(payload) }),
  chat: (payload) => apiRequest("/stylist/chat", { method: "POST", body: JSON.stringify(payload) }),
  showAnother: (payload) => apiRequest("/stylist/show-another", { method: "POST", body: JSON.stringify(payload) })
};