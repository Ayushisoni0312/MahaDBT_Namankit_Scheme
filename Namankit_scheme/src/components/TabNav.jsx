// ============================================================
//  src/components/TabNav.jsx — active tab = teal #1a7a8a
// ============================================================
export const TABS = [
  "School Basic Details",
  "Land Details",
  "Hostel Details",
  "Dining Facilities Details",
  "Lab Details",
  "Library Details",
  "Teachers Details",
  "Extra Curriculum Activities",
  "Sports Facilities",
  "Medical Facilities",
  "Profile FeeMaster",
  "School Bank Details",
  "Final Submit",
];

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <div style={{
      background: "#ffffff",
      borderBottom: "1px solid #c5d5dc",
      display: "flex",
      flexWrap: "wrap",
      padding: "5px 10px 0",
      gap: "3px 2px",
    }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: "5px 11px",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#ffffff" : "#000000",
              background: isActive ? "#002B70" : "transparent",
              border:     isActive ? "1px solid #002B70" : "1px solid transparent",
              borderRadius: "3px 3px 0 0",
              marginBottom: -1,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-main)",
              lineHeight: "1.5",
              transition: "background 0.1s, color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "#e5f2f2";
                e.currentTarget.style.color = "#1a7a8a";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#333333";
              }
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
