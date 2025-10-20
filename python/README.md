# Python Integration for Tunexa

Tento priečinok obsahuje Python skripty na import automotive audio databázy do Tunexa API.

## Súbory

- `send_to_api.py` - Odošle `auto_audio_db` dict priamo na Tunexa API endpoint
- `requirements.txt` - Python závislosti

## Použitie

### 1. Inštalácia závislostí

```bash
pip install -r requirements.txt
```

### 2. Odoslanie dát na API

```bash
python send_to_api.py
```

Alebo ak máš svoj vlastný `main.py` s databázou:

```python
from main import auto_audio_db
import json
import requests

url = "http://localhost:3000/api/vehicle-speakers/import"
response = requests.post(url, json=auto_audio_db)
print(response.json())
```

### 3. Export do JSON súboru

```bash
python send_to_api.py  # exportuje do auto_audio_db.json
```

Potom môžeš skopírovať JSON a vložiť ho do web UI:
- Otvor: http://localhost:3000/speakers
- Nájdi sekciu "Bulk Import"
- Vlož JSON
- Klikni "Import JSON → DB"

## Formát dát

API očakáva štruktúru:

```python
{
  "Brand": {
    "Model": [
      {
        "premiovy_system": "Harman Kardon",  # alebo premium_system, audio_brand
        "pocet_reproduktorov": 16,           # alebo pocet, speakers, count
        "generacia": "G05",                  # voliteľné
        "vykon": "464W"                      # voliteľné
      }
    ]
  }
}
```

## API Endpoint

```
POST http://localhost:3000/api/vehicle-speakers/import
Content-Type: application/json

Body: auto_audio_db dictionary
```

### Response

```json
{
  "brands": 3,
  "models": 5,
  "created": 4,
  "updated": 1,
  "skipped": 0,
  "errors": []
}
```

## Príklady

### Minimálny príklad

```python
data = {
  "BMW": {
    "X5": [{"premiovy_system": "Harman", "pocet_reproduktorov": 16}]
  }
}
```

### Kompletný príklad

```python
auto_audio_db = {
    "BMW": {
        "X5": [{
            "generacia": "G05",
            "premiovy_system": "Harman Kardon",
            "pocet_reproduktorov": 16,
            "vykon": "464W",
            "subwoofer": True
        }],
        "3 Series": [{
            "generacia": "G20",
            "premiovy_system": "Harman Kardon",
            "pocet_reproduktorov": 16
        }]
    },
    "Audi": {
        "Q7": [{
            "generacia": "4M",
            "premiovy_system": "Bang & Olufsen",
            "pocet_reproduktorov": 23
        }]
    }
}
```
