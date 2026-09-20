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
 * DE: Prüft, ob die mobile Landingpage aktiv ist.
 * EN: Checks whether the mobile landing page is active.
 * @returns {boolean} DE: Mobile Ansicht. EN: Mobile view.
 */
function isMobileLandingView() {
  return window.matchMedia("(max-width: 991px)").matches;
}


/**
 * DE: Zeigt Logo-Ecke und Login gleichzeitig in der mobilen Ansicht.
 * EN: Shows the corner logo and login together in the mobile view.
 */
function showMobileLanding() {
  moveLogoToCorner();
  showLoginDialog();
}


/**
 * DE: Startet die weichere mobile Intro-Animation.
 * EN: Starts the smoother mobile intro animation.
 */
function startMobileLandingAnimation() {
  window.setTimeout(showMobileLanding, 550);
}


/**
 * DE: Startet die bisherige Desktop-Intro-Animation.
 * EN: Starts the existing desktop intro animation.
 */
function startDesktopLandingAnimation() {
  window.setTimeout(moveLogoToCorner, 1100);
  window.setTimeout(showLoginDialog, 1800);
}


/**
 * DE: Startet die passende Intro-Animation für die Bildschirmgröße.
 * EN: Starts the matching intro animation for the screen size.
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
  clearGuestLocalData();
  sessionStorage.setItem(SUMMARY_GREETING_PENDING_KEY, "true");
  sessionStorage.setItem(USER_MODE_KEY, "guest");
  sessionStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.setItem("joinGuestContacts", JSON.stringify(createGuestDemoContacts()));
  window.location.href = "./summary.html";
}

/** DE: Erstellt die drei lokalen Gastkontakte. EN: Creates the three local guest contacts. */
function createGuestDemoContacts() {
  return [
    { id: "guest-emma", name: "Tante Emma", email: "Email1@join.com", initials: "TE", color: "orange" },
    { id: "guest-jacke", name: "Jacke wie Hose", email: "Email2@join.com", initials: "JH", color: "purple" },
    { id: "guest-probier", name: "Probier Mal", email: "Email3@join.com", initials: "PM", color: "teal" },
  ].map(contact => ({ ...contact, phone: "+4908154711", isRegistered: false, userId: null }));
}


/**
 * DE: Öffnet den Sign-up-Dialog.
 * EN: Opens the sign-up dialog.
 */
function openSignUp() {
  signUpDialog.dataset.dialogMotion = "none";
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
  clearGuestForLogin();
  startLandingAnimation();
  loginForm.addEventListener("submit", handleLoginSubmit);
  guestLoginButton.addEventListener("click", openGuestSummary);
  document.getElementById("signUpButton").addEventListener("click", openSignUp);
  document.getElementById("signUpBackButton").addEventListener("click", closeSignUp);
}


window.addEventListener("DOMContentLoaded", initializeLandingPage);
