// ============================================================
//  src/sections/Sportsfacilities.jsx
//  UI only — API logic in src/api/sportsDetails.js
//
//  On mount: loads all 3 objects (sports, cultural, tours)
//  On save:  POST/PATCH all 3 objects with schoolProfileId
// ============================================================
import { useState, useEffect } from "react";
import {
  Field, TextInput, SelectInput,
  SectionHeading, Row3, Row2,
  Alert, BtnSave, BtnReset,
} from "../components/FormFields";
import Pagination from "../components/Pagination";
import { TH, TD, DELETE_BTN, ADD_BTN } from "../utils/Tablestyles";
import {
  loadSportsDetails, submitSportsDetails,
  mapRecordToForm, mapCulturalToRows, mapToursToRows,
} from "../api/sportsDetails";
import { getPicklist } from "../api/liferay";

const YES_NO = ["Yes", "No"];
const MAGAZINE_TYPES = [
  { value: 1, label: "Monthly" },
  { value: 2, label: "Quarterly" },
  { value: 3, label: "Half-Yearly" },
  { value: 4, label: "Annual" },
];
// YEARS loaded from Liferay picklist

const themeStyles = {
  container: { padding: "var(--spacing-md, 16px) var(--spacing-lg, 20px)" },
  card:      { background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #d6e0e0)", borderRadius: "var(--radius-sm, 3px)", padding: "18px 20px 22px", marginBottom: "20px" },
  addBtnRow: { display: "flex", justifyContent: "center", marginTop: "10px", marginBottom: "20px" },
};

const emptyForm = {
  noOfPhysicalEducationPTTeacherAvailable:  "",
  numberOfSportsPlayedOnPlayground:         "",
  detailsOfSportsPlayedOnPlayground:        "",
  availOfQualifiedSportsTeacherAsPerStuCnt: "",
  availabilityOfSeparateAuditorium:         "",
  auditoriumAreasqFt:                       "",
  schoolMagazine:                           "",
  schoolMagazineTypeId:                     "",
};

export default function SportsFacilities({ onTabChange, onSave, schoolProfileId, isEditMode }) {
  const [form,         setForm]         = useState(emptyForm);
  const [saving,       setSaving]       = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [recordId,     setRecordId]     = useState(null);
  const [loadingData,  setLoadingData]  = useState(false);
  const [yearOpts,     setYearOpts]     = useState([]);

  const [culturalRows, setCulturalRows] = useState([]);
  const [newCultural,  setNewCultural]  = useState({ yearId: "", programName: "", remarks: "" });

  const [tourRows,     setTourRows]     = useState([]);
  const [newTour,      setNewTour]      = useState({ yearId: "", programName: "", place: "", purpose: "" });

  // ── Load Year picklist ───────────────────────────────────
  useEffect(() => {
    getPicklist("44a7021a-e02e-2a85-16c5-5173bd49bd02")
      .then(setYearOpts)
      .catch(() => setYearOpts([
        { value: "2023-2024", label: "2023-2024" },
        { value: "2024-2025", label: "2024-2025" },
        { value: "2025-2026", label: "2025-2026" },
      ]));
  }, []);

  // ── Load all 3 objects on mount ───────────────────────────
  useEffect(() => {
    if (!schoolProfileId || !isEditMode) return;
    console.log("[SportsFacilities] loading for schoolProfileId →", schoolProfileId);
    setLoadingData(true);
    loadSportsDetails(schoolProfileId)
      .then(({ record, recordId: rid, culturalRecords, tourRecords }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setForm(formData);
        const cultural = mapCulturalToRows(culturalRecords);
        if (cultural.length > 0) setCulturalRows(cultural);
        const tours = mapToursToRows(tourRecords);
        if (tours.length > 0) setTourRows(tours);
      })
      .catch((err) => console.error("[SportsFacilities] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const getYearLabel = (id) => yearOpts.find((y) => y.value === id || y.value === Number(id))?.label || id;

  const addCultural = () => {
    if (!newCultural.yearId || !newCultural.programName) return;
    setCulturalRows([...culturalRows, { ...newCultural, id: Date.now(), liferayId: null }]);
    setNewCultural({ yearId: "", programName: "", remarks: "" });
  };

  const addTour = () => {
    if (!newTour.yearId || !newTour.programName || !newTour.place) return;
    setTourRows([...tourRows, { ...newTour, id: Date.now(), liferayId: null }]);
    setNewTour({ yearId: "", programName: "", place: "", purpose: "" });
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await submitSportsDetails({ form, culturalRows, tourRows, schoolProfileId, recordId });
      setAlert({ type: "success", message: `Sports Facilities ${recordId ? "updated" : "saved"} successfully!` });
      onSave?.(form);
    } catch (e) {
      setAlert({ type: "error", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setCulturalRows([]);
    setTourRows([]);
    setNewCultural({ yearId: "", programName: "", remarks: "" });
    setNewTour({ yearId: "", programName: "", place: "", purpose: "" });
    setAlert(null);
  };

  return (
    <div style={themeStyles.container}>
      {loadingData && (
        <div style={{ textAlign: "center", padding: "12px", color: "#888", fontSize: 13 }}>
          Loading saved data...
        </div>
      )}
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={themeStyles.card}>
        <SectionHeading title="Sports Facilities" />
        <Row3>
          <Field label="Number Of Physical Education (PT) teacher available" required>
            <TextInput value={form.noOfPhysicalEducationPTTeacherAvailable} onChange={set("noOfPhysicalEducationPTTeacherAvailable")} type="number" />
          </Field>
          <Field label="Number Of sports Played On PlayGround" required>
            <TextInput value={form.numberOfSportsPlayedOnPlayground} onChange={set("numberOfSportsPlayedOnPlayground")} type="number" />
          </Field>
          <Field label="Details Of sports Played On PlayGround" required>
            <TextInput value={form.detailsOfSportsPlayedOnPlayground} onChange={set("detailsOfSportsPlayedOnPlayground")} placeholder="Basketball, Football..." />
          </Field>
        </Row3>
        <Row3>
          <Field label="Availabilty of qualified Sport's Teachers as per students' count" required>
            <SelectInput value={form.availOfQualifiedSportsTeacherAsPerStuCnt} onChange={set("availOfQualifiedSportsTeacherAsPerStuCnt")} options={YES_NO} />
          </Field>
          <div /><div />
        </Row3>
        <Row2>
          <Field label="Availabilty Of Separate Auditorium" required>
            <SelectInput value={form.availabilityOfSeparateAuditorium} onChange={set("availabilityOfSeparateAuditorium")} options={YES_NO} />
          </Field>
          <Field label="Auditorium Area(sq ft)" required>
            <TextInput value={form.auditoriumAreasqFt} onChange={set("auditoriumAreasqFt")} type="number" />
          </Field>
        </Row2>
        <Row2>
          <Field label="School Magazine" required>
            <SelectInput value={form.schoolMagazine} onChange={set("schoolMagazine")} options={YES_NO} />
          </Field>
          <Field label="School Magazine Type" required>
            <SelectInput value={form.schoolMagazineTypeId} onChange={set("schoolMagazineTypeId")} options={MAGAZINE_TYPES} />
          </Field>
        </Row2>

        {/* ── Cultural Programs ── */}
        <div style={{ marginTop: 30 }}>
          <SectionHeading title="Cultural programs conducted by school" />
          <Row3>
            <Field label="Year" required>
              <SelectInput value={newCultural.yearId} onChange={(v) => setNewCultural({ ...newCultural, yearId: v })} options={yearOpts} />
            </Field>
            <Field label="Program Name" required>
              <TextInput value={newCultural.programName} onChange={(v) => setNewCultural({ ...newCultural, programName: v })} />
            </Field>
            <Field label="Remarks">
              <TextInput value={newCultural.remarks} onChange={(v) => setNewCultural({ ...newCultural, remarks: v })} />
            </Field>
          </Row3>
          <div style={themeStyles.addBtnRow}>
            <button type="button" onClick={addCultural} style={ADD_BTN}>Add Program</button>
          </div>
          {culturalRows.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
              <thead>
                <tr>
                  <th style={TH}>Sr No</th>
                  <th style={TH}>Year</th>
                  <th style={TH}>Program Name</th>
                  <th style={TH}>Remarks</th>
                  <th style={TH}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {culturalRows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={TD}>{i + 1}</td>
                    <td style={TD}>{getYearLabel(r.yearId)}</td>
                    <td style={TD}>{r.programName}</td>
                    <td style={TD}>{r.remarks}</td>
                    <td style={TD}>
                      <button style={DELETE_BTN} onClick={() => setCulturalRows(culturalRows.filter((x) => x.id !== r.id))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Educational Tours ── */}
        <div style={{ marginTop: 30 }}>
          <SectionHeading title="Educational tours conducted by school" />
          <Row3>
            <Field label="Year" required>
              <SelectInput value={newTour.yearId} onChange={(v) => setNewTour({ ...newTour, yearId: v })} options={yearOpts} />
            </Field>
            <Field label="Program Name" required>
              <TextInput value={newTour.programName} onChange={(v) => setNewTour({ ...newTour, programName: v })} />
            </Field>
            <Field label="Place" required>
              <TextInput value={newTour.place} onChange={(v) => setNewTour({ ...newTour, place: v })} />
            </Field>
          </Row3>
          <Row2>
            <Field label="Purpose">
              <TextInput value={newTour.purpose} onChange={(v) => setNewTour({ ...newTour, purpose: v })} />
            </Field>
            <div />
          </Row2>
          <div style={themeStyles.addBtnRow}>
            <button type="button" onClick={addTour} style={ADD_BTN}>Add Educational Tours</button>
          </div>
          {tourRows.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Sr No</th>
                  <th style={TH}>Year</th>
                  <th style={TH}>Program Name</th>
                  <th style={TH}>Place</th>
                  <th style={TH}>Purpose</th>
                  <th style={TH}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {tourRows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={TD}>{i + 1}</td>
                    <td style={TD}>{getYearLabel(r.yearId)}</td>
                    <td style={TD}>{r.programName}</td>
                    <td style={TD}>{r.place}</td>
                    <td style={TD}>{r.purpose}</td>
                    <td style={TD}>
                      <button style={DELETE_BTN} onClick={() => setTourRows(tourRows.filter((x) => x.id !== r.id))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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