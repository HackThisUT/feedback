# Wochenreflexion Schulalltag – PWA für GitHub Pages

Eine lokale Wochenreflexion für den Schulalltag, verpackt als installierbare
**Progressive Web App** (PWA). Funktioniert komplett offline, speichert alle
Daten lokal im Browser (`localStorage`) und sendet nichts an einen Server.
Optimiert für **iPhone 17 / iOS Safari** und „Zum Home-Bildschirm".

## 📦 Inhalt

```
.
├── index.html               # App (mit PWA-Tags erweitert)
├── manifest.webmanifest     # PWA-Manifest (de, display=standalone)
├── sw.js                    # Service Worker (Cache-First App-Shell)
├── icons/
│   ├── icon-192.png              # PWA-Icon 192
│   ├── icon-512.png              # PWA-Icon 512
│   ├── icon-512-maskable.png     # Maskable Icon (innerhalb Safe-Zone)
│   ├── apple-touch-icon-152.png  # iPad
│   ├── apple-touch-icon-167.png  # iPad Pro
│   ├── apple-touch-icon-180.png  # iPhone (Standard)
│   └── splash-1206x2622.png      # iPhone-17-Splash (3x)
└── README.md
```

## 🚀 GitHub Pages hochladen

### Variante A – eigenes Repo (empfohlen)

1. Neues Repository auf GitHub anlegen, z. B. `wochenreflexion-pwa`.
2. Alle Dateien aus diesem Ordner **im Root** des Repos committen
   (also `index.html` direkt auf oberster Ebene, nicht in einem Unterordner).
3. **Settings → Pages** öffnen.
4. **Source**: „Deploy from a branch" → Branch `main` (oder `master`),
   Ordner `/ (root)`.
5. Speichern. Nach wenigen Sekunden ist die App unter
   `https://<dein-name>.github.io/wochenreflexion-pwa/` erreichbar.

### Variante B – bestehendes Repo / Unterordner

- Wenn die App unter `https://<dein-name>.github.io/<repo-name>/` laufen soll,
  muss `index.html` weiterhin im **Root** liegen (oder im gewählten Pages-Ordner).
- Alle Pfade in `manifest.webmanifest` und `sw.js` sind **relativ** (`./`),
  die App funktioniert daher unverändert auch unter `/repo-name/`.

### Variante C – lokaler Test

```bash
# im Projektordner ausführen
python3 -m http.server 8000
# dann im Browser: http://localhost:8000/
```

> ⚠️ Der Service Worker und `manifest.webmanifest` funktionieren **nicht**
> über `file://`. Für einen echten PWA-Test ist HTTPS oder `localhost` nötig.

## 📱 Auf dem iPhone installieren

1. App im **Safari** öffnen (Chrome/Firefox auf iOS zeigen das „Zum Home-Bildschirm"
   -Menü nicht so zuverlässig).
2. Unten mittig auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben) tippen.
3. **„Zum Home-Bildschirm"** auswählen.
4. Name bestätigen → **Hinzufügen**.
5. App vom Homescreen öffnen: sie startet **ohne URL-Leiste**, im Vollbild,
   mit dem gewählten Theme-Color-Hintergrund.

### iPhone-17-spezifisch

- Die App nutzt `viewport-fit=cover` und `apple-mobile-web-app-status-bar-style: black-translucent`,
  sodass der Inhalt unter der Notch / Dynamic Island und der Home-Indikator-
  Leiste sicher liegt (`env(safe-area-inset-*)` Padding).
- Beim Start wird das mitgelieferte **Splash-Bild (1206×2622)** angezeigt.
- Theme-Farbe in der Statusleiste: **Deep-Teal `#0d5c4a`**.

## 🔄 Cache-Version aktualisieren

Wenn sich `index.html`, das Manifest oder die Icons ändern:

1. In `sw.js` die Konstante `CACHE_VERSION` erhöhen, z. B.:

   ```js
   const CACHE_VERSION = 'wr-v2';   // vorher: 'wr-v1'
   ```

2. `sw.js` ins Repo pushen.
3. Beim nächsten App-Start registriert sich der neue Service Worker.
   Der alte Cache (`wr-shell-wr-v1` / `wr-runtime-wr-v1`) wird automatisch
   in `activate` gelöscht und durch `wr-shell-wr-v2` ersetzt.
4. Falls die Nutzer*innen die App bereits installiert haben: nach dem Update
   **einmal komplett schließen und neu öffnen**, damit `skipWaiting()` greift.

> 💡 Tipp: Auch nach kleinen Text-/CSS-Änderungen die Cache-Version
> hochzählen, sonst sehen Nutzer*innen unter Umständen die alte Version.

## 🛠 Wartung / Anpassung

| Was ändern?                        | Datei                              |
|------------------------------------|------------------------------------|
| App-Farben (Theme)                 | CSS-Variablen in `index.html`      |
| App-Name / Kurzname                | `manifest.webmanifest`             |
| Theme-Color (Statusleiste)         | `theme-color` Meta in `index.html` |
| App-Icons (Logo)                   | Dateien in `icons/` ersetzen       |
| Splash-Bild                        | `icons/splash-1206x2622.png`       |
| Offline-Verhalten / Cache-Strategie | `sw.js`                            |

## 🔒 Datenschutz

- Die gesamte App läuft **clientseitig**. Es gibt kein Backend.
- Einträge werden in `localStorage` unter dem Key
  `wochenreflexion-schulalltag-v1` gespeichert.
- Lediglich das **Cloudflare Web Analytics**-Beacon
  (`static.cloudflareinsights.com`) wird vom Original geladen – es wird
  **nicht** vom Service Worker gecacht, fällt also bei Offline weg.

## 🧪 Validierung

- Manifest: öffne DevTools → Application → Manifest. Es darf keine Warnung geben.
- Service Worker: DevTools → Application → Service Workers → Status
  „activated and is running".
- Lighthouse → PWA-Category sollte grün sein.

Viel Freude beim Reflektieren 🌿
