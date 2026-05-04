// ============================================================
//  src/components/Pagination.jsx
//  Reusable pagination — used by every section with a table
//  Exact match: [Total Records N] [10] [Page: X of Y] [First][Previous][Next][Last]
// ============================================================

export default function Pagination({ total, pageSize, setPageSize, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const navBtn = (label, action, active) => (
    <button
      key={label}
      onClick={active ? action : undefined}
      style={{
        padding: "5px 14px",
        fontSize: 13,
        fontFamily: "var(--font-main)",
        fontWeight: 400,
        border: active ? "1px solid #1a7a8a" : "1px solid #cccccc",
        borderRadius: 3,
        background: active ? "#1a7a8a" : "#ffffff",
        color:      active ? "#ffffff"  : "#aaaaaa",
        cursor:     active ? "pointer"  : "default",
        lineHeight: "1.5",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0", fontSize: 13, color: "#333", flexWrap: "wrap", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span>Total Records <strong>{total}</strong></span>
        <input
          type="number" value={pageSize} min={1}
          onChange={(e) => { setPageSize(Number(e.target.value) || 10); setPage(1); }}
          style={{
            width: 55, height: 30, border: "1px solid #cccccc", borderRadius: 3,
            padding: "0 6px", fontSize: 13, color: "#333",
            fontFamily: "var(--font-main)", textAlign: "center",
          }}
        />
      </div>
      <span>Page: {page} of {totalPages}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {navBtn("First",    () => setPage(1),                               page > 1)}
        {navBtn("Previous", () => setPage(p => Math.max(1, p - 1)),         page > 1)}
        {navBtn("Next",     () => setPage(p => Math.min(totalPages, p + 1)),page < totalPages)}
        {navBtn("Last",     () => setPage(totalPages),                      page < totalPages)}
      </div>
    </div>
  );
}