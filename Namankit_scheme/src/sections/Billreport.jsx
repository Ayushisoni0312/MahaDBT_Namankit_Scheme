// ============================================================
//  src/sections/BillReport.jsx
//  Controller — Bill Report
//  Fetches bills from billgenerations filtered by transaction
// ============================================================
import { useState, useEffect } from "react";
import { apiFetch } from "../api/liferay";

// ── API ───────────────────────────────────────────────────────
const getTransactions = () =>
  apiFetch("/o/c/transactionmasters?pageSize=200&sort=dateCreated:desc")
    .then((d) => d.items || []);

const getBillsByTransaction = (transactionId) =>
  apiFetch(
    `/o/c/billgenerations?filter=transactionId eq ${transactionId}&pageSize=200&sort=dateCreated:desc`
  ).then((d) => d.items || []);

// ── Styles ────────────────────────────────────────────────────
const s = {
  page:       { padding: "20px 24px", fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#333", background: "#fff" },
  heading:    { fontSize: 18, fontWeight: 600, color: "#222", paddingBottom: 10, borderBottom: "1px solid #ddd", marginBottom: 20 },
  label:      { display: "block", fontSize: 13, color: "#333", marginBottom: 4, fontWeight: 500 },
  req:        { color: "#e53935", marginLeft: 2 },
  select:     { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none", cursor: "pointer" },
  btnOrange:  { background: "#fd7e14", color: "#fff", border: "none", borderRadius: 3, padding: "7px 22px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnExcel:   { background: "#28a745", color: "#fff", border: "none", borderRadius: 3, padding: "7px 22px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnPDF:     { background: "#17a2b8", color: "#fff", border: "none", borderRadius: 3, padding: "7px 22px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  table:      { width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 20 },
  th:         { padding: "9px 12px", background: "#fff", border: "1px solid #dee2e6", fontWeight: 600, textAlign: "left", color: "#222" },
  td:         { padding: "8px 12px", border: "1px solid #dee2e6", color: "#333", verticalAlign: "middle" },
  alert:      { padding: "10px 14px", borderRadius: 3, fontSize: 13, marginBottom: 14 },
  err:        { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
  suc:        { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
  badge:      (status) => {
    const map = {
      "Uploaded":   { bg: "#d4edda", color: "#155724" },
      "Cancelled":  { bg: "#f8d7da", color: "#721c24" },
      "Generated":  { bg: "#fff3cd", color: "#856404" },
      "Draft":      { bg: "#e9ecef", color: "#495057" },
    };
    const m = map[status] || { bg: "#e9ecef", color: "#495057" };
    return { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: m.bg, color: m.color };
  },
  paginWrap:  { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13, padding: "12px 0 4px" },
  paginLeft:  { display: "flex", alignItems: "center", gap: 10 },
  paginInput: { width: 80, padding: "5px 8px", fontSize: 13, border: "1px solid #cccccc", borderRadius: 3, textAlign: "center" },
  btnNav:     (active) => ({ padding: "5px 14px", fontSize: 13, background: active ? "#1a3a5c" : "#fff", color: active ? "#fff" : "#333", border: "1px solid " + (active ? "#1a3a5c" : "#cccccc"), borderRadius: 3, cursor: active ? "pointer" : "not-allowed" }),
  summaryCard:{ background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 6, padding: "16px 20px", marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 24px" },
  summaryItem:{ display: "flex", flexDirection: "column", gap: 4 },
  summaryLabel:{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryVal: { fontSize: 18, fontWeight: 700, color: "#1a2a5e" },
};

const PAGE_SIZE = 10;

// ── Format helpers ────────────────────────────────────────────
const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtAmt = (v) =>
  v != null ? "₹" + Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—";

// ── Excel export ──────────────────────────────────────────────
function exportToExcel(bills, txnName) {
  const headers = ["Sr No", "PO", "School", "Bill Date", "Total Students", "Total Fees", "Final Total Fees", "Status"];
  const rows    = bills.map((b, i) => [
    i + 1, b.po, b.schoolId, fmtDate(b.billDate),
    b.totalStudentCount, b.totalFees, b.finalTotalFees,
    b.bill_status || "Generated",
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `bill-report-${txnName || "export"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF export ────────────────────────────────────────────────
function exportToPDF(bills, txnName, totalAmt) {
  const w = window.open("", "_blank");
  const rows = bills.map((b, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${b.po || "—"}</td>
      <td>${b.schoolId || "—"}</td>
      <td>${fmtDate(b.billDate)}</td>
      <td>${b.totalStudentCount || "—"}</td>
      <td>${fmtAmt(b.totalFees)}</td>
      <td>${fmtAmt(b.finalTotalFees)}</td>
      <td>${b.bill_status || "Generated"}</td>
    </tr>
  `).join("");

  w.document.write(`
    <html>
      <head>
        <title>Bill Report — ${txnName}</title>
        <style>
          body  { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; }
          h2    { color: #1a2a5e; border-bottom: 2px solid #e8b400; padding-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th,td { border: 1px solid #dee2e6; padding: 7px 10px; text-align: left; }
          th    { background: #f8f9fa; font-weight: 600; }
          .total{ font-weight: 700; color: #e53935; font-size: 14px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h2>Bill Report</h2>
        <p><strong>Transaction:</strong> ${txnName}</p>
        <p><strong>Total Bills:</strong> ${bills.length} &nbsp;&nbsp;
           <strong>Grand Total:</strong> <span class="total">${fmtAmt(totalAmt)}</span></p>
        <table>
          <thead>
            <tr>
              <th>Sr No</th><th>PO</th><th>School</th><th>Bill Date</th>
              <th>Students</th><th>Total Fees</th><th>Final Fees</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
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
export default function BillReport() {
  const [transactions,  setTransactions]  = useState([]);
  const [transaction,   setTransaction]   = useState("");
  const [bills,         setBills]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [loadingTxn,    setLoadingTxn]    = useState(true);
  const [searched,      setSearched]      = useState(false);
  const [alert,         setAlert]         = useState(null);
  const [page,          setPage]          = useState(1);

  // Load transactions on mount
  useEffect(() => {
    setLoadingTxn(true);
    getTransactions()
      .then(setTransactions)
      .catch((e) => setAlert({ type: "err", message: "Failed to load transactions — " + e.message }))
      .finally(() => setLoadingTxn(false));
  }, []);

  const handleGetReport = async () => {
    if (!transaction) {
      setAlert({ type: "err", message: "Please select a Transaction." }); return;
    }
    setLoading(true); setAlert(null); setPage(1);
    try {
      const data = await getBillsByTransaction(transaction);
      setBills(data);
      setSearched(true);
      if (data.length === 0)
        setAlert({ type: "err", message: "No bills found for selected transaction." });
    } catch (e) {
      setAlert({ type: "err", message: "Failed to get report — " + e.message });
    } finally {
      setLoading(false);
    }
  };

  // Summary calculations
  const grandTotal    = bills.reduce((s, b) => s + (Number(b.finalTotalFees)    || 0), 0);
  const totalStudents = bills.reduce((s, b) => s + (Number(b.totalStudentCount) || 0), 0);
  const uploadedCount = bills.filter((b) => b.bill_status === "Uploaded").length;

  const selectedTxn   = transactions.find((t) => String(t.id) === String(transaction));
  const totalPages    = Math.max(1, Math.ceil(bills.length / PAGE_SIZE));
  const pageRows      = bills.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={s.page}>
      <div style={s.heading}>Bill Report</div>

      {alert && (
        <div style={{ ...s.alert, ...s[alert.type] }}>
          {alert.message}
          <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
        </div>
      )}

      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: "0 0 380px" }}>
          <label style={s.label}>Transaction <span style={s.req}>*</span></label>
          <select
            style={s.select}
            value={transaction}
            onChange={(e) => { setTransaction(e.target.value); setSearched(false); setBills([]); }}
            disabled={loadingTxn}
          >
            <option value="">--Please Select--</option>
            {transactions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.transactionName} {t.percent ? `(${t.percent}%)` : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          style={{ ...s.btnOrange, height: 34 }}
          onClick={handleGetReport}
          disabled={loading || loadingTxn}
        >
          {loading ? "Loading…" : "Get Report"}
        </button>
        {searched && bills.length > 0 && (
          <>
            <button
              style={{ ...s.btnExcel, height: 34 }}
              onClick={() => exportToExcel(bills, selectedTxn?.transactionName)}
            >
              Export Excel
            </button>
            <button
              style={{ ...s.btnPDF, height: 34 }}
              onClick={() => exportToPDF(bills, selectedTxn?.transactionName, grandTotal)}
            >
              Export PDF
            </button>
          </>
        )}
      </div>

      {/* Summary cards */}
      {searched && bills.length > 0 && (
        <div style={s.summaryCard}>
          <div style={s.summaryItem}>
            <span style={s.summaryLabel}>Total Bills</span>
            <span style={s.summaryVal}>{bills.length}</span>
          </div>
          <div style={s.summaryItem}>
            <span style={s.summaryLabel}>Total Students</span>
            <span style={s.summaryVal}>{totalStudents}</span>
          </div>
          <div style={s.summaryItem}>
            <span style={s.summaryLabel}>Uploaded Bills</span>
            <span style={{ ...s.summaryVal, color: "#28a745" }}>{uploadedCount}</span>
          </div>
          <div style={s.summaryItem}>
            <span style={s.summaryLabel}>Grand Total</span>
            <span style={{ ...s.summaryVal, color: "#e53935" }}>{fmtAmt(grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Report table */}
      {loading ? (
        <div style={{ color: "#888", padding: "40px 0", textAlign: "center" }}>Loading report...</div>
      ) : searched && bills.length > 0 && (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Sr No</th>
                <th style={s.th}>PO</th>
                <th style={s.th}>School</th>
                <th style={s.th}>Bill Date</th>
                <th style={s.th}>Total Students</th>
                <th style={s.th}>Total Fees</th>
                <th style={s.th}>Final Total Fees</th>
                <th style={s.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((bill, i) => (
                <tr key={bill.id}>
                  <td style={s.td}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={s.td}>{bill.po || "—"}</td>
                  <td style={s.td}>{bill.schoolId || "—"}</td>
                  <td style={s.td}>{fmtDate(bill.billDate)}</td>
                  <td style={s.td}>{bill.totalStudentCount || "—"}</td>
                  <td style={s.td}>{fmtAmt(bill.totalFees)}</td>
                  <td style={s.td}>{fmtAmt(bill.finalTotalFees)}</td>
                  <td style={s.td}>
                    <span style={s.badge(bill.bill_status || "Generated")}>
                      {bill.bill_status || "Generated"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={s.paginWrap}>
            <div style={s.paginLeft}>
              <span><strong>Total Records</strong> {bills.length}</span>
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