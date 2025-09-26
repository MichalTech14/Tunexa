#!/usr/bin/env bash
set -euo pipefail

if ! command -v ip >/dev/null 2>&1; then
  echo "ip command not found; please install iproute2" >&2
  exit 1
fi

sudo modprobe vcan || true
if ip link show vcan0 >/dev/null 2>&1; then
  echo "vcan0 already exists"
else
  sudo ip link add dev vcan0 type vcan
  sudo ip link set up vcan0
  echo "vcan0 created and set up"
fi

ip -details link show vcan0 | sed 's/^/  /'