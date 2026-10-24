import { apiRequest } from "./client";

export const outfitApi = {
  save: (payload) => apiRequest("/outfits", { method: "POST", body: JSON.stringify(payload) }),
  getSaved: () => apiRequest("/outfits"),
  delete: (id) => apiRequest(`/outfits/${id}`, { method: "DELETE" })
};