const loginDialog = document.getElementById("loginDialog");
const loginForm = document.getElementById("loginForm");

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
  if (!loginDialog.open) loginDialog.show();
  requestAnimationFrame(() => document.body.classList.add("login-visible"));
}

/**
 * DE: Startet die Intro-Animation der Landingpage in der vorgesehenen Reihenfolge.
 * EN: Starts the landing page intro animation in the intended sequence.
 */
function startLandingAnimation() {
  window.setTimeout(moveLogoToCorner, 1100);
  window.setTimeout(showLoginDialog, 1800);
}

/**
 * DE: Verhindert nach erfolgreicher HTML5-Validierung ein Neuladen der Seite.
 * EN: Prevents a page reload after successful HTML5 validation.
 * @param {SubmitEvent} event - DE: Formularereignis. EN: Form event.
 */
function handleLoginSubmit(event) {
  event.preventDefault();
}

window.addEventListener("DOMContentLoaded", startLandingAnimation);
loginForm.addEventListener("submit", handleLoginSubmit);
