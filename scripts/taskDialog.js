const taskFormDialog = document.getElementById("taskFormDialog");
const taskDetailDialog = document.getElementById("taskDetailDialog");
const taskDetailContent = document.getElementById("taskDetailContent");
let activeTaskDetailId = null;

/**
 * DE: Öffnet das Taskformular als Dialog.
 * EN: Opens the task form as a dialog.
 * @param {string} status - DE: Zielstatus. EN: Target status.
 * @param {object|null} task - DE: Task zum Bearbeiten. EN: Task to edit.
 */
function openTaskFormDialog(status, task) {
  if (!taskFormDialog) return;
  setTaskFormDialogMode(Boolean(task));
  prepareTaskForm(status, task || null);
  taskFormDialog.showModal();
  taskTitle.focus();
}


/**
 * DE: Schaltet zwischen Erstellen- und Bearbeitungsdialog um.
 * EN: Switches between create and edit dialog mode.
 * @param {boolean} editing - DE: Bearbeitungsmodus. EN: Edit mode.
 */
function setTaskFormDialogMode(editing) {
  taskFormDialog.classList.toggle("task-form-dialog--edit", editing);
}


/**
 * DE: Schließt den Taskformular-Dialog.
 * EN: Closes the task form dialog.
 */
function closeTaskFormDialog() {
  if (taskFormDialog && taskFormDialog.open) taskFormDialog.close();
}


/**
 * DE: Schließt den Formulardialog bei Klick auf den Hintergrund.
 * EN: Closes the form dialog when clicking the backdrop.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function closeTaskFormBackdrop(event) {
  if (event.target === taskFormDialog) closeTaskFormDialog();
}


/**
 * DE: Rendert den aktuell geöffneten Task erneut.
 * EN: Renders the currently opened task again.
 */
function renderActiveTaskDetail() {
  const task = getBoardTask(activeTaskDetailId);
  if (!task) return;
  taskDetailContent.innerHTML = getTaskDetailTemplate(task, boardState.contacts);
}


/**
 * DE: Öffnet die Detailansicht eines Tasks.
 * EN: Opens the detail view of a task.
 * @param {string} taskId - DE: Task-ID. EN: Task id.
 */
function openTaskDetail(taskId) {
  const task = getBoardTask(taskId);
  if (!task || !taskDetailDialog) return;
  activeTaskDetailId = task.id;
  renderActiveTaskDetail();
  taskDetailDialog.showModal();
}


/**
 * DE: Schließt die Detailansicht.
 * EN: Closes the detail view.
 */
function closeTaskDetail() {
  if (taskDetailDialog && taskDetailDialog.open) taskDetailDialog.close();
  activeTaskDetailId = null;
}


/**
 * DE: Schließt die Detailansicht bei Klick auf den Hintergrund.
 * EN: Closes the detail view when clicking the backdrop.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function closeTaskDetailBackdrop(event) {
  if (event.target === taskDetailDialog) closeTaskDetail();
}


/**
 * DE: Sucht einen Subtask im geöffneten Task.
 * EN: Finds a subtask in the opened task.
 * @param {object} task - DE: Task. EN: Task.
 * @param {string} subtaskId - DE: Subtask-ID. EN: Subtask id.
 * @returns {object|null} DE: Subtask. EN: Subtask.
 */
function findDetailSubtask(task, subtaskId) {
  for (let i = 0; i < task.subtasks.length; i++) {
    if (String(task.subtasks[i].id) === String(subtaskId)) return task.subtasks[i];
  }
  return null;
}


/**
 * DE: Speichert den Checkboxstatus eines Subtasks.
 * EN: Stores the checkbox state of a subtask.
 * @param {Event} event - DE: Änderungsereignis. EN: Change event.
 * @returns {Promise<void>}
 */
async function changeDetailSubtask(event) {
  const checkbox = event.target.closest("[data-detail-subtask-id]");
  if (!checkbox) return;
  const task = getBoardTask(activeTaskDetailId);
  const subtask = findDetailSubtask(task, checkbox.getAttribute("data-detail-subtask-id"));
  if (!subtask) return;
  subtask.done = checkbox.checked;
  try {
    await saveDetailSubtaskChange(task);
  } catch {
    showTaskToast("Could not update the subtask. Please try again.");
  }
}


/**
 * DE: Speichert eine Änderung an einem Detail-Subtask.
 * EN: Stores a change to a detail subtask.
 * @param {object} task - DE: Task. EN: Task.
 * @returns {Promise<void>}
 */
async function saveDetailSubtaskChange(task) {
  await storeTask(task);
  await refreshBoard();
  renderActiveTaskDetail();
}


/**
 * DE: Löscht den aktuell geöffneten Task.
 * EN: Deletes the currently opened task.
 * @returns {Promise<void>}
 */
async function deleteActiveTask() {
  const taskId = activeTaskDetailId;
  if (!taskId) return;
  try {
    await removeTask(taskId);
    closeTaskDetail();
    await refreshBoard();
    showTaskToast("Task successfully deleted.");
  } catch {
    showTaskToast("Could not delete the task. Please try again.");
  }
}


/**
 * DE: Öffnet den aktuell sichtbaren Task zum Bearbeiten.
 * EN: Opens the currently visible task for editing.
 */
function editActiveTask() {
  const task = getBoardTask(activeTaskDetailId);
  if (!task) return;
  closeTaskDetail();
  openTaskFormDialog(task.status, task);
}


/**
 * DE: Verarbeitet Klicks in der Taskdetailansicht.
 * EN: Handles clicks in the task detail view.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function handleTaskDetailClick(event) {
  if (event.target.closest("[data-task-detail-close]")) closeTaskDetail();
  if (event.target.closest("[data-task-delete]")) deleteActiveTask();
  if (event.target.closest("[data-task-edit]")) editActiveTask();
}


/**
 * DE: Initialisiert die Ereignisse beider Taskdialoge.
 * EN: Initializes the events of both task dialogs.
 */
function initializeTaskDialogs() {
  if (taskFormDialog) taskFormDialog.addEventListener("click", closeTaskFormBackdrop);
  if (taskDetailDialog) taskDetailDialog.addEventListener("click", closeTaskDetailBackdrop);
  if (taskDetailContent) taskDetailContent.addEventListener("click", handleTaskDetailClick);
  if (taskDetailContent) taskDetailContent.addEventListener("change", changeDetailSubtask);
  const closeButton = document.getElementById("taskFormDialogClose");
  if (closeButton) closeButton.addEventListener("click", closeTaskFormDialog);
}
