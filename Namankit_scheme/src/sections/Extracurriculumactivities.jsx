// ============================================================
//  src/sections/ExtraCurriculumActivities.jsx
// ============================================================
import { useEffect, useState } from "react";
import { Field, TextInput, SelectInput, SectionHeading, Row3 } from "../components/FormFields";
import SectionWrapper from "../components/SectionWrapper";
import { loadExtraCurriculum, submitExtraCurriculum, mapRecordToForm } from "../api/ExtraCurriculum";

const YES_NO = ["Yes", "No"];

const emptyForm = {
  nccsanctioned: "",
  scoutguide: "",
  nSS: "",
  otherCurriculumActivity: "",
};

export default function ExtraCurriculumActivities({
  onSave,
  schoolProfileId,
  isDisabled,
  onLoadingChange,
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [alert, setAlert] = useState(null);
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    onLoadingChange?.(loadingData || saving);
  }, [loadingData, saving, onLoadingChange]);

  useEffect(() => {
    if (!schoolProfileId) return;

    setLoadingData(true);
    loadExtraCurriculum(schoolProfileId)
      .then(({ record, recordId: rid }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setForm(formData);
      })
      .catch((err) => console.error("[ExtraCurriculumActivities] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await submitExtraCurriculum({ form, schoolProfileId, recordId });
      setAlert({ type: "success", message: "Extra Curriculum Activities saved successfully!" });
      onSave?.(form);
    } catch (err) {
      setAlert({ type: "error", message: "Save failed - " + (err.message || "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setAlert(null);
  };

  return (
    <SectionWrapper
      alert={alert}
      onCloseAlert={() => setAlert(null)}
      onSave={handleSave}
      onReset={handleReset}
      saving={saving}
      loading={loadingData || saving}
      isDisabled={isDisabled}
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
