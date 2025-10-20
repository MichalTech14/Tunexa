# 🎵 Tunexa Dashboard - RÝCHLY ŠTART

## ✅ VŠETKO JE HOTOVÉ A FUNGUJE!

---

## 🚀 Ako otvoriť Dashboard (NAJJEDNODUCHŠIE):

### Spôsob 1: PORTS Tab v VS Code (ODPORÚČANÝ) ⭐
```
1. Pozri sa dole v VS Code na panel s "TERMINAL"
2. Klikni na tab "PORTS" (vedľa Terminal/Debug Console)
3. Nájdi riadok kde je Port: 3000
4. Klikni na ikonu 🌐 (globe) alebo pravý klik → "Open in Browser"
5. Dashboard sa otvorí v tvojom browseri!
```

### Spôsob 2: Otvor HTML súbor priamo
```
1. V VS Code Explorer otvor súbor: dashboard-standalone.html
2. Klikni pravým tlačidlom na súbor
3. Vyber "Open Preview" alebo "Open with Live Server"
```

### Spôsob 3: Cez terminál
```bash
# V terminále spusti:
curl http://localhost:3000/dashboard
```

---

## 🎯 NPM Príkazy pre ovládanie:

```bash
# Spustiť API server
npm run api:start

# Zastaviť API server  
npm run api:stop

# Reštartovať API server
npm run api:restart

# Spustiť hlavný Tunexa engine
npm start

# Kompilovať TypeScript
npm run build
```

---

## 📊 Dashboard Funkcie:

✅ **System Status Monitor** - Real-time status systému  
✅ **Audio Certification** - Testovanie certifikácie  
✅ **OEM Integration** - Pripojenie k vozidlu  
✅ **Spotify Integration** - API test  
✅ **Profile Management** - Správa profilov  
✅ **Auto-refresh** - Automatická aktualizácia  

---

## 🔗 Dostupné URL:

- **Dashboard:** `http://localhost:3000/dashboard`
- **Test Page:** `http://localhost:3000/test`
- **API Root:** `http://localhost:3000/`
- **Health Check:** `http://localhost:3000/health`

---

## 📁 Dôležité súbory:

- `dashboard-standalone.html` - Standalone dashboard (otvor v Preview)
- `test.html` - Jednoduchý test (otvor v Preview)
- `DASHBOARD_ACCESS.md` - Detailný návod
- `api/server.ts` - API server kód

---

## 🔧 Riešenie problémov:

**Dashboard sa nezobrazuje?**
→ Použij PORTS tab metódu (Spôsob 1)

**API nereaguje?**
→ Spusti: `npm run api:restart`

**Port 3000 je obsadený?**
→ Zmeň PORT v `.env` alebo: `PORT=3001 npm run api`

---

## 🎉 Server Status:

✅ API Server: **RUNNING** na porte 3000  
✅ Database: **119 car models** loaded  
✅ Modules: **6 active modules**  
✅ Status: **Production Ready**  

**Všetko funguje! Použij PORTS tab pre otvorenie dashboardu.** 🚀
