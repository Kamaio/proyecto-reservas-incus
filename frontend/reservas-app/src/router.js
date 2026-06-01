import { isAuthenticated } from "./modules/auth.js";
import { renderLogin, initLogin } from "./views/login.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderRecursos } from "./views/recursos.js";
import { renderReservas } from "./views/reservas.js";
import { renderUsuarios, initUsuarios } from "./views/usuarios.js";

export function navigate(route) {
  window.location.hash = `#${route}`;
}

export async function initRouter(app) {
  async function render() {
    const hash = window.location.hash.replace("#", "") || "login";

    if (hash !== "login" && !isAuthenticated()) {
      navigate("login");
      return;
    }

    if (hash === "login" && isAuthenticated()) {
      navigate("dashboard");
      return;
    }

    if (hash === "login") {
      app.innerHTML = renderLogin();
      initLogin();
    } else if (hash === "dashboard") {
      await renderDashboard();
    } else if (hash === "recursos") {
      await renderRecursos();
    } else if (hash === "reservas") {
      await renderReservas();
    } else if (hash === "usuarios") {
      app.innerHTML = renderUsuarios();
      await initUsuarios();
    } else {
      navigate("login");
    }
  }

  window.addEventListener("hashchange", render);
  await render();
}

export function register() {}
export function startRouter() {}
