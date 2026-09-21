/**
 * DE: Maskiert benutzerdefinierten Text für HTML-Ausgaben.
 * EN: Escapes user-controlled text for HTML output.
 * @param {string} value - DE: Textwert. EN: Text value.
 * @returns {string} DE: Sicherer HTML-Text. EN: Safe HTML text.
 */
function escapeContactHtml(value = "") {
  let text = String(value);
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  text = text.replace(/"/g, "&quot;");
  text = text.replace(/'/g, "&#039;");
  return text;
}


/**
 * DE: Erstellt das Profilbild im Kontakt-Dialog.
 * EN: Creates the profile avatar in the contact dialog.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactDialogAvatarTemplate(contact) {
  return `
    <span class="contact-avatar contact-avatar--dialog ${getAvatarColorClass(contact.color)}">
      ${escapeContactHtml(contact.initials)}
    </span>`;
}


/**
 * DE: Erstellt das Platzhalterbild für einen neuen Kontakt im Dialog.
 * EN: Creates the placeholder image for a new contact in the dialog.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactDialogPlaceholderTemplate() {
  return '<img src="./assets/icons/profil.svg" alt="" aria-hidden="true" />';
}


/**
 * DE: Erstellt das HTML für einen Kontakt in der Kontaktliste.
 * EN: Creates the HTML for one contact in the contact list.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @param {string|null} selectedId - DE: Ausgewählte Kontakt-ID. EN: Selected contact id.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactListItemTemplate(contact, selectedId) {
  const selectedClass = contact.id === selectedId ? " contact-list-item--active" : "";
  const current = contact.id === selectedId ? ' aria-current="true"' : "";
  return `
    <button class="contact-list-item${selectedClass}" type="button"
      data-contact-id="${escapeContactHtml(contact.id)}"${current}>
      <span class="contact-avatar contact-avatar--small ${getAvatarColorClass(contact.color)}">
        ${escapeContactHtml(contact.initials)}
      </span>
      <span class="contact-list-copy">
        <span class="contact-list-name">${escapeContactHtml(contact.name)}</span>
        <span class="contact-list-email">${escapeContactHtml(contact.email)}</span>
      </span>
    </button>`;
}


/**
 * DE: Erstellt das HTML für alle Kontakte einer Buchstabengruppe.
 * EN: Creates the HTML for all contacts in one letter group.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @param {string|null} selectedId - DE: Ausgewählte Kontakt-ID. EN: Selected contact id.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactItemsTemplate(contacts, selectedId) {
  let html = "";
  for (let i = 0; i < contacts.length; i++) {
    html += getContactListItemTemplate(contacts[i], selectedId);
  }
  return html;
}


/**
 * DE: Erstellt das HTML für eine alphabetische Kontaktgruppe.
 * EN: Creates the HTML for one alphabetical contact group.
 * @param {string} letter - DE: Anfangsbuchstabe. EN: First letter.
 * @param {Array} contacts - DE: Kontakte. EN: Contacts.
 * @param {string|null} selectedId - DE: Ausgewählte Kontakt-ID. EN: Selected contact id.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactGroupTemplate(letter, contacts, selectedId) {
  const safeLetter = escapeContactHtml(letter);
  const items = getContactItemsTemplate(contacts, selectedId);
  return `
    <section class="contact-group" aria-labelledby="contact-group-${safeLetter}">
      <h2 class="contact-group-letter" id="contact-group-${safeLetter}">${safeLetter}</h2>
      <div class="contact-group-items">${items}</div>
    </section>`;
}


/**
 * DE: Erstellt einen Aktionsbutton für die Kontakt-Detailansicht.
 * EN: Creates one action button for the contact detail view.
 * @param {string} action - DE: Aktion. EN: Action.
 * @param {string} label - DE: Beschriftung. EN: Label.
 * @param {string} icon - DE: Standardsymbol. EN: Default icon.
 * @param {string} hoverIcon - DE: Hover-Symbol. EN: Hover icon.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactActionTemplate(action, label, icon, hoverIcon) {
  return `
    <button class="contact-action" type="button" data-contact-action="${action}">
      <img src="./assets/icons/${icon}" data-default-icon="./assets/icons/${icon}"
        data-hover-icon="./assets/icons/${hoverIcon}" alt="" aria-hidden="true" />
      <span>${label}</span>
    </button>`;
}


/**
 * DE: Erstellt die Bearbeitungsaktionen eines Kontakts.
 * EN: Creates the edit actions of a contact.
 * @param {boolean} canManage - DE: Bearbeitungsrecht. EN: Edit permission.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactActionsTemplate(canManage) {
  if (!canManage) return "";
  return `
    <div class="contact-detail-actions">
      ${getContactActionTemplate("edit", "Edit", "edit.svg", "edit_hover.svg")}
      ${getContactActionTemplate("delete", "Delete", "delete.svg", "delete_hover.svg")}
    </div>
    <button class="contact-more-button" type="button" popovertarget="contactMobileActions" aria-label="Contact actions">
      <img src="./assets/icons/3points.svg" alt="" />
    </button>
    <div class="contact-mobile-actions" id="contactMobileActions" popover="auto">
      ${getContactActionTemplate("edit", "Edit", "edit.svg", "edit_hover.svg")}
      ${getContactActionTemplate("delete", "Delete", "delete.svg", "delete_hover.svg")}
    </div>`;
}


/**
 * DE: Erstellt das HTML für die Kontaktinformationen.
 * EN: Creates the HTML for the contact information.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactInformationTemplate(contact) {
  const phone = contact.phone || "Not provided";
  return `
    <h3 class="contact-information-title">Contact Information</h3>
    <dl class="contact-information">
      <div><dt>Email</dt><dd><a href="mailto:${escapeContactHtml(contact.email)}">${escapeContactHtml(contact.email)}</a></dd></div>
      <div><dt>Phone</dt><dd>${escapeContactHtml(phone)}</dd></div>
    </dl>`;
}


/**
 * DE: Erstellt das HTML für die ausgewählte Kontakt-Detailansicht.
 * EN: Creates the HTML for the selected contact detail view.
 * @param {object} contact - DE: Kontakt. EN: Contact.
 * @param {boolean} canManage - DE: Bearbeitungsrecht. EN: Edit permission.
 * @returns {string} DE: HTML-Inhalt. EN: HTML content.
 */
function getContactDetailTemplate(contact, canManage) {
  return `
    <article class="contact-detail-card">
      <div class="contact-detail-head">
        <span class="contact-avatar contact-avatar--large ${getAvatarColorClass(contact.color)}">
          ${escapeContactHtml(contact.initials)}
        </span>
        <div class="contact-detail-title">
          <h2>${escapeContactHtml(contact.name)}</h2>
          ${getContactActionsTemplate(canManage)}
        </div>
      </div>
      ${getContactInformationTemplate(contact)}
    </article>`;
}
