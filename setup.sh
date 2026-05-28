#!/bin/bash
set -e

echo "================================================"
echo " Setup completo del laboratorio de reservas"
echo "================================================"

echo ""
echo ">>> [1/7] Instalando dependencias del sistema..."
sudo apt update -y
sudo apt install -y curl git wget ansible iptables-persistent

echo ""
echo ">>> [2/7] Instalando OpenTofu..."
curl -fsSL https://get.opentofu.org/install-opentofu.sh | sudo bash -s -- --install-method deb

echo ""
echo ">>> [3/7] Instalando Incus desde Zabbly..."
curl -fsSL https://pkgs.zabbly.com/key.asc | sudo gpg --dearmor -o /etc/apt/keyrings/zabbly.gpg
sudo sh -c 'cat <<SOURCES > /etc/apt/sources.list.d/zabbly-incus-stable.sources
Enabled: yes
Types: deb
URIs: https://pkgs.zabbly.com/incus/stable
Suites: noble
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/zabbly.gpg
SOURCES'
sudo apt update -y
sudo apt install -y incus
sudo usermod -aG incus-admin $USER

echo ""
echo ">>> [4/7] Instalando OVN..."
sudo apt install -y ovn-host ovn-central openvswitch-switch openvswitch-common
sudo systemctl enable --now ovn-central ovn-host openvswitch-switch

echo ""
echo ">>> [5/7] Configurando NAT permanente..."
sudo iptables -t nat -A POSTROUTING -s 10.10.0.0/24 -o wlp7s0 -j MASQUERADE
sudo iptables -t nat -A POSTROUTING -s 10.23.121.0/24 -o wlp7s0 -j MASQUERADE
sudo sh -c 'iptables-save > /etc/iptables/rules.v4'

echo ""
echo ">>> [6/7] Configurando OVN para Incus..."
sudo incus config set network.ovn.northbound_connection=unix:/var/run/ovn/ovnnb_db.sock
sudo ovs-vsctl set open_vswitch . \
  external_ids:ovn-remote=unix:/var/run/ovn/ovnsb_db.sock \
  external_ids:ovn-encap-type=geneve \
  external_ids:ovn-encap-ip=127.0.0.1
sudo systemctl restart ovn-central ovn-host openvswitch-switch incus

echo ""
echo ">>> [7/7] Configurando red uplink para OVN..."
incus network set incusbr0 ipv4.address=10.23.121.1/24
incus network set incusbr0 ipv4.nat=true
incus network set incusbr0 ipv4.dhcp.ranges=10.23.121.2-10.23.121.99
incus network set incusbr0 ipv4.ovn.ranges=10.23.121.100-10.23.121.200

echo ""
echo "================================================"
echo " SIGUIENTE PASO: ejecuta estos comandos:"
echo ""
echo " 1. sudo incus admin init"
echo "    (acepta defaults, storage=dir)"
echo ""
echo " 2. cd ~/proyecto/tofu && tofu init && tofu apply"
echo ""
echo " 3. cd ~/proyecto/ansible && bash deploy_all.sh"
echo "================================================"
