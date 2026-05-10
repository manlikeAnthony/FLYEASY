import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
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
      } catch (e) {
        // ignore
      }
      try {
        window.dispatchEvent(new Event("logout"));
      } catch (e) {
        // ignore
      }
      // ensure redirect
      try {
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  },
);

export default api;
