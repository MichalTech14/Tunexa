# Tunexa

**Inteligent Audio Engine, ktorý sa ladí podľa teba.**

Tunexa je modulárny systém pre analýzu, tuning a certifikáciu audio systémov v automobiloch. Projekt obsahuje AI nástroje pre porovnávanie vozidiel, meranie audia podľa štandardov, integráciu s OEM systémami a pokročilý AI background listener.

## Moduly projektu
- **Reference Car Comparison** – porovnávanie vozidiel podľa zvolených kritérií
- **Audio Certification** – automatizované merania a certifikácia audio systémov
- **OEM Integration** – prepojenie s OEM elektronikou a diagnostikou auta
- **AI Background Listener** – neustále sledovanie prostredia a reakcia na spúšťače

## Ako začať
1. Nainštaluj závislosti a spusti lokálny server s ukážkou:
	- Dev server: spustí bundler vo watch režime a server na http://localhost:8080
   
	Príkazy:
   
	- `npm install`
	- `npm run dev`
   
	Následne otvor index na adrese: http://localhost:8080

2. Build jednorazovo (výstup do `dist/`):
	- `npm run build`

3. Každý modul má vlastné README s detailným popisom workflowu a API v `modules/`.
4. Dokumentáciu nájdeš v adresári `docs/`.

## Príspevky a vývoj
- Používaj issues na návrhy, bugy, nápady!
- Čakáme na tvoju spätnú väzbu.

## Licencia
Pozri LICENSE.