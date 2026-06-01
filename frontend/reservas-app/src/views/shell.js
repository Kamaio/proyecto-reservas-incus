import { logout } from "../modules/auth.js";
import { navigate } from "../router.js";

export function renderShell(content = "") {
  const username = localStorage.getItem("username") || "Usuario";
  const initial = username.charAt(0).toUpperCase();

  return `
    <div style="display:flex;height:100vh;overflow:hidden">
      <aside class="sidebar">
        <div class="sidebar__brand">
          <span class="sidebar__icon">◫</span>
          <span class="sidebar__name">RESERVAS</span>
        </div>
        <nav class="sidebar__nav">
          <a href="#dashboard" class="nav-item">
            <span class="nav-item__icon">◈</span> Inicio
          </a>
          <a href="#recursos" class="nav-item">
            <span class="nav-item__icon">◫</span> Recursos
          </a>
          <a href="#reservas" class="nav-item">
            <span class="nav-item__icon">◷</span> Reservas
          </a>
          <a href="#usuarios" class="nav-item">
            <span class="nav-item__icon">◉</span> Usuarios
          </a>
        </nav>
        <div class="sidebar__footer">
          <div class="sidebar__user">
            <div class="sidebar__avatar">${initial}</div>
            <div class="sidebar__username">${username}</div>
          </div>
          <button id="logout-btn" style="background:none;border:none;color:var(--text-2);cursor:pointer;padding:4px" title="Cerrar sesión">⏻</button>
        </div>
      </aside>
      <main id="main-content" class="main-content">
        ${content}
      </main>
    </div>
  `;
}

export function initShell() {
  const btn = document.getElementById("logout-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      logout();
      navigate("login");
    });
  }
}

export function mountShell(activeRoute) {
  const app = document.getElementById("app");
  app.innerHTML = renderShell("");
  initShell();

  document.querySelectorAll(".nav-item").forEach(link => {
    const href = link.getAttribute("href");
    if (href && href.replace("#", "") === activeRoute) {
      link.classList.add("nav-item--active");
    }
  });
}
