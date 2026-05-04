// ============================================================
//  src/sections/ATCApprovalList.jsx
//  ATC School Approval List — shows schools with
//  "PO Recommended for Approval" status
// ============================================================
import { useEffect, useState } from "react";
import { getAllSchoolsForPO } from "../api/poGrading";
import ATCGrading from "./ATCGrading";

const TH = { padding: "12px 16px", background: "#1a2a5e", color: "#fff", fontWeight: 600, fontSize: 13, textAlign: "left", borderRight: "1px solid #2d3d6e", whiteSpace: "nowrap" };
const TD = { padding: "11px 16px", fontSize: 13, color: "#333", borderBottom: "1px solid #dee2e6", verticalAlign: "middle" };

const STATUS_BADGE = {
  "PO Recommended for Approval": { bg: "#d4edda", color: "#155724" },
  "ATC Recommended for Approval": { bg: "#cce5ff", color: "#004085" },
  "Rejected": { bg: "#f8d7da", color: "#721c24" },
  "SendBack": { bg: "#d1ecf1", color: "#0c5460" },
};

// Liferay returns picklist fields as { key, name } objects; normalise to string
const getStatus = (s) =>
  s.approvalStatus && typeof s.approvalStatus === "object"
    ? (s.approvalStatus.key || s.approvalStatus.name || "")
    : (s.approvalStatus === 'PO Recommended for Approval' ? s.approvalStatus : "PO Approval Pending");

export default function ATCApprovalList({ onGrading, onViewDetails, selectedSchool }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  console.log('selected School.....', selectedSchool);

  // const handleSearch = () => {
  //   setLoading(true);
  //   setError(null);
  //   getAllSchoolsForPO("")
  //     .then(all => {
  //       const filtered = all.filter(s => {
  //         const status = getStatus(s);
  //         return (
  //           status === "PO Recommended for Approval" ||
  //           status === "ATC Recommended for Approval" ||
  //           status === "SendBack"
  //         );
  //       });
  //       console.log('filtered=======>',filtered)
  //       setSchools(filtered);
  //     })
  //     .catch(e => setError(e.message))
  //     .finally(() => setLoading(false));
  // };

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    getAllSchoolsForPO("")
      .then(setSchools)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    console.log('schoolData====>', schools)

  }, [schools]
  )

  const filtered = schools.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.schoolName || "").toLowerCase().includes(q) ||
      (s.trusteeName || "").toLowerCase().includes(q) ||
      (s.udiseCode || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const badge = (status) => {
    const s = STATUS_BADGE[status] || { bg: "#e9ecef", color: "#555" };
    return (
      <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500 }}>
        {status || "—"}
      </span>
    );
  };

  return (
    <div>
      {
        selectedSchool ? (<div style={{ width: "100%" }}>
          <ATCGrading school={selectedSchool} />
        </div>) : (
          <div style={{ padding: "24px 32px" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>School Approval List</h2>

            {/* Filter row */}
            <div style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 4, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
              <button onClick={handleSearch}
                style={{ background: "#28a745", color: "#fff", border: "none", borderRadius: 4, padding: "8px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Search
              </button>
              <div style={{ marginLeft: "auto" }}>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name, UDISE..."
                  style={{ padding: "7px 12px", fontSize: 13, border: "1px solid #ced4da", borderRadius: 4, width: 260, outline: "none" }} />
              </div>
            </div>

            {error && (
              <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 14px", borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
                Failed to load — {error}
              </div>
            )}

            {/* Table */}
            <div style={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 4, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    {["Sr No", "UDISE", "Trustee Name", "School Name", "Approval Status", "Details", "Grading"].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ ...TD, textAlign: "center", color: "#888", padding: 40 }}>Loading...</td></tr>
                  ) : paged.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...TD, textAlign: "center", color: "#888", padding: 40 }}>
                      {schools.length === 0 ? "Click Search to load schools" : "No schools found"}
                    </td></tr>
                  ) : (
                    paged.map((school, idx) => (
                      <tr key={school.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td style={TD}>{(page - 1) * pageSize + idx + 1}</td>
                        <td style={TD}>{school.udiseCode || "—"}</td>
                        <td style={TD}>{school.trusteeName || "—"}</td>
                        <td style={{ ...TD, fontWeight: 500 }}>{school.schoolName || "—"}</td>
                        <td style={TD}>{badge(getStatus(school))}</td>
                        <td style={TD}>
                          <button onClick={() => onViewDetails?.(school.id)}
                            style={{ background: "#17a2b8", color: "#fff", border: "none", borderRadius: 4, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                            View Details
                          </button>
                        </td>
                        <td style={TD}>
                          {/* {(getStatus(school) === "PO Recommended for Approval" || getStatus(school) === "SendBack") ? ( */}
                          {school?.approvalStatus === 'PO Recommended for Approval' ? (
                            <button onClick={() => onGrading(school)}
                              style={{ background: "#1a2a5e", color: "#fff", border: "none", borderRadius: 4, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                              Grading
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#aaa" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 13, color: "#555" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Rows per page:</span>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    style={{ padding: "4px 8px", border: "1px solid #ced4da", borderRadius: 4, fontSize: 13 }}>
                    {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <PBtn label="Previous" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <PBtn key={n} label={String(n)} onClick={() => setPage(n)} active={n === page} />
                  ))}
                  <PBtn label="Next" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  );
}

function PBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={!disabled ? onClick : undefined} style={{
      padding: "5px 12px", fontSize: 13, borderRadius: 4, cursor: disabled ? "default" : "pointer",
      border: `1px solid ${active ? "#1a2a5e" : "#dee2e6"}`,
      background: active ? "#1a2a5e" : "#fff",
      color: active ? "#fff" : disabled ? "#aaa" : "#333",
      fontWeight: active ? 600 : 400,
    }}>{label}</button>
  );
}