/**
 * DE: Liest die Kontakte für das Taskformular.
 * EN: Reads the contacts for the task form.
 * @returns {Promise<Array>} DE: Kontakte. EN: Contacts.
 */
async function loadTaskFormContacts() {
  if (getUserMode() !== "guest") return getContacts();
  const localContacts = localStorage.getItem("joinGuestContacts");
  if (localContacts) return JSON.parse(localContacts);
  return getContacts();
}


/**
 * DE: Prüft, ob ein Kontakt der aktuell angemeldete Benutzer ist.
 * EN: Checks whether a contact belongs to the current user.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {boolean} DE: Eigener Kontakt. EN: Own contact.
 */
function isOwnTaskContact(contact) {
  const user = getCurrentUser();
  if (!user || !contact) return false;
  if (user.contactId && String(user.contactId) === String(contact.id)) return true;
  return Boolean(user.userId && String(user.userId) === String(contact.userId));
}


/**
 * DE: Prüft, ob ein Kontakt ausgewählt ist.
 * EN: Checks whether a contact is selected.
 * @param {string} contactId - DE: Kontakt-ID. EN: Contact id.
 * @returns {boolean} DE: Auswahlstatus. EN: Selection state.
 */
function isTaskContactSelected(contactId) {
  return taskFormState.selectedContactIds.includes(String(contactId));
}


/**
 * DE: Erstellt die Liste im Assigned-to-Dropdown.
 * EN: Creates the list in the assigned-to dropdown.
 */
function renderTaskContactDropdown() {
  let html = "";
  for (let i = 0; i < taskFormState.contacts.length; i++) {
    const contact = taskFormState.contacts[i];
    const selected = isTaskContactSelected(contact.id);
    html += getAssignedContactTemplate(contact, selected, isOwnTaskContact(contact));
  }
  taskContactDropdown.innerHTML = html;
  filterTaskContacts();
}


/**
 * DE: Filtert das Assigned-to-Dropdown anhand der Eingabe.
 * EN: Filters the assigned-to dropdown using the entered text.
 */
function filterTaskContacts() {
  const search = taskAssignedSearch.value.trim().toLowerCase();
  const options = taskContactDropdown.querySelectorAll(".task-contact-option");
  for (let i = 0; i < options.length; i++) {
    const name = options[i].getAttribute("data-contact-name") || "";
    options[i].hidden = Boolean(search && !name.includes(search));
  }
}


/**
 * DE: Öffnet das Assigned-to-Dropdown.
 * EN: Opens the assigned-to dropdown.
 */
function openTaskContactDropdown() {
  taskContactDropdown.hidden = false;
  if (taskAssignedToggle) taskAssignedToggle.setAttribute("aria-expanded", "true");
  filterTaskContacts();
}


/**
 * DE: Schließt das Assigned-to-Dropdown.
 * EN: Closes the assigned-to dropdown.
 */
function closeTaskContactDropdown() {
  taskContactDropdown.hidden = true;
  if (taskAssignedToggle) taskAssignedToggle.setAttribute("aria-expanded", "false");
}


/**
 * DE: Öffnet oder schließt das Assigned-to-Dropdown.
 * EN: Opens or closes the assigned-to dropdown.
 */
function toggleTaskContactDropdown() {
  if (taskContactDropdown.hidden) openTaskContactDropdown();
  else closeTaskContactDropdown();
}


/**
 * DE: Schließt das Assigned-to-Dropdown bei einem Klick außerhalb.
 * EN: Closes the assigned-to dropdown when clicking outside.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function closeTaskDropdownOutside(event) {
  const dropdown = document.getElementById("taskAssignedDropdown");
  if (dropdown && !dropdown.contains(event.target)) closeTaskContactDropdown();
}


/**
 * DE: Sucht einen Kontakt in der Formularliste.
 * EN: Finds a contact in the form contact list.
 * @param {string} contactId - DE: Kontakt-ID. EN: Contact id.
 * @returns {object|null} DE: Kontakt. EN: Contact.
 */
function findFormContact(contactId) {
  for (let i = 0; i < taskFormState.contacts.length; i++) {
    if (String(taskFormState.contacts[i].id) === String(contactId)) return taskFormState.contacts[i];
  }
  return null;
}


/**
 * DE: Rendert die Avatare der ausgewählten Kontakte.
 * EN: Renders the avatars of selected contacts.
 */
function renderTaskSelectedContacts() {
  let html = "";
  for (let i = 0; i < taskFormState.selectedContactIds.length; i++) {
    const contact = findFormContact(taskFormState.selectedContactIds[i]);
    if (contact) html += getTaskAvatarTemplate(contact);
  }
  taskSelectedContacts.innerHTML = html;
}


/**
 * DE: Entfernt oder ergänzt eine Kontakt-ID in der Auswahl.
 * EN: Removes or adds a contact id in the selection.
 * @param {string} contactId - DE: Kontakt-ID. EN: Contact id.
 * @param {boolean} checked - DE: Checkboxstatus. EN: Checkbox state.
 */
function updateTaskContactSelection(contactId, checked) {
  const id = String(contactId);
  const index = taskFormState.selectedContactIds.indexOf(id);
  if (checked && index < 0) taskFormState.selectedContactIds.push(id);
  if (!checked && index >= 0) taskFormState.selectedContactIds.splice(index, 1);
  renderTaskSelectedContacts();
}


/**
 * DE: Verarbeitet eine Checkbox im Assigned-to-Dropdown.
 * EN: Handles a checkbox in the assigned-to dropdown.
 * @param {Event} event - DE: Änderungsereignis. EN: Change event.
 */
function handleTaskContactChange(event) {
  const checkbox = event.target.closest("[data-contact-id]");
  if (!checkbox) return;
  updateTaskContactSelection(checkbox.getAttribute("data-contact-id"), checkbox.checked);
}
