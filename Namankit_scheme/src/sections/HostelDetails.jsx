// ============================================================
//  src/sections/HostelDetails.jsx
//  Validations added per Excel spec:
//  - All mandatory fields validated
//  - Hot water: at least one checkbox required (row 70)
//  - Area In Sq.Ft: shown only if Separate Hostel Building = Yes (row 68)
//  - Grand Total hostels/capacity: auto-calculated (rows 75-76)
//  - Total Residential Students: auto-calculated (row 77)
//  - Expected Bathrooms/Washrooms: auto-calculated (rows 78,80)
//  - Actual Bathrooms/Washrooms: mandatory (rows 79,81)
//  - Photo: mandatory (row 82)
// ============================================================
import { useState, useEffect } from "react";
import {
  Field, TextInput, SelectInput,
  SectionHeading, Row3, Row2,
} from "../components/FormFields";
import SectionWrapper from "../components/SectionWrapper";
import { loadHostelDetails, submitHostelDetails, mapRecordToForm } from "../api/HostelDetails";

const YES_NO = ["Yes", "No"];

const HOT_WATER_OPTIONS = [
  { key: "solarWaterheater",   label: "Solar Waterheater" },
  { key: "gasElectric",        label: "Gas/Electric" },
  { key: "traditionalSources", label: "Traditional Sources" },
  { key: "notAvailable",       label: "Not Available" },
];

const emptyForm = {
  studentsClass1to4:           "",
  femaleCaretakers1to4:        "",
  availabilityIncinerators:    "",
  washingMachine:              "",
  separateHostelBuilding:      "",
  areaInSqFt:                  "",
  lightFanBedding:             "",
  hotWater_solarWaterheater:   false,
  hotWater_gasElectric:        false,
  hotWater_traditionalSources: false,
  hotWater_notAvailable:       false,
  totalBoysHostels:            "",
  capacityBoysHostels:         "",
  totalGirlsHostels:           "",
  capacityGirlsHostels:        "",
  actualBathrooms:             "",
  actualWashrooms:             "",
};

export default function HostelDetails({ onTabChange, onSave, schoolProfileId }) {
  const [form,         setForm]         = useState(emptyForm);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [errors,       setErrors]       = useState({});
  const [recordId,     setRecordId]     = useState(null);
  const [loadingData,  setLoadingData]  = useState(false);

  useEffect(() => {
    if (!schoolProfileId) return;
    setLoadingData(true);
    loadHostelDetails(schoolProfileId)
      .then(({ record, recordId: rid }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setForm(formData);
      })
      .catch((err) => console.error("[HostelDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Auto-calculated values ────────────────────────────────
  // Row 75 — Grand Total Number of Hostels
  const grandTotalHostels  = (Number(form.totalBoysHostels)    || 0) + (Number(form.totalGirlsHostels)    || 0);
  // Row 76 — Grand Total Capacity
  const grandTotalCapacity = (Number(form.capacityBoysHostels) || 0) + (Number(form.capacityGirlsHostels) || 0);
  // Row 77 — Total Residential Students = Grand Total Capacity
  const totalResidentialStudents = grandTotalCapacity;
  // Row 78 — Expected Bathrooms (1 per 20 students)
  const expectedBathrooms  = totalResidentialStudents ? Math.ceil(totalResidentialStudents / 20) : 0;
  // Row 80 — Expected Washrooms (1 per 20 students)
  const expectedWashrooms  = totalResidentialStudents ? Math.ceil(totalResidentialStudents / 20) : 0;

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
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, photo: "" }));
  };

  // ── Separate Hostel Building change ──────────────────────
  const onSeparateHostelChange = (v) => {
    setForm((p) => ({
      ...p,
      separateHostelBuilding: v,
      areaInSqFt: v !== "Yes" ? "" : p.areaInSqFt,
    }));
  };

  // ── Validate ──────────────────────────────────────────────
  const validate = () => {
    const e = {};

    // Row 63 — Total Students class 1-4: Mandatory + Numeric
    if (!form.studentsClass1to4)
      e.studentsClass1to4 = "Total Number of Students (class 1-4) is required.";
    else if (isNaN(Number(form.studentsClass1to4)) || Number(form.studentsClass1to4) < 0)
      e.studentsClass1to4 = "Must be a valid positive number.";

    // Row 64 — Female Caretakers: Mandatory + Numeric
    if (!form.femaleCaretakers1to4)
      e.femaleCaretakers1to4 = "Total Number of Female Caretakers is required.";
    else if (isNaN(Number(form.femaleCaretakers1to4)) || Number(form.femaleCaretakers1to4) < 0)
      e.femaleCaretakers1to4 = "Must be a valid positive number.";

    // Row 65 — Availability of Incinerators: Mandatory
    if (!form.availabilityIncinerators)
      e.availabilityIncinerators = "Availability of Incinerators is required.";

    // Row 66 — Washing Machine: Mandatory
    if (!form.washingMachine)
      e.washingMachine = "Availability of Washing Machine is required.";

    // Row 67 — Separate Hostel Building: Mandatory
    if (!form.separateHostelBuilding)
      e.separateHostelBuilding = "Availability of Separate Hostel Building is required.";

    // Row 68 — Area In Sq.Ft: Not mandatory (shown only if Yes)

    // Row 69 — Light Fan Bedding: Mandatory
    if (!form.lightFanBedding)
      e.lightFanBedding = "Availability of Light, Fan & Bedding is required.";

    // Row 70 — Hot Water: At least one checkbox required
    const hasHotWater = HOT_WATER_OPTIONS.some((o) => form[`hotWater_${o.key}`]);
    if (!hasHotWater)
      e.hotWater = "Please select at least one availability of Hot Water.";

    // Row 71 — Total Boys Hostels: Mandatory + Numeric
    if (!form.totalBoysHostels)
      e.totalBoysHostels = "Total Number of Boys Hostels is required.";
    else if (isNaN(Number(form.totalBoysHostels)) || Number(form.totalBoysHostels) < 0)
      e.totalBoysHostels = "Must be a valid positive number.";

    // Row 72 — Capacity Boys Hostels: Mandatory + Numeric
    if (!form.capacityBoysHostels)
      e.capacityBoysHostels = "Total Capacity of Boys Hostels is required.";
    else if (isNaN(Number(form.capacityBoysHostels)) || Number(form.capacityBoysHostels) < 0)
      e.capacityBoysHostels = "Must be a valid positive number.";

    // Row 73 — Total Girls Hostels: Mandatory + Numeric
    if (!form.totalGirlsHostels)
      e.totalGirlsHostels = "Total Number of Girls Hostels is required.";
    else if (isNaN(Number(form.totalGirlsHostels)) || Number(form.totalGirlsHostels) < 0)
      e.totalGirlsHostels = "Must be a valid positive number.";

    // Row 74 — Capacity Girls Hostels: Mandatory + Numeric
    if (!form.capacityGirlsHostels)
      e.capacityGirlsHostels = "Total Capacity of Girls Hostels is required.";
    else if (isNaN(Number(form.capacityGirlsHostels)) || Number(form.capacityGirlsHostels) < 0)
      e.capacityGirlsHostels = "Must be a valid positive number.";

    // Row 79 — Actual Bathrooms: Mandatory
    if (!form.actualBathrooms)
      e.actualBathrooms = "Actual Bathrooms is required.";
    else if (isNaN(Number(form.actualBathrooms)) || Number(form.actualBathrooms) < 0)
      e.actualBathrooms = "Must be a valid positive number.";

    // Row 81 — Actual Washrooms: Mandatory
    if (!form.actualWashrooms)
      e.actualWashrooms = "Actual Washrooms is required.";
    else if (isNaN(Number(form.actualWashrooms)) || Number(form.actualWashrooms) < 0)
      e.actualWashrooms = "Must be a valid positive number.";

    // Row 82 — Photo: Mandatory
    if (!photoFile && !form.existingPhoto)
      e.photo = "Hostel Photo is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setAlert({ type: "error", message: "Please fix the highlighted errors before saving." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      await submitHostelDetails({ form, photoFile, schoolProfileId, recordId });
      setAlert({ type: "success", message: `Hostel Details ${recordId ? "updated" : "saved"} successfully!` });
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
    setPhotoPreview(null);
    setErrors({});
    setAlert(null);
  };

  const subHeading = {
    fontSize: 16, fontWeight: 400, color: "#333",
    paddingBottom: 8, marginBottom: 14, marginTop: 24,
    borderBottom: "1px solid #cccccc",
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

      <SectionHeading title="School Hostel Details" />

      <Row3>
        {/* Row 63 — Students class 1-4: Mandatory + Numeric */}
        <Field label="Total Number of Students studying from class 1st to 4th" required error={errors.studentsClass1to4}>
          <TextInput value={form.studentsClass1to4} onChange={set("studentsClass1to4")} type="number" />
        </Field>
        {/* Row 64 — Female Caretakers: Mandatory + Numeric */}
        <Field label="Total Number of Female caretakers for Students studying in 1st to 4th standard" required error={errors.femaleCaretakers1to4}>
          <TextInput value={form.femaleCaretakers1to4} onChange={set("femaleCaretakers1to4")} type="number" />
        </Field>
        {/* Row 65 — Incinerators: Mandatory */}
        <Field label="Availability Of incinerators" required error={errors.availabilityIncinerators}>
          <SelectInput value={form.availabilityIncinerators} onChange={set("availabilityIncinerators")} options={YES_NO} />
        </Field>
      </Row3>

      <Row3>
        {/* Row 66 — Washing Machine: Mandatory */}
        <Field label="Availability Of washing Machine for students use" required error={errors.washingMachine}>
          <SelectInput value={form.washingMachine} onChange={set("washingMachine")} options={YES_NO} />
        </Field>
        {/* Row 67 — Separate Hostel Building: Mandatory */}
        <Field label="Availability Of Separate Hostel Building" required error={errors.separateHostelBuilding}>
          <SelectInput value={form.separateHostelBuilding} onChange={onSeparateHostelChange} options={YES_NO} />
        </Field>
        {/* Row 68 — Area In Sq.Ft: Not mandatory, shown only if Yes */}
        {form.separateHostelBuilding === "Yes" && (
          <Field label="Area In Sq.Ft" error={errors.areaInSqFt}>
            <TextInput value={form.areaInSqFt} onChange={set("areaInSqFt")} type="number" />
          </Field>
        )}
      </Row3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px 18px", marginBottom: 12 }}>
        {/* Row 69 — Light Fan Bedding: Mandatory */}
        <Field label="Availability Of Light, Fan & Bedding Facility For Each Student" required error={errors.lightFanBedding}>
          <SelectInput value={form.lightFanBedding} onChange={set("lightFanBedding")} options={YES_NO} />
        </Field>
      </div>

      {/* Row 70 — Hot Water: At least one required */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: "#333", display: "block", marginBottom: 8 }}>
          Availability of Hot water
          <span style={{ color: "#cc0000", marginLeft: 2 }}>*</span>
          <span style={{ color: "#666", fontSize: 11, marginLeft: 6 }}>(Select at least one)</span>
        </label>
        {errors.hotWater && (
          <span style={{ color: "#cc0000", fontSize: 11, display: "block", marginBottom: 6 }}>
            {errors.hotWater}
          </span>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {HOT_WATER_OPTIONS.map((opt) => (
            <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!form[`hotWater_${opt.key}`]}
                onChange={(e) => set(`hotWater_${opt.key}`)(e.target.checked)}
                style={{ accentColor: "#1a7a8a", width: 14, height: 14 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Hostel Capacity ── */}
      <div style={subHeading}>Hostel Capacity</div>
      <Row3>
        {/* Row 71 — Total Boys Hostels: Mandatory */}
        <Field label="Total Number of Boys Hostels" required error={errors.totalBoysHostels}>
          <TextInput value={form.totalBoysHostels} onChange={set("totalBoysHostels")} type="number" />
        </Field>
        {/* Row 72 — Capacity Boys Hostels: Mandatory */}
        <Field label="Total Capacity of Boys Hostels" required error={errors.capacityBoysHostels}>
          <TextInput value={form.capacityBoysHostels} onChange={set("capacityBoysHostels")} type="number" />
        </Field>
        {/* Row 73 — Total Girls Hostels: Mandatory */}
        <Field label="Total Number of Girls Hostels" required error={errors.totalGirlsHostels}>
          <TextInput value={form.totalGirlsHostels} onChange={set("totalGirlsHostels")} type="number" />
        </Field>
      </Row3>
      <Row3>
        {/* Row 74 — Capacity Girls Hostels: Mandatory */}
        <Field label="Total Capacity of Girls Hostels" required error={errors.capacityGirlsHostels}>
          <TextInput value={form.capacityGirlsHostels} onChange={set("capacityGirlsHostels")} type="number" />
        </Field>
        {/* Row 75 — Grand Total Hostels: Auto-calculated */}
        <Field label="Grand Total (Number of Hostels)" required>
          <TextInput value={grandTotalHostels || ""} readOnly />
        </Field>
        {/* Row 76 — Grand Total Capacity: Auto-calculated */}
        <Field label="Grand Total (Capacity of Hostel)" required>
          <TextInput value={grandTotalCapacity || ""} readOnly />
        </Field>
      </Row3>

      {/* ── Availability of Bathrooms ── */}
      <div style={subHeading}>Availability of Bathrooms</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px 18px", marginBottom: 12 }}>
        {/* Row 77 — Total Residential Students: Auto-calculated */}
        <Field label="Total No. Of Residential Students" required>
          <TextInput value={totalResidentialStudents || ""} readOnly />
        </Field>
      </div>
      <Row2>
        {/* Row 78 — Expected Bathrooms: Auto-calculated */}
        <Field label="Expected Bathrooms" required>
          <TextInput value={expectedBathrooms || ""} readOnly />
        </Field>
        {/* Row 79 — Actual Bathrooms: Mandatory */}
        <Field label="Actual Bathrooms" required error={errors.actualBathrooms}>
          <TextInput value={form.actualBathrooms} onChange={set("actualBathrooms")} type="number" />
        </Field>
      </Row2>
      <Row2>
        {/* Row 80 — Expected Washrooms: Auto-calculated */}
        <Field label="Expected Washrooms" required>
          <TextInput value={expectedWashrooms || ""} readOnly />
        </Field>
        {/* Row 81 — Actual Washrooms: Mandatory */}
        <Field label="Actual Washrooms" required error={errors.actualWashrooms}>
          <TextInput value={form.actualWashrooms} onChange={set("actualWashrooms")} type="number" />
        </Field>
      </Row2>

      {/* ── Upload Photo ── */}
      <div style={subHeading}>Upload Photo</div>
      <p style={{ color: "#cc0000", fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
        Note:- The size of the photograph should fall between 5KB to 100KB.
      </p>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        <div>
          {/* Row 82 — Hostel Photo: Mandatory */}
          <Field label="Upload Hostel Photo" required error={errors.photo}>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              style={{ fontSize: 13, fontFamily: "var(--font-main)", padding: "4px 0" }} />
          </Field>
        </div>
        {photoPreview && (
          <div style={{ width: 120, height: 90, border: "1px solid #ccc", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
            <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}