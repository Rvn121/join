const signUpForm = document.getElementById("signUpForm");
const signUpButton = document.getElementById("registerButton");
const signUpInputs = [...signUpForm.querySelectorAll("[data-required]")];
const privacyAccepted = document.getElementById("privacyAccepted");
const repeatPassword = document.getElementById("repeatPassword");
const userColors = [
  "#ff7a00", "#9327ff", "#6e52ff", "#fc71ff", "#ffbb2b",
  "#1fd7c1", "#462f8a", "#ff4646", "#00bee8",
];

/**
 * DE: Prüft eine E-Mail-Adresse mit Provider und Endung.
 * EN: Checks an email address with provider and top-level domain.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isSignUpEmailValid(email) {
  return /^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email.trim());
}


/**
 * DE: Prüft Vor- und Nachnamen.
 * EN: Checks first and last name.
 * @param {string} name - DE: Name. EN: Name.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isFullNameValid(name) {
  return name.trim().split(/\s+/).filter(Boolean).length >= 2;
}


/**
 * DE: Erstellt Initialen aus erstem und letztem Namen.
 * EN: Creates initials from the first and last name.
 * @param {string} name - DE: Name. EN: Name.
 * @returns {string} DE: Initialen. EN: Initials.
 */
function createInitials(name) {
  const names = name.trim().split(/\s+/);
  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}


/**
 * DE: Wählt zufällig eine Farbe aus der Palette.
 * EN: Selects a random color from the palette.
 * @returns {string} DE: Farbe. EN: Color.
 */
function getRandomUserColor() {
  return userColors[Math.floor(Math.random() * userColors.length)];
}


/**
 * DE: Prüft, ob beide Passwörter gleich sind.
 * EN: Checks whether both passwords match.
 * @returns {boolean} DE: Status. EN: Status.
 */
function doPasswordsMatch() {
  const password = document.getElementById("signUpPassword").value;
  return password && password === repeatPassword.value;
}


/**
 * DE: Prüft alle Bedingungen für den Sign-up-Button.
 * EN: Checks every condition for the sign-up button.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function canRegisterUser() {
  const name = document.getElementById("signUpName").value;
  const email = document.getElementById("signUpEmail").value;
  const filled = signUpInputs.every((input) => input.value.trim());
  return filled && isFullNameValid(name) && isSignUpEmailValid(email)
    && doPasswordsMatch() && privacyAccepted.checked;
}


/**
 * DE: Aktiviert den Registrierungsbutton passend zum Formular.
 * EN: Enables the registration button according to the form.
 */
function updateRegisterButton() {
  signUpButton.disabled = !canRegisterUser();
}


/**
 * DE: Zeigt einen Registrierungsfehler.
 * EN: Shows a registration error.
 * @param {string} id - DE: Feld-ID. EN: Field id.
 * @param {string} message - DE: Meldung. EN: Message.
 */
function showSignUpError(id, message) {
  document.getElementById(`${id}Error`).textContent = message;
  document.getElementById(id).classList.add("input-error");
}


/**
 * DE: Entfernt einen Registrierungsfehler.
 * EN: Clears one registration error.
 * @param {string} id - DE: Feld-ID. EN: Field id.
 */
function clearSignUpError(id) {
  document.getElementById(`${id}Error`).textContent = "";
  document.getElementById(id).classList.remove("input-error");
}


/**
 * DE: Prüft die Passwortbestätigung während der Eingabe.
 * EN: Checks password confirmation while typing.
 */
function validatePasswordMatchLive() {
  clearSignUpError("repeatPassword");
  if (!repeatPassword.value || doPasswordsMatch()) return;
  showSignUpError("repeatPassword", "Your passwords don't match. Please try again.");
}


/**
 * DE: Prüft die Eingaben vor dem Speichern.
 * EN: Validates inputs before saving.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function validateSignUp() {
  clearSignUpError("signUpName");
  clearSignUpError("signUpEmail");
  validatePasswordMatchLive();
  if (!isFullNameValid(document.getElementById("signUpName").value)) {
    showSignUpError("signUpName", "Please enter your first and last name.");
  }
  if (!isSignUpEmailValid(document.getElementById("signUpEmail").value)) {
    showSignUpError("signUpEmail", "Enter a valid email address.");
  }
  return !document.querySelector("#signUpForm .input-error");
}


/**
 * DE: Erstellt die Daten des neuen Benutzers.
 * EN: Creates the new user's data.
 * @returns {object} DE: Benutzer. EN: User.
 */
function createUserData() {
  const name = document.getElementById("signUpName").value.trim();
  const email = document.getElementById("signUpEmail").value.trim();
  return { name, email, initials: createInitials(name), color: getRandomUserColor() };
}


/**
 * DE: Zeigt die Erfolgsnachricht.
 * EN: Shows the success message.
 */
function showSignUpSuccess() {
  const toast = document.getElementById("signUpToast");
  toast.hidden = false;
  window.setTimeout(() => toast.hidden = true, 1800);
}


/**
 * DE: Meldet eine bereits verwendete E-Mail.
 * EN: Reports an email address that is already in use.
 */
function showDuplicateEmailError() {
  showSignUpError("signUpEmail", "This email address is already registered.");
  document.getElementById("signUpEmail").focus();
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
  await createUser(user, document.getElementById("signUpPassword").value);
  showSignUpSuccess();
  document.dispatchEvent(new CustomEvent("joinSignUpSuccess", { detail: user }));
}


/**
 * DE: Verarbeitet die Registrierung.
 * EN: Handles registration.
 * @param {SubmitEvent} event - DE: Ereignis. EN: Event.
 */
async function handleSignUpSubmit(event) {
  event.preventDefault();
  if (!validateSignUp() || !canRegisterUser()) return;
  signUpButton.disabled = true;
  try {
    await registerUser();
  } catch {
    document.getElementById("signUpMessage").textContent = "Firebase connection failed.";
  }
  updateRegisterButton();
}


/**
 * DE: Aktualisiert das Symbol eines Passwortfeldes.
 * EN: Updates a password field icon.
 * @param {HTMLInputElement} input - DE: Passwortfeld. EN: Password field.
 * @param {HTMLImageElement} icon - DE: Icon. EN: Icon.
 */
function updatePasswordIcon(input, icon) {
  if (!input.value) return icon.src = "./assets/icons/lock.png";
  icon.src = input.type === "password"
    ? "./assets/icons/visibilityOff.png" : "./assets/icons/visibility.png";
}


/**
 * DE: Schaltet die Passwortsichtbarkeit um.
 * EN: Toggles password visibility.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function togglePasswordVisibility(button) {
  const input = document.getElementById(button.dataset.target);
  input.type = input.type === "password" ? "text" : "password";
  updatePasswordIcon(input, button.querySelector("img"));
}


/**
 * DE: Aktualisiert das Checkbox-Symbol.
 * EN: Updates the checkbox icon.
 */
function updatePrivacyCheckboxIcon() {
  const icon = document.getElementById("privacyCheckboxIcon");
  icon.src = privacyAccepted.checked
    ? "./assets/icons/checkboxActive.png" : "./assets/icons/checkbox.png";
}


/**
 * DE: Initialisiert die Passwort-Buttons.
 * EN: Initializes password buttons.
 */
function initializePasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.dataset.target);
    button.addEventListener("click", () => togglePasswordVisibility(button));
    input.addEventListener("input", () => updatePasswordIcon(input, button.querySelector("img")));
  });
}


/**
 * DE: Initialisiert die Registrierung.
 * EN: Initializes sign up.
 */
function initializeSignUp() {
  initializePasswordToggles();
  privacyAccepted.addEventListener("change", updatePrivacyCheckboxIcon);
  repeatPassword.addEventListener("input", validatePasswordMatchLive);
  signUpInputs.forEach((input) => input.addEventListener("input", updateRegisterButton));
  privacyAccepted.addEventListener("change", updateRegisterButton);
  signUpForm.addEventListener("submit", handleSignUpSubmit);
  updatePrivacyCheckboxIcon();
  updateRegisterButton();
}


document.addEventListener("DOMContentLoaded", initializeSignUp);
