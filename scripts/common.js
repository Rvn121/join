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
  if (!user) return null;
  return JSON.parse(user);
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
 * DE: Schaltet Privacy und Legal auf externes Layout.
 * EN: Switches Privacy and Legal to the external layout.
 */
function updatePublicLayout() {
  const publicPage = document.body.getAttribute("data-public-page") === "true";
  document.body.classList.toggle("external-layout", publicPage && getUserMode() !== "user");
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
 * DE: Erstellt einen Link für das Profilmenü.
 * EN: Creates a link for the profile menu.
 * @param {string} label - DE: Linktext. EN: Link label.
 * @param {string} href - DE: Ziel. EN: Target.
 * @returns {HTMLAnchorElement} DE: Link. EN: Link.
 */
function createProfileMenuLink(label, href) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  return link;
}


/**
 * DE: Ergänzt Legal Notice und Privacy Policy im Profilmenü.
 * EN: Adds Legal Notice and Privacy Policy to the profile menu.
 */
function addProfileMenuLinks() {
  if (!profileMenu || !logoutButton || profileMenu.querySelector("a")) return;
  const legalLink = createProfileMenuLink("Legal Notice", "./legalNotice.html");
  const privacyLink = createProfileMenuLink("Privacy Policy", "./privacyPolicy.html");
  profileMenu.insertBefore(privacyLink, logoutButton);
  profileMenu.insertBefore(legalLink, privacyLink);
}


/**
 * DE: Gibt den Icon-Pfad für einen Navigationslink zurück.
 * EN: Returns the icon path for a navigation link.
 * @param {HTMLAnchorElement} link - DE: Navigationslink. EN: Navigation link.
 * @returns {string} DE: Icon-Pfad. EN: Icon path.
 */
function getSidebarIconPath(link) {
  const href = link.getAttribute("href");
  if (href === "./summary.html") return "./assets/icons/summary.svg";
  if (href === "./addTask.html") return "./assets/icons/edit_square.svg";
  if (href === "./board.html") return "./assets/icons/board.svg";
  if (href === "./contacts.html") return "./assets/icons/contact.svg";
  return "";
}


/**
 * DE: Ergänzt die Icons in der Hauptnavigation.
 * EN: Adds the icons to the main navigation.
 */
function addSidebarNavigationIcons() {
  const links = document.querySelectorAll(".app-navigation .sidebar-link");
  for (let i = 0; i < links.length; i++) {
    const iconPath = getSidebarIconPath(links[i]);
    if (!iconPath || links[i].querySelector("img")) continue;
    const icon = document.createElement("img");
    icon.className = "sidebar-link-icon";
    icon.src = iconPath;
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    links[i].insertBefore(icon, links[i].firstChild);
  }
}


/**
 * DE: Ergänzt das Login-Icon in der Seitenleiste.
 * EN: Adds the login icon to the sidebar.
 */
function addLoginLinkIcons() {
  for (let i = 0; i < loginLinks.length; i++) {
    if (loginLinks[i].querySelector("img")) continue;
    const icon = document.createElement("img");
    icon.className = "sidebar-link-icon";
    icon.src = "./assets/icons/login.svg";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    loginLinks[i].insertBefore(icon, loginLinks[i].firstChild);
  }
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
 * DE: Entfernt ausschließlich lokale Testdaten des Gastzugangs.
 * EN: Clears guest-only local test data.
 */
function clearGuestLocalData() {
  localStorage.removeItem("joinGuestContacts");
  localStorage.removeItem("joinGuestTasks");
}


/**
 * DE: Liest die lokal gespeicherten Gast-Tasks.
 * EN: Reads the locally stored guest tasks.
 * @returns {Array|null} DE: Gast-Tasks. EN: Guest tasks.
 */
function getGuestTaskData() {
  const tasks = localStorage.getItem("joinGuestTasks");
  if (!tasks) return null;
  return JSON.parse(tasks);
}


/**
 * DE: Speichert Tasks ausschließlich in der lokalen Gastsicht.
 * EN: Stores tasks only in the local guest view.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 */
function setGuestTaskData(tasks) {
  localStorage.setItem("joinGuestTasks", JSON.stringify(tasks));
}


/**
 * DE: Kopiert einen gespeicherten Task und ergänzt bei Bedarf seine ID.
 * EN: Copies a stored task and adds its id when needed.
 * @param {object} task - DE: Gespeicherter Task. EN: Stored task.
 * @param {string} fallbackId - DE: Ersatz-ID. EN: Fallback id.
 * @returns {object} DE: Taskkopie. EN: Task copy.
 */
function copyStoredTask(task, fallbackId) {
  const copy = {};
  for (let key in task) {
    copy[key] = task[key];
  }
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
  for (let key in data) {
    if (data[key]) tasks.push(copyStoredTask(data[key], key));
  }
  return tasks;
}


/**
 * DE: Sucht vom geklickten Element nach oben nach einem Datenattribut.
 * EN: Searches upward from a clicked element for a data attribute.
 * @param {HTMLElement} element - DE: Start-Element. EN: Start element.
 * @param {string} attributeName - DE: Attributname. EN: Attribute name.
 * @returns {HTMLElement|null} DE: Gefundenes Element. EN: Found element.
 */
function findParentWithAttribute(element, attributeName) {
  let current = element;
  while (current && current !== document.body) {
    if (current.hasAttribute && current.hasAttribute(attributeName)) return current;
    current = current.parentElement;
  }
  return null;
}


/**
 * DE: Sucht vom geklickten Element nach oben nach einem Button.
 * EN: Searches upward from a clicked element for a button.
 * @param {HTMLElement} element - DE: Start-Element. EN: Start element.
 * @returns {HTMLElement|null} DE: Button. EN: Button.
 */
function findParentButton(element) {
  let current = element;
  while (current && current !== document.body) {
    if (current.tagName === "BUTTON") return current;
    current = current.parentElement;
  }
  return null;
}


/**
 * DE: Meldet den aktuellen Zugang ab.
 * EN: Logs out the current access.
 */
function logoutUser() {
  clearGuestLocalData();
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
  clearGuestLocalData();
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
  addProfileMenuLinks();
  addSidebarNavigationIcons();
  addLoginLinkIcons();
}


document.addEventListener("DOMContentLoaded", initializeCommonApp);
if (profileButton) profileButton.addEventListener("click", toggleProfileMenu);
if (logoutButton) logoutButton.addEventListener("click", logoutUser);
const loginLinks = document.querySelectorAll("[data-login-link]");
for (let i = 0; i < loginLinks.length; i++) {
  loginLinks[i].addEventListener("click", clearGuestForLogin);
}
