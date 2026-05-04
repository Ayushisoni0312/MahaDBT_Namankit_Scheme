// ============================================================
//  src/components/Header.jsx
//  Pixel-perfect match to the original Tribal Dev Dept header
// ============================================================

// Left tribal logo — official URL
const TRIBAL_LOGO = "https://testsnamankit.mahaitgov.in/Images/tribal-logo.png";

// Right government emblem — same server
const GOVT_EMBLEM = "https://testsnamankit.mahaitgov.in/Images/maharashtralogo.png";
// ↑ replace with actual emblem URL if different, e.g. /Images/emblem.png

export default function Header() {
  return (
    <div
      style={{
        // Original: darker teal on left fading to lighter teal on right
        background: "linear-gradient(90deg, #3FA2D2 0%, #36B0B5 50%, #2DA986 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        minHeight: 60,
      }}
    >
      {/* ── Left: circular logo + title text ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            background: "#fff",
            border: "2px solid rgba(255,255,255,0.6)",
          }}
        >
          <img
            src={TRIBAL_LOGO}
            alt="Tribal Development Dept Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              // fallback if image fails to load
              e.target.style.display = "none";
              e.target.parentNode.style.background = "rgba(255,255,255,0.3)";
            }}
          />
        </div>

        <div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 700,
              lineHeight: 1.25,
              fontFamily: "var(--font-main)",
              letterSpacing: 0.2,
            }}
          >
            Tribal Development Department
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 12,
              fontFamily: "var(--font-main)",
              marginTop: 2,
            }}
          >
            Initiative DFT to Namankit School
          </div>
        </div>
      </div>

      {/* ── Right: gold government emblem ── */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          background: "rgba(255,255,255,0.15)",
          border: "2px solid rgba(255,255,255,0.4)",
        }}
      >
        <img
          src={GOVT_EMBLEM}
          alt="Government Emblem"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
    </div>
  );
}
