# OEM Integration: Security & Threat Model (Initial)

Status: draft

## Threat Modeling (STRIDE-lite)
- Spoofing: ECU impersonation, rogue devices
- Tampering: Firmware images, bus traffic
- Repudiation: Insufficient audit trails
- Information Disclosure: PII in logs/telemetry
- Denial of Service: Bus flooding, diagnostic session abuse
- Elevation of Privilege: Bypassing security access, debug backdoors

## Controls
- Secrets: Use env/secret store; never commit keys
- FW Updates: Signed packages, verify before flash, rollback on failure
- Transport: Secure channels where applicable (e.g., TLS for remote APIs)
- Logging: Redact PII, structured logs with levels
- AuthZ: Principle of least privilege for remote operations

## Operational Guidance
- Key rotation procedures (documented per OEM)
- Incident response and rollback plans
- Regular test of negative UDS responses and edge cases