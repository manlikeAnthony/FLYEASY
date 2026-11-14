import axios from "axios";

const ACCESS_TOKEN_KEY = "fe_access_token";

export const storeAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearStoredAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

const api = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Cookie authentication remains available when browser storage is blocked.
  }
  return config;
});

// Global response interceptor: if backend returns 401, dispatch logout and redirect to /login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isPublicAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/resend-verification-email") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password") ||
      requestUrl.includes("/auth/verify-email");

    if (status === 401 && !isPublicAuthEndpoint) {
      try {
        localStorage.removeItem("fe_user");
        clearStoredAccessToken();
      } catch (e) {
        // ignore
      }
      try {
        window.dispatchEvent(new Event("logout"));
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  },
);

export default api;
