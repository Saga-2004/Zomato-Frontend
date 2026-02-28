import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// INTERCEPTOR
API.interceptors.request.use((req) => {
  // dispatch global loader start
  window.dispatchEvent(new Event("loadingStart"));

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (userInfo?.token) {
    req.headers.Authorization = `Bearer ${userInfo.token}`;
  }

  return req;
});

// hide loader on response / error
API.interceptors.response.use(
  (res) => {
    window.dispatchEvent(new Event("loadingEnd"));
    return res;
  },
  (err) => {
    window.dispatchEvent(new Event("loadingEnd"));
    return Promise.reject(err);
  },
);

export default API;
