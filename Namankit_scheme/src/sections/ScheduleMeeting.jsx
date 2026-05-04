import React, { useState } from "react";
import Footer from "./Footer";
import Header from "../components/Header";
import { apiPost } from "../api/liferay";
import { uploadFileToFolder } from "../api/upload";
import { Alert } from "../components/FormFields";
import { validateGRDetails } from "../utils/validate";

export default function ScheduleMeeting() {
    const emptyForm = { committeeDate: "", grDate: "", atcName: "", schoolType: "", grFile: null, momFile: null, description: "" };

    const [view, setView] = useState("list");
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);

    // sample meeting data — replace with API data as needed
    const [meetings] = useState([
        { id: 1, grDate: "2026-03-20", meetingDate: "2026-03-20", atc: "Thane", description: "After Approval of school from both ATC and Po Decision will be taken whether school is approved, cancelled or rejected", schoolType: "NEW" },
        { id: 2, grDate: "2025-03-04", meetingDate: "2025-03-05", atc: "Amravati", description: "vvv", schoolType: "OLD" },
        { id: 3, grDate: "2025-01-21", meetingDate: "2025-01-21", atc: "Thane", description: "Test 21.01.2025", schoolType: "OLD" },
    ]);

    const formatDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        try {
            return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        } catch (e) {
            return iso;
        }
    };

    // pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const totalPages = Math.max(1, Math.ceil(meetings.length / rowsPerPage));
    const visibleMeetings = meetings.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleRowsPerPageChange = (e) => {
        const v = parseInt(e.target.value, 10) || 5;
        setRowsPerPage(v);
        setPage(1);
    };

    const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) setForm(prev => ({ ...prev, [name]: files[0] }));
        else setForm(prev => ({ ...prev, [name]: value }));
        setErrors((s) => ({ ...s, [name]: undefined }));
    };

    const handleNewMeeting = () => {
        setForm(emptyForm);
        setView("details");
    };

    const handleView = (meeting) => {
        setForm({
            committeeDate: meeting.meetingDate || "",
            grDate: meeting.grDate || "",
            atcName: meeting.atc || "",
            schoolType: meeting.schoolType || "",
            grFile: null,
            momFile: null,
            description: meeting.description || "",
        });
        setView("details");
    };

    const handleReset = () => {
        setForm(emptyForm);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const errs = validateGRDetails(form);
        setErrors(errs);

        // If file-type specific errors exist for PDF requirement, show prominent alert (and browser alert to match existing UX)
        if (errs.grFile && errs.grFile.toLowerCase().includes("pdf")) {
            const msg = errs.grFile;
            setAlert({ type: "error", message: msg });
            try { window.alert(msg); } catch (e) { }
            return;
        }
        if (errs.momFile && errs.momFile.toLowerCase().includes("pdf")) {
            const msg = errs.momFile;
            setAlert({ type: "error", message: msg });
            try { window.alert(msg); } catch (e) { }
            return;
        }

        if (Object.keys(errs).length > 0) return;

        setAlert(null);
        try {
            const uploadedGR = form.grFile ? await uploadFileToFolder(form.grFile, "GR Documents") : null;
            const uploadedMOM = form.momFile ? await uploadFileToFolder(form.momFile, "GR Documents") : null;

            const payload = {
                aTCName: form.atcName,
                briefDescription: form.description,
                commiteeMeetingDate: form.committeeDate,
                gRDate: form.grDate,
                schoolType: form.schoolType,
                uploadGRFile: uploadedGR
                    ? {
                        id: uploadedGR.documentId,
                        name: uploadedGR.title,
                        fileURL: uploadedGR.downloadURL,
                        fileBase64: "",
                        folder: { externalReferenceCode: "", siteId: 0 },
                    }
                    : null,
                uploadMOMFile: uploadedMOM
                    ? {
                        id: uploadedMOM.documentId,
                        name: uploadedMOM.title,
                        fileURL: uploadedMOM.downloadURL,
                        fileBase64: "",
                        folder: { externalReferenceCode: "", siteId: 0 },
                    }
                    : null,
            };

            const res = await apiPost("/o/c/grdetails", payload);
            setAlert({ type: "success", message: `GR record saved (id=${res?.id || "-"})` });
            setForm(emptyForm);
        } catch (err) {
            console.error(err);
            setAlert({ type: "error", message: err.message || "Failed to save GR details" });
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fbfb", fontFamily: "var(--font-main)", display: "flex", flexDirection: "column" }}>
            {/* <div style={{ background: "#1a2a5e", padding: "12px 24px", color: "#fff", fontWeight: 600 }}>Namankit School Onboarding — Controller Panel</div> */}
            <Header />

            <div style={{ flex: 1, padding: 24 }}>
                {view === "list" ? (
                    <div style={{ background: "#fff", borderRadius: 4, padding: 20, boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}>
                        <h2 style={{ color: "#1aa0b6", marginTop: 0 }}>Meetings Details</h2>
                        <button onClick={handleNewMeeting} style={{ background: "#57b1c9", color: "#fff", padding: "10px 14px", borderRadius: 6, border: "none", cursor: "pointer", marginBottom: 12 }}>New Meeting</button>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                                <thead>
                                    <tr style={{ background: "#f8f9fa" }}>
                                        {['GR Date', 'Meeting Date', 'ATC', 'Brief Description', 'School Type', 'View'].map(h => (
                                            <th key={h} style={{ padding: "12px 16px", background: "#1a2a5e", color: "#fff", fontWeight: 600, fontSize: 13, textAlign: "left", borderRight: "1px solid #2d3d6e", whiteSpace: "nowrap" }}>{h}</th>
                                        ))}



                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleMeetings.map((m, idx) => (
                                        <tr key={m.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fbfbfb", borderBottom: "1px solid #eef2f3" }}>
                                            <td style={{ padding: "11px 16px", fontSize: 13, border: "1px solid #dee2e6" }}>{formatDate(m.grDate)}</td>
                                            <td style={{ padding: "11px 16px", fontSize: 13, border: "1px solid #dee2e6" }}>{formatDate(m.meetingDate)}</td>
                                            <td style={{ padding: "11px 16px", fontSize: 13, border: "1px solid #dee2e6" }}>{m.atc}</td>
                                            <td style={{ padding: "11px 16px", fontSize: 13, border: "1px solid #dee2e6" }}>{m.description}</td>
                                            <td style={{ padding: "11px 16px", fontSize: 13, border: "1px solid #dee2e6" }}>{m.schoolType}</td>
                                            <td style={{ padding: "11px 16px", fontSize: 13, border: "1px solid #dee2e6" }}>
                                                <button onClick={() => handleView(m)} style={{ background: "#17a2b8", color: "#fff", border: "none", padding: "11px 16px", fontSize: 13, borderRadius: 6, cursor: "pointer" }}>View</button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "#666" }}>Rows per page:</span>
                                <select value={rowsPerPage} onChange={handleRowsPerPageChange} style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid #dcdcdc" }}>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <button onClick={() => goToPage(page - 1)} disabled={page === 1} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e6e6e6", background: page === 1 ? "#f5f7f8" : "#fff", color: "#333", cursor: page === 1 ? "default" : "pointer" }}>Previous</button>
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    return (
                                        <button key={p} onClick={() => goToPage(p)} style={{ padding: "6px 12px", borderRadius: 6, border: p === page ? "none" : "1px solid #e6e6e6", background: p === page ? "#122b54" : "#fff", color: p === page ? "#fff" : "#111", cursor: "pointer" }}>{p}</button>
                                    );
                                })}
                                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e6e6e6", background: page === totalPages ? "#f5f7f8" : "#fff", color: "#333", cursor: page === totalPages ? "default" : "pointer" }}>Next</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: "#fff", borderRadius: 4, padding: 20, boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ color: "#1aa0b6", marginTop: 0 }}>GR Details</h2>
                            <button onClick={() => setView("list")} style={{ background: "#fff", color: "#1a2a5e", border: "1px solid #1a2a5e", padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>← Back to List</button>
                        </div>

                        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                        <form onSubmit={handleSearch}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 18 }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: 6 }}>Committee Meeting Date <span style={{ color: "#d9534f" }}>*</span></label>
                                    <input name="committeeDate" type="date" value={form.committeeDate} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ddd" }} />
                                    {errors.committeeDate && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.committeeDate}</div>}
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: 6 }}>GR Date <span style={{ color: "#d9534f" }}>*</span></label>
                                    <input name="grDate" type="date" value={form.grDate} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ddd" }} />
                                    {errors.grDate && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.grDate}</div>}
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: 6 }}>ATC Name <span style={{ color: "#d9534f" }}>*</span></label>
                                    <select name="atcName" value={form.atcName} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #bcd" }}>
                                        <option value="">---Select---</option>
                                        <option>Thane</option>
                                        <option>Amravati</option>
                                    </select>
                                    {errors.atcName && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.atcName}</div>}
                                </div>
                            </div>

                            <div style={{ marginBottom: 18, maxWidth: 420 }}>
                                <label style={{ display: "block", marginBottom: 6 }}>School Type <span style={{ color: "#d9534f" }}>*</span></label>
                                <select name="schoolType" value={form.schoolType} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ddd" }}>
                                    <option value="">---Select---</option>
                                    <option>NEW</option>
                                    <option>OLD</option>
                                </select>
                                {errors.schoolType && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.schoolType}</div>}
                            </div>

                            <div style={{ display: "flex", gap: 30, marginBottom: 18 }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: 6 }}>Upload GR File <span style={{ color: "#d9534f" }}>*</span></label>
                                    <input name="grFile" type="file" onChange={handleChange} />
                                    {errors.grFile && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.grFile}</div>}
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: 6 }}>Upload MOM File <span style={{ color: "#d9534f" }}>*</span></label>
                                    <input name="momFile" type="file" onChange={handleChange} />
                                    {errors.momFile && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.momFile}</div>}
                                </div>
                            </div>

                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: "block", marginBottom: 6 }}>Brief Description <span style={{ color: "#d9534f" }}>*</span></label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={5} style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ddd" }} />
                                {errors.description && <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.description}</div>}
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <button type="submit" style={{ background: "#2ca44a", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 4, cursor: "pointer" }}>Search Schools</button>
                                <button type="button" onClick={handleReset} style={{ background: "#57b1c9", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 4, cursor: "pointer" }}>Reset/New</button>
                            </div>
                        </form>

                        <div style={{ marginTop: 28 }}>
                            <h3 style={{ color: "#1aa0b6", marginBottom: 8 }}>School Details</h3>
                            <div style={{ height: 8, borderBottom: "2px solid #f5b07a" }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
