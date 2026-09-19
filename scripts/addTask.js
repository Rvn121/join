/**
 * DE: Initialisiert die Seite zum Hinzufügen eines Tasks.
 * EN: Initializes the Add Task page.
 * @returns {Promise<void>}
 */
async function initializeAddTask() {
  if (!protectCurrentPage()) return;
  await initializeTaskForm();
  prepareTaskForm(TASK_STATUS_TODO, null);
}


document.addEventListener("DOMContentLoaded", initializeAddTask);
