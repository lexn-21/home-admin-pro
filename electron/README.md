# ImmoNIQ Desktop App (Electron)

Native Desktop-App für **Windows, macOS und Linux**. Wird **lokal auf deinem Rechner** gebaut (nicht in Lovable).

## Voraussetzungen

- Node.js 18+ installiert
- Projekt aus Lovable via **„Export to GitHub"** rausgezogen und lokal geclont

## Setup (einmalig)

```bash
# 1. Dependencies installieren
npm install

# 2. Electron + Packager hinzufügen (separat, weil ~150 MB)
npm install --save-dev electron @electron/packager
```

Dann in **`vite.config.ts`** für Electron-Builds `base: "./"` setzen
(absolute Pfade brechen unter `file://`):

```ts
export default defineConfig(({ mode }) => ({
  base: mode === "electron" ? "./" : "/",
  // ... Rest
}));
```

In **`package.json`** ergänzen:

```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "electron:dev": "ELECTRON_DEV_URL=http://localhost:8080 electron .",
    "electron:build": "vite build --mode electron",
    "electron:pack:mac":   "npm run electron:build && npx @electron/packager . ImmoNIQ --platform=darwin  --arch=universal --out=desktop-release --overwrite --icon=public/icon-512.png",
    "electron:pack:win":   "npm run electron:build && npx @electron/packager . ImmoNIQ --platform=win32   --arch=x64       --out=desktop-release --overwrite --icon=public/icon-512.png",
    "electron:pack:linux": "npm run electron:build && npx @electron/packager . ImmoNIQ --platform=linux   --arch=x64       --out=desktop-release --overwrite --icon=public/icon-512.png"
  }
}
```

## Entwickeln

```bash
# Terminal 1 — Vite-Dev-Server
npm run dev

# Terminal 2 — Electron mit Hot-Reload
npm run electron:dev
```

## Bauen (Distributable erstellen)

```bash
npm run electron:pack:mac     # → desktop-release/ImmoNIQ-darwin-universal/
npm run electron:pack:win     # → desktop-release/ImmoNIQ-win32-x64/
npm run electron:pack:linux   # → desktop-release/ImmoNIQ-linux-x64/
```

Den fertigen Ordner zippen und an User verteilen — `ImmoNIQ.exe` / `ImmoNIQ.app` startet die App.

## Code-Signing & Stores (optional, für Produktion)

- **macOS App Store / Notarisierung:** Apple Developer Account (99 €/Jahr) + `electron-osx-sign`
- **Microsoft Store:** Code-Signing-Zertifikat + MSIX-Verpackung
- Andernfalls zeigen Win/Mac eine Sicherheitswarnung beim ersten Start (App startet trotzdem nach Bestätigung)

## Was funktioniert in der Desktop-App

- ✅ Komplette ImmoNIQ-Web-App in Vollbild ohne Browser-Leiste
- ✅ Native Menüleiste, Tastenkürzel, Window-Verwaltung
- ✅ Externe Links öffnen im Standard-Browser
- ✅ Auto-Login bleibt erhalten (eigener Profilstore)
- ✅ Offline-Cache durch den Service Worker
