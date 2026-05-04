// ============================================================
//  src/api/RestrictEntryMaster.js
//
//  loadRestrictEntry()
//    → GET latest record from restrictentrymasters
//
//  submitRestrictEntry({ dates, recordId })
//    → POST if new, PATCH if recordId exists
//
//  Field mapping (Liferay field → UI label):
//    billgeneration       → Student Registration Date
//    billadmissionsummary → Student Renewal Date
//    billstudent          → From School Date
//    billarrear           → To School Date
//    billdeduction        → Profile Registration From Date
//    billpodeduction      → Profile Registration To Date
// ============================================================
import { apiFetch, apiPost, apiPatch } from "./liferay";

const API_PATH = "/o/c/restrictentrymasters";

// ── Date helpers ──────────────────────────────────────────────
export const toISO   = (s) => (s ? `${s}T00:00:00Z` : null);
export const fromISO = (s) => (s ? s.slice(0, 10) : "");
export const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d)
    ? "-"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Load existing record ──────────────────────────────────────
export async function loadRestrictEntry() {
  const data   = await apiFetch(`${API_PATH}?pageSize=1&sort=dateCreated:desc`);
  const record = (data.items || [])[0] || null;
  return { record, recordId: record?.id || null };
}

// ── Map Liferay record → form date state ──────────────────────
export function mapRecordToDates(record) {
  if (!record) return null;
  return {
    billgeneration:       fromISO(record.billgeneration),
    billadmissionsummary: fromISO(record.billadmissionsummary),
    billstudent:          fromISO(record.billstudent),
    billarrear:           fromISO(record.billarrear),
    billdeduction:        fromISO(record.billdeduction),
    billpodeduction:      fromISO(record.billpodeduction),
  };
}

// ── Build payload ─────────────────────────────────────────────
function buildPayload(dates) {
  const payload = {};
  Object.entries(dates).forEach(([k, v]) => { if (v) payload[k] = toISO(v); });
  return payload;
}

// ── Submit (POST or PATCH) ────────────────────────────────────
export async function submitRestrictEntry({ dates, recordId }) {
  const payload = buildPayload(dates);
  console.log(
    `[RestrictEntryMaster] ${recordId ? "PATCH" : "POST"} →`,
    JSON.stringify(payload, null, 2)
  );
  return recordId
    ? await apiPatch(`${API_PATH}/${recordId}`, payload)
    : await apiPost(API_PATH, payload);
}