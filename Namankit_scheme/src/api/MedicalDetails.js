// ============================================================
//  src/api/medicalDetails.js
//
//  loadMedicalDetails(schoolProfileId)  → GET existing record
//  submitMedicalDetails({ form, schoolProfileId, recordId })
//    → POST if new, PATCH if recordId exists
// ============================================================
import { saveMedicalFacilities, patchMedicalFacilities, getMedicalFacilities } from "./liferay";

// ── Load existing record ──────────────────────────────────────
export async function loadMedicalDetails(schoolProfileId) {
  const record = await getMedicalFacilities(schoolProfileId);
  return { record, recordId: record?.id || null };
}

// ── Map Liferay response → form state ────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;
  return {
    availabilitOfMedicalSickRoom:    record.availabilitOfMedicalSickRoom    ? "Yes" : "No",
    availabilityOfDoctorsInSchoolId: record.availabilityOfDoctorsInSchoolId || "",
    numberOfAmbulance:               record.numberOfAmbulance               || "",
    numberOfDoctors:                 record.numberOfDoctors                  || "",
    numberOfNurse:                   record.numberOfNurse                    || "",
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload({ form, schoolProfileId }) {
  return {
    schoolProfileId:                 schoolProfileId || 0,
    availabilitOfMedicalSickRoom:    form.availabilitOfMedicalSickRoom    === "Yes",
    availabilityOfDoctorsInSchoolId: Number(form.availabilityOfDoctorsInSchoolId) || 0,
    numberOfAmbulance:               Number(form.numberOfAmbulance) || 0,
    numberOfDoctors:                 Number(form.numberOfDoctors)   || 0,
    numberOfNurse:                   Number(form.numberOfNurse)     || 0,
  };
}

// ── Submit (POST or PATCH) ────────────────────────────────────
export async function submitMedicalDetails({ form, schoolProfileId, recordId }) {
  const payload = buildPayload({ form, schoolProfileId });

  console.log(`[MedicalDetails] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

  if (recordId) {
    await patchMedicalFacilities(recordId, payload);
  } else {
    await saveMedicalFacilities(payload);
  }

  return payload;
}