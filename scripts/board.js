const boardSearchInput = document.getElementById("boardSearchInput");
const boardColumns = document.getElementById("boardColumns");
const boardState = {
  tasks: [],
  contacts: [],
  search: "",
  draggingTaskId: null,
};

/**
 * DE: Gibt einen Task aus dem aktuellen Board zurück.
 * EN: Returns a task from the current board.
 * @param {string} taskId - DE: Task-ID. EN: Task id.
 * @returns {object|null} DE: Task. EN: Task.
 */
function getBoardTask(taskId) {
  return findTaskById(boardState.tasks, taskId);
}


/**
 * DE: Gibt den sichtbaren Namen eines Boardstatus zurück.
 * EN: Returns the visible name of a board status.
 * @param {string} status - DE: Status. EN: Status.
 * @returns {string} DE: Spaltenname. EN: Column name.
 */
function getBoardStatusLabel(status) {
  if (status === TASK_STATUS_PROGRESS) return "In progress";
  if (status === TASK_STATUS_FEEDBACK) return "Await feedback";
  if (status === TASK_STATUS_DONE) return "Done";
  return "To do";
}


/**
 * DE: Gibt den Container einer Boardspalte zurück.
 * EN: Returns the container of a board column.
 * @param {string} status - DE: Status. EN: Status.
 * @returns {HTMLElement|null} DE: Spaltencontainer. EN: Column container.
 */
function getBoardColumnContainer(status) {
  return document.querySelector('[data-drop-status="' + status + '"]');
}


/**
 * DE: Filtert Tasks für eine bestimmte Boardspalte.
 * EN: Filters tasks for one board column.
 * @param {string} status - DE: Status. EN: Status.
 * @returns {Array} DE: Gefilterte Tasks. EN: Filtered tasks.
 */
function getBoardColumnTasks(status) {
  const tasks = [];
  for (let i = 0; i < boardState.tasks.length; i++) {
    const task = boardState.tasks[i];
    if (task.status === status && taskMatchesSearch(task, boardState.search)) tasks.push(task);
  }
  return tasks;
}


/**
 * DE: Erstellt den HTML-Inhalt einer Boardspalte.
 * EN: Creates the HTML content of a board column.
 * @param {string} status - DE: Status. EN: Status.
 * @returns {string} DE: Spalten-HTML. EN: Column HTML.
 */
function getBoardColumnHtml(status) {
  const tasks = getBoardColumnTasks(status);
  if (!tasks.length && boardState.search.trim()) return getEmptyBoardTemplate("found");
  if (!tasks.length) return getEmptyBoardTemplate(getBoardStatusLabel(status));
  let html = "";
  for (let i = 0; i < tasks.length; i++) html += getTaskCardTemplate(tasks[i], boardState.contacts);
  return html;
}


/**
 * DE: Rendert alle vier Boardspalten.
 * EN: Renders all four board columns.
 */
function renderBoard() {
  getBoardColumnContainer(TASK_STATUS_TODO).innerHTML = getBoardColumnHtml(TASK_STATUS_TODO);
  getBoardColumnContainer(TASK_STATUS_PROGRESS).innerHTML = getBoardColumnHtml(TASK_STATUS_PROGRESS);
  getBoardColumnContainer(TASK_STATUS_FEEDBACK).innerHTML = getBoardColumnHtml(TASK_STATUS_FEEDBACK);
  getBoardColumnContainer(TASK_STATUS_DONE).innerHTML = getBoardColumnHtml(TASK_STATUS_DONE);
}


/**
 * DE: Lädt Tasks und Kontakte neu und rendert das Board.
 * EN: Reloads tasks and contacts and renders the board.
 * @returns {Promise<void>}
 */
async function refreshBoard() {
  boardState.tasks = normalizeTaskList(await getTasks());
  boardState.contacts = await loadTaskFormContacts();
  renderBoard();
}


/**
 * DE: Öffnet einen Task über eine Boardkarte.
 * EN: Opens a task from a board card.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function handleBoardCardClick(event) {
  const card = event.target.closest("[data-task-id]");
  if (!card || event.target.closest("button")) return;
  openTaskDetail(card.getAttribute("data-task-id"));
}


/**
 * DE: Öffnet einen Task mit Enter oder Leertaste.
 * EN: Opens a task with Enter or Space.
 * @param {KeyboardEvent} event - DE: Tastaturereignis. EN: Keyboard event.
 */
function handleBoardCardKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-task-id]");
  if (!card) return;
  event.preventDefault();
  openTaskDetail(card.getAttribute("data-task-id"));
}


/**
 * DE: Öffnet den Add-Task-Dialog für einen Status.
 * EN: Opens the Add Task dialog for a status.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function handleBoardAddTask(event) {
  const button = event.target.closest("[data-add-task-status]");
  if (!button) return;
  openTaskFormDialog(button.getAttribute("data-add-task-status"), null);
}


/**
 * DE: Öffnet den Add-Task-Dialog für den Backlog.
 * EN: Opens the Add Task dialog for the backlog.
 */
function openBoardBacklogTask() {
  openTaskFormDialog(TASK_STATUS_TODO, null);
}


/**
 * DE: Aktualisiert die Boardsuche während der Eingabe.
 * EN: Updates the board search while typing.
 */
function updateBoardSearch() {
  boardState.search = boardSearchInput.value;
  renderBoard();
}


/**
 * DE: Markiert eine Karte beim Start des Drag-and-Drop.
 * EN: Marks a card when drag and drop starts.
 * @param {DragEvent} event - DE: Drag-Ereignis. EN: Drag event.
 */
function startBoardDrag(event) {
  const card = event.target.closest("[data-task-id]");
  if (!card) return;
  boardState.draggingTaskId = card.getAttribute("data-task-id");
  boardColumns.style.setProperty("--board-drop-height", card.offsetHeight + "px");
  card.classList.add("task-card--dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", boardState.draggingTaskId);
  updateBoardDropTargets();
}

/** DE: Zeigt benachbarte Ziele sowie entfernte Ziele in Zeigernaehe. EN: Shows adjacent and nearby drop targets. */
function updateBoardDropTargets(event) {
  const task = getBoardTask(boardState.draggingTaskId);
  if (!task) return;
  const statuses = [TASK_STATUS_TODO, TASK_STATUS_PROGRESS, TASK_STATUS_FEEDBACK, TASK_STATUS_DONE];
  const sourceIndex = statuses.indexOf(task.status);
  for (let i = 0; i < statuses.length; i++) {
    const column = getBoardColumnContainer(statuses[i]);
    const bounds = column.closest("[data-board-status]").getBoundingClientRect();
    const nearby = event && event.clientX >= bounds.left - 32 && event.clientX <= bounds.right + 32 &&
      event.clientY >= bounds.top - 32 && event.clientY <= bounds.bottom + 32;
    const visible = i !== sourceIndex && (Math.abs(i - sourceIndex) === 1 || Boolean(nearby));
    column.classList.toggle("board-column-tasks--drop", visible);
  }
}


/**
 * DE: Hebt eine Boardspalte als mögliches Ziel hervor.
 * EN: Highlights a board column as a possible target.
 * @param {DragEvent} event - DE: Drag-Ereignis. EN: Drag event.
 */
function allowBoardDrop(event) {
  if (!boardState.draggingTaskId) return;
  updateBoardDropTargets(event);
  const column = event.target.closest("[data-board-status]");
  if (!column) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}


/**
 * DE: Entfernt die Hervorhebung einer Boardspalte.
 * EN: Removes the highlight from a board column.
 * @param {DragEvent} event - DE: Drag-Ereignis. EN: Drag event.
 */
function leaveBoardDrop(event) {
  if (!event.relatedTarget) updateBoardDropTargets();
}


/**
 * DE: Entfernt alle Drag-Markierungen vom Board.
 * EN: Removes all drag markers from the board.
 */
function clearBoardDragStyles() {
  boardColumns.style.removeProperty("--board-drop-height");
  const cards = document.querySelectorAll(".task-card--dragging");
  const columns = document.querySelectorAll(".board-column-tasks--drop");
  for (let i = 0; i < cards.length; i++) cards[i].classList.remove("task-card--dragging");
  for (let i = 0; i < columns.length; i++) columns[i].classList.remove("board-column-tasks--drop");
}


/**
 * DE: Aktualisiert den Status eines verschobenen Tasks.
 * EN: Updates the status of a moved task.
 * @param {string} taskId - DE: Task-ID. EN: Task id.
 * @param {string} status - DE: Neuer Status. EN: New status.
 * @returns {Promise<void>}
 */
async function moveBoardTask(taskId, status) {
  const task = getBoardTask(taskId);
  if (!task || task.status === status) return;
  try {
    task.status = normalizeTaskStatus(status);
    await storeTask(task);
    await refreshBoard();
    showToast("Task status successfully updated.");
  } catch {
    showToast("Could not move the task. Please try again.");
  }
}


/**
 * DE: Legt eine gezogene Karte in einer neuen Spalte ab.
 * EN: Drops a dragged card into a new column.
 * @param {DragEvent} event - DE: Drag-Ereignis. EN: Drag event.
 */
function dropBoardTask(event) {
  const column = event.target.closest("[data-board-status]");
  if (!column || !boardState.draggingTaskId) return;
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain") || boardState.draggingTaskId;
  const status = column.getAttribute("data-board-status");
  clearBoardDragStyles();
  boardState.draggingTaskId = null;
  moveBoardTask(taskId, status);
}


/**
 * DE: Beendet die optische Drag-Darstellung.
 * EN: Ends the visual drag state.
 */
function endBoardDrag() {
  clearBoardDragStyles();
  boardState.draggingTaskId = null;
}


/**
 * DE: Verarbeitet einen erfolgreich erstellten oder geänderten Task.
 * EN: Handles a successfully created or updated task.
 * @param {object} task - DE: Gespeicherter Task. EN: Stored task.
 * @param {boolean} editing - DE: Bearbeitungsmodus. EN: Edit mode.
 */
async function handleBoardTaskSaved(task, editing) {
  closeTaskFormDialog();
  await refreshBoard();
  showToast(editing ? "Task successfully updated." : "Task added to board");
}


/**
 * DE: Initialisiert die Boardereignisse.
 * EN: Initializes the board events.
 */
function initializeBoardEvents() {
  boardSearchInput.addEventListener("input", updateBoardSearch);
  boardColumns.addEventListener("click", handleBoardCardClick);
  boardColumns.addEventListener("click", handleBoardAddTask);
  boardColumns.addEventListener("keydown", handleBoardCardKeydown);
  boardColumns.addEventListener("dragstart", startBoardDrag);
  document.addEventListener("dragover", allowBoardDrop);
  boardColumns.addEventListener("dragleave", leaveBoardDrop);
  boardColumns.addEventListener("drop", dropBoardTask);
  boardColumns.addEventListener("dragend", endBoardDrag);
  document.getElementById("boardAddTaskButton").addEventListener("click", openBoardBacklogTask);
}


/**
 * DE: Initialisiert das Kanbanboard und seine Dialoge.
 * EN: Initializes the kanban board and its dialogs.
 * @returns {Promise<void>}
 */
async function initializeBoard() {
  if (!protectCurrentPage()) return;
  await initializeTaskForm();
  initializeTaskDialogs();
  initializeBoardEvents();
  await refreshBoard();
}


document.addEventListener("DOMContentLoaded", initializeBoard);
