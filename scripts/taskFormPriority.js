/**
 * DE: Markiert die aktuell ausgewählte Priorität mit einer CSS-Klasse.
 * EN: Marks the currently selected priority with a CSS class.
 */
function updateTaskPrioritySelection() {
  const options = taskForm.querySelectorAll(".task-priority");
  for (let i = 0; i < options.length; i++) {
    options[i].classList.remove("task-priority--selected");
  }
  const selected = taskForm.querySelector('input[name="priority"]:checked');
  if (selected) selected.parentElement.classList.add("task-priority--selected");
}


/**
 * DE: Verknüpft die Prioritätsfelder mit der sichtbaren Auswahl.
 * EN: Connects the priority fields with the visible selection.
 */
function initializeTaskPriorityEvents() {
  const radios = taskForm.querySelectorAll('input[name="priority"]');
  for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("change", updateTaskPrioritySelection);
  }
  updateTaskPrioritySelection();
}
