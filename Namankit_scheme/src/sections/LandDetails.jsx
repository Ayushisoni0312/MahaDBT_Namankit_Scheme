// ============================================================
//  src/sections/LandDetails.jsx
//  Validations added per Excel spec:
//  - Playground Area: shown ONLY if Playground = Yes (row 48)
//  - Division must equal sum of classrooms with + without benches (row 56)
//  - Photo upload: mandatory (row 61)
//  - Area fields: numeric 2 decimal places
//  - All mandatory fields marked with required prop
// ============================================================
import { useState, useEffect } from "react";
import {
  Field, TextInput, SelectInput,
  SectionHeading, Row3, Row2,
  Alert, BtnSave, BtnReset,
} from "../components/FormFields";
import { loadLandDetails, submitLandDetails, mapRecordToForm } from "../api/landdetails";
import { getPicklist } from "../api/liferay";

const YES_NO = ["Yes", "No"];

const TH = {
  padding: "10px 12px", background: "#ffffff",
  borderBottom: "2px solid #dee2e6", fontSize: 13,
  fontWeight: 400, color: "#333", textAlign: "left",
  whiteSpace: "normal", verticalAlign: "bottom",
};
const TD = {
  padding: "9px 12px", borderBottom: "1px solid #dee2e6",
  fontSize: 13, color: "#333", verticalAlign: "middle",
};

function Pagination({ total, pageSize, setPageSize, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const navBtn = (label, action, active) => (
    <button key={label} onClick={active ? action : undefined} style={{
      padding: "5px 14px", fontSize: 13, fontFamily: "var(--font-main)", fontWeight: 400,
      border: active ? "1px solid #1a7a8a" : "1px solid #cccccc", borderRadius: 3,
      background: active ? "#1a7a8a" : "#ffffff",
      color: active ? "#ffffff" : "#aaaaaa",
      cursor: active ? "pointer" : "default", lineHeight: "1.5",
    }}>{label}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", fontSize: 13, color: "#333", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span>Total Records <strong>{total}</strong></span>
        <input type="number" value={pageSize} min={1}
          onChange={(e) => { setPageSize(Number(e.target.value) || 10); setPage(1); }}
          style={{ width: 55, height: 30, border: "1px solid #cccccc", borderRadius: 3, padding: "0 6px", fontSize: 13, color: "#333", textAlign: "center" }}
        />
      </div>
      <span>Page: {page} of {totalPages}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {navBtn("First",    () => setPage(1),                                   page > 1)}
        {navBtn("Previous", () => setPage((p) => Math.max(1, p - 1)),          page > 1)}
        {navBtn("Next",     () => setPage((p) => Math.min(totalPages, p + 1)), page < totalPages)}
        {navBtn("Last",     () => setPage(totalPages),                          page < totalPages)}
      </div>
    </div>
  );
}

const emptyLand = {
  ownership: "", totalAreaAcres: "", compoundWall: "",
  playground: "", playgroundAreaAcres: "", swimmingTank: "",
  runningTrack: "", basketballGround: "", khoKhokabaddiGround: "",
  sportsFacilityQuality: "", otherSports: "",
};

const emptyClassRow = {
  standard: "", division: "", separateClassroom: "",
  classroomWithBenches: "", classroomWithoutBenches: "",
};

export default function LandDetails({ onTabChange, onSave, schoolProfileId }) {
  const [land,         setLand]         = useState(emptyLand);
  const [classRow,     setClassRow]     = useState(emptyClassRow);
  const [classRows,    setClassRows]    = useState([]);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors,       setErrors]       = useState({});
  const [rowErrors,    setRowErrors]    = useState({});
  const [saving,       setSaving]       = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);
  const [recordId,     setRecordId]     = useState(null);
  const [loadingData,  setLoadingData]  = useState(false);
  const [standardOpts,     setStandardOpts]     = useState([]);
  const [ownershipOpts,    setOwnershipOpts]    = useState([]);
  const [sportQualityOpts, setSportQualityOpts] = useState([]);

  useEffect(() => {
    if (!schoolProfileId) return;
    setLoadingData(true);
    loadLandDetails(schoolProfileId)
      .then(({ record, recordId: rid }) => {
        setRecordId(rid);
        const formData = mapRecordToForm(record);
        if (formData) setLand(formData);
      })
      .catch((err) => console.error("[LandDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  useEffect(() => {
    getPicklist("DBT-NAMANKIT-LAND-DETAILS-OWNERSHIP")
      .then(opts => setOwnershipOpts(opts.map(o => ({ value: Number(o.label), label: o.value }))))
      .catch(() => setOwnershipOpts([
        { value: "Owned",  label: "Owned" },
        { value: "Rented", label: "Rented" },
      ]));
  }, []);

  useEffect(() => {
    getPicklist("DBT-NAMANKIT-LAND-DETAILS-SPORTS-QUALITY")
      .then(opts => setSportQualityOpts(opts.map(o => ({ value: Number(o.label), label: o.value }))))
      .catch(() => setSportQualityOpts([
        { value: "Best",         label: "Best" },
        { value: "Good",         label: "Good" },
        { value: "Average",      label: "Average" },
        { value: "BelowAverage", label: "Below Average" },
      ]));
  }, []);

  useEffect(() => {
    getPicklist("dbt-standard-grade")
      .then(setStandardOpts)
      .catch(() => setStandardOpts(
        Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
      ));
  }, []);

  const setL  = (k) => (v) => setLand((p)     => ({ ...p, [k]: v }));
  const setCR = (k) => (v) => setClassRow((p) => ({ ...p, [k]: v }));

  // ── Clear playground area when playground = No ────────────
  const onPlaygroundChange = (v) => {
    setLand((p) => ({ ...p, playground: v, playgroundAreaAcres: v !== "Yes" ? "" : p.playgroundAreaAcres }));
  };

  const pagedRows = classRows.slice((page - 1) * pageSize, page * pageSize);

  // ── Validate classroom row ────────────────────────────────
  const validateClassRow = () => {
    const e = {};
    if (!classRow.standard)              e.standard              = "Required";
    if (!classRow.division)              e.division              = "Required";
    if (!classRow.separateClassroom)     e.separateClassroom     = "Required";
    if (!classRow.classroomWithBenches)  e.classroomWithBenches  = "Required";
    if (!classRow.classroomWithoutBenches) e.classroomWithoutBenches = "Required";

    // Row 56 — Division must equal sum of classrooms with + without benches
    if (
      classRow.division &&
      classRow.classroomWithBenches &&
      classRow.classroomWithoutBenches
    ) {
      const div  = Number(classRow.division);
      const sum  = Number(classRow.classroomWithBenches) + Number(classRow.classroomWithoutBenches);
      if (div !== sum) {
        e.division = `Division (${div}) must equal Total With Benches + Without Benches (${sum}).`;
      }
    }

    setRowErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddRow = () => {
    if (!validateClassRow()) return;
    setRowErrors({});
    setClassRows((prev) => [...prev, { ...classRow, id: Date.now() }]);
    setClassRow(emptyClassRow);
    setPage(1);
  };

  const handleDeleteRow = (id) => {
    setClassRows((prev) => prev.filter((r) => r.id !== id));
    setPage(1);
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
    setPhotoPreview(URL.createObjectURL(file));
    // Clear photo error on selection
    setErrors((p) => ({ ...p, photo: "" }));
  };

  // ── Validate decimal helper ───────────────────────────────
  const isValidDecimal = (v) => v === "" || /^\d+(\.\d{0,2})?$/.test(v);

  // ── Main validation ───────────────────────────────────────
  const validate = () => {
    const e = {};

    // Row 44 — Ownership: Mandatory (Rented, Owned)
    if (!land.ownership)
      e.ownership = "Ownership is required.";

    // Row 45 — Total Area: Mandatory, Numeric 2 decimal
    if (!land.totalAreaAcres)
      e.totalAreaAcres = "Total Area is required.";
    else if (!isValidDecimal(land.totalAreaAcres))
      e.totalAreaAcres = "Enter a valid number (max 2 decimal places).";

    // Row 46 — School Compound Wall: Mandatory
    if (!land.compoundWall)
      e.compoundWall = "School Compound Wall is required.";

    // Row 47 — Playground: Mandatory
    if (!land.playground)
      e.playground = "Playground is required.";

    // Row 48 — Playground Area: Not mandatory, but if Playground=Yes it should be filled
    // Numeric 2 decimal if provided
    if (land.playground === "Yes" && !land.playgroundAreaAcres)
      e.playgroundAreaAcres = "Playground Area is required when Playground is Yes.";
    else if (land.playgroundAreaAcres && !isValidDecimal(land.playgroundAreaAcres))
      e.playgroundAreaAcres = "Enter a valid number (max 2 decimal places).";

    // Row 49 — Swimming Tank: Mandatory
    if (!land.swimmingTank)
      e.swimmingTank = "Swimming Tank is required.";

    // Row 50 — Running Track: Mandatory
    if (!land.runningTrack)
      e.runningTrack = "Running Track is required.";

    // Row 51 — Basketball Ground: Mandatory
    if (!land.basketballGround)
      e.basketballGround = "Basket Ball Ground is required.";

    // Row 52 — Kho-Kho Kabaddi: Mandatory
    if (!land.khoKhokabaddiGround)
      e.khoKhokabaddiGround = "Kho-Kho, Kabaddi Ground is required.";

    // Row 53 — Sport Facility Quality: Mandatory (Best, Good, Average, Below Average)
    if (!land.sportsFacilityQuality)
      e.sportsFacilityQuality = "Quality of Sport Facilities is required.";

    // Row 54 — Others Sports: Mandatory
    if (!land.otherSports?.trim())
      e.otherSports = "Others Sports is required.";

    // Row 61 — Photo: Mandatory
    if (!photoFile && !land.existingPhoto)
      e.photo = "School Land Photo is required.";

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
      await submitLandDetails({ land, photoFile, schoolProfileId, recordId });
      setAlert({ type: "success", message: `Land Details ${recordId ? "updated" : "saved"} successfully!` });
      onSave?.(land);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setAlert({ type: "error", message: "Save failed — " + (err.message || "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLand(emptyLand);
    setClassRow(emptyClassRow);
    setClassRows([]);
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    setRowErrors({});
    setAlert(null);
    setPage(1);
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
        <SectionHeading title="School Land Details" />

        <Row3>
          {/* Row 44 — Ownership: Mandatory (Rented, Owned) */}
          <Field label="Ownership" required error={errors.ownership}>
            <SelectInput value={land.ownership} onChange={setL("ownership")} options={ownershipOpts} />
          </Field>
          {/* Row 45 — Total Area: Mandatory, Numeric 2 decimal */}
          <Field label="Total Area(In Acres)[Building + Playground + Hostel etc]" required error={errors.totalAreaAcres}>
            <TextInput value={land.totalAreaAcres} onChange={setL("totalAreaAcres")} type="number" placeholder="e.g. 35.00" />
          </Field>
          {/* Row 46 — Compound Wall: Mandatory */}
          <Field label="School Compound Wall" required error={errors.compoundWall}>
            <SelectInput value={land.compoundWall} onChange={setL("compoundWall")} options={YES_NO} />
          </Field>
        </Row3>

        <Row3>
          {/* Row 47 — Playground: Mandatory */}
          <Field label="Playground" required error={errors.playground}>
            <SelectInput value={land.playground} onChange={onPlaygroundChange} options={YES_NO} />
          </Field>
          {/* Row 48 — Playground Area: shown ONLY if Playground = Yes */}
          {land.playground === "Yes" && (
            <Field label="Playground Area (In Acres)" error={errors.playgroundAreaAcres}>
              <TextInput value={land.playgroundAreaAcres} onChange={setL("playgroundAreaAcres")} type="number" placeholder="e.g. 10.00" />
            </Field>
          )}
          {/* Row 49 — Swimming Tank: Mandatory */}
          <Field label="Swimming Tank" required error={errors.swimmingTank}>
            <SelectInput value={land.swimmingTank} onChange={setL("swimmingTank")} options={YES_NO} />
          </Field>
        </Row3>

        <Row3>
          {/* Row 50 — Running Track: Mandatory */}
          <Field label="Running Track" required error={errors.runningTrack}>
            <SelectInput value={land.runningTrack} onChange={setL("runningTrack")} options={YES_NO} />
          </Field>
          {/* Row 51 — Basketball: Mandatory */}
          <Field label="Basket ball Ground" required error={errors.basketballGround}>
            <SelectInput value={land.basketballGround} onChange={setL("basketballGround")} options={YES_NO} />
          </Field>
          {/* Row 52 — Kho-Kho: Mandatory */}
          <Field label="Kho-Kho, Kabaddi Ground" required error={errors.khoKhokabaddiGround}>
            <SelectInput value={land.khoKhokabaddiGround} onChange={setL("khoKhokabaddiGround")} options={YES_NO} />
          </Field>
        </Row3>

        <Row2>
          {/* Row 53 — Sport Quality: Mandatory (Best, Good, Average, Below Average) */}
          <Field label="Quality Of Sport Facilities / Infrastructure available" required error={errors.sportsFacilityQuality}>
            <SelectInput value={land.sportsFacilityQuality} onChange={setL("sportsFacilityQuality")} options={sportQualityOpts} />
          </Field>
          {/* Row 54 — Others Sports: Mandatory */}
          <Field label="Others Sports" required error={errors.otherSports}>
            <TextInput value={land.otherSports} onChange={setL("otherSports")} placeholder="e.g. cricket, horse riding" />
          </Field>
        </Row2>

        {/* ── Classroom Details ── */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 400, color: "#333", paddingBottom: 8, marginBottom: 16, borderBottom: "1px solid #cccccc" }}>
            School Classroom Details (RCC Constructed)
          </div>

          <Row3>
            {/* Row 55 — Standard: Mandatory (1 to 12) */}
            <Field label="Standard" required error={rowErrors.standard}>
              <SelectInput value={classRow.standard} onChange={setCR("standard")} options={standardOpts} />
            </Field>
            {/* Row 56 — Division: Mandatory, must = sum of classrooms */}
            <Field label="Division" required error={rowErrors.division}>
              <TextInput value={classRow.division} onChange={setCR("division")} type="number" />
            </Field>
            {/* Row 57 — Separate Classroom: Mandatory */}
            <Field label="Separate Classroom For Each Division" required error={rowErrors.separateClassroom}>
              <SelectInput value={classRow.separateClassroom} onChange={setCR("separateClassroom")} options={YES_NO} />
            </Field>
          </Row3>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              {/* Row 58 — Total Classroom With Benches: Mandatory */}
              <Field label="Total Classroom With Benches" required error={rowErrors.classroomWithBenches}>
                <TextInput value={classRow.classroomWithBenches} onChange={setCR("classroomWithBenches")} type="number" />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              {/* Row 59 — Total Classroom Without Benches: Mandatory */}
              <Field label="Total Classroom Without Benches" required error={rowErrors.classroomWithoutBenches}>
                <TextInput value={classRow.classroomWithoutBenches} onChange={setCR("classroomWithoutBenches")} type="number" />
              </Field>
            </div>
            <button onClick={handleAddRow} style={{ background: "#28a745", color: "#fff", border: "none", borderRadius: 4, padding: "6px 20px", fontSize: 14, cursor: "pointer", height: 32, flexShrink: 0 }}>
              Add
            </button>
          </div>

          {/* Division hint */}
          {classRow.classroomWithBenches && classRow.classroomWithoutBenches && (
            <div style={{ fontSize: 12, color: "#555", marginTop: -16, marginBottom: 12 }}>
              ℹ️ Division should equal: {Number(classRow.classroomWithBenches) + Number(classRow.classroomWithoutBenches)} (With Benches + Without Benches)
            </div>
          )}

          {classRows.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 400, color: "#333", marginBottom: 12 }}>Filled Details</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, border: "1px solid #dee2e6" }}>
                  <thead>
                    <tr>
                      {["Sr No","Standard","Division","Separate Classroom For Each Division","Total Classroom With Benches","Total Classroom Without Benches","Delete"].map((h) => (
                        <th key={h} style={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td style={TD}>{(page - 1) * pageSize + idx + 1}</td>
                        <td style={TD}>{row.standard}</td>
                        <td style={TD}>{row.division}</td>
                        <td style={TD}>{row.separateClassroom}</td>
                        <td style={TD}>{row.classroomWithBenches}</td>
                        <td style={TD}>{row.classroomWithoutBenches}</td>
                        <td style={TD}>
                          <button onClick={() => handleDeleteRow(row.id)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 13, padding: 0 }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination total={classRows.length} pageSize={pageSize} setPageSize={setPageSize} page={page} setPage={setPage} />
            </div>
          )}
        </div>

        {/* ── Upload Photo ── */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 400, color: "#333", marginBottom: 14 }}>Upload Photo</div>
          <p style={{ color: "#cc0000", fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
            Note:- The size of the photograph should fall between 5KB to 100KB.
          </p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
            <div>
              {/* Row 61 — Photo: Mandatory */}
              <Field label="Upload School Land Photo" required error={errors.photo}>
                <input type="file" accept="image/*" onChange={handlePhotoChange}
                  style={{ fontSize: 13, fontFamily: "var(--font-main)", padding: "4px 0" }} />
              </Field>
            </div>
            {photoPreview && (
              <div style={{ width: 120, height: 90, border: "1px solid #cccccc", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
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