// ============================================================
//  src/sections/Labdetails.jsx
//  Validations added per Excel spec:
//  - Computer fields: shown ONLY if Computer Lab = Yes (rows 92, 93)
//  - Chemistry/Biology/Physics area: shown ONLY if area dropdown = Yes (rows 96, 99, 102)
//  - All mandatory dropdowns: validated (rows 91, 94, 95, 97, 98, 100, 101)
//  - Digital Classroom count: mandatory + numeric (row 103)
//  - Photo upload: mandatory (row 104)
//  - All existing working code unchanged
// ============================================================
import { useState, useEffect } from "react";
import {
  Field, TextInput, SelectInput,
  SectionHeading, Row3, Row2,
  Alert, BtnSave, BtnReset,
} from "../components/FormFields";
import { loadLabDetails, submitLabDetails, mapRecordToForm } from "../api/LabDetails";

const YES_NO = ["Yes", "No"];

const emptyForm = {
  isComputerLabAvailable:        "",
  computersWithPeripheralsCount: "",
  computersWorkingCount:         "",
  isChemistryLabAvailable:       "",
  isChemistryLabAreaSufficient:  "",
  chemistryLabAreaSqft:          "",
  isBiologyLabAvailable:         "",
  isBiologyLabAreaSufficient:    "",
  biologyLabAreaSqft:            "",
  isPhysicsLabAvailable:         "",
  isPhysicsLabAreaSufficient:    "",
  physicsLabAreaSqft:            "",
  digitalClassroomCount:         "",
};

export default function LabDetails({ onTabChange, onSave, schoolProfileId }) {
  const [form,        setForm]        = useState(emptyForm);
  const [photoFile,   setPhotoFile]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [alert,       setAlert]       = useState(null);
  const [errors,      setErrors]      = useState({});
  const [recordId,    setRecordId]    = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // ── Load existing record on mount ────────────────────────
  useEffect(() => {
    if (!schoolProfileId) return;
    setLoadingData(true);
    loadLabDetails(schoolProfileId)
      .then(({ record, recordId: rid }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setForm(formData);
      })
      .catch((err) => console.error("[LabDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Clear computer fields when Computer Lab = No ──────────
  const onComputerLabChange = (v) => {
    setForm((p) => ({
      ...p,
      isComputerLabAvailable:        v,
      computersWithPeripheralsCount: v !== "Yes" ? "" : p.computersWithPeripheralsCount,
      computersWorkingCount:         v !== "Yes" ? "" : p.computersWorkingCount,
    }));
  };

  // ── Clear lab area when area dropdown = No ────────────────
  const onChemistryAreaChange = (v) => {
    setForm((p) => ({
      ...p,
      isChemistryLabAreaSufficient: v,
      chemistryLabAreaSqft:         v !== "Yes" ? "" : p.chemistryLabAreaSqft,
    }));
  };

  const onBiologyAreaChange = (v) => {
    setForm((p) => ({
      ...p,
      isBiologyLabAreaSufficient: v,
      biologyLabAreaSqft:         v !== "Yes" ? "" : p.biologyLabAreaSqft,
    }));
  };

  const onPhysicsAreaChange = (v) => {
    setForm((p) => ({
      ...p,
      isPhysicsLabAreaSufficient: v,
      physicsLabAreaSqft:         v !== "Yes" ? "" : p.physicsLabAreaSqft,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeKB = file.size / 1024;
    if (sizeKB < 5 || sizeKB > 100) {
      setAlert({ type: "error", message: "Photo size must be between 5KB and 100KB." });
      e.target.value = "";
      return;
    }
    setPhotoFile(file);
    setErrors((p) => ({ ...p, photo: "" }));
  };

  const validate = () => {
    const e = {};

    // Row 91 — Computer Lab: Mandatory
    if (!form.isComputerLabAvailable)
      e.isComputerLabAvailable = "Well Equipped Computer Lab is required.";

    // Rows 92, 93 — Computer counts: not mandatory per Excel

    // Row 94 — Chemistry Lab: Mandatory
    if (!form.isChemistryLabAvailable)
      e.isChemistryLabAvailable = "Availability of Chemistry Laboratory is required.";

    // Row 95 — Chemistry Lab Area dropdown: Mandatory
    if (!form.isChemistryLabAreaSufficient)
      e.isChemistryLabAreaSufficient = "Area of Chemistry Laboratory is required.";

    // Row 96 — Chemistry area sqft: not mandatory

    // Row 97 — Biology Lab: Mandatory
    if (!form.isBiologyLabAvailable)
      e.isBiologyLabAvailable = "Availability of Biology Laboratory is required.";

    // Row 98 — Biology Lab Area dropdown: Mandatory
    if (!form.isBiologyLabAreaSufficient)
      e.isBiologyLabAreaSufficient = "Area of Biology Laboratory is required.";

    // Row 99 — Biology area sqft: not mandatory

    // Row 100 — Physics Lab: Mandatory
    if (!form.isPhysicsLabAvailable)
      e.isPhysicsLabAvailable = "Availability of Physics Laboratory is required.";

    // Row 101 — Physics Lab Area dropdown: Mandatory
    if (!form.isPhysicsLabAreaSufficient)
      e.isPhysicsLabAreaSufficient = "Area of Physics Laboratory is required.";

    // Row 102 — Physics area sqft: not mandatory

    // Row 103 — Digital Classroom Count: Mandatory + Numeric
    if (!form.digitalClassroomCount)
      e.digitalClassroomCount = "Number of Digital Classrooms is required.";
    else if (isNaN(Number(form.digitalClassroomCount)) || Number(form.digitalClassroomCount) < 0)
      e.digitalClassroomCount = "Must be a valid positive number.";

    // Row 104 — Lab Photo: Mandatory
    if (!photoFile)
      e.photo = "Lab Photo is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setAlert({ type: "error", message: "Please fix the highlighted errors." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      await submitLabDetails({ form, photoFile, schoolProfileId, recordId });
      setAlert({ type: "success", message: `Lab Details ${recordId ? "updated" : "saved"} successfully!` });
      onSave?.(form);
    } catch (e) {
      setAlert({ type: "error", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setPhotoFile(null);
    setErrors({});
    setAlert(null);
  };

  return (
    <div style={{ padding: "16px 20px 32px" }}>
      {loadingData && (
        <div style={{ textAlign: "center", padding: "12px", color: "#888", fontSize: 13 }}>
          Loading saved data...
        </div>
      )}

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={{ background: "#ffffff", border: "1px solid #d6e0e0", borderRadius: 3, padding: "18px 20px 22px" }}>

        {/* ── Computer Lab ── */}
        <SectionHeading title="Computer Lab Details" />
        <Row3>
          {/* Row 91 — Computer Lab: Mandatory */}
          <Field label="Well Equipped Computer Lab (Computers, Printers, Scanners, Internet, etc)" required error={errors.isComputerLabAvailable}>
            <SelectInput value={form.isComputerLabAvailable} onChange={onComputerLabChange} options={YES_NO} />
          </Field>

          {/* Rows 92, 93 — shown ONLY if Computer Lab = Yes */}
          {form.isComputerLabAvailable === "Yes" && (
            <>
              <Field label="No of Computers in Working Condition (With Printers, Scanners, Internet, etc)">
                <TextInput value={form.computersWithPeripheralsCount} onChange={set("computersWithPeripheralsCount")} type="number" />
              </Field>
              <Field label="No of Computers in Working Condition">
                <TextInput value={form.computersWorkingCount} onChange={set("computersWorkingCount")} type="number" />
              </Field>
            </>
          )}
        </Row3>

        {/* ── Chemistry / Biology / Physics Lab ── */}
        <div style={{ marginTop: 24 }}>
          <SectionHeading title="Chemistry, Biology & Physics Lab Details" />

          <Row3>
            {/* Row 94 — Chemistry Lab: Mandatory */}
            <Field label="Availability of Chemistry Laboratory with Lab Assistant" required error={errors.isChemistryLabAvailable}>
              <SelectInput value={form.isChemistryLabAvailable} onChange={set("isChemistryLabAvailable")} options={YES_NO} />
            </Field>
            {/* Row 95 — Chemistry Area dropdown: Mandatory */}
            <Field label="Area of Chemistry Laboratory (Min 150 Sq ft)" required error={errors.isChemistryLabAreaSufficient}>
              <SelectInput value={form.isChemistryLabAreaSufficient} onChange={onChemistryAreaChange} options={YES_NO} />
            </Field>
            {/* Row 96 — Chemistry area sqft: shown ONLY if Yes */}
            {form.isChemistryLabAreaSufficient === "Yes" && (
              <Field label="Chemistry lab Available Area Sq ft">
                <TextInput value={form.chemistryLabAreaSqft} onChange={set("chemistryLabAreaSqft")} type="number" />
              </Field>
            )}
          </Row3>

          <Row3>
            {/* Row 97 — Biology Lab: Mandatory */}
            <Field label="Availability of Biology Laboratory with Lab Assistant" required error={errors.isBiologyLabAvailable}>
              <SelectInput value={form.isBiologyLabAvailable} onChange={set("isBiologyLabAvailable")} options={YES_NO} />
            </Field>
            {/* Row 98 — Biology Area dropdown: Mandatory */}
            <Field label="Area of Biology Laboratory (Min 150 Sq ft)" required error={errors.isBiologyLabAreaSufficient}>
              <SelectInput value={form.isBiologyLabAreaSufficient} onChange={onBiologyAreaChange} options={YES_NO} />
            </Field>
            {/* Row 99 — Biology area sqft: shown ONLY if Yes */}
            {form.isBiologyLabAreaSufficient === "Yes" && (
              <Field label="Biology lab Available Area Sq ft">
                <TextInput value={form.biologyLabAreaSqft} onChange={set("biologyLabAreaSqft")} type="number" />
              </Field>
            )}
          </Row3>

          <Row3>
            {/* Row 100 — Physics Lab: Mandatory */}
            <Field label="Availability of Physics Laboratory with Lab Assistant" required error={errors.isPhysicsLabAvailable}>
              <SelectInput value={form.isPhysicsLabAvailable} onChange={set("isPhysicsLabAvailable")} options={YES_NO} />
            </Field>
            {/* Row 101 — Physics Area dropdown: Mandatory */}
            <Field label="Area of Physics Laboratory (Min 150 Sq ft)" required error={errors.isPhysicsLabAreaSufficient}>
              <SelectInput value={form.isPhysicsLabAreaSufficient} onChange={onPhysicsAreaChange} options={YES_NO} />
            </Field>
            {/* Row 102 — Physics area sqft: shown ONLY if Yes */}
            {form.isPhysicsLabAreaSufficient === "Yes" && (
              <Field label="Physics lab Available Area Sq ft">
                <TextInput value={form.physicsLabAreaSqft} onChange={set("physicsLabAreaSqft")} type="number" />
              </Field>
            )}
          </Row3>
        </div>

        {/* ── Digital Classroom ── */}
        <div style={{ marginTop: 24 }}>
          <SectionHeading title="Digital Class-room" />
          <Row3>
            {/* Row 103 — Digital Classroom Count: Mandatory + Numeric */}
            <Field label="Number of Digital Classroom in the school" required error={errors.digitalClassroomCount}>
              <TextInput value={form.digitalClassroomCount} onChange={set("digitalClassroomCount")} type="number" />
            </Field>
          </Row3>
        </div>

        {/* ── Upload Photo ── */}
        <div style={{ marginTop: 28, borderTop: "1px solid #cccccc", paddingTop: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 400, color: "#333", marginBottom: 14 }}>Upload Photo</div>
          <p style={{ color: "#cc0000", fontSize: 13, fontWeight: 400, marginBottom: 14 }}>
            Note:- The size of the photograph should fall between 5KB to 100KB.
          </p>
          <Row3>
            {/* Row 104 — Lab Photo: Mandatory */}
            <Field label="Upload Lab Photo" required error={errors.photo}>
              <input type="file" accept="image/*" onChange={handlePhotoChange}
                style={{ fontSize: 13, padding: "4px 0" }} />
            </Field>
          </Row3>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <BtnReset onClick={handleReset} />
        <BtnSave onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </BtnSave>
      </div>
    </div>
  );
}