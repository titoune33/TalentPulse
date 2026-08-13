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
      if (!window.location.pathname.startsWith("/auth/login")) {
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
    if (err.code === "ERR_NETWORK") {
      return "Impossible de contacter le serveur. Vérifiez votre connexion ou que le backend est démarré.";
    }
    if (err.code === "ECONNABORTED") {
      return "La requête a expiré. Réessayez dans quelques instants.";
    }
    if (err.response?.status === 400) return "Données invalides. Vérifiez les champs du formulaire.";
    if (err.response?.status === 403) return "Accès refusé. Vous n'avez pas les droits nécessaires.";
    if (err.response?.status === 404) return "Ressource introuvable.";
    if (err.response?.status === 409) return "Conflit de données. Cette ressource existe peut-être déjà.";
    if (err.response?.status === 429) return "Trop de requêtes. Veuillez réessayer dans quelques minutes.";
    if (err.response?.status && err.response?.status >= 500) return "Erreur serveur. Nos équipes ont été notifiées.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
