// ============================================================
//  src/sections/ATCGrading.jsx
//  ATC Grading — same 28 questions as PO
//  PO Marks + PO Remarks = READ ONLY
//  ATC fills: ATC Marks, ATC Remarks, No. of Proposed Students
// ============================================================
import { useState, useEffect, useMemo } from "react";
import { getSchoolGrading, getGradingQuestions, submitGrading } from "../api/poGrading";
import { getSchoolProfileById } from "../api/liferay";

// ── Same 28 questions as POGrading ───────────────────────────
const QUESTIONS = [
  { no: 3, label: "Q.No. 3", title: "No. of year since establishment of School", maxMarks: 3, criteria: [{ label: ">=20", marks: 3 }, { label: "15 to 19", marks: 2 }, { label: "13 to 14.99", marks: 1 }, { label: "<13", marks: 0 }] },
  { no: 4, label: "Q.No. 4", title: "No. of female teachers", maxMarks: 3, criteria: [{ label: ">=25%", marks: 3 }, { label: "31% to 50%", marks: 1 }, { label: "<=30%", marks: 0 }] },
  { no: 5, label: "Q.No. 5", title: "Total number Of SSC batches completed", maxMarks: 5, criteria: [{ label: ">=10", marks: 5 }, { label: "7 to 9", marks: 4 }, { label: "5 to 6", marks: 3 }, { label: "3 to 4", marks: 2 }, { label: "<3", marks: 0 }] },
  { no: "6A", label: "Q.No. 6A", title: "Total students under Namankit scheme are less than or equal to 50% of total students", maxMarks: 10, criteria: [{ label: "less than or equal to 50%", marks: 10 }, { label: "equal to 50%", marks: 0 }] },
  { no: "6B", label: "Q.No. 6B", title: "Total residential students under Namankit scheme are less than or equal to 50% of total Residential students", maxMarks: 10, criteria: [{ label: "less than or equal to 50%", marks: 10 }, { label: "equal to 50%", marks: 0 }] },
  { no: 7, label: "Q.No. 7", title: "avg SSC results of last 3 years", maxMarks: 9, criteria: [{ label: ">=91%", marks: 9 }, { label: "81% to 90%", marks: 6 }, { label: "71% to 80%", marks: 2 }, { label: "<=70%", marks: 0 }] },
  { no: 8, label: "Q.No. 8", title: "avg HSC results of last 3 years", maxMarks: 7, criteria: [{ label: ">=91%", marks: 7 }, { label: "81% to 90%", marks: 4 }, { label: "71% to 80%", marks: 2 }, { label: "<=70%", marks: 0 }] },
  { no: 9, label: "Q.No. 9", title: "No. of students who successfully cleared NTS/NTM/other scholarship exams during last academic year", maxMarks: 2, criteria: [{ label: ">=10", marks: 2 }, { label: "5 to 9", marks: 1 }, { label: "1 to 4", marks: 0.5 }] },
  { no: "10A", label: "Q.No. 10A", title: "Total land area in rural(School+PlayGround+Hostel etc)", maxMarks: 5, criteria: [{ label: ">8", marks: 5 }, { label: "7.1 to 8", marks: 4 }, { label: "5.1 to 7", marks: 3 }, { label: "4 to 5", marks: 2 }, { label: "<4", marks: 0 }] },
  { no: 11, label: "Q.No. 11", title: "Does school have properly constructed compound wall and entrance", maxMarks: 2, criteria: [{ label: "Yes", marks: 2 }, { label: "No", marks: 0 }] },
  { no: 12, label: "Q.No. 12", title: "No Of sports facilities available", maxMarks: 5, criteria: [{ label: ">=7", marks: 5 }, { label: "5 to 6", marks: 3 }, { label: "4", marks: 1 }] },
  { no: 13, label: "Q.No. 13", title: "No. of computers in working condition (With Printers,Scanners,Internet,etc)", maxMarks: 4, criteria: [{ label: ">=50", marks: 4 }, { label: "35 to 49", marks: 3 }, { label: "20 to 34", marks: 2 }, { label: "0 to 19", marks: 0 }] },
  { no: 14, label: "Q.No. 14", title: "Total books available in school library", maxMarks: 3, criteria: [{ label: ">5 Per Student", marks: 3 }, { label: "3 to 4 Per Student", marks: 2 }, { label: "1 to 2 Per Student", marks: 1 }, { label: "< 1 Per Student", marks: 0 }] },
  { no: 15, label: "Q.No. 15", title: "No. Of digital Classroom", maxMarks: 3, criteria: [{ label: "4", marks: 3 }, { label: "3", marks: 2 }, { label: "2", marks: 1 }] },
  { no: 16, label: "Q.No. 16", title: "Does school have separate lab for Physics,chemistry and biology with lab Assistant", maxMarks: 3, criteria: [{ label: "Yes", marks: 3 }, { label: "No", marks: 0 }] },
  { no: 17, label: "Q.No. 17", title: "Availability of full time doctor and sick room", maxMarks: 3, criteria: [{ label: "Full Time", marks: 3 }, { label: "Part Time", marks: 1 }, { label: "Not Available", marks: 0 }] },
  { no: 18, label: "Q.No. 18", title: "No. of students Per teacher", maxMarks: 4, criteria: [{ label: "<=30", marks: 4 }, { label: ">30", marks: 2 }] },
  { no: 19, label: "Q.No. 19", title: "No. Of Qualified Sports Teacher count", maxMarks: 2, criteria: [{ label: ">=2", marks: 2 }, { label: "1", marks: 1 }, { label: "0", marks: 0 }] },
  { no: 20, label: "Q.No. 20", title: "Does school have separate teacher for music/arts/drawing", maxMarks: 2, criteria: [{ label: "Yes", marks: 2 }, { label: "No", marks: 0 }] },
  { no: 21, label: "Q.No. 21", title: "Availability of washing machine for student use", maxMarks: 2, criteria: [{ label: "Yes", marks: 2 }, { label: "No", marks: 0 }] },
  { no: 22, label: "Q.No. 22", title: "No. of female caretakers for students studying in class 1st to 4th", maxMarks: 3, criteria: [{ label: "1 to 15", marks: 3 }, { label: "16 to 30", marks: 2 }, { label: ">30", marks: 0 }] },
  { no: 23, label: "Q.No. 23", title: "Availability Of incinerator", maxMarks: 2, criteria: [{ label: "Yes", marks: 2 }, { label: "No", marks: 0 }] },
  { no: 24, label: "Q.No. 24", title: "No of toilets and bathrooms on each floor in Hostel(with ratio 20:1)", maxMarks: 2, criteria: [{ label: "Yes", marks: 2 }, { label: "No", marks: 0 }] },
  { no: 25, label: "Q.No. 25", title: "Residential teachers: Total student", maxMarks: 3, criteria: [{ label: "<500", marks: 2 }, { label: "1:200 and more", marks: 1 }] },
  { no: 26, label: "Q.No. 26", title: "Availability Of school website", maxMarks: 2, criteria: [{ label: "Yes", marks: 2 }, { label: "No", marks: 0 }] },
  { no: 27, label: "Q.No. 27", title: "No of toilets on each floor in school building(with ratio 20:1)", maxMarks: 2, criteria: [{ label: "Yes", marks: 2 }, { label: "No", marks: 0 }] },
  { no: 28, label: "Q.No. 28", title: "School academic performance", maxMarks: 3, criteria: [{ label: "Extraordinary", marks: 3 }, { label: "Excellent", marks: 2 }, { label: "Satisfactory", marks: 1 }] },
];


// Helper to convert stored numeric questionNumber back to QUESTIONS key
const toQNo = (n) => n === 61 ? '6A' : n === 62 ? '6B' : n === 101 ? '10A' : n;
const toNumeric = (n) => n === '6A' ? 61 : n === '6B' ? 62 : n === '10A' ? 101 : Number(n);

const getAssignedFees = (totalMarks) => {
  if (totalMarks >= 80) return 70000;
  if (totalMarks >= 70) return 60000;
  if (totalMarks >= 60) return 50000;
  return 0;
};
const TDD_FEES = 600;

const styles = {
  page: { padding: "20px 32px", background: "#f5f5f5", minHeight: "100vh" },
  card: { background: "#fff", border: "1px solid #dee2e6", borderRadius: 4, marginBottom: 16, overflow: "hidden" },
  cardHeader: { background: "#4a90d9", color: "#fff", padding: "10px 16px", fontSize: 14, fontWeight: 600 },
  cardBody: { padding: "14px 16px" },
  qCard: { border: "1px solid #dee2e6", borderRadius: 4, marginBottom: 16, overflow: "hidden", background: "#fff" },
  qNum: { background: "#5b9bd5", color: "#fff", width: 30, height: 30, borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, marginBottom: 8 },
  qTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fff", borderBottom: "1px solid #dee2e6" },
  qTitle: { fontSize: 14, fontWeight: 600, color: "#222" },
  marksTag: { background: "#e74c3c", color: "#fff", padding: "3px 12px", borderRadius: 3, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  criteriaHdr: { padding: "8px 12px", fontSize: 13, fontWeight: 500, color: "#2c3e50", background: "#d6eaf8", borderRight: "1px solid #aed6f1", flex: 1, textAlign: "left" },
  criteriaVal: { padding: "8px 12px", fontSize: 13, color: "#2c3e50", background: "#fff", borderRight: "1px solid #dee2e6", flex: 1, textAlign: "left" },
  sysRow: { background: "#e8f8f0", padding: "8px 14px", fontSize: 13, color: "#196f3d", display: "flex", gap: 40, borderTop: "1px solid #dee2e6" },
  label: { fontSize: 13, fontWeight: 600, color: "#333", display: "block", marginBottom: 4, marginTop: 8 },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 4, padding: "7px 10px", fontSize: 13, outline: "none" },
  inputGrey: { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 4, padding: "7px 10px", fontSize: 13, background: "#e9ecef", color: "#666" },
  textArea: { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 4, padding: "7px 10px", fontSize: 13, outline: "none", minHeight: 38, resize: "vertical" },
  btn: (bg, color = "#fff") => ({ background: bg, color, border: "none", borderRadius: 4, padding: "9px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }),
};

export default function ATCGrading({ school, onBack }) {
  const [schoolData, setSchoolData] = useState(null);
  const [gradingRecordId, setGradingRecordId] = useState(null);
  const [existingQs, setExistingQs] = useState([]);
  const [questionData, setQuestionData] = useState(
    QUESTIONS.map(q => ({ questionNumber: q.no, systemMarks: 0, poMarks: 0, atcMarks: 0, poRemarks: "", atcRemarks: "" }))
  );
  const [poRemarksSummary, setPoRemarksSummary] = useState("");
  const [atcRemarksSummary, setAtcRemarksSummary] = useState("");
  const [proposedStudents, setProposedStudents] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!school?.id) return;
    Promise.all([
      getSchoolProfileById(school.id),
      getSchoolGrading(school.id),
      getGradingQuestions(school.id),
    ]).then(([profile, grading, qRecords]) => {
      if (profile) setSchoolData(profile);
      if (grading) {
        setGradingRecordId(grading.id);
        setPoRemarksSummary(grading.poRemarksSummary || "");
        setAtcRemarksSummary(grading.atcRemarksSummary || "");
        setProposedStudents(grading.proposedStudents || "");
      }
      if (qRecords.length > 0) {
        setExistingQs(qRecords);
        setQuestionData(QUESTIONS.map(q => {
          const rec = qRecords.find(r => r.questionNumber === toNumeric(q.no) || r.questionNumber === q.no);
          return {
            questionNumber: q.no,
            systemMarks: rec?.systemMarks || 0,
            poMarks: rec?.poMarks || 0,
            atcMarks: rec?.atcMarks || 0,
            poRemarks: rec?.poRemarks || "",
            atcRemarks: rec?.atcRemarks || "",
          };
        }));
      }
    }).catch(err => console.error("[ATCGrading] load error:", err))
      .finally(() => setLoadingData(false));
  }, [school?.id]);

  // ATC total = sum of atcMarks
  const totalMarks = useMemo(() => questionData.reduce((s, q) => s + (parseFloat(q.atcMarks) || 0), 0), [questionData]);
  const assignedFees = useMemo(() => getAssignedFees(totalMarks), [totalMarks]);
  const finalFees = assignedFees + TDD_FEES;

  const updateQ = (idx, field, value) => {
    setQuestionData(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleSubmit = async (approvalStatus) => {
    if (atcRemarksSummary.trim().length < 100) {
      setAlert({ type: "error", message: `ATC Remarks Summary must be at least 100 characters. Currently ${atcRemarksSummary.trim().length} characters.` });
      window.scrollTo({ top: document.body.scrollHeight - 800, behavior: "smooth" });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      // Update grading record with ATC data
      const { patchSchoolGrading, patchGradingQuestion, updateApprovalStatus } = await import("../api/poGrading");

      // Sanitize marks to ensure none exceed question max before saving
      const sanitizedQuestions = questionData.map(q => {
        const def = QUESTIONS.find(d => d.no === q.questionNumber || toNumeric(d.no) === q.questionNumber);
        const max = def?.maxMarks ?? Infinity;
        const marks = Math.min(Number(q.atcMarks) || 0, max);
        return { ...q, atcMarks: marks };
      });

      const sanitizedTotal = sanitizedQuestions.reduce((s, q) => s + (Number(q.atcMarks) || 0), 0);
      const sanitizedAssignedFees = getAssignedFees(sanitizedTotal);
      const sanitizedFinalFees = sanitizedAssignedFees + TDD_FEES;

      // Update main grading record using sanitized totals
      await patchSchoolGrading(gradingRecordId, {
        atcRemarksSummary,
        proposedStudents: Number(proposedStudents) || 0,
        totalMarks: sanitizedTotal,
        assignedFees: sanitizedAssignedFees,
        tddFees: TDD_FEES,
        finalFees: sanitizedFinalFees,
        approvalStatus,
      });

      // Update each question's atcMarks and atcRemarks with sanitized marks
      for (const q of sanitizedQuestions) {
        const existing = existingQs.find(eq => eq.questionNumber === toNumeric(q.questionNumber) || eq.questionNumber === q.questionNumber);
        if (existing) {
          await patchGradingQuestion(existing.id, {
            atcMarks: q.atcMarks || 0,
            atcRemarks: q.atcRemarks || "",
          });
        }
      }

      // Update approval status on school profile
      await updateApprovalStatus(school.id, approvalStatus);

      setAlert({ type: "success", message: `School ${approvalStatus} successfully!` });
      setTimeout(() => onBack?.(), 1500);
    } catch (e) {
      setAlert({ type: "error", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <div style={{ textAlign: "center", padding: 60, fontSize: 14, color: "#888" }}>Loading grading data...</div>;

  return (
    <div style={styles.page}>
      <button onClick={onBack} style={{ ...styles.btn("#6c757d"), marginBottom: 16 }}>← Back to List</button>

      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: "#1a2a5e" }}>School Profile Grading</h2>

      {alert && (
        <div style={{ background: alert.type === "success" ? "#d4edda" : "#f8d7da", color: alert.type === "success" ? "#155724" : "#721c24", border: `1px solid ${alert.type === "success" ? "#c3e6cb" : "#f5c6cb"}`, padding: "10px 14px", borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
          {alert.message}
        </div>
      )}

      {/* School Details */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>School Details</div>
        <div style={{ ...styles.cardBody, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[["Trustee Name", schoolData?.trusteeName], ["School Name", schoolData?.schoolName], ["Address", schoolData?.address]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>{val || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PO Remarks Summary — blue header, grey non-editable like 1.0 */}
      <div style={styles.card}>
        <div style={{ ...styles.cardHeader, background: "#4a90d9" }}>PO Remarks Summary (min 100 characters length required)</div>
        <div style={styles.cardBody}>
          <textarea value={poRemarksSummary} readOnly
            style={{ ...styles.textArea, minHeight: 60, background: "#e9ecef", color: "#555", cursor: "not-allowed" }} />
        </div>
      </div>

      {/* Profile Related Questions */}
      <div style={{ ...styles.card, padding: "12px 16px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1a2a5e", marginBottom: 12 }}>Profile related questions</div>

        {QUESTIONS.map((q, idx) => (
          <div key={q.no} style={styles.qCard}>
            <div style={{ padding: "10px 14px 0" }}>
              <div style={styles.qNum}>{q.no}</div>
            </div>
            <div style={styles.qTitleRow}>
              <span style={styles.qTitle}>{q.label} : {q.title}</span>
              <span style={styles.marksTag}>Marks : {q.maxMarks}.00</span>
            </div>
            {/* Criteria headers */}
            <div style={{ display: "flex", borderBottom: "1px solid #dee2e6" }}>
              {q.criteria.map((c, ci) => (
                <div key={ci} style={{ ...styles.criteriaHdr, borderRight: ci < q.criteria.length - 1 ? "1px solid #aed6f1" : "none" }}>{c.label}</div>
              ))}
            </div>
            {/* Criteria values */}
            <div style={{ display: "flex", borderBottom: "1px solid #dee2e6" }}>
              {q.criteria.map((c, ci) => (
                <div key={ci} style={{ ...styles.criteriaVal, borderRight: ci < q.criteria.length - 1 ? "1px solid #dee2e6" : "none" }}>{c.marks.toFixed(2)}</div>
              ))}
            </div>
            {/* System evaluated */}
            <div style={styles.sysRow}>
              <span>System Evaluated Value</span>
              <span>Marks Obtained(System Evaluated) : <strong>{(questionData[idx]?.systemMarks || 0).toFixed(2)}</strong></span>
            </div>
            {/* Input fields */}
            <div style={{ padding: "10px 14px" }}>
              {/* ATC Marks — editable, max 400px like 1.0 */}
              <div style={{ marginBottom: 8 }}>
                <label style={styles.label}>Marks Obtained(ATC Evaluation) *</label>
                <input type="number" step="0.01" min="0" max={q.maxMarks}
                  value={questionData[idx]?.atcMarks ?? ""}
                  onChange={e => {
                    const raw = e.target.value;
                    if (raw === "") {
                      updateQ(idx, "atcMarks", "");
                      return;
                    }
                    let num = parseFloat(raw);
                    if (isNaN(num)) num = 0;
                    // clamp immediately so value never exceeds max
                    if (num > q.maxMarks) {
                      num = q.maxMarks;
                      setAlert({ type: "error", message: `Marks cannot exceed ${q.maxMarks} for ${q.label}` });
                      setTimeout(() => setAlert(null), 2500);
                    }
                    updateQ(idx, "atcMarks", num);
                  }}
                  onBlur={e => {
                    const raw = e.target.value;
                    if (raw === "") return;
                    let num = parseFloat(raw);
                    if (isNaN(num)) num = 0;
                    if (num > q.maxMarks) {
                      updateQ(idx, "atcMarks", q.maxMarks);
                      setAlert({ type: "error", message: `Marks cannot exceed ${q.maxMarks} for ${q.label}` });
                      setTimeout(() => setAlert(null), 2500);
                    } else if (num < 0) {
                      updateQ(idx, "atcMarks", 0);
                    }
                  }}
                  style={{ ...styles.input, maxWidth: 400 }}
                />
              </div>
              {/* PO Remarks — full width, grey non-editable */}
              <div style={{ marginBottom: 8 }}>
                <label style={styles.label}>PO Remarks *</label>
                <input value={questionData[idx]?.poRemarks || ""} readOnly
                  style={{ ...styles.inputGrey, cursor: "not-allowed" }} />
              </div>
              {/* ATC Remarks — full width, editable */}
              <div>
                <label style={styles.label}>ATC Remarks *</label>
                <input value={questionData[idx]?.atcRemarks || ""}
                  onChange={e => updateQ(idx, "atcRemarks", e.target.value)}
                  style={styles.input} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ATC Remarks Summary — blue header, editable like 1.0 */}
      <div style={styles.card}>
        <div style={{ ...styles.cardHeader, background: "#4a90d9" }}>
          ATC Remarks Summary (min 100 characters length required) <span style={{ color: "#ff6b6b" }}>*</span>
        </div>
        <div style={styles.cardBody}>
          <textarea value={atcRemarksSummary} onChange={e => setAtcRemarksSummary(e.target.value)}
            placeholder="Enter detailed ATC remarks (minimum 100 characters)..."
            style={{ ...styles.textArea, minHeight: 80 }} />
          <div style={{ fontSize: 12, color: atcRemarksSummary.length < 100 ? "#e74c3c" : "#28a745", marginTop: 4 }}>
            {atcRemarksSummary.length} / 100 characters minimum
          </div>
        </div>
      </div>

      {/* No. of Proposed Students — blue header like 1.0 */}
      <div style={styles.card}>
        <div style={{ ...styles.cardHeader, background: "#4a90d9" }}>
          No. of Proposed Students(Applicable only when Approved)
        </div>
        <div style={styles.cardBody}>
          <input type="number" min="0" value={proposedStudents}
            onChange={e => setProposedStudents(e.target.value)}
            style={styles.input} />
        </div>
      </div>

      {/* Totals — 2x2 grid with grey readonly inputs like 1.0 */}
      <div style={{ ...styles.card, marginBottom: 16 }}>
        <div style={{ ...styles.cardBody, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={styles.label}>Total Marks</label>
            <input readOnly value={totalMarks.toFixed(2)} style={styles.inputGrey} />
          </div>
          <div>
            <label style={styles.label}>Assigned Fees</label>
            <input readOnly value={assignedFees > 0 ? assignedFees.toFixed(2) : "50000"} style={styles.inputGrey} />
          </div>
          <div>
            <label style={styles.label}>TDD Fees</label>
            <input readOnly value={TDD_FEES.toFixed(2)} style={styles.inputGrey} />
          </div>
          <div>
            <label style={styles.label}>Final Fees</label>
            <input readOnly value={assignedFees > 0 ? finalFees.toFixed(2) : TDD_FEES.toFixed(2)} style={styles.inputGrey} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button onClick={() => handleSubmit("ATC Recommended for Approval")} disabled={saving} style={styles.btn("#28a745")}>
          {saving ? "Saving..." : "Approve"}
        </button>
        <button onClick={() => handleSubmit("Rejected")} disabled={saving} style={styles.btn("#dc3545")}>Reject</button>
        <button onClick={() => handleSubmit("SendBack")} disabled={saving} style={styles.btn("#ffc107", "#333")}>Send Back</button>
        <button onClick={onBack} style={styles.btn("#6c757d")}>Cancel</button>
      </div>

      {/* Important Note */}
      <div style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 4, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ color: "#e74c3c", fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Important Note !!!</div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#555", lineHeight: 1.8 }}>
          <li><strong>Approve</strong> : School will be approved and enrolment of new students is proposed.</li>
          <li><strong>Reject</strong> : School will be rejected and new students enrolment in the school is not proposed.</li>
          <li><strong>Cancel</strong> : School is proposed to be cancelled and existing students are proposed to be shifted to other schools.</li>
        </ul>
      </div>

      {/* Fees Structure */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Based on Marks Fees Structure</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                {["Fees", "Min Marks", "Max Marks"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", border: "1px solid #dee2e6", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[["₹70,000", "80.00", "100.00"], ["₹60,000", "70.00", "79.99"], ["₹50,000", "60.00", "69.99"], ["Not Eligible", "0.00", "59.99"]].map(([fees, min, max]) => (
                <tr key={fees}>
                  {[fees, min, max].map((v, i) => <td key={i} style={{ padding: "8px 12px", border: "1px solid #dee2e6" }}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}