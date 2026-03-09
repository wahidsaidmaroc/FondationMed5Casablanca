const KEYS = {
  students: "app_students",
  lates: "app_lates",
  settings: "app_settings"
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getStudents() {
  return safeParse(localStorage.getItem(KEYS.students), []);
}

export function saveStudents(students) {
  localStorage.setItem(KEYS.students, JSON.stringify(students));
}

export function getLates() {
  return safeParse(localStorage.getItem(KEYS.lates), []);
}

export function saveLates(lates) {
  localStorage.setItem(KEYS.lates, JSON.stringify(lates));
}

export function getSettings() {
  return safeParse(localStorage.getItem(KEYS.settings), {
    version: 1,
    lastOpenedAt: null
  });
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function touchLastOpened() {
  const settings = getSettings();
  settings.lastOpenedAt = new Date().toISOString();
  saveSettings(settings);
}

export function resetAllData() {
  localStorage.removeItem(KEYS.students);
  localStorage.removeItem(KEYS.lates);
  localStorage.removeItem(KEYS.settings);
}

export function getStorageKeys() {
  return { ...KEYS };
}
