// ============================================================
//  src/utils/tableStyles.js
//  Shared table cell styles — consistent across all sections
// ============================================================

export const TH = {
  padding: "10px 12px",
  background: "#ffffff",
  borderBottom: "2px solid #dee2e6",
  fontSize: 13,
  fontWeight: 400,   // original = normal weight
  color: "#333",
  textAlign: "left",
  verticalAlign: "bottom",
};

export const TD = {
  padding: "9px 12px",
  borderBottom: "1px solid #dee2e6",
  fontSize: 13,
  color: "#333",
  verticalAlign: "middle",
};

export const DELETE_BTN = {
  background: "none", border: "none",
  color: "#333333", cursor: "pointer",
  fontSize: 13, padding: 0,
  fontFamily: "var(--font-main)", fontWeight: 400,
};

export const ADD_BTN = {
  background: "#28a745", color: "#fff",
  border: "none", borderRadius: 4,
  padding: "6px 20px", fontSize: 14,
  fontWeight: 400, cursor: "pointer",
  fontFamily: "var(--font-main)",
  height: 32, flexShrink: 0,
};