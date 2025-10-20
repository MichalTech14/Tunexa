#!/usr/bin/env python3
"""
Sends auto_audio_db to Tunexa API /api/vehicle-speakers/import endpoint
"""
import json
import requests

# Importuj tvoje reálne dáta z main.py
try:
    from main import auto_audio_db  # musí existovať v python/main.py
except Exception as e:
    raise SystemExit(f"Nebolo možné importovať auto_audio_db z main.py: {e}")

# API endpoint
API_URL = "http://localhost:3000/api/vehicle-speakers/import"

def send_to_tunexa(data):
    """Send auto_audio_db to Tunexa API"""
    try:
        print(f"Sending {len(data)} brands to Tunexa API...")
        response = requests.post(
            API_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps(data, ensure_ascii=False),
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Import successful!")
            print(f"   Brands processed: {result.get('brands', 0)}")
            print(f"   Models processed: {result.get('models', 0)}")
            print(f"   Created: {result.get('created', 0)}")
            print(f"   Updated: {result.get('updated', 0)}")
            print(f"   Skipped: {result.get('skipped', 0)}")
            if result.get('errors'):
                print(f"   Errors: {len(result['errors'])}")
                for err in result['errors'][:5]:  # Show first 5 errors
                    print(f"      - {err}")
            return True
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the Tunexa API server running on port 3000?")
        print("   Run: npm start")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def export_to_json_file(data, filename="auto_audio_db.json"):
    """Export to JSON file for manual import via UI"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Exported to {filename}")
    print(f"   You can copy/paste this into http://localhost:3000/speakers")

if __name__ == "__main__":
    print("🎵 Tunexa Auto Audio DB → API Import Tool\n")
    
    # Option 1: Send directly to API
    print("Option 1: Send to API")
    success = send_to_tunexa(auto_audio_db)
    
    # Option 2: Export to JSON file
    if not success:
        print("\nOption 2: Export to JSON file")
        export_to_json_file(auto_audio_db)
        print("\nThen manually import via web UI:")
        print("1. Open http://localhost:3000/speakers")
        print("2. Scroll to 'Bulk Import' section")
        print("3. Paste JSON from auto_audio_db.json")
        print("4. Click 'Import JSON → DB'")
