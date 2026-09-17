const contactDialog = document.getElementById("contactDialog");
const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactPhone = document.getElementById("contactPhone");
const contactSubmitButton = document.getElementById("contactSubmitButton");

/**
 * DE: Zeigt das passende Profilbild im Kontaktdialog an.
 * EN: Shows the correct profile image in the contact dialog.
 * @param {object|null} contact - DE: Kontakt. EN: Contact.
 */
function renderDialogAvatar(contact) {
  const avatar = document.getElementById("contactDialogAvatar");
  if (!contact) {
    avatar.innerHTML = '<img src="./assets/icons/profil.png" alt="" aria-hidden="true" />';
    return;
  }
  avatar.innerHTML = getContactDialogAvatarTemplate(contact);
}


/**
 * DE: Setzt die Texte des Kontaktformulars passend zum Modus.
 * EN: Sets the contact form texts according to the mode.
 * @param {string} mode - DE: Dialogmodus. EN: Dialog mode.
 */
function setContactDialogTexts(mode) {
  if (mode === "add") {
    setAddContactTexts();
    return;
  }
  setEditContactTexts();
}


/**
 * DE: Setzt die Texte für einen neuen Kontakt.
 * EN: Sets the texts for a new contact.
 */
function setAddContactTexts() {
  document.getElementById("contactDialogTitle").textContent = "Add contact";
  document.getElementById("contactDialogSubtitle").textContent = "Tasks are better with a team!";
  document.getElementById("contactSubmitLabel").textContent = "Create contact";
  document.getElementById("contactCancelLabel").textContent = "Cancel";
}


/**
 * DE: Setzt die Texte für das Bearbeiten eines Kontakts.
 * EN: Sets the texts for editing a contact.
 */
function setEditContactTexts() {
  document.getElementById("contactDialogTitle").textContent = "Edit contact";
  document.getElementById("contactDialogSubtitle").textContent = "";
  document.getElementById("contactSubmitLabel").textContent = "Save";
  document.getElementById("contactCancelLabel").textContent = "Delete";
}


/**
 * DE: Setzt das Symbol des zweiten Dialogbuttons passend zum Modus.
 * EN: Sets the secondary dialog button icon according to the mode.
 * @param {string} mode - DE: Dialogmodus. EN: Dialog mode.
 */
function setContactDialogSecondaryIcon(mode) {
  const icon = document.getElementById("contactCancelIcon");
  icon.src = "./assets/icons/delete.png";
  if (mode === "add") icon.src = "./assets/icons/close.png";
}


/**
 * DE: Füllt die Eingabefelder des Kontaktdialogs.
 * EN: Fills the input fields of the contact dialog.
 * @param {object|null} contact - DE: Kontakt. EN: Contact.
 */
function fillContactDialogInputs(contact) {
  clearContactDialogInputs();
  if (!contact) return;
  contactName.value = contact.name;
  contactEmail.value = contact.email;
  contactPhone.value = contact.phone;
}


/**
 * DE: Leert die Eingabefelder im Kontaktdialog.
 * EN: Clears the contact dialog input fields.
 */
function clearContactDialogInputs() {
  contactName.value = "";
  contactEmail.value = "";
  contactPhone.value = "";
}


/**
 * DE: Bereitet den Kontaktdialog für Hinzufügen oder Bearbeiten vor.
 * EN: Prepares the contact dialog for adding or editing.
 * @param {string} mode - DE: Dialogmodus. EN: Dialog mode.
 * @param {object|null} contact - DE: Kontakt. EN: Contact.
 */
function fillContactDialog(mode, contact = null) {
  contactState.dialogMode = mode;
  contactState.editingId = null;
  if (contact) contactState.editingId = contact.id;
  setContactDialogTexts(mode);
  setContactDialogSecondaryIcon(mode);
  fillContactDialogInputs(contact);
  renderDialogAvatar(contact);
}


/**
 * DE: Setzt den Fokus auf das Namensfeld.
 * EN: Focuses the name field.
 */
function focusContactName() {
  contactName.focus({ preventScroll: true });
}


/**
 * DE: Öffnet den animierten Kontaktdialog.
 * EN: Opens the animated contact dialog.
 * @param {string} mode - DE: Dialogmodus. EN: Dialog mode.
 * @param {object|null} contact - DE: Kontakt. EN: Contact.
 */
function openContactDialog(mode, contact = null) {
  clearContactFormErrors();
  fillContactDialog(mode, contact);
  showContactDialog();
}


/**
 * DE: Startet die sichtbare Dialoganimation.
 * EN: Starts the visible dialog animation.
 */
async function showContactDialog() {
  showFloatingDialog(contactDialog);
  const animation = contactDialog.floatingAnimation;
  try {
    await animation.finished;
    if (contactDialog.open && contactDialog.floatingAnimation === animation) focusContactName();
  } catch { /* DE: Abgebrochene Einfahrt erhält keinen Fokus. EN: Cancelled entrance does not receive focus. */ }
}


/**
 * DE: Schließt den animierten Kontaktdialog.
 * EN: Closes the animated contact dialog.
 */
function closeContactDialog() {
  return closeFloatingDialog(contactDialog);
}


/**
 * DE: Erstellt eine lokale ID für einen Gastkontakt.
 * EN: Creates a local id for a guest contact.
 * @returns {string} DE: Kontakt-ID. EN: Contact id.
 */
function createGuestContactId() {
  const randomPart = Math.random().toString(16).slice(2);
  return "guest-" + Date.now() + "-" + randomPart;
}


/**
 * DE: Speichert einen Kontakt nur in der lokalen Gastansicht.
 * EN: Stores a contact only in the local guest view.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {object} DE: Gespeicherter Kontakt. EN: Stored contact.
 */
function saveGuestContact(contact) {
  if (contactState.dialogMode === "add") contact.id = createGuestContactId();
  const index = getContactIndex(contact.id);
  if (index >= 0) contactState.contacts[index] = contact;
  else contactState.contacts.push(contact);
  saveGuestContacts();
  return contact;
}


/**
 * DE: Aktualisiert die lokale Sitzung nach einer Profiländerung.
 * EN: Updates the local session after a profile change.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function updateCurrentUserSession(user) {
  if (!user || isGuestContactMode()) return;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  updateUserInitials();
}


/**
 * DE: Speichert einen bearbeiteten echten Kontakt und sein Benutzerprofil.
 * EN: Stores an edited real contact and its user profile.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {Promise<object>} DE: Kontakt. EN: Contact.
 */
async function updateRealContact(contact) {
  await updateContact(contact.id, contact);
  if (!contact.isRegistered || !contact.userId) return contact;
  const user = await updateUserProfile(contact.userId, contact);
  if (isOwnRegisteredContact(contact)) updateCurrentUserSession(user);
  return contact;
}


/**
 * DE: Speichert einen Kontakt passend zum aktuellen Zugangsmodus.
 * EN: Stores a contact according to the current access mode.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {Promise<object>|object} DE: Kontakt. EN: Contact.
 */
async function saveContact(contact) {
  if (isGuestContactMode()) return saveGuestContact(contact);
  if (contactState.dialogMode === "add") return createContact(contact);
  return updateRealContact(contact);
}


/**
 * DE: Bestimmt die Erfolgsmeldung nach dem Speichern.
 * EN: Determines the success message after saving.
 * @param {boolean} ownProfile - DE: Eigenes Profil. EN: Own profile.
 * @returns {string} DE: Meldung. EN: Message.
 */
function getContactSaveMessage(ownProfile) {
  if (contactState.dialogMode === "add") return "Contact successfully created.";
  if (ownProfile) return "Profile successfully updated.";
  return "Contact successfully updated.";
}


/**
 * DE: Aktualisiert die Ansicht nach erfolgreichem Speichern.
 * EN: Updates the view after successful saving.
 * @param {object} draft - DE: Kontaktentwurf. EN: Contact draft.
 * @returns {Promise<void>}
 */
async function storeContactDraft(draft) {
  const ownProfile = !isGuestContactMode() && isOwnRegisteredContact(draft);
  const savedContact = await saveContact(draft);
  contactState.selectedId = savedContact.id;
  await refreshContacts();
  closeContactDialog();
  showContactToast(getContactSaveMessage(ownProfile));
}


/**
 * DE: Zeigt die Rückmeldung für eine doppelte E-Mail-Adresse.
 * EN: Shows feedback for a duplicate email address.
 */
function showDuplicateContactError() {
  const message = "A contact with this email address already exists.";
  showContactFieldError(contactEmail, message);
  showContactToast(message);
  contactEmail.focus();
}


/**
 * DE: Verarbeitet das Absenden des Kontaktformulars.
 * EN: Handles the contact form submission.
 * @param {SubmitEvent} event - DE: Formularereignis. EN: Form event.
 * @returns {Promise<void>}
 */
async function handleContactSubmit(event) {
  event.preventDefault();
  if (!validateContactForm()) return;
  const draft = createContactDraft();
  if (hasDuplicateContactEmail(draft.email, draft.id)) return showDuplicateContactError();
  contactSubmitButton.disabled = true;
  try {
    await storeContactDraft(draft);
  } catch {
    showContactToast("Could not save the contact. Please try again.");
  }
  contactSubmitButton.disabled = false;
}


/**
 * DE: Formatiert die Telefonnummer beim Verlassen des Feldes.
 * EN: Formats the phone number when leaving the field.
 */
function formatPhoneField() {
  if (!contactPhone.value) return;
  if (!isContactPhoneValid(contactPhone.value)) return;
  contactPhone.value = formatContactPhone(contactPhone.value);
}


/**
 * DE: Verarbeitet den zweiten Dialogbutton für Abbrechen oder Löschen.
 * EN: Handles the secondary dialog button for cancel or delete.
 */
async function handleContactSecondaryAction() {
  if (contactState.dialogMode === "add") {
    closeContactDialog();
    return;
  }
  await closeContactDialog();
  deleteSelectedContact();
}


/**
 * DE: Wechselt das Löschsymbol im Bearbeitungsdialog.
 * EN: Changes the delete icon in the edit dialog.
 * @param {boolean} useHover - DE: Hoverzustand. EN: Hover state.
 */
function updateDialogSecondaryIcon(useHover) {
  if (contactState.dialogMode !== "edit") return;
  const icon = document.getElementById("contactCancelIcon");
  icon.src = "./assets/icons/delete.png";
  if (useHover) icon.src = "./assets/icons/delete-hover.png";
}


/**
 * DE: Zeigt das Hover-Symbol des zweiten Dialogbuttons.
 * EN: Shows the hover icon of the secondary dialog button.
 */
function showDialogSecondaryHover() {
  updateDialogSecondaryIcon(true);
}


/**
 * DE: Stellt das normale Symbol des zweiten Dialogbuttons wieder her.
 * EN: Restores the normal icon of the secondary dialog button.
 */
function hideDialogSecondaryHover() {
  updateDialogSecondaryIcon(false);
}


/**
 * DE: Verhindert das direkte Schließen des Dialogs mit Escape.
 * EN: Prevents the dialog from closing directly with Escape.
 * @param {Event} event - DE: Dialogereignis. EN: Dialog event.
 */
function handleContactDialogCancel(event) {
  event.preventDefault();
  closeContactDialog();
}


/**
 * DE: Initialisiert die Ereignisse des Kontaktformulars.
 * EN: Initializes the contact form events.
 */
function initializeContactFormEvents() {
  const secondaryButton = document.getElementById("contactCancelButton");
  document.getElementById("contactDialogClose").addEventListener("click", closeContactDialog);
  secondaryButton.addEventListener("click", handleContactSecondaryAction);
  secondaryButton.addEventListener("mouseenter", showDialogSecondaryHover);
  secondaryButton.addEventListener("mouseleave", hideDialogSecondaryHover);
  contactForm.addEventListener("submit", handleContactSubmit);
  contactPhone.addEventListener("blur", formatPhoneField);
  contactDialog.addEventListener("cancel", handleContactDialogCancel);
}
