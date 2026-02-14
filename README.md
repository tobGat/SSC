# 🎵 SSC - School Song Contest

Eine interaktive Voting-App für Schulen, inspiriert vom Eurovision Song Contest. Schüler:innen können anonym Songs einreichen und bewerten, während die Lehrkraft die Präsentation am Beamer steuert.

## ✨ Features

- 🎤 **Anonyme Song-Einreichung** - Schüler:innen reichen Songs mit Titel, Interpret:in und optionalem Link ein
- 📝 **Song-Verwaltung** - Lehrkräfte können Songs bearbeiten und Schreibfehler korrigieren
- 🎬 **Live-Präsentation** - Eurovision-inspirierte Präsentation mit automatischer Zufallsreihenfolge
- 🗳️ **Interaktives Voting** - Echtzeit-Abstimmung mit 1-10 Punktesystem
- 📊 **Live-Statistiken** - Zeigt an, wie viele Schüler:innen bereits abgestimmt haben
- 🏆 **Endergebnis** - Ranking mit Durchschnittspunktzahlen und Konfetti-Effekt
- 📁 **Export** - Ergebnisse als CSV oder PDF exportieren
- 🔐 **Admin-Passwort** - Geschützte Lehrer-Ansicht
- 🎨 **Modernes Design** - Eurovision-inspirierte Farbpalette mit Animationen

## 🛠️ Technologie-Stack

**Backend:**
- Node.js + Express
- Socket.io (Echtzeit-Kommunikation)
- TypeScript
- In-Memory Datenspeicherung

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- Framer Motion (Animationen)
- React Router
- React Confetti

## 📋 Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn

## 🚀 Installation & Start

### 1. Repository klonen oder herunterladen

```bash
cd SSC
```

### 2. Backend installieren und starten

```bash
cd backend
npm install
npm run dev
```

Der Backend-Server läuft nun auf `http://localhost:3001`

### 3. Frontend installieren und starten

In einem neuen Terminal:

```bash
cd frontend
npm install
npm run dev
```

Das Frontend ist nun erreichbar unter `http://localhost:5173`

## 🎯 Nutzung

### Für Schüler:innen

1. Öffne `http://localhost:5173` im Browser
2. Wähle "Schüler:in"
3. **Phase 1 - Song einreichen:**
   - Gib Titel, Interpret:in und optional einen YouTube/Spotify Link ein
   - Klicke auf "Song einreichen"
4. **Phase 2 - Voting:**
   - Warte, bis die Lehrkraft die Präsentation startet
   - Bewerte jeden Song mit 1-10 Punkten
   - Sieh dir die Live-Statistiken an

### Für Lehrkräfte

1. Öffne `http://localhost:5173` im Browser
2. Wähle "Lehrer:in"
3. **Login:**
   - Standard-Passwort: `schule123` (kann in `.env` geändert werden)
4. **Phase 1 - Song-Verwaltung:**
   - Überprüfe eingereichte Songs
   - Bearbeite Titel/Interpret bei Schreibfehlern
   - Lösche ungeeignete Songs
   - Klicke "Präsentation starten" wenn alle Songs eingereicht sind
5. **Phase 2 - Präsentation:**
   - Songs werden in zufälliger Reihenfolge angezeigt
   - Warte auf die Votes der Schüler:innen
   - Durchschnittspunktzahl wird nach jedem Song angezeigt
   - Automatischer Übergang zum nächsten Song (oder manuell mit Button)
6. **Phase 3 - Ergebnisse:**
   - Endergebnis mit Ranking
   - Exportiere als CSV oder PDF
   - Starte neue Session für nächste Runde

## ⚙️ Konfiguration

### Backend (.env)

Erstelle eine `.env` Datei im `backend` Ordner:

```env
ADMIN_PASSWORD=schule123
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)

Erstelle eine `.env` Datei im `frontend` Ordner:

```env
VITE_BACKEND_URL=http://localhost:3001
```

## 🌐 Cloud Deployment

### Backend (Render/Railway)

1. Erstelle ein Konto bei [Render](https://render.com) oder [Railway](https://railway.app)
2. Verbinde dein Repository
3. Wähle den `backend` Ordner
4. Setze Environment Variables:
   - `ADMIN_PASSWORD`: Dein Admin-Passwort
   - `PORT`: 3001 (oder wie vom Hosting-Provider vorgegeben)
   - `FRONTEND_URL`: URL deiner Frontend-App
5. Deploy!

### Frontend (Vercel)

1. Erstelle ein Konto bei [Vercel](https://vercel.com)
2. Verbinde dein Repository
3. Wähle den `frontend` Ordner als Root Directory
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Setze Environment Variable:
   - `VITE_BACKEND_URL`: URL deiner Backend-App
7. Deploy!

## 📱 Verwendung im Klassenzimmer

### Empfohlenes Setup

1. **Lehrkraft:**
   - Laptop/PC mit Beamer verbunden
   - Öffne Lehrer-Ansicht im Vollbildmodus (F11)

2. **Schüler:innen:**
   - Eigene Laptops/Tablets im Schulnetzwerk
   - Alle verbinden sich mit derselben App-URL

### Ablauf einer Session

1. **Vorbereitung (5 Min):**
   - Lehrkraft startet Backend und Frontend
   - Schüler:innen öffnen die App

2. **Song-Einreichung (10-15 Min):**
   - Schüler:innen überlegen sich einen Song
   - Reichen Titel, Interpret:in und Link ein

3. **Review (5 Min):**
   - Lehrkraft überprüft Songs
   - Korrigiert Schreibfehler

4. **Voting (je nach Anzahl Songs):**
   - Pro Song ca. 1-2 Minuten
   - Automatischer Übergang nach vollständigem Voting

5. **Ergebnisse (5 Min):**
   - Endergebnis mit Konfetti
   - Diskussion über die Gewinner

## 🔧 Troubleshooting

### Backend startet nicht
- Prüfe, ob Port 3001 bereits belegt ist
- Überprüfe die `.env` Datei
- Stelle sicher, dass alle Dependencies installiert sind: `npm install`

### Frontend verbindet sich nicht mit Backend
- Überprüfe `VITE_BACKEND_URL` in der Frontend `.env`
- Stelle sicher, dass das Backend läuft
- Prüfe die Browser-Console auf Fehler

### Schüler können nicht voten
- Überprüfe, ob die Präsentation gestartet wurde
- Stelle sicher, dass alle im gleichen Netzwerk sind
- Prüfe die Firewall-Einstellungen

### Songs werden nicht angezeigt
- Refresh die Seite
- Überprüfe die Netzwerkverbindung
- Prüfe die Browser-Console auf Fehler

## 🎨 Anpassungen

### Farben ändern

Bearbeite `frontend/tailwind.config.js` für eigene Farbschemata:

```js
colors: {
  primary: {
    500: '#deine-farbe',
    // ...
  }
}
```

### Admin-Passwort ändern

Bearbeite `backend/.env`:

```env
ADMIN_PASSWORD=dein-neues-passwort
```

## 📊 Technische Details

### Socket Events

**Client → Server:**
- `submit-song`: Song einreichen
- `edit-song`: Song bearbeiten (Admin)
- `delete-song`: Song löschen (Admin)
- `start-presentation`: Präsentation starten (Admin)
- `next-song`: Nächster Song (Admin)
- `submit-vote`: Vote abgeben
- `admin-login`: Admin-Login
- `export-results`: Ergebnisse exportieren (Admin)
- `reset-session`: Session zurücksetzen (Admin)

**Server → Client:**
- `songs-updated`: Aktualisierte Song-Liste
- `current-song`: Aktueller Song in Präsentation
- `voting-complete`: Voting für Song abgeschlossen
- `final-results`: Endergebnis
- `vote-stats`: Live-Statistiken
- `auth-result`: Login-Ergebnis
- `phase-changed`: Phase-Wechsel
- `error`: Fehlermeldungen

### Datenmodell

```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  link?: string;
  averageScore?: number;
  votes: number[];
  totalVotes: number;
}
```

## 🤝 Beitragen

Verbesserungsvorschläge und Pull Requests sind willkommen!

## 📄 Lizenz

MIT License - Frei verwendbar für Schulen und Bildungseinrichtungen

## 🙏 Credits

Entwickelt mit ❤️ für interaktives Lernen im Klassenzimmer.
Inspiriert vom Eurovision Song Contest.

---

**Viel Spaß beim School Song Contest! 🎵✨**
