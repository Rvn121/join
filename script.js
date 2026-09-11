const USER_MODE_KEY = "joinUserMode";
const CURRENT_USER_KEY = "joinCurrentUser";
const loginDialog = document.getElementById("loginDialog");
const signUpDialog = document.getElementById("signUpDialog");
const loginForm = document.getElementById("loginForm");
const guestLoginButton = document.getElementById("guestLoginButton");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");

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
  return /^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email.trim());
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
  if (!isEmailValid(emailInput.value)) showFieldError(emailInput, "Enter a valid email.");
  if (!passwordInput.value) showFieldError(passwordInput, "Enter your password.");
  return !document.querySelector("#loginForm .input-error");
}


/**
 * DE: Speichert die aktuelle Benutzer-Sitzung.
 * EN: Stores the current user session.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function saveUserSession(user) {
  localStorage.setItem(USER_MODE_KEY, "user");
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}


/**
 * DE: Setzt den Ladezustand des Login-Buttons.
 * EN: Sets the login button loading state.
 * @param {boolean} loading - DE: Ladezustand. EN: Loading state.
 */
function setLoginLoading(loading) {
  loginButton.disabled = loading;
  loginButton.textContent = loading ? "Logging in..." : "Log in";
}


/**
 * DE: Meldet einen registrierten Benutzer an.
 * EN: Logs in a registered user.
 * @returns {Promise<void>}
 */
async function loginRegisteredUser() {
  const user = await verifyUser(emailInput.value, passwordInput.value);
  if (!user) return document.getElementById("loginMessage").textContent =
    "Email or password is incorrect.";
  saveUserSession(user);
  window.location.href = "./summary.html";
}


/**
 * DE: Verarbeitet den Benutzer-Login.
 * EN: Handles user login.
 * @param {SubmitEvent} event - DE: Ereignis. EN: Event.
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  if (!validateLoginForm()) return;
  document.getElementById("loginMessage").textContent = "";
  setLoginLoading(true);
  try {
    await loginRegisteredUser();
  } catch {
    document.getElementById("loginMessage").textContent = "Firebase connection failed.";
  }
  setLoginLoading(false);
}


/**
 * DE: Öffnet die Summary im Gastmodus.
 * EN: Opens the summary in guest mode.
 */
function openGuestSummary() {
  localStorage.setItem(USER_MODE_KEY, "guest");
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "./summary.html";
}


/**
 * DE: Öffnet den Sign-up-Dialog.
 * EN: Opens the sign-up dialog.
 */
function openSignUp() {
  if (loginDialog.open) loginDialog.close();
  document.body.classList.add("signup-visible");
  if (!signUpDialog.open) signUpDialog.show();
}


/**
 * DE: Schließt Sign-up und zeigt den Login.
 * EN: Closes sign up and shows login.
 */
function closeSignUp() {
  if (signUpDialog.open) signUpDialog.close();
  document.body.classList.remove("signup-visible");
  showLoginDialog();
}


/**
 * DE: Übernimmt die E-Mail nach erfolgreicher Registrierung.
 * EN: Applies the email after successful registration.
 * @param {CustomEvent} event - DE: Registrierungsereignis. EN: Sign-up event.
 */
function finishSignUp(event) {
  emailInput.value = event.detail.email;
  window.setTimeout(closeSignUp, 900);
}


/**
 * DE: Initialisiert die Landingpage.
 * EN: Initializes the landing page.
 */
function initializeLandingPage() {
  startLandingAnimation();
  loginForm.addEventListener("submit", handleLoginSubmit);
  guestLoginButton.addEventListener("click", openGuestSummary);
  document.getElementById("signUpButton").addEventListener("click", openSignUp);
  document.getElementById("signUpBackButton").addEventListener("click", closeSignUp);
  document.addEventListener("joinSignUpSuccess", finishSignUp);
}


window.addEventListener("DOMContentLoaded", initializeLandingPage);
