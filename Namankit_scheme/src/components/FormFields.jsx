// ============================================================
//  src/components/FormFields.jsx
//  Reusable components — pixel-matched to original UI
// ============================================================
import { useState } from "react";

// ── Base input style — matches original form inputs exactly ──
const baseInput = {
  width: "100%",
  height: 32,
  border: "1px solid #cccccc",
  borderRadius: 3,
  padding: "0 8px",
  fontSize: 13,
  color: "#333333",
  background: "#ffffff",
  fontFamily: "var(--font-main)",
  outline: "none",
};

// ── Field wrapper ────────────────────────────────────────────
export function Field({ label, required, error, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      {label && (
        <label style={{ fontSize: 13, color: "#333333", fontWeight: 400 }}>
          {label}
          {required && <span style={{ color: "#cc0000", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <span style={{ color: "#cc0000", fontSize: 11, marginTop: 2 }}>{error}</span>
      )}
    </div>
  );
}

// ── TextInput ────────────────────────────────────────────────
export function TextInput({ value, onChange, placeholder = "", type = "text", disabled = false, readOnly = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...baseInput,
        background: (disabled || readOnly) ? "#f5f5f5" : "#ffffff",
        cursor: disabled ? "not-allowed" : "text",
        borderColor: focused && !disabled ? "#2a9090" : "#cccccc",
        boxShadow: focused && !disabled ? "0 0 0 2px rgba(42,144,144,0.15)" : "none",
      }}
    />
  );
}

// ── SelectInput ──────────────────────────────────────────────
export function SelectInput({ value, onChange, options = [], placeholder = "--Select--", disabled = false }) {
  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.value)}
      style={{
        ...baseInput,
        padding: "0 6px",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#f5f5f5" : "#ffffff",
        appearance: "auto",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        const val   = typeof opt === "object" ? opt.value || opt.name : opt;
        const label = typeof opt === "object" ? opt.label || opt.name : opt;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

// ── Section heading ──────────────────────────────────────────
// Matches "School Profile" bold heading with grey underline
export function SectionHeading({ title }) {
  return (
    <div style={{
      fontSize: 15,
      fontWeight: 600,
      color: "#222222",
      paddingBottom: 8,
      marginBottom: 14,
      borderBottom: "1px solid #cccccc",
    }}>
      {title}
    </div>
  );
}

// ── 3-column grid row ────────────────────────────────────────
export function Row3({ children, style }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px 18px",
      marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── 2-column grid row ────────────────────────────────────────
export function Row2({ children, style }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "12px 18px",
      marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Alert banner ─────────────────────────────────────────────
export function Alert({ type, message, onClose }) {
  if (!message) return null;
  const ok = type === "success";
  return (
    <div style={{
      padding: "9px 14px",
      borderRadius: 3,
      marginBottom: 14,
      fontSize: 13,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: ok ? "#dff0d8" : "#f2dede",
      color:      ok ? "#3c763d" : "#a94442",
      border:     `1px solid ${ok ? "#d6e9c6" : "#ebccd1"}`,
    }}>
      <span>{message}</span>
      {onClose && (
        <span onClick={onClose} style={{ cursor: "pointer", fontWeight: 700, marginLeft: 12, fontSize: 16 }}>×</span>
      )}
    </div>
  );
}

// ── Buttons — exact Bootstrap 3 colours from original ────────
const btn = (bg) => ({
  border: "none",
  borderRadius: 3,
  padding: "6px 18px",
  fontSize: 13,
  fontWeight: 400,
  cursor: "pointer",
  fontFamily: "var(--font-main)",
  color: "#ffffff",
  background: bg,
  lineHeight: "1.5",
});

export function BtnSave({ onClick, disabled, children = "Save" }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...btn(disabled ? "#aaa" : "#5cb85c") }}>
      {children}
    </button>
  );
}
export function BtnReset({ onClick, children = "Reset" }) {
  return <button onClick={onClick} style={btn("#f0ad4e")}>{children}</button>;
}
export function BtnBack({ onClick, children = "Back" }) {
  return <button onClick={onClick} style={btn("#5bc0de")}>{children}</button>;
}
export function BtnAdd({ onClick, children = "Add" }) {
  return <button onClick={onClick} style={{ ...btn("#5bc0de"), padding: "5px 16px" }}>{children}</button>;
}
