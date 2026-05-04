// ============================================================
//  src/sections/DownloadUploadCancelBill.jsx
//  ATC — Download / Upload / Cancel Bill
//  Includes: PDF generation matching reference bill format
//  NOTE: PO list hardcoded until PO master API is ready
// ============================================================
import { useState, useEffect } from "react";
import { apiFetch, apiPatch } from "../api/liferay";

// ── Hardcoded PO list ─────────────────────────────────────────
const PO_LIST = [
  { po_id: 2,     po_name: "Kalwan" },
  { po_id: 3,     po_name: "Shahapur" },
  { po_id: 4,     po_name: "Kinvat" },
  { po_id: 5,     po_name: "Dharni" },
  { po_id: 6,     po_name: "Aheri" },
  { po_id: 7,     po_name: "Gadchiroli" },
  { po_id: 8,     po_name: "Bhamragad" },
  { po_id: 9,     po_name: "Chandrapur" },
  { po_id: 10,    po_name: "Taloda" },
  { po_id: 10004, po_name: "Rajur" },
  { po_id: 10005, po_name: "Dahanu" },
  { po_id: 10006, po_name: "Jawhar" },
  { po_id: 10007, po_name: "Ghodegaon" },
  { po_id: 10008, po_name: "Nashik" },
  { po_id: 10009, po_name: "Yawal" },
  { po_id: 10010, po_name: "Nandurbar" },
  { po_id: 10012, po_name: "Pandharkwada" },
  { po_id: 10013, po_name: "Dhule" },
  { po_id: 10014, po_name: "Pusad" },
  { po_id: 10015, po_name: "Aurangabad" },
  { po_id: 10026, po_name: "Nagpur" },
  { po_id: 10027, po_name: "Chimur" },
  { po_id: 10028, po_name: "Deori" },
  { po_id: 10029, po_name: "Bhandara" },
  { po_id: 10030, po_name: "Akola" },
  { po_id: 10031, po_name: "Kalamnuri" },
  { po_id: 10032, po_name: "Mumbai" },
  { po_id: 10033, po_name: "Pen" },
  { po_id: 10034, po_name: "Solapur" },
  { po_id: 10035, po_name: "Wardha" },
];

// ── API helpers ───────────────────────────────────────────────
const getTransactions = () =>
  apiFetch("/o/c/transactionmasters?pageSize=200&sort=dateCreated:desc")
    .then((d) => d.items || []);

const searchBills = (transactionId) =>
  apiFetch(
    `/o/c/billgenerations?filter=transactionId eq ${transactionId}&pageSize=200&sort=dateCreated:desc`
  ).then((d) => d.items || []);

const getBillAdmissionSummary = (billId) =>
  apiFetch(`/o/c/billadmissionsummary?filter=billGenerationId eq ${billId}&pageSize=200`)
    .then((d) => d.items || []).catch(() => []);

const getBillStudentsList = (billId) =>
  apiFetch(`/o/c/billstudents?filter=billGenerationId eq ${billId}&pageSize=200`)
    .then((d) => d.items || []).catch(() => []);

const getBillArrearsList = (billId) =>
  apiFetch(`/o/c/billarrears?filter=billGenerationId eq ${billId}&pageSize=200`)
    .then((d) => d.items || []).catch(() => []);

const getBillDeductionsList = (billId) =>
  apiFetch(`/o/c/billdeductions?filter=billGenerationId eq ${billId}&pageSize=200`)
    .then((d) => d.items || []).catch(() => []);

const getBillPODeductionsList = (billId) =>
  apiFetch(`/o/c/billpodeductions?filter=billGenerationId eq ${billId}&pageSize=200`)
    .then((d) => d.items || []).catch(() => []);

const getSchoolById = (id) =>
  apiFetch(`/o/c/namankitschoolprofiles/${id}`).catch(() => null);

const getTransactionById = (id) =>
  apiFetch(`/o/c/transactionmasters/${id}`).catch(() => null);

const cancelBill = (id) =>
  apiPatch(`/o/c/billgenerations/${id}`, { billStatus: "Cancelled" });

const uploadBillAPI = (id, fileUrl) =>
  apiPatch(`/o/c/billgenerations/${id}`, { billStatus: "Uploaded", uploadedFile: fileUrl });

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtAmt = (v) =>
  v != null && v !== "" ? Number(v).toFixed(2) : "0.00";

// ── PDF Generation ────────────────────────────────────────────
async function generateAndDownloadPDF(bill) {
  try {
    const [admissionSummary, students, arrears, deductions, poDeds, school, txn] =
      await Promise.all([
        getBillAdmissionSummary(bill.id),
        getBillStudentsList(bill.id),
        getBillArrearsList(bill.id),
        getBillDeductionsList(bill.id),
        getBillPODeductionsList(bill.id),
        getSchoolById(bill.schoolId),
        getTransactionById(bill.transactionId),
      ]);

    const schoolName   = school?.schoolName || `School #${bill.schoolId}`;
    const txnName      = txn?.transactionName || `Transaction #${bill.transactionId}`;
    const poName       = bill.po || "—";
    const billNo       = `Bill_${bill.id}`;
    const billDate     = fmtDate(bill.billDate);
    const totalStudents = bill.totalStudentCount || students.length || 0;
    const totalFees    = fmtAmt(bill.totalFees);
    const totalArrears = arrears.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalDeds    = deductions.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalPODeds  = poDeds.reduce((s, r) => s + (Number(r.deductionsAmount) || 0), 0);
    const finalAmt     = fmtAmt(bill.finalTotalFees);
    const billRemarks  = bill.billRemarks || "—";
    const academicYear = admissionSummary[0]?.admissionYear || "—";

    const admissionRows = admissionSummary.length > 0
      ? admissionSummary.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.admissionYear || "—"}</td>
            <td>${r.noOfStudents || 0}</td>
            <td>${fmtAmt(r.feesPerYear)}</td>
            <td>${fmtAmt(r.totalFeesYear)}</td>
          </tr>`).join("")
      : `<tr><td colspan="5" style="text-align:center;color:#888;padding:10px;">No admission summary data</td></tr>`;

    const studentRows = students.length > 0
      ? students.map((st, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${st.po || poName}</td>
            <td>${st.uniqueNumber || "—"}</td>
            <td>${st.studentName || "—"}</td>
            <td>${st.aadharNumber || "—"}</td>
            <td>${st.currentClass || "—"}</td>
            <td>${st.feesYear || academicYear}</td>
            <td>${fmtAmt(st.feesAmount)}</td>
          </tr>`).join("")
      : `<tr><td colspan="8" style="text-align:center;color:#888;padding:10px;">No student data</td></tr>`;

    const w = window.open("", "_blank");
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill — ${billNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 30px 40px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px 20px; margin-bottom: 14px; }
            .field-label { font-size: 10px; color: #444; margin-bottom: 2px; }
            .field-value { font-size: 11px; font-weight: 500; }
            .remarks { margin-bottom: 14px; }
            .remarks-label { font-size: 10px; color: #444; margin-bottom: 3px; }
            .remarks-value { font-size: 11px; line-height: 1.5; }
            .divider { border-top: 1px solid #bbb; margin: 12px 0; }
            h3 { text-align: center; font-size: 12px; font-weight: 700; margin: 14px 0 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 14px; }
            th { border: 1px solid #000; padding: 5px 7px; background: #f0f0f0; font-weight: 600; text-align: center; }
            td { border: 1px solid #000; padding: 5px 7px; text-align: center; }
            .print-btn { display: block; margin: 20px auto 0; background: #1a2a5e; color: #fff; border: none; padding: 9px 30px; font-size: 12px; border-radius: 4px; cursor: pointer; }
            @media print { .print-btn { display: none !important; } body { padding: 10px 15px; } }
          </style>
        </head>
        <body>
          <div class="info-grid">
            <div><div class="field-label">Academic Year :-</div><div class="field-value">${academicYear}</div></div>
            <div><div class="field-label">School Name :-</div><div class="field-value">${schoolName}</div></div>
            <div><div class="field-label">Transaction Name :-</div><div class="field-value">${txnName}</div></div>
            <div><div class="field-label">Bill Date :-</div><div class="field-value">${billDate}</div></div>
            <div><div class="field-label">Bill No :-</div><div class="field-value">${billNo}</div></div>
            <div></div>
            <div><div class="field-label">Total Student count:-</div><div class="field-value">${totalStudents}</div></div>
            <div><div class="field-label">Total Fees :-</div><div class="field-value">${totalFees}</div></div>
            <div><div class="field-label">Arrears Amount :-</div><div class="field-value">${fmtAmt(totalArrears)}</div></div>
            <div><div class="field-label">Deduction Amount :-</div><div class="field-value">${fmtAmt(totalDeds)}</div></div>
            <div><div class="field-label">Deductions by PO :-</div><div class="field-value">${fmtAmt(totalPODeds)}</div></div>
            <div><div class="field-label">Final applicable amount :-</div><div class="field-value"><strong>${finalAmt}</strong></div></div>
          </div>
          <div class="remarks">
            <div class="remarks-label">Bill Remarks:-</div>
            <div class="remarks-value">${billRemarks}</div>
          </div>
          <div class="divider"></div>
          <h3>Bill Details</h3>
          <table>
            <thead>
              <tr>
                <th>S.N</th><th>Admission Year</th><th>No of Students</th>
                <th>Fees Per Year</th><th>Total Fees Year</th>
              </tr>
            </thead>
            <tbody>${admissionRows}</tbody>
          </table>
          <h3>Student Details</h3>
          <table>
            <thead>
              <tr>
                <th>S.N</th><th>Student PO</th><th>Student Unique Number</th>
                <th>Student Name</th><th>Aadhar Number</th>
                <th>Class</th><th>Student Admission Year</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>${studentRows}</tbody>
          </table>
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
  } catch (e) {
    alert("Failed to generate bill PDF: " + e.message);
  }
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  page:      { padding: "20px 24px", fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#333", background: "#fff" },
  heading:   { fontSize: 18, fontWeight: 600, color: "#222", paddingBottom: 10, borderBottom: "1px solid #ddd", marginBottom: 20 },
  label:     { display: "block", fontSize: 12, color: "#333", marginBottom: 4 },
  req:       { color: "#e53935", marginLeft: 2 },
  input:     { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none" },
  select:    { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none", cursor: "pointer" },
  btnGreen:  { background: "#28a745", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnBlue:   { background: "#007bff", color: "#fff", border: "none", borderRadius: 3, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
  btnTeal:   { background: "#17a2b8", color: "#fff", border: "none", borderRadius: 3, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
  btnOrange: { background: "#fd7e14", color: "#fff", border: "none", borderRadius: 3, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
  btnRed:    { background: "#dc3545", color: "#fff", border: "none", borderRadius: 3, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
  btnYellow: { background: "#ffc107", color: "#333", border: "none", borderRadius: 3, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  table:     { width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 20 },
  th:        { padding: "9px 12px", background: "#fff", border: "1px solid #dee2e6", fontWeight: 600, textAlign: "left", color: "#222" },
  td:        { padding: "8px 12px", border: "1px solid #dee2e6", color: "#333", verticalAlign: "middle" },
  alert:     { padding: "10px 14px", borderRadius: 3, fontSize: 13, marginBottom: 14 },
  err:       { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
  suc:       { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
  badge:     (status) => ({
    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: status === "Uploaded"  ? "#d4edda" : status === "Cancelled" ? "#f8d7da" : "#fff3cd",
    color:      status === "Uploaded"  ? "#155724" : status === "Cancelled" ? "#721c24" : "#856404",
  }),
};

// ── Upload Modal ──────────────────────────────────────────────
function UploadModal({ bill, onClose, onUploaded }) {
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const handleUpload = async () => {
    if (!file) { setErr("Please select a file."); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/o/headless-delivery/v1.0/sites/guest/documents", {
        method: "POST",
        headers: { Authorization: "Basic " + btoa("prabhudasu:root") },
        body: form,
      });
      const uploadData = await uploadRes.json();
      const fileUrl = uploadData.contentUrl || uploadData.id || file.name;
      await uploadBillAPI(bill.id, fileUrl);
      onUploaded();
    } catch (e) {
      setErr("Upload failed — " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: "#fff", borderRadius: 6, width: 420, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
        <div style={{ background: "#17a2b8", padding: "12px 18px", color: "#fff", fontWeight: 600, fontSize: 15 }}>
          Upload Bill — #{bill.id}
        </div>
        <div style={{ padding: "20px 18px" }}>
          {err && <div style={{ ...s.alert, ...s.err, marginBottom: 12 }}>{err}</div>}
          <label style={s.label}>Select Bill File <span style={s.req}>*</span></label>
          <input type="file" accept=".pdf,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ ...s.input, padding: "4px" }} />
          <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Accepted: PDF, Excel</div>
        </div>
        <div style={{ padding: "10px 18px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={s.btnRed} onClick={onClose}>Cancel</button>
          <button style={s.btnGreen} onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function DownloadUploadCancelBill() {
  const [transactions, setTransactions] = useState([]);
  const [transaction,  setTransaction]  = useState("");
  const [po,           setPo]           = useState("");
  const [billNo,       setBillNo]       = useState("");
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [downloading,  setDownloading]  = useState(null);
  const [searched,     setSearched]     = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [uploadModal,  setUploadModal]  = useState(null);

  useEffect(() => {
    getTransactions().then(setTransactions).catch(() => setTransactions([]));
  }, []);

  const handleSearch = async () => {
    if (!transaction || !po) {
      setAlert({ type: "err", message: "Please select Transaction and PO." }); return;
    }
    setLoading(true); setAlert(null);
    try {
      let data = await searchBills(transaction);
      const selectedPO = PO_LIST.find((p) => String(p.po_id) === String(po));
      if (selectedPO) {
        data = data.filter(
          (b) => b.po === selectedPO.po_name || String(b.po) === String(po)
        );
      }
      if (billNo) {
        data = data.filter((b) => String(b.id).includes(billNo.trim()));
      }
      setBills(data); setSearched(true);
      if (data.length === 0)
        setAlert({ type: "err", message: "No bills found for selected criteria." });
    } catch (e) {
      setAlert({ type: "err", message: "Search failed — " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (bill) => {
    setDownloading(bill.id);
    try { await generateAndDownloadPDF(bill); }
    finally { setDownloading(null); }
  };

  const handleView = (bill) => {
    if (bill.uploadedFile) window.open(bill.uploadedFile, "_blank");
    else alert("No file uploaded for this bill yet.");
  };

  const handleCancel = async (bill) => {
    if (!window.confirm(`Cancel Bill #${bill.id}? This cannot be undone.`)) return;
    try {
      await cancelBill(bill.id);
      setBills((prev) => prev.map((b) => b.id === bill.id ? { ...b, billStatus: "Cancelled" } : b));
      setAlert({ type: "suc", message: "Bill cancelled successfully." });
    } catch (e) {
      setAlert({ type: "err", message: "Cancel failed — " + e.message });
    }
  };

  const handleExportExcel = () => {
    const rows = [
      ["Sr No", "Project Office", "Transaction", "Bill No", "School", "Student Count", "Final Amount", "Status"],
      ...bills.map((b, i) => [i + 1, b.po, b.transactionId, b.id, b.schoolId, b.totalStudentCount, b.finalTotalFees, b.billStatus || "Generated"]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "bills.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const getPoName = (bill) => {
    if (bill.po) return bill.po;
    const found = PO_LIST.find((p) => String(p.po_id) === String(bill.poNameId));
    return found ? found.po_name : "—";
  };

  return (
    <>
      {uploadModal && (
        <UploadModal
          bill={uploadModal}
          onClose={() => setUploadModal(null)}
          onUploaded={() => {
            setBills((prev) => prev.map((b) => b.id === uploadModal.id ? { ...b, billStatus: "Uploaded" } : b));
            setUploadModal(null);
            setAlert({ type: "suc", message: "Bill uploaded successfully." });
          }}
        />
      )}
      <div style={s.page}>
        <div style={s.heading}>Download / Upload / Cancel Bill</div>
        {alert && (
          <div style={{ ...s.alert, ...s[alert.type] }}>
            {alert.message}
            <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
          </div>
        )}
        {/* Filter row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: "12px 18px", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <label style={s.label}>Transaction <span style={s.req}>*</span></label>
            <select style={s.select} value={transaction} onChange={(e) => setTransaction(e.target.value)}>
              <option value="">--Please Select--</option>
              {transactions.map((t) => (
                <option key={t.id} value={t.id}>{t.transactionName} {t.percent ? `(${t.percent}%)` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={s.label}>PO <span style={s.req}>*</span></label>
            <select style={s.select} value={po} onChange={(e) => setPo(e.target.value)}>
              <option value="">--Please Select--</option>
              {PO_LIST.map((p) => (
                <option key={p.po_id} value={p.po_id}>{p.po_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={s.label}>Bill No</label>
            <input style={s.input} value={billNo} onChange={(e) => setBillNo(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <button style={{ ...s.btnGreen, padding: "7px 22px" }} onClick={handleSearch} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          <div>
            <button style={{ ...s.btnYellow, padding: "7px 18px" }} onClick={handleExportExcel} disabled={!bills.length}>
              Export to Excel
            </button>
          </div>
        </div>
        {/* Results table */}
        {searched && bills.length > 0 && (
          <table style={s.table}>
            <thead>
              <tr>
                {["Sr No", "Project Office", "Transaction Name", "Bill No", "School", "Student Count", "Final Applicable Amount", "Status", "Download", "Upload", "View", "Cancel Bill"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, i) => (
                <tr key={bill.id}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={s.td}>{getPoName(bill)}</td>
                  <td style={s.td}>{bill.transactionId || "—"}</td>
                  <td style={s.td}>{bill.id}</td>
                  <td style={s.td}>{bill.schoolId || "—"}</td>
                  <td style={s.td}>{bill.totalStudentCount || "—"}</td>
                  <td style={s.td}>
                    {bill.finalTotalFees
                      ? `₹${Number(bill.finalTotalFees).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                  <td style={s.td}>
                    <span style={s.badge(bill.billStatus || "Generated")}>
                      {bill.billStatus || "Generated"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnBlue} onClick={() => handleDownload(bill)} disabled={downloading === bill.id}>
                      {downloading === bill.id ? "…" : "Download"}
                    </button>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnTeal} onClick={() => setUploadModal(bill)} disabled={bill.billStatus === "Cancelled"}>
                      Upload
                    </button>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnOrange} onClick={() => handleView(bill)}>View</button>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnRed} onClick={() => handleCancel(bill)} disabled={bill.billStatus === "Cancelled"}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {searched && bills.length === 0 && !alert && (
          <div style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>No bills found.</div>
        )}
      </div>
    </>
  );
}