# Join

Join ist ein Kanban-Board zur Aufgabenverwaltung im Team: Tasks werden angelegt, Kontakten zugewiesen, priorisiert und per Drag & Drop durch die Spalten „To do“, „In progress“, „Await feedback“ und „Done“ bewegt.

## Funktionen

- **Login & Sign up** – Registrierung, Login sowie ein Gast-Login ohne eigenen Account
- **Summary** – Dashboard mit Kennzahlen zu offenen, überfälligen und dringenden Tasks
- **Board** – Kanban-Board mit Drag & Drop, Suche und Detailansicht pro Task
- **Add Task** – Formular zum Anlegen von Tasks mit Titel, Beschreibung, Fälligkeitsdatum, Priorität, zugewiesenen Kontakten, Kategorie und Subtasks
- **Contacts** – Kontaktverwaltung (Anlegen, Bearbeiten, Löschen)
- **Help, Legal Notice, Privacy Policy** – ergänzende Informationsseiten

Alle Nutzer:innen arbeiten auf denselben Daten – auch im Gast-Login sind Board, Tasks und Kontakte identisch.

Das Layout ist responsiv und für Desktop sowie Mobile (ab 320 px Breite) ausgelegt.

## Tech-Stack

- HTML, CSS und JavaScript ohne Frameworks oder Build-Tools
- Firebase Realtime Database als Backend
- [Inter](https://fonts.google.com/specimen/Inter) als Schriftart (Google Fonts)

Join ist eine Multi-Page Application: Jede Seite ist eine eigene HTML-Datei, es gibt kein clientseitiges Routing.

## Projektstruktur

```
join/
├── <seite>.html          # eine HTML-Datei pro Seite
├── style.css              # bindet die Dateien aus css/ ein
├── script.js               # Script der Startseite (Login)
├── scripts/
│   ├── common.js          # seitenübergreifende UI- und Session-Logik
│   ├── dataService.js     # gesamter Datenzugriff (Firebase)
│   ├── templates/         # Funktionen, die HTML-Strings zurückgeben
│   └── <seite>.js         # eine Datei pro Seite
├── css/
│   ├── base/               # Reset, Design-Tokens, Fonts, Typografie
│   ├── components/        # eine Datei pro Komponente
│   └── pages/               # seitenspezifische Styles
├── assets/
│   ├── img/, icons/, fonts/
└── tests/                  # automatisierte Tests
```

## Setup

1. Repository klonen.
2. `scripts/firebaseConfig.example.js` nach `scripts/firebaseConfig.js` kopieren und die eigene Firebase-Datenbank-URL eintragen. Diese Datei ist in `.gitignore` gelistet und wird nicht versioniert.
3. Projekt über einen lokalen statischen Server öffnen (z. B. die VS-Code-Erweiterung „Live Server“ oder `npx serve`), da einige Funktionen `fetch` verwenden und nicht zuverlässig über `file://` laufen.

Ein Build-Schritt ist nicht nötig, es gibt keine Abhängigkeiten, die installiert werden müssen.

## Tests

Die Tests liegen unter `tests/` und laufen mit dem in Node.js eingebauten Test-Runner:

```bash
node --test tests/
```

## Browser-Support

Geprüft in aktuellen Versionen von Chrome, Firefox, Safari und Edge – jeweils Desktop und Mobile.
