const GUEST_MODE_KEY = "joinUserMode";
const loginDialog = document.getElementById("loginDialog");
const loginForm = document.getElementById("loginForm");
const guestLoginButton = document.getElementById("guestLoginButton");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

/**
 * DE: Bewegt das Join-Logo in die linke obere Ecke.
 * EN: Moves the Join logo to the upper-left corner.
 */
function moveLogoToCorner() {
  document.body.classList.add("logo-corner");
}


/**
 * DE: Öffnet den Login-Dialog.
 * EN: Opens the login dialog.
 */
function showLoginDialog() {
  if (!loginDialog.open) loginDialog.show();
  requestAnimationFrame(() => document.body.classList.add("login-visible"));
}


/**
 * DE: Startet die Intro-Animation.
 * EN: Starts the intro animation.
 */
function startLandingAnimation() {
  window.setTimeout(moveLogoToCorner, 1100);
  window.setTimeout(showLoginDialog, 1800);
}


/**
 * DE: Prüft eine E-Mail-Adresse.
 * EN: Checks an email address.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/**
 * DE: Zeigt einen Feldfehler.
 * EN: Shows a field error.
 * @param {HTMLInputElement} input - DE: Eingabe. EN: Input.
 * @param {string} message - DE: Meldung. EN: Message.
 */
function showFieldError(input, message) {
  input.classList.add("input-error");
  document.getElementById(`${input.id}Error`).textContent = message;
}


/**
 * DE: Entfernt einen Feldfehler.
 * EN: Removes a field error.
 * @param {HTMLInputElement} input - DE: Eingabe. EN: Input.
 */
function clearFieldError(input) {
  input.classList.remove("input-error");
  document.getElementById(`${input.id}Error`).textContent = "";
}


/**
 * DE: Prüft die Login-Felder.
 * EN: Validates the login fields.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function validateLoginForm() {
  clearFieldError(emailInput);
  clearFieldError(passwordInput);
  if (!isEmailValid(emailInput.value.trim())) showFieldError(emailInput, "Enter a valid email.");
  if (!passwordInput.value.trim()) showFieldError(passwordInput, "Enter your password.");
  return !document.querySelector(".input-error");
}


/**
 * DE: Behandelt den späteren API-Login.
 * EN: Handles the future API login.
 * @param {SubmitEvent} event - DE: Ereignis. EN: Event.
 */
function handleLoginSubmit(event) {
  event.preventDefault();
  if (!validateLoginForm()) return;
  document.getElementById("loginMessage").textContent = "User login will be connected to the API next.";
}


/**
 * DE: Öffnet die Summary im Gastmodus.
 * EN: Opens the summary in guest mode.
 */
function openGuestSummary() {
  localStorage.setItem(GUEST_MODE_KEY, "guest");
  window.location.href = "./summary.html";
}


/**
 * DE: Öffnet die Registrierung.
 * EN: Opens the registration page.
 */
function openSignUp() {
  window.location.href = "./signUp.html";
}


window.addEventListener("DOMContentLoaded", startLandingAnimation);
loginForm.addEventListener("submit", handleLoginSubmit);
guestLoginButton.addEventListener("click", openGuestSummary);
document.getElementById("signUpButton").addEventListener("click", openSignUp);
