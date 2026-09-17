/**
 * DE: Rendert die Subtasks unter dem Eingabefeld.
 * EN: Renders the subtasks below the input.
 */
function renderFormSubtasks() {
  let html = "";
  for (let i = 0; i < taskFormState.subtasks.length; i++) {
    html += getFormSubtaskTemplate(taskFormState.subtasks[i]);
  }
  taskSubtaskList.innerHTML = html;
}


/**
 * DE: Sucht einen Subtask anhand seiner ID.
 * EN: Finds a subtask by its id.
 * @param {string} subtaskId - DE: Subtask-ID. EN: Subtask id.
 * @returns {object|null} DE: Subtask. EN: Subtask.
 */
function findFormSubtask(subtaskId) {
  for (let i = 0; i < taskFormState.subtasks.length; i++) {
    if (String(taskFormState.subtasks[i].id) === String(subtaskId)) return taskFormState.subtasks[i];
  }
  return null;
}


/**
 * DE: Leert das Subtask-Eingabefeld und beendet Bearbeiten.
 * EN: Clears the subtask input and stops editing.
 */
function clearSubtaskInput() {
  taskSubtaskInput.value = "";
  taskFormState.editingSubtaskId = null;
  updateSubtaskInputActions();
  taskSubtaskInput.focus();
}


/**
 * DE: Speichert einen neuen oder bearbeiteten Subtask.
 * EN: Stores a new or edited subtask.
 */
function addOrUpdateSubtask() {
  const title = taskSubtaskInput.value.trim();
  if (!title) return;
  const subtask = findFormSubtask(taskFormState.editingSubtaskId);
  if (subtask) subtask.title = title;
  else taskFormState.subtasks.push({ id: createTaskId(), title: title, done: false });
  renderFormSubtasks();
  clearSubtaskInput();
}


/**
 * DE: Öffnet einen bestehenden Subtask zur Bearbeitung.
 * EN: Opens an existing subtask for editing.
 * @param {string} subtaskId - DE: Subtask-ID. EN: Subtask id.
 */
function editFormSubtask(subtaskId) {
  const subtask = findFormSubtask(subtaskId);
  if (!subtask) return;
  taskFormState.editingSubtaskId = subtask.id;
  taskSubtaskInput.value = subtask.title;
  updateSubtaskInputActions();
  taskSubtaskInput.focus();
}


/**
 * DE: Löscht einen Subtask aus dem Formular.
 * EN: Deletes a subtask from the form.
 * @param {string} subtaskId - DE: Subtask-ID. EN: Subtask id.
 */
function deleteFormSubtask(subtaskId) {
  for (let i = 0; i < taskFormState.subtasks.length; i++) {
    if (String(taskFormState.subtasks[i].id) !== String(subtaskId)) continue;
    taskFormState.subtasks.splice(i, 1);
    break;
  }
  renderFormSubtasks();
}


/**
 * DE: Verarbeitet Editieren und Löschen in der Subtaskliste.
 * EN: Handles edit and delete actions in the subtask list.
 * @param {MouseEvent} event - DE: Mausereignis. EN: Mouse event.
 */
function handleFormSubtaskAction(event) {
  const editButton = findParentWithAttribute(event.target, "data-edit-subtask");
  const deleteButton = findParentWithAttribute(event.target, "data-delete-subtask");
  if (editButton) editFormSubtask(editButton.getAttribute("data-edit-subtask"));
  if (deleteButton) deleteFormSubtask(deleteButton.getAttribute("data-delete-subtask"));
}


/**
 * DE: Fügt mit Enter einen Subtask hinzu, ohne den Haupttask zu speichern.
 * EN: Adds a subtask with Enter without saving the main task.
 * @param {KeyboardEvent} event - DE: Tastaturereignis. EN: Keyboard event.
 */
function handleSubtaskKeydown(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addOrUpdateSubtask();
}

/**
 * DE: Passt die Symbole im Subtask-Feld an die Eingabe an.
 * EN: Adapts the subtask field icons to the current input.
 */
function updateSubtaskInputActions() {
  const hasText = Boolean(taskSubtaskInput.value.trim());
  const clearButton = document.getElementById("taskSubtaskClear");
  const addButton = document.getElementById("taskSubtaskAdd");
  const divider = document.querySelector(".task-inline-divider");
  const wrapper = taskSubtaskInput.parentElement;
  clearButton.hidden = !hasText;
  addButton.hidden = !hasText;
  divider.hidden = !hasText;
  wrapper.classList.toggle("task-subtask-input-wrap--active", hasText);
}

