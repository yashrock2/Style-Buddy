import { apiRequest } from "./client";

export const weatherApi = {
  getWeather: () => apiRequest("/weather")
};