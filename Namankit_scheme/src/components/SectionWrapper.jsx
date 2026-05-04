// ============================================================
//  src/components/SectionWrapper.jsx
//  White card + Save/Reset buttons — shared by every tab
// ============================================================
import { Alert, BtnSave, BtnReset } from "./FormFields";
import Loader from "./Loader";

export default function SectionWrapper({ alert, onCloseAlert, onSave, onReset, saving, loading = false, children }) {
  return (
    <div style={{ padding: "16px 20px 32px", position: "relative" }}>
      {loading && (
        <div style={{ width: "100%", height: "100%", top: 0, left: 0, position: "absolute", zIndex: 1000, background: "rgba(255, 255, 255, 0.72)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader />
        </div>
      )}
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
