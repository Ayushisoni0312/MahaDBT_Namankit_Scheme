// ============================================================
//  src/sections/Diningfacilitiesdetails.jsx
//  Validations added per Excel spec:
//  - Dining Hall Area: shown ONLY if Separate Dining Hall = Yes (row 85)
//  - Upload Dining Hall Photo: mandatory (row 88)
//  - Upload Menu: mandatory (row 89)
//  - All existing working code unchanged
// ============================================================
import { useState, useEffect } from "react";
import { Field, TextInput, SelectInput, SectionHeading, Row3, Row2 } from "../components/FormFields";
import SectionWrapper from "../components/SectionWrapper";
import { loadDiningDetails, submitDiningDetails, mapRecordToForm } from "../api/DiningDetails";

const YES_NO = ["Yes", "No"];

const emptyForm = {
  SeparateDiningHallforBoysandGirls: "",
  DiningHallAreainSqft:              "",
  DiningTable:                       "",
  FoodServedAsPerMenu:               "",
  DiningHallPhoto:                   null,
  MenuPhoto:                         null,
};

export default function DiningFacilitiesDetails({ onTabChange, onSave, schoolProfileId, onLoadingChange }) {
  const [form,        setForm]        = useState(emptyForm);
  const [saving,      setSaving]      = useState(false);
  const [alert,       setAlert]       = useState(null);
  const [errors,      setErrors]      = useState({});
  const [recordId,    setRecordId]    = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // ── Load existing record on mount ────────────────────────
  useEffect(() => {
    onLoadingChange?.(loadingData);
  }, [loadingData, onLoadingChange]);

  useEffect(() => {
    if (!schoolProfileId) return;
    setLoadingData(true);
    loadDiningDetails(schoolProfileId)
      .then(({ record, recordId: rid }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setForm(formData);
      })
      .catch((err) => console.error("[DiningDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Clear Dining Hall Area when Separate Dining Hall = No
  const onSeparateDiningChange = (v) => {
    setForm((p) => ({
      ...p,
      SeparateDiningHallforBoysandGirls: v,
      DiningHallAreainSqft: v !== "Yes" ? "" : p.DiningHallAreainSqft,
    }));
  };

  const handleFileChange = (k) => (e) => {
    const file = e.target.files[0] || null;
    setForm((p) => ({ ...p, [k]: file }));
    // Clear file error on selection
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};

    // Row 84 — Separate Dining Hall: Mandatory
    if (!form.SeparateDiningHallforBoysandGirls)
      e.SeparateDiningHallforBoysandGirls = "Separate Dining Hall for Boys and Girls is required.";

    // Row 85 — Dining Hall Area: Not mandatory, shown only if Yes (no validation needed)

    // Row 86 — Dining Table: Mandatory
    if (!form.DiningTable)
      e.DiningTable = "Dining Table is required.";

    // Row 87 — Food Served As Per Menu: Mandatory
    if (!form.FoodServedAsPerMenu)
      e.FoodServedAsPerMenu = "Food Served As Per Menu is required.";

    // Row 88 — Upload Dining Hall Photo: Mandatory
    if (!form.DiningHallPhoto)
      e.DiningHallPhoto = "Upload Dining Hall Photo is required.";

    // Row 89 — Upload Menu: Mandatory
    if (!form.MenuPhoto)
      e.MenuPhoto = "Upload Menu is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setAlert({ type: "error", message: "Please fix the highlighted errors before saving." });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      await submitDiningDetails({ form, schoolProfileId, recordId });
      setAlert({ type: "success", message: `Dining Facilities Details ${recordId ? "updated" : "saved"} successfully!` });
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
  };

  return (
    <SectionWrapper
      alert={alert}
      onCloseAlert={() => setAlert(null)}
      onSave={handleSave}
      onReset={handleReset}
      saving={saving}
      loading={loadingData}
    >
      <SectionHeading title="Dining Facilities Details" />

      <Row3>
        {/* Row 84 — Separate Dining Hall: Mandatory */}
        <Field label="Separate Dining Hall for Boys and Girls" required error={errors.SeparateDiningHallforBoysandGirls}>
          <SelectInput
            value={form.SeparateDiningHallforBoysandGirls}
            onChange={onSeparateDiningChange}
            options={YES_NO}
          />
        </Field>

        {/* Row 85 — Dining Hall Area: shown ONLY if Yes selected */}
        {form.SeparateDiningHallforBoysandGirls === "Yes" && (
          <Field label="Dining Hall Area in Sq.Ft" error={errors.DiningHallAreainSqft}>
            <TextInput value={form.DiningHallAreainSqft} onChange={set("DiningHallAreainSqft")} type="number" />
          </Field>
        )}

        {/* Row 86 — Dining Table: Mandatory */}
        <Field label="Dining Table" required error={errors.DiningTable}>
          <SelectInput value={form.DiningTable} onChange={set("DiningTable")} options={YES_NO} />
        </Field>
      </Row3>

      <Row3>
        {/* Row 87 — Food Served As Per Menu: Mandatory */}
        <Field label="Food Served As Per Menu" required error={errors.FoodServedAsPerMenu}>
          <SelectInput value={form.FoodServedAsPerMenu} onChange={set("FoodServedAsPerMenu")} options={YES_NO} />
        </Field>
      </Row3>

      {/* Upload Section */}
      <div style={{ marginTop: 28, borderTop: "1px solid #cccccc", paddingTop: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 400, color: "#333", marginBottom: 14 }}>
          Upload Photos
        </div>
        <p style={{ color: "#cc0000", fontSize: 13, marginBottom: 14 }}>
          Note:- The size of the photograph should fall between 5KB to 100KB.
        </p>
        <Row2>
          {/* Row 88 — Dining Hall Photo: Mandatory */}
          <Field label="Upload Dining Hall Photo" required error={errors.DiningHallPhoto}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange("DiningHallPhoto")}
              style={{ fontSize: 13, padding: "4px 0" }}
            />
            {form.DiningHallPhoto && (
              <span style={{ fontSize: 12, color: "#555", marginTop: 4, display: "block" }}>
                {form.DiningHallPhoto.name}
              </span>
            )}
          </Field>

          {/* Row 89 — Upload Menu: Mandatory */}
          <Field label="Upload Menu" required error={errors.MenuPhoto}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange("MenuPhoto")}
              style={{ fontSize: 13, padding: "4px 0" }}
            />
            {form.MenuPhoto && (
              <span style={{ fontSize: 12, color: "#555", marginTop: 4, display: "block" }}>
                {form.MenuPhoto.name}
              </span>
            )}
          </Field>
        </Row2>
      </div>
    </SectionWrapper>
  );
}
