# 🎵 Ako otvoriť Tunexa Dashboard

## ✅ Server beží a je pripravený!

---

## 🚀 METÓDA 1: PORTS Tab (NAJJEDNODUCHŠIE) ⭐⭐⭐

### Krok za krokom:

1. **Otvor Command Palette**
   - Stlač: `Ctrl+Shift+P` (Windows/Linux) alebo `Cmd+Shift+P` (Mac)

2. **Vyhľadaj PORTS**
   - Napíš: `Ports: Focus on Ports View`
   - Stlač Enter

3. **Nájdi port 3000**
   - Uvidíš zoznam portov
   - Nájdi riadok s číslom **3000**

4. **Otvor v browseri**
   - Klikni **pravým tlačidlom** na port 3000
   - Vyber: **"Open in Browser"**
   - ALEBO klikni na ikonu 🌐 (Globe)

5. **Pridaj /dashboard**
   - Do URL pridaj na koniec: `/dashboard`
   - Príklad: `https://fuzzy-rotary-phone-...-3000.app.github.dev/dashboard`

---

## 🌐 METÓDA 2: Priama URL (RÝCHLE)

Tvoja Codespace URL:
```
https://fuzzy-rotary-phone-r4vqrgj9x5p5cx7g9-3000.app.github.dev/dashboard
```

**Skopíruj túto URL a otvor ju v browseri!**

---

## 📄 METÓDA 3: Otvor HTML súbor

1. V VS Code Explorer otvor súbor: **`dashboard-codespace.html`**
2. Klikni pravým tlačidlom na súbor
3. Vyber: **"Open Preview"**

---

## 🧪 Test či to funguje:

V terminále spusti:
```bash
curl http://localhost:3000/health
```

Ak vidíš: `{"status":"healthy",...}` - server funguje! ✅

---

## 📊 Čo dashboard obsahuje:

✅ Real-time system status monitoring  
✅ Audio Certification test  
✅ OEM Integration test  
✅ Spotify Integration  
✅ Auto-refresh každých 30 sekúnd  

---

## 🔧 Riešenie problémov:

**Dashboard sa nezobrazuje?**
→ Skontroluj či používaš správnu URL z PORTS tabu

**API nereaguje?**
→ Reštartuj server: `npm run api:restart`

**Port tab nevidím?**
→ Stlač `Ctrl+Shift+P` a napíš "Ports: Focus"

---

✅ **Všetko je nastavené a funkčné!**

Server beží na: http://localhost:3000  
Dashboard: http://localhost:3000/dashboard  
API Health: http://localhost:3000/health
