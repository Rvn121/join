# Join

Join ist ein Kanban-Board zur Aufgabenverwaltung im Team, entstanden als Abschlussprojekt der Developer Akademie. Nutzer:innen legen Tasks an, weisen sie Kontakten zu, sortieren sie per Drag & Drop durch die Board-Spalten und behalten den Überblick über Prioritäten und Deadlines.

## Features

- **Login & Sign up** – Registrierung sowie Login mit E-Mail/Passwort oder als Gast (`index.html`, `signUp.html`)
- **Summary** – Dashboard mit Kennzahlen zu offenen, überfälligen und laufenden Tasks (`summary.html`)
- **Board** – Kanban-Board mit den Spalten To do, In Progress, Await Feedback und Done, Drag & Drop auch touch-fähig (`board.html`)
- **Add Task** – Formular zum Anlegen von Tasks mit Kategorie, Priorität, Kontakten, Fälligkeitsdatum und Subtasks (`addTask.html`)
- **Contacts** – Kontaktverwaltung inkl. Avatare mit Initialen und Farbcodierung (`contacts.html`)
- **Help & rechtliche Seiten** – Hilfeseite, Impressum und Datenschutzerklärung (`help.html`, `legalNotice.html`, `privacyPolicy.html`)

Alle Nutzer:innen – auch im Gast-Login – arbeiten auf denselben Daten (gemeinsames Board, gemeinsame Kontakte).

## Tech-Stack

- Vanilla HTML, CSS und JavaScript, keine Frameworks, keine ES-Module
- [Firebase Realtime Database](https://firebase.google.com/docs/database) als Backend
- Multi-Page Application: jede Seite ist eine eigene HTML-Datei ohne JS-Routing

## Projektstruktur

```
join/
├── <seite>.html          # eine HTML-Datei pro Seite
├── style.css              # importiert nur Dateien aus css/
├── script.js               # Script der Startseite (Login)
├── scripts/
│   ├── common.js               # seitenübergreifende UI- und Session-Logik
│   ├── dataService.js          # Firebase-Basis und Benutzerzugriff
│   ├── dataServiceRelations.js # Tasks, Kontakte und Relationen
│   ├── templates/              # Funktionen, die HTML-Strings zurückgeben
│   └── <seite>.js              # eine Datei pro Seite
├── css/
│   ├── base/              # reset.css, tokens.css, fonts.css
│   ├── layout/             # pageFrame.css, appShell.css
│   ├── components/         # eine Datei pro Komponente
│   └── pages/               # seitenspezifische Styles
└── assets/
    ├── img/
    ├── icons/
    └── fonts/
```

Details zu Coding-, CSS- und UI-Konventionen stehen in [CONVENTIONS.md](./CONVENTIONS.md).

## Setup

1. Repository klonen.
2. `scripts/firebaseConfig.js` anlegen (die Datei ist über `.gitignore` ausgeschlossen und muss lokal ergänzt werden):

   ```js
   const FIREBASE_BASE_URL = "https://<dein-projekt>-default-rtdb.<region>.firebasedatabase.app/";
   ```

3. Projekt über einen lokalen Server öffnen, z. B. mit der VS-Code-Erweiterung [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (Port 5501, siehe `.vscode/settings.json`) oder einem beliebigen anderen Static-File-Server. Ein direktes Öffnen der `index.html` per `file://` funktioniert wegen der Fetch-Aufrufe gegen Firebase nicht zuverlässig.

Es gibt keine npm-Dependencies und keinen Build-Schritt.

## Browser-Support

Getestet in Chrome, Firefox, Safari und Edge, jeweils Desktop und Mobile ab 320 px Breite.
