#!/bin/bash
set -e

echo "================================================"
echo " Desplegando laboratorio con Ansible"
echo "================================================"

echo ""
echo ">>> [1/14] Configurando DNS en todos los nodos..."
ansible-playbook -i hosts.ini setup_dns.yml

echo ""
echo ">>> [2/14] Instalando Node Exporter..."
ansible-playbook -i hosts.ini install_node_exporter.yml

echo ""
echo ">>> [3/14] Instalando PostgreSQL..."
ansible-playbook -i hosts.ini install_postgres.yml

echo ""
echo ">>> [4/14] Configurando PostgreSQL para conexiones remotas..."
ansible-playbook -i hosts.ini configure_postgres.yml

echo ""
echo ">>> [5/14] Creando base de datos tablas y usuario..."
ansible-playbook -i hosts.ini setup_database.yml

echo ""
echo ">>> [6/14] Dando permisos a appuser..."
ansible-playbook -i hosts.ini fix_permisos.yml

echo ""
echo ">>> [7/14] Instalando Python FastAPI y dependencias JWT..."
ansible-playbook -i hosts.ini install_api.yml

echo ""
echo ">>> [8/14] Desplegando aplicacion de reservas..."
ansible-playbook -i hosts.ini deploy_app.yml

echo ""
echo ">>> [9/14] Creando usuario inicial admin..."
ansible-playbook -i hosts.ini setup_initial_user.yml

echo ""
echo ">>> [10/14] Instalando Prometheus y Grafana..."
ansible-playbook -i hosts.ini install_monitoring.yml

echo ""
echo ">>> [11/14] Configurando Prometheus con todos los nodos..."
ansible-playbook -i hosts.ini configure_prometheus.yml

echo ""
echo ">>> [12/14] Configurando almacenamiento y backup..."
ansible-playbook -i hosts.ini setup_ceph.yml
ansible-playbook -i hosts.ini setup_backup.yml

echo ""
echo ">>> [13/14] Configurando reenvios de puerto..."
ansible-playbook -i hosts.ini setup_port_forwards.yml

echo ""
echo ">>> [14/14] Desplegando frontend..."
ansible-playbook -i hosts.ini deploy_frontend.yml

echo ""
echo "================================================"
echo " Laboratorio desplegado exitosamente"
echo ""
echo " Servicios disponibles:"
echo "   Frontend:        http://localhost"
echo "   API de Reservas: http://localhost:8000/docs"
echo "   Prometheus:      http://localhost:9090"
echo "   Grafana:         http://localhost:3000"
echo ""
echo " Usuario inicial:"
echo "   Username: admin"
echo "   Password: admin123"
echo "================================================"
