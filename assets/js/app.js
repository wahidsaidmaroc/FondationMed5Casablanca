import {
  getStudents,
  saveStudents,
  getLates,
  saveLates,
  touchLastOpened,
  resetAllData
} from "./storage.js";

let students = getStudents();
let lates = getLates();

const state = {
  activeSection: "dashboard",
  editingStudentId: "",
  editingLateId: "",
  confirmAction: null
};

const el = {
  tabs: Array.from(document.querySelectorAll(".tab")),
  sections: Array.from(document.querySelectorAll(".view")),

  gotoAddLateBtn: document.getElementById("gotoAddLateBtn"),
  gotoAddStudentBtn: document.getElementById("gotoAddStudentBtn"),
  dashboardExportBtn: document.getElementById("dashboardExportBtn"),

  studentSearch: document.getElementById("studentSearch"),
  studentsTableBody: document.getElementById("studentsTableBody"),
  studentForm: document.getElementById("studentForm"),
  studentFormTitle: document.getElementById("studentFormTitle"),
  studentFormError: document.getElementById("studentFormError"),
  studentId: document.getElementById("studentId"),
  studentLastName: document.getElementById("studentLastName"),
  studentFirstName: document.getElementById("studentFirstName"),
  studentGroup: document.getElementById("studentGroup"),
  studentPhone: document.getElementById("studentPhone"),
  studentEmail: document.getElementById("studentEmail"),
  studentActive: document.getElementById("studentActive"),
  cancelStudentEditBtn: document.getElementById("cancelStudentEditBtn"),
  exportStudentsBtn: document.getElementById("exportStudentsBtn"),

  lateForm: document.getElementById("lateForm"),
  lateFormError: document.getElementById("lateFormError"),
  lateId: document.getElementById("lateId"),
  lateStudent: document.getElementById("lateStudent"),
  lateDate: document.getElementById("lateDate"),
  lateTime: document.getElementById("lateTime"),
  lateMinutes: document.getElementById("lateMinutes"),
  lateReason: document.getElementById("lateReason"),
  lateJustified: document.getElementById("lateJustified"),
  cancelLateEditBtn: document.getElementById("cancelLateEditBtn"),
  latesTableBody: document.getElementById("latesTableBody"),
  exportLatesBtn: document.getElementById("exportLatesBtn"),

  filterDate: document.getElementById("filterDate"),
  filterGroup: document.getElementById("filterGroup"),
  filterStudent: document.getElementById("filterStudent"),
  filterJustified: document.getElementById("filterJustified"),
  filterSort: document.getElementById("filterSort"),
  resetLateFiltersBtn: document.getElementById("resetLateFiltersBtn"),

  topStudentsList: document.getElementById("topStudentsList"),
  groupMinutesList: document.getElementById("groupMinutesList"),
  statsExportBtn: document.getElementById("statsExportBtn"),

  kpiTodayCount: document.getElementById("kpiTodayCount"),
  kpiMonthCount: document.getElementById("kpiMonthCount"),
  kpiMonthMinutes: document.getElementById("kpiMonthMinutes"),

  resetDataBtn: document.getElementById("resetDataBtn"),
  confirmModal: document.getElementById("confirmModal"),
  confirmText: document.getElementById("confirmText"),
  confirmYes: document.getElementById("confirmYes"),
  confirmNo: document.getElementById("confirmNo"),

  toastContainer: document.getElementById("toastContainer")
};

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(text) {
  const value = String(text ?? "");
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const className = type === "danger" ? "alert-danger" : "alert-success";
  toast.className = `alert ${className} shadow-sm mb-2`;
  toast.textContent = message;
  el.toastContainer.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2600);
}

function askConfirm(message, onConfirm) {
  state.confirmAction = onConfirm;
  el.confirmText.textContent = message;
  el.confirmModal.classList.add("is-visible");
  el.confirmModal.style.display = "block";
  el.confirmModal.setAttribute("aria-hidden", "false");
}

function closeConfirm() {
  el.confirmModal.classList.remove("is-visible");
  el.confirmModal.style.display = "none";
  el.confirmModal.setAttribute("aria-hidden", "true");
  state.confirmAction = null;
}

function setSection(sectionId) {
  state.activeSection = sectionId;

  el.sections.forEach((section) => {
    const visible = section.id === sectionId;
    section.classList.toggle("is-visible", visible);
  });

  el.tabs.forEach((tab) => {
    const active = tab.dataset.section === sectionId;
    tab.classList.toggle("is-active", active);
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-current", active ? "page" : "false");
  });
}

function getStudentById(studentId) {
  return students.find((student) => student.id === studentId) || null;
}

function saveAll() {
  saveStudents(students);
  saveLates(lates);
}

function resetStudentForm() {
  state.editingStudentId = "";
  el.studentFormTitle.textContent = "Ajouter un etudiant";
  el.studentFormError.textContent = "";
  el.studentId.value = "";
  el.studentLastName.value = "";
  el.studentFirstName.value = "";
  el.studentGroup.value = "";
  el.studentPhone.value = "";
  el.studentEmail.value = "";
  el.studentActive.value = "true";
}

function resetLateForm() {
  state.editingLateId = "";
  el.lateFormError.textContent = "";
  el.lateId.value = "";
  el.lateDate.value = todayISO();
  el.lateTime.value = "";
  el.lateMinutes.value = "";
  el.lateReason.value = "";
  el.lateJustified.value = "false";
}

function renderStudentOptions() {
  const activeStudents = students.filter((s) => s.active);
  const options = activeStudents
    .sort((a, b) => a.lastName.localeCompare(b.lastName))
    .map((student) => {
      const fullName = `${student.lastName} ${student.firstName}`;
      return `<option value="${student.id}">${escapeHtml(fullName)} - ${escapeHtml(student.group)}</option>`;
    })
    .join("");

  el.lateStudent.innerHTML = activeStudents.length
    ? options
    : '<option value="">Aucun etudiant actif</option>';

  if (state.editingLateId) {
    const editingLate = lates.find((late) => late.id === state.editingLateId);
    if (editingLate) {
      el.lateStudent.value = editingLate.studentId;
    }
  }

  renderFilterOptions();
}

function renderFilterOptions() {
  const groups = Array.from(new Set(students.map((student) => student.group).filter(Boolean))).sort();
  const groupCurrent = el.filterGroup.value;
  const studentCurrent = el.filterStudent.value;

  el.filterGroup.innerHTML = ['<option value="">Tous</option>']
    .concat(groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`))
    .join("");

  el.filterStudent.innerHTML = ['<option value="">Tous</option>']
    .concat(
      students
        .slice()
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`))
        .map((student) => `<option value="${student.id}">${escapeHtml(student.lastName)} ${escapeHtml(student.firstName)}</option>`)
    )
    .join("");

  if (groups.includes(groupCurrent)) {
    el.filterGroup.value = groupCurrent;
  }

  if (students.some((student) => student.id === studentCurrent)) {
    el.filterStudent.value = studentCurrent;
  }
}

function renderStudents() {
  const query = el.studentSearch.value.trim().toLowerCase();
  const filtered = students.filter((student) => {
    if (!query) return true;
    const haystack = `${student.lastName} ${student.firstName} ${student.group}`.toLowerCase();
    return haystack.includes(query);
  });

  if (!filtered.length) {
    el.studentsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Aucun etudiant trouve.</td></tr>';
    return;
  }

  el.studentsTableBody.innerHTML = filtered
    .map((student) => {
      const status = student.active
        ? '<span class="badge text-bg-success">Actif</span>'
        : '<span class="badge text-bg-secondary">Inactif</span>';

      const contact = [student.phone, student.email].filter(Boolean).join(" | ") || "-";

      return `
        <tr>
          <td>${escapeHtml(student.lastName)}</td>
          <td>${escapeHtml(student.firstName)}</td>
          <td>${escapeHtml(student.group)}</td>
          <td>${escapeHtml(contact)}</td>
          <td>${status}</td>
          <td>
            <div class="d-flex gap-1 flex-wrap">
              <button type="button" class="btn btn-sm btn-outline-primary" data-action="edit-student" data-id="${student.id}">Editer</button>
              <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-student" data-id="${student.id}">Supprimer</button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

function getFilteredLates() {
  let result = lates.slice();

  if (el.filterDate.value) {
    result = result.filter((late) => late.date === el.filterDate.value);
  }

  if (el.filterGroup.value) {
    const groupSet = new Set(students.filter((s) => s.group === el.filterGroup.value).map((s) => s.id));
    result = result.filter((late) => groupSet.has(late.studentId));
  }

  if (el.filterStudent.value) {
    result = result.filter((late) => late.studentId === el.filterStudent.value);
  }

  if (el.filterJustified.value !== "") {
    const justified = el.filterJustified.value === "true";
    result = result.filter((late) => late.justified === justified);
  }

  switch (el.filterSort.value) {
    case "minutes_desc":
      result.sort((a, b) => b.minutes - a.minutes);
      break;
    case "minutes_asc":
      result.sort((a, b) => a.minutes - b.minutes);
      break;
    case "date_asc":
      result.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case "date_desc":
    default:
      result.sort((a, b) => b.date.localeCompare(a.date));
      break;
  }

  return result;
}

function renderLates() {
  const filtered = getFilteredLates();

  if (!filtered.length) {
    el.latesTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Aucun retard trouve.</td></tr>';
    return;
  }

  el.latesTableBody.innerHTML = filtered
    .map((late) => {
      const student = getStudentById(late.studentId);
      const studentName = student ? `${student.lastName} ${student.firstName}` : "Etudiant supprime";
      const groupName = student ? student.group : "-";

      return `
        <tr>
          <td>${escapeHtml(late.date)}</td>
          <td>${escapeHtml(late.time || "-")}</td>
          <td>${escapeHtml(studentName)}</td>
          <td>${escapeHtml(groupName)}</td>
          <td>${late.minutes}</td>
          <td>${escapeHtml(late.reason || "-")}</td>
          <td>${late.justified ? '<span class="badge text-bg-success">Oui</span>' : '<span class="badge text-bg-warning">Non</span>'}</td>
          <td>
            <div class="d-flex gap-1 flex-wrap">
              <button type="button" class="btn btn-sm btn-outline-primary" data-action="edit-late" data-id="${late.id}">Editer</button>
              <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-late" data-id="${late.id}">Supprimer</button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

function renderKpis() {
  const today = todayISO();
  const monthPrefix = today.slice(0, 7);

  const todayCount = lates.filter((late) => late.date === today).length;
  const monthLates = lates.filter((late) => late.date.startsWith(monthPrefix));
  const monthCount = monthLates.length;
  const monthMinutes = monthLates.reduce((sum, late) => sum + late.minutes, 0);

  el.kpiTodayCount.textContent = String(todayCount);
  el.kpiMonthCount.textContent = String(monthCount);
  el.kpiMonthMinutes.textContent = String(monthMinutes);
}

function renderStats() {
  const byStudent = new Map();
  const byGroup = new Map();

  lates.forEach((late) => {
    const student = getStudentById(late.studentId);
    if (!student) return;

    const studentName = `${student.lastName} ${student.firstName}`;
    byStudent.set(studentName, (byStudent.get(studentName) || 0) + late.minutes);
    byGroup.set(student.group, (byGroup.get(student.group) || 0) + late.minutes);
  });

  const topStudents = Array.from(byStudent.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const groups = Array.from(byGroup.entries()).sort((a, b) => b[1] - a[1]);

  const maxStudent = topStudents.length ? topStudents[0][1] : 1;
  const maxGroup = groups.length ? groups[0][1] : 1;

  el.topStudentsList.innerHTML = topStudents.length
    ? topStudents
        .map(([name, minutes]) => {
          const width = Math.max(6, Math.round((minutes / maxStudent) * 100));
          return `
            <div class="bar-row">
              <div class="bar-label"><span>${escapeHtml(name)}</span><strong>${minutes} min</strong></div>
              <div class="progress" role="progressbar" aria-valuenow="${minutes}" aria-valuemin="0" aria-valuemax="${maxStudent}">
                <div class="progress-bar" style="width: ${width}%"></div>
              </div>
            </div>`;
        })
        .join("")
    : '<p class="text-muted mb-0">Aucune donnee.</p>';

  el.groupMinutesList.innerHTML = groups.length
    ? groups
        .map(([group, minutes]) => {
          const width = Math.max(6, Math.round((minutes / maxGroup) * 100));
          return `
            <div class="bar-row">
              <div class="bar-label"><span>${escapeHtml(group)}</span><strong>${minutes} min</strong></div>
              <div class="progress" role="progressbar" aria-valuenow="${minutes}" aria-valuemin="0" aria-valuemax="${maxGroup}">
                <div class="progress-bar bg-success" style="width: ${width}%"></div>
              </div>
            </div>`;
        })
        .join("")
    : '<p class="text-muted mb-0">Aucune donnee.</p>';
}

function refreshAll() {
  renderStudentOptions();
  renderStudents();
  renderLates();
  renderKpis();
  renderStats();
}

function studentToCsvRows(data) {
  const header = ["id", "lastName", "firstName", "group", "phone", "email", "active", "createdAt"];
  const rows = data.map((student) => [
    student.id,
    student.lastName,
    student.firstName,
    student.group,
    student.phone,
    student.email,
    String(student.active),
    student.createdAt
  ]);
  return [header].concat(rows);
}

function lateToCsvRows(data) {
  const header = ["id", "studentId", "studentName", "group", "date", "time", "minutes", "reason", "justified", "createdAt"];
  const rows = data.map((late) => {
    const student = getStudentById(late.studentId);
    return [
      late.id,
      late.studentId,
      student ? `${student.lastName} ${student.firstName}` : "",
      student ? student.group : "",
      late.date,
      late.time || "",
      String(late.minutes),
      late.reason || "",
      String(late.justified),
      late.createdAt
    ];
  });
  return [header].concat(rows);
}

function exportCsv(filename, rows) {
  const csv = rows
    .map((columns) =>
      columns
        .map((col) => `"${String(col ?? "").replaceAll('"', '""')}"`)
        .join(";")
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function onSubmitStudent(event) {
  event.preventDefault();
  el.studentFormError.textContent = "";

  const lastName = el.studentLastName.value.trim();
  const firstName = el.studentFirstName.value.trim();
  const group = el.studentGroup.value.trim();

  if (!lastName || !firstName || !group) {
    el.studentFormError.textContent = "Nom, prenom et groupe sont obligatoires.";
    return;
  }

  const payload = {
    lastName,
    firstName,
    group,
    phone: el.studentPhone.value.trim(),
    email: el.studentEmail.value.trim(),
    active: el.studentActive.value === "true"
  };

  if (state.editingStudentId) {
    students = students.map((student) =>
      student.id === state.editingStudentId
        ? { ...student, ...payload }
        : student
    );
    showToast("Etudiant modifie.");
  } else {
    students.push({
      id: uid("std"),
      ...payload,
      createdAt: new Date().toISOString()
    });
    showToast("Etudiant ajoute.");
  }

  saveStudents(students);
  resetStudentForm();
  refreshAll();
}

function onSubmitLate(event) {
  event.preventDefault();
  el.lateFormError.textContent = "";

  const studentId = el.lateStudent.value;
  const date = el.lateDate.value;
  const minutes = Number(el.lateMinutes.value);

  if (!studentId || !date || !Number.isFinite(minutes) || minutes <= 0) {
    el.lateFormError.textContent = "Etudiant, date et minutes (>0) sont obligatoires.";
    return;
  }

  const duplicate = lates.find((late) =>
    late.studentId === studentId &&
    late.date === date &&
    late.minutes === minutes &&
    late.id !== state.editingLateId
  );

  if (duplicate) {
    showToast("Attention: doublon detecte (meme etudiant/date/minutes).", "danger");
  }

  const payload = {
    studentId,
    date,
    time: el.lateTime.value,
    minutes,
    reason: el.lateReason.value.trim(),
    justified: el.lateJustified.value === "true"
  };

  if (state.editingLateId) {
    lates = lates.map((late) =>
      late.id === state.editingLateId
        ? { ...late, ...payload }
        : late
    );
    showToast("Retard modifie.");
  } else {
    lates.push({
      id: uid("late"),
      ...payload,
      createdAt: new Date().toISOString()
    });
    showToast("Retard ajoute.");
  }

  saveLates(lates);
  resetLateForm();
  refreshAll();
}

function handleStudentsTableClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "edit-student") {
    const student = students.find((item) => item.id === id);
    if (!student) return;

    state.editingStudentId = student.id;
    el.studentFormTitle.textContent = "Modifier un etudiant";
    el.studentId.value = student.id;
    el.studentLastName.value = student.lastName;
    el.studentFirstName.value = student.firstName;
    el.studentGroup.value = student.group;
    el.studentPhone.value = student.phone;
    el.studentEmail.value = student.email;
    el.studentActive.value = String(student.active);
    setSection("students");
    el.studentLastName.focus();
  }

  if (action === "delete-student") {
    askConfirm("Supprimer cet etudiant et tous ses retards ?", () => {
      students = students.filter((student) => student.id !== id);
      lates = lates.filter((late) => late.studentId !== id);
      saveAll();
      refreshAll();
      showToast("Etudiant et retards supprimes.");
    });
  }
}

function handleLatesTableClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "edit-late") {
    const late = lates.find((item) => item.id === id);
    if (!late) return;

    state.editingLateId = late.id;
    el.lateId.value = late.id;
    el.lateStudent.value = late.studentId;
    el.lateDate.value = late.date;
    el.lateTime.value = late.time || "";
    el.lateMinutes.value = String(late.minutes);
    el.lateReason.value = late.reason || "";
    el.lateJustified.value = String(late.justified);
    setSection("lates");
    el.lateMinutes.focus();
  }

  if (action === "delete-late") {
    askConfirm("Supprimer ce retard ?", () => {
      lates = lates.filter((late) => late.id !== id);
      saveLates(lates);
      refreshAll();
      showToast("Retard supprime.");
    });
  }
}

function bindEvents() {
  el.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setSection(tab.dataset.section || "dashboard");
    });
  });

  el.gotoAddStudentBtn.addEventListener("click", () => {
    setSection("students");
    resetStudentForm();
    el.studentLastName.focus();
  });

  el.gotoAddLateBtn.addEventListener("click", () => {
    setSection("lates");
    resetLateForm();
    el.lateMinutes.focus();
  });

  el.dashboardExportBtn.addEventListener("click", () => {
    exportCsv("retards.csv", lateToCsvRows(getFilteredLates()));
  });

  el.studentSearch.addEventListener("input", renderStudents);
  el.studentForm.addEventListener("submit", onSubmitStudent);
  el.cancelStudentEditBtn.addEventListener("click", resetStudentForm);
  el.studentsTableBody.addEventListener("click", handleStudentsTableClick);

  el.exportStudentsBtn.addEventListener("click", () => {
    exportCsv("etudiants.csv", studentToCsvRows(students));
  });

  el.lateForm.addEventListener("submit", onSubmitLate);
  el.cancelLateEditBtn.addEventListener("click", resetLateForm);
  el.latesTableBody.addEventListener("click", handleLatesTableClick);

  [el.filterDate, el.filterGroup, el.filterStudent, el.filterJustified, el.filterSort].forEach((input) => {
    input.addEventListener("change", renderLates);
  });

  el.resetLateFiltersBtn.addEventListener("click", () => {
    el.filterDate.value = "";
    el.filterGroup.value = "";
    el.filterStudent.value = "";
    el.filterJustified.value = "";
    el.filterSort.value = "date_desc";
    renderLates();
  });

  el.exportLatesBtn.addEventListener("click", () => {
    exportCsv("retards.csv", lateToCsvRows(getFilteredLates()));
  });

  el.statsExportBtn.addEventListener("click", () => {
    exportCsv("stats_retards.csv", lateToCsvRows(getFilteredLates()));
  });

  el.resetDataBtn.addEventListener("click", () => {
    askConfirm("Reinitialiser toutes les donnees locales ?", () => {
      resetAllData();
      students = [];
      lates = [];
      resetStudentForm();
      resetLateForm();
      refreshAll();
      showToast("Toutes les donnees ont ete reinitialisees.", "danger");
    });
  });

  el.confirmYes.addEventListener("click", () => {
    if (typeof state.confirmAction === "function") {
      state.confirmAction();
    }
    closeConfirm();
  });

  el.confirmNo.addEventListener("click", closeConfirm);
  el.confirmModal.addEventListener("click", (event) => {
    if (event.target === el.confirmModal) {
      closeConfirm();
    }
  });
}

function init() {
  touchLastOpened();
  bindEvents();
  resetStudentForm();
  resetLateForm();
  refreshAll();
}

init();
