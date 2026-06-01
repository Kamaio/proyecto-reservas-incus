import { mountShell } from "./shell.js";
import { Recursos, Reservas } from "../modules/api.js";

export async function renderDashboard() {
  mountShell("dashboard");
  const main = document.getElementById("main-content");
  main.innerHTML = `<div class="page-loading">Cargando datos…</div>`;

  try {
    const [recursos, reservas] = await Promise.all([
      Recursos.listar(),
      Reservas.listar(),
    ]);

    const disponibles = recursos.filter((r) => r.disponible).length;
    const ocupados = recursos.length - disponibles;
    const username = localStorage.getItem("username") || "Usuario";

    main.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">Bienvenido, ${username}</h2>
          <p class="page-subtitle">Resumen del sistema</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card stat-card--accent">
          <div class="stat-card__value">${recursos.length}</div>
          <div class="stat-card__label">Recursos totales</div>
          <div class="stat-card__icon">◫</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">${disponibles}</div>
          <div class="stat-card__label">Disponibles</div>
          <div class="stat-card__icon">◎</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">${ocupados}</div>
          <div class="stat-card__label">Ocupados</div>
          <div class="stat-card__icon">◉</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">${reservas.length}</div>
          <div class="stat-card__label">Reservas activas</div>
          <div class="stat-card__icon">◷</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Últimas reservas</h3>
            <a href="#reservas" class="card__link">Ver todas →</a>
          </div>
          <div class="card__body">
            ${
              reservas.length === 0
                ? `<p class="empty-state">No hay reservas activas.</p>`
                : reservas
                    .slice(-5)
                    .reverse()
                    .map(
                      (r) => `
                  <div class="list-row">
                    <div class="list-row__info">
                      <span class="list-row__title">Reserva #${r.id}</span>
                      <span class="list-row__sub">Recurso #${r.recurso_id} · ${r.usuario}</span>
                    </div>
                    <span class="badge badge--blue">${r.fecha || "—"}</span>
                  </div>
                `
                    )
                    .join("")
            }
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Recursos recientes</h3>
            <a href="#recursos" class="card__link">Ver todos →</a>
          </div>
          <div class="card__body">
            ${
              recursos.length === 0
                ? `<p class="empty-state">No hay recursos registrados.</p>`
                : recursos
                    .slice(-5)
                    .reverse()
                    .map(
                      (r) => `
                  <div class="list-row">
                    <div class="list-row__info">
                      <span class="list-row__title">${r.nombre}</span>
                      <span class="list-row__sub">${r.tipo}</span>
                    </div>
                    <span class="badge ${r.disponible ? "badge--green" : "badge--red"}">
                      ${r.disponible ? "Disponible" : "Ocupado"}
                    </span>
                  </div>
                `
                    )
                    .join("")
            }
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    main.innerHTML = `<div class="error-state">Error al cargar datos: ${err.message}</div>`;
  }
}
