// ============================================================
//  src/sections/SchoolIntake.jsx
//  Validations added:
//  - All 8 input cells are mandatory + numeric (Excel rows 21–28)
//  - Auto-calculated totals (rows 29–35) shown read-only
// ============================================================
import { TextInput, SectionHeading } from "../components/FormFields";

const th = (extra = {}) => ({
  padding: "9px 10px",
  background: "#f8f9fa",
  borderBottom: "1px solid #dee2e6",
  borderRight: "1px solid #dee2e6",
  fontSize: 13,
  fontWeight: 600,
  color: "#333",
  textAlign: "left",
  ...extra,
});

const td = (extra = {}) => ({
  padding: "7px 10px",
  borderBottom: "1px solid #dee2e6",
  borderRight: "1px solid #dee2e6",
  fontSize: 13,
  color: "#333",
  ...extra,
});

const errStyle = {
  color: "#c0392b", fontSize: 11, marginTop: 2, display: "block",
};

const toNum = (v) => parseInt(v || 0, 10);

export default function SchoolIntake({ intake, setIntake, errors = {} }) {
  const set = (key) => (val) =>
    setIntake((prev) => ({ ...prev, [key]: val }));

  // ── Auto-calculated totals (rows 29–35) ──────────────────
  const namankit_res_boys    = toNum(intake.namankit_boys_residential);
  const namankit_nonres_boys = toNum(intake.namankit_boys_nonresidential);
  const other_res_boys       = toNum(intake.other_boys_residential);
  const other_nonres_boys    = toNum(intake.other_boys_nonresidential);
  const namankit_res_girls    = toNum(intake.namankit_girls_residential);
  const namankit_nonres_girls = toNum(intake.namankit_girls_nonresidential);
  const other_res_girls       = toNum(intake.other_girls_residential);
  const other_nonres_girls    = toNum(intake.other_girls_nonresidential);

  // Row 29 — Total Boys under Namankit (Res + Non-Res)
  const total_namankit_boys = namankit_res_boys + namankit_nonres_boys;
  // Row 30 — Total Girls under Namankit (Res + Non-Res)
  const total_namankit_girls = namankit_res_girls + namankit_nonres_girls;
  // Row 31 — Total Boys not under Namankit (Res + Non-Res)
  const total_other_boys = other_res_boys + other_nonres_boys;
  // Row 32 — Total Girls not under Namankit (Res + Non-Res)
  const total_other_girls = other_res_girls + other_nonres_girls;
  // Row 33 — Total Boys
  const total_boys = total_namankit_boys + total_other_boys;
  // Row 34 — Total Girls
  const total_girls = total_namankit_girls + total_other_girls;
  // Row 35 — Total Students
  const grand_total = total_boys + total_girls;

  const col_namankit_res    = namankit_res_boys    + namankit_res_girls;
  const col_namankit_nonres = namankit_nonres_boys + namankit_nonres_girls;
  const col_other_res       = other_res_boys       + other_res_girls;
  const col_other_nonres    = other_nonres_boys    + other_nonres_girls;

  // Helper: input cell with error
  const InputCell = ({ fieldKey }) => (
    <td style={td({ verticalAlign: "top" })}>
      <TextInput
        value={intake[fieldKey]}
        onChange={set(fieldKey)}
        type="number"
        hasError={!!errors[fieldKey]}
      />
      {errors[fieldKey] && (
        <span style={errStyle}>{errors[fieldKey]}</span>
      )}
    </td>
  );

  return (
    <div style={{ marginTop: 28 }}>
      <SectionHeading title="School Intake" />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #dee2e6", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th({ width: 60 })}></th>
              <th style={th({ textAlign: "center" })} colSpan={2}>
                Total Students Under Namankit Scheme
              </th>
              <th style={th({ textAlign: "center" })} colSpan={2}>
                Total Students Except Namankit Scheme
              </th>
              <th style={th({ textAlign: "center", borderRight: "none" })}>
                Total
              </th>
            </tr>
            <tr>
              <th style={th()}></th>
              <th style={th()}>Residential <span style={{ color: "#c0392b" }}>*</span></th>
              <th style={th()}>Non-residential <span style={{ color: "#c0392b" }}>*</span></th>
              <th style={th()}>Residential <span style={{ color: "#c0392b" }}>*</span></th>
              <th style={th()}>Non-residential <span style={{ color: "#c0392b" }}>*</span></th>
              <th style={th({ borderRight: "none" })}></th>
            </tr>
          </thead>
          <tbody>
            {/* Boys row */}
            <tr>
              <td style={td({ fontWeight: 600 })}>Boys</td>
              <InputCell fieldKey="namankit_boys_residential" />
              <InputCell fieldKey="namankit_boys_nonresidential" />
              <InputCell fieldKey="other_boys_residential" />
              <InputCell fieldKey="other_boys_nonresidential" />
              <td style={td({ background: "#f5f5f5", fontWeight: 600, borderRight: "none" })}>
                {total_boys}
              </td>
            </tr>
            {/* Girls row */}
            <tr>
              <td style={td({ fontWeight: 600 })}>Girls</td>
              <InputCell fieldKey="namankit_girls_residential" />
              <InputCell fieldKey="namankit_girls_nonresidential" />
              <InputCell fieldKey="other_girls_residential" />
              <InputCell fieldKey="other_girls_nonresidential" />
              <td style={td({ background: "#f5f5f5", fontWeight: 600, borderRight: "none" })}>
                {total_girls}
              </td>
            </tr>
            {/* Auto-calculated total row */}
            <tr style={{ background: "#f0f4f8" }}>
              <td style={td({ fontWeight: 600 })}>Total</td>
              <td style={td({ fontWeight: 600 })}>{col_namankit_res}</td>
              <td style={td({ fontWeight: 600 })}>{col_namankit_nonres}</td>
              <td style={td({ fontWeight: 600 })}>{col_other_res}</td>
              <td style={td({ fontWeight: 600 })}>{col_other_nonres}</td>
              <td style={td({ fontWeight: 700, color: "#1a6070", background: "#e8f4f8", borderRight: "none" })}>
                {grand_total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Auto-calculated summary (rows 29–35) */}
      <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 3, fontSize: 13 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: "#333" }}>Auto-Calculated Totals</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 24px" }}>
          <div>Total Boys under Namankit: <strong>{total_namankit_boys}</strong></div>
          <div>Total Girls under Namankit: <strong>{total_namankit_girls}</strong></div>
          <div>Total Boys not under Namankit: <strong>{total_other_boys}</strong></div>
          <div>Total Girls not under Namankit: <strong>{total_other_girls}</strong></div>
          <div>Total Boys: <strong>{total_boys}</strong></div>
          <div>Total Girls: <strong>{total_girls}</strong></div>
          <div style={{ gridColumn: "span 3", fontWeight: 700, color: "#1a6070", fontSize: 14 }}>
            Total Students: {grand_total}
          </div>
        </div>
      </div>
    </div>
  );
}