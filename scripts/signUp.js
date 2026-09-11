const signUpForm = document.getElementById("signUpForm");
const signUpButton = document.getElementById("registerButton");
const signUpInputs = signUpForm.querySelectorAll("[data-required]");
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
  const names = name.trim().split(/\s+/);
  return names.length >= 2;
}


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
function areSignUpFieldsFilled() {
  for (let i = 0; i < signUpInputs.length; i++) {
    if (!signUpInputs[i].value.trim()) return false;
  }
  return true;
}


/**
 * DE: Prüft alle Bedingungen für den Sign-up-Button.
 * EN: Checks every condition for the sign-up button.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function canRegisterUser() {
  const name = document.getElementById("signUpName").value;
  const email = document.getElementById("signUpEmail").value;
  if (!areSignUpFieldsFilled()) return false;
  if (!isFullNameValid(name) || !isSignUpEmailValid(email)) return false;
  return doPasswordsMatch() && privacyAccepted.checked;
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
  return {
    name: name,
    email: email,
    initials: createInitials(name),
    color: getRandomUserColor(),
  };
}


/**
 * DE: Zeigt die Erfolgsnachricht.
 * EN: Shows the success message.
 */
function hideSignUpSuccess() {
  document.getElementById("signUpToast").hidden = true;
}


/**
 * DE: Zeigt die Erfolgsnachricht.
 * EN: Shows the success message.
 */
function showSignUpSuccess() {
  document.getElementById("signUpToast").hidden = false;
  window.setTimeout(hideSignUpSuccess, 1800);
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
 * DE: Öffnet nach der Registrierung wieder den Login.
 * EN: Opens the login again after registration.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function finishRegistration(user) {
  showSignUpSuccess();
  const loginEmail = document.getElementById("email");
  if (!loginEmail) return window.location.href = "./index.html";
  loginEmail.value = user.email;
  window.setTimeout(closeSignUp, 900);
}


/**
 * DE: Speichert einen neuen Benutzer.
 * EN: Stores a new user.
 * @returns {Promise<void>}
 */
async function registerUser() {
  const user = createUserData();
  const existingUser = await getUserByEmail(user.email);
  if (existingUser) {
    showDuplicateEmailError();
    return;
  }
  await createUser(user, document.getElementById("signUpPassword").value);
  finishRegistration(user);
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
  if (!input.value) {
    icon.src = "./assets/icons/lock.png";
  } else if (input.type === "password") {
    icon.src = "./assets/icons/visibilityOff.png";
  } else {
    icon.src = "./assets/icons/visibility.png";
  }
}


/**
 * DE: Schaltet die Passwortsichtbarkeit um.
 * EN: Toggles password visibility.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function togglePasswordVisibility(button) {
  const inputId = button.getAttribute("data-target");
  const input = document.getElementById(inputId);
  if (input.type === "password") input.type = "text";
  else input.type = "password";
  updatePasswordIcon(input, button.querySelector("img"));
}


/**
 * DE: Aktualisiert das Checkbox-Symbol.
 * EN: Updates the checkbox icon.
 */
function updatePrivacyCheckboxIcon() {
  const icon = document.getElementById("privacyCheckboxIcon");
  if (privacyAccepted.checked) icon.src = "./assets/icons/checkboxActive.png";
  else icon.src = "./assets/icons/checkbox.png";
}


/**
 * DE: Initialisiert die Passwort-Buttons.
 * EN: Initializes password buttons.
 */
function initializePasswordToggles() {
  const buttons = document.querySelectorAll("[data-password-toggle]");
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.addEventListener("click", function () {
      togglePasswordVisibility(button);
    });
  }
}


/**
 * DE: Initialisiert die Registrierung.
 * EN: Initializes sign up.
 */
function initializeSignUp() {
  initializePasswordToggles();
  privacyAccepted.addEventListener("change", updatePrivacyCheckboxIcon);
  repeatPassword.addEventListener("input", validatePasswordMatchLive);
  for (let i = 0; i < signUpInputs.length; i++) {
    signUpInputs[i].addEventListener("input", updateRegisterButton);
  }
  privacyAccepted.addEventListener("change", updateRegisterButton);
  signUpForm.addEventListener("submit", handleSignUpSubmit);
  updatePrivacyCheckboxIcon();
  updateRegisterButton();
}


document.addEventListener("DOMContentLoaded", initializeSignUp);
