# Conventions – Join

Grundlage ist die Checkliste "Projektabgabe Join" der Developer Akademie. Hier steht, wie wir sie in diesem Projekt konkret umsetzen.

## 1. Technische Umsetzung

- Join ist eine Multi-Page Application. Jede Seite ist eine eigene HTML-Datei, es gibt kein Routing per JavaScript.
- `index.html`, `style.css`, `script.js` und `robots.txt` liegen im Root. Bei der Abgabe kommen die Dateien direkt ins Server-Root, nicht in einen Unterordner.
- Scripts werden über normale `<script>`-Tags eingebunden, keine ES-Module. Alle Dateien teilen sich also den globalen Namensraum.
- Fonts und Icons liegen lokal unter `assets/`, wir laden nichts von CDNs.
- Alle User arbeiten auf denselben Daten – auch der Gast-Login sieht dasselbe Board, dieselben Tasks und Kontakte.
- Im gemergten Code gibt es kein `console.log` und keine Konsolenfehler.
- Code und Commit-Messages sind auf Englisch. Funktionsdokumentationen werden im JSDoc-Format zweisprachig auf Deutsch und Englisch geschrieben.

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

### Typografie

Die Schrift-Hierarchie liegt in `base/typography.css` und ist aus dem Figma-Design abgeleitet. Sie wird über HTML-Elemente gesetzt, nicht über Klassen – ein `<h2>` sieht auf jeder Seite gleich aus. Einzige Schrift ist Inter, Zeilenhöhe ist überall 1.2. Mobile-Werte gelten ab 620px abwärts.

| Element     | Desktop    | Mobile     | Verwendung                                   |
|-------------|------------|------------|----------------------------------------------|
| `h1`        | 61px / 700 | 47px / 700 | Seitentitel (Board, Contacts, Summary, …)    |
| `h2`        | 27px / 700 | 20px / 700 | Abschnitte, Kanban-Spalten, Dialog-Titel     |
| `h3`        | 16px / 700 | 16px / 700 | Card-Titel                                   |
| `p`, `body` | 16px / 400 | 16px / 400 | Fließtext                                    |
| `small`     | 14px / 400 | 14px / 400 | Hinweise, Meta-Angaben                       |
| `label`     | 13px / 400 | 13px / 400 | Formular-Labels                              |

Dazu kommen Größen, die keinem Element zugeordnet sind und nur als Token in `tokens.css` liegen:

| Token            | Wert       | Verwendung                                                  |
|------------------|------------|-------------------------------------------------------------|
| `--fs-lead`      | 27px / 400 | Sublines wie "Better with a team"                           |
| `--fs-lg`        | 20px / 400 | Inputs, Dropdown-Einträge, Formular-Labels, Zwischentitel   |
| `--fs-button`    | 21px / 700 | Button-Beschriftungen                                       |
| `--fs-display`   | 64px / 600 | Summary-Zahlen (Desktop), Name in der Begrüßung (700)       |
| `--fs-h1-mobile` | 47px       | `h1` ab 620px, Begrüßungszeile (500), Summary-Zahlen Mobile |
| `--fs-badge-lg`  | 23px / 400 | Kategorie-Badge im Task-Detail-Overlay                      |
| `--fs-error`     | 12px / 400 | Fehlertext unter Formularfeldern                            |

Schriftgewichte liegen ebenfalls als Token vor: `--fw-medium` (500), `--fw-semibold` (600), `--fw-bold` (700).

- Überschriften werden semantisch gesetzt (`h1` für den Seitentitel, `h2` für Abschnitte, `h3` für Cards) und nicht pro Seite oder Komponente neu gestylt. Kontext-Selektoren wie `.legal-content h2 { font-size: … }` gibt es nicht mehr.
- Braucht eine Komponente eine der drei Zusatzgrößen, nutzt sie den Token. Feste `font-size`-Werte im Komponenten-CSS nur, wenn es keinen passenden Token gibt – das sollte die Ausnahme sein.
- Die Mobile-Varianten von `h1` und `h2` stehen als Media Query direkt in `typography.css`.
- `button`, `input`, `textarea` und `select` erben die Schrift über `font: inherit` und setzen nur ab, was abweicht.

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
- Jede Funktion ist im JSDoc-Format dokumentiert. Die Beschreibung steht immer auf Deutsch (DE) und Englisch (EN): https://jsdoc.app/about-getting-started.html

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
