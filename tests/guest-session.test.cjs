const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}

function app({ protectedPage = false, session = storage(), local = storage() } = {}) {
  const redirects = [], requests = [], events = {};
  const context = vm.createContext({
    sessionStorage: session, localStorage: local,
    document: {
      getElementById: () => null, querySelectorAll: () => [], addEventListener() {},
      documentElement: { hidden: false },
      body: { getAttribute: key => key === 'data-protected-page' && protectedPage ? 'true' : null },
    },
    window: { location: { replace: url => redirects.push(url), reload: () => redirects.push('reload') }, addEventListener: (name, fn) => { events[name] = fn; } },
    fetch: async url => { requests.push(url); return { ok: true, json: async () => ({}) }; },
    FIREBASE_BASE_URL: 'https://example.invalid',
  });
  for (const file of ['scripts/common.js', 'scripts/dataService.js', 'scripts/taskUtils.js', 'scripts/contacts.js', 'scripts/contactsForm.js', 'scripts/contactsActions.js', 'scripts/taskFormContacts.js', 'script.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
  }
  return { context, session, local, redirects, requests, events };
}

test('guest starts with demo contacts and performs task/contact CRUD with zero network requests', async () => {
  const { context: c, requests } = app();
  c.openGuestSummary();
  assert.equal((await c.getTasks()).length, 0);
  assert.equal((await c.loadContacts()).length, 3);
  vm.runInContext('contactState.contacts = getStoredGuestContacts()', c);
  const contact = c.saveGuestContact({ name: 'Test Guest', email: 'test@example.com', isRegistered: false });
  assert.equal((await c.loadTaskFormContacts()).find(item => item.id === contact.id).name, 'Test Guest');
  vm.runInContext('contactState.dialogMode = "edit"', c);
  c.saveGuestContact({ ...contact, name: 'Changed' });
  assert.equal((await c.getContacts()).find(item => item.id === contact.id).name, 'Changed');
  await c.storeTask({ id: 'test', title: 'Task', status: 'todo', assignedTo: [contact.id] });
  await c.storeTask({ ...(await c.getTasks())[0], status: 'done' });
  assert.equal((await c.getTasks())[0].status, 'done');
  c.deleteGuestContact(contact);
  assert.equal((await c.getContacts()).length, 3);
  assert.equal((await c.getTasks())[0].assignedTo.length, 0);
  await c.removeTask('test');
  assert.equal((await c.getTasks()).length, 0);
  for (const operation of [() => c.getFirebaseData('users'), () => c.putFirebaseData('tasks', []), () => c.postFirebaseData('contacts', {}), () => c.patchFirebaseData('contacts/x', {}), () => c.deleteFirebaseData('tasks/x')]) {
    await assert.rejects(operation, /registered user session/);
  }
  assert.equal(requests.length, 0);
});

test('guest data survives navigation but not logout, a fresh login or a new session', async () => {
  const first = app();
  first.context.openGuestSummary();
  await first.context.storeTask({ id: 'local', title: 'Local' });
  const next = app({ protectedPage: true, session: first.session, local: first.local });
  assert.equal((await next.context.getTasks()).length, 1);
  assert.equal(next.redirects.length, 0);
  const fresh = app({ protectedPage: true, local: first.local });
  assert.equal(fresh.context.getUserMode(), null);
  assert.deepEqual(fresh.redirects, ['./index.html']);
  next.context.logoutUser();
  next.events.pageshow();
  assert.equal(next.session.getItem('joinGuestTasks'), null);
  assert.equal(next.context.getUserMode(), null);
  assert.deepEqual(next.redirects, ['./index.html']);
  next.context.openGuestSummary();
  assert.equal((await next.context.getTasks()).length, 0);
  await next.context.storeTask({ id: 'new', title: 'New' });
  next.context.openGuestSummary();
  assert.equal((await next.context.getTasks()).length, 0);
});

test('demo contacts have the requested data, reset on guest login and are absent for registered users', async () => {
  const { context: c, session } = app();
  c.openGuestSummary();
  const contacts = await c.getContacts();
  assert.deepEqual(Array.from(contacts, item => item.name), ['Tante Emma', 'Jacke wie Hose', 'Probier Mal']);
  assert.deepEqual(Array.from(contacts, item => item.email), ['Email1@join.com', 'Email2@join.com', 'Email3@join.com']);
  assert.ok(contacts.every(item => item.phone === '+4908154711' && item.isRegistered === false));
  vm.runInContext('contactState.contacts = getStoredGuestContacts()', c);
  c.deleteGuestContact(contacts[0]);
  assert.equal((await c.getContacts()).length, 2);
  c.openGuestSummary();
  assert.equal((await c.getContacts()).length, 3);
  c.saveUserSession({ userId: 'registered' });
  assert.equal(session.getItem('joinGuestContacts'), null);
  assert.equal((await c.getContacts()).length, 0);
});

test('signed-out direct visits and stale persistent logins cannot load protected data', async () => {
  const local = storage();
  local.setItem('joinUserMode', 'guest');
  local.setItem('joinGuestTasks', '[{"title":"Old database copy"}]');
  const { context: c, requests, redirects } = app({ protectedPage: true, local });
  assert.equal(c.getUserMode(), null);
  assert.equal(local.getItem('joinGuestTasks'), null);
  assert.deepEqual(redirects, ['./index.html']);
  assert.equal((await c.getTasks()).length, 0);
  assert.equal((await c.getContacts()).length, 0);
  await assert.rejects(() => c.getFirebaseData('users'));
  assert.equal(requests.length, 0);
});

test('registered sessions retain database access; login/registration remain public', async () => {
  const { context: c, requests } = app();
  await c.getUserByEmail('test@example.com');
  assert.equal(requests.length, 1);
  c.saveUserSession({ userId: 'user-1', name: 'Test' });
  assert.equal(c.getUserMode(), 'user');
  await c.getContacts();
  assert.equal(requests.length, 2);
});

test('all internal pages declare route protection', () => {
  for (const file of ['summary.html', 'addTask.html', 'board.html', 'contacts.html', 'help.html']) {
    assert.match(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), /data-protected-page="true"/);
  }
});

test('restoring a protected page from browser cache reloads session-specific content', () => {
  const session = storage();
  session.setItem('joinUserMode', 'guest');
  const { context, events, redirects } = app({ protectedPage: true, session });
  events.pageshow({ persisted: true });
  assert.equal(context.document.documentElement.hidden, true);
  assert.deepEqual(redirects, ['reload']);
});
