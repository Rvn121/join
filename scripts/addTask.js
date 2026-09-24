/**
 * DE: Liest den Zielstatus aus der URL.
 * EN: Reads the target status from the URL.
 * @returns {string} DE: Gültiger Taskstatus. EN: Valid task status.
 */
function getAddTaskStatus() {
  const status = new URLSearchParams(window.location.search).get("status");
  return normalizeTaskStatus(status || TASK_STATUS_TODO);
}


/**
 * DE: Initialisiert die Seite zum Hinzufügen eines Tasks.
 * EN: Initializes the Add Task page.
 * @returns {Promise<void>}
 */
async function initializeAddTask() {
  if (!protectCurrentPage()) return;
  await initializeTaskForm();
  prepareTaskForm(getAddTaskStatus(), null);
}


document.addEventListener("DOMContentLoaded", initializeAddTask);
