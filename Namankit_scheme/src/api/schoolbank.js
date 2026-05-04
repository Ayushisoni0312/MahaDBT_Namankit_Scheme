// ============================================================
//  src/api/schoolbank.js
//
//  loadBankDetails(schoolProfileId)  → GET existing record
//  submitBankDetails({ form, schoolProfileId, recordId })
//    → POST if new, PATCH if recordId exists
// ============================================================
import { uploadFileToFolder } from "./upload";
import { saveSchoolBankDetails, patchSchoolBankDetails, getSchoolBankDetails } from "./liferay";

// ── Load existing record ──────────────────────────────────────
export async function loadBankDetails(schoolProfileId) {
  const record = await getSchoolBankDetails(schoolProfileId);
  return { record, recordId: record?.id || null };
}

// ── Map Liferay response → form state ────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;
  return {
    bankName:                   record.bankName          || "",
    bankBranchName:             record.bankBranchName    || "",
    bankIFSCCode:               record.bankIFSCCode      || "",
    bankAccountNo:              record.bankAccountNo     || "",
    bankBranchAddress:          record.bankBranchAddress || "",
    uploadCancelledChequeImage: null,  // file input — can't pre-fill
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload({ form, uploaded, schoolProfileId }) {
  return {
    schoolProfileId:   schoolProfileId || 0,
    bankAccountNo:     Number(form.bankAccountNo)        || 0,
    bankBranchAddress: form.bankBranchAddress             || "",
    bankBranchName:    form.bankBranchName                || "",
    bankIFSCCode:      form.bankIFSCCode.toUpperCase()    || "",
    bankName:          form.bankName                      || "",
    uploadCancelledChequeImage: uploaded
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
export async function submitBankDetails({ form, schoolProfileId, recordId }) {
  const uploaded = form.uploadCancelledChequeImage
    ? await uploadFileToFolder(form.uploadCancelledChequeImage, "School Documents")
    : null;

  const payload = buildPayload({ form, uploaded, schoolProfileId });

  console.log(`[SchoolBankDetails] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

  if (recordId) {
    await patchSchoolBankDetails(recordId, payload);
  } else {
    await saveSchoolBankDetails(payload);
  }

  return payload;
}