// ============================================================
//  src/sections/Medicalfacilities.jsx
//  UI only — API logic in src/api/medicalDetails.js
// ============================================================
import { useState, useEffect } from "react";
import { Field, TextInput, SelectInput, SectionHeading, Row3 } from "../components/FormFields";
import SectionWrapper from "../components/SectionWrapper";
import { loadMedicalDetails, submitMedicalDetails, mapRecordToForm } from "../api/MedicalDetails";

const YES_NO = ["Yes", "No"];
// ⚠️ Replace value IDs with actual Liferay picklist IDs
const TIME_OPTIONS = [
  { value: 1, label: "Full Time" },
  { value: 2, label: "Part Time" },
  { value: 3, label: "Not Available" },
];

const emptyForm = {
  availabilitOfMedicalSickRoom:    "",
  availabilityOfDoctorsInSchoolId: "",
  numberOfAmbulance:               "",
  numberOfDoctors:                 "",
  numberOfNurse:                   "",
};

export default function MedicalFacilities({ onTabChange, onSave, schoolProfileId }) {
  const [form,        setForm]        = useState(emptyForm);
  const [saving,      setSaving]      = useState(false);
  const [alert,       setAlert]       = useState(null);
  const [recordId,    setRecordId]    = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // ── Load existing record on mount ────────────────────────
  useEffect(() => {
    if (!schoolProfileId) return;
    console.log("[MedicalDetails] loading for schoolProfileId →", schoolProfileId);
    setLoadingData(true);
    loadMedicalDetails(schoolProfileId)
      .then(({ record, recordId: rid }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setForm(formData);
      })
      .catch((err) => console.error("[MedicalDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const isNotAvailable = Number(form.availabilityOfDoctorsInSchoolId) === 3;

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await submitMedicalDetails({ form, schoolProfileId, recordId });
      setAlert({ type: "success", message: `Medical Facilities ${recordId ? "updated" : "saved"} successfully!` });
      onSave?.(form);
    } catch (e) {
      setAlert({ type: "error", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => { setForm(emptyForm); setAlert(null); };

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

      <SectionHeading title="Medical Facilities" />
      <Row3>
        <Field label="Availability of Medical/Sick Room" required>
          <SelectInput value={form.availabilitOfMedicalSickRoom} onChange={set("availabilitOfMedicalSickRoom")} options={YES_NO} />
        </Field>
        <Field label="Availability of Doctors in School" required>
          <SelectInput value={form.availabilityOfDoctorsInSchoolId} onChange={set("availabilityOfDoctorsInSchoolId")} options={TIME_OPTIONS} />
        </Field>
        <Field label="Number of Doctors" required>
          <TextInput value={form.numberOfDoctors} onChange={set("numberOfDoctors")} type="number" disabled={isNotAvailable} />
        </Field>
        <Field label="Number of Nurse" required>
          <TextInput value={form.numberOfNurse} onChange={set("numberOfNurse")} type="number" disabled={isNotAvailable} />
        </Field>
        <Field label="Number of Ambulance" required>
          <TextInput value={form.numberOfAmbulance} onChange={set("numberOfAmbulance")} type="number" disabled={isNotAvailable} />
        </Field>
      </Row3>
    </SectionWrapper>
  );
}