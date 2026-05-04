// ============================================================
//  src/sections/RestrictEntryMaster.jsx
//
//  Validations (from Excel spec):
//  1. Restrict Entry List — Mandatory (cannot save with --Select--)
//  2. Date fields — Mandatory when type is selected
//  3. School Registration — From Date must be before To Date
//  4. Profile Registration — From Date must be before To Date
// ============================================================
import { useState, useEffect } from "react";
import {
  loadRestrictEntry,
  submitRestrictEntry,
  mapRecordToDates,
  fmtDate,
} from "../api/RestrictEntryMaster";

// ── Config ────────────────────────────────────────────────────
const RESTRICT_OPTIONS = [
  { value: "",                    label: "--Select--" },
  { value: "studentRegistration", label: "Student Registration" },
  { value: "studentRenewal",      label: "Student Renewal" },
  { value: "schoolRegistration",  label: "School Registration" },
  { value: "profileRegistration", label: "School Profile Registration" },
];

const FIELD_CONFIG = {
  studentRegistration: [
    { key: "billgeneration",      label: "Student Registration Date" },
  ],
  studentRenewal: [
    { key: "billadmissionsummary", label: "Student Renewal Date" },
  ],
  schoolRegistration: [
    { key: "billstudent", label: "From School Date" },
    { key: "billarrear",  label: "To School Date" },
  ],
  profileRegistration: [
    { key: "billdeduction",   label: "Profile Registration From Date" },
    { key: "billpodeduction", label: "Profile Registration To Date" },
  ],
};

const EMPTY_DATES = {
  billgeneration:       "",
  billadmissionsummary: "",
  billstudent:          "",
  billarrear:           "",
  billdeduction:        "",
  billpodeduction:      "",
};

// ── Validation ────────────────────────────────────────────────
function validate(selectedType, dates) {
  // Rule 1 — Dropdown is mandatory
  if (!selectedType) {
    return "Please select a value from Restrict Entry List.";
  }

  const fields = FIELD_CONFIG[selectedType] || [];

  // Rule 2 — All date fields for selected type are mandatory
  for (const f of fields) {
    if (!dates[f.key]) {
      return `"${f.label}" is required.`;
    }
  }

  // Rule 3 — School Registration: From Date must be before To Date
  if (selectedType === "schoolRegistration") {
    if (dates.billstudent && dates.billarrear) {
      if (new Date(dates.billstudent) >= new Date(dates.billarrear)) {
        return "From School Date must be earlier than To School Date.";
      }
    }
  }

  // Rule 4 — Profile Registration: From Date must be before To Date
  if (selectedType === "profileRegistration") {
    if (dates.billdeduction && dates.billpodeduction) {
      if (new Date(dates.billdeduction) >= new Date(dates.billpodeduction)) {
        return "Profile Registration From Date must be earlier than Profile Registration To Date.";
      }
    }
  }

  return null; // no error
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  pageWrap: {
    background: "var(--page-bg, #f0f4f5)",
    minHeight:  "calc(100vh - 60px)",
    fontFamily: "var(--font-main, 'Roboto', sans-serif)",
    fontSize:   "13px",
    color:      "#333",
    borderTop:  "4px solid #0e8080",
  },
  card: {
    background:   "#ffffff",
    padding:      "22px 24px 28px",
    borderBottom: "1px solid #e0e0e0",
  },
  heading: {
    fontSize: 18, fontWeight: 700, color: "#00897b",
    marginBottom: 16, paddingBottom: 7,
    borderBottom: "2px solid #e8b400", display: "inline-block",
  },
  label:    { display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 },
  req:      { color: "#e53935", marginLeft: 2 },                    // red asterisk
  select:   (hasErr) => ({
    display: "block", width: 300, padding: "6px 10px", fontSize: 13,
    border: `1px solid ${hasErr ? "#e53935" : "#cccccc"}`,
    borderRadius: 3, background: "#ffffff", color: "#333",
    cursor: "pointer", outline: "none", marginBottom: hasErr ? 4 : 14, height: 32,
  }),
  dateInput:(hasErr) => ({
    display: "block", width: 300, padding: "5px 10px", fontSize: 13,
    border: `1px solid ${hasErr ? "#e53935" : "#cccccc"}`,
    borderRadius: 3, background: "#ffffff", color: "#333",
    outline: "none", marginBottom: hasErr ? 4 : 14, height: 32, boxSizing: "border-box",
  }),
  fieldErr: { color: "#e53935", fontSize: 12, marginBottom: 10, display: "block" },
  saveBtn:  { background: "#5cb85c", color: "#ffffff", border: "1px solid #4cae4c", borderRadius: 3, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4, marginBottom: 22 },
  saveBtnDisabled: { background: "#aaa", color: "#fff", border: "1px solid #999", borderRadius: 3, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "not-allowed", marginTop: 4, marginBottom: 22 },
  tableWrap: { overflowX: "auto", marginBottom: 16 },
  table:    { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:       { padding: "9px 12px", textAlign: "left", fontWeight: 700, color: "#333", background: "#ffffff", border: "1px solid #dddddd", whiteSpace: "nowrap" },
  td:       { padding: "9px 12px", border: "1px solid #dddddd", color: "#333", background: "#ffffff", whiteSpace: "nowrap" },
  paginWrap:{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13, padding: "8px 0 4px" },
  paginLeft:{ display: "flex", alignItems: "center", gap: 10 },
  paginInput:{ width: 230, padding: "5px 8px", fontSize: 13, border: "1px solid #cccccc", borderRadius: 3, background: "#fff", color: "#333" },
  paginRight:{ display: "flex", gap: 4 },
  btnActive: { padding: "5px 16px", fontSize: 13, background: "#1a3a5c", color: "#fff", border: "1px solid #1a3a5c", borderRadius: 3, cursor: "pointer" },
  btnDisabled:{ padding: "5px 16px", fontSize: 13, background: "#fff", color: "#333", border: "1px solid #cccccc", borderRadius: 3, cursor: "not-allowed" },
  overlay:   { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modalBox:  { background: "#fff", borderRadius: 4, width: 440, boxShadow: "0 4px 24px rgba(0,0,0,0.25)", overflow: "hidden" },
  modalHead: { background: "#f8d7da", padding: "12px 18px", fontWeight: 700, fontSize: 15, color: "#c0392b", borderBottom: "1px solid #f5c6cb" },
  modalBody: { padding: "22px 18px", fontSize: 14, color: "#333" },
  modalFooter:{ padding: "10px 18px 18px", textAlign: "center", borderTop: "1px solid #eee" },
  modalOkBtn:{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, padding: "8px 36px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  errBox:    { background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: 4, padding: "12px 16px", fontSize: 13, color: "#721c24", marginBottom: 16 },
  inlineErr: { color: "#c0392b", fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "#fff5f5", border: "1px solid #f5c6cb", borderRadius: 3 },
};

// ── Info Modal ────────────────────────────────────────────────
function InfoModal({ message, onClose }) {
  return (
    <div style={s.overlay}>
      <div style={s.modalBox}>
        <div style={s.modalHead}>Information</div>
        <div style={s.modalBody}>{message}</div>
        <div style={s.modalFooter}>
          <button style={s.modalOkBtn} onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function RestrictEntryMaster() {
  const [recordId,     setRecordId]     = useState(null);
  const [savedData,    setSavedData]    = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [dates,        setDates]        = useState(EMPTY_DATES);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [modalMsg,     setModalMsg]     = useState("");
  const [inlineErr,    setInlineErr]    = useState("");  // general form error
  const [fieldErrors,  setFieldErrors]  = useState({});  // per-field errors
  const [loadErr,      setLoadErr]      = useState("");
  const [touched,      setTouched]      = useState({});  // track user interaction

  // ── Load on mount ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    loadRestrictEntry()
      .then(({ record, recordId: id }) => {
        if (record) {
          setRecordId(id);
          setSavedData(record);
          setDates(mapRecordToDates(record));
        }
      })
      .catch((err) => setLoadErr(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Handle dropdown change ─────────────────────────────────
  const handleTypeChange = (val) => {
    setSelectedType(val);
    setInlineErr("");
    setFieldErrors({});
    setTouched({});
  };

  // ── Handle date change ─────────────────────────────────────
  const handleDate = (key, val) => {
    setDates((prev) => ({ ...prev, [key]: val }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    // Clear field error on change
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setInlineErr("");
  };

  // ── Validate single field on blur ──────────────────────────
  const handleBlur = (key, label) => {
    if (!dates[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: `${label} is required.` }));
    }
  };

  // ── Save handler ───────────────────────────────────────────
  const handleSave = async () => {
    setInlineErr("");
    setFieldErrors({});

    // Run full validation
    const error = validate(selectedType, dates);
    if (error) {
      setInlineErr(error);

      // Also highlight specific fields
      if (selectedType) {
        const newFieldErrors = {};
        const fields = FIELD_CONFIG[selectedType] || [];
        fields.forEach((f) => {
          if (!dates[f.key]) newFieldErrors[f.key] = `${f.label} is required.`;
        });
        setFieldErrors(newFieldErrors);
      }
      return;
    }

    setSaving(true);
    try {
      const result = await submitRestrictEntry({ dates, recordId });
      if (!recordId) setRecordId(result.id);
      setSavedData(result);
      setLoadErr("");
      setInlineErr("");
      setFieldErrors({});
      setTouched({});
      setModalMsg(recordId ? "Data Updated Successfully" : "Data Saved Successfully");
    } catch (err) {
      setModalMsg(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const activeFields = FIELD_CONFIG[selectedType] || [];
  const showDropdownErr = touched.__dropdown && !selectedType;

  return (
    <>
      {modalMsg && <InfoModal message={modalMsg} onClose={() => setModalMsg("")} />}

      <div style={s.pageWrap}>
        <div style={s.card}>
          <div style={s.heading}>Restrict Entry Master</div>

          {loadErr && (
            <div style={s.errBox}><strong>API Error:</strong> {loadErr}</div>
          )}

          {loading ? (
            <div style={{ color: "#888", fontSize: 13, padding: "12px 0" }}>Loading...</div>
          ) : (
            <>
              {/* ── Form ── */}
              <div>

                {/* General inline error */}
                {inlineErr && (
                  <div style={s.inlineErr}>⚠️ {inlineErr}</div>
                )}

                {/* Dropdown — Mandatory */}
                <label style={s.label}>
                  Restrict Entry List <span style={s.req}>*</span>
                </label>
                <select
                  style={s.select(showDropdownErr)}
                  value={selectedType}
                  onBlur={() => setTouched((p) => ({ ...p, __dropdown: true }))}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  {RESTRICT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {showDropdownErr && (
                  <span style={s.fieldErr}>Please select a value from Restrict Entry List.</span>
                )}

                {/* Dynamic date fields — each mandatory */}
                {activeFields.map((f) => (
                  <div key={f.key}>
                    <label style={s.label}>
                      {f.label} <span style={s.req}>*</span>
                    </label>
                    <input
                      type="date"
                      style={s.dateInput(!!fieldErrors[f.key])}
                      value={dates[f.key]}
                      onChange={(e) => handleDate(f.key, e.target.value)}
                      onBlur={() => handleBlur(f.key, f.label)}
                    />
                    {fieldErrors[f.key] && (
                      <span style={s.fieldErr}>{fieldErrors[f.key]}</span>
                    )}
                  </div>
                ))}

                <button
                  style={saving ? s.saveBtnDisabled : s.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              {/* ── Table ── */}
              {savedData ? (
                <>
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <th style={s.th}>Sr No</th>
                          <th style={s.th}>Student Registration Date</th>
                          <th style={s.th}>Student Renewal Date</th>
                          <th style={s.th}>From School Date</th>
                          <th style={s.th}>To School Date</th>
                          <th style={s.th}>Profile Registration From Date</th>
                          <th style={s.th}>Profile Registration To Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={s.td}>1</td>
                          <td style={s.td}>{fmtDate(savedData.billgeneration)}</td>
                          <td style={s.td}>{fmtDate(savedData.billadmissionsummary)}</td>
                          <td style={s.td}>{fmtDate(savedData.billstudent)}</td>
                          <td style={s.td}>{fmtDate(savedData.billarrear)}</td>
                          <td style={s.td}>{fmtDate(savedData.billdeduction)}</td>
                          <td style={s.td}>{fmtDate(savedData.billpodeduction)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div style={s.paginWrap}>
                    <div style={s.paginLeft}>
                      <span><strong>Total Records</strong> 1</span>
                      <input type="text" defaultValue="10" style={s.paginInput} readOnly />
                    </div>
                    <div>Page: 1 of 1</div>
                    <div style={s.paginRight}>
                      <button style={s.btnActive}>First</button>
                      <button style={s.btnDisabled} disabled>Previous</button>
                      <button style={s.btnDisabled} disabled>Next</button>
                      <button style={s.btnActive}>Last</button>
                    </div>
                  </div>
                </>
              ) : (
                !loadErr && (
                  <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                    No dates configured yet. Select a type and save.
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}