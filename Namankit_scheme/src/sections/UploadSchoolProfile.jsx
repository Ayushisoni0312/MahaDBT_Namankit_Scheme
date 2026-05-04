// ============================================================
// src/sections/UploadSchoolProfile.jsx
// ============================================================
import { useState } from "react";
import { Field, Row3 } from "../components/FormFields";

export default function UploadSchoolProfile({ form, setForm, errors }) {
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeKB = file.size / 1024;
    if (sizeKB < 5 || sizeKB > 100) {
      alert("Photo size must be between 5KB and 100KB.");
      e.target.value = ""; // Clear the input
      return;
    }

    // 1. Update the parent form state
    setForm((prev) => ({ ...prev, schoolPhoto: file }));
    
    // 2. Generate preview URL
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    /* REMOVE Row3 from the outer wrapper to fix the layout "going up" */
    <div style={{ marginTop: 28, borderTop: "1px solid #eee", paddingTop: 20 }}>
      
      <div style={{
        fontSize: 16,
        fontWeight: 400,
        color: "#333",
        marginBottom: 14,
      }}>
        Upload Photo
      </div>

      <p style={{ color: "#cc0000", fontSize: 13, fontWeight: 400, marginBottom: 14, lineHeight: 1.5 }}>
        Note:- The size of the photograph should fall between 5KB to 100KB.
      </p>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        <div style={{ flex: "0 0 400px" }}>
          {/* Added optional chaining errors?.schoolPhoto to prevent the crash */}
          <Field label="Upload School Photo" required error={errors?.schoolPhoto || errors?.photo}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ fontSize: 13, fontFamily: "var(--font-main)", padding: "4px 0" }}
            />
          </Field>
        </div>

        {photoPreview && (
          <div style={{
            width: 120,
            height: 90,
            border: "1px solid #cccccc",
            borderRadius: 3,
            overflow: "hidden",
            flexShrink: 0,
            marginTop: 10
          }}>
            <img 
              src={photoPreview} 
              alt="Preview" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}