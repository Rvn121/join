const signUpForm = document.getElementById("signUpForm");
const signUpButton = document.getElementById("registerButton");
const signUpInputs = [...signUpForm.querySelectorAll("[data-required]")];

/**
 * DE: Prüft eine E-Mail-Adresse.
 * EN: Checks an email address.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isSignUpEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/**
 * DE: Prüft, ob alle Pflichtfelder befüllt sind.
 * EN: Checks whether all required fields are filled.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function hasCompleteSignUpForm() {
  const filled = signUpInputs.every((input) => input.value.trim());
  return filled && document.getElementById("privacyAccepted").checked;
}


/**
 * DE: Aktiviert den Registrierungsbutton passend zum Formular.
 * EN: Enables the registration button according to the form.
 */
function updateRegisterButton() {
  signUpButton.disabled = !hasCompleteSignUpForm();
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
 * DE: Entfernt alle Registrierungsfehler.
 * EN: Clears all registration errors.
 */
function clearSignUpErrors() {
  signUpInputs.forEach((input) => input.classList.remove("input-error"));
  document.querySelectorAll(".field-error").forEach((error) => error.textContent = "");
}


/**
 * DE: Prüft die Registrierung.
 * EN: Validates the registration.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function validateSignUp() {
  clearSignUpErrors();
  if (!isSignUpEmailValid(document.getElementById("signUpEmail").value)) showSignUpError("signUpEmail", "Enter a valid email.");
  const passwordsMatch = document.getElementById("signUpPassword").value === document.getElementById("repeatPassword").value;
  if (!passwordsMatch) showSignUpError("repeatPassword", "Passwords do not match.");
  return !document.querySelector(".input-error");
}


/**
 * DE: Verarbeitet die spätere API-Registrierung.
 * EN: Handles the future API registration.
 * @param {SubmitEvent} event - DE: Ereignis. EN: Event.
 */
function handleSignUpSubmit(event) {
  event.preventDefault();
  if (!validateSignUp()) return;
  document.getElementById("signUpMessage").textContent = "Registration will be connected to the API next.";
}


signUpInputs.forEach((input) => input.addEventListener("input", updateRegisterButton));
document.getElementById("privacyAccepted").addEventListener("change", updateRegisterButton);
signUpForm.addEventListener("submit", handleSignUpSubmit);
updateRegisterButton();
