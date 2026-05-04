// ============================================================
//  src/sections/Profilefeemaster.jsx
//  UI only — API logic in src/api/profileFeemaster.js
//
//  On mount: loads existing fee rows by schoolProfileId
//  On save:  POST new rows, PATCH existing rows
// ============================================================
import { useState, useEffect } from "react";
import { loadFeemaster, submitFeemaster, mapRecordsToRows } from "../api/profileFeemaster";
import { getPicklist } from "../api/liferay";

// FEE_TYPE_OPTS loaded from Liferay picklist
const emptyInput = { feesItemId: "", itemFeesTDD: "", itemFeesGeneral: "" };
const STYLE_ID = "pfm-styles";
const CSS = `
  .pfm-heading { font-size:20px;font-weight:600;color:#222;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e0e0e0; }
  .pfm-label { display:block;font-size:13px;font-weight:600;color:#333;margin-bottom:5px; }
  .pfm-label .req { color:#e53935;margin-left:2px; }
  .pfm-input { width:100%;box-sizing:border-box;border:1px solid #ced4da;border-radius:4px;padding:7px 10px;font-size:13px;color:#333;background:#fff;outline:none; }
  .pfm-input:focus { border-color:#80bdff; }
  .pfm-input.grey { background:#e9ecef; }
  .pfm-select { width:100%;box-sizing:border-box;border:1px solid #ced4da;border-radius:4px;padding:7px 10px;font-size:13px;color:#333;background:#fff;outline:none;appearance:auto;cursor:pointer; }
  .pfm-row2 { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px; }
  .pfm-row3 { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px; }
  .pfm-add-btn { background:#17a2b8;color:#fff;border:none;border-radius:4px;padding:8px 24px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:20px; }
  .pfm-add-btn:hover { background:#138496; }
  .pfm-upload-row { display:flex;align-items:flex-end;gap:16px;margin-bottom:20px;flex-wrap:wrap; }
  .pfm-upload-group { display:flex;flex-direction:column;gap:5px; }
  .pfm-file-box { display:flex;align-items:center;border:1px solid #ced4da;border-radius:4px;overflow:hidden; }
  .pfm-choose-label { background:#f8f9fa;border-right:1px solid #ced4da;padding:7px 12px;font-size:13px;cursor:pointer;white-space:nowrap;user-select:none; }
  .pfm-filename { padding:7px 10px;font-size:13px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:120px;flex:1; }
  .pfm-view-btn { background:#17a2b8;color:#fff;border:none;border-radius:4px;padding:8px 18px;font-size:13px;font-weight:500;cursor:pointer; }
  .pfm-view-btn:disabled { opacity:0.65;cursor:default; }
  .pfm-table-wrap { width:100%;overflow-x:auto;margin-bottom:20px;border:1px solid #dee2e6;border-radius:4px; }
  .pfm-table { width:100%;border-collapse:collapse;font-size:13px; }
  .pfm-table th { background:#fff;border:1px solid #dee2e6;padding:10px 14px;text-align:left;font-weight:700;color:#222; }
  .pfm-table td { border:1px solid #dee2e6;padding:10px 14px;color:#333;vertical-align:middle; }
  .pfm-delete-btn { background:#e5a020;color:#fff;border:none;border-radius:4px;padding:5px 16px;font-size:12px;font-weight:600;cursor:pointer; }
  .pfm-actions { display:flex;gap:10px;margin-top:4px; }
  .pfm-save-btn { background:#28a745;color:#fff;border:none;border-radius:4px;padding:9px 26px;font-size:14px;font-weight:600;cursor:pointer; }
  .pfm-save-btn:disabled { background:#6cbe89;cursor:default; }
  .pfm-reset-btn { background:#e5a020;color:#fff;border:none;border-radius:4px;padding:9px 26px;font-size:14px;font-weight:600;cursor:pointer; }
  .pfm-err { color:#cc0000;font-size:12px;margin-bottom:8px; }
  .pfm-alert { padding:10px 14px;border-radius:4px;font-size:13px;margin-bottom:14px; }
  .pfm-alert.success { background:#d4edda;color:#155724;border:1px solid #c3e6cb; }
  .pfm-alert.error   { background:#f8d7da;color:#721c24;border:1px solid #f5c6cb; }
  .pfm-missing-info { background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:10px 14px;font-size:13px;color:#856404;margin-bottom:14px; }
  @media(max-width:768px){ .pfm-row2,.pfm-row3{ grid-template-columns:1fr; } }
`;

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => document.getElementById(STYLE_ID)?.remove();
  }, []);
}

export default function ProfileFeeMaster({ onTabChange, onSave, schoolProfileId }) {
  useInjectStyles();

  const [feesPerStudentST,      setFeesPerStudentST]      = useState(0);
  const [feesPerStudentGeneral, setFeesPerStudentGeneral] = useState(0);
  const [input,          setInput]          = useState(emptyInput);
  const [inputErr,       setInputErr]       = useState("");
  const [rows,           setRows]           = useState([]);
  const [receiptFile,    setReceiptFile]    = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [alert,          setAlert]          = useState(null);
  const [loadingData,    setLoadingData]    = useState(false);
  const [feeTypeOpts,    setFeeTypeOpts]    = useState([]);

  // ── Load Fee Type picklist ───────────────────────────────
  useEffect(() => {
    getPicklist("DBT-NAMANKIT-SPORTS-FACILITY-FEES")
      .then(setFeeTypeOpts)
      .catch(() => setFeeTypeOpts([
        { value: "AdmissionFee",   label: "Admission Fee" },
        { value: "TuitionFee",     label: "Tuition Fee" },
        { value: "ExaminationFee", label: "Examination Fee" },
        { value: "LibraryFee",     label: "Library Fee" },
        { value: "LaboratoryFee",  label: "Laboratory Fee" },
        { value: "SportsFee",      label: "Sports Fee" },
        { value: "Other",          label: "Other" },
      ]));
  }, []);

  // ── Load existing rows on mount ───────────────────────────
  useEffect(() => {
    if (!schoolProfileId) return;
    console.log("[ProfileFeeMaster] loading for schoolProfileId →", schoolProfileId);
    setLoadingData(true);
    loadFeemaster(schoolProfileId)
      .then(({ records }) => {
        const mapped = mapRecordsToRows(records);
        if (mapped.length > 0) setRows(mapped);
      })
      .catch((err) => console.error("[ProfileFeeMaster] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  // ── Recompute totals when rows change ─────────────────────
  useEffect(() => {
    const st      = rows.reduce((s, r) => s + (parseFloat(r.itemFeesTDD)     || 0), 0);
    const general = rows.reduce((s, r) => s + (parseFloat(r.itemFeesGeneral) || 0), 0);
    setFeesPerStudentST(st);
    setFeesPerStudentGeneral(general);
  }, [rows]);

  const setI = (k) => (v) => setInput((p) => ({ ...p, [k]: v }));

  // ── Get missing fee items ─────────────────────────────────
  const getMissingFees = () => {
    const addedFeeIds = rows.map((r) => String(r.feesItemId));
    return feeTypeOpts.filter((o) => !addedFeeIds.includes(String(o.value)));
  };

  // ── Add row — prevent duplicate ───────────────────────────
 const handleAdd = () => {
  if (!input.feesItemId || !input.itemFeesTDD || !input.itemFeesGeneral) {
    setInputErr("Please fill all fields before adding.");
    return;
  }

  // Check fee values > 0
  if (Number(input.itemFeesTDD) <= 0 || Number(input.itemFeesGeneral) <= 0) {
    setInputErr("Fee values must be greater than 0.");
    return;
  }

  // Check duplicate fee item
  const alreadyAdded = rows.some(
    (r) => String(r.feesItemId) === String(input.feesItemId)
  );
  if (alreadyAdded) {
    setInputErr("This fee item is already added. Please select a different fee item.");
    return;
  }

  setInputErr("");
  setRows((p) => [...p, { ...input, id: Date.now(), liferayId: null }]);
  setInput(emptyInput);
};

  const handleDelete = (id) => setRows((p) => p.filter((r) => r.id !== id));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("File must be under 2MB");
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  // ── Save — validate all fee items added ───────────────────
  const handleSave = async () => {
    // Check all fee items from picklist are added
    const missingFees = getMissingFees();
    if (missingFees.length > 0) {
      const missingNames = missingFees.map((f) => f.label).join(", ");
      setAlert({
        type: "error",
        message: `Please add all fee items before saving. Missing: ${missingNames}`,
      });
      return;
    }

    if (rows.length === 0) {
      setAlert({ type: "error", message: "Please add at least one fee entry." });
      return;
    }

    setSaving(true);
    setAlert(null);
    try {
      await submitFeemaster({ rows, receiptFile, feesPerStudentST, feesPerStudentGeneral, schoolProfileId });
      setAlert({ type: "success", message: "Profile Fee Master saved successfully!" });
      onSave?.({ rows, feesPerStudentST, feesPerStudentGeneral });
    } catch (e) {
      setAlert({ type: "error", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFeesPerStudentST(0);
    setFeesPerStudentGeneral(0);
    setInput(emptyInput);
    setInputErr("");
    setRows([]);
    setReceiptFile(null);
    setReceiptPreview(null);
    setAlert(null);
  };

  const getFeeLabel = (id) =>
    feeTypeOpts.find((o) => o.value === id || o.value === String(id))?.label || id;

  // ── Get remaining (not yet added) fee options ─────────────
  const remainingFeeOpts = feeTypeOpts.filter(
    (o) => !rows.some((r) => String(r.feesItemId) === String(o.value))
  );

  const missingFees = getMissingFees();

  return (
    <div style={{ padding: "16px 20px", background: "#fff", borderRadius: 4 }}>
      <div className="pfm-heading">Profile FeeMaster</div>

      {loadingData && (
        <div style={{ textAlign: "center", padding: "12px", color: "#888", fontSize: 13 }}>
          Loading saved data...
        </div>
      )}

      {alert && (
        <div className={`pfm-alert ${alert.type}`}>
          {alert.message}
          <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
        </div>
      )}

      {/* Show missing fees info */}
      {rows.length > 0 && missingFees.length > 0 && (
        <div className="pfm-missing-info">
          ⚠️ <strong>Pending fee items:</strong> {missingFees.map((f) => f.label).join(", ")}
        </div>
      )}

      <div className="pfm-row2">
        <div>
          <label className="pfm-label">Fees Per Student ST <span className="req">*</span></label>
          <input className="pfm-input grey" value={feesPerStudentST} readOnly />
        </div>
        <div>
          <label className="pfm-label">Fees Per Student General <span className="req">*</span></label>
          <input className="pfm-input grey" value={feesPerStudentGeneral} readOnly />
        </div>
      </div>

      {inputErr && <div className="pfm-err">{inputErr}</div>}

      <div className="pfm-row3">
        <div>
          <label className="pfm-label">Fees Item <span className="req">*</span></label>
          <select
            className="pfm-select"
            value={input.feesItemId}
            onChange={(e) => setI("feesItemId")(e.target.value)}
          >
            <option value="">Select</option>
            {/* Only show remaining (not yet added) fee options */}
            {remainingFeeOpts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="pfm-label">Item Fees TDD <span className="req">*</span></label>
          <input
            className="pfm-input"
            value={input.itemFeesTDD}
            onChange={(e) => setI("itemFeesTDD")(e.target.value)}
            type="number"
            min="0"
          />
        </div>
        <div>
          <label className="pfm-label">Item Fees General <span className="req">*</span></label>
          <input
            className="pfm-input"
            value={input.itemFeesGeneral}
            onChange={(e) => setI("itemFeesGeneral")(e.target.value)}
            type="number"
            min="0"
          />
        </div>
      </div>

      <button type="button" className="pfm-add-btn" onClick={handleAdd}>Add</button>

      <div className="pfm-upload-row">
        <div className="pfm-upload-group">
          <label className="pfm-label">Upload Receipt <span className="req">*</span></label>
          <div className="pfm-file-box">
            <label className="pfm-choose-label">
              Choose File
              <input type="file" style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            </label>
            <span className="pfm-filename">{receiptFile ? receiptFile.name : "No file chosen"}</span>
          </div>
        </div>
        <button
          type="button"
          className="pfm-view-btn"
          onClick={() => receiptPreview && window.open(receiptPreview, "_blank")}
          disabled={!receiptFile}
        >
          View Uploaded Receipt
        </button>
      </div>

      {rows.length > 0 && (
        <div className="pfm-table-wrap">
          <table className="pfm-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Item Name</th>
                <th>Item Fees ST (TDD)</th>
                <th>Item Fees General</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td>{getFeeLabel(r.feesItemId)}</td>
                  <td>{r.itemFeesTDD}</td>
                  <td>{r.itemFeesGeneral}</td>
                  <td>
                    <button className="pfm-delete-btn" onClick={() => handleDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pfm-actions">
        <button type="button" className="pfm-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className="pfm-reset-btn" onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}