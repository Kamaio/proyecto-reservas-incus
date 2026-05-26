terraform {
  required_providers {
    incus = {
      source  = "lxc/incus"
      version = "~> 0.5"
    }
  }
}

provider "incus" {}

resource "incus_network" "lab_ovn" {
  name = "lab-ovn"
  type = "ovn"
  config = {
    "ipv4.address" = "10.10.0.1/24"
    "ipv4.nat"     = "true"
    "ipv6.address" = "none"
    "network"      = "incusbr0"
  }
}

resource "incus_instance" "node_control" {
  name       = "node-control"
  image      = "images:ubuntu/24.04"
  running    = true
  depends_on = [incus_network.lab_ovn]
  device {
    name = "eth0"
    type = "nic"
    properties = { network = "lab-ovn" }
  }
}

resource "incus_instance" "app_api" {
  name       = "app-api"
  image      = "images:ubuntu/24.04"
  running    = true
  depends_on = [incus_network.lab_ovn]
  device {
    name = "eth0"
    type = "nic"
    properties = { network = "lab-ovn" }
  }
}

resource "incus_instance" "app_core" {
  name       = "app-core"
  image      = "images:ubuntu/24.04"
  running    = true
  depends_on = [incus_network.lab_ovn]
  device {
    name = "eth0"
    type = "nic"
    properties = { network = "lab-ovn" }
  }
}

resource "incus_instance" "db_postgres" {
  name       = "db-postgres"
  image      = "images:ubuntu/24.04"
  running    = true
  depends_on = [incus_network.lab_ovn]
  device {
    name = "eth0"
    type = "nic"
    properties = { network = "lab-ovn" }
  }
}

resource "incus_instance" "monitoring" {
  name       = "monitoring"
  image      = "images:ubuntu/24.04"
  running    = true
  depends_on = [incus_network.lab_ovn]
  device {
    name = "eth0"
    type = "nic"
    properties = { network = "lab-ovn" }
  }
}
