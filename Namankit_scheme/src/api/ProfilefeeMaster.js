// ============================================================
//  src/api/profileFeemaster.js
//
//  loadFeemaster(schoolProfileId)  → GET existing rows
//  submitFeemaster({ rows, receiptFile, schoolProfileId })
//    → POST new rows, PATCH existing rows
//    → Receipt uploaded once, attached to each row
// ============================================================
import { uploadFileToFolder } from "./upload";
import { saveProfileFeeMaster, patchProfileFeeMaster, getProfileFeeMaster } from "./liferay";

// ── Load existing rows ────────────────────────────────────────
export async function loadFeemaster(schoolProfileId) {
  const records = await getProfileFeeMaster(schoolProfileId);
  return { records };
}

// ── Map Liferay records → table rows ─────────────────────────
export function mapRecordsToRows(records) {
  if (!records || records.length === 0) return [];
  return records.map((r) => ({
    id:                  r.id,
    liferayId:           r.id,
    feesItemId:          r.feesItemId          || "",
    itemFeesTDD:         r.itemFeesTDD         || "",
    itemFeesGeneral:     r.itemFeesGeneral      || "",
    feesPerStudentST:    r.feesPerStudentST     || 0,
    feesPerStudentGeneral: r.feesPerStudentGeneral || 0,
  }));
}

// ── Build single row payload ──────────────────────────────────
function buildPayload({ row, uploadedReceipt, feesPerStudentST, feesPerStudentGeneral, schoolProfileId }) {
  return {
    schoolProfileId,
    feesItemId:            row.feesItemId,
    feesPerStudentST,
    feesPerStudentGeneral,
    itemFeesTDD:           parseInt(row.itemFeesTDD, 10),
    itemFeesGeneral:       parseInt(row.itemFeesGeneral, 10),
    uploadReceiptProfileFee: uploadedReceipt
      ? {
          id:         uploadedReceipt.documentId,
          name:       uploadedReceipt.title,
          fileURL:    uploadedReceipt.downloadURL,
          fileBase64: "",
          folder: { externalReferenceCode: "", siteId: 0 },
        }
      : null,
  };
}

// ── Submit (POST new rows, PATCH existing rows) ───────────────
export async function submitFeemaster({ rows, receiptFile, feesPerStudentST, feesPerStudentGeneral, schoolProfileId }) {
  if (!schoolProfileId) throw new Error("School Profile ID is missing. Please complete School Basic Details first.");

  // Upload receipt once before the loop
  const uploadedReceipt = receiptFile
    ? await uploadFileToFolder(receiptFile, "School Documents")
    : null;

  for (const row of rows) {
    const payload = buildPayload({ row, uploadedReceipt, feesPerStudentST, feesPerStudentGeneral, schoolProfileId });

    console.log(`[ProfileFeeMaster] ${row.liferayId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));

    if (row.liferayId) {
      await patchProfileFeeMaster(row.liferayId, payload);
    } else {
      await saveProfileFeeMaster(payload);
    }
  }
}