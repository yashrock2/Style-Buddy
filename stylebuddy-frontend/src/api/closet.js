import { apiRequest } from "./client";

export const closetApi = {
  getItems: async () => {
    const response = await apiRequest("/closet/items");

    return response.items || [];
  },

  getItem: async (id) => {
    const response = await apiRequest(`/closet/items/${id}`);

    return response.item;
  },

  uploadItem: async (file) => {
    const form = new FormData();

    form.append("image", file);

    const response = await apiRequest("/closet/items", {
      method: "POST",
      body: form,
    });

    return response.item;
  },

  createItem: async (payload) => {
    const response = await apiRequest("/closet/items", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.item;
  },

  updateItem: async (id, payload) => {
    const response = await apiRequest(
      `/closet/items/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    return response.item;
  },

  deleteItem: (id) =>
    apiRequest(`/closet/items/${id}`, {
      method: "DELETE",
    }),
};