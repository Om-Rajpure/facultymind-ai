import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", BASE_URL); // debug
console.log("FINAL API URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('facultymind_access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
