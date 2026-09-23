const signUpForm = document.getElementById("signUpForm");
const signUpButton = document.getElementById("registerButton");
const signUpName = document.getElementById("signUpName");
const signUpEmail = document.getElementById("signUpEmail");
const signUpPassword = document.getElementById("signUpPassword");
const repeatPassword = document.getElementById("repeatPassword");
const privacyAccepted = document.getElementById("privacyAccepted");
const signUpMessage = document.getElementById("signUpMessage");
const SIGN_UP_EMAIL_KEY = "joinRegisteredEmail";

/**
 * DE: Erstellt Initialen aus erstem und letztem Namen.
 * EN: Creates initials from the first and last name.
 * @param {string} name - DE: Name. EN: Name.
 * @returns {string} DE: Initialen. EN: Initials.
 */
function createInitials(name) {
  const names = name.trim().split(/\s+/);
  const firstLetter = names[0][0];
  const lastLetter = names[names.length - 1][0];
  return (firstLetter + lastLetter).toUpperCase();
}


/**
 * DE: Entfernt die Fehlermarkierung eines Registrierungsfeldes.
 * EN: Clears the error state of one registration field.
 * @param {HTMLElement} field - DE: Formularfeld. EN: Form field.
 */
function clearSignUpFieldError(field) {
  field.classList.remove("input-error");
}


/**
 * DE: Markiert ein Registrierungsfeld als fehlerhaft.
 * EN: Marks one registration field as invalid.
 * @param {HTMLElement} field - DE: Formularfeld. EN: Form field.
 */
function markSignUpFieldError(field) {
  field.classList.add("input-error");
}


/**
 * DE: Gibt den Fehlertext für den Namen zurück.
 * EN: Returns the validation message for the name.
 * @returns {string} DE: Fehlermeldung. EN: Error message.
 */
function getNameErrorMessage() {
  if (signUpName.validity.valid) return "";
  return "Please enter your first and last name.";
}


/**
 * DE: Gibt den Fehlertext für die E-Mail zurück.
 * EN: Returns the validation message for the email.
 * @returns {string} DE: Fehlermeldung. EN: Error message.
 */
function getEmailErrorMessage() {
  if (signUpEmail.validity.valid) return "";
  if (signUpEmail.validity.valueMissing) return "Please enter your email address.";
  return "Please enter a valid email address.";
}


/**
 * DE: Gibt den Fehlertext für das Passwort zurück.
 * EN: Returns the validation message for the password.
 * @returns {string} DE: Fehlermeldung. EN: Error message.
 */
function getPasswordErrorMessage() {
  return signUpPassword.validity.valid ? "" : "Please enter a password.";
}


/**
 * DE: Gibt den Fehlertext für die Passwortbestätigung zurück.
 * EN: Returns the validation message for the password confirmation.
 * @returns {string} DE: Fehlermeldung. EN: Error message.
 */
function getRepeatPasswordErrorMessage() {
  if (repeatPassword.validity.valueMissing) return "Please confirm your password.";
  if (signUpPassword.value !== repeatPassword.value) return "Passwords do not match.";
  return "";
}


/**
 * DE: Gibt den Fehlertext für die Datenschutzzustimmung zurück.
 * EN: Returns the validation message for the privacy consent.
 * @returns {string} DE: Fehlermeldung. EN: Error message.
 */
function getPrivacyErrorMessage() {
  return privacyAccepted.checked ? "" : "Please accept the Privacy Policy.";
}


/**
 * DE: Erstellt die Liste aller Registrierungsprüfungen.
 * EN: Creates the list of all sign-up validations.
 * @returns {Array} DE: Prüfliste. EN: Validation list.
 */
function getSignUpValidations() {
  return [
    [signUpName, getNameErrorMessage()],
    [signUpEmail, getEmailErrorMessage()],
    [signUpPassword, getPasswordErrorMessage()],
    [repeatPassword, getRepeatPasswordErrorMessage()],
    [privacyAccepted, getPrivacyErrorMessage()],
  ];
}


/**
 * DE: Zeigt genau eine zentrale Validierungsmeldung an.
 * EN: Shows exactly one shared validation message.
 * @param {HTMLElement} field - DE: Fehlerhaftes Feld. EN: Invalid field.
 * @param {string} message - DE: Fehlermeldung. EN: Error message.
 */
function showSharedSignUpError(field, message) {
  markSignUpFieldError(field);
  signUpMessage.textContent = message;
}


/**
 * DE: Prüft ein einzelnes Feld ohne andere Markierungen zu verändern.
 * EN: Validates one field without changing other error states.
 * @param {HTMLElement} field - DE: Formularfeld. EN: Form field.
 * @param {Function} getMessage - DE: Fehlerfunktion. EN: Error function.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function validateSingleSignUpField(field, getMessage) {
  const message = getMessage();
  clearSignUpFieldError(field);
  if (!message) {
    if (document.activeElement === field) signUpMessage.textContent = "";
    return true;
  }
  showSharedSignUpError(field, message);
  return false;
}


/**
 * DE: Prüft alle Eingaben und zeigt den ersten Fehler an.
 * EN: Validates all inputs and displays the first error.
 * @returns {boolean} DE: Formularstatus. EN: Form state.
 */
function validateSignUp() {
  const validations = getSignUpValidations();
  let firstInvalid = null;
  for (let i = 0; i < validations.length; i++) {
    clearSignUpFieldError(validations[i][0]);
    if (!validations[i][1]) continue;
    markSignUpFieldError(validations[i][0]);
    if (!firstInvalid) firstInvalid = validations[i];
  }
  signUpMessage.textContent = firstInvalid ? firstInvalid[1] : "";
  if (firstInvalid) firstInvalid[0].focus();
  return !firstInvalid;
}


/**
 * DE: Erstellt die Daten des neuen Benutzers.
 * EN: Creates the new user's data.
 * @returns {object} DE: Benutzer. EN: User.
 */
function createUserData() {
  const name = signUpName.value.trim();
  return {
    name: name,
    email: signUpEmail.value.trim(),
    initials: createInitials(name),
    color: getRandomAvatarColor(),
  };
}


/**
 * DE: Meldet eine bereits verwendete E-Mail.
 * EN: Reports an email address that is already in use.
 */
function showDuplicateEmailError() {
  showSharedSignUpError(signUpEmail, "This email address is already in use.");
  signUpEmail.focus();
}


/**
 * DE: Öffnet nach der Registrierung wieder den Login.
 * EN: Returns to login after registration.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function finishRegistration(user) {
  sessionStorage.setItem(SIGN_UP_EMAIL_KEY, user.email);
  showToast("You signed up successfully.");
  window.setTimeout(() => {
    window.location.href = "./index.html";
  }, 850);
}


/**
 * DE: Speichert einen neuen Benutzer.
 * EN: Stores a new user.
 * @returns {Promise<void>}
 */
async function registerUser() {
  const user = createUserData();
  const existingUser = await getUserByEmail(user.email);
  if (existingUser) return showDuplicateEmailError();
  await registerUserWithContact(user, signUpPassword.value);
  finishRegistration(user);
}


/**
 * DE: Verarbeitet die Registrierung.
 * EN: Handles registration.
 * @param {SubmitEvent} event - DE: Ereignis. EN: Event.
 */
async function handleSignUpSubmit(event) {
  event.preventDefault();
  signUpMessage.textContent = "";
  if (!validateSignUp()) return;
  signUpButton.disabled = true;
  try { await registerUser(); }
  catch { signUpMessage.textContent = "Firebase connection failed."; }
  finally { signUpButton.disabled = false; }
}


/**
 * DE: Aktualisiert das Checkbox-Symbol.
 * EN: Updates the checkbox icon.
 */
function updatePrivacyCheckboxIcon() {
  const icon = document.getElementById("privacyCheckboxIcon");
  icon.src = privacyAccepted.checked
    ? "./assets/icons/checked.svg"
    : "./assets/icons/checkbox.svg";
}


/**
 * DE: Prüft ein bereits markiertes Feld während der Eingabe erneut.
 * EN: Revalidates an already marked field while typing.
 * @param {HTMLElement} field - DE: Formularfeld. EN: Form field.
 * @param {Function} validator - DE: Prüffunktion. EN: Validator.
 */
function revalidateMarkedField(field, validator) {
  if (field.classList.contains("input-error")) validator();
}


/**
 * DE: Zeigt beim Fokus den Fehler des aktuell gewählten Feldes.
 * EN: Shows the error of the currently focused field.
 * @param {HTMLElement} field - DE: Formularfeld. EN: Form field.
 * @param {Function} getMessage - DE: Fehlerfunktion. EN: Error function.
 */
function showFocusedSignUpError(field, getMessage) {
  if (!field.classList.contains("input-error")) return;
  signUpMessage.textContent = getMessage();
}


/**
 * DE: Verknüpft den Fokus eines Feldes mit seiner Fehlermeldung.
 * EN: Connects a field focus with its validation message.
 * @param {HTMLElement} field - DE: Formularfeld. EN: Form field.
 * @param {Function} getMessage - DE: Fehlerfunktion. EN: Error function.
 */
function addSignUpFocusFeedback(field, getMessage) {
  field.addEventListener("focus", () => showFocusedSignUpError(field, getMessage));
}


/**
 * DE: Initialisiert die Feldvalidierung.
 * EN: Initializes field validation.
 */
function initializeSignUpValidation() {
  signUpName.addEventListener("blur", () => validateSingleSignUpField(signUpName, getNameErrorMessage));
  signUpEmail.addEventListener("blur", () => validateSingleSignUpField(signUpEmail, getEmailErrorMessage));
  signUpPassword.addEventListener("blur", () => validateSingleSignUpField(signUpPassword, getPasswordErrorMessage));
  repeatPassword.addEventListener("blur", () => validateSingleSignUpField(repeatPassword, getRepeatPasswordErrorMessage));
  privacyAccepted.addEventListener("change", () => validateSingleSignUpField(privacyAccepted, getPrivacyErrorMessage));
  addSignUpFocusFeedback(signUpName, getNameErrorMessage);
  addSignUpFocusFeedback(signUpEmail, getEmailErrorMessage);
  addSignUpFocusFeedback(signUpPassword, getPasswordErrorMessage);
  addSignUpFocusFeedback(repeatPassword, getRepeatPasswordErrorMessage);
  addSignUpFocusFeedback(privacyAccepted, getPrivacyErrorMessage);
}


/**
 * DE: Initialisiert das Live-Feedback der Registrierung.
 * EN: Initializes live sign-up feedback.
 */
function initializeSignUpLiveFeedback() {
  signUpName.addEventListener("input", () => revalidateMarkedField(signUpName, () => validateSingleSignUpField(signUpName, getNameErrorMessage)));
  signUpEmail.addEventListener("input", () => revalidateMarkedField(signUpEmail, () => validateSingleSignUpField(signUpEmail, getEmailErrorMessage)));
  signUpPassword.addEventListener("input", handlePasswordInput);
  repeatPassword.addEventListener("input", () => validateSingleSignUpField(repeatPassword, getRepeatPasswordErrorMessage));
}


/**
 * DE: Prüft Passwort und Bestätigung während der Eingabe erneut.
 * EN: Revalidates password and confirmation while typing.
 */
function handlePasswordInput() {
  revalidateMarkedField(signUpPassword, () => validateSingleSignUpField(signUpPassword, getPasswordErrorMessage));
  if (repeatPassword.value) validateSingleSignUpField(repeatPassword, getRepeatPasswordErrorMessage);
}


/**
 * DE: Initialisiert die Registrierung.
 * EN: Initializes sign up.
 */
function initializeSignUp() {
  initializeSignUpValidation();
  initializeSignUpLiveFeedback();
  privacyAccepted.addEventListener("change", updatePrivacyCheckboxIcon);
  signUpForm.addEventListener("submit", handleSignUpSubmit);
  updatePrivacyCheckboxIcon();
}


document.addEventListener("DOMContentLoaded", initializeSignUp);
