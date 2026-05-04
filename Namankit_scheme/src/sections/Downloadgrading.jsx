// ============================================================
//  src/sections/DownloadGrading.jsx
//  ATC — Download Grading Report (PDF per school)
// ============================================================
import { useState, useEffect } from "react";
import { apiFetch } from "../api/liferay";

// ── API ───────────────────────────────────────────────────────
const getGradingSchools = () =>
  apiFetch(
    "/o/c/namankitschoolprofiles?pageSize=200&sort=dateCreated:desc" +
    "&fields=id,schoolName,udiseCode,approvalStatus,atcMarks,poMarks,systemCalculatedMarks,assignedFees,finalFees"
  ).then((d) => d.items || []);

// ── Styles ────────────────────────────────────────────────────
const s = {
  page:     { padding: "20px 24px", fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#333", background: "#fff" },
  heading:  { fontSize: 18, fontWeight: 600, color: "#00897b", paddingBottom: 8, borderBottom: "2px solid #e8b400", marginBottom: 20, display: "inline-block" },
  table:    { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:       { padding: "9px 12px", background: "#fff", border: "1px solid #dee2e6", fontWeight: 600, textAlign: "left", color: "#222" },
  td:       { padding: "8px 12px", border: "1px solid #dee2e6", color: "#333", verticalAlign: "middle" },
  btnPDF:   { background: "#17a2b8", color: "#fff", border: "none", borderRadius: 3, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  paginWrap:{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13, padding: "12px 0 4px" },
  paginLeft:{ display: "flex", alignItems: "center", gap: 10 },
  paginInput:{ width: 80, padding: "5px 8px", fontSize: 13, border: "1px solid #cccccc", borderRadius: 3, textAlign: "center" },
  btnNav:   (active) => ({ padding: "5px 14px", fontSize: 13, background: active ? "#1a3a5c" : "#fff", color: active ? "#fff" : "#333", border: "1px solid " + (active ? "#1a3a5c" : "#cccccc"), borderRadius: 3, cursor: active ? "pointer" : "not-allowed" }),
  badge:    (status) => {
    const map = {
      "PO recommended for approval": { bg: "#fff3cd", color: "#856404" },
      "ATC approved":                 { bg: "#d4edda", color: "#155724" },
      "SL approved":                  { bg: "#cce5ff", color: "#004085" },
      "Rejected":                     { bg: "#f8d7da", color: "#721c24" },
    };
    const m = map[status] || { bg: "#e9ecef", color: "#495057" };
    return { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: m.bg, color: m.color };
  },
  alert:    { padding: "10px 14px", borderRadius: 3, fontSize: 13, marginBottom: 14 },
  err:      { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
};

const PAGE_SIZE = 10;

// ── PDF Generator ─────────────────────────────────────────────
function generateGradingPDF(school) {
  const w = window.open("", "_blank");
  w.document.write(`
    <html>
      <head>
        <title>Grading Report — ${school.schoolName}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; padding: 24px; }
          h2   { color: #1a2a5e; border-bottom: 2px solid #e8b400; padding-bottom: 6px; }
          table{ width: 100%; border-collapse: collapse; margin-top: 16px; }
          th,td{ border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; }
          th   { background: #f8f9fa; font-weight: 600; }
          .val { font-weight: 700; color: #1a2a5e; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h2>Grading Report</h2>
        <p><strong>School:</strong> ${school.schoolName || "—"}</p>
        <p><strong>UDISE:</strong> ${school.udiseCode || "—"}</p>
        <p><strong>Status:</strong> ${school.approvalStatus || "—"}</p>
        <table>
          <tr><th>Field</th><th>Value</th></tr>
          <tr><td>System Calculated Marks</td><td class="val">${school.systemCalculatedMarks ?? "—"}</td></tr>
          <tr><td>PO Marks</td><td class="val">${school.poMarks ?? "—"}</td></tr>
          <tr><td>ATC Marks</td><td class="val">${school.atcMarks ?? "—"}</td></tr>
          <tr><td>Assigned Fees</td><td class="val">${school.assignedFees ? "₹" + Number(school.assignedFees).toLocaleString() : "—"}</td></tr>
          <tr><td>Final Fees</td><td class="val">${school.finalFees ? "₹" + Number(school.finalFees).toLocaleString() : "—"}</td></tr>
        </table>
        <br/>
        <button onclick="window.print()">Print / Save as PDF</button>
      </body>
    </html>
  `);
  w.document.close();
  w.focus();
}

// ── Main Component ────────────────────────────────────────────
export default function DownloadGrading() {
  const [schools,  setSchools]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [alert,    setAlert]    = useState(null);
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    setLoading(true);
    getGradingSchools()
      .then(setSchools)
      .catch((e) => setAlert({ type: "err", message: "Failed to load — " + e.message }))
      .finally(() => setLoading(false));
  }, []);

  const totalPages  = Math.max(1, Math.ceil(schools.length / PAGE_SIZE));
  const pageSchools = schools.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={s.page}>
      <div style={s.heading}>Download Grading</div>

      {alert && (
        <div style={{ ...s.alert, ...s[alert.type] }}>
          {alert.message}
          <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#888", padding: "40px 0", textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>School</th>
                <th style={s.th}>UDISE</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Export</th>
              </tr>
            </thead>
            <tbody>
              {pageSchools.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...s.td, textAlign: "center", color: "#aaa" }}>No records found.</td>
                </tr>
              ) : (
                pageSchools.map((school) => (
                  <tr key={school.id}>
                    <td style={s.td}>{school.schoolName || school.id}</td>
                    <td style={s.td}>{school.udiseCode || "—"}</td>
                    <td style={s.td}>
                      <span style={s.badge(school.approvalStatus)}>
                        {school.approvalStatus || "Pending"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button style={s.btnPDF} onClick={() => generateGradingPDF(school)}>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={s.paginWrap}>
            <div style={s.paginLeft}>
              <span><strong>Total Records</strong> {schools.length}</span>
              <input type="text" defaultValue={PAGE_SIZE} style={s.paginInput} readOnly />
            </div>
            <div>Page: {page} of {totalPages}</div>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={s.btnNav(page > 1)}         onClick={() => setPage(1)}           disabled={page === 1}>First</button>
              <button style={s.btnNav(page > 1)}         onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Previous</button>
              <button style={s.btnNav(page < totalPages)} onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next</button>
              <button style={s.btnNav(page < totalPages)} onClick={() => setPage(totalPages)}   disabled={page === totalPages}>Last</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}