/**
 * DE: Blendet den Kontakt-Toast vollständig aus.
 * EN: Completely hides the contacts toast.
 */
function finishHideContactToast() {
  document.getElementById("contactsToast").hidden = true;
}


/**
 * DE: Blendet den Kontakt-Toast aus.
 * EN: Hides the contacts toast.
 */
function hideContactToast() {
  const toast = document.getElementById("contactsToast");
  toast.classList.remove("contacts-toast--visible");
  window.setTimeout(finishHideContactToast, 120);
}


/**
 * DE: Zeigt eine kurze Rückmeldung als Toast an.
 * EN: Shows a short feedback message as a toast.
 * @param {string} message - DE: Meldung. EN: Message.
 * @param {number} duration - DE: Anzeigedauer. EN: Display duration.
 */
function showContactToast(message, duration = 2200) {
  const toast = document.getElementById("contactsToast");
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("contacts-toast--visible");
  window.clearTimeout(showContactToast.timer);
  showContactToast.timer = window.setTimeout(hideContactToast, duration);
}


/**
 * DE: Sucht den Index eines Kontakts in der lokalen Liste.
 * EN: Finds the index of a contact in the local list.
 * @param {string} contactId - DE: Kontakt-ID. EN: Contact id.
 * @returns {number} DE: Index oder -1. EN: Index or -1.
 */
function getContactIndex(contactId) {
  for (let i = 0; i < contactState.contacts.length; i++) {
    if (contactState.contacts[i].id === contactId) return i;
  }
  return -1;
}


/**
 * DE: Löscht einen Kontakt nur aus der lokalen Gastansicht.
 * EN: Deletes a contact only from the local guest view.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 */
function deleteGuestContact(contact) {
  const index = getContactIndex(contact.id);
  if (index < 0) return;
  contactState.contacts.splice(index, 1);
  saveGuestContacts();
}


/**
 * DE: Meldet den Benutzer nach der eigenen Kontolöschung ab.
 * EN: Logs the user out after deleting the own account.
 */
function finishOwnAccountDeletion() {
  localStorage.removeItem(USER_MODE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "./index.html";
}


/**
 * DE: Zeigt die Rückmeldung nach einer erfolgreichen Löschung.
 * EN: Shows feedback after a successful deletion.
 * @param {boolean} ownAccount - DE: Eigenes Konto. EN: Own account.
 */
function showDeleteFeedback(ownAccount) {
  if (!ownAccount) {
    showContactToast("Contact successfully deleted.");
    return;
  }
  showContactToast("Account successfully deleted. Please register again to continue.", 2800);
  window.setTimeout(finishOwnAccountDeletion, 2900);
}


/**
 * DE: Aktualisiert die Ansicht nach einer erfolgreichen Löschung.
 * EN: Updates the view after a successful deletion.
 * @param {boolean} ownAccount - DE: Eigenes Konto. EN: Own account.
 * @returns {Promise<void>}
 */
async function finishContactDeletion(ownAccount) {
  contactState.selectedId = null;
  await refreshContacts();
  showDeleteFeedback(ownAccount);
}


/**
 * DE: Löscht den ausgewählten Kontakt entsprechend der Berechtigung.
 * EN: Deletes the selected contact according to the permission.
 * @returns {Promise<void>}
 */
async function deleteSelectedContact() {
  const contact = getSelectedContact();
  if (!contact || !canManageContact(contact)) return;
  const ownAccount = !isGuestContactMode() && isOwnRegisteredContact(contact);
  try {
    if (isGuestContactMode()) deleteGuestContact(contact);
    else await deleteContactWithRelations(contact);
    await finishContactDeletion(ownAccount);
  } catch {
    showContactToast("Could not delete the contact. Please try again.");
  }
}


/**
 * DE: Öffnet den Bearbeitungsdialog für den ausgewählten Kontakt.
 * EN: Opens the edit dialog for the selected contact.
 */
function editSelectedContact() {
  const contact = getSelectedContact();
  if (!contact || !canManageContact(contact)) return;
  openContactDialog("edit", contact);
}


/**
 * DE: Wechselt das Symbol eines Detailbuttons.
 * EN: Changes the icon of a detail button.
 * @param {HTMLElement} button - DE: Button. EN: Button.
 * @param {boolean} useHover - DE: Hoverzustand. EN: Hover state.
 */
function setContactActionIcon(button, useHover) {
  const image = button.querySelector("img[data-hover-icon]");
  if (!image) return;
  const attribute = useHover ? "data-hover-icon" : "data-default-icon";
  image.src = image.getAttribute(attribute);
}


/**
 * DE: Zeigt das Hover-Symbol eines Detailbuttons.
 * EN: Shows the hover icon of a detail button.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function showContactActionHover(event) {
  setContactActionIcon(event.currentTarget, true);
}


/**
 * DE: Stellt das Standardsymbol eines Detailbuttons wieder her.
 * EN: Restores the default icon of a detail button.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function hideContactActionHover(event) {
  setContactActionIcon(event.currentTarget, false);
}


/**
 * DE: Verknüpft einen Detailbutton mit seinen Hoverereignissen.
 * EN: Connects a detail button with its hover events.
 * @param {HTMLElement} button - DE: Button. EN: Button.
 */
function initializeContactActionHover(button) {
  if (!button) return;
  button.addEventListener("mouseenter", showContactActionHover);
  button.addEventListener("mouseleave", hideContactActionHover);
}


/**
 * DE: Initialisiert die Buttons der Kontakt-Detailansicht.
 * EN: Initializes the buttons of the contact detail view.
 */
function initializeContactDetailEvents() {
  const editButton = contactDetail.querySelector('[data-contact-action="edit"]');
  const deleteButton = contactDetail.querySelector('[data-contact-action="delete"]');
  if (editButton) editButton.addEventListener("click", editSelectedContact);
  if (deleteButton) deleteButton.addEventListener("click", deleteSelectedContact);
  initializeContactActionHover(editButton);
  initializeContactActionHover(deleteButton);
}
