# OEM Integration Module

Status: alpha

## Purpose

Provides interfaces and workflows for integrating Tunexa modules with OEM (Original Equipment Manufacturer) vehicle systems, including CAN bus, diagnostics (UDS/OBD-II), and infotainment. Enables secure remote diagnostics, configuration, and firmware updates.

---

## Supported OEMs &amp; Protocols (initial)

- Protocols: CAN, CAN FD, LIN, OBD-II (SAE J1979), UDS (ISO 14229), DoIP (ISO 13400), SOME/IP (scoped)
- Transport: SocketCAN (Linux), vendor SDKs (TBD)
- OEMs: To be defined per adapter (see Roadmap)

See also: docs/protocol-matrix.md (optional)

---

## Architecture

- Adapters
  - IOemAdapter: OEM-specific capabilities
  - ICanBus: frame IO, filters, bitrate, channels
  - IDiagnostics: UDS services (ReadDataByIdentifier, SecurityAccess, RoutineControl…)
  - IFirmwareUpdater: package flow, signing/verification, rollback
- Services
  - Telemetry &amp; Logging: structured logs, metrics (latency, error rates)
  - Security: key storage, HSM/TPM optional, authN/Z to remote services
- Integration
  - REST/gRPC API for third-party services
  - Event bus for data streams

A data flow diagram should be added to docs/architecture.drawio (optional).

---

## Directory Structure

- src/
  - adapters/
    - oem-&lt;manufacturer&gt;/
  - services/
    - telemetry/
    - security/
  - protocols/
    - can/, uds/, doip/
- config/
  - example-oem.yml
  - local.yml (gitignored)
- tests/
  - fixtures/

---

## Development &amp; Usage

1) Check out config/example-oem.yml
2) Start the service
  - `make dev` or `npm run dev` / `python -m ...` (TBD)
- Docker: `docker compose up oem_integration`

3) Verify connectivity
- Check logs for CAN channel up and UDS ping (tester present)
- Run basic health check endpoint: `/healthz`

---

## Configuration

- Primary file: config/local.yml (not committed)
- See example: config/example-oem.yml
- Environment variables:
  - OEM_API_BASE, OEM_API_TOKEN
  - CAN_IFACE (e.g., can0), CAN_BITRATE (e.g., 500000)
  - ENABLE_DOIP=true|false

---

## API Surface

- Internal interfaces
  - IOemAdapter
  - ICanBus
  - IDiagnostics
  - IFirmwareUpdater
- External endpoints (REST/gRPC) (TBD)
  - GET /healthz
  - POST /diagnostics/read-did
  - POST /firmware/update

Document errors and retry semantics (e.g., 429 backoff, timeouts, negative responses UDS NRC codes).

---

## Security

- Secrets management: env/secret store; never commit keys
- Firmware updates: signed packages, verify before flash, rollback on failure
- PII: redact in logs; store only aggregated metrics
- Threat model: docs/security.md (TBD)

---

## Observability

- Logging: structured (JSON), levels, correlation IDs
- Metrics: request latency, UDS negative response rates, bus RX/TX per second
- Tracing: optional OpenTelemetry setup

---

## Testing

- Unit tests for adapters and parsers
- Integration tests with virtual can (vcan) / simulators
- HIL (hardware-in-the-loop) optional
- Golden logs: tests/fixtures/

Run: `make test` or `npm test` / `pytest` (TBD)

---

## Troubleshooting

- CAN up but no frames:
  - Verify interface (ip link show), bitrate, termination
- UDS negative responses:
  - Check session/security level and preconditions
- DoIP not reachable:
  - Firewall/multicast routing, VIN discovery

---

## Roadmap

- OEM adapters: VW Group (UDS), BMW (DoIP), Toyota (CAN/UDS)
- Protocol coverage: Some/IP service discovery, extended diagnostics
- Infotainment: media controls via OEM APIs
- Remote firmware management: staged rollout, resume

---

## Contributing

- See CONTRIBUTING.md and CODEOWNERS
- Open discussions/issues with log snippets and versions

## License

- SPDX identifier here

## Changelog

- See CHANGELOG.md
