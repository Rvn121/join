const floatingAnimations = new WeakMap();
const floatingDialogClosers = new Map();

/**
 * DE: Schließt Menüs und Dialoge bei Klick außerhalb.
 * EN: Dismisses menus and dialogs on outside clicks.
 * @param {PointerEvent} event - DE: Zeiger-Ereignis. EN: Pointer event.
 */
function closeOutsideElements(event) {
  closeProfileMenuOutside(event);
  const dialogs = Array.from(floatingDialogClosers.entries()).reverse();
  for (const [dialog, close] of dialogs) {
    if (!dialog.open) continue;
    if (event.target !== dialog && dialog.contains(event.target)) break;
    if (!isPointInsideDialog(dialog, event)) close();
    break;
  }
}


/**
 * DE: Schließt das Profilmenü bei Klick außerhalb.
 * EN: Closes the profile menu on an outside click.
 * @param {PointerEvent} event - DE: Zeiger-Ereignis. EN: Pointer event.
 */
function closeProfileMenuOutside(event) {
  if (!profileMenu || profileMenu.hidden) return;
  if (profileMenu.contains(event.target) || profileButton?.contains(event.target)) return;
  profileMenu.hidden = true;
  profileButton?.setAttribute("aria-expanded", "false");
}


/**
 * DE: Prüft, ob ein Zeigerereignis innerhalb der Dialogfläche liegt.
 * EN: Checks whether a pointer event lies inside the dialog surface.
 * @param {HTMLDialogElement} dialog - DE: Dialog. EN: Dialog.
 * @param {PointerEvent} event - DE: Zeiger-Ereignis. EN: Pointer event.
 * @returns {boolean} DE: Innerhalb. EN: Inside.
 */
function isPointInsideDialog(dialog, event) {
  const surface = dialog.querySelector(".contact-dialog-card") || dialog;
  const bounds = surface.getBoundingClientRect();
  return event.clientX >= bounds.left && event.clientX <= bounds.right &&
    event.clientY >= bounds.top && event.clientY <= bounds.bottom;
}

document.addEventListener("pointerdown", closeOutsideElements);


/**
 * DE: Gibt die Translate-Position außerhalb des rechten Bildschirmrands zurück.
 * EN: Returns the translate position outside the right screen edge.
 * @param {HTMLElement} element - DE: Element. EN: Element.
 * @returns {string} DE: Translate-Wert. EN: Translate value.
 */
function getFloatingOutsidePosition(element) {
  const distance = window.innerWidth - element.getBoundingClientRect().left + 24;
  return distance + "px 0px";
}


/**
 * DE: Startet den horizontalen Ein- oder Ausflug eines Elements.
 * EN: Starts the horizontal entrance or exit of an element.
 * @param {HTMLElement} element - DE: Element. EN: Element.
 * @param {boolean} entering - DE: Einflug. EN: Entering.
 * @param {string|null} current - DE: Aktuelle Translate-Position. EN: Current translate position.
 * @returns {Animation} DE: Animation. EN: Animation.
 */
function startFloatingAnimation(element, entering, current) {
  const outside = getFloatingOutsidePosition(element);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return element.animate([
    { translate: current || (entering ? outside : "0px 0px") },
    { translate: entering ? "0px 0px" : outside },
  ], { duration: reduced ? 0 : 300, easing: "ease-in-out", fill: "forwards" });
}


/**
 * DE: Wartet auf das Ende einer Animation und räumt sie danach auf.
 * EN: Waits for an animation to finish and cleans it up afterwards.
 * @param {HTMLElement} element - DE: Element. EN: Element.
 * @param {Animation} animation - DE: Animation. EN: Animation.
 * @returns {Promise<boolean>} DE: Erfolgreich beendet. EN: Finished successfully.
 */
async function waitForFloatingAnimation(element, animation) {
  try {
    await animation.finished;
    return true;
  } catch {
    return false;
  } finally {
    if (floatingAnimations.get(element) === animation) {
      floatingAnimations.delete(element);
      animation.cancel();
    }
  }
}


/**
 * DE: Einheitlicher horizontaler Ein-/Ausflug für Dialoge und Toasts.
 * EN: Shared horizontal entrance/exit for dialogs and toasts.
 * @param {HTMLElement} element - DE: Element. EN: Element.
 * @param {boolean} entering - DE: Einflug. EN: Entering.
 * @returns {Promise<boolean>} DE: Erfolgreich beendet. EN: Finished successfully.
 */
async function animateFloatingElement(element, entering) {
  const previous = floatingAnimations.get(element);
  if (element.dataset.dialogMotion === "none") {
    if (previous) previous.cancel();
    return true;
  }
  const current = previous ? getComputedStyle(element).translate : null;
  if (previous) previous.cancel();
  const animation = startFloatingAnimation(element, entering, current);
  floatingAnimations.set(element, animation);
  return waitForFloatingAnimation(element, animation);
}


/**
 * DE: Öffnet einen Dialog mit gemeinsamer Animation.
 * EN: Opens a dialog with the shared animation.
 * @param {HTMLDialogElement} dialog - DE: Dialog. EN: Dialog.
 * @param {boolean} modal - DE: Modal öffnen. EN: Open as modal.
 * @param {Function} onClose - DE: Schließfunktion. EN: Close handler.
 * @returns {Promise<boolean>} DE: Animation beendet. EN: Animation finished.
 */
function openFloatingDialog(dialog, modal = true, onClose = () => closeFloatingDialog(dialog)) {
  floatingDialogClosers.delete(dialog);
  floatingDialogClosers.set(dialog, onClose);
  if (!dialog.open) {
    if (modal) dialog.showModal();
    else dialog.show();
  }
  dialog.oncancel = (event) => {
    event.preventDefault();
    onClose();
  };
  return animateFloatingElement(dialog.querySelector(".contact-dialog-card") || dialog, true);
}

/**
 * DE: Wartet vor dem Schließen auf den Ausflug.
 * EN: Waits for the exit animation before closing.
 * @param {HTMLDialogElement} dialog - DE: Dialog. EN: Dialog.
 * @param {boolean} animated - DE: Mit Animation. EN: Animated.
 * @returns {Promise<boolean>} DE: Geschlossen. EN: Closed.
 */
async function closeFloatingDialog(dialog, animated = true) {
  if (!dialog || !dialog.open) return false;
  const element = dialog.querySelector(".contact-dialog-card") || dialog;
  if (animated && !await animateFloatingElement(element, false)) return false;
  if (!animated) floatingAnimations.get(element)?.cancel();
  dialog.close();
  return true;
}
