const TASK_GUEST_STORAGE_KEY = "joinGuestTasks";
const TASK_STATUS_TODO = "todo";
const TASK_STATUS_PROGRESS = "inProgress";
const TASK_STATUS_FEEDBACK = "awaitFeedback";
const TASK_STATUS_DONE = "done";

/**
 * DE: Erzeugt eine einfache eindeutige ID für einen Task oder Subtask.
 * EN: Creates a simple unique id for a task or subtask.
 * @returns {string} DE: Neue ID. EN: New id.
 */
function createTaskId() {
  return String(Date.now()) + String(Math.floor(Math.random() * 1000));
}


/**
 * DE: Gibt einen gültigen Taskstatus zurück.
 * EN: Returns a valid task status.
 * @param {string} status - DE: Statuswert. EN: Status value.
 * @returns {string} DE: Gültiger Status. EN: Valid status.
 */
function normalizeTaskStatus(status) {
  const value = String(status || "").toLowerCase().split(" ").join("");
  if (value === "inprogress") return TASK_STATUS_PROGRESS;
  if (value === "awaitfeedback" || value === "awaitingfeedback") return TASK_STATUS_FEEDBACK;
  if (value === "done") return TASK_STATUS_DONE;
  return TASK_STATUS_TODO;
}


/**
 * DE: Gibt eine gültige Priorität zurück.
 * EN: Returns a valid priority.
 * @param {string} priority - DE: Priorität. EN: Priority.
 * @returns {string} DE: Gültige Priorität. EN: Valid priority.
 */
function normalizeTaskPriority(priority) {
  if (priority === "urgent") return "urgent";
  if (priority === "low") return "low";
  return "medium";
}


/**
 * DE: Normalisiert einen einzelnen Subtask.
 * EN: Normalizes one subtask.
 * @param {object|string} subtask - DE: Subtask. EN: Subtask.
 * @returns {object} DE: Normalisierter Subtask. EN: Normalized subtask.
 */
function normalizeSubtask(subtask) {
  if (typeof subtask === "string") return { id: createTaskId(), title: subtask, done: false };
  return {
    id: subtask.id || createTaskId(),
    title: subtask.title || "",
    done: Boolean(subtask.done || subtask.completed),
  };
}


/**
 * DE: Normalisiert alle Subtasks eines Tasks.
 * EN: Normalizes all subtasks of a task.
 * @param {Array} subtasks - DE: Subtasks. EN: Subtasks.
 * @returns {Array} DE: Normalisierte Subtasks. EN: Normalized subtasks.
 */
function normalizeSubtasks(subtasks) {
  const normalized = [];
  if (!Array.isArray(subtasks)) return normalized;
  for (let i = 0; i < subtasks.length; i++) normalized.push(normalizeSubtask(subtasks[i]));
  return normalized;
}


/**
 * DE: Normalisiert eine Kontaktzuweisung.
 * EN: Normalizes one contact assignment.
 * @param {object|string} assignment - DE: Zuweisung. EN: Assignment.
 * @returns {string} DE: Kontakt-ID. EN: Contact id.
 */
function normalizeTaskAssignment(assignment) {
  if (typeof assignment === "string") return assignment;
  if (!assignment) return "";
  return String(assignment.id || assignment.contactId || assignment.email || "");
}


/**
 * DE: Normalisiert alle Kontaktzuweisungen eines Tasks.
 * EN: Normalizes all contact assignments of a task.
 * @param {Array} assignments - DE: Zuweisungen. EN: Assignments.
 * @returns {Array} DE: Kontakt-IDs. EN: Contact ids.
 */
function normalizeTaskAssignments(assignments) {
  const result = [];
  if (!Array.isArray(assignments)) return result;
  for (let i = 0; i < assignments.length; i++) {
    const id = normalizeTaskAssignment(assignments[i]);
    if (id && !result.includes(id)) result.push(id);
  }
  return result;
}


/**
 * DE: Normalisiert einen Task aus Firebase oder dem Gastmodus.
 * EN: Normalizes a task from Firebase or guest mode.
 * @param {object} task - DE: Task. EN: Task.
 * @returns {object} DE: Normalisierter Task. EN: Normalized task.
 */
function normalizeTask(task) {
  const normalized = Object.assign({}, task);
  normalized.id = String(task.id || createTaskId());
  normalized.status = normalizeTaskStatus(task.status || task.boardStatus);
  normalized.priority = normalizeTaskPriority(task.priority);
  normalized.assignedTo = normalizeTaskAssignments(task.assignedTo || task.assignees);
  normalized.subtasks = normalizeSubtasks(task.subtasks);
  normalized.dueDate = task.dueDate || task.date || "";
  normalized.category = task.category || task.taskCategory || "User Story";
  return normalized;
}


/**
 * DE: Normalisiert eine vollständige Taskliste.
 * EN: Normalizes a complete task list.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 * @returns {Array} DE: Normalisierte Tasks. EN: Normalized tasks.
 */
function normalizeTaskList(tasks) {
  const normalized = [];
  if (!Array.isArray(tasks)) return normalized;
  for (let i = 0; i < tasks.length; i++) normalized.push(normalizeTask(tasks[i]));
  return normalized;
}


/**
 * DE: Sucht einen Task über seine ID.
 * EN: Finds a task by its id.
 * @param {Array} tasks - DE: Taskliste. EN: Task list.
 * @param {string} taskId - DE: Task-ID. EN: Task id.
 * @returns {object|null} DE: Task. EN: Task.
 */
function findTaskById(tasks, taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (String(tasks[i].id) === String(taskId)) return tasks[i];
  }
  return null;
}


/**
 * DE: Gibt den Index eines Tasks zurück.
 * EN: Returns the index of a task.
 * @param {Array} tasks - DE: Taskliste. EN: Task list.
 * @param {string} taskId - DE: Task-ID. EN: Task id.
 * @returns {number} DE: Index. EN: Index.
 */
function getTaskIndex(tasks, taskId) {
  for (let i = 0; i < tasks.length; i++) {
    if (String(tasks[i].id) === String(taskId)) return i;
  }
  return -1;
}


/**
 * DE: Speichert einen neuen oder geänderten Task.
 * EN: Stores a new or changed task.
 * @param {object} task - DE: Task. EN: Task.
 * @returns {Promise<object>} DE: Gespeicherter Task. EN: Stored task.
 */
async function storeTask(task) {
  const tasks = normalizeTaskList(await getTasks());
  const index = getTaskIndex(tasks, task.id);
  if (index < 0) tasks.push(normalizeTask(task));
  else tasks[index] = normalizeTask(task);
  await saveTasks(tasks);
  return normalizeTask(task);
}


/**
 * DE: Entfernt einen Task anhand seiner ID.
 * EN: Removes a task by its id.
 * @param {string} taskId - DE: Task-ID. EN: Task id.
 * @returns {Promise<void>}
 */
async function removeTask(taskId) {
  const tasks = normalizeTaskList(await getTasks());
  const index = getTaskIndex(tasks, taskId);
  if (index < 0) return;
  tasks.splice(index, 1);
  await saveTasks(tasks);
}


/**
 * DE: Formatiert ein Datum für die sichtbare Taskansicht.
 * EN: Formats a date for the visible task view.
 * @param {string} dateValue - DE: Datum. EN: Date.
 * @returns {string} DE: Formatiertes Datum. EN: Formatted date.
 */
function formatTaskDate(dateValue) {
  if (!dateValue) return "-";
  const parts = dateValue.split("-");
  if (parts.length !== 3) return dateValue;
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}




/**
 * DE: Formatiert ein Datum lang für die Summary.
 * EN: Formats a date in long form for the summary.
 * @param {string} dateValue - DE: Datum. EN: Date.
 * @returns {string} DE: Langes Datum. EN: Long date.
 */
function formatSummaryDate(dateValue) {
  if (!dateValue) return "No deadline";
  const date = new Date(dateValue + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
/**
 * DE: Gibt die Anzahl erledigter Subtasks zurück.
 * EN: Returns the number of completed subtasks.
 * @param {Array} subtasks - DE: Subtasks. EN: Subtasks.
 * @returns {number} DE: Anzahl. EN: Count.
 */
function countDoneSubtasks(subtasks) {
  let count = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].done) count++;
  }
  return count;
}


/**
 * DE: Ermittelt die Prozentzahl des Subtask-Fortschritts.
 * EN: Calculates the subtask progress percentage.
 * @param {Array} subtasks - DE: Subtasks. EN: Subtasks.
 * @returns {number} DE: Prozentwert. EN: Percentage.
 */
function getSubtaskProgress(subtasks) {
  if (!subtasks.length) return 0;
  return Math.round((countDoneSubtasks(subtasks) / subtasks.length) * 100);
}


/**
 * DE: Gibt den sichtbaren Namen einer Priorität zurück.
 * EN: Returns the visible name of a priority.
 * @param {string} priority - DE: Priorität. EN: Priority.
 * @returns {string} DE: Anzeigename. EN: Display name.
 */
function getPriorityLabel(priority) {
  if (priority === "urgent") return "Urgent";
  if (priority === "low") return "Low";
  return "Medium";
}


/**
 * DE: Gibt den Iconpfad für eine Priorität zurück.
 * EN: Returns the icon path for a priority.
 * @param {string} priority - DE: Priorität. EN: Priority.
 * @returns {string} DE: Iconpfad. EN: Icon path.
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") return "./assets/icons/prio-high.svg";
  if (priority === "low") return "./assets/icons/prio-low.svg";
  return "./assets/icons/prio-medium.svg";
}


/**
 * DE: Prüft, ob ein Task einen Suchbegriff enthält.
 * EN: Checks whether a task contains a search term.
 * @param {object} task - DE: Task. EN: Task.
 * @param {string} query - DE: Suchbegriff. EN: Search term.
 * @returns {boolean} DE: Trefferstatus. EN: Match state.
 */
function taskMatchesSearch(task, query) {
  const search = query.trim().toLowerCase();
  if (!search) return true;
  const title = String(task.title || "").toLowerCase();
  const description = String(task.description || "").toLowerCase();
  return title.includes(search) || description.includes(search);
}
