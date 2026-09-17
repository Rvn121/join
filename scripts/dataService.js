/**
 * DE: Erstellt eine vollständige Firebase-URL.
 * EN: Creates a complete Firebase URL.
 */
function getFirebaseUrl(path = "") {
  return FIREBASE_BASE_URL + "/" + path + ".json";
}


/**
 * DE: Liest Daten aus Firebase.
 * EN: Reads data from Firebase.
 */
async function getFirebaseData(path) {
  const response = await fetch(getFirebaseUrl(path));
  if (!response.ok) throw new Error("Firebase read failed.");
  return response.json();
}


/**
 * DE: Schreibt Daten mit PUT nach Firebase.
 * EN: Writes data to Firebase with PUT.
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
 */
async function deleteFirebaseData(path) {
  const response = await fetch(getFirebaseUrl(path), { method: "DELETE" });
  if (!response.ok) throw new Error("Firebase delete failed.");
}


/**
 * DE: Vereinheitlicht eine E-Mail-Adresse.
 * EN: Normalizes an email address.
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}


/**
 * DE: Kopiert ein Firebase-Objekt und ergänzt seine ID.
 * EN: Copies a Firebase object and adds its id.
 */
function copyFirebaseItem(value, id, idKey) {
  const item = {};
  for (let key in value) item[key] = value[key];
  item[idKey] = String(id);
  return item;
}


/**
 * DE: Wandelt eine Firebase-Sammlung in ein Array mit IDs um.
 * EN: Converts a Firebase collection into an array with ids.
 */
function mapFirebaseCollection(data, idKey = "id") {
  const items = [];
  if (!data) return items;
  for (let id in data) {
    if (data[id]) items.push(copyFirebaseItem(data[id], id, idKey));
  }
  return items;
}


/**
 * DE: Sucht einen Benutzer anhand seiner E-Mail-Adresse.
 * EN: Finds a user by email address.
 */
function findUserInData(users, email) {
  const searchedEmail = normalizeEmail(email);
  for (let userId in users) {
    if (normalizeEmail(users[userId].email) !== searchedEmail) continue;
    return copyFirebaseItem(users[userId], userId, "userId");
  }
  return null;
}


/**
 * DE: Liest einen Benutzer anhand seiner E-Mail-Adresse.
 * EN: Reads a user by email address.
 */
async function getUserByEmail(email) {
  const users = await getFirebaseData("users");
  if (!users) return null;
  return findUserInData(users, email);
}


/**
 * DE: Erstellt die zu speichernden Benutzerdaten.
 * EN: Creates the user data to be stored.
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
 */
async function createUser(user, password) {
  const storedUser = createStoredUser(user, password);
  return postFirebaseData("users", storedUser);
}


/**
 * DE: Erstellt öffentliche Sitzungsdaten eines Benutzers.
 * EN: Creates public session data of a user.
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
 */
async function deleteUser(userId) {
  await deleteFirebaseData("users/" + userId);
}


/**
 * DE: Liest Tasks aus Firebase oder aus der lokalen Gastsicht.
 * EN: Reads tasks from Firebase or the local guest view.
 */
async function getTasks() {
  try {
    const guestTasks = getGuestTasksIfNeeded();
    if (guestTasks) return guestTasks;
    return await loadStoredTasks();
  } catch {
    return [];
  }
}


/**
 * DE: Liest lokale Gast-Tasks nur im Gastmodus.
 * EN: Reads local guest tasks only in guest mode.
 * @returns {Array|null} DE: Gast-Tasks. EN: Guest tasks.
 */
function getGuestTasksIfNeeded() {
  if (getUserMode() !== "guest") return null;
  return getGuestTaskData();
}


/**
 * DE: Liest Tasks aus Firebase und bereitet die Taskliste vor.
 * EN: Reads tasks from Firebase and prepares the task list.
 * @returns {Promise<Array>} DE: Taskliste. EN: Task list.
 */
async function loadStoredTasks() {
  const tasks = await getFirebaseData("tasks");
  const taskList = mapStoredTasks(tasks);
  if (getUserMode() === "guest") setGuestTaskData(taskList);
  return taskList;
}


/**
 * DE: Speichert Tasks in Firebase oder nur lokal für den Gast.
 * EN: Stores tasks in Firebase or only locally for the guest.
 */
async function saveTasks(tasks) {
  if (getUserMode() === "guest") return setGuestTaskData(tasks);
  await putFirebaseData("tasks", tasks);
}
