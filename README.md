# Plataforma de Gestion de Reservas sobre Incus

## Arquitectura
internet -> incusbr0 (uplink) -> lab-ovn (OVN 10.10.0.0/24) -> contenedores

## Nodos
node-control 10.10.0.2 - Orquestacion y control
monitoring   10.10.0.3 - Prometheus y Grafana
db-postgres  10.10.0.4 - Base de datos PostgreSQL
app-api      10.10.0.5 - API REST FastAPI
app-core     10.10.0.6 - Logica de negocio

## Requisitos
- CPU: 4 nucleos con virtualizacion habilitada
- RAM: 8 GB minimo
- Disco: 256 GB SSD
- SO: Ubuntu 24.04 LTS

## Instalacion desde cero
1. bash setup.sh
2. sudo incus admin init (acepta defaults, storage: dir)
3. incus network set incusbr0 ipv4.address=10.23.121.1/24
4. incus network set incusbr0 ipv4.nat=true
5. incus network set incusbr0 ipv4.dhcp.ranges=10.23.121.2-10.23.121.99
6. incus network set incusbr0 ipv4.ovn.ranges=10.23.121.100-10.23.121.200
7. cd tofu && tofu init && tofu apply
8. cd ../ansible && bash deploy_all.sh

## Servicios
- API: http://localhost:8000/docs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

## Endpoints API
GET  /health    - Estado del servicio
GET  /recursos  - Listar recursos
POST /reservas  - Crear reserva
GET  /reservas  - Listar reservas
GET  /metrics   - Metricas Prometheus

## Herramientas
- Incus 7.0.0
- OVN
- OpenTofu 1.12.0
- Ansible
- PostgreSQL 16
- FastAPI
- Prometheus y Grafana
