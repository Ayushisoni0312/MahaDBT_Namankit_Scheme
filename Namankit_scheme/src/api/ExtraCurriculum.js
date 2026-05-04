// ============================================================
//  src/api/extraCurriculum.js
//
//  loadExtraCurriculum(schoolProfileId)  → GET existing record
//  submitExtraCurriculum({ form, schoolProfileId, recordId })
//    → POST if new, PATCH if recordId exists
// ============================================================
import { saveExtraCurriculumActivities, patchExtraCurriculumActivities, getExtraCurriculum } from "./liferay";

// ── Load existing record ──────────────────────────────────────
export async function loadExtraCurriculum(schoolProfileId) {
  const record = await getExtraCurriculum(schoolProfileId);
  return { record, recordId: record?.id || null };
}

// ── Map Liferay response → form state ────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;
  return {
    nccsanctioned:           record.nccsanctioned           ? "Yes" : "No",
    scoutguide:              record.scoutguide              ? "Yes" : "No",
    nSS:                     record.nSS                     ? "Yes" : "No",
    otherCurriculumActivity: record.otherCurriculumActivity || "",
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload({ form, schoolProfileId }) {
  return {
    schoolProfileId:         schoolProfileId || 0,
    nccsanctioned:           form.nccsanctioned           === "Yes",
    nSS:                     form.nSS                     === "Yes",
    otherCurriculumActivity: form.otherCurriculumActivity || "",
    scoutguide:              form.scoutguide              === "Yes",
  };
}

// ── Submit (POST or PATCH) ────────────────────────────────────
export async function submitExtraCurriculum({ form, schoolProfileId, recordId }) {
  const payload = buildPayload({ form, schoolProfileId });

  console.log(`[ExtraCurriculum] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

  if (recordId) {
    await patchExtraCurriculumActivities(recordId, payload);
  } else {
    await saveExtraCurriculumActivities(payload);
  }

  return payload;
}