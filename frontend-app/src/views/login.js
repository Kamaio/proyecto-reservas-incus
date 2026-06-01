import { login } from "../modules/auth.js";
import { navigate } from "../router.js";

export function renderLogin() {
  return `
    <div class="auth-layout">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="auth-brand__icon">◫</div>
          <div class="auth-brand__name">RESERVAS</div>
          <div class="auth-brand__sub">Sistema de gestión de laboratorios</div>
        </div>

        <div id="login-error" class="alert alert--error" style="display:none;margin-bottom:1rem"></div>

        <div class="form-group">
          <label class="form-label">Usuario</label>
          <input id="username" type="text" class="form-input" placeholder="Ingresa tu usuario" />
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input id="password" type="password" class="form-input" placeholder="Ingresa tu contraseña" />
        </div>

        <button id="login-btn" class="btn btn--primary" style="width:100%;margin-top:0.5rem">
          Iniciar sesión
        </button>
      </div>

      <div style="background:var(--surface);display:flex;align-items:center;justify-content:center;padding:2rem">
        <div style="text-align:center;color:var(--text-2)">
          <div style="font-size:80px;margin-bottom:1rem;color:var(--accent)">◫</div>
          <div style="font-family:var(--font-mono);font-size:13px;letter-spacing:0.1em">SISTEMAS DISTRIBUIDOS</div>
          <div style="font-size:12px;margin-top:8px">Plataforma de reservas sobre Incus</div>
        </div>
      </div>
    </div>
  `;
}

export function initLogin() {
  const btn = document.getElementById("login-btn");
  const input = document.getElementById("password");

  const doLogin = async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorDiv = document.getElementById("login-error");

    try {
      await login(username, password);
      navigate("dashboard");
    } catch (e) {
      errorDiv.style.display = "block";
      errorDiv.textContent = e.message;
    }
  };

  btn.addEventListener("click", doLogin);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
}
