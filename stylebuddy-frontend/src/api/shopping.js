import { apiRequest } from "./client";

export const shoppingApi = {
  getRecommendations: () =>
    apiRequest("/shopping/recommendations")
};