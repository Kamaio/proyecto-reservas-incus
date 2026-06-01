import { API_URL } from "../config.js";
import { getAuthHeaders, logout } from "./auth.js";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });

  if (res.status === 401) {
    logout();
    throw new Error("Sesión expirada");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── RECURSOS ─────────────────────────────────────────

export const Recursos = {
  listar: () => request("/recursos"),

  obtener: (id) => request(`/recursos/${id}`),

  crear: (data) =>
    request("/recursos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  actualizar: (id, data) =>
    request(`/recursos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  eliminar: (id) =>
    request(`/recursos/${id}`, { method: "DELETE" }),
};

// ── RESERVAS ─────────────────────────────────────────

export const Reservas = {
  listar: () => request("/reservas"),

  obtener: (id) => request(`/reservas/${id}`),

  crear: (data) =>
    request("/reservas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  actualizar: (id, usuario) =>
    request(`/reservas/${id}?nuevo_usuario=${encodeURIComponent(usuario)}`, {
      method: "PUT",
    }),

  cancelar: (id) =>
    request(`/reservas/${id}`, { method: "DELETE" }),
};
