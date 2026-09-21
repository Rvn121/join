/**
 * DE: Rendert die Subtasks unter dem Eingabefeld.
 * EN: Renders the subtasks below the input.
 */
function renderFormSubtasks() {
  const editor = taskSubtaskList.querySelector("[data-subtask-editor]");
  const draftId = editor?.closest("[data-form-subtask-id]").dataset.formSubtaskId;
  const draft = editor?.value;
  taskSubtaskList.innerHTML = getFormSubtasksHtml();
  if (draftId !== String(taskFormState.editingSubtaskId)) return;
  const nextEditor = taskSubtaskList.querySelector("[data-subtask-editor]");
  if (nextEditor) nextEditor.value = draft;
}


/**
 * DE: Baut das HTML aller Subtasks, der bearbeitete Subtask als Editor.
 * EN: Builds the HTML of all subtasks, the edited subtask as an editor.
 * @returns {string} DE: HTML. EN: HTML.
 */
function getFormSubtasksHtml() {
  let html = "";
  for (let i = 0; i < taskFormState.subtasks.length; i++) {
    const subtask = taskFormState.subtasks[i];
    html += String(subtask.id) === String(taskFormState.editingSubtaskId)
      ? getFormSubtaskEditorTemplate(subtask)
      : getFormSubtaskTemplate(subtask);
  }
  return html;
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
 * DE: Leert das Eingabefeld fuer neue Subtasks.
 * EN: Clears the input for new subtasks.
 */
function clearSubtaskInput() {
  taskSubtaskInput.value = "";
  updateSubtaskInputActions();
  taskSubtaskInput.focus();
}


/**
 * DE: Fuegt einen neuen Subtask hinzu.
 * EN: Adds a new subtask.
 */
function addOrUpdateSubtask() {
  const title = taskSubtaskInput.value.trim();
  if (!title) return;
  taskFormState.subtasks.push({ id: createTaskId(), title: title, done: false });
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
  renderFormSubtasks();
  const editor = taskSubtaskList.querySelector("[data-subtask-editor]");
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
}

/** DE: Bestaetigt die Aenderung direkt in der Zeile. EN: Confirms the inline edit. */
function saveFormSubtask(subtaskId) {
  const editor = taskSubtaskList.querySelector("[data-subtask-editor]");
  const subtask = findFormSubtask(subtaskId);
  if (!editor || !subtask) return;
  const title = editor.value.trim();
  if (!title) return editor.focus();
  subtask.title = title;
  taskFormState.editingSubtaskId = null;
  renderFormSubtasks();
  taskSubtaskInput.focus();
}

/**
 * DE: Übernimmt die Änderung beim Verlassen der Zeile (leerer Text wird verworfen) und beendet den Bearbeitungsmodus.
 * EN: Commits the edit when the row is left (empty text is discarded) and ends the editing mode.
 */
function commitSubtaskEdit() {
  const editor = taskSubtaskList.querySelector("[data-subtask-editor]");
  const subtask = findFormSubtask(taskFormState.editingSubtaskId);
  if (!editor || !subtask) return;
  const title = editor.value.trim();
  if (title) subtask.title = title;
  taskFormState.editingSubtaskId = null;
  renderFormSubtasks();
}


/**
 * DE: Klick oder Tipp außerhalb der Bearbeitungszeile übernimmt die Änderung.
 * EN: A click or tap outside the editing row commits the edit.
 * @param {PointerEvent} event - DE: Zeigerereignis. EN: Pointer event.
 */
function handleSubtaskEditorPointerDown(event) {
  if (taskFormState.editingSubtaskId === null) return;
  if (event.target.closest(".task-subtask-editing")) return;
  commitSubtaskEdit();
}


/**
 * DE: Verlassen der Zeile per Tastatur (Tab) übernimmt die Änderung; Mausklicks regelt pointerdown.
 * EN: Leaving the row via keyboard (Tab) commits the edit; mouse clicks are handled by pointerdown.
 * @param {FocusEvent} event - DE: Fokusereignis. EN: Focus event.
 */
function handleSubtaskEditorFocusOut(event) {
  if (!event.target.closest(".task-subtask-editing") || !event.relatedTarget) return;
  if (event.relatedTarget.closest(".task-subtask-editing")) return;
  commitSubtaskEdit();
}


/** DE: Startet Bearbeiten per Doppelklick. EN: Starts editing on double-click. */
function handleSubtaskDoubleClick(event) {
  if (event.target.closest("button, input")) return;
  const row = event.target.closest("[data-form-subtask-id]");
  if (row) editFormSubtask(row.dataset.formSubtaskId);
}

/** DE: Enter bestaetigt, Escape verwirft die Aenderung. EN: Enter confirms, Escape cancels. */
function handleSubtaskEditorKeydown(event) {
  if (!event.target.matches("[data-subtask-editor]") || event.isComposing) return;
  if (event.key !== "Enter" && event.key !== "Escape") return;
  event.preventDefault();
  if (event.key === "Enter") return saveFormSubtask(taskFormState.editingSubtaskId);
  taskFormState.editingSubtaskId = null;
  renderFormSubtasks();
  taskSubtaskInput.focus();
}


/**
 * DE: Löscht einen Subtask aus dem Formular.
 * EN: Deletes a subtask from the form.
 * @param {string} subtaskId - DE: Subtask-ID. EN: Subtask id.
 */
function deleteFormSubtask(subtaskId) {
  if (String(taskFormState.editingSubtaskId) === String(subtaskId)) {
    taskFormState.editingSubtaskId = null;
  }
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
  const editButton = event.target.closest("[data-edit-subtask]");
  const deleteButton = event.target.closest("[data-delete-subtask]");
  const saveButton = event.target.closest("[data-save-subtask]");
  if (editButton) editFormSubtask(editButton.getAttribute("data-edit-subtask"));
  if (deleteButton) deleteFormSubtask(deleteButton.getAttribute("data-delete-subtask"));
  if (saveButton) saveFormSubtask(saveButton.dataset.saveSubtask);
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
  const hasText = taskSubtaskInput.value.length > 0;
  document.querySelector(".task-subtask-input-actions").hidden = !hasText;
}

