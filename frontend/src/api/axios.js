import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ──────────────────────────────────────────────────────────
// Dynamic Clerk token injection
// ──────────────────────────────────────────────────────────
// We store a reference to Clerk's getToken function so the
// interceptor can fetch a FRESH token on every request.
// This avoids caching, localStorage, or stale token reuse.
// ──────────────────────────────────────────────────────────
let _getToken = null;

/**
 * Call this once from AuthContext to give the axios instance
 * access to Clerk's getToken function.
 */
export const setClerkTokenGetter = (getTokenFn) => {
  _getToken = getTokenFn;
};

// Request interceptor — fetches a fresh Clerk token for EVERY request
api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      try {
        // skipCache: true ensures we never use an expired/cached token
        const freshToken = await _getToken({ skipCache: true });

        if (freshToken) {
          config.headers.Authorization = `Bearer ${freshToken}`;
          console.log(
            "[axios] Fresh Clerk token attached, length:",
            freshToken.length
          );
        } else {
          console.warn("[axios] getToken returned null — no token attached");
        }
      } catch (err) {
        console.error("[axios] Failed to get fresh Clerk token:", err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
