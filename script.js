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
  return /^[^\s@]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email.trim());
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
 * DE: Prüft die Login-Felder.
 * EN: Validates the login fields.
 * @returns {boolean} DE: Formularstatus. EN: Form state.
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
  clearGuestLocalData();
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
  loginButton.textContent = loading ? "Logging in..." : "Log in";
}


/**
 * DE: Meldet einen registrierten Benutzer an.
 * EN: Logs in a registered user.
 * @returns {Promise<void>}
 */
async function loginRegisteredUser() {
  const user = await verifyUser(emailInput.value, passwordInput.value);
  if (!user) return showLoginError();
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
  try { await loginRegisteredUser(); }
  catch { showLoginError(); }
  setLoginLoading(false);
}


/**
 * DE: Öffnet die Summary im Gastmodus.
 * EN: Opens the summary in guest mode.
 */
function openGuestSummary() {
  clearGuestLocalData();
  sessionStorage.setItem(SUMMARY_GREETING_PENDING_KEY, "true");
  sessionStorage.setItem(USER_MODE_KEY, "guest");
  sessionStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.setItem("joinGuestContacts", JSON.stringify(createGuestDemoContacts()));
  window.location.href = "./summary.html";
}


/**
 * DE: Erstellt die drei lokalen Gastkontakte.
 * EN: Creates the three local guest contacts.
 * @returns {Array} DE: Gastkontakte. EN: Guest contacts.
 */
function createGuestDemoContacts() {
  const contacts = [
    { id: "guest-emma", name: "Tante Emma", email: "Email1@join.com", initials: "TE", color: "orange" },
    { id: "guest-jacke", name: "Jacke wie Hose", email: "Email2@join.com", initials: "JH", color: "purple" },
    { id: "guest-probier", name: "Probier Mal", email: "Email3@join.com", initials: "PM", color: "teal" },
  ];
  return contacts.map(contact => ({ ...contact, phone: "+49 0815 4711", isRegistered: false, userId: null }));
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
 * DE: Initialisiert die Landingpage.
 * EN: Initializes the landing page.
 */
function initializeLandingPage() {
  clearGuestForLogin();
  if (!restoreRegistration()) startLandingAnimation();
  loginForm.addEventListener("submit", handleLoginSubmit);
  guestLoginButton.addEventListener("click", openGuestSummary);
}


window.addEventListener("DOMContentLoaded", initializeLandingPage);
