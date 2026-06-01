# Plataforma de Gestión de Reservas sobre Incus

Proyecto final de Sistemas Distribuidos. Plataforma distribuida de gestión de
reservas de laboratorios académicos, desplegada sobre contenedores Incus con
automatización, monitoreo, persistencia y frontend web.

## Arquitectura
internet -> incusbr0 (uplink) -> lab-ovn (OVN 10.10.0.0/24) -> contenedores

| Contenedor   | IP        | Rol                                    |
|--------------|-----------|----------------------------------------|
| node-control | 10.10.0.2 | Orquestación y control                 |
| monitoring   | 10.10.0.3 | Prometheus y Grafana                   |
| db-postgres  | 10.10.0.4 | Base de datos PostgreSQL               |
| app-api      | 10.10.0.5 | API REST FastAPI                       |
| app-core     | 10.10.0.6 | Lógica de negocio (preparado)          |
| ceph-node    | 10.10.0.7 | Almacenamiento persistente y backups   |
| frontend     | 10.10.0.8 | Interfaz web con Nginx                 |

## Requisitos de hardware

- CPU: 4 núcleos con virtualización habilitada (Intel VT-x o AMD-V)
- RAM: 8 GB mínimo
- Disco: 256 GB SSD
- SO: Ubuntu 24.04 LTS

## Herramientas utilizadas

- Incus 7.0.0 — gestión de contenedores
- OVN — red virtualizada
- OpenTofu 1.12.0 — infraestructura como código
- Ansible — automatización de configuración
- PostgreSQL 16 — base de datos relacional
- FastAPI + Uvicorn — API REST en Python
- JWT (python-jose + passlib) — autenticación
- Prometheus + Grafana — monitoreo y métricas
- Nginx — servidor web del frontend

## Instalación desde cero

### Paso 1 — Preparar el sistema
```bash
bash setup.sh
```

### Paso 2 — Inicializar Incus manualmente
```bash
sudo incus admin init
# Acepta todos los defaults
# Storage backend: dir
```

### Paso 3 — Configurar red uplink para OVN
```bash
incus network set incusbr0 ipv4.address=10.23.121.1/24
incus network set incusbr0 ipv4.nat=true
incus network set incusbr0 ipv4.dhcp.ranges=10.23.121.2-10.23.121.99
incus network set incusbr0 ipv4.ovn.ranges=10.23.121.100-10.23.121.200
```

### Paso 4 — Crear infraestructura con OpenTofu
```bash
cd tofu
tofu init
tofu apply
```

### Paso 5 — Desplegar todo con Ansible
```bash
cd ../ansible
bash deploy_all.sh
```

El script ejecuta automáticamente en orden:
1. Configurar DNS en todos los nodos
2. Instalar Node Exporter en todos los nodos
3. Instalar y configurar PostgreSQL
4. Crear base de datos, tablas y datos iniciales
5. Dar permisos a appuser
6. Instalar Python, FastAPI y dependencias JWT
7. Desplegar la API de reservas
8. Crear usuario administrador inicial
9. Instalar Prometheus y Grafana
10. Configurar Prometheus con todos los nodos
11. Configurar almacenamiento Ceph y backup automático
12. Configurar reenvíos de puerto
13. Desplegar frontend web

## Servicios disponibles

| Servicio    | URL                        | Credenciales  |
|-------------|----------------------------|---------------|
| Frontend    | http://localhost            | admin/admin123|
| API Swagger | http://localhost:8000/docs  | —             |
| Prometheus  | http://localhost:9090       | —             |
| Grafana     | http://localhost:3000       | admin/admin   |

## API REST — Endpoints

### Autenticación
| Método | Endpoint    | Descripción                              | Auth |
|--------|-------------|------------------------------------------|------|
| POST   | /login      | Iniciar sesión, devuelve token JWT       | No   |
| POST   | /registro   | Registrar nuevo usuario                  | Si   |

### Usuarios
| Método | Endpoint    | Descripción                              | Auth |
|--------|-------------|------------------------------------------|------|
| GET    | /usuarios   | Listar todos los usuarios                | Si   |

### Recursos académicos
| Método | Endpoint          | Descripción                        | Auth |
|--------|-------------------|------------------------------------|------|
| GET    | /recursos         | Listar todos los recursos          | Si   |
| GET    | /recursos/{id}    | Obtener un recurso                 | Si   |
| POST   | /recursos         | Crear nuevo recurso                | Si   |
| PUT    | /recursos/{id}    | Actualizar recurso                 | Si   |
| DELETE | /recursos/{id}    | Eliminar recurso                   | Si   |

### Reservas
| Método | Endpoint          | Descripción                        | Auth |
|--------|-------------------|------------------------------------|------|
| GET    | /reservas         | Listar todas las reservas          | Si   |
| GET    | /reservas/{id}    | Obtener una reserva                | Si   |
| POST   | /reservas         | Crear nueva reserva                | Si   |
| PUT    | /reservas/{id}    | Actualizar reserva                 | Si   |
| DELETE | /reservas/{id}    | Cancelar reserva                   | Si   |

### Sistema
| Método | Endpoint    | Descripción                              | Auth |
|--------|-------------|------------------------------------------|------|
| GET    | /health     | Estado del servicio                      | No   |
| GET    | /metrics    | Métricas para Prometheus                 | No   |

## Almacenamiento y backups

El contenedor ceph-node gestiona el almacenamiento persistente del laboratorio.
PostgreSQL genera un backup automático cada hora que se guarda en el volumen
persistente db-backups. Para restaurar un backup manualmente:

```bash
incus exec db-postgres -- sudo -u postgres psql reservas < /mnt/ceph-data/backups/postgres/reservas_FECHA.sql
```

## Monitoreo

Prometheus recolecta métricas de los 7 nodos cada 15 segundos.
Grafana visualiza las métricas en dashboards personalizados.
La API expone métricas de aplicación en /metrics:
- reservas_requests_total: total de peticiones recibidas
- reservas_creadas_total: total de reservas creadas
- reservas_errores_total: total de errores registrados

## Logs

La API registra todos los eventos en /var/log/app-api.log dentro del
contenedor app-api. Para ver los logs en tiempo real:

```bash
incus exec app-api -- tail -f /var/log/app-api.log
```

## Estructura del repositorio
proyecto/
├── setup.sh                    # Script de preparacion del sistema
├── README.md                   # Este archivo
├── frontend-app/               # Codigo fuente del frontend web
│   └── src/
│       ├── views/              # Vistas de la aplicacion
│       ├── modules/            # Modulos de API y autenticacion
│       └── config.js           # Configuracion de la URL de la API
├── tofu/
│   └── main.tf                 # Infraestructura como codigo
└── ansible/
├── hosts.ini               # Inventario de nodos
├── deploy_all.sh           # Script maestro de despliegue
├── setup_dns.yml           # Configurar DNS
├── install_node_exporter.yml
├── install_postgres.yml
├── configure_postgres.yml
├── setup_database.yml
├── fix_permisos.yml
├── install_api.yml
├── deploy_app.yml          # Desplegar API de reservas
├── setup_initial_user.yml
├── install_monitoring.yml
├── configure_prometheus.yml
├── setup_ceph.yml
├── setup_backup.yml
├── setup_port_forwards.yml
└── deploy_frontend.yml
