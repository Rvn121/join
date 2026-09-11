const USER_MODE_KEY = "joinUserMode";
const CURRENT_USER_KEY = "joinCurrentUser";
const userInitials = document.getElementById("userInitials");
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");
const logoutButton = document.getElementById("logoutButton");

/**
 * DE: Gibt den aktuellen Zugangsmodus zurück.
 * EN: Returns the current access mode.
 * @returns {string|null} DE: Modus. EN: Mode.
 */
function getUserMode() {
  return localStorage.getItem(USER_MODE_KEY);
}


/**
 * DE: Liest den aktuell angemeldeten Benutzer.
 * EN: Reads the currently logged-in user.
 * @returns {object|null} DE: Benutzer. EN: User.
 */
function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}


/**
 * DE: Prüft, ob die Seite geschützt ist.
 * EN: Checks whether the page is protected.
 * @returns {boolean} DE: Schutzstatus. EN: Protection status.
 */
function isProtectedPage() {
  return document.body.dataset.protectedPage === "true";
}


/**
 * DE: Leitet nicht angemeldete Besucher zum Login.
 * EN: Redirects signed-out visitors to login.
 */
function protectCurrentPage() {
  if (!isProtectedPage() || getUserMode()) return;
  window.location.replace("./index.html");
}


/**
 * DE: Setzt die Anzeige eines registrierten Benutzers.
 * EN: Sets the registered user's avatar display.
 * @param {object} user - DE: Benutzer. EN: User.
 */
function showRegisteredUser(user) {
  if (!user || !profileButton) return;
  userInitials.textContent = user.initials;
  profileButton.style.backgroundColor = user.color;
  profileButton.classList.add("has-user-color");
}


/**
 * DE: Aktualisiert Initialen und Benutzerfarbe.
 * EN: Updates initials and user color.
 */
function updateUserInitials() {
  if (!userInitials) return;
  if (getUserMode() === "guest") return userInitials.textContent = "G";
  showRegisteredUser(getCurrentUser());
}


/**
 * DE: Schaltet Privacy und Legal auf externes Layout.
 * EN: Switches Privacy and Legal to the external layout.
 */
function updatePublicLayout() {
  const publicPage = document.body.dataset.publicPage === "true";
  document.body.classList.toggle("external-layout", publicPage && getUserMode() !== "user");
}


/**
 * DE: Blendet Hilfe auf der Hilfeseite aus.
 * EN: Hides help on the help page.
 */
function updateHelpButton() {
  const helpButton = document.getElementById("helpButton");
  if (helpButton) helpButton.hidden = document.body.dataset.page === "help";
}


/**
 * DE: Öffnet oder schließt das Profilmenü.
 * EN: Opens or closes the profile menu.
 */
function toggleProfileMenu() {
  if (!profileMenu) return;
  profileMenu.hidden = !profileMenu.hidden;
}


/**
 * DE: Meldet den aktuellen Zugang ab.
 * EN: Logs out the current access.
 */
function logoutUser() {
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
  localStorage.removeItem(USER_MODE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}


/**
 * DE: Initialisiert das gemeinsame App-Verhalten.
 * EN: Initializes shared app behavior.
 */
function initializeCommonApp() {
  protectCurrentPage();
  updateUserInitials();
  updatePublicLayout();
  updateHelpButton();
}


document.addEventListener("DOMContentLoaded", initializeCommonApp);
if (profileButton) profileButton.addEventListener("click", toggleProfileMenu);
if (logoutButton) logoutButton.addEventListener("click", logoutUser);
document.querySelectorAll("[data-login-link]").forEach((link) => {
  link.addEventListener("click", clearGuestForLogin);
});
