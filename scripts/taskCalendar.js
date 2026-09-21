let taskCalendar;
let taskCalendarMonth;
let taskCalendarOpenOnPointerDown = false;

/** DE: Merkt den Zustand vor dem automatischen Schließen. EN: Captures state before light dismiss. */
function rememberTaskCalendarState() {
  taskCalendarOpenOnPointerDown = Boolean(taskCalendar?.matches(":popover-open"));
}

/** DE: Verbindet den Kalender-Popover aus dem HTML mit seinen Ereignissen. EN: Wires up the calendar popover from the HTML. */
function initializeTaskCalendar() {
  taskCalendar = document.getElementById("taskCalendar");
  taskCalendar.addEventListener("click", handleTaskCalendarClick);
  taskCalendar.addEventListener("toggle", () => {
    document.getElementById("taskDatePicker").setAttribute("aria-expanded",
      String(taskCalendar.matches(":popover-open")));
  });
  window.addEventListener("resize", positionTaskCalendar);
  document.addEventListener("scroll", positionTaskCalendar, true);
}

/** DE: Positioniert den Kalender unter dem Icon. EN: Anchors below the icon. */
function positionTaskCalendar() {
  if (!taskCalendar?.matches(":popover-open")) return;
  const icon = document.getElementById("taskDatePicker").getBoundingClientRect();
  taskCalendar.style.left = Math.max(8, icon.right - taskCalendar.offsetWidth) + "px";
  taskCalendar.style.top = (icon.bottom + 8) + "px";
  taskCalendar.style.maxHeight = Math.max(80, window.innerHeight - icon.bottom - 16) + "px";
}

/**
 * DE: Öffnet oder schließt den Kalender.
 * EN: Toggles the date popover.
 * @param {Event} [event] - DE: Auslösendes Ereignis. EN: Triggering event.
 */
function toggleTaskCalendar(event) {
  const closeFromPointer = event?.detail > 0 && taskCalendarOpenOnPointerDown;
  taskCalendarOpenOnPointerDown = false;
  if (closeFromPointer) {
    if (taskCalendar?.matches(":popover-open")) taskCalendar.hidePopover();
    return;
  }
  if (!taskCalendar) initializeTaskCalendar();
  if (taskCalendar.matches(":popover-open")) return taskCalendar.hidePopover();
  openTaskCalendar();
}

/** DE: Öffnet den Kalender im Monat des gewählten Datums. EN: Opens the calendar in the month of the selected date. */
function openTaskCalendar() {
  const selected = parseTaskDueDate(taskDueDate.value);
  taskCalendarMonth = selected ? new Date(selected + "T12:00:00") : new Date();
  taskCalendarMonth.setDate(1);
  renderTaskCalendar();
  taskCalendar.showPopover();
  positionTaskCalendar();
  const day = taskCalendar.querySelector('[aria-pressed="true"]') ||
    taskCalendar.querySelector("[data-date]");
  day.focus({ preventScroll: true });
}

/** DE: Baut das Monatsraster. EN: Builds the month grid. */
function renderTaskCalendar() {
  const heading = taskCalendarMonth.toLocaleDateString("en-GB", {month: "long", year: "numeric"});
  taskCalendar.innerHTML = getTaskCalendarTemplate(heading, getTaskCalendarDaysHtml(heading));
}

/**
 * DE: Baut die Tagesbuttons des aktuellen Monats.
 * EN: Builds the day buttons of the current month.
 * @param {string} heading - DE: Beschriftung des Monats. EN: Month heading.
 * @returns {string} DE: HTML der Tagesbuttons. EN: HTML of the day buttons.
 */
function getTaskCalendarDaysHtml(heading) {
  const year = taskCalendarMonth.getFullYear();
  const month = taskCalendarMonth.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const selected = parseTaskDueDate(taskDueDate.value);
  let html = "";
  for (let i = 0; i < offset; i++) html += getTaskCalendarOffsetTemplate();
  for (let day = 1; day <= days; day++) {
    const value = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    html += getTaskCalendarDayTemplate(day, value, heading, value === selected);
  }
  return html;
}

/**
 * DE: Verarbeitet Monat und Datumsauswahl.
 * EN: Handles month/date selection.
 * @param {MouseEvent} event - DE: Klickereignis. EN: Click event.
 */
function handleTaskCalendarClick(event) {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.month) {
    taskCalendarMonth.setMonth(taskCalendarMonth.getMonth() + Number(button.dataset.month));
    renderTaskCalendar();
    taskCalendar.querySelector('[data-month="' + button.dataset.month + '"]').focus({preventScroll: true});
    positionTaskCalendar();
    return;
  }
  taskDueDate.value = formatTaskDate(button.dataset.date);
  taskDueDate.dispatchEvent(new Event("input", {bubbles: true}));
  taskDueDate.dispatchEvent(new Event("change", {bubbles: true}));
  taskCalendar.hidePopover();
  document.getElementById("taskDatePicker").focus({preventScroll: true});
}
