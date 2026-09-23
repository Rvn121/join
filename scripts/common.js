const USER_MODE_KEY = "joinUserMode";
const CURRENT_USER_KEY = "joinCurrentUser";
const SUMMARY_GREETING_PENDING_KEY = "joinSummaryGreetingPending";
const userInitials = document.getElementById("userInitials");
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");
const logoutButton = document.getElementById("logoutButton");
const appToast = document.getElementById("appToast");

/**
 * DE: Gibt den aktuellen Zugangsmodus zurück.
 * EN: Returns the current access mode.
 * @returns {string|null} DE: Modus. EN: Mode.
 */
function getUserMode() {
  const mode = sessionStorage.getItem(USER_MODE_KEY);
  if (mode === "guest") return mode;
  if (mode === "user" && getCurrentUser()?.userId) return mode;
  return null;
}


/**
 * DE: Liest den aktuell angemeldeten Benutzer.
 * EN: Reads the currently logged-in user.
 * @returns {object|null} DE: Benutzer. EN: User.
 */
function getCurrentUser() {
  const user = sessionStorage.getItem(CURRENT_USER_KEY);
  try { return user ? JSON.parse(user) : null; }
  catch { return null; }
}


/**
 * DE: Prüft, ob die Seite geschützt ist.
 * EN: Checks whether the page is protected.
 * @returns {boolean} DE: Schutzstatus. EN: Protection status.
 */
function isProtectedPage() {
  return document.body.getAttribute("data-protected-page") === "true";
}


/**
 * DE: Gibt eine geschützte Seite nach erfolgreicher Sitzungsprüfung frei.
 * EN: Reveals a protected page after a successful session check.
 */
function showProtectedPage() {
  document.body.classList?.add("session-ready");
}


/**
 * DE: Leitet nicht angemeldete Besucher zum Login.
 * EN: Redirects signed-out visitors to login.
 * @returns {boolean} DE: Zugriffsstatus. EN: Access state.
 */
function protectCurrentPage() {
  if (!isProtectedPage()) return true;
  if (!getUserMode()) {
    window.location.replace("./index.html");
    return false;
  }
  showProtectedPage();
  return true;
}


/**
 * DE: Setzt die Anzeige eines registrierten Benutzers.
 * EN: Sets the registered user's avatar display.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function showRegisteredUser(user) {
  if (!user || !profileButton) return;
  userInitials.textContent = user.initials;
}


/**
 * DE: Aktualisiert die Initialen des Benutzers.
 * EN: Updates the user initials.
 */
function updateUserInitials() {
  if (!userInitials) return;
  if (getUserMode() === "guest") {
    userInitials.textContent = "G";
    return;
  }
  showRegisteredUser(getCurrentUser());
}


/**
 * DE: Schaltet Privacy und Legal auf das externe Layout.
 * EN: Switches Privacy and Legal to the external layout.
 */
function updatePublicLayout() {
  const publicPage = document.body.getAttribute("data-public-page") === "true";
  document.body.classList.toggle("external-layout", publicPage && !getUserMode());
  if (publicPage) document.body.classList.add("session-ready");
}


/**
 * DE: Blendet Hilfe auf der Hilfeseite aus.
 * EN: Hides help on the help page.
 */
function updateHelpButton() {
  const helpButton = document.getElementById("helpButton");
  if (helpButton) helpButton.hidden = document.body.getAttribute("data-page") === "help";
}


/**
 * DE: Zeigt eine kurze Rückmeldung als Toast an.
 * EN: Shows a short feedback message as a toast.
 * @param {string} message - DE: Meldung. EN: Message.
 * @param {number} duration - DE: Anzeigedauer. EN: Display duration.
 */
function showToast(message, duration = 2200) {
  if (!appToast) return;
  appToast.textContent = message;
  appToast.hidden = false;
  animateFloatingElement(appToast, true);
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(hideToast, duration);
}


/**
 * DE: Blendet den Toast wieder aus.
 * EN: Hides the toast again.
 */
async function hideToast() {
  if (!appToast) return;
  if (await animateFloatingElement(appToast, false)) finishHideToast();
}


/**
 * DE: Entfernt den Toast vollständig aus der Ansicht.
 * EN: Fully hides the toast from the view.
 */
function finishHideToast() {
  if (appToast) appToast.hidden = true;
}


/**
 * DE: Öffnet oder schließt das Profilmenü.
 * EN: Opens or closes the profile menu.
 */
function toggleProfileMenu() {
  if (!profileMenu) return;
  profileMenu.hidden = !profileMenu.hidden;
  profileButton?.setAttribute("aria-expanded", String(!profileMenu.hidden));
}


/**
 * DE: Entfernt ausschließlich lokale Testdaten des Gastzugangs.
 * EN: Clears guest-only local test data.
 */
function clearGuestLocalData() {
  sessionStorage.removeItem("joinGuestContacts");
  sessionStorage.removeItem("joinGuestTasks");
  localStorage.removeItem("joinGuestContacts");
  localStorage.removeItem("joinGuestTasks");
}


/**
 * DE: Liest die lokal gespeicherten Gast-Tasks.
 * EN: Reads the locally stored guest tasks.
 * @returns {Array} DE: Gast-Tasks. EN: Guest tasks.
 */
function getGuestTaskData() {
  const tasks = sessionStorage.getItem("joinGuestTasks");
  return tasks ? JSON.parse(tasks) : [];
}


/**
 * DE: Speichert Tasks ausschließlich in der lokalen Gastsicht.
 * EN: Stores tasks only in the local guest view.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 */
function setGuestTaskData(tasks) {
  sessionStorage.setItem("joinGuestTasks", JSON.stringify(tasks));
}


/**
 * DE: Kopiert einen gespeicherten Task und ergänzt bei Bedarf seine ID.
 * EN: Copies a stored task and adds its id when needed.
 * @param {object} task - DE: Gespeicherter Task. EN: Stored task.
 * @param {string} fallbackId - DE: Ersatz-ID. EN: Fallback id.
 * @returns {object} DE: Taskkopie. EN: Task copy.
 */
function copyStoredTask(task, fallbackId) {
  const copy = Object.assign({}, task);
  if (!copy.id) copy.id = String(fallbackId);
  return copy;
}


/**
 * DE: Wandelt gespeicherte Firebase-Tasks in eine Liste mit stabilen IDs um.
 * EN: Converts stored Firebase tasks into a list with stable ids.
 * @param {object|Array|null} data - DE: Firebase-Daten. EN: Firebase data.
 * @returns {Array} DE: Taskliste. EN: Task list.
 */
function mapStoredTasks(data) {
  const tasks = [];
  if (!data) return tasks;
  for (const key in data) {
    if (data[key]) tasks.push(copyStoredTask(data[key], key));
  }
  return tasks;
}


/**
 * DE: Aktualisiert das Symbol eines Passwortfeldes.
 * EN: Updates a password field icon.
 * @param {HTMLInputElement} input - DE: Passwortfeld. EN: Password field.
 * @param {HTMLImageElement} icon - DE: Icon. EN: Icon.
 */
function updatePasswordIcon(input, icon) {
  if (!input.value) {
    input.type = "password";
    icon.src = "./assets/icons/lock.svg";
  } else if (input.type === "password") {
    icon.src = "./assets/icons/visibility_off.svg";
  } else {
    icon.src = "./assets/icons/visibility.svg";
  }
}


/**
 * DE: Aktualisiert Symbol und Beschriftung eines Passwort-Buttons.
 * EN: Updates a password button icon and label.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function updatePasswordToggle(button) {
  const input = document.getElementById(button.getAttribute("data-target"));
  if (!input) return;
  updatePasswordIcon(input, button.querySelector("img"));
  const label = input.type === "password" ? "Show password" : "Hide password";
  button.setAttribute("aria-label", label);
}


/**
 * DE: Schaltet die Passwortsichtbarkeit um.
 * EN: Toggles password visibility.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function togglePasswordVisibility(button) {
  const input = document.getElementById(button.getAttribute("data-target"));
  if (!input || !input.value) return;
  input.type = input.type === "password" ? "text" : "password";
  updatePasswordToggle(button);
}


/**
 * DE: Verknüpft ein Passwortfeld mit seinem Sichtbarkeits-Button.
 * EN: Connects a password field with its visibility button.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function initializePasswordToggle(button) {
  const input = document.getElementById(button.getAttribute("data-target"));
  if (!input) return;
  updatePasswordToggle(button);
  input.addEventListener("input", () => updatePasswordToggle(button));
  button.addEventListener("click", () => togglePasswordVisibility(button));
}


/**
 * DE: Initialisiert alle Passwort-Buttons der aktuellen Seite.
 * EN: Initializes all password buttons on the current page.
 */
function initializePasswordToggles() {
  const buttons = document.querySelectorAll("[data-password-toggle]");
  for (let i = 0; i < buttons.length; i++) initializePasswordToggle(buttons[i]);
}


/**
 * DE: Meldet den aktuellen Zugang ab.
 * EN: Logs out the current access.
 */
function logoutUser() {
  sessionStorage.removeItem(SUMMARY_GREETING_PENDING_KEY);
  clearGuestLocalData();
  sessionStorage.removeItem(USER_MODE_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(USER_MODE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "./index.html";
}


/**
 * DE: Entfernt den Gaststatus beim Wechsel zum Login.
 * EN: Clears guest mode when switching to login.
 */
function clearGuestForLogin() {
  if (getUserMode() !== "guest") return;
  sessionStorage.removeItem(SUMMARY_GREETING_PENDING_KEY);
  clearGuestLocalData();
  sessionStorage.removeItem(USER_MODE_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(USER_MODE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}


/**
 * DE: Initialisiert das gemeinsame App-Verhalten.
 * EN: Initializes shared app behavior.
 */
function initializeCommonApp() {
  if (!protectCurrentPage()) return;
  initializePasswordToggles();
  updateUserInitials();
  updatePublicLayout();
  updateHelpButton();
}


/**
 * DE: Prüft die Sitzung erneut, wenn eine Seite aus dem Browser-Cache erscheint.
 * EN: Rechecks the session when a page is restored from browser cache.
 */
function handlePageShow() {
  if (!protectCurrentPage()) return;
  updateUserInitials();
  updatePublicLayout();
}


document.addEventListener("DOMContentLoaded", initializeCommonApp);
window.addEventListener("pageshow", handlePageShow);

// Remove persistent session data left by older versions.
localStorage.removeItem(USER_MODE_KEY);
localStorage.removeItem(CURRENT_USER_KEY);
localStorage.removeItem("joinGuestContacts");
localStorage.removeItem("joinGuestTasks");

protectCurrentPage();

if (profileButton) profileButton.addEventListener("click", toggleProfileMenu);
if (logoutButton) logoutButton.addEventListener("click", logoutUser);

const loginLinks = document.querySelectorAll("[data-login-link]");
for (let i = 0; i < loginLinks.length; i++) {
  loginLinks[i].addEventListener("click", clearGuestForLogin);
}
