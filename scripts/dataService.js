/**
 * DE: Erstellt eine vollständige Firebase-URL.
 * EN: Creates a complete Firebase URL.
 * @param {string} [path] - DE: Pfad in der Datenbank. EN: Path in the database.
 * @returns {string} DE: Vollständige Firebase-URL. EN: Complete Firebase URL.
 */
function getFirebaseUrl(path = "") {
  if (getUserMode() === "guest" || (isProtectedPage() && !getUserMode())) {
    throw new Error("Database access requires a registered user session.");
  }
  return FIREBASE_BASE_URL + "/" + path + ".json";
}


/**
 * DE: Liest Daten aus Firebase.
 * EN: Reads data from Firebase.
 * @param {string} path - DE: Pfad in der Datenbank. EN: Path in the database.
 * @returns {Promise<*>} DE: Gelesene Daten. EN: Data that was read.
 */
async function getFirebaseData(path) {
  const response = await fetch(getFirebaseUrl(path));
  if (!response.ok) throw new Error("Firebase read failed.");
  return response.json();
}


/**
 * DE: Schreibt Daten mit PUT nach Firebase.
 * EN: Writes data to Firebase with PUT.
 * @param {string} path - DE: Pfad in der Datenbank. EN: Path in the database.
 * @param {*} data - DE: Zu speichernde Daten. EN: Data to store.
 * @returns {Promise<*>} DE: Antwort von Firebase. EN: Response from Firebase.
 */
async function putFirebaseData(path, data) {
  const response = await fetch(getFirebaseUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Firebase write failed.");
  return response.json();
}


/**
 * DE: Erstellt Daten mit POST in Firebase.
 * EN: Creates data in Firebase with POST.
 * @param {string} path - DE: Pfad in der Datenbank. EN: Path in the database.
 * @param {*} data - DE: Zu speichernde Daten. EN: Data to store.
 * @returns {Promise<string>} DE: Neu erzeugte Firebase-ID. EN: Newly created Firebase id.
 */
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


/**
 * DE: Aktualisiert einzelne Eigenschaften mit PATCH.
 * EN: Updates selected properties with PATCH.
 * @param {string} path - DE: Pfad in der Datenbank. EN: Path in the database.
 * @param {*} data - DE: Zu aktualisierende Eigenschaften. EN: Properties to update.
 * @returns {Promise<void>}
 */
async function patchFirebaseData(path, data) {
  const response = await fetch(getFirebaseUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Firebase update failed.");
}


/**
 * DE: Löscht Daten aus Firebase.
 * EN: Deletes data from Firebase.
 * @param {string} path - DE: Pfad in der Datenbank. EN: Path in the database.
 * @returns {Promise<void>}
 */
async function deleteFirebaseData(path) {
  const response = await fetch(getFirebaseUrl(path), { method: "DELETE" });
  if (!response.ok) throw new Error("Firebase delete failed.");
}


/**
 * DE: Vereinheitlicht eine E-Mail-Adresse.
 * EN: Normalizes an email address.
 * @param {string} email - DE: E-Mail-Adresse. EN: Email address.
 * @returns {string} DE: Vereinheitlichte E-Mail-Adresse. EN: Normalized email address.
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}


/**
 * DE: Kopiert ein Firebase-Objekt und ergänzt seine ID.
 * EN: Copies a Firebase object and adds its id.
 * @param {object} value - DE: Firebase-Objekt. EN: Firebase object.
 * @param {string} id - DE: Firebase-ID des Objekts. EN: Firebase id of the object.
 * @param {string} idKey - DE: Name der ID-Eigenschaft. EN: Name of the id property.
 * @returns {object} DE: Kopie mit ergänzter ID. EN: Copy with the id added.
 */
function copyFirebaseItem(value, id, idKey) {
  const item = {};
  for (const key in value) item[key] = value[key];
  item[idKey] = String(id);
  return item;
}


/**
 * DE: Wandelt eine Firebase-Sammlung in ein Array mit IDs um.
 * EN: Converts a Firebase collection into an array with ids.
 * @param {object} data - DE: Firebase-Sammlung. EN: Firebase collection.
 * @param {string} [idKey] - DE: Name der ID-Eigenschaft. EN: Name of the id property.
 * @returns {object[]} DE: Array der Einträge mit IDs. EN: Array of entries with ids.
 */
function mapFirebaseCollection(data, idKey = "id") {
  const items = [];
  if (!data) return items;
  for (const id in data) {
    if (data[id]) items.push(copyFirebaseItem(data[id], id, idKey));
  }
  return items;
}


/**
 * DE: Sucht einen Benutzer anhand seiner E-Mail-Adresse.
 * EN: Finds a user by email address.
 * @param {object} users - DE: Firebase-Benutzersammlung. EN: Firebase user collection.
 * @param {string} email - DE: Gesuchte E-Mail-Adresse. EN: Email address to search for.
 * @returns {object|null} DE: Gefundener Benutzer oder null. EN: Found user or null.
 */
function findUserInData(users, email) {
  const searchedEmail = normalizeEmail(email);
  for (const userId in users) {
    if (normalizeEmail(users[userId].email) !== searchedEmail) continue;
    return copyFirebaseItem(users[userId], userId, "userId");
  }
  return null;
}


/**
 * DE: Liest einen Benutzer anhand seiner E-Mail-Adresse.
 * EN: Reads a user by email address.
 * @param {string} email - DE: Gesuchte E-Mail-Adresse. EN: Email address to search for.
 * @returns {Promise<object|null>} DE: Gefundener Benutzer oder null. EN: Found user or null.
 */
async function getUserByEmail(email) {
  const users = await getFirebaseData("users");
  if (!users) return null;
  return findUserInData(users, email);
}


/**
 * DE: Erstellt die zu speichernden Benutzerdaten.
 * EN: Creates the user data to be stored.
 * @param {object} user - DE: Eingegebene Benutzerdaten. EN: Entered user data.
 * @param {string} password - DE: Passwort des Benutzers. EN: Password of the user.
 * @returns {object} DE: Speicherbare Benutzerdaten. EN: Storable user data.
 */
function createStoredUser(user, password) {
  return {
    name: user.name,
    email: normalizeEmail(user.email),
    password: password,
    initials: user.initials,
    color: user.color,
  };
}


/**
 * DE: Erstellt einen Benutzer und gibt seine Firebase-ID zurück.
 * EN: Creates a user and returns its Firebase id.
 * @param {object} user - DE: Eingegebene Benutzerdaten. EN: Entered user data.
 * @param {string} password - DE: Passwort des Benutzers. EN: Password of the user.
 * @returns {Promise<string>} DE: Firebase-ID des neuen Benutzers. EN: Firebase id of the new user.
 */
async function createUser(user, password) {
  const storedUser = createStoredUser(user, password);
  return postFirebaseData("users", storedUser);
}


/**
 * DE: Erstellt öffentliche Sitzungsdaten eines Benutzers.
 * EN: Creates public session data of a user.
 * @param {object} user - DE: Vollständige Benutzerdaten. EN: Full user data.
 * @returns {object} DE: Öffentliche Sitzungsdaten. EN: Public session data.
 */
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


/**
 * DE: Prüft E-Mail und Passwort gegen Firebase.
 * EN: Checks email and password against Firebase.
 * @param {string} email - DE: Eingegebene E-Mail-Adresse. EN: Entered email address.
 * @param {string} password - DE: Eingegebenes Passwort. EN: Entered password.
 * @returns {Promise<object|null>} DE: Öffentliche Benutzerdaten oder null. EN: Public user data or null.
 */
async function verifyUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return createPublicUser(user);
}


/**
 * DE: Erstellt die Profildaten aus einem registrierten Kontakt.
 * EN: Creates profile data from a registered contact.
 * @param {object} contact - DE: Registrierter Kontakt. EN: Registered contact.
 * @returns {object} DE: Zu übernehmende Profildaten. EN: Profile data to apply.
 */
function getUserProfileChanges(contact) {
  return {
    name: contact.name,
    email: normalizeEmail(contact.email),
    initials: contact.initials,
  };
}


/**
 * DE: Aktualisiert das Profil eines registrierten Benutzers.
 * EN: Updates the profile of a registered user.
 * @param {string} userId - DE: Firebase-ID des Benutzers. EN: Firebase id of the user.
 * @param {object} contact - DE: Registrierter Kontakt mit neuen Daten. EN: Registered contact with new data.
 * @returns {Promise<object>} DE: Aktualisierte öffentliche Benutzerdaten. EN: Updated public user data.
 */
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


/**
 * DE: Löscht einen registrierten Benutzer.
 * EN: Deletes a registered user.
 * @param {string} userId - DE: Firebase-ID des Benutzers. EN: Firebase id of the user.
 * @returns {Promise<void>}
 */
async function deleteUser(userId) {
  await deleteFirebaseData("users/" + userId);
}
