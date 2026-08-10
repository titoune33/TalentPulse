import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT token to every request when present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("tp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401, clear the session (the app redirects to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      !window.location.pathname.startsWith("/auth")
    ) {
      window.localStorage.removeItem("tp_token");
      window.localStorage.removeItem("tp_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Extract a readable French error message from an axios error */
export function errorMessage(err: unknown, fallback = "Une erreur est survenue"): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d: any) => d?.msg ?? "")
        .filter(Boolean)
        .join(", ");
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
