const loginDialog = document.getElementById("loginDialog");
const signUpDialog = document.getElementById("signUpDialog");
const loginForm = document.getElementById("loginForm");
const guestLoginButton = document.getElementById("guestLoginButton");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const LOGIN_ERROR_MESSAGE = "Check your email and password. Please try again.";

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
  document.body.classList.add("login-visible");
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
 * DE: Zeigt den einheitlichen Login-Fehler an.
 * EN: Shows the single login error message.
 */
function showLoginError() {
  emailInput.classList.add("input-error");
  passwordInput.classList.add("input-error");
  loginMessage.textContent = LOGIN_ERROR_MESSAGE;
}


/**
 * DE: Entfernt den Login-Fehler.
 * EN: Clears the login error state.
 */
function clearLoginError() {
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
  loginMessage.textContent = "";
}


/**
 * DE: Prüft die Login-Felder ohne einzelne Feldmeldungen.
 * EN: Validates the login fields without individual field messages.
 * @returns {boolean} DE: Formularstatus. EN: Form status.
 */
function validateLoginForm() {
  const valid = isEmailValid(emailInput.value) && Boolean(passwordInput.value);
  if (!valid) showLoginError();
  return valid;
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
  if (loading) loginButton.textContent = "Logging in...";
  else loginButton.textContent = "Log in";
}


/**
 * DE: Meldet einen registrierten Benutzer an.
 * EN: Logs in a registered user.
 * @returns {Promise<void>}
 */
async function loginRegisteredUser() {
  const user = await verifyUser(emailInput.value, passwordInput.value);
  if (!user) {
    showLoginError();
    return;
  }
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
  clearLoginError();
  if (!validateLoginForm()) return;
  setLoginLoading(true);
  try {
    await loginRegisteredUser();
  } catch {
    showLoginError();
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
  openFloatingDialog(signUpDialog, false, closeSignUp);
}


/**
 * DE: Schließt Sign-up und zeigt den Login.
 * EN: Closes sign up and shows login.
 */
async function closeSignUp() {
  if (!await closeFloatingDialog(signUpDialog)) return;
  document.body.classList.remove("signup-visible");
  showLoginDialog();
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
}


window.addEventListener("DOMContentLoaded", initializeLandingPage);
