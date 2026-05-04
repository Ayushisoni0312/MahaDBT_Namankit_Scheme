// ============================================================
//  src/api/hosteldetails.js
//
//  loadHostelDetails(schoolProfileId)  → GET existing record
//  submitHostelDetails({ form, photoFile, schoolProfileId, recordId })
//    → POST if new, PATCH if recordId exists
// ============================================================
import { uploadFileToFolder } from "./upload";
import { saveHostelDetails, patchHostelDetails, getHostelDetails } from "./liferay";

// ── Load existing record ──────────────────────────────────────
export async function loadHostelDetails(schoolProfileId) {
  const record = await getHostelDetails(schoolProfileId);
  return { record, recordId: record?.id || null };
}

// ── Map Liferay response → form state ────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;

  // Parse hot water string back to checkboxes
  const hotWater = record.availibilityOfHotWater || "";
  return {
    studentsClass1to4:           record.totalNoOfStdntsStudyngCls1To4   || "",
    femaleCaretakers1to4:        record.totalNoOfFemaleCaretaker1To4    || "",
    availabilityIncinerators:    record.availibilityOfIncinerators      ? "Yes" : "No",
    washingMachine:              record.availibilityOfWashingMchneForStdnt ? "Yes" : "No",
    separateHostelBuilding:      record.availibilityOfSeparateHstlBuildng  ? "Yes" : "No",
    areaInSqFt:                  record.areaInSqft                     || "",
    lightFanBedding:             record.availabilityOfLghtFansBeddng   ? "Yes" : "No",
    hotWater_solarWaterheater:   typeof hotWater === "string" ? hotWater.includes("Solar") : !!hotWater,
    hotWater_gasElectric:        typeof hotWater === "string" ? hotWater.includes("Gas")   : false,
    hotWater_traditionalSources: typeof hotWater === "string" ? hotWater.includes("Traditional") : false,
    hotWater_notAvailable:       typeof hotWater === "string" ? hotWater.includes("Not Available") : false,
    totalBoysHostels:            record.ttlNoOfBoysHstl                || "",
    capacityBoysHostels:         record.ttlCapacityOfBoysHstl          || "",
    totalGirlsHostels:           record.ttlNoOfGirlsHstl               || "",
    capacityGirlsHostels:        record.ttlCapacityOfGirlsHstl         || "",
    actualBathrooms:             record.actualBathrooms                 || "",
    actualWashrooms:             record.actualWashrooms                 || "",
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload({ form, uploaded, schoolProfileId, grandTotalHostels, grandTotalCapacity, totalResidentialStudents, expectedBathrooms, expectedWashrooms }) {
  return {
    schoolProfileId:                    schoolProfileId || 0,
    actualBathrooms:                    Number(form.actualBathrooms)          || 0,
    actualWashrooms:                    Number(form.actualWashrooms)          || 0,
    areaInSqft:                         Number(form.areaInSqFt)               || 0,
    availabilityOfLghtFansBeddng:       form.lightFanBedding                  === "Yes",
    availibilityOfHotWater:
      form.hotWater_solarWaterheater ||
      form.hotWater_gasElectric      ||
      form.hotWater_traditionalSources,
    availibilityOfIncinerators:         form.availabilityIncinerators         === "Yes",
    availibilityOfSeparateHstlBuildng:  form.separateHostelBuilding           === "Yes",
    availibilityOfWashingMchneForStdnt: form.washingMachine                   === "Yes",
    expectedBathrooms,
    expectedWashrooms,
    grndTtlcapacityOfHstl:              grandTotalCapacity,
    grndTtlnoOfHstl:                    grandTotalHostels,
    totalNoOfFemaleCaretaker1To4:       Number(form.femaleCaretakers1to4)     || 0,
    totalNoOfResidentialStudents:       totalResidentialStudents,
    totalNoOfStdntsStudyngCls1To4:      Number(form.studentsClass1to4)        || 0,
    ttlCapacityOfBoysHstl:              Number(form.capacityBoysHostels)      || 0,
    ttlCapacityOfGirlsHstl:             Number(form.capacityGirlsHostels)     || 0,
    ttlNoOfBoysHstl:                    Number(form.totalBoysHostels)         || 0,
    ttlNoOfGirlsHstl:                   Number(form.totalGirlsHostels)        || 0,
    uploadHostelPhoto: uploaded
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
export async function submitHostelDetails({ form, photoFile, schoolProfileId, recordId }) {
  const uploaded = photoFile
    ? await uploadFileToFolder(photoFile, "School Documents")
    : null;

  const grandTotalHostels       = (Number(form.totalBoysHostels)    || 0) + (Number(form.totalGirlsHostels)    || 0);
  const grandTotalCapacity      = (Number(form.capacityBoysHostels) || 0) + (Number(form.capacityGirlsHostels) || 0);
  const totalResidentialStudents = grandTotalCapacity;
  const expectedBathrooms       = totalResidentialStudents ? Math.ceil(totalResidentialStudents / 20) : 0;
  const expectedWashrooms       = totalResidentialStudents ? Math.ceil(totalResidentialStudents / 20) : 0;

  const payload = buildPayload({
    form, uploaded, schoolProfileId,
    grandTotalHostels, grandTotalCapacity,
    totalResidentialStudents, expectedBathrooms, expectedWashrooms,
  });

  console.log(`[HostelDetails] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

  if (recordId) {
    await patchHostelDetails(recordId, payload);
  } else {
    await saveHostelDetails(payload);
  }

  return payload;
}