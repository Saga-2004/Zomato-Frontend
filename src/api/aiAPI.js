import API from "./axios";

export const generateMenuDescriptionAPI = (data) =>
  API.post("/ai/menu-description", data, { skipLoader: true });

export const chatWithMenuAPI = (data, config = {}) =>
  API.post("/ai/chat", data, { ...config, skipLoader: true });
