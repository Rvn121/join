const GUEST_SESSION_KEY = "joinUserMode";
const GUEST_DATA_KEY = "joinGuestData";
const loginDialog = document.getElementById("loginDialog");
const loginForm = document.getElementById("loginForm");
const guestLoginButton = document.getElementById("guestLoginButton");

/**
 * DE: Bewegt das Join-Logo aus der Mitte in die linke obere Ecke.
 * EN: Moves the Join logo from the center to the upper-left corner.
 */
function moveLogoToCorner() {
  document.body.classList.add("logo-corner");
}

/**
 * DE: Öffnet den Login-Dialog und blendet die Landingpage-Inhalte ein.
 * EN: Opens the login dialog and reveals the landing page content.
 */
function showLoginDialog() {
  if (!loginDialog) return;
  if (!loginDialog.open) loginDialog.show();
  requestAnimationFrame(() => document.body.classList.add("login-visible"));
}

/**
 * DE: Startet die Intro-Animation nur auf der Landingpage.
 * EN: Starts the intro animation only on the landing page.
 */
function startLandingAnimation() {
  if (!loginDialog) return;
  window.setTimeout(moveLogoToCorner, 1100);
  window.setTimeout(showLoginDialog, 1800);
}

/**
 * DE: Legt den Gastmodus und einen Speicherbereich im Local Storage an.
 * EN: Creates guest mode and a storage area in local storage.
 */
function saveGuestSession() {
  localStorage.setItem(GUEST_SESSION_KEY, "guest");
  if (localStorage.getItem(GUEST_DATA_KEY)) return;
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({}));
}

/**
 * DE: Öffnet die App-Summary als Gast.
 * EN: Opens the app summary as a guest.
 */
function openGuestSummary() {
  saveGuestSession();
  window.location.href = "./app.html#summary";
}

/**
 * DE: Verhindert ein Absenden ohne echte Benutzer-Authentifizierung.
 * EN: Prevents submission without real user authentication.
 * @param {SubmitEvent} event - DE: Formularereignis. EN: Form event.
 */
function handleLoginSubmit(event) {
  event.preventDefault();
}

/**
 * DE: Initialisiert die Landingpage.
 * EN: Initializes the landing page.
 */
function initializeLandingPage() {
  startLandingAnimation();
}

window.addEventListener("DOMContentLoaded", initializeLandingPage);
if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);
if (guestLoginButton) guestLoginButton.addEventListener("click", openGuestSummary);
