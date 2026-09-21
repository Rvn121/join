const CONTACT_PANEL_WIDTH_KEY = "joinContactsPanelWidth";
const contactsPanel = document.getElementById("contactsPanel");
const contactsResizer = document.getElementById("contactsResizer");
let resizeStartX = 0;
let resizeStartWidth = 0;
let isContactPanelResizing = false;

/**
 * DE: Stellt die zuletzt gespeicherte Breite der Kontaktleiste wieder her.
 * EN: Restores the last saved width of the contact panel.
 */
function restoreContactPanelWidth() {
  const storedWidth = Number(localStorage.getItem(CONTACT_PANEL_WIDTH_KEY));
  if (storedWidth < 260 || storedWidth > 520) return;
  contactsPanel.style.width = storedWidth + "px";
}


/**
 * DE: Begrenzt eine neue Breite auf den erlaubten Bereich.
 * EN: Limits a new width to the allowed range.
 * @param {number} width - DE: Gewünschte Breite. EN: Requested width.
 * @returns {number} DE: Begrenzte Breite. EN: Limited width.
 */
function limitContactPanelWidth(width) {
  if (width < 260) return 260;
  if (width > 520) return 520;
  return width;
}


/**
 * DE: Speichert und setzt die neue Breite der Kontaktleiste.
 * EN: Stores and applies the new width of the contact panel.
 * @param {number} width - DE: Breite. EN: Width.
 */
function applyContactPanelWidth(width) {
  const newWidth = limitContactPanelWidth(width);
  contactsPanel.style.width = newWidth + "px";
  localStorage.setItem(CONTACT_PANEL_WIDTH_KEY, String(Math.round(newWidth)));
}


/**
 * DE: Startet das Ziehen der Kontaktleiste.
 * EN: Starts dragging the contact panel.
 * @param {PointerEvent} event - DE: Zeigerereignis. EN: Pointer event.
 */
function startContactPanelResize(event) {
  if (window.innerWidth <= 991) return;
  resizeStartX = event.clientX;
  resizeStartWidth = contactsPanel.getBoundingClientRect().width;
  isContactPanelResizing = true;
  document.body.classList.add("contacts-resizing");
}


/**
 * DE: Verändert die Breite der Kontaktleiste beim Ziehen.
 * EN: Changes the contact panel width while dragging.
 * @param {PointerEvent} event - DE: Zeigerereignis. EN: Pointer event.
 */
function resizeContactPanel(event) {
  if (!isContactPanelResizing) return;
  const difference = event.clientX - resizeStartX;
  applyContactPanelWidth(resizeStartWidth + difference);
}


/**
 * DE: Beendet das Ziehen der Kontaktleiste.
 * EN: Stops dragging the contact panel.
 */
function stopContactPanelResize() {
  if (!isContactPanelResizing) return;
  isContactPanelResizing = false;
  document.body.classList.remove("contacts-resizing");
}


/**
 * DE: Verändert die Breite der Kontaktleiste mit der Tastatur.
 * EN: Changes the contact panel width with the keyboard.
 * @param {KeyboardEvent} event - DE: Tastaturereignis. EN: Keyboard event.
 */
function resizeContactPanelWithKeyboard(event) {
  if (window.innerWidth <= 991) return;
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const currentWidth = contactsPanel.getBoundingClientRect().width;
  const change = event.key === "ArrowLeft" ? -20 : 20;
  applyContactPanelWidth(currentWidth + change);
}


/**
 * DE: Initialisiert die Größenänderung der Kontaktleiste.
 * EN: Initializes contact panel resizing.
 */
function initializeContactResizer() {
  restoreContactPanelWidth();
  contactsResizer.addEventListener("pointerdown", startContactPanelResize);
  document.addEventListener("pointermove", resizeContactPanel);
  document.addEventListener("pointerup", stopContactPanelResize);
  contactsResizer.addEventListener("keydown", resizeContactPanelWithKeyboard);
}
