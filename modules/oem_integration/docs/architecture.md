# OEM Integration: Architecture (Initial)

Status: draft

## Goals
- Provide a modular set of adapters and services for OEM vehicle integration (CAN/UDS/DoIP/etc.).
- Keep security, observability, and updatability first-class.

## Components
- Adapters
  - IOemAdapter: OEM-specific capabilities
  - ICanBus: frame IO, filters, bitrate, channels
  - IDiagnostics: UDS services (ReadDataByIdentifier, SecurityAccess, RoutineControl…)
  - IFirmwareUpdater: package flow, signing/verification, rollback
- Services
  - Telemetry & Logging (structured logs, metrics)
  - Security (key storage, auth, signing)
- Integration
  - REST/gRPC APIs, event bus

## Data Flow (example: UDS ReadDataByIdentifier)
1. Client calls API endpoint (read DID F190 VIN).
2. Adapter negotiates diagnostic session & security (if required).
3. Sends request over CAN/DoIP, handles P2/P2* timeouts.
4. Parses positive/negative responses, maps NRC to errors.
5. Returns structured result and emits metrics/logs.

## Diagram
Add/maintain a data/sequence diagram (optional):
- docs/architecture.drawio (not included yet)