const USER_MODE_KEY = "joinUserMode";
const GUEST_DATA_KEY = "joinGuestData";
const appContent = document.getElementById("appContent");
const helpButton = document.getElementById("helpButton");
const userInitials = document.getElementById("userInitials");

const viewFiles = {
  summary: "./content/summary.html",
  "add-task": "./content/add_task.html",
  board: "./content/board.html",
  contacts: "./content/contacts.html",
  help: "./content/help.html",
  privacy: "./content/privacy.html",
  legal: "./content/legal_notice.html",
};

/**
 * DE: Gibt den aktuell gespeicherten Zugangsmodus zurück.
 * EN: Returns the currently stored access mode.
 * @returns {string|null} DE: Zugangsmodus. EN: Access mode.
 */
function getUserMode() {
  return localStorage.getItem(USER_MODE_KEY);
}

/**
 * DE: Prüft, ob der aktuelle Zugang ein Gastzugang ist.
 * EN: Checks whether the current access is a guest access.
 * @returns {boolean} DE: Gaststatus. EN: Guest status.
 */
function isGuestSession() {
  return getUserMode() === "guest";
}

/**
 * DE: Liest den aktuellen View aus der URL.
 * EN: Reads the current view from the URL.
 * @returns {string} DE: View-Name. EN: View name.
 */
function getCurrentView() {
  const view = window.location.hash.replace("#", "");
  return viewFiles[view] ? view : "summary";
}

/**
 * DE: Prüft, ob eine Seite ohne Anmeldung geöffnet werden darf.
 * EN: Checks whether a view may be opened without signing in.
 * @param {string} view - DE: View-Name. EN: View name.
 * @returns {boolean} DE: Öffentlicher Status. EN: Public status.
 */
function isPublicView(view) {
  return view === "privacy" || view === "legal";
}

/**
 * DE: Leitet nicht angemeldete Besucher bei geschützten Seiten zum Login.
 * EN: Redirects signed-out visitors from protected views to the login.
 * @param {string} view - DE: View-Name. EN: View name.
 */
function protectView(view) {
  if (getUserMode() || isPublicView(view)) return;
  window.location.href = "./index.html";
}

/**
 * DE: Prüft, ob die reduzierte externe Navigation benötigt wird.
 * EN: Checks whether the reduced external navigation is required.
 * @param {string} view - DE: View-Name. EN: View name.
 * @returns {boolean} DE: Externer Status. EN: External status.
 */
function usesExternalLayout(view) {
  return isPublicView(view) && getUserMode() !== "user";
}

/**
 * DE: Schaltet zwischen App- und externer Navigation um.
 * EN: Switches between app and external navigation.
 * @param {string} view - DE: View-Name. EN: View name.
 */
function updateLayout(view) {
  document.body.classList.toggle("external-layout", usesExternalLayout(view));
}

/**
 * DE: Zeigt für den Gast den Buchstaben G im Benutzerkreis.
 * EN: Shows the letter G in the user circle for guests.
 */
function updateUserInitials() {
  if (!userInitials) return;
  userInitials.textContent = isGuestSession() ? "G" : "";
}

/**
 * DE: Markiert den aktuell geöffneten Menüpunkt.
 * EN: Marks the currently opened navigation item.
 * @param {string} view - DE: View-Name. EN: View name.
 */
function updateActiveLink(view) {
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === view);
  });
}

/**
 * DE: Blendet auf der Hilfeseite das Fragezeichen aus.
 * EN: Hides the help icon on the help view.
 * @param {string} view - DE: View-Name. EN: View name.
 */
function updateHelpButton(view) {
  if (!helpButton) return;
  helpButton.hidden = view === "help";
}

/**
 * DE: Lädt das HTML-Fragment für den aktuellen Contentbereich.
 * EN: Loads the HTML fragment for the current content area.
 * @param {string} view - DE: View-Name. EN: View name.
 */
async function loadViewContent(view) {
  const response = await fetch(viewFiles[view]);
  if (!response.ok) throw new Error("Content could not be loaded.");
  appContent.innerHTML = await response.text();
}

/**
 * DE: Zeigt eine einfache Fehlermeldung im Contentbereich.
 * EN: Shows a simple error message in the content area.
 */
function showContentError() {
  appContent.innerHTML = "<p class=\"content-error\">Content could not be loaded.</p>";
}

/**
 * DE: Rendert den aktuellen App-View.
 * EN: Renders the current app view.
 */
async function renderCurrentView() {
  const view = getCurrentView();
  protectView(view);
  updateLayout(view);
  updateUserInitials();
  updateActiveLink(view);
  updateHelpButton(view);
  try {
    await loadViewContent(view);
  } catch (error) {
    console.error(error);
    showContentError();
  }
}

/**
 * DE: Liest die zukünftigen Gastdaten aus dem Local Storage.
 * EN: Reads future guest data from local storage.
 * @returns {object} DE: Gastdaten. EN: Guest data.
 */
function getGuestData() {
  const data = localStorage.getItem(GUEST_DATA_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * DE: Speichert zukünftige Gastdaten im Local Storage.
 * EN: Stores future guest data in local storage.
 * @param {object} data - DE: Zu speichernde Gastdaten. EN: Guest data to store.
 */
function saveGuestData(data) {
  if (!isGuestSession()) return;
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
}

window.addEventListener("DOMContentLoaded", renderCurrentView);
window.addEventListener("hashchange", renderCurrentView);
