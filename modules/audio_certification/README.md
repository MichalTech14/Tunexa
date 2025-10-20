# Audio Certification Module

Automatizované merania a certifikácia audio systémov v automobiloch podľa medzinárodných štandardov.

## Funkcie

### 🎯 Hlavné funkcie
- **Automatizované merania** - sine sweep, pink noise, white noise testy
- **Certifikácia podľa štandardov** - ISO 3382-3, AES, custom standards  
- **Generovanie reportov** - JSON, HTML, PDF formáty
- **Validácia dát** - kontrola integrity meraní

### 📊 Merané parametre
- **Frequency Response** - frekvenčná charakteristika v third-octave pásmach
- **THD (Total Harmonic Distortion)** - celkové harmonické skreslenie
- **SNR (Signal-to-Noise Ratio)** - odstup signálu od šumu
- **Dynamic Range** - dynamický rozsah
- **Phase Response** - fázová charakteristika

### 🎤 Merané pozície
- `driver_head` - pozícia vodiča
- `passenger_head` - pozícia spolujazdca  
- `rear_left` - zadný ľavý
- `rear_right` - zadný pravý

## Použitie

```typescript
import { 
  performMeasurement, 
  generateCertificationReport,
  getDefaultMeasurementConfig 
} from './index.js';

// Základná konfigurácia merania
const config = getDefaultMeasurementConfig();

// Vykonanie merania
const result = await performMeasurement(config, vehicleAcoustics);

// Generovanie certifikačného reportu
const report = await generateCertificationReport(
  [result],
  vehicleInfo,
  audioSystemInfo
);

// Export do HTML
const htmlReport = exportReport(report, 'html');
```

## Certifikačné štandardy

### ISO 3382-3:2012
- **Frequency Response tolerance:** ±3 dB
- **THD maximum:** 1.0%
- **SNR minimum:** 80 dB
- **Dynamic Range minimum:** 90 dB

### Harman OE 2019 Target Curve
- Automobilová target krivka pre in-cabin listening
- Optimalizovaná pre automotive akustiku

## Výstupné formáty

- **JSON** - štruktúrované dáta pre ďalšie zpracovanie
- **HTML** - interaktívny report pre prezentáciu
- **PDF** - printable certifikát (v implementácii)

## Workflow

1. **Konfigurácia** → nastavenie test signálov a pozícií
2. **Meranie** → automatické spustenie test sekvencií  
3. **Vyhodnotenie** → porovnanie s certifikačnými štandardmi
4. **Report** → generovanie certifikačného dokumentu
5. **Export** → výstup v požadovanom formáte