/**
 * DE: Maskiert Text für eine sichere HTML-Ausgabe.
 * EN: Escapes text for safe HTML output.
 * @param {string} value - DE: Text. EN: Text.
 * @returns {string} DE: Maskierter Text. EN: Escaped text.
 */
function escapeTaskHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value || "");
  return element.innerHTML;
}


/**
 * DE: Sucht einen Kontakt für eine Task-Zuweisung.
 * EN: Finds a contact for a task assignment.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @param {string} reference - DE: Kontakt-ID. EN: Contact id.
 * @returns {object|null} DE: Kontakt. EN: Contact.
 */
function findTaskContact(contacts, reference) {
  for (let i = 0; i < contacts.length; i++) {
    if (String(contacts[i].id) === String(reference)) return contacts[i];
    if (String(contacts[i].email) === String(reference)) return contacts[i];
  }
  return null;
}


/**
 * DE: Erstellt das HTML eines Kontaktavatars.
 * EN: Creates the HTML of a contact avatar.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {string} DE: Avatar-HTML. EN: Avatar HTML.
 */
function getTaskAvatarTemplate(contact) {
  const initials = escapeTaskHtml(contact.initials || "?");
  const color = contact.color || "var(--join-blue)";
  const name = escapeTaskHtml(contact.name || "Contact");
  return `<span class="task-avatar" style="--task-avatar-color:${color}" title="${name}">${initials}</span>`;
}


/**
 * DE: Erstellt die Avatare eines Tasks.
 * EN: Creates the avatars of a task.
 * @param {object} task - DE: Task. EN: Task.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @returns {string} DE: Avatar-HTML. EN: Avatar HTML.
 */
function getTaskAvatarsTemplate(task, contacts) {
  let html = "";
  for (let i = 0; i < task.assignedTo.length; i++) {
    const contact = findTaskContact(contacts, task.assignedTo[i]);
    if (contact) html += getTaskAvatarTemplate(contact);
  }
  return html;
}


/**
 * DE: Gibt die CSS-Klasse für eine Taskkategorie zurück.
 * EN: Returns the CSS class for a task category.
 * @param {string} category - DE: Kategorie. EN: Category.
 * @returns {string} DE: CSS-Klasse. EN: CSS class.
 */
function getTaskCategoryClass(category) {
  if (category === "Technical Task") return "task-category--technical";
  return "task-category--story";
}


/**
 * DE: Erstellt die Fortschrittsanzeige einer Taskkarte.
 * EN: Creates the progress display of a task card.
 * @param {object} task - DE: Task. EN: Task.
 * @returns {string} DE: Fortschritts-HTML. EN: Progress HTML.
 */
function getTaskProgressTemplate(task) {
  if (!task.subtasks.length) return "";
  const done = countDoneSubtasks(task.subtasks);
  const progress = getSubtaskProgress(task.subtasks);
  const label = done + "/" + task.subtasks.length + " Subtasks";
  return `<div class="task-card-progress" title="${label}"><span><i style="width:${progress}%"></i></span><small>${label}</small></div>`;
}


/**
 * DE: Erstellt eine vollständige Taskkarte für das Board.
 * EN: Creates a complete task card for the board.
 * @param {object} task - DE: Task. EN: Task.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @returns {string} DE: Taskkarten-HTML. EN: Task card HTML.
 */
function getTaskCardTemplate(task, contacts) {
  const categoryClass = getTaskCategoryClass(task.category);
  const title = escapeTaskHtml(task.title);
  const description = escapeTaskHtml(task.description || "");
  const category = escapeTaskHtml(task.category || "User Story");
  const priorityIcon = getPriorityIcon(task.priority);
  return `
    <article class="task-card" draggable="true" data-task-id="${escapeTaskHtml(task.id)}" tabindex="0">
      <span class="task-category ${categoryClass}">${category}</span>
      <h3>${title}</h3>
      <p class="task-card-description">${description}</p>
      ${getTaskProgressTemplate(task)}
      <div class="task-card-footer">
        <div class="task-card-avatars">${getTaskAvatarsTemplate(task, contacts)}</div>
        <img class="task-card-priority" src="${priorityIcon}" alt="${getPriorityLabel(task.priority)}" />
      </div>
    </article>`;
}


/**
 * DE: Erstellt eine leere Board-Spalte.
 * EN: Creates an empty board column.
 * @param {string} label - DE: Spaltenname. EN: Column label.
 * @returns {string} DE: Hinweis-HTML. EN: Hint HTML.
 */
function getEmptyBoardTemplate(label) {
  if (label === "found") return '<div class="board-empty">No tasks found</div>';
  return `<div class="board-empty">No tasks ${escapeTaskHtml(label)}</div>`;
}


/**
 * DE: Erstellt eine Kontaktzeile für die Taskdetails.
 * EN: Creates one contact row for task details.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {string} DE: Kontakt-HTML. EN: Contact HTML.
 */
function getTaskDetailContactTemplate(contact) {
  const avatar = getTaskAvatarTemplate(contact);
  return `<li>${avatar}<span>${escapeTaskHtml(contact.name)}</span></li>`;
}


/**
 * DE: Erstellt die zugewiesenen Kontakte für die Detailansicht.
 * EN: Creates assigned contacts for the detail view.
 * @param {object} task - DE: Task. EN: Task.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @returns {string} DE: Kontaktlisten-HTML. EN: Contact list HTML.
 */
function getTaskDetailContactsTemplate(task, contacts) {
  let html = "";
  for (let i = 0; i < task.assignedTo.length; i++) {
    const contact = findTaskContact(contacts, task.assignedTo[i]);
    if (contact) html += getTaskDetailContactTemplate(contact);
  }
  return html || "<li>No contacts assigned</li>";
}


/**
 * DE: Erstellt einen Subtask in der Detailansicht.
 * EN: Creates one subtask in the detail view.
 * @param {object} subtask - DE: Subtask. EN: Subtask.
 * @returns {string} DE: Subtask-HTML. EN: Subtask HTML.
 */
function getTaskDetailSubtaskTemplate(subtask) {
  const checked = subtask.done ? " checked" : "";
  return `<label class="task-detail-subtask"><input type="checkbox" data-detail-subtask-id="${escapeTaskHtml(subtask.id)}"${checked} /><span>${escapeTaskHtml(subtask.title)}</span></label>`;
}


/**
 * DE: Erstellt alle Subtasks für die Detailansicht.
 * EN: Creates all subtasks for the detail view.
 * @param {Array} subtasks - DE: Subtasks. EN: Subtasks.
 * @returns {string} DE: Subtask-HTML. EN: Subtask HTML.
 */
function getTaskDetailSubtasksTemplate(subtasks) {
  let html = "";
  for (let i = 0; i < subtasks.length; i++) html += getTaskDetailSubtaskTemplate(subtasks[i]);
  return html || "<p class=\"task-detail-empty\">No subtasks</p>";
}


/**
 * DE: Erstellt die vollständige Detailansicht eines Tasks.
 * EN: Creates the complete detail view of a task.
 * @param {object} task - DE: Task. EN: Task.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @returns {string} DE: Detail-HTML. EN: Detail HTML.
 */
function getTaskDetailTemplate(task, contacts) {
  const categoryClass = getTaskCategoryClass(task.category);
  const priority = getPriorityLabel(task.priority);
  const priorityIcon = getPriorityIcon(task.priority);
  return `
    <button class="task-detail-close" type="button" data-task-detail-close aria-label="Taskdetails schließen">×</button>
    <span class="task-category ${categoryClass}">${escapeTaskHtml(task.category)}</span>
    <h2 id="taskDetailTitle">${escapeTaskHtml(task.title)}</h2>
    <p class="task-detail-description">${escapeTaskHtml(task.description || "No description")}</p>
    <dl class="task-detail-data">
      <div><dt>Due date:</dt><dd>${formatTaskDate(task.dueDate)}</dd></div>
      <div><dt>Priority:</dt><dd>${priority}<img src="${priorityIcon}" alt="" /></dd></div>
    </dl>
    <section class="task-detail-section"><h3>Assigned To:</h3><ul>${getTaskDetailContactsTemplate(task, contacts)}</ul></section>
    <section class="task-detail-section"><h3>Subtasks</h3><div class="task-detail-subtasks">${getTaskDetailSubtasksTemplate(task.subtasks)}</div></section>
    <div class="task-detail-actions">
      <button type="button" data-task-delete><img src="./assets/icons/delete.png" alt="" />Delete</button>
      <span aria-hidden="true"></span>
      <button type="button" data-task-edit><img src="./assets/icons/edit.png" alt="" />Edit</button>
    </div>`;
}


/**
 * DE: Erstellt eine Kontaktoption für das Assigned-to-Dropdown.
 * EN: Creates one contact option for the assigned-to dropdown.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @param {boolean} selected - DE: Auswahlstatus. EN: Selection state.
 * @param {boolean} ownContact - DE: Eigener Kontakt. EN: Own contact.
 * @returns {string} DE: Options-HTML. EN: Option HTML.
 */
function getAssignedContactTemplate(contact, selected, ownContact) {
  const checked = selected ? " checked" : "";
  const you = ownContact ? " (You)" : "";
  return `<label class="task-contact-option" data-contact-name="${escapeTaskHtml(contact.name).toLowerCase()}">${getTaskAvatarTemplate(contact)}<span>${escapeTaskHtml(contact.name)}${you}</span><input type="checkbox" data-contact-id="${escapeTaskHtml(contact.id)}"${checked} /></label>`;
}


/**
 * DE: Erstellt einen bearbeitbaren Subtask für das Formular.
 * EN: Creates one editable subtask for the form.
 * @param {object} subtask - DE: Subtask. EN: Subtask.
 * @returns {string} DE: Subtask-HTML. EN: Subtask HTML.
 */
function getFormSubtaskTemplate(subtask) {
  return `<li data-form-subtask-id="${escapeTaskHtml(subtask.id)}"><span class="task-subtask-title">${escapeTaskHtml(subtask.title)}</span><div class="task-subtask-actions"><button type="button" data-edit-subtask="${escapeTaskHtml(subtask.id)}" aria-label="Subtask bearbeiten"><img src="./assets/icons/edit.png" alt="" /></button><span aria-hidden="true"></span><button type="button" data-delete-subtask="${escapeTaskHtml(subtask.id)}" aria-label="Subtask löschen"><img src="./assets/icons/delete.png" alt="" /></button></div></li>`;
}
