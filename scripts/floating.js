/**
 * DE: Liest die gemeinsame Animationsdauer. EN: Reads the shared animation duration.
 * @returns {number} DE: Millisekunden. EN: Milliseconds.
 */
function getFloatingDuration() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--floating-duration")) || 350;
}


/**
 * DE: Animiert einen Dialog ohne Positionssprung. EN: Animates a dialog without jumping.
 * @param {HTMLDialogElement} dialog - DE: Dialog. EN: Dialog.
 * @param {boolean} opening - DE: Öffnungsrichtung. EN: Opening direction.
 * @param {boolean} fresh - DE: Erster sichtbarer Frame. EN: First visible frame.
 * @returns {Animation} DE: Animation. EN: Animation.
 */
function animateFloatingDialog(dialog, opening, fresh = false) {
  const target = dialog.querySelector(".contact-dialog-card") || dialog;
  const outside = "calc(50vw + 50% + 16px) 0px";
  const current = fresh ? outside : getComputedStyle(target).translate;
  if (dialog.floatingAnimation) dialog.floatingAnimation.cancel();
  const frames = [{ translate: current === "none" ? "0px 0px" : current }, { translate: opening ? "0px 0px" : outside }];
  const easing = getComputedStyle(document.documentElement).getPropertyValue("--floating-easing").trim();
  dialog.floatingAnimation = target.animate(frames, { duration: getFloatingDuration(), easing, fill: "forwards" });
  return dialog.floatingAnimation;
}


/**
 * DE: Öffnet einen Dialog von rechts. EN: Opens a dialog from the right.
 * @param {HTMLDialogElement} dialog - DE: Dialog. EN: Dialog.
 */
function showFloatingDialog(dialog) {
  if (!dialog) return;
  const fresh = !dialog.open;
  if (fresh) dialog.showModal();
  animateFloatingDialog(dialog, true, fresh);
}


/**
 * DE: Schließt erst nach der Ausfahrt. EN: Closes only after the exit animation.
 * @param {HTMLDialogElement} dialog - DE: Dialog. EN: Dialog.
 * @returns {Promise<void>} DE: Abschluss. EN: Completion.
 */
async function closeFloatingDialog(dialog) {
  if (!dialog || !dialog.open) return;
  const animation = animateFloatingDialog(dialog, false);
  try {
    await animation.finished;
    if (dialog.floatingAnimation !== animation) return;
    dialog.close();
    animation.cancel();
  } catch { /* DE: Eine neue Bewegung ersetzt die alte. EN: A new movement replaces the old one. */ }
}


/**
 * DE: Animiert auch Escape. EN: Animates Escape dismissal too.
 * @param {Event} event - DE: Abbruchereignis. EN: Cancel event.
 */
function cancelFloatingDialog(event) {
  event.preventDefault();
  closeFloatingDialog(event.currentTarget);
}
