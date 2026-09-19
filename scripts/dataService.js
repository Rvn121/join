/** DE: Erstellt eine vollständige Firebase-URL. EN: Creates a complete Firebase URL. */
function getFirebaseUrl(path = "") {
  if (getUserMode() === "guest" || (isProtectedPage() && !getUserMode())) {
    throw new Error("Database access requires a registered user session.");
  }
  return FIREBASE_BASE_URL + "/" + path + ".json";
}


/** DE: Liest Daten aus Firebase. EN: Reads data from Firebase. */
async function getFirebaseData(path) {
  const response = await fetch(getFirebaseUrl(path));
  if (!response.ok) throw new Error("Firebase read failed.");
  return response.json();
}


/** DE: Schreibt Daten mit PUT nach Firebase. EN: Writes data to Firebase with PUT. */
async function putFirebaseData(path, data) {
  const response = await fetch(getFirebaseUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Firebase write failed.");
  return response.json();
}


/** DE: Erstellt Daten mit POST in Firebase. EN: Creates data in Firebase with POST. */
async function postFirebaseData(path, data) {
  const response = await fetch(getFirebaseUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Firebase create failed.");
  const result = await response.json();
  return result.name;
}


/** DE: Aktualisiert einzelne Eigenschaften mit PATCH. EN: Updates selected properties with PATCH. */
async function patchFirebaseData(path, data) {
  const response = await fetch(getFirebaseUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Firebase update failed.");
}


/** DE: Löscht Daten aus Firebase. EN: Deletes data from Firebase. */
async function deleteFirebaseData(path) {
  const response = await fetch(getFirebaseUrl(path), { method: "DELETE" });
  if (!response.ok) throw new Error("Firebase delete failed.");
}


/** DE: Vereinheitlicht eine E-Mail-Adresse. EN: Normalizes an email address. */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}


/** DE: Kopiert ein Firebase-Objekt und ergänzt seine ID. EN: Copies a Firebase object and adds its id. */
function copyFirebaseItem(value, id, idKey) {
  const item = {};
  for (const key in value) item[key] = value[key];
  item[idKey] = String(id);
  return item;
}


/** DE: Wandelt eine Firebase-Sammlung in ein Array mit IDs um. EN: Converts a Firebase collection into an array with ids. */
function mapFirebaseCollection(data, idKey = "id") {
  const items = [];
  if (!data) return items;
  for (const id in data) {
    if (data[id]) items.push(copyFirebaseItem(data[id], id, idKey));
  }
  return items;
}


/** DE: Sucht einen Benutzer anhand seiner E-Mail-Adresse. EN: Finds a user by email address. */
function findUserInData(users, email) {
  const searchedEmail = normalizeEmail(email);
  for (const userId in users) {
    if (normalizeEmail(users[userId].email) !== searchedEmail) continue;
    return copyFirebaseItem(users[userId], userId, "userId");
  }
  return null;
}


/** DE: Liest einen Benutzer anhand seiner E-Mail-Adresse. EN: Reads a user by email address. */
async function getUserByEmail(email) {
  const users = await getFirebaseData("users");
  if (!users) return null;
  return findUserInData(users, email);
}


/** DE: Erstellt die zu speichernden Benutzerdaten. EN: Creates the user data to be stored. */
function createStoredUser(user, password) {
  return {
    name: user.name,
    email: normalizeEmail(user.email),
    password: password,
    initials: user.initials,
    color: user.color,
  };
}


/** DE: Erstellt einen Benutzer und gibt seine Firebase-ID zurück. EN: Creates a user and returns its Firebase id. */
async function createUser(user, password) {
  const storedUser = createStoredUser(user, password);
  return postFirebaseData("users", storedUser);
}


/** DE: Erstellt öffentliche Sitzungsdaten eines Benutzers. EN: Creates public session data of a user. */
function createPublicUser(user) {
  return {
    name: user.name,
    email: user.email,
    initials: user.initials,
    color: user.color,
    userId: user.userId,
    contactId: user.contactId || null,
  };
}


/** DE: Prüft E-Mail und Passwort gegen Firebase. EN: Checks email and password against Firebase. */
async function verifyUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return createPublicUser(user);
}


/** DE: Erstellt die Profildaten aus einem registrierten Kontakt. EN: Creates profile data from a registered contact. */
function getUserProfileChanges(contact) {
  return {
    name: contact.name,
    email: normalizeEmail(contact.email),
    initials: contact.initials,
  };
}


/** DE: Aktualisiert das Profil eines registrierten Benutzers. EN: Updates the profile of a registered user. */
async function updateUserProfile(userId, contact) {
  const user = await getFirebaseData("users/" + userId);
  if (!user) throw new Error("User not found.");
  const changes = getUserProfileChanges(contact);
  await patchFirebaseData("users/" + userId, changes);
  user.name = changes.name;
  user.email = changes.email;
  user.initials = changes.initials;
  user.userId = userId;
  return createPublicUser(user);
}


/** DE: Löscht einen registrierten Benutzer. EN: Deletes a registered user. */
async function deleteUser(userId) {
  await deleteFirebaseData("users/" + userId);
}


/** DE: Liest Tasks aus Firebase oder aus der lokalen Gastsicht. EN: Reads tasks from Firebase or the local guest view. */
async function getTasks() {
  try {
    if (getUserMode() === "guest") return getGuestTaskData();
    if (getUserMode() !== "user") return [];
    const tasks = await getFirebaseData("tasks");
    const taskList = mapStoredTasks(tasks);
    return taskList;
  } catch {
    return [];
  }
}


/** DE: Speichert Tasks in Firebase oder nur lokal für den Gast. EN: Stores tasks in Firebase or only locally for the guest. */
async function saveTasks(tasks) {
  if (getUserMode() === "guest") return setGuestTaskData(tasks);
  await putFirebaseData("tasks", tasks);
}


/** DE: Liest alle Kontakte mit ihren Firebase-IDs. EN: Reads all contacts including their Firebase ids. */
async function getContacts() {
  if (getUserMode() === "guest") {
    return JSON.parse(sessionStorage.getItem("joinGuestContacts") || "[]");
  }
  try {
    return mapFirebaseCollection(await getFirebaseData("contacts"));
  } catch {
    return [];
  }
}


/** DE: Sucht einen Kontakt anhand seiner E-Mail-Adresse. EN: Finds a contact by email address. */
async function getContactByEmail(email) {
  const contacts = await getContacts();
  const searchedEmail = normalizeEmail(email);
  for (let i = 0; i < contacts.length; i++) {
    if (normalizeEmail(contacts[i].email) === searchedEmail) return contacts[i];
  }
  return null;
}


/** DE: Erstellt die speicherbaren Daten eines Kontakts ohne lokale ID. EN: Creates storable contact data without the local id. */
function getContactPayload(contact) {
  return {
    name: contact.name,
    email: contact.email,
    phone: contact.phone || "",
    initials: contact.initials,
    color: contact.color,
    isRegistered: Boolean(contact.isRegistered),
    userId: contact.userId || null,
  };
}


/** DE: Erstellt einen Kontakt in Firebase. EN: Creates a contact in Firebase. */
async function createContact(contact) {
  const storedContact = getContactPayload(contact);
  const contactId = await postFirebaseData("contacts", storedContact);
  storedContact.id = contactId;
  return storedContact;
}


/** DE: Aktualisiert einen Kontakt in Firebase. EN: Updates a contact in Firebase. */
async function updateContact(contactId, contact) {
  await putFirebaseData("contacts/" + contactId, getContactPayload(contact));
}


/** DE: Löscht einen Kontakt aus Firebase. EN: Deletes a contact from Firebase. */
async function deleteContact(contactId) {
  await deleteFirebaseData("contacts/" + contactId);
}


/** DE: Speichert alle Kontakte für ältere Aufrufer. EN: Stores all contacts for legacy callers. */
async function saveContacts(contacts) {
  await putFirebaseData("contacts", contacts);
}


/** DE: Erstellt einen registrierten Kontakt aus Benutzerdaten. EN: Creates a registered contact from user data. */
function buildRegisteredContact(user, userId) {
  return {
    name: user.name,
    email: normalizeEmail(user.email),
    phone: "",
    initials: user.initials,
    color: user.color,
    isRegistered: true,
    userId: String(userId),
  };
}


/** DE: Verknüpft einen Benutzer mit seinem Kontakt. EN: Links a user with its contact. */
async function linkUserToContact(userId, contactId) {
  await patchFirebaseData("users/" + userId, { contactId: contactId });
}


/** DE: Erstellt einen Benutzer zusammen mit seinem Kontakt. EN: Creates a user together with its contact. */
async function registerUserWithContact(user, password) {
  const userId = await createUser(user, password);
  try {
    let contact = await getContactByEmail(user.email);
    if (contact) contact = await promoteRegisteredContact(contact, user, userId);
    else contact = await createContact(buildRegisteredContact(user, userId));
    await linkUserToContact(userId, contact.id);
    return { userId: userId, contactId: contact.id };
  } catch (error) {
    await deleteUser(userId);
    throw error;
  }
}


/** DE: Sucht den registrierten Kontakt eines Benutzers. EN: Finds the registered contact of a user. */
function findRegisteredContact(contacts, user, userId) {
  let emailMatch = null;
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i].userId === String(userId)) return contacts[i];
    if (normalizeEmail(contacts[i].email) === normalizeEmail(user.email)) {
      emailMatch = contacts[i];
    }
  }
  return emailMatch;
}


/** DE: Wandelt einen bestehenden Kontakt in einen registrierten Kontakt um. EN: Converts an existing contact into a registered contact. */
async function promoteRegisteredContact(contact, user, userId) {
  const registered = buildRegisteredContact(user, userId);
  registered.id = contact.id;
  registered.phone = contact.phone || "";
  await updateContact(contact.id, registered);
  return registered;
}


/** DE: Stellt sicher, dass ein Benutzer einen registrierten Kontakt besitzt. EN: Ensures that a user has a registered contact. */
async function ensureUserContact(user, userId, contacts) {
  let contact = findRegisteredContact(contacts, user, userId);
  if (!contact) contact = await createContact(buildRegisteredContact(user, userId));
  if (!contact.isRegistered || contact.userId !== String(userId)) {
    contact = await promoteRegisteredContact(contact, user, userId);
  }
  if (user.contactId !== contact.id) await linkUserToContact(userId, contact.id);
}


/** DE: Stellt sicher, dass jeder registrierte Benutzer als Kontakt vorhanden ist. EN: Ensures that every registered user exists as a contact. */
async function ensureRegisteredContacts() {
  const users = await getFirebaseData("users");
  if (!users) return;
  const contacts = await getContacts();
  for (const userId in users) {
    await ensureUserContact(users[userId], userId, contacts);
  }
}


/** DE: Prüft, ob eine Task-Zuweisung auf einen Kontakt verweist. EN: Checks whether a task assignment references a contact. */
function isContactReference(item, contact) {
  if (typeof item === "string") {
    if (item === contact.id) return true;
    return normalizeEmail(item) === normalizeEmail(contact.email);
  }
  if (!item || typeof item !== "object") return false;
  if (item.id === contact.id || item.contactId === contact.id) return true;
  return Boolean(item.email && normalizeEmail(item.email) === normalizeEmail(contact.email));
}


/** DE: Entfernt einen Kontakt aus einem Zuweisungsarray. EN: Removes a contact from one assignment array. */
function removeContactFromArray(assignments, contact) {
  let changed = false;
  for (let i = assignments.length - 1; i >= 0; i--) {
    if (!isContactReference(assignments[i], contact)) continue;
    assignments.splice(i, 1);
    changed = true;
  }
  return changed;
}


/** DE: Entfernt einen Kontakt aus bekannten Task-Zuweisungen. EN: Removes a contact from known task assignments. */
function removeContactFromTask(task, contact) {
  const keys = ["assignedTo", "assignedContacts", "assignees", "contacts"];
  let changed = false;
  for (let i = 0; i < keys.length; i++) {
    const assignments = task[keys[i]];
    if (!Array.isArray(assignments)) continue;
    if (removeContactFromArray(assignments, contact)) changed = true;
  }
  return changed;
}


/** DE: Entfernt einen gelöschten Kontakt aus allen Tasks. EN: Removes a deleted contact from all tasks. */
async function removeContactFromTasks(contact) {
  const tasks = await getFirebaseData("tasks");
  if (!tasks) return;
  let changed = false;
  for (const taskId in tasks) {
    if (removeContactFromTask(tasks[taskId], contact)) changed = true;
  }
  if (changed) await putFirebaseData("tasks", tasks);
}


/** DE: Löscht einen Kontakt und alle verknüpften dauerhaften Daten. EN: Deletes a contact and all linked persistent data. */
async function deleteContactWithRelations(contact) {
  await removeContactFromTasks(contact);
  await deleteContact(contact.id);
  if (!contact.isRegistered) return;
  if (contact.userId) return deleteUser(contact.userId);
  const user = await getUserByEmail(contact.email);
  if (user && user.userId) await deleteUser(user.userId);
}
