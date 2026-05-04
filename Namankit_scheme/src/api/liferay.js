// ============================================================
//  src/api/liferay.js
// ============================================================
const buildHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: "Basic " + btoa("prabhudasu:root"),
  // "x-csrf-token": window.Liferay?.authToken || "",
});

const opts = { credentials: "include", headers: buildHeaders() };

// ── Reads Liferay error body and surfaces it clearly ──────────
async function throwWithBody(res, method, path) {
  let body = "";
  try {
    body = await res.text();
  } catch {}
  let message = "";
  try {
    const json = JSON.parse(body);
    message = json.title || json.detail || json.message || body;
  } catch {
    message = body;
  }
  const err = new Error(`[${method} ${path}] ${res.status} — ${message}`);
  err.status = res.status;
  err.body = body;
  err.apiPath = path;
  console.error("Liferay API error:", { status: res.status, path, body });
  if (typeof window.__showApiError === "function") window.__showApiError(err);
  throw err;
}

// ── Generic fetchers ──────────────────────────────────────────
export async function apiFetch(path) {
  const res = await fetch(path, opts);
  if (!res.ok) await throwWithBody(res, "GET", path);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    ...opts,
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) await throwWithBody(res, "POST", path);
  return res.json();
}

export async function apiPatch(path, body) {
  const res = await fetch(path, {
    ...opts,
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) await throwWithBody(res, "PATCH", path);
  return res.json();
}

// ── Location dropdowns ────────────────────────────────────────
export const getStates = () =>
  apiFetch("/o/c/states?pageSize=200&sort=name:asc").then((d) =>
    (d.items || []).map((r) => ({ value: r.id, label: r.name })),
  );

export const getDistricts = (stateId) =>
  apiFetch(
    `/o/c/districts?filter=r_state_c_stateId eq '${stateId}'&pageSize=200&sort=name:asc`,
  ).then((d) => (d.items || []).map((r) => ({ value: r.id, label: r.name })));

export const getTalukas = (districtId) =>
  apiFetch(
    `/o/c/talukas?filter=districtId eq '${districtId}'&pageSize=200&sort=name:asc`,
  ).then((d) => (d.items || []).map((r) => ({ value: r.id, label: r.name })));

export const getVillages = (talukaId) =>
  apiFetch(
    `/o/c/villages?filter=talukaId eq '${talukaId}'&pageSize=200&sort=name:asc`,
  ).then((d) => (d.items || []).map((r) => ({ value: r.id, label: r.name })));

export const getPoNames = (villageId) =>
  apiFetch(
    `/o/c/ponames?filter=villageId eq '${villageId}'&pageSize=200&sort=name:asc`,
  ).then((d) => (d.items || []).map((r) => ({ value: r.id, label: r.name })));

// ── Section POST endpoints ────────────────────────────────────
export const saveSchoolBasicDetails = (p) =>
  apiPost("/o/c/namankitschoolprofiles", p);
export const saveLandDetails = (p) => apiPost("/o/c/schoollanddetails", p);
export const saveHostelDetails = (p) => apiPost("/o/c/schoolhosteldetails", p);
export const saveDiningFacilities = (p) => apiPost("/o/c/dinningfacilities", p);
export const saveLabDetails = (p) => apiPost("/o/c/computerlabdetais", p);
export const saveLibraryDetails = (p) => apiPost("/o/c/librarydetails", p);
export const saveTeacherDetails = (p) => apiPost("/o/c/teacherdetails", p);
export const saveExtraCurriculumActivities = (p) =>
  apiPost("/o/c/extracurriculumactivities", p);
export const saveSportsFacilities = (p) => apiPost("/o/c/sportfacilities", p);
export const saveCulturalProgram = (p) =>
  apiPost("/o/c/culturalprogramsportsfacilities", p);
export const saveEducationalTour = (p) =>
  apiPost("/o/c/educationaltourssportsfacilities", p);
export const saveMedicalFacilities = (p) =>
  apiPost("/o/c/medicalfacilities", p);
export const saveProfileFeeMaster = (p) => apiPost("/o/c/profilefeemasters", p);
export const saveSchoolBankDetails = (p) =>
  apiPost("/o/c/schoolbankdetails", p);
export const saveStudentRegistration = (p) =>
  apiPost("/o/c/studentregistarions", p);

// ── Section PATCH endpoints (update by Liferay record id) ─────
export const patchSchoolBasicDetails = (id, p) =>
  apiPatch(`/o/c/namankitschoolprofiles/${id}`, p);
export const patchLandDetails = (id, p) =>
  apiPatch(`/o/c/schoollanddetails/${id}`, p);
export const patchHostelDetails = (id, p) =>
  apiPatch(`/o/c/schoolhosteldetails/${id}`, p);
export const patchDiningFacilities = (id, p) =>
  apiPatch(`/o/c/dinningfacilities/${id}`, p);
export const patchLabDetails = (id, p) =>
  apiPatch(`/o/c/computerlabdetais/${id}`, p);
export const patchLibraryDetails = (id, p) =>
  apiPatch(`/o/c/librarydetails/${id}`, p);
export const patchTeacherDetails = (id, p) =>
  apiPatch(`/o/c/teacherdetails/${id}`, p);
export const patchExtraCurriculumActivities = (id, p) =>
  apiPatch(`/o/c/extracurriculumactivities/${id}`, p);
export const patchSportsFacilities = (id, p) =>
  apiPatch(`/o/c/sportfacilities/${id}`, p);
export const patchCulturalProgram = (id, p) =>
  apiPatch(`/o/c/culturalprogramsportsfacilities/${id}`, p);
export const patchEducationalTour = (id, p) =>
  apiPatch(`/o/c/educationaltourssportsfacilities/${id}`, p);
export const patchMedicalFacilities = (id, p) =>
  apiPatch(`/o/c/medicalfacilities/${id}`, p);
export const patchProfileFeeMaster = (id, p) =>
  apiPatch(`/o/c/profilefeemasters/${id}`, p);
export const patchSchoolBankDetails = (id, p) =>
  apiPatch(`/o/c/schoolbankdetails/${id}`, p);
export const patchStudentRegistration = (id, p) =>
  apiPatch(`/o/c/studentregistarions/${id}`, p);

// Fetch student registrations — used for approval list (filtered by schoolProfileId)
export const getStudentApprovalList = (id) =>
  apiFetch(`/o/c/studentregistarions${bySchoolMany(id)}`).then(
    (d) => d.items || [],
  );

// ── Section GET endpoints (filtered by schoolProfileId) ───────
// schoolProfileId = Liferay auto-generated id from namankitschoolprofiles
// bySchool  → single record (most sections)
// bySchoolMany → multiple records (teachers, fee rows, cultural, tours)

const bySchool = (id) =>
  id
    ? `?filter=schoolProfileId eq ${id}&pageSize=1&sort=dateCreated:desc`
    : `?pageSize=1&sort=dateCreated:desc`;

const bySchoolMany = (id) =>
  id
    ? `?filter=schoolProfileId eq ${id}&pageSize=200&sort=dateCreated:desc`
    : `?pageSize=200&sort=dateCreated:desc`;

// Get ALL schools — for List Page
export const getAllSchools = () =>
  apiFetch(
    "/o/c/namankitschoolprofiles?pageSize=200&sort=dateCreated:desc",
  ).then((d) => d.items || []);
export const getSchoolProfiles = (id) =>
  apiFetch(`/o/c/namankitschoolprofiles${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
// Fetch school profile directly by its Liferay record id (used in edit mode)
export const getSchoolProfileById = (id) =>
  apiFetch(`/o/c/namankitschoolprofiles/${id}`);
export const getSchoolLandDetails = (id) =>
  apiFetch(`/o/c/schoollanddetails${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getHostelDetails = (id) =>
  apiFetch(`/o/c/schoolhosteldetails${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getDiningFacilities = (id) =>
  apiFetch(`/o/c/dinningfacilities${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getLabDetails = (id) =>
  apiFetch(`/o/c/computerlabdetais${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getLibraryDetails = (id) =>
  apiFetch(`/o/c/librarydetails${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getTeacherDetails = (id) =>
  apiFetch(`/o/c/teacherdetails${bySchoolMany(id)}`).then((d) => d.items || []);
export const getExtraCurriculum = (id) =>
  apiFetch(`/o/c/extracurriculumactivities${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getSportsFacilities = (id) =>
  apiFetch(`/o/c/sportfacilities${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getCulturalPrograms = (id) =>
  apiFetch(`/o/c/culturalprogramsportsfacilities${bySchoolMany(id)}`).then(
    (d) => d.items || [],
  );
export const getEducationalTours = (id) =>
  apiFetch(`/o/c/educationaltourssportsfacilities${bySchoolMany(id)}`).then(
    (d) => d.items || [],
  );
export const getMedicalFacilities = (id) =>
  apiFetch(`/o/c/medicalfacilities${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );
export const getProfileFeeMaster = (id) =>
  apiFetch(`/o/c/profilefeemasters${bySchoolMany(id)}`).then(
    (d) => d.items || [],
  );
export const getSchoolBankDetails = (id) =>
  apiFetch(`/o/c/schoolbankdetails${bySchool(id)}`).then(
    (d) => (d.items || [])[0] || null,
  );

// Bill Generation
export const saveBillGeneration = (p) => apiPost("/o/c/billgenerations", p);
export const getBillGenerations = () =>
  apiFetch("/o/c/billgenerations?pageSize=200&sort=dateCreated:desc").then(
    (d) => d.items || [],
  );
export const getBillById = (id) => apiFetch(`/o/c/billgenerations/${id}`);

// Bill child records
export const saveBillAdmissionSummary = (p) =>
  apiPost("/o/c/billadmissionsummary", p);
export const saveBillStudent = (p) => apiPost("/o/c/billstudents", p);
export const saveBillArrear = (p) => apiPost("/o/c/billarrears", p);
export const saveBillDeduction = (p) => apiPost("/o/c/billdeductions", p);
export const saveBillPODeduction = (p) => apiPost("/o/c/billpodeductions", p);

// Fetch children by billGenerationId
export const getBillStudents = (billId) =>
  apiFetch(
    `/o/c/billstudents?filter=billGenerationId eq ${billId}&pageSize=200`,
  ).then((d) => d.items || []);
export const getBillArrears = (billId) =>
  apiFetch(
    `/o/c/billarrears?filter=billGenerationId eq ${billId}&pageSize=200`,
  ).then((d) => d.items || []);
export const getBillDeductions = (billId) =>
  apiFetch(
    `/o/c/billdeductions?filter=billGenerationId eq ${billId}&pageSize=200`,
  ).then((d) => d.items || []);
export const getBillPODeductions = (billId) =>
  apiFetch(
    `/o/c/billpodeductions?filter=billGenerationId eq ${billId}&pageSize=200`,
  ).then((d) => d.items || []);

// ── Picklist helper ───────────────────────────────────────────
// Fetches picklist entries by ERC (External Reference Code)
// Returns [{ value: key, label: name }] for use in SelectInput
export async function getPicklist(erc) {
  // Step 1 — get definition id by ERC
  const def = await apiFetch(
    `/o/headless-admin-list-type/v1.0/list-type-definitions/by-external-reference-code/${erc}`,
  );
  // Step 2 — get entries
  const entries = await apiFetch(
    `/o/headless-admin-list-type/v1.0/list-type-definitions/${def.id}/list-type-entries?pageSize=200`,
  );
  return (entries.items || []).map((e) => ({ value: e.key, label: e.name }));
}

// ── Qualification Masters ─────────────────────────────────────
export const getQualifications = () =>
  apiFetch("/o/c/qualificationmasters?pageSize=200&sort=name:asc").then((d) =>
    (d.items || []).map((r) => ({ value: r.id, label: r.name })),
  );
