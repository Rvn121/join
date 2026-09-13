const FIREBASE_BASE_URL =
  "https://join-9969f-default-rtdb.europe-west1.firebasedatabase.app";

/**
 * DE: Erstellt eine vollständige Firebase-URL.
 * EN: Creates a complete Firebase URL.
 * @param {string} path - DE: Datenpfad. EN: Data path.
 * @returns {string} DE: URL. EN: URL.
 */
function getFirebaseUrl(path = "") {
  return `${FIREBASE_BASE_URL}/${path}.json`;
}


/**
 * DE: Liest Daten aus Firebase.
 * EN: Reads data from Firebase.
 * @param {string} path - DE: Datenpfad. EN: Data path.
 * @returns {Promise<any>} DE: Firebase-Daten. EN: Firebase data.
 */
async function getFirebaseData(path) {
  const response = await fetch(getFirebaseUrl(path));
  if (!response.ok) throw new Error("Firebase read failed.");
  return response.json();
}


/**
 * DE: Schreibt Daten per PUT nach Firebase.
 * EN: Writes data to Firebase using PUT.
 * @param {string} path - DE: Datenpfad. EN: Data path.
 * @param {any} data - DE: Daten. EN: Data.
 * @returns {Promise<any>} DE: Antwort. EN: Response.
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
 * DE: Normalisiert eine E-Mail-Adresse.
 * EN: Normalizes an email address.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @returns {string} DE: Normalisierte E-Mail. EN: Normalized email.
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}


/**
 * DE: Sucht einen Benutzer in den Firebase-Daten.
 * EN: Searches for a user in the Firebase data.
 * @param {object} users - DE: Benutzerliste. EN: User list.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @returns {object|null} DE: Benutzer. EN: User.
 */
function findUserInData(users, email) {
  const searchedEmail = normalizeEmail(email);
  for (const key in users) {
    if (normalizeEmail(users[key].email) === searchedEmail) return users[key];
  }
  return null;
}


/**
 * DE: Liest einen Benutzer anhand seiner E-Mail.
 * EN: Reads a user by email address.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @returns {Promise<object|null>} DE: Benutzer. EN: User.
 */
async function getUserByEmail(email) {
  const users = await getFirebaseData("users");
  if (!users) return null;
  return findUserInData(users, email);
}


/**
 * DE: Erstellt die zu speichernden Benutzerdaten.
 * EN: Creates the user data to be stored.
 * @param {object} user - DE: Benutzerdaten. EN: User data.
 * @param {string} password - DE: Passwort. EN: Password.
 * @returns {object} DE: Firebase-Daten. EN: Firebase data.
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
 * DE: Speichert einen Schulungs-Benutzer inklusive Passwort.
 * EN: Stores a training user including the password.
 * @param {object} user - DE: Benutzerdaten. EN: User data.
 * @param {string} password - DE: Passwort. EN: Password.
 */
async function createUser(user, password) {
  const storedUser = createStoredUser(user, password);
  const response = await fetch(getFirebaseUrl("users"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storedUser),
  });
  if (!response.ok) throw new Error("Firebase write failed.");
}


/**
 * DE: Erstellt Benutzerdaten ohne Passwort.
 * EN: Creates user data without the password.
 * @param {object} user - DE: Firebase-Benutzer. EN: Firebase user.
 * @returns {object} DE: Öffentliche Daten. EN: Public data.
 */
function createPublicUser(user) {
  return {
    name: user.name,
    email: user.email,
    initials: user.initials,
    color: user.color,
  };
}


/**
 * DE: Prüft E-Mail und Passwort gegen Firebase.
 * EN: Checks email and password against Firebase.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @param {string} password - DE: Passwort. EN: Password.
 * @returns {Promise<object|null>} DE: Benutzer. EN: User.
 */
async function verifyUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return createPublicUser(user);
}


/**
 * DE: Liest alle Tasks aus Firebase.
 * EN: Reads all tasks from Firebase.
 * @returns {Promise<Array>} DE: Tasks. EN: Tasks.
 */
async function getTasks() {
  try {
    const tasks = await getFirebaseData("tasks");
    return tasks ? Object.values(tasks) : [];
  } catch {
    return [];
  }
}


/**
 * DE: Speichert alle Tasks in Firebase.
 * EN: Stores all tasks in Firebase.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 */
async function saveTasks(tasks) {
  await putFirebaseData("tasks", tasks);
}


/**
 * DE: Liest alle Kontakte aus Firebase.
 * EN: Reads all contacts from Firebase.
 * @returns {Promise<Array>} DE: Kontakte. EN: Contacts.
 */
async function getContacts() {
  try {
    const contacts = await getFirebaseData("contacts");
    return contacts ? Object.values(contacts) : [];
  } catch {
    return [];
  }
}


/**
 * DE: Speichert alle Kontakte in Firebase.
 * EN: Stores all contacts in Firebase.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 */
async function saveContacts(contacts) {
  await putFirebaseData("contacts", contacts);
}
