/**
 * DE: Registriert die Touch-Ereignisse für das Verschieben von Karten.
 * EN: Registers the touch events for moving cards.
 */
function initializeBoardTouchEvents() {
  boardColumns.addEventListener("touchstart", startBoardTouch, { passive: true });
  document.addEventListener("touchmove", moveBoardTouch, { passive: false });
  document.addEventListener("touchend", finishBoardTouch, { passive: false });
  document.addEventListener("touchcancel", cancelBoardTouch);
  boardColumns.addEventListener("contextmenu", preventBoardTouchContextMenu);
  initializeBoardMoveMenu();
}


/**
 * DE: Registriert die Ereignisse des mobilen „Move to“-Menüs.
 * EN: Registers the events of the mobile "Move to" menu.
 */
function initializeBoardMoveMenu() {
  const menu = document.getElementById("taskMoveMenu");
  boardColumns.addEventListener("click", openBoardMoveMenu);
  menu.addEventListener("click", selectBoardMoveOption);
  document.addEventListener("scroll", closeBoardMoveMenuOnScroll, { capture: true, passive: true });
}


/**
 * DE: Gibt die Nachbarspalten eines Tasks als Menüeinträge zurück.
 * EN: Returns the neighbouring columns of a task as menu entries.
 * @param {object} task - DE: Task. EN: Task.
 * @returns {Array<{status: string, direction: string}>} DE: Einträge. EN: Entries.
 */
function getBoardMoveOptions(task) {
  const statuses = [TASK_STATUS_TODO, TASK_STATUS_PROGRESS, TASK_STATUS_FEEDBACK, TASK_STATUS_DONE];
  const index = statuses.indexOf(task.status);
  const options = [];
  if (index > 0) options.push({ status: statuses[index - 1], direction: "up" });
  if (index < statuses.length - 1) options.push({ status: statuses[index + 1], direction: "down" });
  return options;
}


/**
 * DE: Rendert die Einträge des „Move to“-Menüs für einen Task.
 * EN: Renders the "Move to" menu entries for a task.
 * @param {object} task - DE: Task. EN: Task.
 */
function renderBoardMoveMenu(task) {
  const options = getBoardMoveOptions(task);
  let html = "";
  for (let i = 0; i < options.length; i++) {
    html += getTaskMoveOptionTemplate(options[i].status, options[i].direction, getBoardStatusLabel(options[i].status));
  }
  document.getElementById("taskMoveMenuList").innerHTML = html;
}


/**
 * DE: Setzt das Menü mit der spitzen Ecke an das Icon der Karte (Figma: 15 px links vom Icon).
 * EN: Places the menu with its sharp corner at the card icon (Figma: 15 px left of the icon).
 * @param {HTMLElement} button - DE: Icon-Button. EN: Icon button.
 */
function positionBoardMoveMenu(button) {
  const menu = document.getElementById("taskMoveMenu");
  const bounds = button.getBoundingClientRect();
  const left = Math.min(bounds.left - 15, window.innerWidth - menu.offsetWidth - 16);
  menu.style.top = bounds.top + "px";
  menu.style.left = Math.max(16, left) + "px";
}


/**
 * DE: Öffnet das „Move to“-Menü über den Icon-Button einer Karte.
 * EN: Opens the "Move to" menu from a card's icon button.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function openBoardMoveMenu(event) {
  const button = event.target.closest("[data-move-task]");
  if (!button) return;
  const taskId = button.getAttribute("data-move-task");
  const task = getBoardTask(taskId);
  if (!task) return;
  boardState.moveTaskId = taskId;
  renderBoardMoveMenu(task);
  document.getElementById("taskMoveMenu").showPopover();
  positionBoardMoveMenu(button);
}


/**
 * DE: Verschiebt den Task in die gewählte Spalte.
 * EN: Moves the task to the chosen column.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function selectBoardMoveOption(event) {
  const option = event.target.closest("[data-move-status]");
  if (!option || !boardState.moveTaskId) return;
  document.getElementById("taskMoveMenu").hidePopover();
  moveBoardTask(boardState.moveTaskId, option.getAttribute("data-move-status"));
}


/**
 * DE: Schließt das Menü beim Scrollen, damit es nicht von seiner Karte getrennt stehen bleibt.
 * EN: Closes the menu on scroll so it does not stay detached from its card.
 */
function closeBoardMoveMenuOnScroll() {
  const menu = document.getElementById("taskMoveMenu");
  if (menu.matches(":popover-open")) menu.hidePopover();
}


/**
 * DE: Unterdrückt das Kontextmenü während eines Touch-Drags.
 * EN: Suppresses the context menu during a touch drag.
 * @param {Event} event - DE: Kontextmenü-Ereignis. EN: Context menu event.
 */
function preventBoardTouchContextMenu(event) {
  if (boardState.touchDrag) event.preventDefault();
}


/**
 * DE: Startet einen langen Druck; Bewegung vor der Aktivierung erlaubt weiterhin das Scrollen.
 * EN: Starts a long press; moving before activation keeps normal page scrolling.
 * @param {TouchEvent} event - DE: Touch-Ereignis. EN: Touch event.
 */
function startBoardTouch(event) {
  cancelBoardTouch();
  const card = event.target.closest("[data-task-id]");
  if (event.touches.length !== 1 || !card || event.target.closest("button, input, a")) return;
  const touch = event.touches[0];
  const drag = { card, x: touch.clientX, y: touch.clientY, active: false };
  boardState.touchDrag = drag;
  drag.timer = window.setTimeout(() => activateBoardTouch(drag), 350);
}


/**
 * DE: Aktiviert den Touch-Drag nach dem langen Druck.
 * EN: Activates the touch drag after the long press.
 * @param {object} drag - DE: Drag-Zustand. EN: Drag state.
 */
function activateBoardTouch(drag) {
  const card = drag.card;
  drag.active = true;
  boardState.draggingTaskId = card.getAttribute("data-task-id");
  drag.preview = createBoardTouchPreview(card);
  document.body.appendChild(drag.preview);
  card.classList.add("task-card--dragging");
  boardColumns.style.setProperty("--board-drop-height", card.offsetHeight + "px");
  updateBoardTouchTarget(drag);
  animateBoardTouch();
}


/**
 * DE: Erstellt die schwebende Vorschau einer gezogenen Karte.
 * EN: Creates the floating preview of a dragged card.
 * @param {HTMLElement} card - DE: Karte. EN: Card.
 * @returns {HTMLElement} DE: Vorschau. EN: Preview.
 */
function createBoardTouchPreview(card) {
  const preview = card.cloneNode(true);
  preview.removeAttribute("id");
  preview.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
  preview.classList.add("task-card--touch-preview");
  preview.setAttribute("aria-hidden", "true");
  preview.style.width = card.offsetWidth + "px";
  return preview;
}


/**
 * DE: Bewegt die Vorschau nach dem langen Druck, ohne die Seite per Touch zu scrollen.
 * EN: Moves the preview after a long press, without scrolling the page by touch.
 * @param {TouchEvent} event - DE: Touch-Ereignis. EN: Touch event.
 */
function moveBoardTouch(event) {
  const drag = boardState.touchDrag;
  if (!drag) return;
  if (event.touches.length !== 1) return cancelBoardTouch();
  const touch = event.touches[0];
  if (!drag.active) {
    if (Math.hypot(touch.clientX - drag.x, touch.clientY - drag.y) > 8) cancelBoardTouch();
    return;
  }
  event.preventDefault();
  drag.x = touch.clientX;
  drag.y = touch.clientY;
}


/**
 * DE: Scrollt nahe der Viewport-Ränder, damit auch verdeckte Spalten erreichbar sind.
 * EN: Scrolls near the viewport edges so off-screen status columns can be reached.
 */
function animateBoardTouch() {
  const drag = boardState.touchDrag;
  if (!drag || !drag.active) return;
  drag.preview.style.left = drag.x + "px";
  drag.preview.style.top = drag.y + "px";
  scrollBoardTouchEdges(drag.y);
  updateBoardTouchTarget(drag);
  drag.frame = window.requestAnimationFrame(animateBoardTouch);
}


/**
 * DE: Scrollt die Seite, wenn der Finger nahe am oberen oder unteren Rand ist.
 * EN: Scrolls the page when the finger is near the top or bottom edge.
 * @param {number} touchY - DE: Vertikale Fingerposition. EN: Vertical finger position.
 */
function scrollBoardTouchEdges(touchY) {
  // A scrolled-out header must not move the upper scroll zone above the viewport.
  const top = Math.max(0, document.querySelector(".app-header").getBoundingClientRect().bottom);
  const bottom = document.querySelector(".app-sidebar").getBoundingClientRect().top;
  const lowerEdge = bottom > top ? bottom : window.innerHeight;
  if (touchY < top + 64) window.scrollBy(0, -10);
  else if (touchY > lowerEdge - 64) window.scrollBy(0, 10);
}


/**
 * DE: Speichert den Zielstatus nur, wenn die Berührung über einer Spalte endet.
 * EN: Saves the target status only when a touch ends over a board column.
 * @param {TouchEvent} event - DE: Touch-Ereignis. EN: Touch event.
 */
function finishBoardTouch(event) {
  const drag = boardState.touchDrag;
  if (!drag) return;
  const taskId = boardState.draggingTaskId;
  const drop = drag.active ? readBoardTouchDrop(drag, event) : null;
  cancelBoardTouch();
  if (drop?.status && taskId) moveBoardTask(taskId, drop.status, drop.beforeTaskId);
}


/**
 * DE: Ermittelt die Ablageposition an der letzten Fingerposition.
 * EN: Determines the drop position at the last finger position.
 * @param {object} drag - DE: Drag-Zustand. EN: Drag state.
 * @param {TouchEvent} event - DE: Touch-Ereignis. EN: Touch event.
 * @returns {{status: string|null, beforeTaskId: string|null}} DE: Ablageziel. EN: Drop target.
 */
function readBoardTouchDrop(drag, event) {
  event.preventDefault();
  const touch = event.changedTouches[0];
  drag.x = touch.clientX;
  drag.y = touch.clientY;
  updateBoardTouchTarget(drag);
  return { status: drag.status, beforeTaskId: drag.beforeTaskId };
}


/**
 * DE: Räumt Timer und Darstellung bei Loslassen, Abbruch oder zweitem Finger auf.
 * EN: Clears timers and visuals on release, cancellation or a second touch.
 */
function cancelBoardTouch() {
  const drag = boardState.touchDrag;
  if (!drag) return;
  window.clearTimeout(drag.timer);
  window.cancelAnimationFrame(drag.frame);
  drag.preview?.remove();
  clearBoardInsertionMarker();
  if (drag.active) {
    boardState.suppressClickUntil = Date.now() + 500;
    endBoardDrag();
  }
  boardState.touchDrag = null;
}


/**
 * DE: Zeigt die Einfügelinie an der tatsächlichen Ablageposition.
 * EN: Shows an insertion line at the actual drop position without shifting hit targets.
 * @param {object} drag - DE: Drag-Zustand. EN: Drag state.
 */
function updateBoardTouchTarget(drag) {
  clearBoardInsertionMarker();
  drag.status = null;
  drag.beforeTaskId = null;
  const section = document.elementFromPoint(drag.x, drag.y)?.closest("[data-board-status]");
  if (!section) return;
  drag.status = section.getAttribute("data-board-status");
  const column = section.querySelector("[data-drop-status]");
  const cards = getBoardTouchTargetCards(column);
  const next = cards.find(card => drag.y < getBoardCardMiddle(card));
  if (next) drag.beforeTaskId = next.getAttribute("data-task-id");
  markBoardInsertion(column, cards, next);
}


/**
 * DE: Gibt die Karten einer Spalte ohne die gezogene Karte zurück.
 * EN: Returns the cards of a column without the dragged card.
 * @param {HTMLElement} column - DE: Spalte. EN: Column.
 * @returns {HTMLElement[]} DE: Karten. EN: Cards.
 */
function getBoardTouchTargetCards(column) {
  return Array.from(column.querySelectorAll("[data-task-id]"))
    .filter(card => card.getAttribute("data-task-id") !== boardState.draggingTaskId);
}


/**
 * DE: Gibt die vertikale Mitte einer Karte zurück.
 * EN: Returns the vertical middle of a card.
 * @param {HTMLElement} card - DE: Karte. EN: Card.
 * @returns {number} DE: Mitte in Pixeln. EN: Middle in pixels.
 */
function getBoardCardMiddle(card) {
  const bounds = card.getBoundingClientRect();
  return bounds.top + bounds.height / 2;
}


/**
 * DE: Markiert die Einfügeposition vor, nach oder in einer leeren Spalte.
 * EN: Marks the insertion position before, after or inside an empty column.
 * @param {HTMLElement} column - DE: Spalte. EN: Column.
 * @param {HTMLElement[]} cards - DE: Karten. EN: Cards.
 * @param {HTMLElement|undefined} next - DE: Folgende Karte. EN: Following card.
 */
function markBoardInsertion(column, cards, next) {
  if (next) next.classList.add("task-card--insert-before");
  else if (cards.length) cards[cards.length - 1].classList.add("task-card--insert-after");
  else column.classList.add("board-column-tasks--insert-empty");
}


/**
 * DE: Entfernt alle Einfügemarkierungen.
 * EN: Removes all insertion markers.
 */
function clearBoardInsertionMarker() {
  document.querySelectorAll(".task-card--insert-before, .task-card--insert-after, .board-column-tasks--insert-empty")
    .forEach(node => node.classList.remove("task-card--insert-before", "task-card--insert-after", "board-column-tasks--insert-empty"));
}
