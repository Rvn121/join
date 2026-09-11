const USER_MODE_KEY = "joinUserMode";
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
 * DE: Zeigt beim Gast den Buchstaben G.
 * EN: Shows the letter G for guests.
 */
function updateUserInitials() {
  if (!userInitials) return;
  userInitials.textContent = getUserMode() === "guest" ? "G" : "";
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
  window.location.href = "./index.html";
}


/**
 * DE: Entfernt Gaststatus beim Wechsel zum Login.
 * EN: Clears guest mode when switching to login.
 */
function clearGuestForLogin() {
  if (getUserMode() === "guest") localStorage.removeItem(USER_MODE_KEY);
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
