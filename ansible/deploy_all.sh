#!/bin/bash
set -e

echo "================================================"
echo " Desplegando laboratorio con Ansible"
echo "================================================"

echo ""
echo ">>> [1/12] Configurando DNS en todos los nodos..."
ansible-playbook -i hosts.ini setup_dns.yml

echo ""
echo ">>> [2/12] Instalando Node Exporter..."
ansible-playbook -i hosts.ini install_node_exporter.yml

echo ""
echo ">>> [3/12] Instalando PostgreSQL..."
ansible-playbook -i hosts.ini install_postgres.yml

echo ""
echo ">>> [4/12] Configurando PostgreSQL para conexiones remotas..."
ansible-playbook -i hosts.ini configure_postgres.yml

echo ""
echo ">>> [5/12] Creando base de datos tablas y usuario..."
ansible-playbook -i hosts.ini setup_database.yml

echo ""
echo ">>> [6/12] Dando permisos a appuser..."
ansible-playbook -i hosts.ini fix_permisos.yml

echo ""
echo ">>> [7/12] Instalando Python FastAPI y dependencias JWT..."
ansible-playbook -i hosts.ini install_api.yml

echo ""
echo ">>> [8/12] Desplegando aplicacion de reservas..."
ansible-playbook -i hosts.ini deploy_app.yml

echo ""
echo ">>> [9/12] Instalando Prometheus y Grafana..."
ansible-playbook -i hosts.ini install_monitoring.yml

echo ""
echo ">>> [10/12] Configurando Prometheus..."
ansible-playbook -i hosts.ini configure_prometheus.yml

echo ""
echo ">>> [11/12] Configurando almacenamiento y backup..."
ansible-playbook -i hosts.ini setup_ceph.yml
ansible-playbook -i hosts.ini setup_backup.yml

echo ""
echo ">>> [12/12] Configurando reenvios de puerto..."
ansible-playbook -i hosts.ini setup_port_forwards.yml

echo ""
echo "================================================"
echo " Laboratorio desplegado exitosamente"
echo ""
echo " Servicios disponibles:"
echo "   API de Reservas: http://localhost:8000/docs"
echo "   Prometheus:      http://localhost:9090"
echo "   Grafana:         http://localhost:3000"
echo "================================================"
