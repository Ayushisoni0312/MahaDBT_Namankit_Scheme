// ============================================================
//  src/sections/TransactionMaster.jsx
//  Controller — Transaction Master
//  Liferay object: transactionmasters
// ============================================================
import { useState, useEffect } from "react";
import { apiFetch, apiPost, apiPatch } from "../api/liferay";

// ── API ───────────────────────────────────────────────────────
const API = "/o/c/transactionmasters";

const getTransactions  = ()      => apiFetch(`${API}?pageSize=200&sort=dateCreated:desc`).then((d) => d.items || []);
const saveTransaction  = (p)     => apiPost(API, p);
const patchTransaction = (id, p) => apiPatch(`${API}/${id}`, p);

// ── Transaction type options ──────────────────────────────────
const TRANSACTION_TYPES = [
  { value: "Normal Transaction",                label: "Normal Transaction" },
  { value: "Transferred Students Transaction",  label: "Transferred Students Transaction" },
  { value: "Random Bill Transaction",           label: "Random Bill Transaction" },
];

// ── Styles (matching production UI) ──────────────────────────
const s = {
  page:       { padding: "20px 24px", fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#333", background: "#fff" },
  heading:    { fontSize: 18, fontWeight: 600, color: "#00897b", paddingBottom: 8, borderBottom: "2px solid #e8b400", marginBottom: 20, display: "inline-block" },
  subHeading: { fontSize: 15, fontWeight: 600, color: "#00897b", borderBottom: "2px solid #e8b400", paddingBottom: 4, marginBottom: 16, marginTop: 28, display: "inline-block" },
  label:      { display: "block", fontSize: 13, color: "#333", marginBottom: 4, fontWeight: 500 },
  req:        { color: "#e53935", marginLeft: 2 },
  input:      { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none" },
  inputGrey:  { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#e9ecef", outline: "none" },
  select:     { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none", cursor: "pointer" },
  grid3:      { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 18px", marginBottom: 14 },
  grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 18px", marginBottom: 14 },
  btnGreen:   { background: "#28a745", color: "#fff", border: "none", borderRadius: 3, padding: "7px 22px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnOrange:  { background: "#fd7e14", color: "#fff", border: "none", borderRadius: 3, padding: "7px 22px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnEdit:    { background: "#fff", color: "#333", border: "1px solid #ced4da", borderRadius: 3, padding: "4px 14px", fontSize: 12, cursor: "pointer" },
  table:      { width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 },
  th:         { padding: "9px 12px", background: "#fff", border: "1px solid #dee2e6", fontWeight: 600, textAlign: "left", color: "#222" },
  td:         { padding: "8px 12px", border: "1px solid #dee2e6", color: "#333", verticalAlign: "middle" },
  alert:      { padding: "10px 14px", borderRadius: 3, fontSize: 13, marginBottom: 14 },
  err:        { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
  suc:        { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
  paginWrap:  { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13, padding: "12px 0 4px" },
  paginLeft:  { display: "flex", alignItems: "center", gap: 10 },
  paginInput: { width: 80, padding: "5px 8px", fontSize: 13, border: "1px solid #cccccc", borderRadius: 3, textAlign: "center" },
  btnNav:     (active) => ({ padding: "5px 14px", fontSize: 13, background: active ? "#1a3a5c" : "#fff", color: active ? "#fff" : "#333", border: "1px solid " + (active ? "#1a3a5c" : "#cccccc"), borderRadius: 3, cursor: active ? "pointer" : "not-allowed" }),
};

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  transactionType: "Normal Transaction",
  transactionName: "",
  percent:         "",
};

export default function TransactionMaster() {
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [editId,       setEditId]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [page,         setPage]         = useState(1);

  // ── Load transactions ────────────────────────────────────
  const loadTransactions = () => {
    setLoading(true);
    getTransactions()
      .then(setTransactions)
      .catch((e) => setAlert({ type: "err", message: "Failed to load — " + e.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTransactions(); }, []);

  // ── Available percent calculation ─────────────────────────
  // Sum of all Normal Transaction percents (excluding current edit)
  const usedPercent = transactions
    .filter((t) => t.transactionType === "Normal Transaction" && t.id !== editId)
    .reduce((sum, t) => sum + (Number(t.percent) || 0), 0);

  const availablePercent =
    form.transactionType === "Normal Transaction"
      ? Math.max(0, 100 - usedPercent)
      : 0;

  // ── Field change ─────────────────────────────────────────
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Percent validation — cannot be 100 or above ──────────
  const handlePercentChange = (value) => {
    // Allow empty
    if (value === "") { handleChange("percent", ""); return; }
    const num = Number(value);
    if (num >= 100) {
      setAlert({ type: "err", message: "Percent value cannot be 100 or above." });
      return;
    }
    if (num < 0) return;
    setAlert(null);
    handleChange("percent", value);
  };

  // ── Edit handler ─────────────────────────────────────────
  const handleEdit = (txn) => {
    setEditId(txn.id);
    setForm({
      transactionType: txn.transactionType || "Normal Transaction",
      transactionName: txn.transactionName || "",
      percent:         txn.percent != null ? String(txn.percent) : "",
    });
    setAlert(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setAlert(null);
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    setAlert(null);

    // Validations
    if (!form.transactionName.trim()) {
      setAlert({ type: "err", message: "Transaction Name is required." }); return;
    }
    if (form.transactionType === "Normal Transaction") {
      if (!form.percent && form.percent !== 0) {
        setAlert({ type: "err", message: "Percent is required for Normal Transaction." }); return;
      }
      const num = Number(form.percent);
      if (num >= 100) {
        setAlert({ type: "err", message: "Percent value cannot be 100 or above." }); return;
      }
      // Check total percent won't exceed 100
      if (usedPercent + num > 100) {
        setAlert({ type: "err", message: `Total percent would exceed 100. Available: ${availablePercent}%` }); return;
      }
    }

    const payload = {
      transactionName: form.transactionName.trim(),
      transactionType: form.transactionType,
      ...(form.transactionType === "Normal Transaction" && { percent: Number(form.percent) }),
    };

    setSaving(true);
    try {
      if (editId) {
        await patchTransaction(editId, payload);
        setAlert({ type: "suc", message: "Transaction updated successfully." });
      } else {
        await saveTransaction(payload);
        setAlert({ type: "suc", message: "Transaction saved successfully." });
      }
      handleReset();
      loadTransactions();
    } catch (e) {
      setAlert({ type: "err", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const pageRows   = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={s.page}>
      <div style={s.heading}>Transaction Master</div>

      {alert && (
        <div style={{ ...s.alert, ...s[alert.type] }}>
          {alert.message}
          <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
        </div>
      )}

      {/* ── Form ── */}
      <div style={{ marginBottom: 8 }}>
        {/* Transaction Type */}
        <div style={{ marginBottom: 14, maxWidth: 480 }}>
          <label style={s.label}>Transaction Type</label>
          <select
            style={s.select}
            value={form.transactionType}
            onChange={(e) => handleChange("transactionType", e.target.value)}
          >
            {TRANSACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Transaction Name + Percent */}
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Transaction Name <span style={s.req}>*</span></label>
            <input
              style={s.input}
              value={form.transactionName}
              onChange={(e) => handleChange("transactionName", e.target.value)}
              placeholder="Enter transaction name"
            />
          </div>
          {form.transactionType === "Normal Transaction" && (
            <div>
              <label style={s.label}>Percent <span style={s.req}>*</span></label>
              <input
                style={s.input}
                type="number"
                min="0"
                max="99"
                value={form.percent}
                onChange={(e) => handlePercentChange(e.target.value)}
                placeholder="Enter percent (max 99)"
              />
            </div>
          )}
        </div>

        {/* Available Percent — only for Normal Transaction */}
        {form.transactionType === "Normal Transaction" && (
          <div style={{ marginBottom: 14, maxWidth: 480 }}>
            <label style={s.label}>Available Percent</label>
            <input
              style={s.inputGrey}
              value={availablePercent}
              readOnly
            />
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button style={s.btnGreen}  onClick={handleSave}  disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button style={s.btnOrange} onClick={handleReset}>Reset</button>
        </div>
      </div>

      {/* ── Filled Details Table ── */}
      <div style={{ marginTop: 28 }}>
        <div style={s.subHeading}>Filled Details</div>
      </div>

      {loading ? (
        <div style={{ color: "#888", padding: "24px 0", textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Sr No</th>
                <th style={s.th}>Transaction Name</th>
                <th style={s.th}>Percent</th>
                <th style={s.th}>Amount Per Student</th>
                <th style={s.th}>Transaction Type</th>
                <th style={s.th}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#aaa" }}>
                    No transactions added yet.
                  </td>
                </tr>
              ) : (
                pageRows.map((txn, i) => (
                  <tr key={txn.id} style={{ background: editId === txn.id ? "#f0faf9" : "#fff" }}>
                    <td style={s.td}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={s.td}>{txn.transactionName}</td>
                    <td style={s.td}>{txn.percent != null ? txn.percent : "—"}</td>
                    <td style={s.td}>{txn.amountPerStudent != null ? txn.amountPerStudent : "—"}</td>
                    <td style={s.td}>{txn.transactionType}</td>
                    <td style={s.td}>
                      <button style={s.btnEdit} onClick={() => handleEdit(txn)}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={s.paginWrap}>
            <div style={s.paginLeft}>
              <span><strong>Total Records</strong> {transactions.length}</span>
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