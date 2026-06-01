# Reservas App — Frontend

SPA de gestión de recursos y reservas, conectada al backend FastAPI en `localhost:8000`.

## Estructura

```
reservas-app/
├── index.html               # Punto de entrada HTML
└── src/
    ├── main.js              # Bootstrap + registro de rutas
    ├── router.js            # Router SPA por hash (#)
    ├── config.js            # URL base de la API
    ├── styles.css           # Sistema de diseño completo
    ├── modules/
    │   ├── auth.js          # login, register, token JWT
    │   └── api.js           # CRUD recursos y reservas
    ├── utils/
    │   └── ui.js            # Toast, modal helpers, escape HTML
    └── views/
        ├── shell.js         # Layout sidebar (app autenticada)
        ├── login.js         # Página de login
        ├── register.js      # Página de registro
        ├── dashboard.js     # Inicio con estadísticas
        ├── recursos.js      # CRUD completo de recursos
        └── reservas.js      # CRUD completo de reservas
```

## Requisitos

- Navegador moderno con soporte ES Modules
- Backend corriendo en `http://localhost:8000`

## Configuración de la URL

Edita `src/config.js`:

```js
export const API_URL = "http://localhost:8000"; // Cambia aquí
```

## Levantar el frontend

Con cualquier servidor estático. Opciones rápidas:

```bash
# Python 3
python3 -m http.server 3000

# Node.js (npx)
npx serve .

# VS Code Live Server
# Instalar extensión "Live Server" → clic derecho en index.html → Open with Live Server
```

Luego abre `http://localhost:3000` en el navegador.

## Endpoints consumidos

| Método | Ruta                  | Descripción             |
|--------|-----------------------|-------------------------|
| POST   | /auth/login           | Iniciar sesión          |
| POST   | /auth/register        | Crear usuario           |
| GET    | /recursos             | Listar recursos         |
| POST   | /recursos             | Crear recurso           |
| PUT    | /recursos/:id         | Actualizar recurso      |
| DELETE | /recursos/:id         | Eliminar recurso        |
| GET    | /reservas             | Listar reservas         |
| POST   | /reservas             | Crear reserva           |
| PUT    | /reservas/:id         | Actualizar usuario      |
| DELETE | /reservas/:id         | Cancelar reserva        |

## Flujo de autenticación

El token JWT recibido en el login se guarda en `localStorage`.
Todas las peticiones autenticadas incluyen el header `Authorization: Bearer <token>`.
Al expirar el token (respuesta 401), el usuario es redirigido al login automáticamente.

## Notas

- No requiere bundler (Vite, Webpack, etc.) — usa ES Modules nativos del navegador
- Si el backend no tiene `/auth/register`, puedes crear usuarios directamente desde la DB o adaptar el endpoint
- Para producción, considera usar un proxy nginx o configurar CORS correctamente en el backend
