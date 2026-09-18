/**
 * DE: Liest alle Kontakte mit ihren Firebase-IDs.
 * EN: Reads all contacts including their Firebase ids.
 */
async function getContacts() {
  try {
    return mapFirebaseCollection(await getFirebaseData("contacts"));
  } catch {
    return [];
  }
}


/**
 * DE: Sucht einen Kontakt anhand seiner E-Mail-Adresse.
 * EN: Finds a contact by email address.
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
 * DE: Gibt die Telefonnummer eines Kontakts oder einen leeren Text zurück.
 * EN: Returns a contact phone number or an empty string.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {string} DE: Telefonnummer. EN: Phone number.
 */
function getContactPhoneValue(contact) {
  if (!contact.phone) return "";
  return contact.phone;
}


/**
 * DE: Gibt die Benutzer-ID eines Kontakts oder null zurück.
 * EN: Returns a contact user id or null.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {string|null} DE: Benutzer-ID. EN: User id.
 */
function getContactUserIdValue(contact) {
  if (!contact.userId) return null;
  return contact.userId;
}


/**
 * DE: Erstellt die speicherbaren Daten eines Kontakts ohne lokale ID.
 * EN: Creates storable contact data without the local id.
 */
function getContactPayload(contact) {
  return {
    name: contact.name,
    email: contact.email,
    phone: getContactPhoneValue(contact),
    initials: contact.initials,
    color: contact.color,
    isRegistered: Boolean(contact.isRegistered),
    userId: getContactUserIdValue(contact),
  };
}


/**
 * DE: Erstellt einen Kontakt in Firebase.
 * EN: Creates a contact in Firebase.
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
 */
async function updateContact(contactId, contact) {
  await putFirebaseData("contacts/" + contactId, getContactPayload(contact));
}


/**
 * DE: Löscht einen Kontakt aus Firebase.
 * EN: Deletes a contact from Firebase.
 */
async function deleteContact(contactId) {
  await deleteFirebaseData("contacts/" + contactId);
}


/**
 * DE: Speichert alle Kontakte für ältere Aufrufer.
 * EN: Stores all contacts for legacy callers.
 */
async function saveContacts(contacts) {
  await putFirebaseData("contacts", contacts);
}


/**
 * DE: Erstellt einen registrierten Kontakt aus Benutzerdaten.
 * EN: Creates a registered contact from user data.
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
 */
async function linkUserToContact(userId, contactId) {
  await patchFirebaseData("users/" + userId, { contactId: contactId });
}


/**
 * DE: Erstellt einen Benutzer zusammen mit seinem Kontakt.
 * EN: Creates a user together with its contact.
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
 */
async function ensureUserContact(user, userId, contacts) {
  let contact = findRegisteredContact(contacts, user, userId);
  if (!contact) contact = await createContact(buildRegisteredContact(user, userId));
  if (!contact.isRegistered || contact.userId !== String(userId)) {
    contact = await promoteRegisteredContact(contact, user, userId);
  }
  if (user.contactId !== contact.id) await linkUserToContact(userId, contact.id);
}


/**
 * DE: Stellt sicher, dass jeder registrierte Benutzer als Kontakt vorhanden ist.
 * EN: Ensures that every registered user exists as a contact.
 */
async function ensureRegisteredContacts() {
  const users = await getFirebaseData("users");
  if (!users) return;
  const contacts = await getContacts();
  for (let userId in users) {
    await ensureUserContact(users[userId], userId, contacts);
  }
}


/**
 * DE: Prüft, ob eine Task-Zuweisung auf einen Kontakt verweist.
 * EN: Checks whether a task assignment references a contact.
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
 */
async function removeContactFromTasks(contact) {
  const tasks = await getFirebaseData("tasks");
  if (!tasks) return;
  let changed = false;
  for (let taskId in tasks) {
    if (removeContactFromTask(tasks[taskId], contact)) changed = true;
  }
  if (changed) await putFirebaseData("tasks", tasks);
}


/**
 * DE: Löscht einen Kontakt und alle verknüpften dauerhaften Daten.
 * EN: Deletes a contact and all linked persistent data.
 */
async function deleteContactWithRelations(contact) {
  await removeContactFromTasks(contact);
  await deleteContact(contact.id);
  if (!contact.isRegistered) return;
  if (contact.userId) return deleteUser(contact.userId);
  const user = await getUserByEmail(contact.email);
  if (user && user.userId) await deleteUser(user.userId);
}
