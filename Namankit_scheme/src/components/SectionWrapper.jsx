// ============================================================
//  src/components/SectionWrapper.jsx
//  White card + Save/Reset buttons — shared by every tab
// ============================================================
import { Alert, BtnSave, BtnReset } from "./FormFields";

export default function SectionWrapper({ alert, onCloseAlert, onSave, onReset, saving, children }) {
  return (
    <div style={{ padding: "16px 20px 32px" }}>
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={onCloseAlert} />
      )}
      <div style={{
        background: "#ffffff",
        border: "1px solid #d6e0e0",
        borderRadius: 3,
        padding: "18px 20px 22px",
      }}>
        {children}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <BtnReset onClick={onReset} />
        <BtnSave onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </BtnSave>
      </div>
    </div>
  );
}