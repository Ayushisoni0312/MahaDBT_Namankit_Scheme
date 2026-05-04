// ============================================================
//  src/api/labDetails.js
//
//  loadLabDetails(schoolProfileId)  → GET existing record
//  submitLabDetails({ form, photoFile, schoolProfileId, recordId })
//    → POST if new, PATCH if recordId exists
// ============================================================
import { uploadFileToFolder } from "./upload";
import { saveLabDetails, patchLabDetails, getLabDetails } from "./liferay";

// ── Load existing record ──────────────────────────────────────
export async function loadLabDetails(schoolProfileId) {
  const record = await getLabDetails(schoolProfileId);
  return { record, recordId: record?.id || null };
}

// ── Map Liferay response → form state ────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;
  return {
    isComputerLabAvailable:        record.wellEquipmentCompLab                  ? "Yes" : "No",
    computersWithPeripheralsCount: record.noOfCompInWorkingCondition            || "",
    computersWorkingCount:         record.noOfCompInWrkngCond                   || "",
    isChemistryLabAvailable:       record.availabilityOfChemistryLabWithLabAsst ? "Yes" : "No",
    isChemistryLabAreaSufficient:  record.areaOfChemistryLabmin150Sqft          ? "Yes" : "No",
    chemistryLabAreaSqft:          record.chemistryLabAvailableAreaSqft         || "",
    isBiologyLabAvailable:         record.availabilityOfBiologyLabWithLabAsst   ? "Yes" : "No",
    isBiologyLabAreaSufficient:    record.areaOfBiologyLabmin150Sqft            ? "Yes" : "No",
    biologyLabAreaSqft:            record.biologyLabAvailableAreaSqft           || "",
    isPhysicsLabAvailable:         record.availabilityOfPhysicsLabWithLabAsst   ? "Yes" : "No",
    isPhysicsLabAreaSufficient:    record.areaOfPhysicsLabmin150Sqft            ? "Yes" : "No",
    physicsLabAreaSqft:            record.physicsLabAvailableAreaSqft           || "",
    digitalClassroomCount:         record.numberOfDigitalClassroomInSchool      || "",
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload({ form, uploaded, schoolProfileId }) {
  return {
    schoolProfileId:                       schoolProfileId || 0,
    areaOfBiologyLabmin150Sqft:            form.isBiologyLabAreaSufficient   === "Yes",
    areaOfChemistryLabmin150Sqft:          form.isChemistryLabAreaSufficient === "Yes",
    areaOfPhysicsLabmin150Sqft:            form.isPhysicsLabAreaSufficient   === "Yes",
    availabilityOfBiologyLabWithLabAsst:   form.isBiologyLabAvailable        === "Yes",
    availabilityOfChemistryLabWithLabAsst: form.isChemistryLabAvailable      === "Yes",
    availabilityOfPhysicsLabWithLabAsst:   form.isPhysicsLabAvailable        === "Yes",
    biologyLabAvailableAreaSqft:           form.biologyLabAreaSqft   ? Number(form.biologyLabAreaSqft)   : 0,
    chemistryLabAvailableAreaSqft:         form.chemistryLabAreaSqft ? Number(form.chemistryLabAreaSqft) : 0,
    noOfCompInWorkingCondition:            form.computersWithPeripheralsCount ? Number(form.computersWithPeripheralsCount) : 0,
    noOfCompInWrkngCond:                   form.computersWorkingCount         ? Number(form.computersWorkingCount)         : 0,
    numberOfDigitalClassroomInSchool:      form.digitalClassroomCount         ? Number(form.digitalClassroomCount)         : 0,
    physicsLabAvailableAreaSqft:           form.physicsLabAreaSqft   ? Number(form.physicsLabAreaSqft)   : 0,
    wellEquipmentCompLab:                  form.isComputerLabAvailable === "Yes",
    uploadLapPhoto: uploaded
      ? {
          id:         uploaded.documentId,
          name:       uploaded.title,
          fileURL:    uploaded.downloadURL,
          fileBase64: "",
          folder: { externalReferenceCode: "", siteId: 0 },
        }
      : null,
  };
}

// ── Submit (POST or PATCH) ────────────────────────────────────
export async function submitLabDetails({ form, photoFile, schoolProfileId, recordId }) {
  const uploaded = photoFile
    ? await uploadFileToFolder(photoFile, "School Documents")
    : null;

  const payload = buildPayload({ form, uploaded, schoolProfileId });

  console.log(`[LabDetails] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

  if (recordId) {
    await patchLabDetails(recordId, payload);
  } else {
    await saveLabDetails(payload);
  }

  return payload;
}