import { API_URL } from "../config.js";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

export function isAuthenticated() {
  return !!getToken();
}

export function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function login(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Credenciales inválidas");
  }

  const data = await response.json();
  const token = data.access_token || data.token || data.jwt;
  if (!token) throw new Error("No se recibió token del servidor");

  setToken(token);
  localStorage.setItem("username", username);
  return data;
}

export async function register(username, password, email) {
  const token = getToken();
  const response = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, password, email }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Error al crear el usuario");
  }

  return await response.json();
}

export function logout() {
  removeToken();
  window.location.hash = "#login";
}
