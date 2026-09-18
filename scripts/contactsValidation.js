/**
 * DE: Erstellt Initialen aus dem ersten und letzten Namen.
 * EN: Creates initials from the first and last name.
 * @param {string} name - DE: Vollständiger Name. EN: Full name.
 * @returns {string} DE: Initialen. EN: Initials.
 */
function createContactInitials(name) {
  const names = name.trim().split(/\s+/);
  const firstLetter = names[0].charAt(0);
  const lastLetter = names[names.length - 1].charAt(0);
  return (firstLetter + lastLetter).toUpperCase();
}


/**
 * DE: Prüft, ob Vor- und Nachname eingegeben wurden.
 * EN: Checks whether first and last name were entered.
 * @param {string} name - DE: Name. EN: Name.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isContactNameValid(name) {
  const names = name.trim().split(/\s+/);
  return names.length >= 2;
}


/**
 * DE: Prüft eine E-Mail-Adresse.
 * EN: Checks an email address.
 * @param {string} email - DE: E-Mail-Adresse. EN: Email address.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isContactEmailValid(email) {
  return /^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email.trim());
}


/**
 * DE: Entfernt überflüssige Leerzeichen aus der Telefonnummer.
 * EN: Removes unnecessary spaces from the phone number.
 * @param {string} value - DE: Telefonnummer. EN: Phone number.
 * @returns {string} DE: Bereinigte Telefonnummer. EN: Cleaned phone number.
 */
function normalizeContactPhone(value) {
  return value.trim().replace(/\s+/g, " ");
}


/**
 * DE: Prüft Ländercode, Vorwahl und Rufnummer.
 * EN: Checks country code, area code and phone number.
 * @param {string} value - DE: Telefonnummer. EN: Phone number.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isContactPhoneValid(value) {
  const phone = normalizeContactPhone(value);
  return /^\+\d{1,3} \d{2,5} \d{3,12}$/.test(phone);
}


/**
 * DE: Formatiert eine gültige Telefonnummer für die Speicherung.
 * EN: Formats a valid phone number for storage.
 * @param {string} value - DE: Telefonnummer. EN: Phone number.
 * @returns {string} DE: Formatierte Telefonnummer. EN: Formatted phone number.
 */
function formatContactPhone(value) {
  return normalizeContactPhone(value);
}


/**
 * DE: Zeigt einen Validierungsfehler an einem Feld an.
 * EN: Shows a validation error on one field.
 * @param {HTMLInputElement} input - DE: Eingabefeld. EN: Input field.
 * @param {string} message - DE: Fehlermeldung. EN: Error message.
 */
function showContactFieldError(input, message) {
  document.getElementById(input.id + "Error").textContent = message;
  input.classList.add("input-error");
}


/**
 * DE: Entfernt den Validierungsfehler eines Feldes.
 * EN: Clears the validation error of one field.
 * @param {HTMLInputElement} input - DE: Eingabefeld. EN: Input field.
 */
function clearContactFieldError(input) {
  document.getElementById(input.id + "Error").textContent = "";
  input.classList.remove("input-error");
}


/**
 * DE: Entfernt alle Fehlermeldungen aus dem Kontaktformular.
 * EN: Clears all error messages from the contact form.
 */
function clearContactFormErrors() {
  clearContactFieldError(contactName);
  clearContactFieldError(contactEmail);
  clearContactFieldError(contactPhone);
  document.getElementById("contactFormMessage").textContent = "";
}


/**
 * DE: Prüft, ob die Telefonnummer im aktuellen Dialog Pflicht ist.
 * EN: Checks whether the phone number is required in the current dialog.
 * @returns {boolean} DE: Pflichtstatus. EN: Required status.
 */
function isPhoneRequired() {
  const contact = getContactFromState(contactState.editingId);
  if (contactState.dialogMode === "add") return true;
  return Boolean(contact && !contact.isRegistered);
}


/**
 * DE: Prüft das Namensfeld und zeigt bei Bedarf einen Fehler.
 * EN: Checks the name field and shows an error when needed.
 */
function validateContactName() {
  if (isContactNameValid(contactName.value)) return;
  showContactFieldError(contactName, "Please enter a first and last name.");
}


/**
 * DE: Prüft das E-Mail-Feld und zeigt bei Bedarf einen Fehler.
 * EN: Checks the email field and shows an error when needed.
 */
function validateContactEmail() {
  if (isContactEmailValid(contactEmail.value)) return;
  showContactFieldError(contactEmail, "Enter a valid email address.");
}


/**
 * DE: Zeigt die Fehlermeldung für die Telefonnummer an.
 * EN: Shows the phone number error message.
 */
function showPhoneError() {
  showContactFieldError(contactPhone, "Use the format +49 176 47110815.");
}


/**
 * DE: Prüft das Telefonnummernfeld und zeigt bei Bedarf einen Fehler.
 * EN: Checks the phone field and shows an error when needed.
 */
function validateContactPhone() {
  if (!contactPhone.value && !isPhoneRequired()) return;
  if (isContactPhoneValid(contactPhone.value)) return;
  showPhoneError();
}


/**
 * DE: Prüft alle Felder des Kontaktformulars.
 * EN: Validates all fields of the contact form.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function validateContactForm() {
  clearContactFormErrors();
  validateContactName();
  validateContactEmail();
  validateContactPhone();
  return !contactForm.querySelector(".input-error");
}


/**
 * DE: Prüft, ob eine E-Mail-Adresse bereits verwendet wird.
 * EN: Checks whether an email address is already in use.
 * @param {string} email - DE: E-Mail-Adresse. EN: Email address.
 * @param {string|null} ignoredId - DE: Zu ignorierende Kontakt-ID. EN: Contact id to ignore.
 * @returns {boolean} DE: Doppelter Eintrag. EN: Duplicate entry.
 */
function hasDuplicateContactEmail(email, ignoredId = null) {
  const normalizedEmail = normalizeEmail(email);
  for (let i = 0; i < contactState.contacts.length; i++) {
    const contact = contactState.contacts[i];
    if (contact.id === ignoredId) continue;
    if (normalizeEmail(contact.email) === normalizedEmail) return true;
  }
  return false;
}


/**
 * DE: Übernimmt geschützte Daten eines bestehenden Kontakts.
 * EN: Copies protected data from an existing contact.
 * @param {object} draft - DE: Kontaktentwurf. EN: Contact draft.
 * @param {object|null} existing - DE: Bestehender Kontakt. EN: Existing contact.
 */
function addExistingContactData(draft, existing) {
  if (!existing) return;
  draft.id = existing.id;
  draft.color = existing.color;
  draft.isRegistered = existing.isRegistered;
  draft.userId = existing.userId;
}


/**
 * DE: Erstellt die Formulardaten für einen Kontakt.
 * EN: Creates the form data for a contact.
 * @returns {object} DE: Kontaktentwurf. EN: Contact draft.
 */
function createContactDraft() {
  const existing = getContactFromState(contactState.editingId);
  const draft = createBasicContactDraft();
  addExistingContactData(draft, existing);
  return draft;
}


/**
 * DE: Erstellt die frei änderbaren Daten eines Kontaktentwurfs.
 * EN: Creates the editable data of a contact draft.
 * @returns {object} DE: Kontaktentwurf. EN: Contact draft.
 */
function createBasicContactDraft() {
  return {
    name: contactName.value.trim(),
    email: normalizeEmail(contactEmail.value),
    phone: getContactDraftPhone(),
    initials: createContactInitials(contactName.value),
    color: getAvatarColorByName(contactName.value),
    isRegistered: false,
    userId: null,
  };
}


/**
 * DE: Gibt die formatierte Telefonnummer aus dem Kontaktformular zurück.
 * EN: Returns the formatted phone number from the contact form.
 * @returns {string} DE: Telefonnummer. EN: Phone number.
 */
function getContactDraftPhone() {
  if (!contactPhone.value) return "";
  return formatContactPhone(contactPhone.value);
}
