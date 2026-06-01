import { mountShell } from "./shell.js";
import { Reservas, Recursos } from "../modules/api.js";
import { toast, openModal, closeModal, escHtml, setLoading } from "../utils/ui.js";

let reservas = [];
let recursosDisponibles = [];

export async function renderReservas() {
  mountShell("reservas");
  const main = document.getElementById("main-content");

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Reservas</h2>
        <p class="page-subtitle">Gestión de reservas activas</p>
      </div>
      <button class="btn btn--primary" id="btn-nueva-reserva">+ Nueva reserva</button>
    </div>

    <div class="card">
      <div class="card__body" id="reservas-list">
        <div class="page-loading">Cargando reservas…</div>
      </div>
    </div>

    <!-- Modal nueva reserva -->
    <div class="modal" id="modal-reserva">
      <div class="modal__backdrop" id="modal-backdrop-reserva"></div>
      <div class="modal__box">
        <div class="modal__header">
          <h3 class="modal__title" id="modal-reserva-title">Nueva reserva</h3>
          <button class="modal__close" id="modal-reserva-close">✕</button>
        </div>
        <form id="form-reserva" class="auth-form">
          <div class="field">
            <label class="field__label">Recurso</label>
            <select class="field__input" id="reserva-recurso" name="recurso_id" required>
              <option value="">Seleccionar recurso…</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label">Usuario</label>
            <input class="field__input" id="reserva-usuario" name="usuario" type="text" required placeholder="nombre_usuario"/>
          </div>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" id="btn-cancel-reserva">Cancelar</button>
            <button type="submit" class="btn btn--primary" id="btn-submit-reserva">Reservar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal editar usuario -->
    <div class="modal" id="modal-edit-reserva">
      <div class="modal__backdrop" id="modal-backdrop-edit-reserva"></div>
      <div class="modal__box modal__box--sm">
        <div class="modal__header">
          <h3 class="modal__title">Editar reserva</h3>
          <button class="modal__close" id="modal-edit-reserva-close">✕</button>
        </div>
        <form id="form-edit-reserva" class="auth-form">
          <div class="field">
            <label class="field__label">Nuevo usuario</label>
            <input class="field__input" id="edit-reserva-usuario" type="text" required placeholder="nombre_usuario"/>
          </div>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" id="btn-cancel-edit-reserva">Cancelar</button>
            <button type="submit" class="btn btn--primary" id="btn-submit-edit-reserva">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal cancelar reserva -->
    <div class="modal" id="modal-cancel-reserva">
      <div class="modal__backdrop" id="modal-backdrop-cancel-reserva"></div>
      <div class="modal__box modal__box--sm">
        <div class="modal__header">
          <h3 class="modal__title">Cancelar reserva</h3>
        </div>
        <p class="modal__text">¿Confirmas la cancelación de esta reserva? El recurso volverá a estar disponible.</p>
        <div class="modal__actions">
          <button class="btn btn--ghost" id="btn-no-cancel">Volver</button>
          <button class="btn btn--danger" id="btn-confirm-cancel">Cancelar reserva</button>
        </div>
      </div>
    </div>
  `;

  await loadReservas();
  bindReservasEvents();
}

async function loadReservas() {
  const list = document.getElementById("reservas-list");
  try {
    [reservas, recursosDisponibles] = await Promise.all([
      Reservas.listar(),
      Recursos.listar(),
    ]);
    renderReservasTable(list);
  } catch (err) {
    list.innerHTML = `<div class="error-state">Error: ${err.message}</div>`;
  }
}

function renderReservasTable(container) {
  if (reservas.length === 0) {
    container.innerHTML = `<p class="empty-state">No hay reservas activas. Crea la primera.</p>`;
    return;
  }

  const recursosMap = Object.fromEntries(recursosDisponibles.map((r) => [r.id, r]));

  container.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Recurso</th>
          <th>Usuario</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${reservas
          .map((r) => {
            const recurso = recursosMap[r.recurso_id];
            return `
            <tr>
              <td class="table__id">#${r.id}</td>
              <td>
                <span class="list-row__title">${recurso ? escHtml(recurso.nombre) : "Recurso #" + r.recurso_id}</span>
                ${recurso ? `<br><small class="list-row__sub">${escHtml(recurso.tipo)}</small>` : ""}
              </td>
              <td>${escHtml(r.usuario)}</td>
              <td><span class="badge badge--gray">${r.fecha || "—"}</span></td>
              <td class="table__actions">
                <button class="btn-icon" data-action="edit" data-id="${r.id}" data-usuario="${escHtml(r.usuario)}" title="Editar usuario">✎</button>
                <button class="btn-icon btn-icon--danger" data-action="cancel" data-id="${r.id}" title="Cancelar reserva">✕</button>
              </td>
            </tr>
          `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function populateRecursosSelect() {
  const select = document.getElementById("reserva-recurso");
  const disponibles = recursosDisponibles.filter((r) => r.disponible);
  select.innerHTML = `<option value="">Seleccionar recurso…</option>`;
  if (disponibles.length === 0) {
    select.innerHTML += `<option disabled>No hay recursos disponibles</option>`;
  } else {
    disponibles.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = `${r.nombre} (${r.tipo})`;
      select.appendChild(opt);
    });
  }
}

function bindReservasEvents() {
  let editingId = null;
  let cancelTargetId = null;

  // Abrir modal nueva reserva
  document.getElementById("btn-nueva-reserva").addEventListener("click", () => {
    document.getElementById("form-reserva").reset();
    populateRecursosSelect();
    // Pre-fill username
    document.getElementById("reserva-usuario").value = localStorage.getItem("username") || "";
    openModal("modal-reserva");
  });

  // Cerrar modal nueva
  ["modal-reserva-close", "btn-cancel-reserva"].forEach((id) => {
    document.getElementById(id).addEventListener("click", () => closeModal("modal-reserva"));
  });
  document.getElementById("modal-backdrop-reserva").addEventListener("click", () => closeModal("modal-reserva"));

  // Cerrar modal editar
  ["modal-edit-reserva-close", "btn-cancel-edit-reserva"].forEach((id) => {
    document.getElementById(id).addEventListener("click", () => closeModal("modal-edit-reserva"));
  });
  document.getElementById("modal-backdrop-edit-reserva").addEventListener("click", () => closeModal("modal-edit-reserva"));

  // Cerrar modal cancelar
  document.getElementById("btn-no-cancel").addEventListener("click", () => closeModal("modal-cancel-reserva"));
  document.getElementById("modal-backdrop-cancel-reserva").addEventListener("click", () => closeModal("modal-cancel-reserva"));

  // Delegación eventos tabla
  document.getElementById("reservas-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id);

    if (btn.dataset.action === "edit") {
      editingId = id;
      document.getElementById("edit-reserva-usuario").value = btn.dataset.usuario || "";
      openModal("modal-edit-reserva");
    }

    if (btn.dataset.action === "cancel") {
      cancelTargetId = id;
      openModal("modal-cancel-reserva");
    }
  });

  // Submit nueva reserva
  document.getElementById("form-reserva").addEventListener("submit", async (e) => {
    e.preventDefault();
    const recurso_id = parseInt(document.getElementById("reserva-recurso").value);
    const usuario = document.getElementById("reserva-usuario").value.trim();

    if (!recurso_id) {
      toast("Selecciona un recurso", "error");
      return;
    }

    setLoading("btn-submit-reserva", true);
    try {
      await Reservas.crear({ recurso_id, usuario });
      toast("Reserva creada exitosamente");
      closeModal("modal-reserva");
      await loadReservas();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading("btn-submit-reserva", false);
    }
  });

  // Submit editar usuario
  document.getElementById("form-edit-reserva").addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = document.getElementById("edit-reserva-usuario").value.trim();

    setLoading("btn-submit-edit-reserva", true);
    try {
      await Reservas.actualizar(editingId, usuario);
      toast("Reserva actualizada");
      closeModal("modal-edit-reserva");
      await loadReservas();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading("btn-submit-edit-reserva", false);
    }
  });

  // Confirmar cancelar reserva
  document.getElementById("btn-confirm-cancel").addEventListener("click", async () => {
    if (!cancelTargetId) return;
    setLoading("btn-confirm-cancel", true);
    try {
      await Reservas.cancelar(cancelTargetId);
      toast("Reserva cancelada. Recurso disponible.");
      closeModal("modal-cancel-reserva");
      cancelTargetId = null;
      await loadReservas();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading("btn-confirm-cancel", false);
    }
  });
}
