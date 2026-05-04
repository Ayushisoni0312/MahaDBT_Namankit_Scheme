// // ============================================================
// //  src/sections/Billgeneration.jsx
// //  ATC — Bill Generation (Full API Integration)
// //
// //  APIs used (all from liferay.js):
// //  GET  /o/c/transactionmasters       → Transaction dropdown
// //  GET  /o/c/namankitschoolprofiles   → PO list (unique poName values)
// //  GET  /o/c/namankitschoolprofiles   → Schools filtered by poName
// //  GET  /o/c/schoolgradings           → Fees per student (assignedFees)
// //  POST /o/c/billgenerations          → Save main bill
// //  POST /o/c/billadmissionsummary     → Save admission summary rows
// //  POST /o/c/billstudents             → Save student rows
// //  POST /o/c/billarrears              → Save arrear rows
// //  POST /o/c/billdeductions           → Save deduction rows
// //  GET  /o/c/billgenerations          → Load existing bill
// //  GET  /o/c/billarrears              → Load existing arrears
// //  GET  /o/c/billdeductions           → Load existing deductions
// //  GET  /o/c/billpodeductions         → Load PO deductions
// // ============================================================
// import { useState, useEffect } from "react";
// import {
//   apiFetch,
//   apiPost,
//   apiPatch,
//   saveBillGeneration,
//   saveBillAdmissionSummary,
//   saveBillStudent,
//   saveBillArrear,
//   saveBillDeduction,
//   getBillArrears,
//   getBillDeductions,
//   getBillPODeductions,
//   getBillStudents,
// } from "../api/liferay";

// // ── API helpers ───────────────────────────────────────────────
// const getTransactions = () =>
//   apiFetch("/o/c/transactionmasters?pageSize=200&sort=dateCreated:desc")
//     .then((d) => d.items || []);

// const getAllSchools = () =>
//   apiFetch("/o/c/namankitschoolprofiles?pageSize=200&sort=dateCreated:desc")
//     .then((d) => d.items || []);

// const getSchoolGrading = (schoolProfileId) =>
//   apiFetch(`/o/c/schoolgradings?filter=schoolProfileId eq ${schoolProfileId}&pageSize=1`)
//     .then((d) => (d.items || [])[0] || null);

// const getExistingBill = (transactionId, schoolId) =>
//   apiFetch(
//     `/o/c/billgenerations?filter=transactionId eq ${transactionId} and schoolId eq ${schoolId}&pageSize=1&sort=dateCreated:desc`
//   ).then((d) => (d.items || [])[0] || null);

// const patchBillGeneration = (id, payload) =>
//   apiPatch(`/o/c/billgenerations/${id}`, payload);

// // ── Styles ────────────────────────────────────────────────────
// const s = {
//   page:       { padding: "20px 24px", fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#333", background: "#fff" },
//   heading:    { fontSize: 18, fontWeight: 600, color: "#222", paddingBottom: 10, borderBottom: "1px solid #ddd", marginBottom: 20 },
//   subHeading: { fontSize: 15, fontWeight: 600, color: "#17a2b8", borderBottom: "2px solid #e8c84a", paddingBottom: 4, marginBottom: 16, marginTop: 28 },
//   label:      { display: "block", fontSize: 12, color: "#333", marginBottom: 4 },
//   req:        { color: "#e53935", marginLeft: 2 },
//   input:      { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none" },
//   inputGrey:  { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#e9ecef", outline: "none" },
//   select:     { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none", cursor: "pointer" },
//   grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 18px", marginBottom: 14 },
//   grid4:      { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px 10px", alignItems: "flex-end", marginBottom: 10 },
//   btnGreen:   { background: "#28a745", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
//   btnOrange:  { background: "#fd7e14", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
//   btnCapture: { background: "#17a2b8", color: "#fff", border: "none", borderRadius: 20, padding: "7px 24px", fontSize: 13, cursor: "pointer", fontWeight: 500 },
//   btnDelete:  { background: "#dc3545", color: "#fff", border: "none", borderRadius: 3, padding: "4px 12px", fontSize: 12, cursor: "pointer" },
//   table:      { width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 },
//   th:         { padding: "9px 12px", background: "#fff", border: "1px solid #dee2e6", fontWeight: 600, textAlign: "left", color: "#222" },
//   td:         { padding: "8px 12px", border: "1px solid #dee2e6", color: "#333", verticalAlign: "middle" },
//   summaryRow: { display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap", marginTop: 18, marginBottom: 14 },
//   finalAmt:   { fontSize: 22, fontWeight: 700, color: "#e53935" },
//   uidBox:     { background: "#fffbea", border: "1px solid #e8c84a", borderRadius: 3, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#555" },
//   captureBox: { background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 3, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
//   alert:      { padding: "10px 14px", borderRadius: 3, fontSize: 13, marginBottom: 14 },
//   err:        { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
//   suc:        { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
// };

// const emptyArrear    = { amount: "", billNo: "", date: "", remarks: "" };
// const emptyDeduction = { amount: "", billNo: "", date: "", remarks: "" };

// export default function BillGeneration() {
//   // ── Dropdown data ─────────────────────────────────────────
//   const [transactions, setTransactions] = useState([]);
//   const [poList,       setPoList]       = useState([]);   // unique PO names from schools
//   const [schoolList,   setSchoolList]   = useState([]);   // schools filtered by PO
//   const [allSchools,   setAllSchools]   = useState([]);   // all schools (loaded once)

//   // ── Header filters ────────────────────────────────────────
//   const [transaction, setTransaction] = useState("");
//   const [po,          setPo]          = useState("");
//   const [school,      setSchool]      = useState("");
//   const [billDate,    setBillDate]    = useState("");

//   // ── Search result data ────────────────────────────────────
//   const [searched,          setSearched]          = useState(false);
//   const [loading,           setLoading]           = useState(false);
//   const [summaryRows,       setSummaryRows]       = useState([]);
//   const [studentsList,      setStudentsList]      = useState([]);
//   const [totalStudentCount, setTotalStudentCount] = useState(0);
//   const [totalFees,         setTotalFees]         = useState(0);

//   // ── Saved bill id (after first save / if existing) ───────
//   const [billId, setBillId] = useState(null);

//   // ── Arrears ────────────────────────────────────────────────
//   const [arrearInput, setArrearInput] = useState(emptyArrear);
//   const [arrearRows,  setArrearRows]  = useState([]);

//   // ── Deductions ────────────────────────────────────────────
//   const [deductInput, setDeductInput] = useState(emptyDeduction);
//   const [deductRows,  setDeductRows]  = useState([]);

//   // ── PO Deductions (read-only from Liferay) ────────────────
//   const [poDeductions, setPoDeductions] = useState([]);

//   // ── Bottom ────────────────────────────────────────────────
//   const [billRemarks, setBillRemarks] = useState("");

//   // ── UI state ─────────────────────────────────────────────
//   const [saving,  setSaving]  = useState(false);
//   const [alert,   setAlert]   = useState(null);

//   // ── Auto-calc ────────────────────────────────────────────
//   const totalArrears    = arrearRows.reduce((s, r)   => s + (Number(r.amount) || 0), 0);
//   const totalDeductions = deductRows.reduce((s, r)   => s + (Number(r.amount) || 0), 0);
//   const totalPODed      = poDeductions.reduce((s, r) => s + (Number(r.deductionsAmount) || 0), 0);
//   const finalTotalFees  = totalFees + totalArrears - totalDeductions - totalPODed;

//   // ── Load transactions + all schools on mount ──────────────
//   useEffect(() => {
//     getTransactions()
//       .then(setTransactions)
//       .catch(() => setTransactions([]));

//     getAllSchools()
//       .then((schools) => {
//         setAllSchools(schools);
//         // Extract unique PO names for PO dropdown
//         const uniquePOs = [...new Set(
//           schools
//             .map((s) => s.poName || s.concernedPO || s.po || "")
//             .filter(Boolean)
//         )].sort();
//         setPoList(uniquePOs);
//       })
//       .catch(() => setAllSchools([]));
//   }, []);

//   // ── Filter schools when PO changes ───────────────────────
//   useEffect(() => {
//     if (!po) { setSchoolList([]); setSchool(""); return; }
//     const filtered = allSchools.filter(
//       (s) => (s.poName || s.concernedPO || s.po || "") === po
//     );
//     setSchoolList(filtered);
//     setSchool("");
//   }, [po, allSchools]);

//   // ── Search ────────────────────────────────────────────────
//   const handleSearch = async () => {
//     if (!transaction || !po || !school) {
//       setAlert({ type: "err", message: "Please select Transaction, PO and School." });
//       return;
//     }
//     setLoading(true);
//     setAlert(null);
//     try {
//       // 1. Get school grading to determine fees per student
//       const grading = await getSchoolGrading(school);
//       const feesPerStudent = grading?.assignedFees || grading?.finalFees || 0;

//       // 2. Get approved students for this school
//       const students = await apiFetch(
//         `/o/c/namankitstudents?filter=schoolProfileId eq ${school}&pageSize=200&sort=dateCreated:desc`
//       ).then((d) => d.items || []).catch(() => []);

//       // 3. Group by admission year for summary table
//       const grouped = {};
//       students.forEach((st) => {
//         const yr = st.admissionYear || st.currentClass || "2025-2026";
//         if (!grouped[yr]) {
//           grouped[yr] = {
//             admissionYear: yr,
//             noOfStudents: 0,
//             feesPerYear: feesPerStudent,
//             totalFeesYear: 0,
//           };
//         }
//         grouped[yr].noOfStudents++;
//         grouped[yr].totalFeesYear += feesPerStudent;
//       });

//       const summary = Object.values(grouped);
//       const totalFeesCal = summary.reduce((s, r) => s + r.totalFeesYear, 0);

//       // 4. Build students list with distributed fees
//       const studentsWithFees = students.map((st) => ({
//         id:          st.id,
//         studentPO:   po,
//         uniqueNumber: st.uniqueNumber || st.id,
//         studentName: `${st.firstName || ""} ${st.middleName || ""} ${st.lastName || ""}`.trim(),
//         feesYear:    st.admissionYear || "2025-2026",
//         feesAmount:  feesPerStudent,
//       }));

//       setSummaryRows(summary);
//       setStudentsList(studentsWithFees);
//       setTotalStudentCount(students.length);
//       setTotalFees(totalFeesCal);
//       setSearched(true);

//       // 5. Check if a bill already exists for this transaction+school
//       const existing = await getExistingBill(transaction, school);
//       if (existing) {
//         setBillId(existing.id);
//         setBillDate(existing.billDate ? existing.billDate.split("T")[0] : "");
//         setBillRemarks(existing.billRemarks || "");

//         // Load child tables
//         const [arrears, deductions, poDeds] = await Promise.all([
//           getBillArrears(existing.id),
//           getBillDeductions(existing.id),
//           getBillPODeductions(existing.id),
//         ]);
//         setArrearRows(arrears.map((r) => ({ ...r, _saved: true })));
//         setDeductRows(deductions.map((r) => ({ ...r, _saved: true })));
//         setPoDeductions(poDeds);
//       }
//     } catch (e) {
//       setAlert({ type: "err", message: "Search failed — " + e.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Add Arrear ────────────────────────────────────────────
//   const handleAddArrear = () => {
//     if (!arrearInput.amount) {
//       setAlert({ type: "err", message: "Arrear amount is required." });
//       return;
//     }
//     setArrearRows((p) => [...p, { ...arrearInput, id: Date.now(), _saved: false }]);
//     setArrearInput(emptyArrear);
//   };
//   const deleteArrear = (id) => setArrearRows((p) => p.filter((r) => r.id !== id));

//   // ── Add Deduction ─────────────────────────────────────────
//   const handleAddDeduction = () => {
//     if (!deductInput.amount) {
//       setAlert({ type: "err", message: "Deduction amount is required." });
//       return;
//     }
//     setDeductRows((p) => [...p, { ...deductInput, id: Date.now(), _saved: false }]);
//     setDeductInput(emptyDeduction);
//   };
//   const deleteDeduction = (id) => setDeductRows((p) => p.filter((r) => r.id !== id));

//   // ── Save ──────────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!billDate)    { setAlert({ type: "err", message: "Bill Date is required." }); return; }
//     if (!billRemarks) { setAlert({ type: "err", message: "Bill Remarks is required." }); return; }

//     setSaving(true);
//     setAlert(null);

//     try {
//       // 1. Save / update main bill record
//       const billPayload = {
//         transactionId:     Number(transaction),
//         po,
//         schoolId:          Number(school),
//         billDate,
//         totalStudentCount,
//         totalFees,
//         totalArrears,
//         totalDeductions,
//         totalPODeductions: totalPODed,
//         finalTotalFees,
//         billRemarks,
//         billStatus:        "Draft",
//       };

//       let currentBillId = billId;
//       if (billId) {
//         await patchBillGeneration(billId, billPayload);
//       } else {
//         const res = await saveBillGeneration(billPayload);
//         currentBillId = res.id;
//         setBillId(res.id);
//       }

//       // 2. Save admission summary rows
//       for (const row of summaryRows) {
//         await saveBillAdmissionSummary({
//           billGenerationId: currentBillId,
//           admissionYear:    row.admissionYear,
//           noOfStudents:     row.noOfStudents,
//           feesPerYear:      row.feesPerYear,
//           totalFeesYear:    row.totalFeesYear,
//         });
//       }

//       // 3. Save student rows
//       for (const st of studentsList) {
//         await saveBillStudent({
//           billGenerationId: currentBillId,
//           schoolId:         Number(school),
//           studentId:        st.id,
//           studentName:      st.studentName,
//           uniqueNumber:     st.uniqueNumber,
//           feesYear:         st.feesYear,
//           feesAmount:       st.feesAmount,
//           po,
//         });
//       }

//       // 4. Save new arrear rows (skip already saved)
//       const newArrears = arrearRows.filter((r) => !r._saved);
//       for (const row of newArrears) {
//         await saveBillArrear({
//           billGenerationId: currentBillId,
//           amount:           Number(row.amount),
//           billNo:           row.billNo,
//           date:             row.date,
//           remarks:          row.remarks,
//         });
//       }
//       setArrearRows((p) => p.map((r) => ({ ...r, _saved: true })));

//       // 5. Save new deduction rows (skip already saved)
//       const newDeductions = deductRows.filter((r) => !r._saved);
//       for (const row of newDeductions) {
//         await saveBillDeduction({
//           billGenerationId: currentBillId,
//           amount:           Number(row.amount),
//           billNo:           row.billNo,
//           date:             row.date,
//           remarks:          row.remarks,
//         });
//       }
//       setDeductRows((p) => p.map((r) => ({ ...r, _saved: true })));

//       setAlert({ type: "suc", message: "Bill saved successfully!" });
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (e) {
//       setAlert({ type: "err", message: "Save failed — " + e.message });
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Reset ─────────────────────────────────────────────────
//   const handleReset = () => {
//     setTransaction(""); setPo(""); setSchool(""); setBillDate("");
//     setSearched(false); setSummaryRows([]); setStudentsList([]);
//     setTotalStudentCount(0); setTotalFees(0); setBillId(null);
//     setArrearInput(emptyArrear); setArrearRows([]);
//     setDeductInput(emptyDeduction); setDeductRows([]);
//     setPoDeductions([]); setBillRemarks(""); setAlert(null);
//   };

//   // ── Field setter helpers ──────────────────────────────────
//   const setA = (k) => (e) => setArrearInput((p) => ({ ...p, [k]: e.target.value }));
//   const setD = (k) => (e) => setDeductInput((p) => ({ ...p, [k]: e.target.value }));

//   // ── Render ────────────────────────────────────────────────
//   return (
//     <div style={s.page}>
//       <div style={s.heading}>Bill Generation</div>

//       {/* Alert */}
//       {alert && (
//         <div style={{ ...s.alert, ...s[alert.type] }}>
//           {alert.message}
//           <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
//         </div>
//       )}

//       {/* ── Row 1: Transaction | PO | School | Search ────── */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px 18px", alignItems: "flex-end", marginBottom: 14 }}>
//         <div>
//           <label style={s.label}>Transaction <span style={s.req}>*</span></label>
//           <select style={s.select} value={transaction} onChange={(e) => setTransaction(e.target.value)}>
//             <option value="">--Select--</option>
//             {transactions.map((t) => (
//               <option key={t.id} value={t.id}>
//                 {t.transactionName} {t.percent ? `(${t.percent}%)` : ""}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label style={s.label}>PO <span style={s.req}>*</span></label>
//           <select style={s.select} value={po} onChange={(e) => setPo(e.target.value)}>
//             <option value="">--Select--</option>
//             {poList.map((p) => (
//               <option key={p} value={p}>{p}</option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label style={s.label}>School <span style={s.req}>*</span></label>
//           <select style={s.select} value={school} onChange={(e) => setSchool(e.target.value)} disabled={!po}>
//             <option value="">--Select--</option>
//             {schoolList.map((sc) => (
//               <option key={sc.id} value={sc.id}>
//                 {sc.schoolName || sc.name || sc.id}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <button
//             style={{ ...s.btnGreen, padding: "7px 22px" }}
//             onClick={handleSearch}
//             disabled={loading}
//           >
//             {loading ? "Searching…" : "Search"}
//           </button>
//         </div>
//       </div>

//       {/* ── Row 2: Bill Date | Total Student Count ────────── */}
//       <div style={s.grid2}>
//         <div>
//           <label style={s.label}>Bill Date <span style={s.req}>*</span></label>
//           <input style={s.input} type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
//         </div>
//         <div>
//           <label style={s.label}>Total Student count <span style={s.req}>*</span></label>
//           <input style={s.inputGrey} value={searched ? totalStudentCount : ""} readOnly />
//         </div>
//       </div>

//       {/* ── Admission Summary Table ───────────────────────── */}
//       {summaryRows.length > 0 && (
//         <table style={s.table}>
//           <thead>
//             <tr>
//               {["Sr No", "Admission Year", "No of Students", "Fees Per Year", "Total Fees Year"].map((h) => (
//                 <th key={h} style={s.th}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {summaryRows.map((r, i) => (
//               <tr key={i}>
//                 <td style={s.td}>{i + 1}</td>
//                 <td style={s.td}>{r.admissionYear}</td>
//                 <td style={s.td}>{r.noOfStudents}</td>
//                 <td style={s.td}>{Number(r.feesPerYear).toFixed(2)}</td>
//                 <td style={s.td}>{Number(r.totalFeesYear).toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* ── Students List ─────────────────────────────────── */}
//       {studentsList.length > 0 && (
//         <>
//           <div style={s.subHeading}>Students List</div>
//           <table style={s.table}>
//             <thead>
//               <tr>
//                 {["Sr No", "Student PO", "Unique Number", "Student Name", "Fees Year", "Fees Amount"].map((h) => (
//                   <th key={h} style={s.th}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {studentsList.map((r, i) => (
//                 <tr key={r.id || i}>
//                   <td style={s.td}>{i + 1}</td>
//                   <td style={s.td}>{r.studentPO}</td>
//                   <td style={s.td}>{r.uniqueNumber}</td>
//                   <td style={{ ...s.td, color: "#17a2b8" }}>{r.studentName}</td>
//                   <td style={s.td}>{r.feesYear}</td>
//                   <td style={s.td}>{Number(r.feesAmount).toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </>
//       )}

//       {/* ── Arrears Details ───────────────────────────────── */}
//       <div style={s.subHeading}>Arrears Details</div>
//       <div style={s.grid4}>
//         <div>
//           <label style={s.label}>Amount</label>
//           <input style={s.input} type="number" value={arrearInput.amount} onChange={setA("amount")} />
//         </div>
//         <div>
//           <label style={s.label}>BillNo</label>
//           <input style={s.input} value={arrearInput.billNo} onChange={setA("billNo")} />
//         </div>
//         <div>
//           <label style={s.label}>Date</label>
//           <input style={s.input} type="date" value={arrearInput.date} onChange={setA("date")} />
//         </div>
//         <div>
//           <label style={s.label}>Remarks</label>
//           <input style={s.input} value={arrearInput.remarks} onChange={setA("remarks")} />
//         </div>
//         <div>
//           <button style={s.btnGreen} onClick={handleAddArrear}>Add</button>
//         </div>
//       </div>
//       <table style={s.table}>
//         <thead>
//           <tr>
//             {["Sr No", "Amount", "Bill No", "Date", "Remarks", "Delete"].map((h) => (
//               <th key={h} style={s.th}>{h}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {arrearRows.length === 0 ? (
//             <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#aaa" }}></td></tr>
//           ) : (
//             arrearRows.map((r, i) => (
//               <tr key={r.id}>
//                 <td style={s.td}>{i + 1}</td>
//                 <td style={s.td}>{r.amount}</td>
//                 <td style={s.td}>{r.billNo}</td>
//                 <td style={s.td}>{r.date}</td>
//                 <td style={s.td}>{r.remarks}</td>
//                 <td style={s.td}>
//                   <button style={s.btnDelete} onClick={() => deleteArrear(r.id)}>Delete</button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//       {/* ── Deduction Details ─────────────────────────────── */}
//       <div style={s.subHeading}>Deduction Details</div>
//       <div style={s.grid4}>
//         <div>
//           <label style={s.label}>Amount</label>
//           <input style={s.input} type="number" value={deductInput.amount} onChange={setD("amount")} />
//         </div>
//         <div>
//           <label style={s.label}>BillNo</label>
//           <input style={s.input} value={deductInput.billNo} onChange={setD("billNo")} />
//         </div>
//         <div>
//           <label style={s.label}>Date</label>
//           <input style={s.input} type="date" value={deductInput.date} onChange={setD("date")} />
//         </div>
//         <div>
//           <label style={s.label}>Remarks</label>
//           <input style={s.input} value={deductInput.remarks} onChange={setD("remarks")} />
//         </div>
//         <div>
//           <button style={s.btnGreen} onClick={handleAddDeduction}>Add</button>
//         </div>
//       </div>
//       <table style={s.table}>
//         <thead>
//           <tr>
//             {["Sr No", "Amount", "Bill No", "Date", "Remarks", "Delete"].map((h) => (
//               <th key={h} style={s.th}>{h}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {deductRows.length === 0 ? (
//             <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#aaa" }}></td></tr>
//           ) : (
//             deductRows.map((r, i) => (
//               <tr key={r.id}>
//                 <td style={s.td}>{i + 1}</td>
//                 <td style={s.td}>{r.amount}</td>
//                 <td style={s.td}>{r.billNo}</td>
//                 <td style={s.td}>{r.date}</td>
//                 <td style={s.td}>{r.remarks}</td>
//                 <td style={s.td}>
//                   <button style={s.btnDelete} onClick={() => deleteDeduction(r.id)}>Delete</button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//       {/* ── PO Deductions (read-only) ─────────────────────── */}
//       <div style={s.subHeading}>PO Deductions</div>
//       <table style={s.table}>
//         <thead>
//           <tr>
//             {["Deductions Added By", "Deductions Amount", "Remarks", "Add/Remove Deductions"].map((h) => (
//               <th key={h} style={s.th}>{h}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {poDeductions.length === 0 ? (
//             <tr><td colSpan={4} style={{ ...s.td, textAlign: "center", color: "#aaa" }}></td></tr>
//           ) : (
//             poDeductions.map((r, i) => (
//               <tr key={i}>
//                 <td style={s.td}>{r.deductionsAddedBy || r.addedBy || "—"}</td>
//                 <td style={s.td}>{r.deductionsAmount}</td>
//                 <td style={s.td}>{r.remarks}</td>
//                 <td style={s.td}>
//                   <button
//                     style={s.btnDelete}
//                     onClick={() => setPoDeductions((p) => p.filter((_, j) => j !== i))}
//                   >
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//       {/* ── Summary totals row ────────────────────────────── */}
//       <div style={s.summaryRow}>
//         <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//           <label style={s.label}>Total Fees <span style={s.req}>*</span></label>
//           <input style={{ ...s.inputGrey, width: 160 }} value={totalFees ? totalFees.toFixed(2) : ""} readOnly />
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//           <label style={s.label}>Total Arrears</label>
//           <input style={{ ...s.inputGrey, width: 130 }} value={totalArrears || 0} readOnly />
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//           <label style={s.label}>Total Deductions</label>
//           <input style={{ ...s.inputGrey, width: 140 }} value={totalDeductions || ""} readOnly />
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//           <label style={s.label}>Total PO Deductions</label>
//           <input style={{ ...s.inputGrey, width: 150 }} value={totalPODed || ""} readOnly />
//         </div>
//         <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
//           <span style={{ fontSize: 13, color: "#333" }}>Final Total Fees</span>
//           <span style={s.finalAmt}>{finalTotalFees ? finalTotalFees.toFixed(2) : "0.00"}</span>
//         </div>
//       </div>

//       {/* ── Bill Remarks ──────────────────────────────────── */}
//       <div style={{ marginBottom: 20 }}>
//         <label style={s.label}>Bill Remarks <span style={s.req}>*</span></label>
//         <input
//           style={{ ...s.input, border: "1px solid #17a2b8" }}
//           value={billRemarks}
//           onChange={(e) => setBillRemarks(e.target.value)}
//         />
//       </div>

//       {/* ── UID Verification ──────────────────────────────── */}
//       <div style={{ marginBottom: 14 }}>
//         <div style={{ fontSize: 13, fontWeight: 600, color: "#e53935", marginBottom: 8 }}>
//           Steps for UID verification :-
//         </div>
//         <div style={s.uidBox}>
//           <span style={{ marginRight: 8 }}>•</span>
//           For Capturing finger print and verifying press &apos;Capture&apos; button
//         </div>
//         <div style={s.captureBox}>
//           <span style={{ fontSize: 13, color: "#555" }}>
//             Click here to capture Right Hand FingerPrint &amp; to verify UID
//           </span>
//           <button style={s.btnCapture} onClick={() => alert("Capture fingerprint triggered")}>
//             Capture
//           </button>
//         </div>
//       </div>

//       {/* ── Save / Reset ──────────────────────────────────── */}
//       <div style={{ display: "flex", gap: 10, justifyContent: "center", paddingBottom: 32 }}>
//         <button style={s.btnGreen} onClick={handleSave} disabled={saving}>
//           {saving ? "Saving…" : "Save"}
//         </button>
//         <button style={s.btnOrange} onClick={handleReset}>Reset</button>
//       </div>
//     </div>
//   );
// }
// --------------> po list hardcoded
// ============================================================
//  src/sections/Billgeneration.jsx
//  ATC — Bill Generation (Full API Integration)
//
//  NOTE: PO list is hardcoded until PO master API is ready.
//        When API is ready, replace PO_LIST with API call.
//
//  APIs used (all from liferay.js):
//  GET  /o/c/transactionmasters       → Transaction dropdown
//  GET  /o/c/namankitschoolprofiles   → Schools filtered by poNameId
//  GET  /o/c/schoolgradings           → Fees per student (assignedFees)
//  POST /o/c/billgenerations          → Save main bill
//  POST /o/c/billadmissionsummary     → Save admission summary rows
//  POST /o/c/billstudents             → Save student rows
//  POST /o/c/billarrears              → Save arrear rows
//  POST /o/c/billdeductions           → Save deduction rows
//  GET  /o/c/billgenerations          → Load existing bill
//  GET  /o/c/billarrears              → Load existing arrears
//  GET  /o/c/billdeductions           → Load existing deductions
//  GET  /o/c/billpodeductions         → Load PO deductions
// ============================================================
import { useState, useEffect } from "react";
import {
  apiFetch,
  apiPost,
  apiPatch,
  saveBillGeneration,
  saveBillAdmissionSummary,
  saveBillStudent,
  saveBillArrear,
  saveBillDeduction,
  getBillArrears,
  getBillDeductions,
  getBillPODeductions,
  getBillStudents,
} from "../api/liferay";

// ── Hardcoded PO list (replace with API when master is ready) ─
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

const getAllSchools = () =>
  apiFetch("/o/c/namankitschoolprofiles?pageSize=200&sort=dateCreated:desc")
    .then((d) => d.items || []);

const getSchoolGrading = (schoolProfileId) =>
  apiFetch(`/o/c/schoolgradings?filter=schoolProfileId eq ${schoolProfileId}&pageSize=1`)
    .then((d) => (d.items || [])[0] || null);

const getExistingBill = (transactionId, schoolId) =>
  apiFetch(
    `/o/c/billgenerations?filter=transactionId eq ${transactionId} and schoolId eq ${schoolId}&pageSize=1&sort=dateCreated:desc`
  ).then((d) => (d.items || [])[0] || null);

const patchBillGeneration = (id, payload) =>
  apiPatch(`/o/c/billgenerations/${id}`, payload);

// ── Styles ────────────────────────────────────────────────────
const s = {
  page:       { padding: "20px 24px", fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: 13, color: "#333", background: "#fff" },
  heading:    { fontSize: 18, fontWeight: 600, color: "#222", paddingBottom: 10, borderBottom: "1px solid #ddd", marginBottom: 20 },
  subHeading: { fontSize: 15, fontWeight: 600, color: "#17a2b8", borderBottom: "2px solid #e8c84a", paddingBottom: 4, marginBottom: 16, marginTop: 28 },
  label:      { display: "block", fontSize: 12, color: "#333", marginBottom: 4 },
  req:        { color: "#e53935", marginLeft: 2 },
  input:      { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none" },
  inputGrey:  { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#e9ecef", outline: "none" },
  select:     { width: "100%", boxSizing: "border-box", border: "1px solid #ced4da", borderRadius: 3, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none", cursor: "pointer" },
  grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 18px", marginBottom: 14 },
  grid4:      { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px 10px", alignItems: "flex-end", marginBottom: 10 },
  btnGreen:   { background: "#28a745", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnOrange:  { background: "#fd7e14", color: "#fff", border: "none", borderRadius: 3, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnCapture: { background: "#17a2b8", color: "#fff", border: "none", borderRadius: 20, padding: "7px 24px", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  btnDelete:  { background: "#dc3545", color: "#fff", border: "none", borderRadius: 3, padding: "4px 12px", fontSize: 12, cursor: "pointer" },
  table:      { width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 },
  th:         { padding: "9px 12px", background: "#fff", border: "1px solid #dee2e6", fontWeight: 600, textAlign: "left", color: "#222" },
  td:         { padding: "8px 12px", border: "1px solid #dee2e6", color: "#333", verticalAlign: "middle" },
  summaryRow: { display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap", marginTop: 18, marginBottom: 14 },
  finalAmt:   { fontSize: 22, fontWeight: 700, color: "#e53935" },
  uidBox:     { background: "#fffbea", border: "1px solid #e8c84a", borderRadius: 3, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#555" },
  captureBox: { background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 3, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  alert:      { padding: "10px 14px", borderRadius: 3, fontSize: 13, marginBottom: 14 },
  err:        { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
  suc:        { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
};

const emptyArrear    = { amount: "", billNo: "", date: "", remarks: "" };
const emptyDeduction = { amount: "", billNo: "", date: "", remarks: "" };

export default function BillGeneration() {
  // ── Dropdown data ─────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [schoolList,   setSchoolList]   = useState([]);   // schools filtered by PO
  const [allSchools,   setAllSchools]   = useState([]);   // all schools (loaded once)

  // ── Header filters ────────────────────────────────────────
  const [transaction, setTransaction] = useState("");
  const [po,          setPo]          = useState("");
  const [school,      setSchool]      = useState("");
  const [billDate,    setBillDate]    = useState("");

  // ── Search result data ────────────────────────────────────
  const [searched,          setSearched]          = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [summaryRows,       setSummaryRows]       = useState([]);
  const [studentsList,      setStudentsList]      = useState([]);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [totalFees,         setTotalFees]         = useState(0);

  // ── Saved bill id (after first save / if existing) ───────
  const [billId, setBillId] = useState(null);

  // ── Arrears ────────────────────────────────────────────────
  const [arrearInput, setArrearInput] = useState(emptyArrear);
  const [arrearRows,  setArrearRows]  = useState([]);

  // ── Deductions ────────────────────────────────────────────
  const [deductInput, setDeductInput] = useState(emptyDeduction);
  const [deductRows,  setDeductRows]  = useState([]);

  // ── PO Deductions (read-only from Liferay) ────────────────
  const [poDeductions, setPoDeductions] = useState([]);

  // ── Bottom ────────────────────────────────────────────────
  const [billRemarks, setBillRemarks] = useState("");

  // ── UI state ─────────────────────────────────────────────
  const [saving,  setSaving]  = useState(false);
  const [alert,   setAlert]   = useState(null);

  // ── Auto-calc ────────────────────────────────────────────
  const totalArrears    = arrearRows.reduce((s, r)   => s + (Number(r.amount) || 0), 0);
  const totalDeductions = deductRows.reduce((s, r)   => s + (Number(r.amount) || 0), 0);
  const totalPODed      = poDeductions.reduce((s, r) => s + (Number(r.deductionsAmount) || 0), 0);
  const finalTotalFees  = totalFees + totalArrears - totalDeductions - totalPODed;

  // ── Load transactions + all schools on mount ──────────────
  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]));

    getAllSchools()
      .then((schools) => {
        setAllSchools(schools);
      })
      .catch(() => setAllSchools([]));
  }, []);

  // ── Filter schools when PO changes ───────────────────────
useEffect(() => {
  if (!po) { setSchoolList([]); setSchool(""); return; }
  // TODO: filter by poNameId when PO master IDs are mapped to Liferay IDs
  // For now show all schools so bill generation can be tested
  setSchoolList(allSchools);
  setSchool("");
}, [po, allSchools]);

  // ── Search ────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!transaction || !po || !school) {
      setAlert({ type: "err", message: "Please select Transaction, PO and School." });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      // 1. Get school grading to determine fees per student
      const grading = await getSchoolGrading(school);
      const feesPerStudent = grading?.assignedFees || grading?.finalFees || 0;

      // 2. Get approved students for this school
      const students = await apiFetch(
        `/o/c/namankitstudents?filter=schoolProfileId eq ${school}&pageSize=200&sort=dateCreated:desc`
      ).then((d) => d.items || []).catch(() => []);

      // 3. Group by admission year for summary table
      const grouped = {};
      students.forEach((st) => {
        const yr = st.admissionYear || st.currentClass || "2025-2026";
        if (!grouped[yr]) {
          grouped[yr] = {
            admissionYear: yr,
            noOfStudents: 0,
            feesPerYear: feesPerStudent,
            totalFeesYear: 0,
          };
        }
        grouped[yr].noOfStudents++;
        grouped[yr].totalFeesYear += feesPerStudent;
      });

      const summary = Object.values(grouped);
      const totalFeesCal = summary.reduce((s, r) => s + r.totalFeesYear, 0);

      // 4. Build students list with distributed fees
      const studentsWithFees = students.map((st) => ({
        id:          st.id,
        studentPO:   po,
        uniqueNumber: st.uniqueNumber || st.id,
        studentName: `${st.firstName || ""} ${st.middleName || ""} ${st.lastName || ""}`.trim(),
        feesYear:    st.admissionYear || "2025-2026",
        feesAmount:  feesPerStudent,
      }));

      setSummaryRows(summary);
      setStudentsList(studentsWithFees);
      setTotalStudentCount(students.length);
      setTotalFees(totalFeesCal);
      setSearched(true);

      // 5. Check if a bill already exists for this transaction+school
      const existing = await getExistingBill(transaction, school);
      if (existing) {
        setBillId(existing.id);
        setBillDate(existing.billDate ? existing.billDate.split("T")[0] : "");
        setBillRemarks(existing.billRemarks || "");

        // Load child tables
        const [arrears, deductions, poDeds] = await Promise.all([
          getBillArrears(existing.id),
          getBillDeductions(existing.id),
          getBillPODeductions(existing.id),
        ]);
        setArrearRows(arrears.map((r) => ({ ...r, _saved: true })));
        setDeductRows(deductions.map((r) => ({ ...r, _saved: true })));
        setPoDeductions(poDeds);
      }
    } catch (e) {
      setAlert({ type: "err", message: "Search failed — " + e.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Add Arrear ────────────────────────────────────────────
  const handleAddArrear = () => {
    if (!arrearInput.amount) {
      setAlert({ type: "err", message: "Arrear amount is required." });
      return;
    }
    setArrearRows((p) => [...p, { ...arrearInput, id: Date.now(), _saved: false }]);
    setArrearInput(emptyArrear);
  };
  const deleteArrear = (id) => setArrearRows((p) => p.filter((r) => r.id !== id));

  // ── Add Deduction ─────────────────────────────────────────
  const handleAddDeduction = () => {
    if (!deductInput.amount) {
      setAlert({ type: "err", message: "Deduction amount is required." });
      return;
    }
    setDeductRows((p) => [...p, { ...deductInput, id: Date.now(), _saved: false }]);
    setDeductInput(emptyDeduction);
  };
  const deleteDeduction = (id) => setDeductRows((p) => p.filter((r) => r.id !== id));

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!billDate)    { setAlert({ type: "err", message: "Bill Date is required." }); return; }
    if (!billRemarks) { setAlert({ type: "err", message: "Bill Remarks is required." }); return; }

    setSaving(true);
    setAlert(null);

    try {
      // 1. Save / update main bill record
      const billPayload = {
        transactionId:     Number(transaction),
        po,
        schoolId:          Number(school),
        billDate,
        totalStudentCount,
        totalFees,
        totalArrears,
        totalDeductions,
        totalPODeductions: totalPODed,
        finalTotalFees,
        billRemarks,
        billStatus:        "Draft",
      };

      let currentBillId = billId;
      if (billId) {
        await patchBillGeneration(billId, billPayload);
      } else {
        const res = await saveBillGeneration(billPayload);
        currentBillId = res.id;
        setBillId(res.id);
      }

      // 2. Save admission summary rows
      for (const row of summaryRows) {
        await saveBillAdmissionSummary({
          billGenerationId: currentBillId,
          admissionYear:    row.admissionYear,
          noOfStudents:     row.noOfStudents,
          feesPerYear:      row.feesPerYear,
          totalFeesYear:    row.totalFeesYear,
        });
      }

      // 3. Save student rows
      for (const st of studentsList) {
        await saveBillStudent({
          billGenerationId: currentBillId,
          schoolId:         Number(school),
          studentId:        st.id,
          studentName:      st.studentName,
          uniqueNumber:     st.uniqueNumber,
          feesYear:         st.feesYear,
          feesAmount:       st.feesAmount,
          po,
        });
      }

      // 4. Save new arrear rows (skip already saved)
      const newArrears = arrearRows.filter((r) => !r._saved);
      for (const row of newArrears) {
        await saveBillArrear({
          billGenerationId: currentBillId,
          amount:           Number(row.amount),
          billNo:           row.billNo,
          date:             row.date,
          remarks:          row.remarks,
        });
      }
      setArrearRows((p) => p.map((r) => ({ ...r, _saved: true })));

      // 5. Save new deduction rows (skip already saved)
      const newDeductions = deductRows.filter((r) => !r._saved);
      for (const row of newDeductions) {
        await saveBillDeduction({
          billGenerationId: currentBillId,
          amount:           Number(row.amount),
          billNo:           row.billNo,
          date:             row.date,
          remarks:          row.remarks,
        });
      }
      setDeductRows((p) => p.map((r) => ({ ...r, _saved: true })));

      setAlert({ type: "suc", message: "Bill saved successfully!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setAlert({ type: "err", message: "Save failed — " + e.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    setTransaction(""); setPo(""); setSchool(""); setBillDate("");
    setSearched(false); setSummaryRows([]); setStudentsList([]);
    setTotalStudentCount(0); setTotalFees(0); setBillId(null);
    setArrearInput(emptyArrear); setArrearRows([]);
    setDeductInput(emptyDeduction); setDeductRows([]);
    setPoDeductions([]); setBillRemarks(""); setAlert(null);
  };

  // ── Field setter helpers ──────────────────────────────────
  const setA = (k) => (e) => setArrearInput((p) => ({ ...p, [k]: e.target.value }));
  const setD = (k) => (e) => setDeductInput((p) => ({ ...p, [k]: e.target.value }));

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.heading}>Bill Generation</div>

      {/* Alert */}
      {alert && (
        <div style={{ ...s.alert, ...s[alert.type] }}>
          {alert.message}
          <span onClick={() => setAlert(null)} style={{ float: "right", cursor: "pointer", fontWeight: 700 }}>×</span>
        </div>
      )}

      {/* ── Row 1: Transaction | PO | School | Search ────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px 18px", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <label style={s.label}>Transaction <span style={s.req}>*</span></label>
          <select style={s.select} value={transaction} onChange={(e) => setTransaction(e.target.value)}>
            <option value="">--Select--</option>
            {transactions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.transactionName} {t.percent ? `(${t.percent}%)` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={s.label}>PO <span style={s.req}>*</span></label>
          <select style={s.select} value={po} onChange={(e) => setPo(e.target.value)}>
            <option value="">--Select--</option>
            {PO_LIST.map((p) => (
              <option key={p.po_id} value={p.po_id}>{p.po_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={s.label}>School <span style={s.req}>*</span></label>
          <select style={s.select} value={school} onChange={(e) => setSchool(e.target.value)} disabled={!po}>
            <option value="">--Select--</option>
            {schoolList.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.schoolName || sc.name || sc.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            style={{ ...s.btnGreen, padding: "7px 22px" }}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* ── Row 2: Bill Date | Total Student Count ────────── */}
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Bill Date <span style={s.req}>*</span></label>
          <input style={s.input} type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Total Student count <span style={s.req}>*</span></label>
          <input style={s.inputGrey} value={searched ? totalStudentCount : ""} readOnly />
        </div>
      </div>

      {/* ── Admission Summary Table ───────────────────────── */}
      {summaryRows.length > 0 && (
        <table style={s.table}>
          <thead>
            <tr>
              {["Sr No", "Admission Year", "No of Students", "Fees Per Year", "Total Fees Year"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((r, i) => (
              <tr key={i}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}>{r.admissionYear}</td>
                <td style={s.td}>{r.noOfStudents}</td>
                <td style={s.td}>{Number(r.feesPerYear).toFixed(2)}</td>
                <td style={s.td}>{Number(r.totalFeesYear).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Students List ─────────────────────────────────── */}
      {studentsList.length > 0 && (
        <>
          <div style={s.subHeading}>Students List</div>
          <table style={s.table}>
            <thead>
              <tr>
                {["Sr No", "Student PO", "Unique Number", "Student Name", "Fees Year", "Fees Amount"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentsList.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={s.td}>{r.studentPO}</td>
                  <td style={s.td}>{r.uniqueNumber}</td>
                  <td style={{ ...s.td, color: "#17a2b8" }}>{r.studentName}</td>
                  <td style={s.td}>{r.feesYear}</td>
                  <td style={s.td}>{Number(r.feesAmount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Arrears Details ───────────────────────────────── */}
      <div style={s.subHeading}>Arrears Details</div>
      <div style={s.grid4}>
        <div>
          <label style={s.label}>Amount</label>
          <input style={s.input} type="number" value={arrearInput.amount} onChange={setA("amount")} />
        </div>
        <div>
          <label style={s.label}>BillNo</label>
          <input style={s.input} value={arrearInput.billNo} onChange={setA("billNo")} />
        </div>
        <div>
          <label style={s.label}>Date</label>
          <input style={s.input} type="date" value={arrearInput.date} onChange={setA("date")} />
        </div>
        <div>
          <label style={s.label}>Remarks</label>
          <input style={s.input} value={arrearInput.remarks} onChange={setA("remarks")} />
        </div>
        <div>
          <button style={s.btnGreen} onClick={handleAddArrear}>Add</button>
        </div>
      </div>
      <table style={s.table}>
        <thead>
          <tr>
            {["Sr No", "Amount", "Bill No", "Date", "Remarks", "Delete"].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arrearRows.length === 0 ? (
            <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#aaa" }}></td></tr>
          ) : (
            arrearRows.map((r, i) => (
              <tr key={r.id}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}>{r.amount}</td>
                <td style={s.td}>{r.billNo}</td>
                <td style={s.td}>{r.date}</td>
                <td style={s.td}>{r.remarks}</td>
                <td style={s.td}>
                  <button style={s.btnDelete} onClick={() => deleteArrear(r.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Deduction Details ─────────────────────────────── */}
      <div style={s.subHeading}>Deduction Details</div>
      <div style={s.grid4}>
        <div>
          <label style={s.label}>Amount</label>
          <input style={s.input} type="number" value={deductInput.amount} onChange={setD("amount")} />
        </div>
        <div>
          <label style={s.label}>BillNo</label>
          <input style={s.input} value={deductInput.billNo} onChange={setD("billNo")} />
        </div>
        <div>
          <label style={s.label}>Date</label>
          <input style={s.input} type="date" value={deductInput.date} onChange={setD("date")} />
        </div>
        <div>
          <label style={s.label}>Remarks</label>
          <input style={s.input} value={deductInput.remarks} onChange={setD("remarks")} />
        </div>
        <div>
          <button style={s.btnGreen} onClick={handleAddDeduction}>Add</button>
        </div>
      </div>
      <table style={s.table}>
        <thead>
          <tr>
            {["Sr No", "Amount", "Bill No", "Date", "Remarks", "Delete"].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deductRows.length === 0 ? (
            <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "#aaa" }}></td></tr>
          ) : (
            deductRows.map((r, i) => (
              <tr key={r.id}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}>{r.amount}</td>
                <td style={s.td}>{r.billNo}</td>
                <td style={s.td}>{r.date}</td>
                <td style={s.td}>{r.remarks}</td>
                <td style={s.td}>
                  <button style={s.btnDelete} onClick={() => deleteDeduction(r.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── PO Deductions (read-only) ─────────────────────── */}
      <div style={s.subHeading}>PO Deductions</div>
      <table style={s.table}>
        <thead>
          <tr>
            {["Deductions Added By", "Deductions Amount", "Remarks", "Add/Remove Deductions"].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {poDeductions.length === 0 ? (
            <tr><td colSpan={4} style={{ ...s.td, textAlign: "center", color: "#aaa" }}></td></tr>
          ) : (
            poDeductions.map((r, i) => (
              <tr key={i}>
                <td style={s.td}>{r.deductionsAddedBy || r.addedBy || "—"}</td>
                <td style={s.td}>{r.deductionsAmount}</td>
                <td style={s.td}>{r.remarks}</td>
                <td style={s.td}>
                  <button
                    style={s.btnDelete}
                    onClick={() => setPoDeductions((p) => p.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Summary totals row ────────────────────────────── */}
      <div style={s.summaryRow}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={s.label}>Total Fees <span style={s.req}>*</span></label>
          <input style={{ ...s.inputGrey, width: 160 }} value={totalFees ? totalFees.toFixed(2) : ""} readOnly />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={s.label}>Total Arrears</label>
          <input style={{ ...s.inputGrey, width: 130 }} value={totalArrears || 0} readOnly />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={s.label}>Total Deductions</label>
          <input style={{ ...s.inputGrey, width: 140 }} value={totalDeductions || ""} readOnly />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={s.label}>Total PO Deductions</label>
          <input style={{ ...s.inputGrey, width: 150 }} value={totalPODed || ""} readOnly />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#333" }}>Final Total Fees</span>
          <span style={s.finalAmt}>{finalTotalFees ? finalTotalFees.toFixed(2) : "0.00"}</span>
        </div>
      </div>

      {/* ── Bill Remarks ──────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label style={s.label}>Bill Remarks <span style={s.req}>*</span></label>
        <input
          style={{ ...s.input, border: "1px solid #17a2b8" }}
          value={billRemarks}
          onChange={(e) => setBillRemarks(e.target.value)}
        />
      </div>

      {/* ── UID Verification ──────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e53935", marginBottom: 8 }}>
          Steps for UID verification :-
        </div>
        <div style={s.uidBox}>
          <span style={{ marginRight: 8 }}>•</span>
          For Capturing finger print and verifying press &apos;Capture&apos; button
        </div>
        <div style={s.captureBox}>
          <span style={{ fontSize: 13, color: "#555" }}>
            Click here to capture Right Hand FingerPrint &amp; to verify UID
          </span>
          <button style={s.btnCapture} onClick={() => alert("Capture fingerprint triggered")}>
            Capture
          </button>
        </div>
      </div>

      {/* ── Save / Reset ──────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", paddingBottom: 32 }}>
        <button style={s.btnGreen} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button style={s.btnOrange} onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}