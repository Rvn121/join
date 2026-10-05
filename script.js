const loginDialog = document.getElementById("loginDialog");
const loginForm = document.getElementById("loginForm");
const guestLoginButton = document.getElementById("guestLoginButton");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const REGISTERED_EMAIL_KEY = "joinRegisteredEmail";
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
 * DE: Prüft, ob die mobile Landingpage aktiv ist.
 * EN: Checks whether the mobile landing page is active.
 * @returns {boolean} DE: Mobile Ansicht. EN: Mobile view.
 */
function isMobileLandingView() {
  return window.matchMedia("(max-width: 991px)").matches;
}


/**
 * DE: Startet die mobile Intro-Animation.
 * EN: Starts the mobile intro animation.
 */
function startMobileLandingAnimation() {
  window.setTimeout(moveLogoToCorner, 700);
  window.setTimeout(showLoginDialog, 1120);
}


/**
 * DE: Startet die Desktop-Intro-Animation.
 * EN: Starts the desktop intro animation.
 */
function startDesktopLandingAnimation() {
  window.setTimeout(moveLogoToCorner, 1100);
  window.setTimeout(showLoginDialog, 1800);
}


/**
 * DE: Startet die passende Intro-Animation.
 * EN: Starts the matching intro animation.
 */
function startLandingAnimation() {
  if (isMobileLandingView()) return startMobileLandingAnimation();
  startDesktopLandingAnimation();
}


/**
 * DE: Prüft eine E-Mail-Adresse.
 * EN: Checks an email address.
 * @param {string} email - DE: E-Mail. EN: Email.
 * @returns {boolean} DE: Gültigkeit. EN: Validity.
 */
function isEmailValid(email) {
  return /^[A-Za-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,4}$/i.test(
    email.trim()
  );
}


/**
 * DE: Zeigt den einheitlichen Login-Fehler an.
 * EN: Shows the single login error message.
 */
function showLoginError() {
  loginMessage.classList.remove("form-message--success");
  emailInput.classList.add("input-error");
  passwordInput.classList.add("input-error");
  loginMessage.textContent = LOGIN_ERROR_MESSAGE;
}


/**
 * DE: Entfernt Login- und Erfolgsmeldungen.
 * EN: Clears login and success messages.
 */
function clearLoginError() {
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
  loginMessage.classList.remove("form-message--success");
  loginMessage.textContent = "";
}


/**
 * DE: Gibt den Fehlertext für die Login-E-Mail zurück.
 * EN: Returns the validation message for the login email.
 * @returns {string} DE: Fehlermeldung. EN: Error message.
 */
function getLoginEmailError() {
  if (!emailInput.value.trim()) return "Please enter your email address.";
  if (!isEmailValid(emailInput.value))
    return "Please enter a valid email address.";
  return "";
}

/**
 * DE: Gibt den Fehlertext für das Login-Passwort zurück.
 * EN: Returns the validation message for the login password.
 * @returns {string} DE: Fehlermeldung. EN: Error message.
 */
function getLoginPasswordError() {
  return passwordInput.value ? "" : "Please enter your password.";
}


/**
 * DE: Markiert ein Login-Feld und zeigt seine Meldung an.
 * EN: Marks a login field and shows its message.
 * @param {HTMLInputElement} input - DE: Eingabefeld. EN: Input field.
 * @param {string} message - DE: Fehlermeldung. EN: Error message.
 */
function showLoginFieldError(input, message) {
  input.classList.add("input-error");
  loginMessage.classList.remove("form-message--success");
  loginMessage.textContent = message;
}


/**
 * DE: Leert die Login-Meldung, sobald kein Feld mehr markiert ist.
 * EN: Clears the login message once no field is marked any more.
 */
function clearLoginMessageWhenValid() {
  if (loginForm.querySelector(".input-error")) return;
  loginMessage.classList.remove("form-message--success");
  loginMessage.textContent = "";
}


/**
 * DE: Prüft ein einzelnes Login-Feld neu.
 * EN: Revalidates a single login field.
 * @param {HTMLInputElement} input - DE: Eingabefeld. EN: Input field.
 * @param {Function} getMessage - DE: Fehlerfunktion. EN: Error function.
 */
function validateLoginField(input, getMessage) {
  const message = getMessage();
  input.classList.remove("input-error");
  if (!message) return clearLoginMessageWhenValid();
  showLoginFieldError(input, message);
}


/**
 * DE: Prüft ein bereits markiertes Login-Feld während der Eingabe erneut.
 * EN: Revalidates an already marked login field while typing.
 * @param {HTMLInputElement} input - DE: Eingabefeld. EN: Input field.
 * @param {Function} getMessage - DE: Fehlerfunktion. EN: Error function.
 */
function revalidateMarkedLoginField(input, getMessage) {
  if (!input.classList.contains("input-error")) return;
  validateLoginField(input, getMessage);
}


/**
 * DE: Prüft die Login-Felder und zeigt den ersten Fehler an.
 * EN: Validates the login fields and shows the first error.
 * @returns {boolean} DE: Formularstatus. EN: Form state.
 */
function validateLoginForm() {
  const emailError = getLoginEmailError();
  const passwordError = getLoginPasswordError();
  if (emailError) emailInput.classList.add("input-error");
  if (passwordError) passwordInput.classList.add("input-error");
  if (!emailError && !passwordError) return true;
  loginMessage.classList.remove("form-message--success");
  loginMessage.textContent = emailError || passwordError;
  return false;
}


/**
 * DE: Speichert die aktuelle Benutzer-Sitzung.
 * EN: Stores the current user session.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function saveUserSession(user) {
  sessionStorage.setItem(SUMMARY_GREETING_PENDING_KEY, "true");
  sessionStorage.setItem(USER_MODE_KEY, "user");
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}


/**
 * DE: Setzt den Ladezustand des Login-Buttons.
 * EN: Sets the login button loading state.
 * @param {boolean} loading - DE: Ladezustand. EN: Loading state.
 */
function setLoginLoading(loading) {
  loginButton.disabled = loading;
  loginButton.setAttribute("aria-busy", String(loading));
}


/**
 * DE: Meldet einen registrierten Benutzer an.
 * EN: Logs in a registered user.
 * @returns {Promise<boolean>} DE: Login erfolgreich. EN: Login successful.
 */
async function loginRegisteredUser() {
  const user = await verifyUser(emailInput.value, passwordInput.value);
  if (!user) {
    showLoginError();
    return false;
  }
  saveUserSession(user);
  window.location.href = "./summary.html";
  return true;
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
    if (await loginRegisteredUser()) return;
  } catch { showLoginError(); }
  setLoginLoading(false);
}


/**
 * DE: Öffnet die Summary im Gastmodus.
 * EN: Opens the summary in guest mode.
 */
function openGuestSummary() {
  clearLoginError();
  sessionStorage.setItem(SUMMARY_GREETING_PENDING_KEY, "true");
  sessionStorage.setItem(USER_MODE_KEY, "guest");
  sessionStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "./summary.html";
}


/**
 * DE: Zeigt die Rückmeldung nach einer Registrierung.
 * EN: Shows the feedback after registration.
 * @param {string} email - DE: Registrierte E-Mail. EN: Registered email.
 */
function showRegistrationSuccess(email) {
  emailInput.value = email;
  passwordInput.value = "";
  loginMessage.textContent = "Registration successful. Enter your password to log in.";
  loginMessage.classList.add("form-message--success");
  moveLogoToCorner();
  showLoginDialog();
  passwordInput.focus();
}


/**
 * DE: Übernimmt die E-Mail nach der Rückkehr vom Sign-up.
 * EN: Restores the email after returning from sign up.
 * @returns {boolean} DE: Registrierungsstatus. EN: Registration state.
 */
function restoreRegistration() {
  const email = sessionStorage.getItem(REGISTERED_EMAIL_KEY);
  if (!email) return false;
  sessionStorage.removeItem(REGISTERED_EMAIL_KEY);
  showRegistrationSuccess(email);
  return true;
}


/**
 * DE: Prüft das E-Mail-Feld beim Verlassen.
 * EN: Validates the email field on blur.
 * @param {FocusEvent} event - DE: Fokuswechsel. EN: Focus change.
 */
function handleLoginEmailBlur(event) {
  if (event.relatedTarget === guestLoginButton) return;
  validateLoginField(emailInput, getLoginEmailError);
}


/**
 * DE: Prüft das markierte E-Mail-Feld während der Eingabe.
 * EN: Revalidates the marked email field while typing.
 */
function handleLoginEmailInput() {
  revalidateMarkedLoginField(emailInput, getLoginEmailError);
}


/**
 * DE: Prüft das Passwortfeld beim Verlassen.
 * EN: Validates the password field on blur.
 * @param {FocusEvent} event - DE: Fokuswechsel. EN: Focus change.
 */
function handleLoginPasswordBlur(event) {
  if (event.relatedTarget === guestLoginButton) return;
  validateLoginField(passwordInput, getLoginPasswordError);
}


/**
 * DE: Prüft das markierte Passwortfeld während der Eingabe.
 * EN: Revalidates the marked password field while typing.
 */
function handleLoginPasswordInput() {
  revalidateMarkedLoginField(passwordInput, getLoginPasswordError);
}


/**
 * DE: Verbindet die Login-Felder mit der Live-Validierung.
 * EN: Connects the login fields with the live validation.
 */
function initializeLoginValidation() {
  emailInput.addEventListener("blur", handleLoginEmailBlur);
  emailInput.addEventListener("input", handleLoginEmailInput);
  passwordInput.addEventListener("blur", handleLoginPasswordBlur);
  passwordInput.addEventListener("input", handleLoginPasswordInput);
}


/**
 * DE: Initialisiert die Landingpage.
 * EN: Initializes the landing page.
 */
function initializeLandingPage() {
  clearGuestForLogin();
  if (!restoreRegistration()) startLandingAnimation();
  loginForm.addEventListener("submit", handleLoginSubmit);
  guestLoginButton.addEventListener("click", openGuestSummary);
  initializeLoginValidation();
}


window.addEventListener("DOMContentLoaded", initializeLandingPage);
