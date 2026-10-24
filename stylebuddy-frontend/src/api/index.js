import { authApi } from "./auth";
import { closetApi } from "./closet";
import { stylistApi } from "./stylist";
import { outfitApi } from "./outfits";
import { productApi } from "./products";
import { profileApi } from "./profile";
import { weatherApi } from "./weather";
import { shoppingApi } from "./shopping";

import {
  mockAuthApi,
  mockClosetApi,
  mockStylistApi,
  mockOutfitApi,
  mockProductApi,
  mockProfileApi,
  mockWeatherApi
} from "./mock";

const mock = import.meta.env.VITE_USE_MOCK_API !== "false";

export const services = mock
  ? {
      auth: mockAuthApi,
      closet: mockClosetApi,
      stylist: mockStylistApi,
      outfit: mockOutfitApi,
      product: mockProductApi,
      profile: mockProfileApi,
      weather: mockWeatherApi,
      shopping: shoppingApi
    }
  : {
      auth: authApi,
      closet: closetApi,
      stylist: stylistApi,
      outfit: outfitApi,
      product: productApi,
      profile: profileApi,
      weather: weatherApi,
      shopping: shoppingApi
    };

export const isMockMode = mock;