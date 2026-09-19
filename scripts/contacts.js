const CONTACTS_GUEST_KEY = "joinGuestContacts";
const ADMIN_EMAIL = "admin@join.com";
const contactState = {
  contacts: [],
  selectedId: null,
  dialogMode: "add",
  editingId: null,
};
const contactsList = document.getElementById("contactsList");
const contactDetail = document.getElementById("contactDetail");

/**
 * DE: Prüft, ob der Gastmodus aktiv ist.
 * EN: Checks whether guest mode is active.
 * @returns {boolean} DE: Gaststatus. EN: Guest status.
 */
function isGuestContactMode() {
  return getUserMode() === "guest";
}


/**
 * DE: Prüft, ob der aktuelle Benutzer Administrator ist.
 * EN: Checks whether the current user is an administrator.
 * @returns {boolean} DE: Administratorstatus. EN: Administrator status.
 */
function isAdminUser() {
  const user = getCurrentUser();
  if (!user) return false;
  return normalizeEmail(user.email) === ADMIN_EMAIL;
}


/**
 * DE: Sucht einen Kontakt im aktuellen Kontaktstatus.
 * EN: Finds a contact in the current contact state.
 * @param {string|null} contactId - DE: Kontakt-ID. EN: Contact id.
 * @returns {object|null} DE: Kontakt. EN: Contact.
 */
function getContactFromState(contactId) {
  for (let i = 0; i < contactState.contacts.length; i++) {
    if (contactState.contacts[i].id === contactId) return contactState.contacts[i];
  }
  return null;
}


/**
 * DE: Gibt den aktuell ausgewählten Kontakt zurück.
 * EN: Returns the currently selected contact.
 * @returns {object|null} DE: Kontakt. EN: Contact.
 */
function getSelectedContact() {
  return getContactFromState(contactState.selectedId);
}


/**
 * DE: Prüft, ob ein registrierter Kontakt zum aktuellen Benutzer gehört.
 * EN: Checks whether a registered contact belongs to the current user.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {boolean} DE: Besitzstatus. EN: Ownership status.
 */
function isOwnRegisteredContact(contact) {
  const user = getCurrentUser();
  if (!user || !contact.isRegistered) return false;
  if (user.userId && contact.userId) {
    return String(user.userId) === String(contact.userId);
  }
  return normalizeEmail(user.email) === normalizeEmail(contact.email);
}


/**
 * DE: Prüft, ob der aktuelle Zugang einen Kontakt verwalten darf.
 * EN: Checks whether the current access may manage a contact.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {boolean} DE: Berechtigung. EN: Permission.
 */
function canManageContact(contact) {
  if (isGuestContactMode()) return true;
  if (isAdminUser()) return true;
  if (!contact.isRegistered) return true;
  return isOwnRegisteredContact(contact);
}


/**
 * DE: Liest die lokale Kontaktliste des Gastes.
 * EN: Reads the guest's local contact list.
 * @returns {Array|null} DE: Kontakte. EN: Contacts.
 */
function getStoredGuestContacts() {
  const storedContacts = sessionStorage.getItem(CONTACTS_GUEST_KEY);
  if (!storedContacts) return [];
  try {
    return JSON.parse(storedContacts);
  } catch {
    return [];
  }
}


/**
 * DE: Speichert die Kontaktliste des Gastes lokal.
 * EN: Stores the guest contact list locally.
 */
function saveGuestContacts() {
  const contacts = JSON.stringify(contactState.contacts);
  sessionStorage.setItem(CONTACTS_GUEST_KEY, contacts);
}


/**
 * DE: Liest ausschliesslich Kontakte der aktuellen Gastsitzung.
 * EN: Reads only contacts from the current guest session.
 * @returns {Promise<Array>} DE: Kontakte. EN: Contacts.
 */
async function loadGuestContacts() {
  return getStoredGuestContacts();
}


/**
 * DE: Lädt die Kontakte passend zum Zugangsmodus.
 * EN: Loads contacts according to the access mode.
 * @returns {Promise<Array>} DE: Kontakte. EN: Contacts.
 */
async function loadContacts() {
  if (isGuestContactMode()) return loadGuestContacts();
  await ensureRegisteredContacts();
  return getContacts();
}


/**
 * DE: Gibt den ersten Buchstaben des Vornamens zurück.
 * EN: Returns the first letter of the first name.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {string} DE: Anfangsbuchstabe. EN: First letter.
 */
function getContactLetter(contact) {
  return contact.name.trim().charAt(0).toUpperCase();
}


/**
 * DE: Vergleicht zwei Kontakte nach ihrem Namen.
 * EN: Compares two contacts by their name.
 * @param {object} firstContact - DE: Erster Kontakt. EN: First contact.
 * @param {object} secondContact - DE: Zweiter Kontakt. EN: Second contact.
 * @returns {number} DE: Sortierwert. EN: Sort value.
 */
function compareContactNames(firstContact, secondContact) {
  return firstContact.name.localeCompare(secondContact.name, "de");
}


/**
 * DE: Sortiert Kontakte alphabetisch nach dem Vornamen.
 * EN: Sorts contacts alphabetically by first name.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @returns {Array} DE: Sortierte Kontakte. EN: Sorted contacts.
 */
function sortContacts(contacts) {
  const sortedContacts = contacts.slice();
  sortedContacts.sort(compareContactNames);
  return sortedContacts;
}


/**
 * DE: Gruppiert Kontakte nach dem ersten Buchstaben.
 * EN: Groups contacts by their first letter.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @returns {object} DE: Kontaktgruppen. EN: Contact groups.
 */
function groupContacts(contacts) {
  const groups = {};
  for (let i = 0; i < contacts.length; i++) {
    const letter = getContactLetter(contacts[i]);
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(contacts[i]);
  }
  return groups;
}


/**
 * DE: Vergleicht zwei Buchstaben für die Sortierung.
 * EN: Compares two letters for sorting.
 * @param {string} firstLetter - DE: Erster Buchstabe. EN: First letter.
 * @param {string} secondLetter - DE: Zweiter Buchstabe. EN: Second letter.
 * @returns {number} DE: Sortierwert. EN: Sort value.
 */
function compareContactLetters(firstLetter, secondLetter) {
  return firstLetter.localeCompare(secondLetter, "de");
}


/**
 * DE: Erstellt das HTML für alle Kontaktgruppen.
 * EN: Creates the HTML for all contact groups.
 * @param {object} groups - DE: Kontaktgruppen. EN: Contact groups.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function createContactGroupsHtml(groups) {
  const letters = Object.keys(groups);
  letters.sort(compareContactLetters);
  let html = "";
  for (let i = 0; i < letters.length; i++) {
    html += getContactGroupTemplate(letters[i], groups[letters[i]], contactState.selectedId);
  }
  return html;
}


/**
 * DE: Rendert die alphabetische Kontaktliste.
 * EN: Renders the alphabetical contact list.
 */
function renderContacts() {
  const sortedContacts = sortContacts(contactState.contacts);
  const groups = groupContacts(sortedContacts);
  contactsList.innerHTML = createContactGroupsHtml(groups);
  initializeContactListEvents();
}


/**
 * DE: Aktiviert die Einfluganimation der Detailansicht.
 * EN: Starts the entrance animation of the detail view.
 */
function startContactDetailAnimation() {
  animateFloatingElement(contactDetail, true);
}


/**
 * DE: Rendert die Detailansicht des ausgewählten Kontakts.
 * EN: Renders the detail view of the selected contact.
 */
function renderContactDetail() {
  const contact = getSelectedContact();
  if (!contact) return contactDetail.replaceChildren();
  contactDetail.innerHTML = getContactDetailTemplate(contact, canManageContact(contact));
  startContactDetailAnimation();
  initializeContactDetailEvents();
}


/**
 * DE: Wählt einen Kontakt aus und aktualisiert die Ansicht.
 * EN: Selects a contact and updates the view.
 * @param {string} contactId - DE: Kontakt-ID. EN: Contact id.
 */
function selectContact(contactId) {
  contactState.selectedId = contactId;
  renderContacts();
  renderContactDetail();
}


/**
 * DE: Verarbeitet den Klick auf einen Kontakt.
 * EN: Handles the click on a contact.
 * @param {MouseEvent} event - DE: Klickereignis. EN: Click event.
 */
function handleContactButtonClick(event) {
  const button = event.currentTarget;
  selectContact(button.getAttribute("data-contact-id"));
}


/**
 * DE: Verknüpft alle Kontaktbuttons mit ihrem Klickereignis.
 * EN: Connects all contact buttons with their click event.
 */
function initializeContactListEvents() {
  const buttons = contactsList.querySelectorAll("[data-contact-id]");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", handleContactButtonClick);
  }
}


/**
 * DE: Lädt echte Kontakte neu oder behält die lokale Gastansicht.
 * EN: Reloads real contacts or keeps the local guest view.
 */
async function refreshContacts() {
  if (!isGuestContactMode()) contactState.contacts = await getContacts();
  renderContacts();
  renderContactDetail();
}


/**
 * DE: Öffnet den Dialog zum Erstellen eines Kontakts.
 * EN: Opens the dialog for creating a contact.
 */
function handleAddContactClick() {
  openContactDialog("add");
}


/**
 * DE: Initialisiert die Ereignisse der Kontaktseite.
 * EN: Initializes the contact page events.
 */
function initializeContactEvents() {
  document.getElementById("addContactButton").addEventListener("click", handleAddContactClick);
  initializeContactFormEvents();
}


/**
 * DE: Initialisiert die komplette Kontaktseite.
 * EN: Initializes the complete contacts page.
 * @returns {Promise<void>}
 */
async function initializeContacts() {
  if (!protectCurrentPage()) return;
  initializeContactEvents();
  initializeContactResizer();
  contactState.contacts = await loadContacts();
  renderContacts();
}


document.addEventListener("DOMContentLoaded", initializeContacts);
