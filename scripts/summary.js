/**
 * DE: Zählt Tasks eines bestimmten Status.
 * EN: Counts tasks with a specific status.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 * @param {string} status - DE: Status. EN: Status.
 * @returns {number} DE: Anzahl. EN: Count.
 */
function countTasksByStatus(tasks, status) {
  let count = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].status === status) count++;
  }
  return count;
}


/**
 * DE: Zählt alle dringenden Tasks.
 * EN: Counts all urgent tasks.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 * @returns {number} DE: Anzahl. EN: Count.
 */
function countUrgentTasks(tasks) {
  let count = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].priority === "urgent") count++;
  }
  return count;
}


/**
 * DE: Prüft, ob ein Task für die nächste Deadline berücksichtigt wird.
 * EN: Checks whether a task is considered for the next deadline.
 * @param {object} task - DE: Task. EN: Task.
 * @returns {boolean} DE: Berücksichtigungsstatus. EN: Consideration state.
 */
function hasOpenTaskDeadline(task) {
  return Boolean(task.dueDate && task.status !== TASK_STATUS_DONE);
}


/**
 * DE: Gibt den Task mit der nächsten offenen Deadline zurück.
 * EN: Returns the task with the nearest open deadline.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 * @returns {object|null} DE: Task. EN: Task.
 */
function getNextDeadlineTask(tasks) {
  let nextTask = null;
  for (let i = 0; i < tasks.length; i++) {
    if (!hasOpenTaskDeadline(tasks[i])) continue;
    if (!nextTask || tasks[i].dueDate < nextTask.dueDate) nextTask = tasks[i];
  }
  return nextTask;
}


/**
 * DE: Gibt eine Begrüßung passend zur Tageszeit zurück.
 * EN: Returns a greeting matching the time of day.
 * @returns {string} DE: Begrüßung. EN: Greeting.
 */
function getSummaryGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}


/**
 * DE: Rendert die Begrüßung für User oder Gast.
 * EN: Renders the greeting for user or guest.
 */
function renderSummaryGreeting() {
  const container = document.getElementById("summaryGreeting");
  const greetingLine = document.createElement("span");
  greetingLine.textContent = getSummaryGreeting() + (getUserMode() === "guest" ? "!" : ",");
  container.replaceChildren(greetingLine);
  if (getUserMode() === "guest") return;
  const user = getCurrentUser();
  const nameLine = document.createElement("strong");
  nameLine.textContent = user && user.name ? user.name : "";
  container.appendChild(nameLine);
}


/**
 * DE: Schreibt die Summary-Zahlen in die Oberfläche.
 * EN: Writes the summary numbers into the interface.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 */
function renderSummaryNumbers(tasks) {
  document.getElementById("summaryTodo").textContent = countTasksByStatus(tasks, TASK_STATUS_TODO);
  document.getElementById("summaryDone").textContent = countTasksByStatus(tasks, TASK_STATUS_DONE);
  document.getElementById("summaryUrgent").textContent = countUrgentTasks(tasks);
  document.getElementById("summaryBoard").textContent = tasks.length;
  document.getElementById("summaryProgress").textContent = countTasksByStatus(tasks, TASK_STATUS_PROGRESS);
  document.getElementById("summaryFeedback").textContent = countTasksByStatus(tasks, TASK_STATUS_FEEDBACK);
}


/**
 * DE: Rendert die nächste Deadline in der Summary.
 * EN: Renders the next deadline in the summary.
 * @param {Array} tasks - DE: Tasks. EN: Tasks.
 */
function renderSummaryDeadline(tasks) {
  const deadlineTask = getNextDeadlineTask(tasks);
  const value = deadlineTask ? formatSummaryDate(deadlineTask.dueDate) : "No deadline";
  document.getElementById("summaryDeadline").textContent = value;
}


/**
 * DE: Prüft, ob die mobile Summary angezeigt wird.
 * EN: Checks whether the mobile summary is displayed.
 * @returns {boolean} DE: Mobilstatus. EN: Mobile state.
 */
function isMobileSummaryView() {
  return window.innerWidth <= 991;
}


/**
 * DE: Beendet die mobile Begrüßungsansicht.
 * EN: Ends the mobile greeting view.
 */
function hideMobileSummaryGreeting() {
  document.body.classList.remove("summary-mobile-greeting-active");
}


/**
 * DE: Zeigt auf Mobile kurz die Begrüßungsansicht.
 * EN: Briefly shows the greeting view on mobile.
 */
function showMobileSummaryGreeting() {
  if (sessionStorage.getItem(SUMMARY_GREETING_PENDING_KEY) !== "true") return;
  sessionStorage.removeItem(SUMMARY_GREETING_PENDING_KEY);
  if (!isMobileSummaryView()) return;
  document.body.classList.add("summary-mobile-greeting-active");
  window.setTimeout(hideMobileSummaryGreeting, 1200);
}


/**
 * DE: Initialisiert das Summary-Dashboard aus den Boarddaten.
 * EN: Initializes the summary dashboard from board data.
 * @returns {Promise<void>}
 */
async function initializeSummary() {
  if (!protectCurrentPage()) return;
  const tasks = normalizeTaskList(await getTasks());
  renderSummaryNumbers(tasks);
  renderSummaryDeadline(tasks);
  renderSummaryGreeting();
  showMobileSummaryGreeting();
}


document.addEventListener("DOMContentLoaded", initializeSummary);
