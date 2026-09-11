const TASK_STORAGE_KEY = "joinTasks";
const CONTACT_STORAGE_KEY = "joinContacts";

/**
 * DE: Liest gemeinsame Daten aus dem aktuellen Fallback-Speicher.
 * EN: Reads shared data from the current fallback storage.
 * @param {string} key - DE: Speicherschlüssel. EN: Storage key.
 * @returns {Array} DE: Daten. EN: Data.
 */
function readSharedData(key) {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : [];
}


/**
 * DE: Speichert gemeinsame Daten unabhängig vom Zugangsmodus.
 * EN: Stores shared data independently from the access mode.
 * @param {string} key - DE: Speicherschlüssel. EN: Storage key.
 * @param {Array} data - DE: Daten. EN: Data.
 */
function writeSharedData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


/**
 * DE: Liest alle Tasks.
 * EN: Reads all tasks.
 * @returns {Array} DE: Tasks. EN: Tasks.
 */
function getTasks() {
  return readSharedData(TASK_STORAGE_KEY);
}


/**
 * DE: Speichert alle Tasks.
 * EN: Stores all tasks.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 */
function saveTasks(tasks) {
  writeSharedData(TASK_STORAGE_KEY, tasks);
}


/**
 * DE: Liest alle Kontakte.
 * EN: Reads all contacts.
 * @returns {Array} DE: Kontakte. EN: Contacts.
 */
function getContacts() {
  return readSharedData(CONTACT_STORAGE_KEY);
}


/**
 * DE: Speichert alle Kontakte.
 * EN: Stores all contacts.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 */
function saveContacts(contacts) {
  writeSharedData(CONTACT_STORAGE_KEY, contacts);
}
