// ============================================================
//  src/sections/SchoolListPage.jsx
//  Design matches reference Scheme List UI exactly:
//  - Dark navy header row
//  - White/light alternating rows
//  - Search bar top right
//  - Rows per page dropdown bottom left
//  - Pagination bottom right
// ============================================================
import { useState, useEffect } from "react";
import { getAllSchools } from "../api/liferay";

export default function SchoolListPage({ onEdit }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setLoading(true);
    getAllSchools()
      .then(setSchools)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = schools.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.schoolName || "").toLowerCase().includes(q) ||
      (s.udiseCode || "").toLowerCase().includes(q) ||
      (s.address || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  // Generate page numbers to show
  const pageNums = [];
  for (let i = 1; i <= totalPages; i++) pageNums.push(i);

  return (
    <div style={{ padding: "24px 32px", fontFamily: "Arial, sans-serif" }}>

      {/* ── Title row ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>All Schools</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Total count badge */}
          <div style={{ background: "#1a2a5e", color: "#fff", padding: "6px 16px", borderRadius: 4, fontSize: 14, fontWeight: 500 }}>
            {filtered.length} Total Schools
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{ position: "relative", width: 320 }}>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search School Name..."
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 40px 8px 12px", fontSize: 13,
              border: "1px solid #ced4da", borderRadius: 4, outline: "none",
            }}
          />
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#1a7a8a", fontSize: 16 }}>🔍</span>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 14px", borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
          Failed to load schools — {error}
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ border: "1px solid #dee2e6", borderRadius: 4, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#1a2a5e" }}>
              {["School Name", "UDISE Code", "Address", "Trustee Name", "Email", "Mobile No", "Actions"].map((h) => (
                <th key={h} style={{
                  padding: "12px 16px", color: "#fff", fontWeight: 600,
                  textAlign: "left", fontSize: 13, borderRight: "1px solid #2d3d6e",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 13 }}>
                  Loading schools...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 13 }}>
                  No schools found
                </td>
              </tr>
            ) : (
              paged.map((school, idx) => (
                <tr
                  key={school.id}
                  style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8f9fa", borderBottom: "1px solid #dee2e6" }}
                >
                  <td style={{ padding: "12px 16px", color: "#333", fontWeight: 500 }}>
                    {school.schoolName || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>
                    {school.udiseCode || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>
                    {school.address || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>
                    {school.trusteeName || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>
                    {school.emailId || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>
                    {school.mobileNumberTrustee || school.mobileNumberSchool || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => onEdit(school.id)}
                      style={{
                        background: "#1a2a5e", color: "#fff",
                        border: "none", borderRadius: 4,
                        padding: "6px 16px", fontSize: 13,
                        cursor: "pointer", fontWeight: 500,
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                    >
                      ✎ Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: rows per page + pagination ── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13, color: "#555" }}>

          {/* Rows per page */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ padding: "4px 8px", border: "1px solid #ced4da", borderRadius: 4, fontSize: 13, cursor: "pointer" }}
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <PagBtn label="Previous" onClick={() => goTo(page - 1)} disabled={page === 1} />
            {pageNums.map((n) => (
              <PagBtn
                key={n}
                label={String(n)}
                onClick={() => goTo(n)}
                active={n === page}
              />
            ))}
            <PagBtn label="Next" onClick={() => goTo(page + 1)} disabled={page === totalPages} />
          </div>
        </div>
      )}
    </div>
  );
}

function PagBtn({ label, onClick, disabled, active }) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      style={{
        padding: "5px 12px", fontSize: 13, borderRadius: 4, cursor: disabled ? "default" : "pointer",
        border: "1px solid " + (active ? "#1a2a5e" : "#dee2e6"),
        background: active ? "#1a2a5e" : "#fff",
        color: active ? "#fff" : disabled ? "#aaa" : "#333",
        fontWeight: active ? 600 : 400,
      }}
    >{label}</button>
  );
}