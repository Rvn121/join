const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskDueDate = document.getElementById("taskDueDate");
const taskCategory = document.getElementById("taskCategory");
const taskAssignedSearch = document.getElementById("taskAssignedSearch");
const taskContactDropdown = document.getElementById("taskContactDropdown");
const taskAssignedToggle = document.getElementById("taskAssignedToggle");
const taskSelectedContacts = document.getElementById("taskSelectedContacts");
const taskSubtaskInput = document.getElementById("taskSubtaskInput");
const taskSubtaskList = document.getElementById("taskSubtaskList");
const taskSubmitButton = document.getElementById("taskSubmitButton");
const taskClearButton = document.getElementById("taskClearButton");
const taskFormState = {
  contacts: [],
  selectedContactIds: [],
  subtasks: [],
  editingTaskId: null,
  editingSubtaskId: null,
  status: TASK_STATUS_TODO,
};

/**
 * DE: Entfernt die Fehlermarkierung eines Feldes.
 * EN: Removes the error state of a field.
 * @param {HTMLElement} field - DE: Eingabefeld. EN: Input field.
 */
function clearTaskFieldError(field) {
  field.classList.remove("task-input-error");
  const error = taskForm.querySelector('[data-error-for="' + field.id + '"]');
  if (error) error.textContent = "";
}


/**
 * DE: Zeigt eine Fehlermeldung an einem Pflichtfeld.
 * EN: Shows an error message on a required field.
 * @param {HTMLElement} field - DE: Eingabefeld. EN: Input field.
 * @param {string} message - DE: Meldung. EN: Message.
 */
function showTaskFieldError(field, message) {
  field.classList.add("task-input-error");
  const error = taskForm.querySelector('[data-error-for="' + field.id + '"]');
  if (error) error.textContent = message;
}


/**
 * DE: Prüft ein einzelnes Pflichtfeld.
 * EN: Validates one required field.
 * @param {HTMLElement} field - DE: Eingabefeld. EN: Input field.
 * @param {string} message - DE: Meldung. EN: Message.
 * @returns {boolean} DE: Gültigkeitsstatus. EN: Validation state.
 */
function validateRequiredTaskField(field, message) {
  clearTaskFieldError(field);
  if (field.value.trim()) return true;
  showTaskFieldError(field, message);
  return false;
}


/**
 * DE: Prüft alle Pflichtfelder des Taskformulars.
 * EN: Validates all required fields of the task form.
 * @returns {boolean} DE: Formularstatus. EN: Form state.
 */
function validateTaskForm() {
  const titleValid = validateRequiredTaskField(taskTitle, "Please enter a title.");
  const dateValid = validateTaskDueDate();
  const categoryValid = validateRequiredTaskField(taskCategory, "Please select a category.");
  if (!titleValid) taskTitle.focus();
  else if (!dateValid) taskDueDate.focus();
  else if (!categoryValid) taskCategory.focus();
  return titleValid && dateValid && categoryValid;
}


/**
 * DE: Liest die aktuell ausgewählte Priorität.
 * EN: Reads the currently selected priority.
 * @returns {string} DE: Priorität. EN: Priority.
 */
function getSelectedTaskPriority() {
  const selected = taskForm.querySelector('input[name="priority"]:checked');
  return selected ? selected.value : "medium";
}


/**
 * DE: Kopiert die Subtasks für den zu speichernden Task.
 * EN: Copies the subtasks for the task to be stored.
 * @returns {Array} DE: Subtasks. EN: Subtasks.
 */
function copyTaskFormSubtasks() {
  const subtasks = [];
  for (let i = 0; i < taskFormState.subtasks.length; i++) {
    subtasks.push(Object.assign({}, taskFormState.subtasks[i]));
  }
  return subtasks;
}


/**
 * DE: Erstellt einen Task aus den Formularwerten.
 * EN: Creates a task from the form values.
 * @returns {object} DE: Task. EN: Task.
 */
function createTaskFromForm() {
  return {
    id: taskFormState.editingTaskId || createTaskId(),
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    dueDate: parseTaskDueDate(taskDueDate.value),
    priority: getSelectedTaskPriority(),
    assignedTo: taskFormState.selectedContactIds.slice(),
    category: taskCategory.value,
    subtasks: copyTaskFormSubtasks(),
    status: taskFormState.status,
  };
}


/**
 * DE: Entfernt alle sichtbaren Formularfehler.
 * EN: Removes all visible form errors.
 */
function clearTaskFormErrors() {
  clearTaskFieldError(taskTitle);
  clearTaskFieldError(taskDueDate);
  clearTaskFieldError(taskCategory);
}


/**
 * DE: Setzt alle Formularwerte auf den Erstellungszustand zurück.
 * EN: Resets all form values to the create state.
 */
function resetTaskFormValues() {
  taskForm.reset();
  updateTaskDateAppearance();
  taskFormState.selectedContactIds = [];
  taskFormState.subtasks = [];
  taskFormState.editingTaskId = null;
  taskFormState.editingSubtaskId = null;
  taskForm.querySelector('input[value="medium"]').checked = true;
  clearTaskFormErrors();
  renderTaskContactDropdown();
  renderTaskSelectedContacts();
  renderFormSubtasks();
  updateSubtaskInputActions();
}


/**
 * DE: Füllt das Formular mit einem bestehenden Task.
 * EN: Fills the form with an existing task.
 * @param {object} task - DE: Task. EN: Task.
 */
function fillTaskForm(task) {
  taskTitle.value = task.title || "";
  taskDescription.value = task.description || "";
  taskDueDate.value = task.dueDate ? formatTaskDate(task.dueDate) : "";
  updateTaskDateAppearance();
  taskCategory.value = task.category || "";
  taskForm.querySelector('input[value="' + normalizeTaskPriority(task.priority) + '"]').checked = true;
  taskFormState.selectedContactIds = normalizeTaskAssignments(task.assignedTo);
  taskFormState.subtasks = normalizeSubtasks(task.subtasks);
  renderTaskContactDropdown();
  renderTaskSelectedContacts();
  renderFormSubtasks();
}


/**
 * DE: Bereitet das Formular zum Erstellen oder Bearbeiten vor.
 * EN: Prepares the form for creating or editing.
 * @param {string} status - DE: Taskstatus. EN: Task status.
 * @param {object|null} task - DE: Bestehender Task. EN: Existing task.
 */
function prepareTaskForm(status, task) {
  resetTaskFormValues();
  taskFormState.status = normalizeTaskStatus(status);
  if (task) {
    taskFormState.editingTaskId = task.id;
    taskFormState.status = normalizeTaskStatus(task.status);
    fillTaskForm(task);
  }
  updateTaskFormButtons(Boolean(task));
}


/**
 * DE: Passt die Formularbuttons an Erstellen oder Bearbeiten an.
 * EN: Adapts the form buttons for create or edit mode.
 * @param {boolean} editing - DE: Bearbeitungsmodus. EN: Edit mode.
 */
function updateTaskFormButtons(editing) {
  const submitText = taskSubmitButton.querySelector("span");
  submitText.textContent = editing ? "Ok" : "Create Task";
  taskClearButton.hidden = editing;
  const title = document.getElementById("taskFormDialogTitle");
  if (title) title.textContent = editing ? "Edit Task" : "Add Task";
}


/**
 * DE: Behandelt den sekundären Formularbutton.
 * EN: Handles the secondary form button.
 */
function handleTaskClearButton() {
  if (taskForm.closest("dialog") && typeof closeTaskFormDialog === "function") {
    closeTaskFormDialog();
    return;
  }
  prepareTaskForm(taskFormState.status, null);
}


/**
 * DE: Reagiert nach erfolgreichem Speichern auf die aktuelle Seite.
 * EN: Reacts after successful saving on the current page.
 * @param {object} task - DE: Gespeicherter Task. EN: Stored task.
 * @param {boolean} editing - DE: Bearbeitungsstatus. EN: Edit state.
 */
function finishTaskFormSave(task, editing) {
  if (typeof handleBoardTaskSaved === "function") {
    handleBoardTaskSaved(task, editing);
    return;
  }
  showToast("Task successfully created.");
  window.setTimeout(openBoardAfterTaskCreate, 850);
}


/**
 * DE: Öffnet nach dem Erstellen eines Tasks das Board.
 * EN: Opens the board after creating a task.
 */
function openBoardAfterTaskCreate() {
  window.location.href = "./board.html";
}


/**
 * DE: Speichert das Taskformular.
 * EN: Saves the task form.
 * @param {SubmitEvent} event - DE: Formularereignis. EN: Form event.
 * @returns {Promise<void>}
 */
async function handleTaskFormSubmit(event) {
  event.preventDefault();
  if (!validateTaskForm()) return;
  const editing = Boolean(taskFormState.editingTaskId);
  taskSubmitButton.disabled = true;
  try {
    const task = await storeTask(createTaskFromForm());
    finishTaskFormSave(task, editing);
  } catch {
    showToast("Could not save the task. Please try again.");
  }
  taskSubmitButton.disabled = false;
}


/**
 * DE: Entfernt Datumsfehler nach einer Eingabe oder Formularaktualisierung.
 * EN: Clears date errors after input or a form update.
 */
function updateTaskDateAppearance() {
  clearTaskFieldError(taskDueDate);
}

/**
 * DE: Setzt die Schrägstriche nach Tag und Monat.
 * EN: Inserts the slashes after day and month.
 * @param {string} digits - DE: Nur Ziffern. EN: Digits only.
 * @returns {string} DE: Datum als dd/mm/yyyy (ggf. unvollständig). EN: Date as dd/mm/yyyy (possibly partial).
 */
function formatTaskDateDigits(digits) {
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
  return parts.filter(Boolean).join("/");
}


/**
 * DE: Erzwingt das Format dd/mm/yyyy während der Eingabe (nur Ziffern, Schrägstriche automatisch).
 * EN: Enforces the dd/mm/yyyy format while typing (digits only, slashes added automatically).
 * @param {InputEvent} event - DE: Eingabeereignis. EN: Input event.
 */
function maskTaskDueDate(event) {
  let digits = taskDueDate.value.replace(/\D/g, "").slice(0, 8);
  const deletedSeparator = event.inputType === "deleteContentBackward"
    && formatTaskDateDigits(digits).length > taskDueDate.value.length;
  if (deletedSeparator) digits = digits.slice(0, -1);
  taskDueDate.value = formatTaskDateDigits(digits);
  clearTaskFieldError(taskDueDate);
}


/**
 * DE: Markiert ein unvollständiges oder ungültiges Datum beim Verlassen des Feldes.
 * EN: Flags an incomplete or invalid date when leaving the field.
 */
function validateTaskDueDateInput() {
  clearTaskFieldError(taskDueDate);
  if (!taskDueDate.value) return;
  const dueDate = parseTaskDueDate(taskDueDate.value);
  if (!dueDate) return showTaskFieldError(taskDueDate, "Please enter a valid date (dd/mm/yyyy).");
  if (dueDate < getTodayTaskDate()) showTaskFieldError(taskDueDate, "Please select today or a future date.");
}


/** DE: Prueft das Datum im Format dd/mm/yyyy. EN: Validates the date in dd/mm/yyyy format. */
function validateTaskDueDate() {
  if (!validateRequiredTaskField(taskDueDate, "Please select a due date.")) return false;
  const dueDate = parseTaskDueDate(taskDueDate.value);
  if (!dueDate) {
    showTaskFieldError(taskDueDate, "Please enter a valid date (dd/mm/yyyy).");
    return false;
  }
  if (dueDate >= getTodayTaskDate()) return true;
  showTaskFieldError(taskDueDate, "Please select today or a future date.");
  return false;
}

/**
 * DE: Öffnet den Kalender am Icon.
 * EN: Opens the calendar at its icon.
 * @param {Event} event - DE: Auslösendes Ereignis. EN: Triggering event.
 */
function openTaskDatePicker(event) {
  toggleTaskCalendar(event);
}

/** DE: Initialisiert die Ereignisse des Fälligkeitsdatums. EN: Initializes the due date events. */
function initializeTaskDateEvents() {
  const datePicker = document.getElementById("taskDatePicker");
  datePicker.addEventListener("pointerdown", rememberTaskCalendarState);
  datePicker.addEventListener("click", openTaskDatePicker);
  taskDueDate.addEventListener("input", maskTaskDueDate);
  taskDueDate.addEventListener("change", validateTaskDueDateInput);
}

/** DE: Initialisiert die Ereignisse der Kontaktzuweisung. EN: Initializes the contact assignment events. */
function initializeTaskContactEvents() {
  taskAssignedSearch.addEventListener("focus", openTaskContactDropdown);
  taskAssignedSearch.addEventListener("input", filterTaskContacts);
  taskContactDropdown.addEventListener("change", handleTaskContactChange);
  if (taskAssignedToggle) taskAssignedToggle.addEventListener("click", toggleTaskContactDropdown);
  document.addEventListener("click", closeTaskDropdownOutside);
}

/** DE: Initialisiert die Subtask-Ereignisse. EN: Initializes the subtask events. */
function initializeTaskSubtaskEvents() {
  taskSubtaskInput.addEventListener("keydown", handleSubtaskKeydown);
  taskSubtaskInput.addEventListener("input", updateSubtaskInputActions);
  taskSubtaskList.addEventListener("click", handleFormSubtaskAction);
  taskSubtaskList.addEventListener("dblclick", handleSubtaskDoubleClick);
  taskSubtaskList.addEventListener("keydown", handleSubtaskEditorKeydown);
  taskSubtaskList.addEventListener("focusout", handleSubtaskEditorFocusOut);
  document.addEventListener("pointerdown", handleSubtaskEditorPointerDown);
  document.getElementById("taskSubtaskAdd").addEventListener("click", addOrUpdateSubtask);
  document.getElementById("taskSubtaskClear").addEventListener("click", clearSubtaskInput);
}

/** DE: Initialisiert Formularereignisse. EN: Initializes form events. */
function initializeTaskFormEvents() {
  initializeTaskDateEvents();
  initializeTaskContactEvents();
  initializeTaskSubtaskEvents();
  taskClearButton.addEventListener("click", handleTaskClearButton);
  taskForm.addEventListener("submit", handleTaskFormSubmit);
}


/**
 * DE: Initialisiert das wiederverwendbare Taskformular.
 * EN: Initializes the reusable task form.
 * @returns {Promise<void>}
 */
async function initializeTaskForm() {
  if (!taskForm) return;
  taskFormState.contacts = await loadTaskFormContacts();
  renderTaskContactDropdown();
  initializeTaskFormEvents();
  prepareTaskForm(taskForm.getAttribute("data-default-status") || TASK_STATUS_TODO, null);
}
