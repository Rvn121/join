# Conventions – Join

Grundlage ist die Checkliste "Projektabgabe Join" der Developer Akademie. Hier steht, wie wir sie in diesem Projekt konkret umsetzen.

## 1. Technische Umsetzung

- Join ist eine Multi-Page Application. Jede Seite ist eine eigene HTML-Datei, es gibt kein Routing per JavaScript.
- `index.html`, `style.css`, `script.js` und `robots.txt` liegen im Root. Bei der Abgabe kommen die Dateien direkt ins Server-Root, nicht in einen Unterordner.
- Scripts werden über normale `<script>`-Tags eingebunden, keine ES-Module. Alle Dateien teilen sich also den globalen Namensraum.
- Fonts und Icons liegen lokal unter `assets/`, wir laden nichts von CDNs.
- Alle User arbeiten auf denselben Daten – auch der Gast-Login sieht dasselbe Board, dieselben Tasks und Kontakte.
- Im gemergten Code gibt es kein `console.log` und keine Konsolenfehler.
- Code, Kommentare und Commit-Messages sind auf Englisch.

## 2. Projektstruktur

```
join/
├── <seite>.html          # eine HTML-Datei pro Seite
├── style.css             # importiert nur Dateien aus css/
├── script.js             # Script der Startseite (Login)
├── scripts/
│   ├── common.js         # seitenübergreifende UI- und Session-Logik
│   ├── dataService.js    # gesamter Datenzugriff (Firebase)
│   ├── templates/        # Funktionen, die HTML-Strings zurückgeben
│   └── <seite>.js        # eine Datei pro Seite
├── css/
│   ├── base/             # reset.css, tokens.css, fonts.css
│   ├── layout/           # pageFrame.css, appShell.css
│   ├── components/       # eine Datei pro Komponente (buttons.css, inputs.css, …)
│   └── pages/            # nur seitenspezifische Styles
└── assets/
    ├── img/
    ├── icons/
    └── fonts/
```

### JavaScript

- Jede Seite bekommt eine eigene JS-Datei, benannt wie die HTML-Datei (`board.html` → `board.js`).
- Was mehrere Seiten brauchen, kommt in `common.js` (UI, Session) oder `dataService.js` (Daten). Seiten-Scripts machen kein eigenes `fetch`.

### CSS

- Nur `style.css` importiert andere Dateien, und zwar in der Reihenfolge base → layout → components → pages. Die übrigen CSS-Dateien enthalten keine `@import`-Anweisungen.
- Jede Datei hat genau eine Zuständigkeit. Seiten-Layout gehört nicht in `pages/`, und es gibt nicht zwei Systeme für dieselbe Komponente.
- Media Queries stehen direkt bei der Komponente oder Seite, die sie betreffen – nicht in einer gesammelten Responsive-Datei.
- Alle `:root`-Variablen liegen in `base/tokens.css`. Im restlichen CSS nutzen wir die Tokens statt fester Werte. Feste Tokens: `--click-transition: 100ms ease`, `--content-width: 1440px`, `--page-width: 1920px`.

## 3. UI, Formulare, Responsiveness

- Klickbare Elemente haben `cursor: pointer` und nutzen `--click-transition`. Inputs und Buttons bekommen `border: unset`.
- Jede Interaktion gibt sichtbares Feedback (Hover, Toast). Hover verschiebt nichts im Layout. Neu angelegter Content ist sofort zu sehen.
- Formulare validieren wir selbst, keine HTML5-Standardvalidation.
- Der Submit-Button ist während des Speicherns deaktiviert. Dropdowns schließen sich bei Klick daneben. Enter im Subtask-Feld schickt nicht das ganze Formular ab.
- Jede Seite funktioniert bis 320 px runter und auf Desktop. Keine horizontalen Scrollbalken, kein Content, der aus seinem Container läuft.
- Die Kanban-Spalten stehen auf Mobile untereinander. Landscape auf Mobile ist deaktiviert, es sei denn, wir haben es bewusst optimiert.

## 4. Coding-Konventionen

- Eine Funktion macht eine Sache und ist maximal 14 Zeilen lang. Template-Funktionen, die HTML zurückgeben, sind davon ausgenommen.
- Funktionsnamen sind Verb + Objekt, z. B. `renderTaskCard` oder `validateLoginForm`.
- Dateinamen, Variablen und Funktionen in camelCase, erster Buchstabe klein. Richtig: `shoppingCart`, falsch: `Shopping_Cart`.
- CSS-Klassen in kebab-case, Modifier mit `--` (`btn--primary`).
- HTML, JS und CSS einer Seite heißen gleich: `signUp.html`, `signUp.js`, `signUp.css`.
- Einrückung mit 2 Leerzeichen, doppelte Anführungszeichen, Semikolons.
- Zwischen Funktionen stehen 2 Leerzeilen.
- Maximal 400 Zeilen pro Datei, das gilt für JS und CSS.
- Jede Funktion ist nach JSDoc dokumentiert: https://jsdoc.app/about-getting-started.html

## 5. Neue Seite anlegen

1. `<seite>.html` im Root anlegen, `style.css` einbinden, danach `common.js`, `dataService.js` und `<seite>.js`.
2. `scripts/<seite>.js` anlegen.
3. `css/pages/<seite>.css` anlegen und in `style.css` importieren.
4. Neue Komponenten kommen nach `css/components/`, nicht in die Seiten-Datei.
5. Bei 320 px und auf Desktop testen.

## 6. Definition of Done

- In Chrome, Firefox, Safari und Edge getestet, jeweils Desktop und Mobile.
- Mindestens 5 realistische Tasks und 10 Kontakte sind angelegt.
- Keine Konsolenfehler, kein `console.log`.
