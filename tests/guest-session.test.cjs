const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function createDatabase() {
  return {
    contacts: {
      c1: { name: "Shared Contact", email: "shared@join.com", phone: "+49 5151 1234", initials: "SC", color: "orange", isRegistered: false, userId: null },
    },
    tasks: {
      t1: { id: "t1", title: "Shared Task", status: "todo", assignedTo: ["c1"], subtasks: [] },
    },
    users: {},
  };
}

function getPath(url) {
  const parsed = new URL(url);
  return parsed.pathname.replace(/^\//, "").replace(/\.json$/, "");
}

function readValue(database, pathValue) {
  const parts = pathValue.split("/").filter(Boolean);
  let current = database;
  for (const part of parts) current = current?.[part];
  return clone(current ?? null);
}

function writeValue(database, pathValue, value) {
  const parts = pathValue.split("/").filter(Boolean);
  let current = database;
  for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]] ||= {};
  current[parts.at(-1)] = clone(value);
}

function deleteValue(database, pathValue) {
  const parts = pathValue.split("/").filter(Boolean);
  let current = database;
  for (let i = 0; i < parts.length - 1; i++) current = current?.[parts[i]];
  if (current) delete current[parts.at(-1)];
}

function createFetch(database, requests) {
  let postId = 0;
  return async (url, options = {}) => {
    const method = options.method || "GET";
    const target = getPath(url);
    requests.push({ method, target });
    if (method === "GET") return response(readValue(database, target));
    if (method === "DELETE") { deleteValue(database, target); return response(null); }
    const data = JSON.parse(options.body || "null");
    if (method === "POST") {
      const id = "new" + ++postId;
      writeValue(database, target + "/" + id, data);
      return response({ name: id });
    }
    if (method === "PATCH") {
      const current = readValue(database, target) || {};
      writeValue(database, target, Object.assign(current, data));
      return response(null);
    }
    writeValue(database, target, data);
    return response(data);
  };
}

function response(data) {
  return { ok: true, json: async () => clone(data) };
}

function createApp({ protectedPage = false, database = createDatabase() } = {}) {
  const sessionStorage = createStorage();
  const localStorage = createStorage();
  const requests = [];
  const redirects = [];
  const events = {};
  const context = vm.createContext({
    URL,
    sessionStorage,
    localStorage,
    FIREBASE_BASE_URL: "https://example.invalid",
    fetch: createFetch(database, requests),
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
      body: {
        classList: { add() {}, remove() {}, toggle() {} },
        getAttribute: key => key === "data-protected-page" && protectedPage ? "true" : null,
      },
    },
    window: {
      location: { href: "", replace: url => redirects.push(url) },
      addEventListener: (name, fn) => { events[name] = fn; },
    },
  });
  for (const file of ["scripts/common.js", "scripts/dataService.js", "scripts/dataServiceRelations.js", "scripts/taskUtils.js", "script.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  return { context, database, requests, redirects, sessionStorage };
}

test("guest login keeps the guest session but creates no private guest data", () => {
  const app = createApp();
  app.context.openGuestSummary();
  assert.equal(app.context.getUserMode(), "guest");
  assert.equal(app.sessionStorage.getItem("joinGuestContacts"), null);
  assert.equal(app.sessionStorage.getItem("joinGuestTasks"), null);
});

test("guest and registered users read and change the same shared tasks", async () => {
  const database = createDatabase();
  const guest = createApp({ database });
  guest.context.openGuestSummary();
  assert.equal((await guest.context.getTasks())[0].title, "Shared Task");
  await guest.context.saveTasks([{ id: "t2", title: "Changed by guest", status: "done", assignedTo: [], subtasks: [] }]);
  const user = createApp({ database });
  user.sessionStorage.setItem("joinUserMode", "user");
  user.sessionStorage.setItem("joinCurrentUser", JSON.stringify({ userId: "u1", name: "User" }));
  assert.equal((await user.context.getTasks())[0].title, "Changed by guest");
});

test("guest can create, update and delete contacts in the shared database", async () => {
  const app = createApp();
  app.context.openGuestSummary();
  const contact = await app.context.createContact({ name: "Guest Change", email: "guest@join.com", initials: "GC", color: "teal" });
  contact.name = "Edited by Guest";
  await app.context.updateContact(contact.id, contact);
  assert.equal((await app.context.getContacts()).find(item => item.id === contact.id).name, "Edited by Guest");
  await app.context.deleteContact(contact.id);
  assert.equal((await app.context.getContacts()).some(item => item.id === contact.id), false);
});

test("signed-out visitors still cannot open protected pages", async () => {
  const app = createApp({ protectedPage: true });
  assert.equal(app.context.getUserMode(), null);
  assert.deepEqual(app.redirects, ["./index.html"]);
  await assert.rejects(() => app.context.getFirebaseData("tasks"), /active session/);
});

test("guest access uses Firebase instead of guest-only browser storage", () => {
  const files = ["script.js", "scripts/common.js", "scripts/dataServiceRelations.js", "scripts/contacts.js", "scripts/contactsForm.js", "scripts/contactsActions.js"];
  const content = files.map(file => fs.readFileSync(path.join(__dirname, "..", file), "utf8")).join("\n");
  assert.doesNotMatch(content, /joinGuestContacts|joinGuestTasks|saveGuestContact|deleteGuestContact/);
});
