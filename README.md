# Join

Join is a Kanban board for team task management, built as a capstone project at the Developer Akademie. Users create tasks, assign them to contacts, drag them across the board columns, and keep track of priorities and due dates.

## Features

- **Login & Sign up** – registration and login with email/password or as a guest (`index.html`, `signUp.html`)
- **Summary** – dashboard with key figures on open, overdue, and in-progress tasks (`summary.html`)
- **Board** – Kanban board with the columns To do, In Progress, Await Feedback, and Done, with touch-enabled drag & drop (`board.html`)
- **Add Task** – form for creating tasks with category, priority, contacts, due date, and subtasks (`addTask.html`)
- **Contacts** – contact management including initials-based, color-coded avatars (`contacts.html`)
- **Help & legal pages** – help page, legal notice, and privacy policy (`help.html`, `legalNotice.html`, `privacyPolicy.html`)

All users – including the guest login – work on the same data (shared board, shared contacts).

## Tech stack

- Vanilla HTML, CSS, and JavaScript, no frameworks, no ES modules
- [Firebase Realtime Database](https://firebase.google.com/docs/database) as backend
- Multi-page application: each page is its own HTML file with no JS-based routing

## Project structure

```
join/
├── <page>.html            # one HTML file per page
├── style.css               # only imports files from css/
├── script.js                # script for the start page (login)
├── scripts/
│   ├── common.js               # cross-page UI and session logic
│   ├── dataService.js          # Firebase base and user access
│   ├── dataServiceRelations.js # tasks, contacts, and relations
│   ├── templates/              # functions returning HTML strings
│   └── <page>.js                # one file per page
├── css/
│   ├── base/              # reset.css, tokens.css, fonts.css
│   ├── layout/             # pageFrame.css, appShell.css
│   ├── components/         # one file per component
│   └── pages/               # page-specific styles
└── assets/
    ├── img/
    ├── icons/
    └── fonts/
```

See [CONVENTIONS.md](./CONVENTIONS.md) for coding, CSS, and UI conventions.

## Setup

1. Clone the repository.
2. Create `scripts/firebaseConfig.js` (this file is excluded via `.gitignore` and must be added locally):

   ```js
   const FIREBASE_BASE_URL = "https://<your-project>-default-rtdb.<region>.firebasedatabase.app/";
   ```

3. Open the project via a local server, e.g. the VS Code extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (port 5501, see `.vscode/settings.json`) or any other static file server. Opening `index.html` directly via `file://` won't work reliably because of the fetch calls against Firebase.

There are no npm dependencies and no build step.

## Browser support

Tested in Chrome, Firefox, Safari, and Edge, both desktop and mobile down to 320px width.
