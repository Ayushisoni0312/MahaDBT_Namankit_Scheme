// ============================================================
//  src/api/landdetails.js
//
//  loadLandDetails(schoolProfileId)
//    → GET existing record for this school → { record, recordId }
//
//  submitLandDetails({ land, photoFile, schoolProfileId, recordId })
//    → POST if new record
//    → PATCH if recordId exists (update)
//    → schoolProfileId added to every payload as foreign key
// ============================================================
import { uploadFileToFolder } from "./upload";
import { saveLandDetails, patchLandDetails, getSchoolLandDetails } from "./liferay";

// Picklist values come from Liferay picklist API (key field)
// No hardcoded IDs needed — send the key string directly

// ── Load existing record ──────────────────────────────────────
export async function loadLandDetails(schoolProfileId) {
  const record = await getSchoolLandDetails(schoolProfileId);
  return {
    record,
    recordId: record?.id || null,
  };
}

// ── Map Liferay response → form state ────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;
  return {
    ownership:           record.ownershipId || "",
    totalAreaAcres:      record.totalAreainAcres      || "",
    compoundWall:        record.schoolCompoundWall    ? "Yes" : "No",
    playground:          record.playground            ? "Yes" : "No",
    playgroundAreaAcres: record.playgroundAreainAcres || "",
    swimmingTank:        record.swimmingTank          ? "Yes" : "No",
    runningTrack:        record.runningTrack          ? "Yes" : "No",
    basketballGround:    record.basketBallGround      ? "Yes" : "No",
    khoKhokabaddiGround: record.khokhoKabbadiGround   ? "Yes" : "No",
    sportsFacilityQuality: record.qualityOfSportFacilitiesInfrastrcAvaId || "",
    otherSports: record.othersSports || "",
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload({ land, uploaded, schoolProfileId }) {
  return {
    schoolProfileId:     schoolProfileId || 0,   // foreign key → namankitschoolprofiles.id
    basketBallGround:    land.basketballGround    === "Yes",
    khokhoKabbadiGround: land.khoKhokabaddiGround === "Yes",
    othersSports:        land.otherSports         || "",
    ownershipId:         land.ownership || "",
    playground:          land.playground          === "Yes",
    playgroundAreainAcres: land.playgroundAreaAcres ? Number(land.playgroundAreaAcres) : 0,
    qualityOfSportFacilitiesInfrastrcAvaId: land.sportsFacilityQuality || "",
    runningTrack:        land.runningTrack        === "Yes",
    schoolCompoundWall:  land.compoundWall        === "Yes",
    swimmingTank:        land.swimmingTank        === "Yes",
    totalAreainAcres:    land.totalAreaAcres ? Number(land.totalAreaAcres) : 0,
    uploadSchoolLandPhoto: uploaded
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
export async function submitLandDetails({ land, photoFile, schoolProfileId, recordId }) {
  const uploaded = photoFile
    ? await uploadFileToFolder(photoFile, "School Documents")
    : null;

  const payload = buildPayload({ land, uploaded, schoolProfileId });

  console.log(`[LandDetails] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

  if (recordId) {
    await patchLandDetails(recordId, payload);
  } else {
    await saveLandDetails(payload);
  }

  return payload;
}