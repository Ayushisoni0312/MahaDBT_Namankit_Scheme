// ============================================================
//  src/sections/UpdateGradingComments.jsx
//  ATC — Update Grading Comments (Search + inline Edit)
// ============================================================
import { useState, useEffect } from "react";
import { apiFetch, apiPatch } from "../api/liferay";

// ── API ───────────────────────────────────────────────────────
const searchSchools = (schoolName, udise) => {
  const filters = [];
  if (schoolName) filters.push(`contains(schoolName,'${schoolName}')`);
  if (udise)      filters.push(`udiseCode eq '${udise}'`);
  const query = filters.length
    ? `?filter=${encodeURIComponent(filters.join(" and "))}&pageSize=200&sort=schoolName:asc`
    : "?pageSize=200&sort=schoolName:asc";
  return apiFetch(`/o/c/namankitschoolprofiles${query}`).then((d) => d.items || []);
};

const updateRemarks = (id, remarks) =>
  apiPatch(`/o/c/namankitschoolprofiles/${id}`, { atcRemarks: remarks });

// ── Styles ────────────────────────────────────────────────────
const s = {
  page:      { padding: "20px 24px", fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#333", background: "#fff" },
  heading:   { fontSize: 18, fontWeight: 600, color: "#00897b", paddingBottom: 8, borderBottom: "2px solid #e8b400", marginBottom: 20, display: "inline-block" },
  label:     { display: "block", fontSize: 12, color: "#333", marginBottom: 4 },
  input:     { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none" },
  btnGreen:  { background: "#28a745", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnTeal:   { background: "#17a2b8", color: "#fff", border: "none", borderRadius: 3, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  btnSave:   { background: "#28a745", color: "#fff", border: "none", borderRadius: 3, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  btnCancel: { background: "#6c757d", color: "#fff", border: "none", borderRadius: 3, padding: "5px 14px", fontSize: 12, cursor: "pointer" },
  table:     { width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 20 },
  th:        { padding: "9px 12px", background: "#fff", border: "1px solid #dee2e6", fontWeight: 600, textAlign: "left", color: "#222" },
  td:        { padding: "8px 12px", border: "1px solid #dee2e6", color: "#333", verticalAlign: "top" },
  paginWrap: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13, padding: "12px 0 4px" },
  paginLeft: { display: "flex", alignItems: "center", gap: 10 },
  paginInput:{ width: 80, padding: "5px 8px", fontSize: 13, border: "1px solid #cccccc", borderRadius: 3, textAlign: "center" },
  btnNav:    (active) => ({ padding: "5px 14px", fontSize: 13, background: active ? "#1a3a5c" : "#fff", color: active ? "#fff" : "#333", border: "1px solid " + (active ? "#1a3a5c" : "#cccccc"), borderRadius: 3, cursor: active ? "pointer" : "not-allowed" }),
  alert:     { padding: "10px 14px", borderRadius: 3, fontSize: 13, marginBottom: 14 },
  err:       { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
  suc:       { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
  textarea:  { width: "100%", boxSizing: "border-box", border: "1px solid #17a2b8", borderRadius: 3, padding: "6px 10px", fontSize: 12, color: "#333", background: "#fff", outline: "none", resize: "vertical", minHeight: 60 },
};

const PAGE_SIZE = 10;

// ── Main Component ────────────────────────────────────────────
export default function UpdateGradingComments() {
  const [schoolName,  setSchoolName]  = useState("");
  const [udise,       setUdise]       = useState("");
  const [schools,     setSchools]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [searched,    setSearched]    = useState(false);
  const [alert,       setAlert]       = useState(null);
  const [page,        setPage]        = useState(1);
  // Edit state — key = school.id, value = current remarks string
  const [editId,      setEditId]      = useState(null);
  const [editRemarks, setEditRemarks] = useState("");
  const [saving,      setSaving]      = useState(false);

  // Load all on mount
  useEffect(() => {
    handleSearch(true);
  }, []);

  const handleSearch = async (initial = false) => {
    setLoading(true);
    setAlert(null);
    setPage(1);
    try {
      const data = await searchSchools(
        initial ? "" : schoolName,
        initial ? "" : udise
      );
      setSchools(data);
      setSearched(true);
      if (!initial && data.length === 0)
        setAlert({ type: "err", message: "No schools found matching your search." });
    } catch (e) {
      setAlert({ type: "err", message: "Search failed — " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (school) => {
    setEditId(school.id);
    setEditRemarks(school.atcRemarks || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditRemarks("");
  };

  const handleSave = async (school) => {
    setSaving(true);
    try {
      await updateRemarks(school.id, editRemarks);
      // Update locally
      setSchools((prev) =>
        prev.map((s) => s.id === school.id ? { ...s, atcRemarks: editRemarks } : s)
      );
      setEditId(null);
      setAlert({ type: "suc", message: `Remarks updated for ${school.schoolName}.` });
    } catch (e) {
      setAlert({ type: "err", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  const totalPages  = Math.max(1, Math.ceil(schools.length / PAGE_SIZE));
  const pageSchools = schools.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={s.page}>
      <div style={s.heading}>Update Grading Comments</div>

      {alert && (
        <div style={{ ...s.alert, ...s[alert.type] }}>
          {alert.message}
          <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
        </div>
      )}

      {/* Search filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px 18px", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <label style={s.label}>School Name</label>
          <input
            style={s.input}
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Search by school name"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div>
          <label style={s.label}>UDISE</label>
          <input
            style={s.input}
            value={udise}
            onChange={(e) => setUdise(e.target.value)}
            placeholder="Search by UDISE code"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div>
          <button style={{ ...s.btnGreen, padding: "7px 22px" }} onClick={() => handleSearch()} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: "#888", padding: "40px 0", textAlign: "center" }}>Loading...</div>
      ) : searched && (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: 80 }}>Edit</th>
                <th style={s.th}>UDISE</th>
                <th style={s.th}>School Name</th>
                <th style={s.th}>ATC Remarks</th>
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
                    <td style={s.td}>
                      {editId !== school.id ? (
                        <button style={s.btnTeal} onClick={() => startEdit(school)}>Edit</button>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <button style={s.btnSave} onClick={() => handleSave(school)} disabled={saving}>
                            {saving ? "…" : "Save"}
                          </button>
                          <button style={s.btnCancel} onClick={cancelEdit}>Cancel</button>
                        </div>
                      )}
                    </td>
                    <td style={s.td}>{school.udiseCode || "—"}</td>
                    <td style={s.td}>{school.schoolName || school.id}</td>
                    <td style={s.td}>
                      {editId === school.id ? (
                        <textarea
                          style={s.textarea}
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          placeholder="Enter ATC remarks..."
                        />
                      ) : (
                        <span style={{ color: school.atcRemarks ? "#333" : "#aaa" }}>
                          {school.atcRemarks || "No remarks yet"}
                        </span>
                      )}
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
              <button style={s.btnNav(page > 1)}          onClick={() => setPage(1)}            disabled={page === 1}>First</button>
              <button style={s.btnNav(page > 1)}          onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Previous</button>
              <button style={s.btnNav(page < totalPages)} onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next</button>
              <button style={s.btnNav(page < totalPages)} onClick={() => setPage(totalPages)}   disabled={page === totalPages}>Last</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}