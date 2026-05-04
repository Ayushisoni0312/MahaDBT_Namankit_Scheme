import React, { useState, useEffect } from 'react'
import Header from '../../components/Header';
import Footer from '../../sections/Footer';
import ExcelJS from 'exceljs';
import { getAllSchools, getStudentApprovalList } from '../../api/liferay';

export default function StudentApproval() {
    const [school, setSchool] = useState('');
    const [rows, setRows] = useState([]);
    const [schoolError, setSchoolError] = useState('');
    const [schools, setSchools] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const handleSearch = async () => {
        // Validate school selection
        if (!school) {
            setSchoolError('Please select a school');
            setRows([]);
            return;
        }
        setSchoolError('');
        try {
            const items = await getStudentApprovalList(school.id);
            const mapped = (items || []).map((it) => ({
                unique: it.uniqueNumber || it.aadharNumberUID || '',
                renewal: it.renewal || it.renewalStatus || '',
                name: it.studentName || `${it.firstName || ''} ${it.lastName || ''}`.trim(),
                aadhar: it.aadharNumberUID || '',
                income: it.familyIncome || '',
                class: it.currentClass || '',
                status: (it.status && it.status.label) || '',
            }));
            setRows(mapped);
            setPage(1);
        } catch (err) {
            console.error('Failed to fetch student approvals', err);
            setRows([]);
            setSchoolError('Failed to load approvals');
        }
    };

    useEffect(() => {
        let mounted = true;
        getAllSchools()
            .then((s) => {
                if (!mounted) return;
                setSchools(s || []);
            })
            .catch((e) => console.error('Failed loading schools', e));
        return () => (mounted = false);
    }, []);
    useEffect(() => {
        console.log('Schools.....Approved..', schools)
    }, [schools])

    const totalPages = Math.max(1, Math.ceil((rows || []).length / pageSize));
    const paged = (rows || []).slice((page - 1) * pageSize, page * pageSize);

    const handleSave = () => {
        // Placeholder: save approvals
        alert('Please select School');
    };

    const handleExport = () => {
        if (!rows || rows.length === 0) {
            alert('No data to export');
            return;
        }

        (async () => {
            try {
                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'School Onboarding';
                const sheet = workbook.addWorksheet('Student Approvals');

                sheet.columns = [
                    { header: 'Sr No', key: 'sr', width: 8 },
                    { header: 'Unique No', key: 'unique', width: 20 },
                    { header: 'Renewal Status', key: 'renewal', width: 18 },
                    { header: 'Student Name', key: 'name', width: 30 },
                    { header: 'Aadhar Number', key: 'aadhar', width: 20 },
                    { header: 'Family Income', key: 'income', width: 15 },
                    { header: 'Class', key: 'class', width: 10 },
                    { header: 'Approval Status', key: 'status', width: 20 },
                ];

                rows.forEach((r, i) => {
                    sheet.addRow({ sr: i + 1, unique: r.unique, renewal: r.renewal, name: r.name, aadhar: r.aadhar, income: r.income, class: r.class, status: r.status });
                });

                // apply styling to header row to match UI
                const headerRow = sheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
                headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
                headerRow.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2A5E' } };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDADFE6' } },
                        left: { style: 'thin', color: { argb: 'FFDADFE6' } },
                        bottom: { style: 'thin', color: { argb: 'FFDADFE6' } },
                        right: { style: 'thin', color: { argb: 'FFDADFE6' } },
                    };
                });

                // style data rows: alternating background and borders, alignment
                (rows || []).forEach((_, idx) => {
                    const excelRow = sheet.getRow(idx + 2);
                    const isAlt = idx % 2 === 1; // match UI: odd index -> alt color
                    excelRow.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFF1F5F8' } },
                            left: { style: 'thin', color: { argb: 'FFF1F5F8' } },
                            bottom: { style: 'thin', color: { argb: 'FFF1F5F8' } },
                            right: { style: 'thin', color: { argb: 'FFF1F5F8' } },
                        };
                        if (isAlt) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
                        }
                        // default alignment: center except name column (4th col)
                        const colIndex = cell.col;
                        cell.alignment = (colIndex === 4) ? { horizontal: 'left', vertical: 'middle' } : { horizontal: 'center', vertical: 'middle' };
                    });
                });

                const buf = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `student-approvals.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Export failed', err);
                alert('Export failed: ' + (err && err.message ? err.message : err));
            }
        })();
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fbfb", fontFamily: "var(--font-main)", display: "flex", flexDirection: "column" }}>
            <Header />
            <div style={{ padding: 18 }}>

                <h6 style={{ margin: 0 }}>Student's Approval</h6>
                <hr style={{ margin: "0px 0px 1rem 0px" }} />
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 14 }}>
                    <div>
                        <div style={{ fontSize: 13, marginBottom: 6 }}>Select School <span style={{ color: '#e53935' }}>*</span></div>
                        <select
                            value={school}
                            onChange={e => { setSchool(e.target.value); setSchoolError(''); }}
                            aria-invalid={!!schoolError}
                            style={{ padding: 8, minWidth: 240, borderColor: schoolError ? '#e53935' : undefined }}
                        >
                            <option value="">--Select--</option>
                            {(schools || []).map((s) => (
                                <option key={s.id} value={s.id}>{s.schoolName}</option>
                            ))}
                        </select>
                        {schoolError && <div style={{ color: '#e53935', fontSize: 12, marginTop: 6 }}>{schoolError}</div>}
                    </div>

                    <button onClick={handleSearch} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}>Search</button>
                </div>

                <div style={{ overflow: 'auto' }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                        <thead style={{ background: '#fafafa' }}>
                            <th style={thStyle}></th>
                            <tr>{["Sr. No.", "Student Unq. No.", "Renewal Status", "Student Name", "Aadhar Number", "Family Income", "Class", "View Student Details", "Approve", "Remarks", "Approval Status"].map(title => (
                                <th style={{ padding: "12px 16px", background: "#1a2a5e", color: "#fff", fontWeight: 600, fontSize: 13, textAlign: "left", borderRight: "1px solid #2d3d6e", whiteSpace: "nowrap" }}>{title}</th>

                            ))}

                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr style={{ textAlign: "center" }}>
                                    <td colSpan={11} style={{ padding: 20, textAlign: 'center', color: '#666' }}>No records found</td>
                                </tr>
                            ) : paged.map((r, i) => (
                                <tr key={i}>
                                    <td style={tdStyle}>{(page - 1) * pageSize + i + 1}</td>
                                    <td style={tdStyle}>{r.unique}</td>
                                    <td style={tdStyle}>{r.renewal}</td>
                                    <td style={tdStyle}>{r.name}</td>
                                    <td style={tdStyle}>{r.aadhar}</td>
                                    <td style={tdStyle}>{r.income}</td>
                                    <td style={tdStyle}>{r.class}</td>
                                    <td style={tdStyle}><button style={linkBtn}>View</button></td>
                                    <td style={tdStyle}><input type="checkbox" /></td>
                                    <td style={tdStyle}><input style={{ width: '100%' }} /></td>
                                    <td style={tdStyle}>{r.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination controls */}
                {rows.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 13, color: '#555' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>Rows per page:</span>
                            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: 4, fontSize: 13 }}>
                                {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <PBtn label="Previous" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <PBtn key={n} label={String(n)} onClick={() => setPage(n)} active={n === page} />
                            ))}
                            <PBtn label="Next" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    <button onClick={handleSave} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}>Save</button>
                    <button onClick={handleExport} style={{ background: '#f0ad4e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}>Export to Excel</button>
                </div>
            </div>
        </div>
    )
}

function PBtn({ label, onClick, disabled, active }) {
    return (
        <button onClick={!disabled ? onClick : undefined} style={{
            padding: "5px 12px", fontSize: 13, borderRadius: 4, cursor: disabled ? "default" : "pointer",
            border: `1px solid ${active ? "#1a2a5e" : "#dee2e6"}`,
            background: active ? "#1a2a5e" : disabled ? "#fff" : "#fff",
            color: active ? "#fff" : disabled ? "#aaa" : "#333",
            fontWeight: active ? 600 : 400,
        }}>{label}</button>
    );
}

const thStyle = { padding: '10px 12px', borderBottom: '1px solid #eee', textAlign: 'left', fontSize: 13 };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f5f5f5', fontSize: 13, textAlign: 'center' };
const linkBtn = { background: 'transparent', border: 'none', color: '#1a7a8a', cursor: 'pointer' };