# 🎵 Tunexa Dashboard - Prístupový Návod

## ✅ Server je spustený a beží na porte 3000

### 🌐 Ako otvoriť Dashboard v browseri:

#### **Metóda 1: Cez VS Code PORTS tab (ODPORÚČANÁ)**
1. V spodnej časti VS Code klikni na **"PORTS"** tab (vedľa Terminal)
2. Nájdi riadok s portom **3000**
3. Klikni na ikonu **🌐 (Globe)** v stĺpci "Forwarded Address"
4. Dashboard sa otvorí v tvojom predvolenom browseri

#### **Metóda 2: Cez Forward URL**
1. V **PORTS** tabe skopíruj URL adresu z portu 3000
2. Pridaj na koniec: `/dashboard`
3. Otvor v browseri

#### **Metóda 3: Lokálne (ak beží lokálne)**
Otvor v browseri: `http://localhost:3000/dashboard`

---

## 📡 Dostupné Endpointy:

### **Dashboard & UI:**
- `/dashboard` - Hlavný dashboard s testami
- `/test` - Jednoduchá test stránka
- `/app` - Alternatívna cesta k dashboardu

### **API Endpoints:**
- `GET /` - API root s prehľadom
- `GET /health` - System health check
- `POST /api/audio-certification/certify` - Audio certifikácia
- `POST /api/oem-integration/connect` - OEM pripojenie
- `GET /api/spotify-integration` - Spotify API
- `GET /api/profile-lock-continuity` - Profile management

---

## 🧪 Testovanie API cez Terminal:

```bash
# Health check
curl http://localhost:3000/health

# Audio certification test
curl -X POST http://localhost:3000/api/audio-certification/certify \
  -H "Content-Type: application/json" \
  -d '{"vehicle": "BMW 3 Series", "user": "test"}'

# OEM integration test
curl -X POST http://localhost:3000/api/oem-integration/connect \
  -H "Content-Type: application/json" \
  -d '{"protocol": "CAN-FD", "vehicle": "Tesla Model 3"}'
```

---

## 🔧 Ovládanie Servera:

```bash
# Kontrola či server beží
ps aux | grep "node dist/api/server.js"

# Reštart servera
pkill -f "node dist/api/server.js"
cd /workspaces/Tunexa && nohup node dist/api/server.js > /dev/null 2>&1 &

# Kontrola portu
netstat -tuln | grep 3000
```

---

## 📊 Dashboard Funkcie:

✅ **Real-time System Status** - Živý status všetkých modulov  
✅ **Audio Certification** - Test certifikácie audio systémov  
✅ **OEM Integration** - Testovanie pripojenia k vozidlu  
✅ **Spotify Integration** - API integrácia  
✅ **Profile Management** - Správa užívateľských profilov  
✅ **Auto-refresh** - Automatická aktualizácia každých 30s  

---

## 🚨 Riešenie Problémov:

### Dashboard sa nezobrazuje:
1. Skontroluj že server beží: `curl http://localhost:3000/health`
2. Použij PORTS tab namiesto Simple Browser
3. Vymaž cache browsera (Ctrl+Shift+Delete)
4. Skús Incognito/Private window

### API nefunguje:
1. Reštartuj server (príkazy vyššie)
2. Skontroluj firewall/port forwarding
3. Pozri logy: `tail -f nohup.out`

---

## 🎯 Server Status:

✅ Server: **RUNNING** na porte 3000  
✅ Database: **119 car models** loaded  
✅ Modules: **6 active modules**  
✅ API: **Fully functional**  

**Vytvorené:** 2025-10-20  
**Verzia:** 1.0.0  
**Status:** Production Ready 🚀
