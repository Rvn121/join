const taskDueDatePicker = document.getElementById("taskDueDatePicker");
const taskDueDateButton = document.getElementById("taskDueDateButton");

/**
 * DE: Fügt führende Nullen zu einer Zahl hinzu.
 * EN: Adds a leading zero to a number.
 * @param {number|string} value - DE: Zahl. EN: Number.
 * @returns {string} DE: Zweistelliger Wert. EN: Two-digit value.
 */
function padTaskDateValue(value) {
  return String(value).padStart(2, "0");
}

/**
 * DE: Zerlegt ein sichtbares Datum im Format TT/MM/JJJJ.
 * EN: Splits a visible date in DD/MM/YYYY format.
 * @param {string} value - DE: Sichtbares Datum. EN: Visible date.
 * @returns {Array|null} DE: Datumsteile. EN: Date parts.
 */
function getTaskDateParts(value) {
  const parts = String(value || "").split("/");
  if (parts.length !== 3) return null;
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

/**
 * DE: Prüft, ob Datumsteile ein echtes Kalenderdatum bilden.
 * EN: Checks whether date parts form a real calendar date.
 * @param {Array|null} parts - DE: Datumsteile. EN: Date parts.
 * @returns {boolean} DE: Gültigkeitsstatus. EN: Validation state.
 */
function areTaskDatePartsValid(parts) {
  if (!parts || parts[2] < 1000) return false;
  const date = new Date(parts[2], parts[1] - 1, parts[0]);
  if (date.getDate() !== parts[0]) return false;
  if (date.getMonth() + 1 !== parts[1]) return false;
  return date.getFullYear() === parts[2];
}

/**
 * DE: Wandelt das sichtbare Datum in das Speicherformat JJJJ-MM-TT um.
 * EN: Converts the visible date to the YYYY-MM-DD storage format.
 * @returns {string} DE: Speicherwert oder leerer Text. EN: Storage value or empty text.
 */
function getTaskDueDateValue() {
  const parts = getTaskDateParts(taskDueDate.value.trim());
  if (!areTaskDatePartsValid(parts)) return "";
  const month = padTaskDateValue(parts[1]);
  const day = padTaskDateValue(parts[0]);
  return parts[2] + "-" + month + "-" + day;
}

/**
 * DE: Zeigt ein gespeichertes Datum als TT/MM/JJJJ an.
 * EN: Displays a stored date as DD/MM/YYYY.
 * @param {string} value - DE: Gespeichertes Datum. EN: Stored date.
 */
function setTaskDueDateValue(value) {
  taskDueDate.value = value ? formatTaskDate(value) : "";
  if (taskDueDatePicker) taskDueDatePicker.value = value || "";
}

/**
 * DE: Leert das sichtbare Datum und den Kalenderwert.
 * EN: Clears the visible date and the calendar value.
 */
function clearTaskDueDateValue() {
  taskDueDate.value = "";
  if (taskDueDatePicker) taskDueDatePicker.value = "";
}

/**
 * DE: Formatiert die Zifferneingabe automatisch als TT/MM/JJJJ.
 * EN: Automatically formats typed digits as DD/MM/YYYY.
 */
function formatTaskDueDateTyping() {
  const digits = taskDueDate.value.replace(/\D/g, "").slice(0, 8);
  let value = digits.slice(0, 2);
  if (digits.length > 2) value += "/" + digits.slice(2, 4);
  if (digits.length > 4) value += "/" + digits.slice(4, 8);
  taskDueDate.value = value;
}

/**
 * DE: Übernimmt das ausgewählte Kalenderdatum in das sichtbare Feld.
 * EN: Copies the selected calendar date into the visible field.
 */
function syncTaskDueDateFromPicker() {
  if (!taskDueDatePicker || !taskDueDatePicker.value) return;
  setTaskDueDateValue(taskDueDatePicker.value);
  clearTaskFieldError(taskDueDate);
}

/**
 * DE: Öffnet den nativen Kalender des Browsers.
 * EN: Opens the browser's native date picker.
 */
function openTaskDueDatePicker() {
  if (!taskDueDatePicker) return;
  taskDueDatePicker.value = getTaskDueDateValue();
  if (typeof taskDueDatePicker.showPicker === "function") taskDueDatePicker.showPicker();
  else taskDueDatePicker.click();
}

/**
 * DE: Prüft das Fälligkeitsdatum des Taskformulars.
 * EN: Validates the due date of the task form.
 * @returns {boolean} DE: Gültigkeitsstatus. EN: Validation state.
 */
function validateTaskDueDateField() {
  clearTaskFieldError(taskDueDate);
  if (!taskDueDate.value.trim()) {
    showTaskFieldError(taskDueDate, "Please select a due date.");
    return false;
  }
  if (getTaskDueDateValue()) return true;
  showTaskFieldError(taskDueDate, "Please enter a valid date.");
  return false;
}

/**
 * DE: Initialisiert Eingabe und Kalender für das Fälligkeitsdatum.
 * EN: Initializes typing and the calendar for the due date.
 */
function initializeTaskDueDate() {
  if (!taskDueDate || !taskDueDatePicker || !taskDueDateButton) return;
  taskDueDate.addEventListener("input", formatTaskDueDateTyping);
  taskDueDatePicker.addEventListener("change", syncTaskDueDateFromPicker);
  taskDueDateButton.addEventListener("click", openTaskDueDatePicker);
}
