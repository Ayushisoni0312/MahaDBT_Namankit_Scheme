// ============================================================
//  src/components/Footer.jsx
//  Exact match to original footer — appears on every page
//  Left:  Copyright © Tribal Department, Maharashtra...
//  Right: Maintained by MahaOnline limited + logo
// ============================================================

const MAHAONLINE_LOGO = "https://testsnamankit.mahaitgov.in/Images/MahaOnline_LogoM1.png";

export default function Footer() {
  return (
    <div style={{
      background: "#e8e8e8",
      borderTop: "1px solid #cccccc",
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      marginTop: "auto",
    }}>
      {/* Left: copyright text */}
      <span style={{
        fontSize: 13,
        color: "#444444",
        fontFamily: "var(--font-main)",
      }}>
        Copyright &copy; Tribal Department, Maharashtra. All Rights Reserved.
      </span>

      {/* Right: Maintained by + logo */}
      <div style={{
        display: "flex",
        gap: 6,
        flexDirection: "column",
        alignItems: "flex-end",
      }}>
        <span style={{ fontSize: 11, color: "#666666", fontFamily: "var(--font-main)" }}>
          Maintained by
        </span>
        <img
          src={MAHAONLINE_LOGO}
          alt="MahaOnline Limited"
          style={{ height: 28, objectFit: "contain" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "inline";
          }}
        />
        <span style={{ display: "none", fontSize: 12, color: "#444", fontFamily: "var(--font-main)" }}>
          MahaOnline Limited
        </span>
        <span style={{ fontSize: 10, color: "#888888", fontFamily: "var(--font-main)" }}>
          (A Joint Venture Between Govt. of Maharashtra &amp; TCS)
        </span>
      </div>
    </div>
  );
}
