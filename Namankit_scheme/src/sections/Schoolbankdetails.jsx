// ============================================================
//  src/sections/Schoolbankdetails.jsx
//  UI only — API logic in src/api/schoolbank.js
//
//  On mount: loads existing record by schoolProfileId → pre-fills form
//  On save:  POST (new) or PATCH (update)
// ============================================================
import { useState, useEffect } from "react";
import { Field, TextInput, SectionHeading } from "../components/FormFields";
import SectionWrapper from "../components/SectionWrapper";
import { loadBankDetails, submitBankDetails, mapRecordToForm } from "../api/schoolbank";

const STYLE_ID = "school-bank-details-responsive";
const responsiveCSS = `
  .sbd-row3 { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px; }
  .sbd-row2 { display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:16px; }
  .sbd-upload-wrap { margin-bottom:16px; }
  .sbd-upload-inner { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
  .sbd-file-box { display:flex;align-items:center;border:1px solid #cbd5e1;border-radius:3px;overflow:hidden;min-width:0;flex:1 1 220px;max-width:340px; }
  .sbd-choose-label { background:#f3f6f9;border-right:1px solid #cbd5e1;padding:7px 12px;font-size:13px;cursor:pointer;white-space:nowrap;user-select:none;flex-shrink:0; }
  .sbd-filename { padding:7px 10px;font-size:13px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1; }
  .sbd-open-btn { color:#fff;border:none;border-radius:4px;padding:7px 18px;font-size:13px;font-weight:500;white-space:nowrap;flex-shrink:0;transition:opacity 0.15s,background 0.15s; }
  .sbd-open-btn:disabled { opacity:0.7;cursor:default; }
  .sbd-open-btn:not(:disabled) { cursor:pointer; }
  .sbd-open-btn:not(:disabled):hover { opacity:0.88; }
  .sbd-save-btn { background:#28a745;color:#fff;border:none;border-radius:4px;padding:9px 28px;font-size:14px;font-weight:600;cursor:pointer;margin-top:8px;transition:background 0.15s; }
  .sbd-save-btn:hover { background:#218838; }
  .sbd-save-btn:disabled { background:#6cbe89;cursor:default; }
  @media(max-width:1024px){ .sbd-row3{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:768px){ .sbd-row3,.sbd-row2{ grid-template-columns:repeat(2,1fr);gap:12px; } .sbd-file-box{ max-width:100%;flex:1 1 180px; } .sbd-open-btn{ padding:7px 14px;font-size:12px; } }
  @media(max-width:520px){ .sbd-row3,.sbd-row2{ grid-template-columns:1fr;gap:10px; } .sbd-upload-inner{ flex-direction:column;align-items:stretch; } .sbd-file-box{ max-width:100%;flex:1 1 auto; } .sbd-open-btn{ width:100%;text-align:center;padding:9px 0;font-size:13px; } .sbd-save-btn{ width:100%;padding:11px 0; } }
  @media(max-width:360px){ .sbd-row3,.sbd-row2{ gap:8px; } .sbd-choose-label{ padding:8px 10px;font-size:12px; } .sbd-filename{ font-size:12px;padding:8px 8px; } .sbd-open-btn{ font-size:12px; } }
`;

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.textContent = responsiveCSS;
    document.head.appendChild(tag);
    return () => { document.getElementById(STYLE_ID)?.remove(); };
  }, []);
}

const emptyForm = {
  bankName:                   "",
  bankBranchName:             "",
  bankIFSCCode:               "",
  bankAccountNo:              "",
  bankBranchAddress:          "",
  uploadCancelledChequeImage: null,
};

export default function SchoolBankDetails({ onTabChange, onSave, schoolProfileId }) {
  useInjectStyles();

  const [form,            setForm]            = useState(emptyForm);
  const [errors,          setErrors]          = useState({});
  const [saving,          setSaving]          = useState(false);
  const [alert,           setAlert]           = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [recordId,        setRecordId]        = useState(null);
  const [loadingData,     setLoadingData]     = useState(false);

  // ── Load existing record on mount ────────────────────────
  useEffect(() => {
    if (!schoolProfileId) return;
    console.log("[SchoolBankDetails] loading for schoolProfileId →", schoolProfileId);
    setLoadingData(true);
    loadBankDetails(schoolProfileId)
      .then(({ record, recordId: rid }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setForm(formData);
      })
      .catch((err) => console.error("[SchoolBankDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.bankName.trim())                 e.bankName                   = "Required";
    if (!form.bankBranchName.trim())           e.bankBranchName             = "Required";
    if (!form.bankIFSCCode.trim())             e.bankIFSCCode               = "Required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bankIFSCCode))
                                               e.bankIFSCCode               = "Invalid IFSC format (e.g. SBIN0001234)";
    if (!form.bankAccountNo.toString().trim()) e.bankAccountNo              = "Required";
    if (!form.bankBranchAddress.trim())        e.bankBranchAddress          = "Required";
    if (!form.uploadCancelledChequeImage && !recordId)
                                               e.uploadCancelledChequeImage = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setAlert({ type: "error", message: "Please fix the highlighted errors." });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      await submitBankDetails({ form, schoolProfileId, recordId });
      setAlert({ type: "success", message: `School Bank Details ${recordId ? "updated" : "saved"} successfully!` });
      onSave?.(form);
    } catch (e) {
      setAlert({ type: "error", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
    setAlert(null);
    setImagePreviewUrl(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("File size should be less than 2MB");
      return;
    }
    setForm((p) => ({ ...p, uploadCancelledChequeImage: file }));
    setImagePreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  return (
    <SectionWrapper
      alert={alert}
      onCloseAlert={() => setAlert(null)}
      onSave={handleSave}
      onReset={handleReset}
      saving={saving}
    >
      {loadingData && (
        <div style={{ textAlign: "center", padding: "12px", color: "#888", fontSize: 13 }}>
          Loading saved data...
        </div>
      )}

      <SectionHeading title="School Bank Details" />

      <div className="sbd-row3">
        <Field label="Bank Name" required error={errors.bankName}>
          <TextInput value={form.bankName} onChange={set("bankName")} />
        </Field>
        <Field label="Bank Branch Name" required error={errors.bankBranchName}>
          <TextInput value={form.bankBranchName} onChange={set("bankBranchName")} />
        </Field>
        <Field label="Bank IFSC Code" required error={errors.bankIFSCCode}>
          <TextInput
            value={form.bankIFSCCode}
            onChange={(v) => set("bankIFSCCode")(v.toUpperCase())}
            placeholder="e.g. SBIN0001234"
          />
        </Field>
      </div>

      <div className="sbd-row2">
        <Field label="Bank Account No" required error={errors.bankAccountNo}>
          <TextInput value={form.bankAccountNo} onChange={set("bankAccountNo")} />
        </Field>
        <Field label="Bank Branch Address" required error={errors.bankBranchAddress}>
          <TextInput value={form.bankBranchAddress} onChange={set("bankBranchAddress")} />
        </Field>
      </div>

      <div className="sbd-upload-wrap">
        <Field label="Upload Cancelled Cheque Image" required error={errors.uploadCancelledChequeImage}>
          <div className="sbd-upload-inner">
            <div className="sbd-file-box">
              <label className="sbd-choose-label">
                Choose File
                <input type="file" style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
              </label>
              <span className="sbd-filename">
                {form.uploadCancelledChequeImage ? form.uploadCancelledChequeImage.name : "No file chosen"}
              </span>
            </div>
            <button
              type="button"
              className="sbd-open-btn"
              onClick={() => imagePreviewUrl && window.open(imagePreviewUrl, "_blank")}
              disabled={!form.uploadCancelledChequeImage}
              style={{ background: form.uploadCancelledChequeImage ? "#e5a020" : "#f0b84a" }}
            >
              Open Image
            </button>
          </div>
        </Field>
      </div>

      <button type="button" className="sbd-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </SectionWrapper>
  );
}