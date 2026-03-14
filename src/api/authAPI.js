import API from "./axios"; // ← use YOUR existing axios instance

export const signupAPI = (data) => API.post("/users/register", data);
export const loginAPI = (data) => API.post("/users/login", data);
export const logoutAPI = () => API.post("/users/logout");
export const forgotPasswordAPI = (data) =>
  API.post("/users/forgot-password", data);
export const resetPasswordAPI = (token, data) =>
  API.post(`/users/reset-password/${token}`, data);
