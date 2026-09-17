/**
 * DE: Initialisiert die Seite zum Hinzufügen eines Tasks.
 * EN: Initializes the Add Task page.
 * @returns {Promise<void>}
 */
async function initializeAddTask() {
  await initializeTaskForm();
  prepareTaskForm(TASK_STATUS_TODO, null);
}


document.addEventListener("DOMContentLoaded", initializeAddTask);
