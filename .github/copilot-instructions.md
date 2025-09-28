# Tunexa - GitHub Copilot Instructions

## Project Overview

Tunexa is an **Intelligent Audio Engine** that adapts to users' preferences. It's a modular system for analysis, tuning, and certification of automotive audio systems. The project includes AI tools for vehicle comparison, audio measurement according to standards, OEM system integration, and an advanced AI background listener.

## Architecture & Modules

This is a **TypeScript/Node.js** project with the following modular structure:

### Core Modules
- **reference_car_comparison** - Vehicle comparison based on selected criteria
- **audio_certification** - Automated measurements and audio system certification  
- **oem_integration** - Integration with OEM electronics and car diagnostics
- **ai_background_listener** - Continuous environment monitoring and trigger response
- **spotify-integration** - Spotify API integration features
- **profile-lock-continuity** - User profile and session management

### Key Directories
- `acoustics/` - Structured acoustic data with JSON schema validation
- `scripts/` - Build and validation utilities
- `types/` - TypeScript type definitions
- `docs/` - Project documentation
- `modules/` - Individual feature modules with their own structure

## Coding Standards

### TypeScript
- Use **strict TypeScript** with explicit types
- Prefer `interface` over `type` for object definitions
- Use consistent naming: `PascalCase` for types/interfaces, `camelCase` for variables/functions
- Export interfaces and types from dedicated files in `types/` directory

### File Organization
- Each module should have its own `index.ts`, `README.md`, and tests
- Use absolute imports from project root where possible
- Place validation scripts in `scripts/` directory
- Type definitions go in `types/` directory

### Data Validation
- All JSON data must conform to schemas (see `acoustics/schema.json`)
- Use AJV for JSON Schema validation
- Validate data integrity with the `npm run validate:acoustics` script

## Development Workflow

### Building & Testing
```bash
npm install              # Install dependencies
npm run validate:acoustics  # Validate acoustics data
npm test                # Run tests (currently placeholder)
```

### Acoustics Data
- All acoustics files must follow the schema in `acoustics/schema.json`
- Use realistic measurement values, not random numbers
- Include complete metadata (source, measurement date, notes)
- Validate schema compliance before committing
- Asset paths reference future audio files: `assets/ir/brand/model/file.wav`

### Data Structure Standards
- Use consistent units: Hz (frequency), ms (time), dBA (sound level), dB (gain)
- Follow coordinate system: X=left/right, Y=rear/front, Z=down/up
- Vehicle-specific slugs: lowercase, hyphens, no spaces

## Project Context

### Business Domain
- **Automotive audio systems** and tuning
- **Acoustic measurements** and certification
- **OEM integration** with vehicle electronics
- **AI-driven** audio personalization

### Technical Stack
- **Runtime**: Node.js with TypeScript
- **Validation**: AJV with JSON Schema Draft 07
- **Build Tools**: TSX for TypeScript execution
- **Protocols**: CAN, UDS, OBD-II, LIN (in OEM integration)
- **Standards**: ISO automotive standards compliance

### Key Features
- Modular architecture for different automotive audio aspects
- Schema-validated acoustic data with realistic measurements
- Cross-platform compatibility for various OEM systems
- AI-powered background listening and response

## When Contributing Code

1. **Follow existing patterns** in module structure and naming
2. **Validate data integrity** using existing scripts
3. **Maintain schema compliance** for acoustics data
4. **Include realistic values** in automotive measurements
5. **Use TypeScript strictly** with proper type definitions
6. **Document protocols and standards** especially for OEM integration

## Special Considerations

- This project handles **automotive data** - use realistic ranges and units
- **Acoustic measurements** should be plausible for car interiors
- **OEM protocols** require understanding of automotive standards
- **Multi-language support** - some documentation in Slovak/Czech
- **Asset references** are placeholders for future audio files

## Examples of Good Practices

### Type Definition Example
```typescript
export interface VehicleAcoustics {
  version: number;
  metadata: AcousticsMetadata;
  cabin?: Cabin;
  nvh?: NVH;
  // ... other optional sections
}
```

### Validation Example
```typescript
// Always validate JSON data against schema
const validate = ajv.compile(schema);
const isValid = validate(data);
if (!isValid) {
  console.error('Validation errors:', validate.errors);
}
```

### Realistic Data Example
```json
{
  "nvh": {
    "idle_dBA": 32,
    "speed_100kmh_dBA": 68,
    "noise_profile": ["road", "wind", "engine"]
  }
}
```

Remember: This is a specialized automotive audio project requiring domain knowledge and attention to technical accuracy in measurements and standards.