# Acoustics Data Directory

## Purpose

This directory contains vehicle-specific acoustics data that extends the basic audio system information in `cars.json`. While `cars.json` provides simple speaker counts and system names, this directory offers comprehensive acoustic measurements, tuning recommendations, and technical specifications for vehicle audio optimization.

## Directory Structure

The acoustics data is organized by brand and model using a standardized slug-based naming convention:

```
acoustics/
├── schema.json                    # JSON Schema for validation
├── README.md                      # This documentation
├── brand-slug/                    # Brand directory (normalized slug)
│   ├── model-slug.json           # Model acoustics data
│   └── other-model-slug.json
└── other-brand-slug/
    └── model-slug.json
```

## Naming Conventions and Slug Rules

### Brand and Model Slugs
All directory names and file names follow these normalization rules:

1. **Lowercase**: Convert all characters to lowercase
2. **Remove diacritics**: "Škoda" → "skoda", "Citroën" → "citroen"
3. **Trim whitespace**: Remove leading/trailing spaces
4. **Spaces and slashes to hyphens**: "3 Series" → "3-series", "E-Class/Estate" → "e-class-estate"
5. **Strip non-alphanumerics**: Keep only letters, numbers, and hyphens
6. **Single hyphens**: Multiple consecutive hyphens become single hyphens

### Examples
- **"Škoda"** → `skoda/`
- **"Mercedes-Benz"** → `mercedes-benz/`
- **"3 Series"** → `3-series.json`
- **"e-tron GT"** → `e-tron-gt.json`
- **"Model 3"** → `model-3.json`

### File Paths Examples
```
acoustics/skoda/octavia.json
acoustics/volkswagen/golf.json
acoustics/bmw/3-series.json
acoustics/mercedes-benz/e-class.json
acoustics/tesla/model-3.json
```

## Schema Overview

All acoustics files must conform to the JSON Schema defined in `schema.json`. The schema uses **JSON Schema Draft 07** and enforces:

### Required Fields
- `version` (integer): Schema version for future compatibility
- `metadata.name` (string): Display name of the vehicle model

### Optional Sections
- **metadata**: Source information, measurement details, notes
- **cabin**: Physical characteristics (type, volume)
- **nvh**: Noise, Vibration, and Harshness measurements
- **rt60_ms**: Reverberation times per frequency band
- **resonance_modes**: Cabin resonance characteristics
- **target_curve**: Reference tuning curve
- **mic_positions**: Measurement microphone positions
- **ir_assets**: Impulse response file references
- **measured_fr_bands**: Frequency response measurements
- **recommended_tuning**: EQ, time alignment, and crossover settings

## Units and Coordinate System

### Units
- **Frequency**: Hz (Hertz)
- **Time**: ms (milliseconds)
- **Volume**: l (liters)
- **Sound Level**: dBA (A-weighted decibels)
- **Gain**: dB (decibels)
- **Distance**: m (meters)

### Coordinate System (for mic_positions)
- **X-axis**: Left (-) to Right (+), meters
- **Y-axis**: Rear (-) to Front (+), meters  
- **Z-axis**: Down (-) to Up (+), meters
- **Origin**: Vehicle center at floor level

Example: Driver's ear position might be `{"x": 0.42, "y": 0.20, "z": 0.90}`

## Asset Paths

Impulse response files and other audio assets are referenced using relative paths from the repository root:

```json
"ir_assets": [
  {"channel": "driver_L", "url": "assets/ir/brand/model/driver_L.wav"}
]
```

**Note**: Asset files are not currently included in the repository but paths are preserved for future implementation.

## Contributing New Model Files

### Step 1: Create the Directory Structure
```bash
mkdir -p acoustics/brand-slug
```

### Step 2: Create the Model File
Use the slug naming convention:
```bash
touch acoustics/brand-slug/model-slug.json
```

### Step 3: Follow the Schema
Ensure your JSON file includes at minimum:
```json
{
  "version": 1,
  "metadata": {
    "name": "Brand Model Name"
  }
}
```

### Step 4: Add Reference in cars.json
Update the corresponding model in `cars.json` to include:
```json
{
  "name": "Model Name",
  "acoustics": "acoustics/brand-slug/model-slug.json"
}
```

### Step 5: Validate
Run the validation script to ensure compliance:
```bash
npm run validate:acoustics
```

## Validation

The repository includes a TypeScript validation script that:
- Loads all `acoustics/**/*.json` files
- Validates against `schema.json` using AJV
- Reports any schema violations

## Development Tools

- **TypeScript Types**: Available in `types/acoustics.d.ts`
- **Validation Script**: `scripts/validate-acoustics.ts`
- **NPM Script**: `npm run validate:acoustics`

## Data Quality Guidelines

1. **Realistic Values**: Use plausible measurements, not random numbers
2. **Consistent Units**: Follow the specified unit conventions
3. **Complete Metadata**: Include source, measurement date, and notes
4. **Proper Formatting**: Use consistent JSON formatting and indentation
5. **Schema Compliance**: Always validate against the schema before committing

## Future Enhancements

This system is designed for extensibility:
- Additional acoustic parameters can be added to the schema
- Asset files (impulse responses, frequency response graphs) can be included
- Integration with measurement equipment and calibration tools
- Automated data validation in CI/CD pipelines