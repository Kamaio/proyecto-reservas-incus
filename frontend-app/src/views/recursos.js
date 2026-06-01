import { mountShell } from "./shell.js";
import { Recursos } from "../modules/api.js";
import { toast, openModal, closeModal, escHtml, setLoading } from "../utils/ui.js";

let recursos = [];
let editingId = null;

export async function renderRecursos() {
  mountShell("recursos");
  const main = document.getElementById("main-content");

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Recursos</h2>
        <p class="page-subtitle">Gestión de recursos del sistema</p>
      </div>
      <button class="btn btn--primary" id="btn-nuevo-recurso">+ Nuevo recurso</button>
    </div>

    <div class="card">
      <div class="card__body" id="recursos-list">
        <div class="page-loading">Cargando recursos…</div>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <div class="modal" id="modal-recurso">
      <div class="modal__backdrop" id="modal-backdrop-recurso"></div>
      <div class="modal__box">
        <div class="modal__header">
          <h3 class="modal__title" id="modal-recurso-title">Nuevo recurso</h3>
          <button class="modal__close" id="modal-recurso-close">✕</button>
        </div>
        <form id="form-recurso" class="auth-form">
          <div class="field">
            <label class="field__label">Nombre</label>
            <input class="field__input" id="recurso-nombre" name="nombre" type="text" required placeholder="Sala A, Proyector..."/>
          </div>
          <div class="field">
            <label class="field__label">Tipo</label>
            <input class="field__input" id="recurso-tipo" name="tipo" type="text" required placeholder="sala, equipo, vehículo..."/>
          </div>
          <div class="field field--inline">
            <label class="field__label">Disponible</label>
            <input type="checkbox" id="recurso-disponible" name="disponible" checked/>
          </div>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" id="btn-cancel-recurso">Cancelar</button>
            <button type="submit" class="btn btn--primary" id="btn-submit-recurso">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal confirmar eliminar -->
    <div class="modal" id="modal-delete-recurso">
      <div class="modal__backdrop" id="modal-backdrop-delete-recurso"></div>
      <div class="modal__box modal__box--sm">
        <div class="modal__header">
          <h3 class="modal__title">Eliminar recurso</h3>
        </div>
        <p class="modal__text">¿Seguro que deseas eliminar este recurso? Esta acción también eliminará sus reservas asociadas.</p>
        <div class="modal__actions">
          <button class="btn btn--ghost" id="btn-cancel-delete">Cancelar</button>
          <button class="btn btn--danger" id="btn-confirm-delete">Eliminar</button>
        </div>
      </div>
    </div>
  `;

  await loadRecursos();
  bindRecursosEvents();
}

async function loadRecursos() {
  const list = document.getElementById("recursos-list");
  try {
    recursos = await Recursos.listar();
    renderTable(list);
  } catch (err) {
    list.innerHTML = `<div class="error-state">Error: ${err.message}</div>`;
  }
}

function renderTable(container) {
  if (recursos.length === 0) {
    container.innerHTML = `<p class="empty-state">No hay recursos. Crea el primero.</p>`;
    return;
  }

  container.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${recursos
          .map(
            (r) => `
          <tr>
            <td class="table__id">#${r.id}</td>
            <td>${escHtml(r.nombre)}</td>
            <td><span class="badge badge--gray">${escHtml(r.tipo)}</span></td>
            <td>
              <span class="badge ${r.disponible ? "badge--green" : "badge--red"}">
                ${r.disponible ? "Disponible" : "Ocupado"}
              </span>
            </td>
            <td class="table__actions">
              <button class="btn-icon" data-action="edit" data-id="${r.id}" title="Editar">✎</button>
              <button class="btn-icon btn-icon--danger" data-action="delete" data-id="${r.id}" title="Eliminar">✕</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function bindRecursosEvents() {
  let deleteTargetId = null;

  // Abrir modal nuevo
  document.getElementById("btn-nuevo-recurso").addEventListener("click", () => {
    editingId = null;
    document.getElementById("modal-recurso-title").textContent = "Nuevo recurso";
    document.getElementById("form-recurso").reset();
    document.getElementById("recurso-disponible").checked = true;
    openModal("modal-recurso");
  });

  // Cerrar modales
  ["modal-recurso-close", "btn-cancel-recurso"].forEach((id) => {
    document.getElementById(id).addEventListener("click", () => closeModal("modal-recurso"));
  });
  document.getElementById("modal-backdrop-recurso").addEventListener("click", () => closeModal("modal-recurso"));

  document.getElementById("btn-cancel-delete").addEventListener("click", () => closeModal("modal-delete-recurso"));
  document.getElementById("modal-backdrop-delete-recurso").addEventListener("click", () => closeModal("modal-delete-recurso"));

  // Delegación de eventos para tabla
  document.getElementById("recursos-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    const recurso = recursos.find((r) => r.id === id);

    if (btn.dataset.action === "edit") {
      editingId = id;
      document.getElementById("modal-recurso-title").textContent = "Editar recurso";
      document.getElementById("recurso-nombre").value = recurso.nombre;
      document.getElementById("recurso-tipo").value = recurso.tipo;
      document.getElementById("recurso-disponible").checked = recurso.disponible;
      openModal("modal-recurso");
    }

    if (btn.dataset.action === "delete") {
      deleteTargetId = id;
      openModal("modal-delete-recurso");
    }
  });

  // Submit form
  document.getElementById("form-recurso").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      nombre: document.getElementById("recurso-nombre").value.trim(),
      tipo: document.getElementById("recurso-tipo").value.trim(),
      disponible: document.getElementById("recurso-disponible").checked,
    };

    setLoading("btn-submit-recurso", true);
    try {
      if (editingId) {
        await Recursos.actualizar(editingId, payload);
        toast("Recurso actualizado");
      } else {
        await Recursos.crear(payload);
        toast("Recurso creado");
      }
      closeModal("modal-recurso");
      await loadRecursos();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading("btn-submit-recurso", false);
    }
  });

  // Confirmar eliminar
  document.getElementById("btn-confirm-delete").addEventListener("click", async () => {
    if (!deleteTargetId) return;
    setLoading("btn-confirm-delete", true);
    try {
      await Recursos.eliminar(deleteTargetId);
      toast("Recurso eliminado");
      closeModal("modal-delete-recurso");
      deleteTargetId = null;
      await loadRecursos();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading("btn-confirm-delete", false);
    }
  });
}
