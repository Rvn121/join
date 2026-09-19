let taskCalendar;
let taskCalendarMonth;
let taskCalendarOpenOnPointerDown = false;

/** DE: Merkt den Zustand vor dem automatischen Schließen. EN: Captures state before light dismiss. */
function rememberTaskCalendarState() {
  taskCalendarOpenOnPointerDown = Boolean(taskCalendar?.matches(":popover-open"));
}

/** DE: Erstellt den Kalender im Vordergrund. EN: Creates the calendar popover. */
function createTaskCalendar() {
  taskCalendar = document.createElement("div");
  taskCalendar.id = "taskCalendar";
  taskCalendar.className = "task-calendar";
  taskCalendar.setAttribute("popover", "auto");
  taskCalendar.setAttribute("role", "dialog");
  taskCalendar.setAttribute("aria-label", "Choose due date");
  taskDueDate.parentElement.append(taskCalendar);
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

/** DE: Öffnet oder schließt den Kalender. EN: Toggles the date popover. */
function toggleTaskCalendar(event) {
  const closeFromPointer = event?.detail > 0 && taskCalendarOpenOnPointerDown;
  taskCalendarOpenOnPointerDown = false;
  if (closeFromPointer) {
    if (taskCalendar?.matches(":popover-open")) taskCalendar.hidePopover();
    return;
  }
  if (!taskCalendar) createTaskCalendar();
  if (taskCalendar.matches(":popover-open")) return taskCalendar.hidePopover();
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
  const year = taskCalendarMonth.getFullYear();
  const month = taskCalendarMonth.getMonth();
  const heading = taskCalendarMonth.toLocaleDateString("en-GB", {month: "long", year: "numeric"});
  let html = '<div class="task-calendar-heading"><button type="button" data-month="-1" aria-label="Previous month">‹</button>';
  html += '<strong aria-live="polite">' + heading + '</strong><button type="button" data-month="1" aria-label="Next month">›</button></div>';
  html += '<div class="task-calendar-grid">';
  for (const weekday of ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]) html += '<span>' + weekday + '</span>';
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) html += '<span></span>';
  const days = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= days; day++) {
    const value = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    html += '<button type="button" data-date="' + value + '" aria-label="' + day + ' ' + heading +
      '" aria-pressed="' + (value === parseTaskDueDate(taskDueDate.value)) + '">' + day + '</button>';
  }
  taskCalendar.innerHTML = html + '</div>';
}

/** DE: Verarbeitet Monat und Datumsauswahl. EN: Handles month/date selection. */
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
