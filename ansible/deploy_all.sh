#!/bin/bash
set -e

echo "================================================"
echo " Desplegando laboratorio con Ansible"
echo "================================================"

echo ""
echo ">>> [1/8] Configurando DNS en todos los nodos..."
ansible-playbook -i hosts.ini setup_dns.yml

echo ""
echo ">>> [2/8] Instalando Node Exporter..."
ansible-playbook -i hosts.ini install_node_exporter.yml

echo ""
echo ">>> [3/8] Instalando PostgreSQL..."
ansible-playbook -i hosts.ini install_postgres.yml

echo ""
echo ">>> [4/8] Configurando PostgreSQL para conexiones remotas..."
ansible-playbook -i hosts.ini configure_postgres.yml

echo ""
echo ">>> [5/8] Creando base de datos y tablas..."
ansible-playbook -i hosts.ini setup_database.yml

echo ""
echo ">>> [6/8] Dando permisos a appuser..."
ansible-playbook -i hosts.ini fix_permisos.yml

echo ""
echo ">>> [7/8] Instalando Python y FastAPI..."
ansible-playbook -i hosts.ini install_api.yml

echo ""
echo ">>> [8/8] Desplegando aplicación de reservas..."
ansible-playbook -i hosts.ini deploy_app.yml

echo ""
echo ">>> Instalando monitoreo..."
ansible-playbook -i hosts.ini install_monitoring.yml
ansible-playbook -i hosts.ini configure_prometheus.yml

echo ""
echo ">>> Configurando reenvíos de puerto..."
incus config device add monitoring grafana-port proxy listen=tcp:0.0.0.0:3000 connect=tcp:127.0.0.1:3000 || true
incus config device add monitoring prometheus-port proxy listen=tcp:0.0.0.0:9090 connect=tcp:127.0.0.1:9090 || true
incus config device add app-api api-port proxy listen=tcp:0.0.0.0:8000 connect=tcp:127.0.0.1:8000 || true

echo ""
echo "================================================"
echo " Laboratorio desplegado exitosamente"
echo ""
echo " Servicios disponibles:"
echo "   API de Reservas: http://localhost:8000/docs"
echo "   Prometheus:      http://localhost:9090"
echo "   Grafana:         http://localhost:3000"
echo "================================================"
