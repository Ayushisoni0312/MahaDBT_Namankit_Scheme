// ============================================================
//  src/sections/Teachersdetails.jsx
//  UI only — API logic in src/api/teacherDetails.js
//
//  On mount: loads existing teacher rows by schoolProfileId
//  On save:  POST new rows, PATCH existing rows (by liferayId)
// ============================================================
import { useState, useEffect } from "react";
import {
  Field, TextInput, SelectInput,
  SectionHeading, Row3,
  Alert, BtnSave, BtnReset,
} from "../components/FormFields";
import { TH, TD, DELETE_BTN } from "../utils/Tablestyles";
import Pagination from "../components/Pagination";
import { loadTeacherDetails, submitTeacherDetails, mapRecordsToRows } from "../api/teacherDetails";
import { getPicklist, getQualifications } from "../api/liferay";

// QUALIFICATIONS, MEDIUMS and SUBJECTS loaded from Liferay

const themeStyles = {
  container:     { padding: "var(--spacing-md, 16px) var(--spacing-lg, 20px)" },
  card:          { background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #d6e0e0)", borderRadius: "var(--radius-sm, 3px)", padding: "18px 20px 22px" },
  radioGroup:    { display: "flex", gap: "15px", alignItems: "center", fontSize: "13px", marginTop: "8px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginTop: "30px" },
  addBtn:        { background: "#28a745", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "4px", cursor: "pointer", fontSize: "14px" },
};

const emptyRow = {
  name:                                    "",
  highestQualification:                    "",
  mediumOfEducationTillStd10thId:          "",
  mediumOfEducationForDegreeId:            "",
  mediumForEducationForBedDedBPedBedPhyId: "",
  yearOfExperience:                        "",
  subject1Id:                              "",
  subject2Id:                              "",
  isSportsBPed:                            false,
  genderId:                                "",
  teacherDetailStatus:                     "",
};

export default function TeachersDetails({ onTabChange, onSave, schoolProfileId }) {
  const [rows,        setRows]        = useState([]);
  const [newRow,      setNewRow]      = useState(emptyRow);
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);
  const [alert,       setAlert]       = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [loadingData,  setLoadingData]  = useState(false);
  const [qualificationOpts, setQualificationOpts] = useState([]);
  const [mediumOpts,        setMediumOpts]        = useState([]);
  const [subjectOpts,  setSubjectOpts]  = useState([]);

  // ── Load existing rows on mount ───────────────────────────
  useEffect(() => {
    if (!schoolProfileId) return;
    console.log("[TeacherDetails] loading for schoolProfileId →", schoolProfileId);
    setLoadingData(true);
    loadTeacherDetails(schoolProfileId)
      .then(({ records }) => {
        const mapped = mapRecordsToRows(records);
        if (mapped.length > 0) setRows(mapped);
      })
      .catch((err) => console.error("[TeacherDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  // ── Load Qualifications from qualificationmasters object ─
  useEffect(() => {
    getQualifications()
      .then(setQualificationOpts)
      .catch(() => setQualificationOpts(
        ["SSC","HSC","D.Ed","B.Ed","M.Ed","B.A","B.Sc","M.A","M.Sc","PhD"]
        .map(q => ({ value: q, label: q }))
      ));
  }, []);

  // ── Load Medium and Subject picklists ────────────────────
  useEffect(() => {
    getPicklist("DBT-NAMANKIT-TEACHER-DETAILS-MEDIUM")
      .then(setMediumOpts)
      .catch(() => setMediumOpts([
        { value: "English", label: "English" },
        { value: "Marathi", label: "Marathi" },
        { value: "Hindi",   label: "Hindi" },
        { value: "Urdu",    label: "Urdu" },
        { value: "Other",   label: "Other" },
      ]));
  }, []);

  useEffect(() => {
    getPicklist("DBT-NAMANKIT-TEACHER-DETAILS-SUBJECTS")
      .then(setSubjectOpts)
      .catch(() => setSubjectOpts([
        { value: "Mathematics",   label: "Mathematics" },
        { value: "Science",       label: "Science" },
        { value: "English",       label: "English" },
        { value: "Marathi",       label: "Marathi" },
        { value: "Hindi",         label: "Hindi" },
        { value: "Social Science",label: "Social Science" },
        { value: "Sanskrit",      label: "Sanskrit" },
        { value: "P.E.",          label: "P.E." },
      ]));
  }, []);

  const setR = (k) => (v) => setNewRow((p) => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!newRow.name || !newRow.highestQualification || !newRow.genderId) {
      setAlert({ type: "error", message: "Please fill Name, Qualification and Gender." });
      return;
    }
    setRows((p) => [...p, { ...newRow, id: Date.now(), liferayId: null }]);
    setNewRow(emptyRow);
  };

  const handleSave = async () => {
    if (rows.length === 0) {
      setAlert({ type: "error", message: "Please add at least one teacher." });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      await submitTeacherDetails({ rows, schoolProfileId });
      setAlert({ type: "success", message: "Teachers data saved successfully!" });
      onSave?.(rows);
    } catch (e) {
      setAlert({ type: "error", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const getLabel = (options, value) => options.find((o) => o.value === Number(value))?.label || value;
  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={themeStyles.container}>
      {loadingData && (
        <div style={{ textAlign: "center", padding: "12px", color: "#888", fontSize: 13 }}>
          Loading saved data...
        </div>
      )}
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={themeStyles.card}>
        <SectionHeading title="Teacher Details" />

        <Row3>
          <Field label="Name" required>
            <TextInput value={newRow.name} onChange={setR("name")} />
          </Field>
          <Field label="Highest Qualification" required>
            <SelectInput value={newRow.highestQualification} onChange={setR("highestQualification")} options={qualificationOpts} />
          </Field>
          <Field label="Medium of Education till Std. 10th" required>
            <SelectInput value={newRow.mediumOfEducationTillStd10thId} onChange={setR("mediumOfEducationTillStd10thId")} options={mediumOpts} />
          </Field>
        </Row3>
        <Row3>
          <Field label="Medium of Education for Degree" required>
            <SelectInput value={newRow.mediumOfEducationForDegreeId} onChange={setR("mediumOfEducationForDegreeId")} options={mediumOpts} />
          </Field>
          <Field label="Medium for B.Ed/D.Ed/B.P.Ed" required>
            <SelectInput value={newRow.mediumForEducationForBedDedBPedBedPhyId} onChange={setR("mediumForEducationForBedDedBPedBedPhyId")} options={mediumOpts} />
          </Field>
          <Field label="Years Of Experience" required>
            <TextInput value={newRow.yearOfExperience} onChange={setR("yearOfExperience")} type="number" />
          </Field>
        </Row3>
        <Row3>
          <Field label="Subject 1" required>
            <SelectInput value={newRow.subject1Id} onChange={setR("subject1Id")} options={subjectOpts} />
          </Field>
          <Field label="Subject 2">
            <SelectInput value={newRow.subject2Id} onChange={setR("subject2Id")} options={subjectOpts} />
          </Field>
          <label style={themeStyles.checkboxLabel}>
            <input
              type="checkbox"
              checked={newRow.isSportsBPed}
              onChange={(e) => setR("isSportsBPed")(e.target.checked)}
            />
            Is Sports B.P.ed
          </label>
        </Row3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "10px" }}>
          <Field label="Gender" required>
            <div style={themeStyles.radioGroup}>
              {[{ value: 1, label: "Male" }, { value: 2, label: "Female" }, { value: 3, label: "Other" }].map((g) => (
                <label key={g.value}>
                  <input
                    type="radio"
                    checked={newRow.genderId === g.value}
                    onChange={() => setR("genderId")(g.value)}
                  /> {g.label}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Status" required>
            <div style={themeStyles.radioGroup}>
              {["Residential", "Non Residential"].map((s, i) => (
                <label key={s}>
                  <input
                    type="radio"
                    checked={newRow.teacherDetailStatus === (i === 0)}
                    onChange={() => setR("teacherDetailStatus")(i === 0)}
                  /> {s}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <button onClick={handleAdd} style={{ ...themeStyles.addBtn, marginTop: "20px" }}>Add</button>

        {/* Table */}
        {rows.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <div style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>Filled Details</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
                <thead>
                  <tr>
                    <th style={TH}>Teacher Name</th>
                    <th style={TH}>Qualifications</th>
                    <th style={TH}>Subject</th>
                    <th style={TH}>Medium till 10th</th>
                    <th style={TH}>Medium Degree</th>
                    <th style={TH}>Gender</th>
                    <th style={TH}>Exp.</th>
                    <th style={TH}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r) => (
                    <tr key={r.id}>
                      <td style={TD}>{r.name}</td>
                      <td style={TD}>{r.highestQualification}</td>
                      <td style={TD}>{mediumOpts.find(o => o.value === r.subject1Id)?.label || subjectOpts.find(o => o.value === String(r.subject1Id))?.label || r.subject1Id}</td>
                      <td style={TD}>{mediumOpts.find(o => o.value === r.mediumOfEducationTillStd10thId)?.label || r.mediumOfEducationTillStd10thId}</td>
                      <td style={TD}>{mediumOpts.find(o => o.value === r.mediumOfEducationForDegreeId)?.label || r.mediumOfEducationForDegreeId}</td>
                      <td style={TD}>{r.genderId === 1 ? "Male" : r.genderId === 2 ? "Female" : "Other"}</td>
                      <td style={TD}>{r.yearOfExperience}</td>
                      <td style={TD}>
                        <button style={DELETE_BTN} onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              total={rows.length}
              pageSize={pageSize}
              setPageSize={setPageSize}
              page={page}
              setPage={setPage}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <BtnReset onClick={() => { setRows([]); setNewRow(emptyRow); setAlert(null); }} />
        <BtnSave onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </BtnSave>
      </div>
    </div>
  );
}