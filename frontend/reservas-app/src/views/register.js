import { register } from "../modules/auth.js";
import { toast, setLoading } from "../utils/ui.js";

export function renderRegister() {
  document.getElementById("app").innerHTML = `
    <div class="auth-layout">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="auth-brand__icon">◈</div>
          <h1 class="auth-brand__name">RESERVAS</h1>
          <p class="auth-brand__sub">Sistema de gestión de recursos</p>
        </div>

        <div class="auth-tabs">
          <a href="#login" class="auth-tab">Iniciar sesión</a>
          <a href="#register" class="auth-tab auth-tab--active">Crear cuenta</a>
        </div>

        <form id="register-form" class="auth-form" autocomplete="off">
          <div class="field">
            <label class="field__label" for="reg-username">Usuario</label>
            <input
              class="field__input"
              id="reg-username"
              name="username"
              type="text"
              placeholder="nuevo_usuario"
              required
              autofocus
            />
          </div>

          <div class="field">
            <label class="field__label" for="reg-password">Contraseña</label>
            <input
              class="field__input"
              id="reg-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minlength="6"
            />
          </div>

          <div class="field">
            <label class="field__label" for="reg-confirm">Confirmar contraseña</label>
            <input
              class="field__input"
              id="reg-confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button id="btn-register" class="btn btn--primary btn--full" type="submit">
            Crear cuenta
          </button>
        </form>
      </div>

      <div class="auth-deco" aria-hidden="true">
        <div class="deco-grid"></div>
        <div class="deco-text">SISTEMA<br>DE<br>RESERVAS</div>
      </div>
    </div>
  `;

  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;

    if (password !== confirm) {
      toast("Las contraseñas no coinciden", "error");
      return;
    }

    setLoading("btn-register", true);
    try {
      await register(username, password);
      toast("Cuenta creada. Ahora puedes iniciar sesión.");
      window.location.hash = "#login";
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading("btn-register", false);
    }
  });
}
