const avatarColorNames = [
  "orange",
  "pink",
  "indigo",
  "purple",
  "cyan",
  "teal",
  "coral",
  "apricot",
  "magenta",
  "gold",
  "royal",
  "lime",
];


/**
 * DE: Prüft, ob ein Farbname zur Avatar-Palette gehört.
 * EN: Checks whether a color name belongs to the avatar palette.
 * @param {string} colorName - DE: Farbname. EN: Color name.
 * @returns {boolean} DE: Gültig. EN: Valid.
 */
function isAvatarColorName(colorName) {
  return avatarColorNames.includes(colorName);
}


/**
 * DE: Liefert die CSS-Modifier-Klasse für einen Avatar-Farbnamen.
 * EN: Returns the CSS modifier class for an avatar color name.
 * @param {string} colorName - DE: Farbname. EN: Color name.
 * @returns {string} DE: Klassenname oder leer. EN: Class name or empty.
 */
function getAvatarColorClass(colorName) {
  if (!isAvatarColorName(colorName)) return "";
  return "avatar--" + colorName;
}


/**
 * DE: Wählt eine feste Avatar-Farbe anhand des Namens aus.
 * EN: Selects a stable avatar color based on the name.
 * @param {string} name - DE: Name. EN: Name.
 * @returns {string} DE: Farbname. EN: Color name.
 */
function getAvatarColorByName(name) {
  let total = 0;
  for (let i = 0; i < name.length; i++) {
    total += name.charCodeAt(i);
  }
  return avatarColorNames[total % avatarColorNames.length];
}


/**
 * DE: Wählt zufällig eine Avatar-Farbe aus der Palette.
 * EN: Selects a random avatar color from the palette.
 * @returns {string} DE: Farbname. EN: Color name.
 */
function getRandomAvatarColor() {
  const index = Math.floor(Math.random() * avatarColorNames.length);
  return avatarColorNames[index];
}
