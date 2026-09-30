const contactDialog = document.getElementById("contactDialog");
const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactPhone = document.getElementById("contactPhone");
const contactPhoneCode = document.getElementById("contactPhoneCode");
const contactSubmitButton = document.getElementById("contactSubmitButton");

/**
 * DE: Zeigt das passende Profilbild im Kontaktdialog an.
 * EN: Shows the correct profile image in the contact dialog.
 * @param {object|null} contact - DE: Kontakt. EN: Contact.
 */
function renderDialogAvatar(contact) {
  const avatar = document.getElementById("contactDialogAvatar");
  avatar.innerHTML = contact
    ? getContactDialogAvatarTemplate(contact)
    : getContactDialogPlaceholderTemplate();
}

/**
 * DE: Setzt die Texte des Kontaktformulars passend zum Modus.
 * EN: Sets the contact form texts according to the mode.
 * @param {string} mode - DE: Dialogmodus. EN: Dialog mode.
 */
function setContactDialogTexts(mode) {
  document.getElementById("contactDialogTitle").textContent =
    mode === "add" ? "Add contact" : "Edit contact";
  document.getElementById("contactDialogSubtitle").textContent =
    mode === "add" ? "Tasks are better with a team!" : "";
  document.getElementById("contactSubmitLabel").textContent =
    mode === "add" ? "Create contact" : "Save";
  document.getElementById("contactCancelLabel").textContent =
    mode === "add" ? "Cancel" : "Delete";
}

/**
 * DE: Setzt das Symbol des zweiten Dialogbuttons passend zum Modus.
 * EN: Sets the secondary dialog button icon according to the mode.
 * @param {string} mode - DE: Dialogmodus. EN: Dialog mode.
 */
function setContactDialogSecondaryIcon(mode) {
  const icon = document.getElementById("contactCancelIcon");
  icon.src =
    mode === "add" ? "./assets/icons/close.svg" : "./assets/icons/delete.svg";
}

/**
 * DE: Füllt die Eingabefelder des Kontaktdialogs.
 * EN: Fills the input fields of the contact dialog.
 * @param {object|null} contact - DE: Kontakt. EN: Contact.
 */
function fillContactDialogInputs(contact) {
  contactName.value = contact ? contact.name : "";
  contactEmail.value = contact ? contact.email : "";
  fillContactPhoneFields(contact ? contact.phone : "");
}

/**
 * DE: Wählt eine Ländervorwahl aus und ergänzt sie, falls sie in der Liste fehlt.
 * EN: Selects a country code and adds it when it is missing from the list.
 * @param {string} code - DE: Ländervorwahl wie "+49". EN: Country code like "+49".
 */
function selectContactPhoneCode(code) {
  if (!getContactPhoneCodes().includes(code))
    contactPhoneCode.add(new Option(code, code));
  contactPhoneCode.value = code;
}

/**
 * DE: Verteilt eine Telefonnummer auf Vorwahl-Auswahl und Rufnummernfeld.
 * EN: Distributes a phone number to the code select and the number field.
 * @param {string} phone - DE: Telefonnummer. EN: Phone number.
 */
function fillContactPhoneFields(phone) {
  const parts = splitContactPhone(phone);
  selectContactPhoneCode(parts.code);
  contactPhone.value = parts.number;
}

/**
 * DE: Bereitet den Kontaktdialog für Hinzufügen oder Bearbeiten vor.
 * EN: Prepares the contact dialog for adding or editing.
 * @param {string} mode - DE: Dialogmodus. EN: Dialog mode.
 * @param {object|null} contact - DE: Kontakt. EN: Contact.
 */
function fillContactDialog(mode, contact = null) {
  contactState.dialogMode = mode;
  contactDialog.dataset.mode = mode;
  contactState.editingId = contact ? contact.id : null;
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
  openFloatingDialog(contactDialog).then((opened) => {
    if (opened && contactDialog.open) focusContactName();
  });
}

/**
 * DE: Schließt den animierten Kontaktdialog.
 * EN: Closes the animated contact dialog.
 */
function closeContactDialog() {
  return closeFloatingDialog(contactDialog);
}

/**
 * DE: Aktualisiert die lokale Sitzung nach einer Profiländerung.
 * EN: Updates the local session after a profile change.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function updateCurrentUserSession(user) {
  if (!user) return;
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
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
 * DE: Speichert einen Kontakt in der gemeinsamen Datenbank.
 * EN: Stores a contact in the shared database.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {Promise<object>} DE: Kontakt. EN: Contact.
 */
async function saveContact(contact) {
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
  const ownProfile = isOwnRegisteredContact(draft);
  const savedContact = await saveContact(draft);
  contactState.selectedId = savedContact.id;
  await refreshContacts();
  closeContactDialog();
  showToast(getContactSaveMessage(ownProfile));
}

/**
 * DE: Zeigt die Rückmeldung für eine doppelte E-Mail-Adresse.
 * EN: Shows feedback for a duplicate email address.
 */
function showDuplicateContactError() {
  showContactFieldError(contactEmail, "Email already in use.");
  showToast("A contact with this email address already exists.");
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
  if (hasDuplicateContactEmail(draft.email, draft.id))
    return showDuplicateContactError();
  contactSubmitButton.disabled = true;
  try {
    await storeContactDraft(draft);
  } catch {
    showToast("Could not save the contact. Please try again.");
  }
  contactSubmitButton.disabled = false;
}

/**
 * DE: Formatiert die Telefonnummer beim Verlassen des Feldes.
 * EN: Formats the phone number when leaving the field.
 */
function formatPhoneField() {
  if (contactPhone.value.trim().startsWith("+"))
    fillContactPhoneFields(contactPhone.value);
  if (!isContactPhoneValid(contactPhone.value)) return;
  contactPhone.value = normalizeContactPhone(contactPhone.value);
}

/**
 * DE: Prüft das Namensfeld beim Verlassen.
 * EN: Validates the name field on blur.
 */
function handleContactNameBlur() {
  revalidateContactField(contactName, validateContactName);
}

/**
 * DE: Prüft das markierte Namensfeld während der Eingabe.
 * EN: Revalidates the marked name field while typing.
 */
function handleContactNameInput() {
  revalidateMarkedContactField(contactName, validateContactName);
}

/**
 * DE: Prüft das E-Mail-Feld beim Verlassen.
 * EN: Validates the email field on blur.
 */
function handleContactEmailBlur() {
  revalidateContactField(contactEmail, validateContactEmail);
}

/**
 * DE: Prüft das markierte E-Mail-Feld während der Eingabe.
 * EN: Revalidates the marked email field while typing.
 */
function handleContactEmailInput() {
  revalidateMarkedContactField(contactEmail, validateContactEmail);
}

/**
 * DE: Formatiert und prüft die Rufnummer beim Verlassen des Feldes.
 * EN: Formats and validates the phone number on blur.
 */
function handleContactPhoneBlur() {
  formatPhoneField();
  revalidateContactField(contactPhone, validateContactPhone);
}

/**
 * DE: Prüft das markierte Telefonfeld während der Eingabe.
 * EN: Revalidates the marked phone field while typing.
 */
function handleContactPhoneInput() {
  revalidateMarkedContactField(contactPhone, validateContactPhone);
}

/**
 * DE: Verbindet die Eingabefelder mit der Live-Validierung.
 * EN: Connects the input fields with the live validation.
 */
function initializeContactLiveValidation() {
  contactName.addEventListener("blur", handleContactNameBlur);
  contactName.addEventListener("input", handleContactNameInput);
  contactEmail.addEventListener("blur", handleContactEmailBlur);
  contactEmail.addEventListener("input", handleContactEmailInput);
  contactPhone.addEventListener("blur", handleContactPhoneBlur);
  contactPhone.addEventListener("input", handleContactPhoneInput);
}

/**
 * DE: Verarbeitet den zweiten Dialogbutton für Abbrechen oder Löschen.
 * EN: Handles the secondary dialog button for cancel or delete.
 */
function handleContactSecondaryAction() {
  if (contactState.dialogMode === "add") {
    closeContactDialog();
    return;
  }
  closeContactDialog().then((closed) => {
    if (closed) deleteSelectedContact();
  });
}

/**
 * DE: Wechselt das Löschsymbol im Bearbeitungsdialog.
 * EN: Changes the delete icon in the edit dialog.
 * @param {boolean} useHover - DE: Hoverzustand. EN: Hover state.
 */
function updateDialogSecondaryIcon(useHover) {
  if (contactState.dialogMode !== "edit") return;
  const icon = document.getElementById("contactCancelIcon");
  icon.src = useHover
    ? "./assets/icons/delete_hover.svg"
    : "./assets/icons/delete.svg";
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
 * DE: Initialisiert die Ereignisse des Kontaktformulars.
 * EN: Initializes the contact form events.
 */
function initializeContactFormEvents() {
  const secondaryButton = document.getElementById("contactCancelButton");
  document
    .getElementById("contactDialogClose")
    .addEventListener("click", closeContactDialog);
  secondaryButton.addEventListener("click", handleContactSecondaryAction);
  secondaryButton.addEventListener("mouseenter", showDialogSecondaryHover);
  secondaryButton.addEventListener("mouseleave", hideDialogSecondaryHover);
  contactForm.addEventListener("submit", handleContactSubmit);
  initializeContactLiveValidation();
}
