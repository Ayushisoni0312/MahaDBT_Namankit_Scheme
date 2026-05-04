// ============================================================
//  src/sections/ExtraCurriculumActivities.jsx
//
//  FIXES:
//  1. Payload converts Yes/No strings → booleans (swagger expects boolean)
//  2. Uses saveExtraCurriculumActivities from liferay.js (Authorization header)
//  3. Payload matches swagger exactly
// ============================================================
import { useState } from "react";
import { Field, TextInput, SelectInput, SectionHeading, Row3 } from "../components/FormFields";
import SectionWrapper from "../components/SectionWrapper";
import { saveExtraCurriculumActivities } from "../api/liferay";

const YES_NO = ["Yes", "No"];

const emptyForm = {
  nccsanctioned:           "",
  scoutguide:              "",
  nSS:                     "",
  otherCurriculumActivity: "",
};

export default function ExtraCurriculumActivities({ onTabChange }) {
  const [form,   setForm]   = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [alert,  setAlert]  = useState(null);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      // Payload exactly matching swagger schema
      const payload = {
        nccsanctioned:           form.nccsanctioned === "Yes",
        nSS:                     form.nSS           === "Yes",
        otherCurriculumActivity: form.otherCurriculumActivity || "",
        scoutguide:              form.scoutguide    === "Yes",
      };

      console.log("[ExtraCurriculumActivities] payload →", JSON.stringify(payload, null, 2));
      await saveExtraCurriculumActivities(payload);

      setAlert({ type: "success", message: "Extra Curriculum Activities saved successfully!" });
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
      <SectionHeading title="Cultural Activities" />
      <Row3>
        <Field label="NCC (Sanctioned)" required>
          <SelectInput value={form.nccsanctioned} onChange={set("nccsanctioned")} options={YES_NO} />
        </Field>
        <Field label="Scout/Guide" required>
          <SelectInput value={form.scoutguide} onChange={set("scoutguide")} options={YES_NO} />
        </Field>
        <Field label="NSS" required>
          <SelectInput value={form.nSS} onChange={set("nSS")} options={YES_NO} />
        </Field>
        <Field label="Other">
          <TextInput value={form.otherCurriculumActivity} onChange={set("otherCurriculumActivity")} />
        </Field>
      </Row3>
    </SectionWrapper>
  );
}