/** DE: Liest Tasks aus Firebase oder aus der lokalen Gastsicht. EN: Reads tasks from Firebase or the local guest view. */
async function getTasks() {
  try {
    if (getUserMode() === "guest") return getGuestTaskData();
    if (getUserMode() !== "user") return [];
    return mapStoredTasks(await getFirebaseData("tasks"));
  } catch {
    return [];
  }
}


/**
 * DE: Speichert Tasks in Firebase oder nur lokal für den Gast.
 * EN: Stores tasks in Firebase or only locally for the guest.
 * @param {object[]} tasks - DE: Zu speichernde Tasks. EN: Tasks to store.
 * @returns {Promise<void>}
 */
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


/**
 * DE: Sucht einen Kontakt anhand seiner E-Mail-Adresse.
 * EN: Finds a contact by email address.
 * @param {string} email - DE: Gesuchte E-Mail-Adresse. EN: Email address to search for.
 * @returns {Promise<object|null>} DE: Gefundener Kontakt oder null. EN: Found contact or null.
 */
async function getContactByEmail(email) {
  const contacts = await getContacts();
  const searchedEmail = normalizeEmail(email);
  for (let i = 0; i < contacts.length; i++) {
    if (normalizeEmail(contacts[i].email) === searchedEmail) return contacts[i];
  }
  return null;
}


/**
 * DE: Erstellt die speicherbaren Daten eines Kontakts ohne lokale ID.
 * EN: Creates storable contact data without the local id.
 * @param {object} contact - DE: Kontakt mit lokalen Daten. EN: Contact with local data.
 * @returns {object} DE: Speicherbare Kontaktdaten. EN: Storable contact data.
 */
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


/**
 * DE: Erstellt einen Kontakt in Firebase.
 * EN: Creates a contact in Firebase.
 * @param {object} contact - DE: Neuer Kontakt. EN: New contact.
 * @returns {Promise<object>} DE: Gespeicherter Kontakt mit ID. EN: Stored contact with id.
 */
async function createContact(contact) {
  const storedContact = getContactPayload(contact);
  const contactId = await postFirebaseData("contacts", storedContact);
  storedContact.id = contactId;
  return storedContact;
}


/**
 * DE: Aktualisiert einen Kontakt in Firebase.
 * EN: Updates a contact in Firebase.
 * @param {string} contactId - DE: Firebase-ID des Kontakts. EN: Firebase id of the contact.
 * @param {object} contact - DE: Aktualisierte Kontaktdaten. EN: Updated contact data.
 * @returns {Promise<void>}
 */
async function updateContact(contactId, contact) {
  await putFirebaseData("contacts/" + contactId, getContactPayload(contact));
}


/**
 * DE: Löscht einen Kontakt aus Firebase.
 * EN: Deletes a contact from Firebase.
 * @param {string} contactId - DE: Firebase-ID des Kontakts. EN: Firebase id of the contact.
 * @returns {Promise<void>}
 */
async function deleteContact(contactId) {
  await deleteFirebaseData("contacts/" + contactId);
}


/**
 * DE: Erstellt einen registrierten Kontakt aus Benutzerdaten.
 * EN: Creates a registered contact from user data.
 * @param {object} user - DE: Benutzerdaten. EN: User data.
 * @param {string} userId - DE: Firebase-ID des Benutzers. EN: Firebase id of the user.
 * @returns {object} DE: Registrierter Kontakt. EN: Registered contact.
 */
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


/**
 * DE: Verknüpft einen Benutzer mit seinem Kontakt.
 * EN: Links a user with its contact.
 * @param {string} userId - DE: Firebase-ID des Benutzers. EN: Firebase id of the user.
 * @param {string} contactId - DE: Firebase-ID des Kontakts. EN: Firebase id of the contact.
 * @returns {Promise<void>}
 */
async function linkUserToContact(userId, contactId) {
  await patchFirebaseData("users/" + userId, { contactId: contactId });
}


/**
 * DE: Erstellt einen Benutzer zusammen mit seinem Kontakt.
 * EN: Creates a user together with its contact.
 * @param {object} user - DE: Eingegebene Benutzerdaten. EN: Entered user data.
 * @param {string} password - DE: Passwort des Benutzers. EN: Password of the user.
 * @returns {Promise<{userId: string, contactId: string}>} DE: IDs von Benutzer und Kontakt. EN: Ids of the user and the contact.
 */
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


/**
 * DE: Sucht den registrierten Kontakt eines Benutzers.
 * EN: Finds the registered contact of a user.
 * @param {object[]} contacts - DE: Liste aller Kontakte. EN: List of all contacts.
 * @param {object} user - DE: Benutzerdaten. EN: User data.
 * @param {string} userId - DE: Firebase-ID des Benutzers. EN: Firebase id of the user.
 * @returns {object|null} DE: Gefundener Kontakt oder null. EN: Found contact or null.
 */
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


/**
 * DE: Wandelt einen bestehenden Kontakt in einen registrierten Kontakt um.
 * EN: Converts an existing contact into a registered contact.
 * @param {object} contact - DE: Bestehender Kontakt. EN: Existing contact.
 * @param {object} user - DE: Benutzerdaten. EN: User data.
 * @param {string} userId - DE: Firebase-ID des Benutzers. EN: Firebase id of the user.
 * @returns {Promise<object>} DE: Registrierter Kontakt. EN: Registered contact.
 */
async function promoteRegisteredContact(contact, user, userId) {
  const registered = buildRegisteredContact(user, userId);
  registered.id = contact.id;
  registered.phone = contact.phone || "";
  await updateContact(contact.id, registered);
  return registered;
}


/**
 * DE: Stellt sicher, dass ein Benutzer einen registrierten Kontakt besitzt.
 * EN: Ensures that a user has a registered contact.
 * @param {object} user - DE: Benutzerdaten. EN: User data.
 * @param {string} userId - DE: Firebase-ID des Benutzers. EN: Firebase id of the user.
 * @param {object[]} contacts - DE: Liste aller Kontakte. EN: List of all contacts.
 * @returns {Promise<void>}
 */
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


/**
 * DE: Prüft, ob eine Task-Zuweisung auf einen Kontakt verweist.
 * EN: Checks whether a task assignment references a contact.
 * @param {string|object} item - DE: Zuweisung im Task. EN: Assignment on the task.
 * @param {object} contact - DE: Zu prüfender Kontakt. EN: Contact to check against.
 * @returns {boolean} DE: True, wenn die Zuweisung auf den Kontakt verweist. EN: True if the assignment references the contact.
 */
function isContactReference(item, contact) {
  if (typeof item === "string") {
    if (item === contact.id) return true;
    return normalizeEmail(item) === normalizeEmail(contact.email);
  }
  if (!item || typeof item !== "object") return false;
  if (item.id === contact.id || item.contactId === contact.id) return true;
  return Boolean(item.email && normalizeEmail(item.email) === normalizeEmail(contact.email));
}


/**
 * DE: Entfernt einen Kontakt aus einem Zuweisungsarray.
 * EN: Removes a contact from one assignment array.
 * @param {Array} assignments - DE: Zuweisungsarray, wird verändert. EN: Assignment array, mutated in place.
 * @param {object} contact - DE: Zu entfernender Kontakt. EN: Contact to remove.
 * @returns {boolean} DE: True, wenn das Array verändert wurde. EN: True if the array was changed.
 */
function removeContactFromArray(assignments, contact) {
  let changed = false;
  for (let i = assignments.length - 1; i >= 0; i--) {
    if (!isContactReference(assignments[i], contact)) continue;
    assignments.splice(i, 1);
    changed = true;
  }
  return changed;
}


/**
 * DE: Entfernt einen Kontakt aus bekannten Task-Zuweisungen.
 * EN: Removes a contact from known task assignments.
 * @param {object} task - DE: Task, wird verändert. EN: Task, mutated in place.
 * @param {object} contact - DE: Zu entfernender Kontakt. EN: Contact to remove.
 * @returns {boolean} DE: True, wenn der Task verändert wurde. EN: True if the task was changed.
 */
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


/**
 * DE: Entfernt einen gelöschten Kontakt aus allen Tasks.
 * EN: Removes a deleted contact from all tasks.
 * @param {object} contact - DE: Gelöschter Kontakt. EN: Deleted contact.
 * @returns {Promise<void>}
 */
async function removeContactFromTasks(contact) {
  const tasks = await getFirebaseData("tasks");
  if (!tasks) return;
  let changed = false;
  for (const taskId in tasks) {
    if (removeContactFromTask(tasks[taskId], contact)) changed = true;
  }
  if (changed) await putFirebaseData("tasks", tasks);
}


/**
 * DE: Löscht einen Kontakt und alle verknüpften dauerhaften Daten.
 * EN: Deletes a contact and all linked persistent data.
 * @param {object} contact - DE: Zu löschender Kontakt. EN: Contact to delete.
 * @returns {Promise<void>}
 */
async function deleteContactWithRelations(contact) {
  await removeContactFromTasks(contact);
  await deleteContact(contact.id);
  if (!contact.isRegistered) return;
  if (contact.userId) return deleteUser(contact.userId);
  const user = await getUserByEmail(contact.email);
  if (user && user.userId) await deleteUser(user.userId);
}
