// ============================================================
//  src/api/libraryDetails.js
//
//  loadLibraryDetails(schoolProfileId)  → GET existing record
//  submitLibraryDetails({ form, photoFile, schoolProfileId, recordId })
//    → POST if new, PATCH if recordId exists
// ============================================================
import { uploadFileToFolder } from "./upload";
import { saveLibraryDetails, patchLibraryDetails, getLibraryDetails } from "./liferay";

// ── Load existing record ──────────────────────────────────────
export async function loadLibraryDetails(schoolProfileId) {
  const record = await getLibraryDetails(schoolProfileId);
  return { record, recordId: record?.id || null };
}

// ── Map Liferay response → form state ────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;
  return {
    separateLibrary:           record.separateLibrary           ? "Yes" : "No",
    areamin200FtWithFurniture: record.areamin200FtWithFurniture ? "Yes" : "No",
    actualArea:                record.actualArea                || "",
    noOfBooks:                 record.noOfBooks                 || "",
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload({ form, uploaded, schoolProfileId }) {
  return {
    schoolProfileId:           schoolProfileId || 0,
    actualArea:                form.actualArea ? Number(form.actualArea) : 0,
    areamin200FtWithFurniture: form.areamin200FtWithFurniture === "Yes",
    noOfBooks:                 form.noOfBooks  ? Number(form.noOfBooks)  : 0,
    separateLibrary:           form.separateLibrary === "Yes",
    uploadLibraryPhoto: uploaded
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
export async function submitLibraryDetails({ form, photoFile, schoolProfileId, recordId }) {
  const uploaded = photoFile
    ? await uploadFileToFolder(photoFile, "School Documents")
    : null;

  const payload = buildPayload({ form, uploaded, schoolProfileId });

  console.log(`[LibraryDetails] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

  if (recordId) {
    await patchLibraryDetails(recordId, payload);
  } else {
    await saveLibraryDetails(payload);
  }

  return payload;
}