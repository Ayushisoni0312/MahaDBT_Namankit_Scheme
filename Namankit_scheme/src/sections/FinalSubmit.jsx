// ============================================================
//  src/sections/FinalSubmit.jsx
//  Review button: fetches all data filtered by schoolProfileId
//  stores in sessionStorage, opens /preview in new tab.
// ============================================================
import React, { useState } from "react";
import {
  getSchoolProfileById, getSchoolLandDetails, getHostelDetails,
  getDiningFacilities, getLabDetails, getLibraryDetails,
  getTeacherDetails, getExtraCurriculum, getSportsFacilities,
  getMedicalFacilities, getProfileFeeMaster, getSchoolBankDetails,
} from "../api/liferay";

export default function FinalSubmit({ data, onTabChange, schoolProfileId }) {
  const [loading, setLoading] = useState(false);

  const handleFinalSubmit = () => {
    if (window.confirm("Are you sure? You cannot edit after submission.")) {
      alert("Form submitted successfully!");
    }
  };

  const hasFilled = (obj) => {
    if (obj == null) return false;
    if (typeof obj === 'string') return obj.trim() !== '';
    if (typeof obj === 'number' || typeof obj === 'boolean') return true;
    if (Array.isArray(obj)) return obj.length > 0 && obj.some(hasFilled);
    if (typeof obj === 'object') return Object.keys(obj).length > 0 && Object.values(obj).some(hasFilled);
    return false;
  };

  const SECTION_ORDER = [
    ['schoolBasic', 'School Basic Details'],
    ['landDetails', 'Land Details'],
    ['hostelDetails', 'Hostel Details'],
    ['diningDetails', 'Dining Facilities Details'],
    ['labDetails', 'Lab Details'],
    ['libraryDetails', 'Library Details'],
    ['teacherDetails', 'Teachers Details'],
    ['extraCurriculum', 'Extra Curriculum Activities'],
    ['sportsDetails', 'Sports Facilities'],
    ['medicalDetails', 'Medical Facilities'],
    ['feeMaster', 'Profile FeeMaster'],
    ['bankDetails', 'School Bank Details'],
  ];

  const validateData = (d) => {
    const missing = [];
    for (const [k, label] of SECTION_ORDER) {
      if (!hasFilled(d?.[k])) missing.push(label);
    }
    return missing;
  };

  const handleReview = async () => {
    // Validate collected data first — ensure mandatory sections have values
    const missing = validateData(data);
    if (missing.length > 0) {
      alert(`Please fill all mandatory fields in ${missing[0]}`);
      return;
    }
    if (!schoolProfileId) {
      alert("Please save School Basic Details first before reviewing.");
      return;
    }
    setLoading(true);
    try {
      // All APIs called with schoolProfileId — fetches THIS school's data only
      const [
        schoolBasic, landDetails, hostelDetails, diningDetails,
        labDetails, libraryDetails, teacherDetails, extraCurriculum,
        sportsDetails, medicalDetails, feeMaster, bankDetails,
      ] = await Promise.all([
        getSchoolProfileById(schoolProfileId),
        getSchoolLandDetails(schoolProfileId),
        getHostelDetails(schoolProfileId),
        getDiningFacilities(schoolProfileId),
        getLabDetails(schoolProfileId),
        getLibraryDetails(schoolProfileId),
        getTeacherDetails(schoolProfileId),
        getExtraCurriculum(schoolProfileId),
        getSportsFacilities(schoolProfileId),
        getMedicalFacilities(schoolProfileId),
        getProfileFeeMaster(schoolProfileId),
        getSchoolBankDetails(schoolProfileId),
      ]);

      const reviewData = {
        schoolBasic, landDetails, hostelDetails, diningDetails,
        labDetails, libraryDetails, teacherDetails, extraCurriculum,
        sportsDetails, medicalDetails, feeMaster, bankDetails,
      };

      sessionStorage.setItem("schoolReviewData", JSON.stringify(reviewData));
      window.open("/preview", "_blank");
    } catch (e) {
      alert("Failed to load review data — " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="final-submit-container" style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", background: "#fff", padding: "20px", marginBottom: "20px", border: "1px solid #ddd" }}>
        <h2 style={{ color: "#2c3e50", margin: "0 0 10px 0" }}>Submit School Profile</h2>
        <p style={{ color: "black", fontSize: "14px" }}>
          Instructions : - Do you wish to submit the data for academic year 2026-2027 ...Please note that you will not be edit /delete the data once you submit it.
        </p>
        <button
          onClick={handleReview}
          disabled={loading}
          style={{ padding: "10px 25px", background: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: loading ? "default" : "pointer", marginTop: "10px", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Loading..." : "Review"}
        </button>
      </div>
    </div>
  );
}