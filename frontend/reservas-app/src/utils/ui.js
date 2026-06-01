// ── TOAST ─────────────────────────────────────────────
export function toast(message, type = "success") {
  const container =
    document.getElementById("toast-container") || createToastContainer();
  const t = document.createElement("div");
  t.className = `toast toast--${type}`;
  t.innerHTML = `
    <span class="toast__icon">${type === "success" ? "✓" : "✕"}</span>
    <span>${message}</span>
  `;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add("toast--show"));
  setTimeout(() => {
    t.classList.remove("toast--show");
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

function createToastContainer() {
  const c = document.createElement("div");
  c.id = "toast-container";
  document.body.appendChild(c);
  return c;
}

// ── MODAL ─────────────────────────────────────────────
export function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add("modal--open");
    document.body.style.overflow = "hidden";
  }
}

export function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove("modal--open");
    document.body.style.overflow = "";
  }
}

export function closeAllModals() {
  document.querySelectorAll(".modal--open").forEach((m) => {
    m.classList.remove("modal--open");
  });
  document.body.style.overflow = "";
}

// ── FORM HELPERS ──────────────────────────────────────
export function getFormData(formId) {
  const form = document.getElementById(formId);
  const data = {};
  new FormData(form).forEach((val, key) => {
    data[key] = val === "on" ? true : val;
  });
  return data;
}

export function resetForm(formId) {
  document.getElementById(formId)?.reset();
}

export function setLoading(buttonId, loading) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.original = btn.dataset.original || btn.textContent;
  btn.textContent = loading ? "Procesando..." : btn.dataset.original;
}

// ── ESCAPE HTML ───────────────────────────────────────
export function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
