// ============================================================
//  src/api/teacherDetails.js
//
//  loadTeacherDetails(schoolProfileId)  → GET existing rows
//  submitTeacherDetails({ rows, schoolProfileId, existingIds })
//    → POST new rows, PATCH existing rows
// ============================================================
import { saveTeacherDetails, patchTeacherDetails, getTeacherDetails } from "./liferay";

// ── Load existing records ─────────────────────────────────────
export async function loadTeacherDetails(schoolProfileId) {
  const records = await getTeacherDetails(schoolProfileId);
  return { records };
}

// ── Map Liferay records → table rows ─────────────────────────
export function mapRecordsToRows(records) {
  if (!records || records.length === 0) return [];
  return records.map((r) => ({
    id:                                      r.id,  // Liferay record id for PATCH
    liferayId:                               r.id,
    name:                                    r.name                                    || "",
    highestQualification:                    r.highestQualification                    || "",
    mediumOfEducationTillStd10thId:          r.mediumOfEducationTillStd10thId          || "",
    mediumOfEducationForDegreeId:            r.mediumOfEducationForDegreeId            || "",
    mediumForEducationForBedDedBPedBedPhyId: r.mediumForEducationForBedDedBPedBedPhyId || "",
    yearOfExperience:                        r.yearOfExperience                        || "",
    subject1Id:                              r.subject1Id                              || "",
    subject2Id:                              r.subject2Id                              || "",
    isSportsBPed:                            !!r.isSportsBPed,
    genderId:                                r.genderId                                || "",
    teacherDetailStatus:                     !!r.teacherDetailStatus,
  }));
}

// ── Build single teacher payload ─────────────────────────────
function buildPayload(row, schoolProfileId) {
  return {
    schoolProfileId:                         schoolProfileId || 0,
    name:                                    row.name                                    || "",
    highestQualification:                    row.highestQualification                    || "",
    mediumOfEducationTillStd10thId:          row.mediumOfEducationTillStd10thId          || "",
    mediumOfEducationForDegreeId:            row.mediumOfEducationForDegreeId            || "",
    mediumForEducationForBedDedBPedBedPhyId: row.mediumForEducationForBedDedBPedBedPhyId || "",
    yearOfExperience:                        Number(row.yearOfExperience)                || 0,
    subject1Id:                              row.subject1Id                              || "",
    subject2Id:                              row.subject2Id                              || "",
    isSportsBPed:                            !!row.isSportsBPed,
    genderId:                                Number(row.genderId)                        || 0,
    teacherDetailStatus:                     !!row.teacherDetailStatus,
  };
}

// ── Submit (POST new rows, PATCH existing rows) ───────────────
export async function submitTeacherDetails({ rows, schoolProfileId }) {
  for (const row of rows) {
    const payload = buildPayload(row, schoolProfileId);
    console.log(`[TeacherDetails] ${row.liferayId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

    if (row.liferayId) {
      // Existing record from Liferay → PATCH
      await patchTeacherDetails(row.liferayId, payload);
    } else {
      // New row added by user → POST
      await saveTeacherDetails(payload);
    }
  }
}