import { API_URL } from "../config.js";
import { getAuthHeaders } from "../modules/auth.js";
import { mountShell } from "./shell.js";

export function renderUsuarios() {
  return "";
}

export async function initUsuarios() {
  mountShell("usuarios");
  const main = document.getElementById("main-content");

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Usuarios</h2>
        <p class="page-subtitle">Gestión de usuarios del sistema</p>
      </div>
      <button id="btn-nuevo-usuario" class="btn btn--primary">+ Nuevo usuario</button>
    </div>

    <div id="form-nuevo-usuario" class="card" style="display:none;margin-bottom:1.5rem">
      <div class="card__header">
        <span class="card__title">Registrar usuario</span>
      </div>
      <div class="card__body">
        <div id="usuario-error" class="alert alert--error" style="display:none"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input id="nuevo-username" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input id="nuevo-password" type="password" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input id="nuevo-email" type="email" class="form-input" />
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button id="btn-guardar-usuario" class="btn btn--primary">Guardar</button>
          <button id="btn-cancelar-usuario" class="btn btn--ghost">Cancelar</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__header">
        <span class="card__title">Usuarios registrados</span>
      </div>
      <div class="card__body" id="usuarios-lista">
        <div class="page-loading">Cargando...</div>
      </div>
    </div>
  `;

  await cargarUsuarios();

  document.getElementById("btn-nuevo-usuario").addEventListener("click", () => {
    document.getElementById("form-nuevo-usuario").style.display = "block";
  });

  document.getElementById("btn-cancelar-usuario").addEventListener("click", () => {
    document.getElementById("form-nuevo-usuario").style.display = "none";
    document.getElementById("usuario-error").style.display = "none";
  });

  document.getElementById("btn-guardar-usuario").addEventListener("click", async () => {
    const username = document.getElementById("nuevo-username").value.trim();
    const password = document.getElementById("nuevo-password").value.trim();
    const email = document.getElementById("nuevo-email").value.trim();
    const errorDiv = document.getElementById("usuario-error");

    try {
      const res = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, password, email }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al registrar usuario");
      }

      document.getElementById("form-nuevo-usuario").style.display = "none";
      document.getElementById("nuevo-username").value = "";
      document.getElementById("nuevo-password").value = "";
      document.getElementById("nuevo-email").value = "";
      errorDiv.style.display = "none";
      await cargarUsuarios();
    } catch (e) {
      errorDiv.style.display = "block";
      errorDiv.textContent = e.message;
    }
  });
}

async function cargarUsuarios() {
  const lista = document.getElementById("usuarios-lista");
  try {
    const res = await fetch(`${API_URL}/usuarios`, { headers: getAuthHeaders() });
    const usuarios = await res.json();

    if (usuarios.length === 0) {
      lista.innerHTML = "<p class='empty-state'>No hay usuarios registrados.</p>";
      return;
    }

    lista.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Activo</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.map(u => `
            <tr>
              <td>${u.id}</td>
              <td>${u.username}</td>
              <td>${u.email || "-"}</td>
              <td>${u.activo ? '<span class="badge badge--green">Activo</span>' : '<span class="badge badge--red">Inactivo</span>'}</td>
              <td>${u.fecha_registro.slice(0, 10)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (e) {
    lista.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}
