// // ============================================================
// //  src/App.jsx
// //
// //  Routes:
// //  /           → School onboarding (list + details)
// //  /preview    → Print preview page
// //  /po-grading → PO Approval & Grading
// // ============================================================
// import { useState } from "react";
// import "./styles/global.css";
// import TabNav                     from "./components/TabNav";
// import Footer                     from "./sections/Footer";
// import SchoolListPage             from "./sections/SchoolListPage";
// import SchoolBasicDetails         from "./sections/SchoolBasicDetails";
// import LandDetails                from "./sections/LandDetails";
// import HostelDetails              from "./sections/HostelDetails";
// import DiningFacilitiesDetails    from "./sections/Diningfacilitiesdetails";
// import LabDetails                 from "./sections/Labdetails";
// import LibraryDetails             from "./sections/Librarydetails";
// import TeachersDetails            from "./sections/Teachersdetails";
// import ExtraCurriculumActivities  from "./sections/Extracurriculumactivities";
// import SportsFacilities           from "./sections/Sportsfacilities";
// import MedicalFacilities          from "./sections/Medicalfacilities";
// import ProfileFeeMaster           from "./sections/Profilefeemaster";
// import SchoolBankDetails          from "./sections/Schoolbankdetails";
// import FinalSubmit                from "./sections/FinalSubmit";
// import PreviewPage                from "./sections/PreviewPage";
// import POApprovalList             from "./sections/POApprovalList";
// import POGrading                  from "./sections/POGrading";
// import ATCApprovalList            from "./sections/ATCApprovalList";
// import ATCGrading                 from "./sections/ATCGrading";
// import BillGeneration from "./sections/Billgeneration";
// import RestrictEntryMaster       from "./sections/RestrictEntryMaster"; 

// // ── Route: /preview ──────────────────────────────────────────
// // commenting
// if (window.location.pathname === "/preview") {
//   window.__ROUTE__ = "preview";
// } else if (window.location.pathname === "/po-grading") {
//   window.__ROUTE__ = "po-grading";
// } else if (window.location.pathname === "/atc-grading") {
//   window.__ROUTE__ = "atc-grading";
//   } else if (window.location.pathname === "/bill-generation") {
//   window.__ROUTE__ = "bill-generation";
//   } else if (window.location.pathname === "/restrict-entry") {
//   window.__ROUTE__ = "restrict-entry";
// } else {
//   window.__ROUTE__ = "main";
// }

// // ── PO Grading App ────────────────────────────────────────────
// function POGradingApp() {
//   const [view,           setView]           = useState("list");
//   const [selectedSchool, setSelectedSchool] = useState(null);

//   const handleGrading = (school) => {
//     setSelectedSchool(school);
//     setView("grading");
//   };

//   const handleViewDetails = (schoolId) => {
//     window.open(`/?schoolId=${schoolId}`, "_blank");
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: "#f0f4f5", fontFamily: "var(--font-main)", display: "flex", flexDirection: "column" }}>
//       <div style={{ background: "#1a2a5e", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <span style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>Namankit School Onboarding — PO Panel</span>
//         {view === "grading" && (
//           <button onClick={() => setView("list")}
//             style={{ background: "#fff", color: "#1a2a5e", border: "none", borderRadius: 4, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
//             ← Back to List
//           </button>
//         )}
//       </div>
//       <div style={{ flex: 1 }}>
//         {view === "list"
//           ? <POApprovalList onGrading={handleGrading} onViewDetails={handleViewDetails} />
//           : <POGrading school={selectedSchool} onBack={() => setView("list")} />
//         }
//       </div>
//       <Footer />
//     </div>
//   );
// }

// // ── ATC Grading App ──────────────────────────────────────────
// function ATCGradingApp() {
//   const [view,           setView]           = useState("list");
//   const [selectedSchool, setSelectedSchool] = useState(null);

//   const handleGrading = (school) => {
//     setSelectedSchool(school);
//     setView("grading");
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: "#f0f4f5", fontFamily: "var(--font-main)", display: "flex", flexDirection: "column" }}>
//       <div style={{ background: "#1a2a5e", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <span style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>Namankit School Onboarding — ATC Panel</span>
//         {view === "grading" && (
//           <button onClick={() => setView("list")}
//             style={{ background: "#fff", color: "#1a2a5e", border: "none", borderRadius: 4, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
//             ← Back to List
//           </button>
//         )}
//       </div>
//       <div style={{ flex: 1 }}>
//         {view === "list"
//           ? <ATCApprovalList onGrading={handleGrading} onViewDetails={(id) => window.open(`/?schoolId=${id}`, "_blank")} />
//           : <ATCGrading school={selectedSchool} onBack={() => setView("list")} />
//         }
//       </div>
//       <Footer />
//     </div>
//   );
// }

// function BillGenerationApp() {
//   return (
//     <div style={{ minHeight: "100vh", background: "#f0f4f5", fontFamily: "var(--font-main)", display: "flex", flexDirection: "column" }}>
//       <div style={{ background: "#1a2a5e", padding: "12px 24px" }}>
//         <span style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>Namankit School Onboarding — ATC Bill Generation</span>
//       </div>
//       <div style={{ flex: 1, background: "#fff" }}>
//         <BillGeneration />
//       </div>
//       <Footer />
//     </div>
//   );
// }

// // ── Main School Onboarding App ────────────────────────────────
// function MainApp() {
//   const [view,            setView]            = useState("list");
//   const [activeTab,       setActiveTab]       = useState("School Basic Details");
//   const [schoolProfileId, setSchoolProfileId] = useState(null);
//   const [isEditMode,      setIsEditMode]      = useState(false);

//   const [masterData, setMasterData] = useState({
//     schoolBasic: {}, landDetails: {}, hostelDetails: {}, diningDetails: {},
//     labDetails: {}, libraryDetails: {}, teacherDetails: {}, extraCurriculum: {},
//     sportsDetails: {}, medicalDetails: {}, feeMaster: {}, bankDetails: {},
//   });

//   const handleSaveSection = (sectionName, data) => {
//     setMasterData(prev => ({ ...prev, [sectionName]: data }));
//   };

//   const handleEdit = (schoolId) => {
//     setSchoolProfileId(schoolId);
//     setIsEditMode(true);
//     setActiveTab("School Basic Details");
//     setView("details");
//   };

//   const handleNewSchool = () => {
//     setSchoolProfileId(null);
//     setIsEditMode(false);
//     setMasterData({
//       schoolBasic: {}, landDetails: {}, hostelDetails: {}, diningDetails: {},
//       labDetails: {}, libraryDetails: {}, teacherDetails: {}, extraCurriculum: {},
//       sportsDetails: {}, medicalDetails: {}, feeMaster: {}, bankDetails: {},
//     });
//     setActiveTab("School Basic Details");
//     setView("details");
//   };

//   const handleBackToList = () => {
//     setView("list");
//     setSchoolProfileId(null);
//     setIsEditMode(false);
//   };

//   const renderTab = () => {
//     switch (activeTab) {
//       case "School Basic Details":
//         return <SchoolBasicDetails
//                   onTabChange={setActiveTab}
//                   schoolProfileId={schoolProfileId}
//                   isEditMode={isEditMode}
//                   onSave={(data) => {
//                     handleSaveSection("schoolBasic", data);
//                     if (data?.schoolId) setSchoolProfileId(data.schoolId);
//                   }}
//                 />;
//       case "Land Details":
//         return <LandDetails onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("landDetails", data)} />;
//       case "Hostel Details":
//         return <HostelDetails onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("hostelDetails", data)} />;
//       case "Dining Facilities Details":
//         return <DiningFacilitiesDetails onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("diningDetails", data)} />;
//       case "Lab Details":
//         return <LabDetails onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("labDetails", data)} />;
//       case "Library Details":
//         return <LibraryDetails onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("libraryDetails", data)} />;
//       case "Teachers Details":
//         return <TeachersDetails onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("teacherDetails", data)} />;
//       case "Extra Curriculum Activities":
//         return <ExtraCurriculumActivities onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("extraCurriculum", data)} />;
//       case "Sports Facilities":
//         return <SportsFacilities onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("sportsDetails", data)} />;
//       case "Medical Facilities":
//         return <MedicalFacilities onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("medicalDetails", data)} />;
//       case "Profile FeeMaster":
//         return <ProfileFeeMaster onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("feeMaster", data)} />;
//       case "School Bank Details":
//         return <SchoolBankDetails onTabChange={setActiveTab} schoolProfileId={schoolProfileId} isEditMode={isEditMode} onSave={(data) => handleSaveSection("bankDetails", data)} />;
//       case "Final Submit":
//         return <FinalSubmit data={masterData} onTabChange={setActiveTab} schoolProfileId={schoolProfileId} />;
//       default:
//         return null;
//     }
//   };

//   if (view === "list") {
//     return (
//       <div style={{ minHeight: "100vh", background: "#f0f4f5", fontFamily: "var(--font-main)", display: "flex", flexDirection: "column" }}>
//         <div style={{ background: "#1a2a5e", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <span style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>Namankit School Onboarding</span>
//           <button onClick={handleNewSchool} style={{ background: "#fff", color: "#1a7a8a", border: "none", borderRadius: 4, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
//             + New School
//           </button>
//         </div>
//         <div style={{ flex: 1 }}>
//           <SchoolListPage onEdit={handleEdit} />
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-main)", display: "flex", flexDirection: "column" }}>
//       <div style={{ background: "#f0f4f5", padding: "8px 20px", borderBottom: "1px solid #dee2e6", display: "flex", alignItems: "center", gap: 12 }}>
//         <button onClick={handleBackToList} style={{ background: "none", border: "1px solid #1a7a8a", color: "#1a7a8a", borderRadius: 4, padding: "5px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
//           ← Back to List
//         </button>
//         {isEditMode && schoolProfileId && (
//           <span style={{ fontSize: 13, color: "#888" }}>
//             Editing School ID: <strong style={{ color: "#1a7a8a" }}>{schoolProfileId}</strong>
//           </span>
//         )}
//       </div>
//       <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
//       <div style={{ background: "#f0f4f5", flex: 1 }}>
//         {renderTab()}
//       </div>
//       <Footer />
//     </div>
//   );
// }

// // ── Root App — picks route ────────────────────────────────────
// export default function App() {
//   const route = window.__ROUTE__;
//   if (route === "preview")     return <PreviewPage />;
//   if (route === "po-grading")  return <POGradingApp />;
//   if (route === "atc-grading") return <ATCGradingApp />;
//   if (route === "bill-generation") return <BillGenerationApp />;
//   if (route === "restrict-entry") return <RestrictEntryMaster />;
//   return <MainApp />;
// }

// ============================================================
//  src/App.jsx
//
//  Role-based routing (replaces window.__ROUTE__ approach):
//    Controller_namankit → ControllerApp  (Restrict Entry + future)
//    PO_namankit         → POApp          (PO Approval + Grading)
//    ATC_namankit        → ATCApp         (ATC Grading + Bill Generation)
//    unknown / null      → UnauthorizedApp
// ============================================================
// ============================================================
//  src/App.jsx
//  Role-based routing + sidebar nav + dev login + logout
// ============================================================
// ============================================================
//  src/App.jsx
//  Role-based routing + sidebar nav + dev login + logout
// ============================================================
// ============================================================
//  src/App.jsx
//  Role-based routing + sidebar nav + dev login + logout
// ============================================================
import { useState, useEffect } from "react";
import React from 'react';
import "./styles/global.css";

import { getUserRole, setDevRole, logout, ROLES } from "./api/auth";
import { loadRestrictEntry } from "./api/RestrictEntryMaster"; // ← NEW

import TabNav                    from "./components/TabNav";
import Footer                    from "./sections/Footer";
import SchoolListPage            from "./sections/SchoolListPage";
import SchoolBasicDetails        from "./sections/SchoolBasicDetails";
import LandDetails               from "./sections/LandDetails";
import HostelDetails             from "./sections/HostelDetails";
import DiningFacilitiesDetails   from "./sections/Diningfacilitiesdetails";
import LabDetails                from "./sections/Labdetails";
import LibraryDetails            from "./sections/Librarydetails";
import TeachersDetails           from "./sections/Teachersdetails";
import ExtraCurriculumActivities from "./sections/Extracurriculumactivities";
import SportsFacilities          from "./sections/Sportsfacilities";
import MedicalFacilities         from "./sections/Medicalfacilities";
import ProfileFeeMaster          from "./sections/Profilefeemaster";
import SchoolBankDetails         from "./sections/Schoolbankdetails";
import FinalSubmit               from "./sections/FinalSubmit";
import PreviewPage               from "./sections/PreviewPage";
import POApprovalList            from "./sections/POApprovalList";
import POGrading                 from "./sections/POGrading";
import ATCApprovalList           from "./sections/ATCApprovalList";
import ATCGrading                from "./sections/ATCGrading";
import BillGeneration            from "./sections/Billgeneration";
import DownloadUploadCancelBill  from "./sections/DownloadUploadCancelBill";
import DownloadGrading           from "./sections/DownloadGrading";
import UpdateGradingComments     from "./sections/UpdateGradingComments";
import RestrictEntryMaster       from "./sections/RestrictEntryMaster";
import TransactionMaster         from "./sections/TransactionMaster";
import BillReport                from "./sections/BillReport";
import SchoolMasterForm          from "./schools/SchoolMasterForm";
import ScheduleMeeting           from "./sections/ScheduleMeeting";
import StudentRegistration       from "./pages/student-master/StudentRegistration";
import StudentApproval           from "./pages/PO/StudentApproval";

const IS_DEV = window.location.hostname === "localhost";

// ── Styles ────────────────────────────────────────────────────
const st = {
  pageWrap: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    fontFamily: "var(--font-main)", background: "#f0f4f5",
  },
  header: {
    background: "#1a2a5e", padding: "0 24px", height: 52,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexShrink: 0,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: 600 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  userBadge: {
    background: "rgba(255,255,255,0.15)", color: "#fff",
    padding: "4px 12px", borderRadius: 20, fontSize: 12,
  },
  logoutBtn: {
    background: "transparent", color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: 4, padding: "5px 14px",
    fontSize: 12, cursor: "pointer",
  },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: {
    width: 210, background: "#1e3a5f", display: "flex",
    flexDirection: "column", flexShrink: 0,
  },
  sidebarLabel: {
    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
    letterSpacing: 1, padding: "18px 16px 6px", textTransform: "uppercase",
  },
  sideItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 16px", cursor: "pointer", fontSize: 13,
    color: active ? "#fff" : "rgba(255,255,255,0.65)",
    background: active ? "rgba(255,255,255,0.12)" : "transparent",
    borderLeft: active ? "3px solid #1a9e8a" : "3px solid transparent",
    transition: "all 0.15s",
  }),
  sideIcon: { fontSize: 15, width: 20, textAlign: "center" },
  content: { flex: 1, overflow: "auto", background: "#fff" },
};

// ── Header component ──────────────────────────────────────────
function Header({ title, role }) {
  return (
    <div style={st.header}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#1a9e8a", fontSize: 20 }}>◈</span>
        <span style={st.headerTitle}>{title}</span>
      </div>
      <div style={st.headerRight}>
        {IS_DEV && (
          <span style={st.userBadge}>DEV: {role}</span>
        )}
        <button style={st.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

// ── Sidebar component ─────────────────────────────────────────
function Sidebar({ items, active, onChange }) {
  return (
    <div style={st.sidebar}>
      <div style={st.sidebarLabel}>Menu</div>
      {items.map((item) => (
        <div
          key={item.key}
          style={st.sideItem(active === item.key)}
          onClick={() => onChange(item.key)}
        >
          <span style={st.sideIcon}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────
function LoadingApp() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f5" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #dee2e6", borderTop: "4px solid #1a7a8a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#666", fontSize: 14 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Dev Login screen (localhost only) ─────────────────────────
function DevLoginApp({ onLogin }) {
  const [selected, setSelected] = useState(ROLES.CONTROLLER);
  const [regLinkActive, setRegLinkActive] = useState(false); // ← NEW

  // ← NEW — check if today is within school registration date window
  useEffect(() => {
    loadRestrictEntry()
      .then(({ record }) => {
        if (!record) return;
        const fromDate = record.billstudent; // From School Date
        const toDate   = record.billarrear;  // To School Date
        if (!fromDate || !toDate) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);

        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        if (today >= from && today <= to) {
          setRegLinkActive(true);
        }
      })
      .catch(() => {
        // silently fail — link stays hidden
      });
  }, []);

  const roles = [
    { value: ROLES.CONTROLLER, label: "Controller",  icon: "⚙️", desc: "Restrict Entry, Meetings, Transactions" },
    { value: ROLES.PO,         label: "PO",          icon: "👤", desc: "Approve Schools, Grading, Students" },
    { value: ROLES.ATC,        label: "ATC",         icon: "🏛️", desc: "ATC Grading, Bill Generation" },
    { value: ROLES.SCHOOL,     label: "School",      icon: "🏫", desc: "School Profile, Student Registration" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f5", fontFamily: "var(--font-main)" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: "36px 40px", width: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>

        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>◈</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a2a5e" }}>Namankit</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            DEV MODE — Select a role to continue
          </div>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 24 }}>
          {roles.map((r) => (
            <div
              key={r.value}
              onClick={() => setSelected(r.value)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 6, marginBottom: 8,
                cursor: "pointer",
                border: selected === r.value ? "2px solid #1a7a8a" : "2px solid #eee",
                background: selected === r.value ? "#f0faf9" : "#fafafa",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2a5e" }}>{r.label}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{r.desc}</div>
              </div>
              {selected === r.value && (
                <div style={{ marginLeft: "auto", color: "#1a7a8a", fontWeight: 700 }}>✓</div>
              )}
            </div>
          ))}
        </div>

        {/* Login button */}
        <button
          onClick={() => { setDevRole(selected); onLogin(selected); }}
          style={{ width: "100%", background: "#1a7a8a", color: "#fff", border: "none", borderRadius: 6, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Login as {roles.find(r => r.value === selected)?.label}
        </button>

        {/* ← CHANGED: show link only when date is within range */}
        {regLinkActive && (
          <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 16, textAlign: "center" }}>
            <a
             href="?page=school-registration"
              style={{ color: "#1a7a8a", fontSize: 13, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
            >
              New School Registration for Empanelment
            </a>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 16 }}>
          This screen only appears on localhost
        </div>
      </div>
    </div>
  );
}

// ── Unauthorized screen ───────────────────────────────────────
function UnauthorizedApp() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f5" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 10 }}>Unauthorized Access</h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 6 }}>You do not have the required permissions.</p>
        <p style={{ color: "#999", fontSize: 13 }}>Please contact your administrator.</p>
      </div>
    </div>
  );
}

// ── Controller App ────────────────────────────────────────────
const CONTROLLER_NAV = [
  { key: "restrictEntry",     label: "Restrict Entry Master", icon: "📅" },
  { key: "transactionMaster", label: "Transaction Master",    icon: "💰" },
  { key: "billReport",        label: "Bill Report",           icon: "📋" },
  { key: "meeting",           label: "State Level Meeting",   icon: "🤝" },
];

function ControllerApp({ role }) {
  const [screen, setScreen] = useState("restrictEntry");

  const renderScreen = () => {
    switch (screen) {
      case "restrictEntry":     return <RestrictEntryMaster />;
      case "transactionMaster": return <TransactionMaster />;
      case "billReport":        return <BillReport />;
      case "meeting":           return <ScheduleMeeting />;
      default: return null;
    }
  };

  return (
    <div style={st.pageWrap}>
      <Header title="Namankit — Controller Panel" role={role} />
      <div style={st.body}>
        <Sidebar items={CONTROLLER_NAV} active={screen} onChange={setScreen} />
        <div style={st.content}>{renderScreen()}</div>
      </div>
      <Footer />
    </div>
  );
}

// ── PO App ────────────────────────────────────────────────────
const PO_NAV = [
  { key: "approveSchool",  label: "Approve School Profile", icon: "🏫" },
  { key: "poGrading",      label: "PO Grading",             icon: "⭐" },
  { key: "approveStudent", label: "Approve Students",        icon: "👨‍🎓" },
];

function POApp({ role }) {
  const [screen,         setScreen]         = useState("approveSchool");
  const [selectedSchool, setSelectedSchool] = useState(null);

  const renderScreen = () => {
    switch (screen) {
      case "approveSchool":
        return (
          <POApprovalList
            onGrading={(school) => { setSelectedSchool(school); setScreen("poGrading"); }}
            onViewDetails={(id) => window.open(`/?schoolId=${id}`, "_blank")}
          />
        );
      case "poGrading":
        return <POGrading school={selectedSchool} onBack={() => setScreen("approveSchool")} />;
      case "approveStudent":
        return <StudentApproval />;
      default: return null;
    }
  };

  return (
    <div style={st.pageWrap}>
      <Header title="Namankit — PO Panel" role={role} />
      <div style={st.body}>
        <Sidebar items={PO_NAV} active={screen} onChange={setScreen} />
        <div style={st.content}>{renderScreen()}</div>
      </div>
      <Footer />
    </div>
  );
}

// ── ATC App ───────────────────────────────────────────────────
const ATC_NAV = [
  { key: "atcGrading",      label: "ATC Grading",             icon: "⭐", group: "Grading" },
  { key: "downloadGrading", label: "Download Grading",        icon: "📊", group: "Grading" },
  { key: "gradingComments", label: "Update Grading Comments", icon: "✏️", group: "Grading" },
  { key: "billGeneration",  label: "Bill Generation",         icon: "🧾", group: "Transactions" },
  { key: "uploadBill",      label: "Download/Upload/Cancel",  icon: "📤", group: "Transactions" },
];

function ATCApp({ role }) {
  const [screen,         setScreen]         = useState("atcGrading");
  const [selectedSchool, setSelectedSchool] = useState(null);

  const renderScreen = () => {
    switch (screen) {
      case "atcGrading":
        return (
          <ATCApprovalList
            onGrading={(school) => { setSelectedSchool(school); }}
            onViewDetails={(id) => window.open(`/?schoolId=${id}`, "_blank")}
            selectedSchool={selectedSchool}
          />
        );
      case "billGeneration":  return <BillGeneration />;
      case "uploadBill":      return <DownloadUploadCancelBill />;
      case "downloadGrading": return <DownloadGrading />;
      case "gradingComments": return <UpdateGradingComments />;
      default: return null;
    }
  };

  return (
    <div style={st.pageWrap}>
      <Header title="Namankit — ATC Panel" role={role} />
      <div style={st.body}>
        <Sidebar items={ATC_NAV} active={screen} onChange={setScreen} />
        <div style={st.content}>{renderScreen()}</div>
      </div>
      <Footer />
    </div>
  );
}

// ── School App ────────────────────────────────────────────────
const SCHOOL_NAV = [
  { key: "schoolList", label: "School Profile",       icon: "🏫" },
  { key: "studentReg", label: "Student Registration", icon: "👨‍🎓" },
];

function SchoolApp({ role }) {
  const path = window.location.pathname;
  if (path === "/preview") return <PreviewPage />;

  const [screen,          setScreen]          = useState("schoolList");
  const [view,            setView]            = useState("list");
  const [activeTab,       setActiveTab]       = useState("School Basic Details");
  const [schoolProfileId, setSchoolProfileId] = useState(null);
  const [isEditMode,      setIsEditMode]      = useState(false);
  const [masterData,      setMasterData]      = useState({
    schoolBasic: {}, landDetails: {}, hostelDetails: {}, diningDetails: {},
    labDetails: {}, libraryDetails: {}, teacherDetails: {}, extraCurriculum: {},
    sportsDetails: {}, medicalDetails: {}, feeMaster: {}, bankDetails: {},
  });

  const handleSaveSection = (key, data) =>
    setMasterData((prev) => ({ ...prev, [key]: data }));

  const handleEdit = (schoolId) => {
    setSchoolProfileId(schoolId); setIsEditMode(true);
    setActiveTab("School Basic Details"); setView("details");
  };

  const handleNewSchool = () => {
    setSchoolProfileId(null); setIsEditMode(false);
    setMasterData({
      schoolBasic: {}, landDetails: {}, hostelDetails: {}, diningDetails: {},
      labDetails: {}, libraryDetails: {}, teacherDetails: {}, extraCurriculum: {},
      sportsDetails: {}, medicalDetails: {}, feeMaster: {}, bankDetails: {},
    });
    setActiveTab("School Basic Details"); setView("details");
  };

  const renderTab = () => {
    const p = { onTabChange: setActiveTab, schoolProfileId, isEditMode };
    switch (activeTab) {
      case "School Basic Details":
        return <SchoolBasicDetails {...p} onSave={(d) => { handleSaveSection("schoolBasic", d); if (d?.schoolId) setSchoolProfileId(d.schoolId); }} />;
      case "Land Details":                return <LandDetails              {...p} onSave={(d) => handleSaveSection("landDetails",    d)} />;
      case "Hostel Details":              return <HostelDetails            {...p} onSave={(d) => handleSaveSection("hostelDetails",  d)} />;
      case "Dining Facilities Details":   return <DiningFacilitiesDetails  {...p} onSave={(d) => handleSaveSection("diningDetails",  d)} />;
      case "Lab Details":                 return <LabDetails               {...p} onSave={(d) => handleSaveSection("labDetails",     d)} />;
      case "Library Details":             return <LibraryDetails           {...p} onSave={(d) => handleSaveSection("libraryDetails", d)} />;
      case "Teachers Details":            return <TeachersDetails          {...p} onSave={(d) => handleSaveSection("teacherDetails", d)} />;
      case "Extra Curriculum Activities": return <ExtraCurriculumActivities {...p} onSave={(d) => handleSaveSection("extraCurriculum", d)} />;
      case "Sports Facilities":           return <SportsFacilities         {...p} onSave={(d) => handleSaveSection("sportsDetails",  d)} />;
      case "Medical Facilities":          return <MedicalFacilities        {...p} onSave={(d) => handleSaveSection("medicalDetails", d)} />;
      case "Profile FeeMaster":           return <ProfileFeeMaster         {...p} onSave={(d) => handleSaveSection("feeMaster",      d)} />;
      case "School Bank Details":         return <SchoolBankDetails        {...p} onSave={(d) => handleSaveSection("bankDetails",    d)} />;
      case "Final Submit":                return <FinalSubmit data={masterData} onTabChange={setActiveTab} schoolProfileId={schoolProfileId} />;
      default: return null;
    }
  };

  // Helper: deep-check if an object has any meaningful (non-empty) value
  const hasFilled = (obj) => {
    if (obj == null) return false;
    if (typeof obj === "string") return obj.trim() !== "";
    if (typeof obj === "number" || typeof obj === "boolean") return true;
    if (Array.isArray(obj)) return obj.length > 0 && obj.some(hasFilled);
    if (typeof obj === "object") {
      return Object.keys(obj).length > 0 && Object.values(obj).some(hasFilled);
    }
    return false;
  };

  const SECTION_ORDER = [
    ["schoolBasic",    "School Basic Details"],
    ["landDetails",    "Land Details"],
    ["hostelDetails",  "Hostel Details"],
    ["diningDetails",  "Dining Facilities Details"],
    ["labDetails",     "Lab Details"],
    ["libraryDetails", "Library Details"],
    ["teacherDetails", "Teachers Details"],
    ["extraCurriculum","Extra Curriculum Activities"],
    ["sportsDetails",  "Sports Facilities"],
    ["medicalDetails", "Medical Facilities"],
    ["feeMaster",      "Profile FeeMaster"],
    ["bankDetails",    "School Bank Details"],
  ];

  const validateMasterData = (data) => {
    const missing = [];
    for (const [key, label] of SECTION_ORDER) {
      if (!hasFilled(data[key])) missing.push(label);
    }
    return missing;
  };

  const handleTabChange = (tab) => {
    if (tab === "Final Submit") {
      const missing = validateMasterData(masterData);
      if (missing.length > 0) {
        alert(`Please fill all mandatory fields in ${missing[0]}`);
        setActiveTab(missing[0]);
        return;
      } else {
        setActiveTab("Final Submit");
      }
    }
    setActiveTab(tab);
  };

  const renderScreen = () => {
    switch (screen) {
      case "schoolList":
        if (view === "list") {
          return (
            <div style={{ padding: "12px 0" }}>
              <div style={{ padding: "0 20px 12px", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleNewSchool} style={{ background: "#1a7a8a", color: "#fff", border: "none", borderRadius: 4, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  + New School
                </button>
              </div>
              <SchoolListPage onEdit={handleEdit} />
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ background: "#f0f4f5", padding: "8px 20px", borderBottom: "1px solid #dee2e6", display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setView("list")} style={{ background: "none", border: "1px solid #1a7a8a", color: "#1a7a8a", borderRadius: 4, padding: "5px 14px", fontSize: 13, cursor: "pointer" }}>
                ← Back to List
              </button>
              {isEditMode && schoolProfileId && (
                <span style={{ fontSize: 13, color: "#888" }}>
                  Editing School ID: <strong style={{ color: "#1a7a8a" }}>{schoolProfileId}</strong>
                </span>
              )}
            </div>
            <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
            <div style={{ background: "#f0f4f5", flex: 1 }}>{renderTab()}</div>
          </div>
        );
      case "studentReg":
        return <StudentRegistration />;
      default: return null;
    }
  };

  return (
    <div style={st.pageWrap}>
      <Header title="Namankit — School Panel" role={role} />
      <div style={st.body}>
        <Sidebar items={SCHOOL_NAV} active={screen} onChange={(s) => { setScreen(s); setView("list"); }} />
        <div style={st.content}>{renderScreen()}</div>
      </div>
      <Footer />
    </div>
  );
}

// ── Coming Soon placeholder ───────────────────────────────────
function ComingSoon({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12, color: "#888" }}>
      <div style={{ fontSize: 40 }}>🚧</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#555" }}>{title}</div>
      <div style={{ fontSize: 13 }}>Coming soon</div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  // ✅ PUBLIC — no role check needed, must be FIRST
   if (page === "school-registration" || page === "school-master") {
    return <SchoolMasterForm />;
  }

  const [role,    setRole]    = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getUserRole()
      .then((r)   => setRole(r))
      .catch(()   => setRole(null))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return <LoadingApp />;

  // DEV: no role selected yet → show dev login picker
  if (IS_DEV && !role) {
    return <DevLoginApp onLogin={(r) => setRole(r)} />;
  }

  switch (role) {
    case ROLES.CONTROLLER: return <ControllerApp role={role} />;
    case ROLES.PO:         return <POApp         role={role} />;
    case ROLES.ATC:        return <ATCApp        role={role} />;
    case ROLES.SCHOOL:     return <SchoolApp     role={role} />;
   default:               return <SchoolMasterForm />
  }
}