# OEM Integration: Protocol Matrix (Initial)

Status: draft

This document tracks initial and planned protocol coverage for the OEM Integration module.

| Protocol | Standard / Spec         | Transport          | Core Features                               | Status   | Notes |
|---------:|--------------------------|--------------------|----------------------------------------------|----------|-------|
| CAN      | ISO 11898                | SocketCAN, vendor  | RX/TX frames, filters, bitrate               | initial  | Dev via vcan supported |
| CAN FD   | ISO 11898-7              | SocketCAN, vendor  | RX/TX frames, higher payload                 | planned  | Requires supported interface |
| LIN      | ISO 17987                | vendor             | Master/slave frames                          | planned  | TBD vendor SDK |
| OBD-II   | SAE J1979                | CAN                | PID read, DTC read/clear                     | initial  | Dev-only examples |
| UDS      | ISO 14229                | CAN, DoIP          | DIDs, routines, security access              | initial  | Basic flows and simulators |
| DoIP     | ISO 13400                | Ethernet           | Discovery, TCP/UDP transport for UDS         | planned  | Network config required |
| SOME/IP  | AUTOSAR                  | Ethernet           | Service discovery, method/event messaging    | planned  | Scoped PoC |

Roadmap and owner mapping will be tracked in issues.